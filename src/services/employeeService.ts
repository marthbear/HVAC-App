import { collection, getDocs, query, where, doc, getDoc, updateDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/src/config/firebase";

/**
 * Unified Employee type used across the entire app.
 * All employee data comes from the 'users' collection filtered by role='employee'.
 */
export type Employee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string; // Job title/role like "Senior Technician"
  companyId: string;
  status: "active" | "pending";

  // Time tracking
  isClockedIn: boolean;
  lastClockIn?: string;
  lastClockOut?: string;

  // Location tracking
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy?: number;
    timestamp?: string;
  };

  // Scheduling fields
  skills?: string[];
  availability?: {
    [day: string]: {
      available: boolean;
      startTime: number;
      endTime: number;
    };
  };
  maxJobsPerDay?: number;

  createdAt: string;
};

/**
 * Employee for display in lists (simplified)
 */
export type EmployeeListItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isClockedIn: boolean;
  currentLocation?: {
    address: string;
  };
};

/**
 * Employee for scheduling purposes
 */
export type SchedulableEmployee = {
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
};

/**
 * Contact-style employee for contacts screen
 */
export type EmployeeContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

/**
 * Default availability schedule (Mon-Fri 8am-5pm)
 */
const DEFAULT_AVAILABILITY = {
  monday: { available: true, startTime: 8, endTime: 17 },
  tuesday: { available: true, startTime: 8, endTime: 17 },
  wednesday: { available: true, startTime: 8, endTime: 17 },
  thursday: { available: true, startTime: 8, endTime: 17 },
  friday: { available: true, startTime: 8, endTime: 17 },
  saturday: { available: false, startTime: 0, endTime: 0 },
  sunday: { available: false, startTime: 0, endTime: 0 },
};

/**
 * Fetch all employees for a company.
 * This is the primary function for getting employee data.
 */
export async function getEmployees(companyId: string): Promise<Employee[]> {
  if (!companyId) {
    console.warn("getEmployees called without companyId");
    return [];
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("companyId", "==", companyId),
      where("role", "==", "employee"),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapUserDocToEmployee(doc.id, data);
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

/**
 * Fetch all employees including pending ones
 */
export async function getAllEmployees(companyId: string): Promise<Employee[]> {
  if (!companyId) {
    console.warn("getAllEmployees called without companyId");
    return [];
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("companyId", "==", companyId),
      where("role", "==", "employee")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapUserDocToEmployee(doc.id, data);
    });
  } catch (error) {
    console.error("Error fetching all employees:", error);
    return [];
  }
}

/**
 * Get employees formatted for list display (dashboard, team status)
 */
export async function getEmployeesForList(companyId: string): Promise<EmployeeListItem[]> {
  const employees = await getEmployees(companyId);

  return employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    role: emp.role,
    isClockedIn: emp.isClockedIn,
    currentLocation: emp.currentLocation ? { address: emp.currentLocation.address } : undefined,
  }));
}

/**
 * Get employees formatted for contacts screen
 */
export async function getEmployeesForContacts(companyId: string): Promise<EmployeeContact[]> {
  const employees = await getEmployees(companyId);

  return employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone || "",
    role: emp.role || "Technician",
  }));
}

/**
 * Get employees formatted for scheduling
 */
export async function getEmployeesForScheduling(companyId: string): Promise<SchedulableEmployee[]> {
  const employees = await getEmployees(companyId);

  return employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone || "",
    skills: emp.skills || [],
    currentLocation: emp.currentLocation,
    availability: emp.availability || DEFAULT_AVAILABILITY,
    maxJobsPerDay: emp.maxJobsPerDay || 5,
    status: emp.status === "active" ? "active" : "inactive",
  }));
}

/**
 * Get count of clocked-in employees
 */
export async function getClockedInCount(companyId: string): Promise<number> {
  const employees = await getEmployees(companyId);
  return employees.filter((emp) => emp.isClockedIn).length;
}

/**
 * Get a single employee by ID
 */
export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
  try {
    const userRef = doc(db, "users", employeeId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return mapUserDocToEmployee(userDoc.id, userDoc.data());
  } catch (error) {
    console.error("Error fetching employee:", error);
    return null;
  }
}

/**
 * Update employee profile data
 */
export async function updateEmployeeProfile(
  employeeId: string,
  updates: Partial<Pick<Employee, "name" | "phone" | "role" | "skills" | "availability" | "maxJobsPerDay">>
): Promise<boolean> {
  try {
    const userRef = doc(db, "users", employeeId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating employee:", error);
    return false;
  }
}

/**
 * Subscribe to real-time employee updates for a company
 */
export function subscribeToEmployees(
  companyId: string,
  onUpdate: (employees: Employee[]) => void
): Unsubscribe {
  if (!companyId) {
    console.warn("subscribeToEmployees called without companyId");
    return () => {};
  }

  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("companyId", "==", companyId),
    where("role", "==", "employee"),
    where("status", "==", "active")
  );

  return onSnapshot(q, (snapshot) => {
    const employees = snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapUserDocToEmployee(doc.id, data);
    });
    onUpdate(employees);
  }, (error) => {
    console.error("Error in employee subscription:", error);
  });
}

/**
 * Helper function to map Firestore user document to Employee type
 */
function mapUserDocToEmployee(id: string, data: any): Employee {
  return {
    id,
    name: data.name || data.email?.split("@")[0] || "Unknown",
    email: data.email || "",
    phone: data.phone || "",
    role: data.jobTitle || data.role || "Technician",
    companyId: data.companyId || "",
    status: data.status || "active",
    isClockedIn: data.isClockedIn || false,
    lastClockIn: data.lastClockIn,
    lastClockOut: data.lastClockOut,
    currentLocation: data.currentLocation,
    skills: data.skills || [],
    availability: data.availability || DEFAULT_AVAILABILITY,
    maxJobsPerDay: data.maxJobsPerDay || 5,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}
