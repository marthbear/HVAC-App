import { collection, getDocs, query, where, addDoc, updateDoc, doc, Timestamp, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/src/config/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getEmployeesForScheduling, SchedulableEmployee as CentralizedSchedulableEmployee } from "@/src/services/employeeService";

/**
 * Enhanced Job model for AI scheduling
 */
export type SchedulableJob = {
  id: string;
  companyId?: string; // Company this job belongs to
  customerName: string;
  address: string;
  phone: string;
  email?: string;
  jobType: string; // AC Repair, Furnace Maintenance, New Installation, etc.
  description: string;
  estimatedDuration: number; // in hours
  priority: "low" | "normal" | "high" | "emergency";
  requiredSkills: string[];
  status: "unscheduled" | "scheduled" | "in_progress" | "completed";
  preferredDate?: string; // YYYY-MM-DD
  preferredTimeSlot?: "morning" | "afternoon" | "evening" | "any";
  latitude?: number;
  longitude?: number;
  createdAt: string;
  completedAt?: string; // ISO timestamp when job was completed
  // Assigned after scheduling
  assignedEmployeeId?: string;
  scheduledDate?: string;
  scheduledStartTime?: number; // 24h format (0-23)
  scheduledEndTime?: number;
};

/**
 * Employee model for AI scheduling
 */
export type SchedulableEmployee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[]; // AC, Furnace, Heat Pump, Installation, etc.
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  availability: {
    [day: string]: { // "monday", "tuesday", etc.
      available: boolean;
      startTime: number; // 24h format
      endTime: number;
    };
  };
  maxJobsPerDay: number;
  status: "active" | "inactive" | "on_leave";
};

/**
 * AI-generated schedule assignment
 */
export type ScheduleAssignment = {
  employeeId: string;
  employeeName: string;
  jobId: string;
  customerName: string;
  address: string;
  jobType: string;
  startTime: string; // ISO datetime
  endTime: string;
  estimatedDriveTime: number; // in minutes
  reasoning: string;
};

/**
 * Response from AI scheduling function
 */
export type AIScheduleResponse = {
  success: boolean;
  schedule: ScheduleAssignment[];
  summary: {
    totalJobs: number;
    totalEmployees: number;
    totalDriveTime: number;
    averageJobsPerEmployee: number;
  };
  error?: string;
};

/**
 * Fetch all unscheduled jobs for a company
 */
export async function getUnscheduledJobs(companyId?: string): Promise<SchedulableJob[]> {
  try {
    const jobsRef = collection(db, "jobs");
    const q = companyId
      ? query(jobsRef, where("companyId", "==", companyId), where("status", "==", "unscheduled"))
      : query(jobsRef, where("status", "==", "unscheduled"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SchedulableJob));
  } catch (error) {
    console.error("Error fetching unscheduled jobs:", error);
    return [];
  }
}

/**
 * Fetch all scheduled jobs for a company
 */
export async function getScheduledJobs(companyId?: string): Promise<SchedulableJob[]> {
  try {
    const jobsRef = collection(db, "jobs");
    const q = companyId
      ? query(jobsRef, where("companyId", "==", companyId), where("status", "==", "scheduled"))
      : query(jobsRef, where("status", "==", "scheduled"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SchedulableJob));
  } catch (error) {
    console.error("Error fetching scheduled jobs:", error);
    return [];
  }
}

/**
 * Fetch all jobs (any status) for a company
 */
export async function getAllJobs(companyId?: string): Promise<SchedulableJob[]> {
  try {
    const jobsRef = collection(db, "jobs");
    const q = companyId
      ? query(jobsRef, where("companyId", "==", companyId))
      : undefined;
    const snapshot = q ? await getDocs(q) : await getDocs(jobsRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SchedulableJob));
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    return [];
  }
}

/**
 * Fetch all available employees for a company.
 * Uses the centralized employee service which queries the users collection.
 */
export async function getAvailableEmployees(companyId?: string): Promise<SchedulableEmployee[]> {
  // If companyId is provided, use the centralized service
  if (companyId) {
    try {
      const employees = await getEmployeesForScheduling(companyId);
      return employees as SchedulableEmployee[];
    } catch (error) {
      console.error("Error fetching employees from centralized service:", error);
      return [];
    }
  }

  // Fallback to old employees collection (for backwards compatibility)
  try {
    const employeesRef = collection(db, "employees");
    const q = query(employeesRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SchedulableEmployee));
  } catch (error) {
    console.error("Error fetching available employees:", error);
    return [];
  }
}

/**
 * Call AI scheduling Cloud Function
 */
export async function generateAISchedule(
  date: string // YYYY-MM-DD format
): Promise<AIScheduleResponse> {
  try {
    const functions = getFunctions();
    const generateSchedule = httpsCallable<
      { date: string },
      AIScheduleResponse
    >(functions, "generateAISchedule");

    const result = await generateSchedule({ date });
    return result.data;
  } catch (error) {
    console.error("Error generating AI schedule:", error);
    return {
      success: false,
      schedule: [],
      summary: {
        totalJobs: 0,
        totalEmployees: 0,
        totalDriveTime: 0,
        averageJobsPerEmployee: 0,
      },
      error: error instanceof Error ? error.message : "Failed to generate schedule",
    };
  }
}

/**
 * Apply the AI-generated schedule to Firestore
 */
export async function applySchedule(
  assignments: ScheduleAssignment[]
): Promise<boolean> {
  try {
    const updatePromises = assignments.map(async (assignment) => {
      const jobRef = doc(db, "jobs", assignment.jobId);
      const startDate = new Date(assignment.startTime);

      await updateDoc(jobRef, {
        status: "scheduled",
        assignedEmployeeId: assignment.employeeId,
        scheduledDate: startDate.toISOString().split("T")[0],
        scheduledStartTime: startDate.getHours(),
        scheduledEndTime: new Date(assignment.endTime).getHours(),
        updatedAt: new Date().toISOString(),
      });
    });

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error applying schedule:", error);
    return false;
  }
}

/**
 * Mark a job as completed with timestamp
 */
export async function completeJob(jobId: string): Promise<boolean> {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      status: "completed",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error completing job:", error);
    return false;
  }
}

/**
 * Mark a job as in progress
 */
export async function startJob(jobId: string): Promise<boolean> {
  try {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      status: "in_progress",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error starting job:", error);
    return false;
  }
}

/**
 * Add sample jobs for testing (can be removed in production)
 */
export async function addSampleJobs(companyId?: string): Promise<void> {
  const sampleJobs: Omit<SchedulableJob, "id">[] = [
    {
      companyId,
      customerName: "Smith Residence",
      address: "123 Main St, Richmond, VA 23220",
      phone: "(804) 555-1234",
      jobType: "AC Repair",
      description: "AC not cooling properly, making loud noise",
      estimatedDuration: 2,
      priority: "high",
      requiredSkills: ["AC", "Diagnostics"],
      status: "unscheduled",
      preferredTimeSlot: "morning",
      latitude: 37.5407,
      longitude: -77.4360,
      createdAt: new Date().toISOString(),
    },
    {
      companyId,
      customerName: "Johnson Apartments",
      address: "456 Oak Ave, Henrico, VA 23228",
      phone: "(804) 555-5678",
      jobType: "Furnace Maintenance",
      description: "Annual furnace inspection and tune-up",
      estimatedDuration: 1.5,
      priority: "normal",
      requiredSkills: ["Furnace"],
      status: "unscheduled",
      preferredTimeSlot: "afternoon",
      latitude: 37.5876,
      longitude: -77.5194,
      createdAt: new Date().toISOString(),
    },
    {
      companyId,
      customerName: "Baker Home",
      address: "789 Pine Rd, Chesterfield, VA 23832",
      phone: "(804) 555-9012",
      jobType: "New Installation",
      description: "Install new heat pump system",
      estimatedDuration: 4,
      priority: "normal",
      requiredSkills: ["Installation", "Heat Pump"],
      status: "unscheduled",
      preferredTimeSlot: "morning",
      latitude: 37.3779,
      longitude: -77.5061,
      createdAt: new Date().toISOString(),
    },
    {
      companyId,
      customerName: "Williams Office",
      address: "321 Commerce Blvd, Richmond, VA 23219",
      phone: "(804) 555-3456",
      jobType: "Emergency Repair",
      description: "Complete AC failure, office too hot",
      estimatedDuration: 2.5,
      priority: "emergency",
      requiredSkills: ["AC", "Commercial"],
      status: "unscheduled",
      preferredTimeSlot: "any",
      latitude: 37.5387,
      longitude: -77.4338,
      createdAt: new Date().toISOString(),
    },
    {
      companyId,
      customerName: "Davis Family",
      address: "567 Elm St, Glen Allen, VA 23060",
      phone: "(804) 555-7890",
      jobType: "Duct Cleaning",
      description: "Full house duct cleaning service",
      estimatedDuration: 3,
      priority: "low",
      requiredSkills: ["Duct Work"],
      status: "unscheduled",
      preferredTimeSlot: "afternoon",
      latitude: 37.6560,
      longitude: -77.4844,
      createdAt: new Date().toISOString(),
    },
  ];

  const jobsRef = collection(db, "jobs");

  for (const job of sampleJobs) {
    await addDoc(jobsRef, job);
  }
}

/**
 * Add sample employees for testing (can be removed in production)
 */
export async function addSampleEmployees(): Promise<void> {
  const sampleEmployees: Omit<SchedulableEmployee, "id">[] = [
    {
      name: "John Smith",
      email: "john.smith@hvacpro.com",
      phone: "(804) 555-0001",
      skills: ["AC", "Furnace", "Heat Pump", "Diagnostics"],
      currentLocation: {
        latitude: 37.5407,
        longitude: -77.4360,
        address: "Richmond, VA",
      },
      availability: {
        monday: { available: true, startTime: 8, endTime: 17 },
        tuesday: { available: true, startTime: 8, endTime: 17 },
        wednesday: { available: true, startTime: 8, endTime: 17 },
        thursday: { available: true, startTime: 8, endTime: 17 },
        friday: { available: true, startTime: 8, endTime: 17 },
        saturday: { available: false, startTime: 0, endTime: 0 },
        sunday: { available: false, startTime: 0, endTime: 0 },
      },
      maxJobsPerDay: 5,
      status: "active",
    },
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@hvacpro.com",
      phone: "(804) 555-0002",
      skills: ["AC", "Installation", "Commercial"],
      currentLocation: {
        latitude: 37.5876,
        longitude: -77.5194,
        address: "Henrico, VA",
      },
      availability: {
        monday: { available: true, startTime: 7, endTime: 16 },
        tuesday: { available: true, startTime: 7, endTime: 16 },
        wednesday: { available: true, startTime: 7, endTime: 16 },
        thursday: { available: true, startTime: 7, endTime: 16 },
        friday: { available: true, startTime: 7, endTime: 16 },
        saturday: { available: true, startTime: 8, endTime: 12 },
        sunday: { available: false, startTime: 0, endTime: 0 },
      },
      maxJobsPerDay: 4,
      status: "active",
    },
    {
      name: "Mike Williams",
      email: "mike.williams@hvacpro.com",
      phone: "(804) 555-0003",
      skills: ["Furnace", "Heat Pump", "Duct Work"],
      currentLocation: {
        latitude: 37.3779,
        longitude: -77.5061,
        address: "Chesterfield, VA",
      },
      availability: {
        monday: { available: true, startTime: 9, endTime: 18 },
        tuesday: { available: true, startTime: 9, endTime: 18 },
        wednesday: { available: true, startTime: 9, endTime: 18 },
        thursday: { available: true, startTime: 9, endTime: 18 },
        friday: { available: true, startTime: 9, endTime: 18 },
        saturday: { available: false, startTime: 0, endTime: 0 },
        sunday: { available: false, startTime: 0, endTime: 0 },
      },
      maxJobsPerDay: 5,
      status: "active",
    },
  ];

  const employeesRef = collection(db, "employees");

  for (const employee of sampleEmployees) {
    await addDoc(employeesRef, employee);
  }
}

/**
 * Clear all test data (jobs and employees) for a company
 * Uses batch operations for more reliable deletion
 */
export async function clearTestData(companyId?: string): Promise<{ jobsDeleted: number; employeesDeleted: number }> {
  let jobsDeleted = 0;
  let employeesDeleted = 0;

  try {
    // Delete jobs using batches (Firestore limits batches to 500 operations)
    const jobsRef = collection(db, "jobs");
    const jobsQuery = companyId
      ? query(jobsRef, where("companyId", "==", companyId))
      : jobsRef;
    const jobsSnapshot = await getDocs(jobsQuery);
    console.log(`Found ${jobsSnapshot.docs.length} jobs to delete`);

    // Process jobs in batches of 500
    const jobDocs = jobsSnapshot.docs;
    for (let i = 0; i < jobDocs.length; i += 500) {
      const batch = writeBatch(db);
      const batchDocs = jobDocs.slice(i, i + 500);

      for (const jobDoc of batchDocs) {
        batch.delete(doc(db, "jobs", jobDoc.id));
        jobsDeleted++;
      }

      await batch.commit();
      console.log(`Deleted batch of ${batchDocs.length} jobs`);
    }

    // Delete all employees using batches
    const employeesRef = collection(db, "employees");
    const employeesSnapshot = await getDocs(employeesRef);
    console.log(`Found ${employeesSnapshot.docs.length} employees to delete`);

    const empDocs = employeesSnapshot.docs;
    for (let i = 0; i < empDocs.length; i += 500) {
      const batch = writeBatch(db);
      const batchDocs = empDocs.slice(i, i + 500);

      for (const empDoc of batchDocs) {
        batch.delete(doc(db, "employees", empDoc.id));
        employeesDeleted++;
      }

      await batch.commit();
      console.log(`Deleted batch of ${batchDocs.length} employees`);
    }

    console.log(`Total deleted: ${jobsDeleted} jobs, ${employeesDeleted} employees`);
    return { jobsDeleted, employeesDeleted };
  } catch (error) {
    console.error("Error clearing test data:", error);
    throw error;
  }
}
