/**
 * Employee model.
 *
 * Represents an employee in the HVAC company.
 */
export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Technician" | "Senior Technician" | "Manager";
  status: "Active" | "Inactive" | "On Leave";
  joinDate: string;
  certifications?: string[];
};

/**
 * Mock employees for the manage team screen.
 */
export const EMPLOYEES: Employee[] = [
  {
    id: "employee-001",
    name: "John Smith",
    email: "john.smith@hvaccompany.com",
    phone: "(555) 123-4567",
    role: "Senior Technician",
    status: "Active",
    joinDate: "2023-01-15",
    certifications: ["EPA 608", "NATE Certified"],
  },
  {
    id: "employee-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@hvaccompany.com",
    phone: "(555) 234-5678",
    role: "Technician",
    status: "Active",
    joinDate: "2023-06-20",
    certifications: ["EPA 608"],
  },
  {
    id: "employee-003",
    name: "Mike Williams",
    email: "mike.williams@hvaccompany.com",
    phone: "(555) 345-6789",
    role: "Technician",
    status: "Active",
    joinDate: "2024-03-10",
    certifications: ["EPA 608"],
  },
  {
    id: "employee-004",
    name: "Emily Davis",
    email: "emily.davis@hvaccompany.com",
    phone: "(555) 456-7890",
    role: "Manager",
    status: "Active",
    joinDate: "2022-08-05",
    certifications: ["EPA 608", "NATE Certified", "HVAC Excellence Certified"],
  },
  {
    id: "employee-005",
    name: "Robert Chen",
    email: "robert.chen@hvaccompany.com",
    phone: "(555) 567-8901",
    role: "Technician",
    status: "On Leave",
    joinDate: "2023-11-12",
    certifications: ["EPA 608"],
  },
];

/**
 * Get employee by ID.
 */
export function getEmployeeById(id: string): Employee | undefined {
  return EMPLOYEES.find((employee) => employee.id === id);
}

/**
 * Get active employees.
 */
export function getActiveEmployees(): Employee[] {
  return EMPLOYEES.filter((employee) => employee.status === "Active");
}
