import * as functions from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets
const resendApiKey = defineSecret("RESEND_API_KEY");
const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

// Initialize Resend with API key
const getResend = () => {
  const apiKey = resendApiKey.value();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY secret is not set");
  }
  return new Resend(apiKey);
};

// Email templates
const emailTemplates = {
  serviceRequestConfirmation: (data: {
    customerName: string;
    serviceType: string;
    description: string;
    preferredDate?: string;
    isEmergency?: boolean;
  }) => ({
    subject: data.isEmergency
      ? `[URGENT] Service Request Received - ${data.serviceType}`
      : `Service Request Received - ${data.serviceType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .detail { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          ${data.isEmergency ? ".urgent { background-color: #fee2e2; border: 2px solid #ef4444; padding: 10px; margin-bottom: 20px; text-align: center; color: #dc2626; font-weight: bold; }" : ""}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Service Request Received</h1>
          </div>
          <div class="content">
            ${data.isEmergency ? '<div class="urgent">EMERGENCY SERVICE REQUEST</div>' : ""}
            <p>Hi ${data.customerName},</p>
            <p>Thank you for submitting your service request. We have received your request and will review it shortly.</p>

            <h3>Request Details:</h3>
            <div class="detail">
              <span class="label">Service Type:</span> ${data.serviceType}
            </div>
            <div class="detail">
              <span class="label">Description:</span> ${data.description}
            </div>
            ${data.preferredDate ? `<div class="detail"><span class="label">Preferred Date:</span> ${data.preferredDate}</div>` : ""}

            <p>We will contact you soon to confirm your appointment.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing our services!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  serviceRequestApproved: (data: {
    customerName: string;
    serviceType: string;
  }) => ({
    subject: `Your Service Request Has Been Approved - ${data.serviceType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .status { background-color: #dcfce7; border: 1px solid #16a34a; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Approved!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>

            <div class="status">
              <strong>Your service request for ${data.serviceType} has been approved!</strong>
            </div>

            <p>A member of our team will reach out to you shortly to schedule your appointment.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing our services!</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  serviceRequestRejected: (data: {
    customerName: string;
    serviceType: string;
  }) => ({
    subject: `Update on Your Service Request - ${data.serviceType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6b7280; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Service Request Update</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>We regret to inform you that we are unable to fulfill your service request for ${data.serviceType} at this time.</p>
            <p>This may be due to scheduling conflicts or service availability in your area. Please feel free to submit a new request or contact us directly to discuss alternatives.</p>
            <p>We apologize for any inconvenience this may cause.</p>
          </div>
          <div class="footer">
            <p>Thank you for your understanding.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Type for service request document
interface ServiceRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  serviceType: string;
  isEmergency?: boolean;
  description: string;
  preferredDate?: string;
  status: "Pending" | "Approved" | "Rejected" | "Converted";
  submittedAt: string;
}

/**
 * Trigger: Send confirmation email when a new service request is created
 */
export const onServiceRequestCreated = functions
  .runWith({ secrets: [resendApiKey] })
  .firestore.document("serviceRequests/{requestId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data() as ServiceRequest;

    // Only send email if customer provided an email address
    if (!data.email) {
      console.log("No email provided for service request, skipping email");
      return null;
    }

    try {
      const resend = getResend();
      const template = emailTemplates.serviceRequestConfirmation({
        customerName: data.name,
        serviceType: data.serviceType,
        description: data.description,
        preferredDate: data.preferredDate,
        isEmergency: data.isEmergency,
      });

      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "HVAC Services <onboarding@resend.dev>",
        to: data.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error("Error sending confirmation email:", error);
        return null;
      }

      console.log("Confirmation email sent successfully:", emailData?.id);

      // Optionally store email record in Firestore
      await admin.firestore().collection("emailLogs").add({
        type: "service_request_confirmation",
        requestId: context.params.requestId,
        recipientEmail: data.email,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        resendId: emailData?.id,
      });

      return emailData;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      return null;
    }
  });

/**
 * Trigger: Send status update email when service request status changes
 */
export const onServiceRequestStatusUpdate = functions
  .runWith({ secrets: [resendApiKey] })
  .firestore.document("serviceRequests/{requestId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as ServiceRequest;
    const after = change.after.data() as ServiceRequest;

    // Only proceed if status changed
    if (before.status === after.status) {
      return null;
    }

    // Only send email if customer provided an email address
    if (!after.email) {
      console.log("No email provided for service request, skipping email");
      return null;
    }

    // Only send emails for Approved or Rejected status changes
    if (after.status !== "Approved" && after.status !== "Rejected") {
      return null;
    }

    try {
      const resend = getResend();
      const template =
        after.status === "Approved"
          ? emailTemplates.serviceRequestApproved({
              customerName: after.name,
              serviceType: after.serviceType,
            })
          : emailTemplates.serviceRequestRejected({
              customerName: after.name,
              serviceType: after.serviceType,
            });

      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "HVAC Services <onboarding@resend.dev>",
        to: after.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error("Error sending status update email:", error);
        return null;
      }

      console.log(`Status update email (${after.status}) sent successfully:`, emailData?.id);

      // Store email record
      await admin.firestore().collection("emailLogs").add({
        type: `service_request_${after.status.toLowerCase()}`,
        requestId: context.params.requestId,
        recipientEmail: after.email,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        resendId: emailData?.id,
      });

      return emailData;
    } catch (error) {
      console.error("Failed to send status update email:", error);
      return null;
    }
  });

/**
 * HTTP Callable function: Send a custom email (for admin compose functionality)
 */
export const sendCustomEmail = functions
  .runWith({ secrets: [resendApiKey] })
  .https.onCall(async (
    data: {
      to: string;
      subject: string;
      message: string;
      recipientName?: string;
    },
    context
  ) => {
    // Verify the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send emails"
      );
    }

    const { to, subject, message, recipientName } = data;

    // Validate required fields
    if (!to || !subject || !message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: to, subject, message"
      );
    }

    try {
      const resend = getResend();

      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "HVAC Services <onboarding@resend.dev>",
        to,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Message from HVAC Services</h1>
              </div>
              <div class="content">
                ${recipientName ? `<p>Hi ${recipientName},</p>` : ""}
                <div style="white-space: pre-wrap;">${message}</div>
              </div>
              <div class="footer">
                <p>HVAC Services Team</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error("Error sending custom email:", error);
        throw new functions.https.HttpsError("internal", "Failed to send email");
      }

      // Log the email
      await admin.firestore().collection("emailLogs").add({
        type: "custom",
        recipientEmail: to,
        subject,
        sentBy: context.auth?.uid,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        resendId: emailData?.id,
      });

      return { success: true, emailId: emailData?.id };
    } catch (error) {
      console.error("Failed to send custom email:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to send email");
    }
  }
);

// Type for bug report document
interface BugReport {
  title: string;
  description: string;
  reportedBy: string;
  userId?: string;
  userRole: string;
  status: string;
  createdAt: string;
}

/**
 * Trigger: Send email notification when a bug report is submitted
 */
export const onBugReportCreated = functions
  .runWith({ secrets: [resendApiKey] })
  .firestore.document("bugReports/{reportId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data() as BugReport;

    try {
      const resend = getResend();

      // Send notification to admin
      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "HVAC App <onboarding@resend.dev>",
        to: "nicklarson2002@gmail.com", // Your email for bug reports
        subject: `[Bug Report] ${data.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
              .detail { margin: 15px 0; padding: 12px; background-color: #fff; border-radius: 8px; border: 1px solid #e0e0e0; }
              .label { font-weight: bold; color: #555; display: block; margin-bottom: 4px; }
              .value { color: #333; }
              .description { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Bug Report</h1>
              </div>
              <div class="content">
                <div class="detail">
                  <span class="label">Title:</span>
                  <span class="value">${data.title}</span>
                </div>

                <div class="detail">
                  <span class="label">Description:</span>
                  <span class="value description">${data.description}</span>
                </div>

                <div class="detail">
                  <span class="label">Reported By:</span>
                  <span class="value">${data.reportedBy}</span>
                </div>

                <div class="detail">
                  <span class="label">User Role:</span>
                  <span class="value">${data.userRole}</span>
                </div>

                <div class="detail">
                  <span class="label">Submitted At:</span>
                  <span class="value">${new Date(data.createdAt).toLocaleString()}</span>
                </div>

                <div class="detail">
                  <span class="label">Report ID:</span>
                  <span class="value">${context.params.reportId}</span>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated notification from your HVAC App.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error("Error sending bug report notification:", error);
        return null;
      }

      console.log("Bug report notification sent successfully:", emailData?.id);
      return emailData;
    } catch (error) {
      console.error("Failed to send bug report notification:", error);
      return null;
    }
  });

// Types for AI scheduling
interface SchedulableJob {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  email?: string;
  jobType: string;
  description: string;
  estimatedDuration: number;
  priority: "low" | "normal" | "high" | "emergency";
  requiredSkills: string[];
  status: "unscheduled" | "scheduled" | "in_progress" | "completed";
  preferredDate?: string;
  preferredTimeSlot?: "morning" | "afternoon" | "evening" | "any";
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

interface SchedulableEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  availability: {
    [day: string]: {
      available: boolean;
      startTime: number;
      endTime: number;
    };
  };
  maxJobsPerDay: number;
  status: "active" | "inactive" | "on_leave";
}

interface ScheduleAssignment {
  employeeId: string;
  employeeName: string;
  jobId: string;
  customerName: string;
  address: string;
  jobType: string;
  startTime: string;
  endTime: string;
  estimatedDriveTime: number;
  reasoning: string;
}

interface AIScheduleResponse {
  success: boolean;
  schedule: ScheduleAssignment[];
  summary: {
    totalJobs: number;
    totalEmployees: number;
    totalDriveTime: number;
    averageJobsPerEmployee: number;
  };
  error?: string;
}

/**
 * AI-powered schedule generation using Anthropic Claude
 */
export const generateAISchedule = functions
  .runWith({ secrets: [anthropicApiKey], timeoutSeconds: 120 })
  .https.onCall(async (
    data: { date: string },
    context
  ): Promise<AIScheduleResponse> => {
    // Verify the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to generate schedules"
      );
    }

    const { date } = data;
    if (!date) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Date is required in YYYY-MM-DD format"
      );
    }

    try {
      // Fetch unscheduled jobs from Firestore
      const jobsSnapshot = await admin.firestore()
        .collection("jobs")
        .where("status", "==", "unscheduled")
        .get();

      const jobs: SchedulableJob[] = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as SchedulableJob));

      if (jobs.length === 0) {
        return {
          success: true,
          schedule: [],
          summary: {
            totalJobs: 0,
            totalEmployees: 0,
            totalDriveTime: 0,
            averageJobsPerEmployee: 0,
          },
        };
      }

      // Fetch active employees from Firestore
      const employeesSnapshot = await admin.firestore()
        .collection("employees")
        .where("status", "==", "active")
        .get();

      const employees: SchedulableEmployee[] = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as SchedulableEmployee));

      if (employees.length === 0) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "No active employees available for scheduling"
        );
      }

      // Get day of week for availability check
      const scheduleDateObj = new Date(date);
      const dayOfWeek = scheduleDateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

      // Initialize Anthropic client
      const anthropic = new Anthropic({
        apiKey: anthropicApiKey.value(),
      });

      // Build the scheduling prompt
      const prompt = `You are an expert HVAC dispatch scheduler. Your task is to create an optimal schedule for the given jobs and employees.

## Scheduling Date: ${date} (${dayOfWeek})

## Available Employees:
${employees.map(emp => {
  const dayAvail = emp.availability[dayOfWeek];
  return `- ${emp.name} (ID: ${emp.id})
  - Skills: ${emp.skills.join(", ")}
  - Available: ${dayAvail?.available ? `${dayAvail.startTime}:00 - ${dayAvail.endTime}:00` : "Not available"}
  - Max jobs/day: ${emp.maxJobsPerDay}
  - Location: ${emp.currentLocation?.address || "Unknown"}
  - Coordinates: ${emp.currentLocation ? `(${emp.currentLocation.latitude}, ${emp.currentLocation.longitude})` : "Unknown"}`;
}).join("\n\n")}

## Jobs to Schedule:
${jobs.map(job => `- ${job.customerName} (ID: ${job.id})
  - Type: ${job.jobType}
  - Description: ${job.description}
  - Address: ${job.address}
  - Coordinates: ${job.latitude && job.longitude ? `(${job.latitude}, ${job.longitude})` : "Unknown"}
  - Duration: ${job.estimatedDuration} hours
  - Priority: ${job.priority}
  - Required Skills: ${job.requiredSkills.join(", ")}
  - Preferred Time: ${job.preferredTimeSlot || "any"}`).join("\n\n")}

## Optimization Goals:
1. MINIMIZE total drive time by grouping geographically close jobs for each employee
2. MATCH employee skills to job requirements
3. PRIORITIZE emergency and high-priority jobs early in the day
4. RESPECT employee availability windows and max jobs per day
5. BALANCE workload evenly across employees when possible
6. HONOR customer preferred time slots when possible

## Output Format:
Return a valid JSON object with this exact structure (no markdown, just raw JSON):
{
  "schedule": [
    {
      "employeeId": "employee_id_here",
      "employeeName": "Employee Name",
      "jobId": "job_id_here",
      "customerName": "Customer Name",
      "address": "Full Address",
      "jobType": "Job Type",
      "startTime": "2024-01-15T09:00:00",
      "endTime": "2024-01-15T11:00:00",
      "estimatedDriveTime": 15,
      "reasoning": "Brief explanation of why this assignment was made"
    }
  ],
  "summary": {
    "totalJobs": 5,
    "totalEmployees": 3,
    "totalDriveTime": 120,
    "averageJobsPerEmployee": 1.67
  }
}

Important:
- All times must be in ISO 8601 format
- estimatedDriveTime is in minutes
- Include ALL jobs in the schedule if possible
- If a job cannot be scheduled, explain why in the reasoning
- Return ONLY the JSON object, no other text`;

      // Call Anthropic API
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract the text response
      const responseText = message.content[0].type === "text"
        ? message.content[0].text
        : "";

      // Parse the JSON response
      let scheduleData: { schedule: ScheduleAssignment[]; summary: AIScheduleResponse["summary"] };
      try {
        // Clean up the response in case there's any markdown formatting
        const cleanedResponse = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        scheduleData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse AI response:", responseText);
        throw new functions.https.HttpsError(
          "internal",
          "Failed to parse AI scheduling response"
        );
      }

      // Log the generated schedule
      console.log("AI Schedule generated:", {
        date,
        jobsScheduled: scheduleData.schedule.length,
        totalJobs: jobs.length,
      });

      return {
        success: true,
        schedule: scheduleData.schedule,
        summary: scheduleData.summary,
      };
    } catch (error) {
      console.error("Error generating AI schedule:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        error instanceof Error ? error.message : "Failed to generate schedule"
      );
    }
  });
