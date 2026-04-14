import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/src/config/firebase";

/**
 * Time entry stored in Firestore
 */
export type TimeEntry = {
  id: string;
  userId: string;
  clockIn: Timestamp;
  clockOut: Timestamp | null;
  totalHours: number | null;
  notes?: string;
  createdAt: Timestamp;
};

/**
 * Active shift status
 */
export type ShiftStatus = {
  isClockedIn: boolean;
  currentShiftId: string | null;
  clockInTime: Date | null;
};

/**
 * Clock in an employee
 */
export async function clockIn(userId: string): Promise<string> {
  // Check if already clocked in
  const status = await getShiftStatus(userId);
  if (status.isClockedIn) {
    throw new Error("Already clocked in");
  }

  // Create new time entry
  const timeEntriesRef = collection(db, "timeEntries");
  const now = Timestamp.now();

  const docRef = await addDoc(timeEntriesRef, {
    userId,
    clockIn: now,
    clockOut: null,
    totalHours: null,
    createdAt: now,
  });

  // Update user document with active shift
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    activeShiftId: docRef.id,
    isClockedIn: true,
    lastClockIn: now,
  });

  return docRef.id;
}

/**
 * Clock out an employee
 */
export async function clockOut(userId: string, notes?: string): Promise<void> {
  const status = await getShiftStatus(userId);
  if (!status.isClockedIn || !status.currentShiftId) {
    throw new Error("Not currently clocked in");
  }

  const now = Timestamp.now();
  const clockInTime = status.clockInTime!;
  const totalHours = (now.toMillis() - clockInTime.getTime()) / (1000 * 60 * 60);

  // Update time entry
  const entryRef = doc(db, "timeEntries", status.currentShiftId);
  await updateDoc(entryRef, {
    clockOut: now,
    totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimals
    ...(notes && { notes }),
  });

  // Update user document
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    activeShiftId: null,
    isClockedIn: false,
    lastClockOut: now,
  });
}

/**
 * Get current shift status for a user
 */
export async function getShiftStatus(userId: string): Promise<ShiftStatus> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        isClockedIn: false,
        currentShiftId: null,
        clockInTime: null,
      };
    }

    const userData = userDoc.data();
    const isClockedIn = userData.isClockedIn || false;
    const activeShiftId = userData.activeShiftId || null;

    let clockInTime: Date | null = null;
    if (isClockedIn && activeShiftId) {
      const entryRef = doc(db, "timeEntries", activeShiftId);
      const entryDoc = await getDoc(entryRef);
      if (entryDoc.exists()) {
        const entryData = entryDoc.data();
        clockInTime = entryData.clockIn?.toDate() || null;
      }
    }

    return {
      isClockedIn,
      currentShiftId: activeShiftId,
      clockInTime,
    };
  } catch (error) {
    console.error("Error getting shift status:", error);
    return {
      isClockedIn: false,
      currentShiftId: null,
      clockInTime: null,
    };
  }
}

/**
 * Subscribe to shift status changes
 */
export function subscribeToShiftStatus(
  userId: string,
  callback: (status: ShiftStatus) => void
): () => void {
  const userRef = doc(db, "users", userId);

  const unsubscribe = onSnapshot(userRef, async (snapshot) => {
    if (!snapshot.exists()) {
      callback({
        isClockedIn: false,
        currentShiftId: null,
        clockInTime: null,
      });
      return;
    }

    const userData = snapshot.data();
    const isClockedIn = userData.isClockedIn || false;
    const activeShiftId = userData.activeShiftId || null;

    let clockInTime: Date | null = null;
    if (isClockedIn && activeShiftId) {
      const entryRef = doc(db, "timeEntries", activeShiftId);
      const entryDoc = await getDoc(entryRef);
      if (entryDoc.exists()) {
        const entryData = entryDoc.data();
        clockInTime = entryData.clockIn?.toDate() || null;
      }
    }

    callback({
      isClockedIn,
      currentShiftId: activeShiftId,
      clockInTime,
    });
  });

  return unsubscribe;
}

/**
 * Get time entries for a user within a date range
 */
export async function getTimeEntries(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TimeEntry[]> {
  try {
    const timeEntriesRef = collection(db, "timeEntries");
    let q = query(
      timeEntriesRef,
      where("userId", "==", userId),
      orderBy("clockIn", "desc"),
      limit(50)
    );

    if (startDate) {
      q = query(q, where("clockIn", ">=", Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where("clockIn", "<=", Timestamp.fromDate(endDate)));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TimeEntry[];
  } catch (error) {
    console.error("Error getting time entries:", error);
    return [];
  }
}

/**
 * Calculate total hours worked in a week
 */
export async function getWeeklyHours(userId: string): Promise<number> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const entries = await getTimeEntries(userId, startOfWeek);
  return entries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
}

/**
 * Get all clocked-in employees (for admin view)
 */
export async function getClockedInEmployees(): Promise<string[]> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("isClockedIn", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error getting clocked in employees:", error);
    return [];
  }
}
