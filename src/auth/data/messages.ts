/**
 * Message model.
 *
 * Represents an inbox item
 */
export type Message = {
  id: string;
  title: string;
  preview: string;
  body: string;
  timestamp: string;
  unread: boolean;
  relatedCustomerId?: string;
};

/**
 * Mock inbox messages.
 */
export const MESSAGES: Message[] = [
  {
    id: "1",
    title: "New Job Assigned",
    preview: "You've been assigned to the Smith Residence.",
    body: "You've been assigned to the Smith Residence for an AC maintenance job. Please review the job details in your schedule and contact the customer to confirm the appointment time. The customer has requested service between 9 AM and 11 AM.",
    timestamp: "10:24 AM",
    unread: true,
    relatedCustomerId: "1",
  },
  {
    id: "2",
    title: "Customer Update",
    preview: "Johnson Apartments confirmed tomorrow's visit.",
    body: "Johnson Apartments has confirmed tomorrow's furnace repair visit. The property manager will be on-site to provide access. Please bring the replacement parts discussed in the previous visit. If you have any questions, contact the office at (555) 123-4567.",
    timestamp: "Yesterday",
    unread: false,
    relatedCustomerId: "2",
  },
  {
    id: "3",
    title: "Admin Notice",
    preview: "Team meeting scheduled for Friday.",
    body: "Team meeting scheduled for Friday at 3:00 PM in the main office. We'll be discussing the new scheduling system and upcoming holiday coverage. Please review the attached agenda before the meeting. Attendance is mandatory.",
    timestamp: "Mon",
    unread: false,
  },
];