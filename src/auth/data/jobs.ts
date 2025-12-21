/**
 * Job model.
 *
 * Represents a scheduled HVAC job.
 */
export type Job = {
  id: string;

  // Who the job belongs to
  employeeId: string;

  // Who the work is for
  customerName: string;

  // Time window (24h format)
  startTime: number;
  endTime: number;

  // Job details
  type: string;
  status: "Scheduled" | "In Progress" | "Completed";

  // Date the job occurs on (YYYY-MM-DD)
  date: string;
};

/**
 * Mock jobs for the schedule.
 *
 * These are intentionally simple and predictable
 * while the UI is being built.
 */
export const JOBS: Job[] = [
  {
    id: "1",
    employeeId: "employee-001",
    customerName: "Smith Residence",
    startTime: 9,
    endTime: 11,
    type: "AC Maintenance",
    status: "Scheduled",
    date: "2025-12-17",
  },
  {
    id: "2",
    employeeId: "employee-001",
    customerName: "Johnson Apartments",
    startTime: 12,
    endTime: 14,
    type: "Furnace Repair",
    status: "In Progress",
    date: "2025-12-17",
  },
  {
    id: "3",
    employeeId: "employee-001",
    customerName: "Baker Home",
    startTime: 15,
    endTime: 17,
    type: "New Installation",
    status: "Scheduled",
    date: "2025-12-18",
  },
];

/**
 * Simulates fetching a job by ID.
 */
export function getJobById(id: string): Job | undefined {
  return JOBS.find((job) => job.id === id);
}
