import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";

/**
 * Service Request model.
 *
 * Represents a customer service request that needs to be converted to a job.
 */
export type ServiceRequest = {
  id: string;
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
};

const COLLECTION_NAME = "serviceRequests";

/**
 * Get all service requests from Firestore.
 */
export async function getServiceRequests(): Promise<ServiceRequest[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const requests: ServiceRequest[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        serviceType: data.serviceType,
        isEmergency: data.isEmergency,
        description: data.description,
        preferredDate: data.preferredDate,
        status: data.status,
        submittedAt: data.submittedAt,
      });
    });

    return requests;
  } catch (error) {
    console.error("Error loading service requests:", error);
    return [];
  }
}

/**
 * Get service request by ID.
 */
export async function getServiceRequestById(
  id: string
): Promise<ServiceRequest | undefined> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        serviceType: data.serviceType,
        isEmergency: data.isEmergency,
        description: data.description,
        preferredDate: data.preferredDate,
        status: data.status,
        submittedAt: data.submittedAt,
      };
    }
    return undefined;
  } catch (error) {
    console.error("Error loading service request:", error);
    return undefined;
  }
}

/**
 * Add a new service request to Firestore.
 */
export async function addServiceRequest(
  request: Omit<ServiceRequest, "id" | "status" | "submittedAt">
): Promise<ServiceRequest> {
  try {
    // Remove undefined values (Firestore doesn't allow them)
    const cleanedRequest: any = {
      name: request.name,
      phone: request.phone,
      serviceType: request.serviceType,
      description: request.description,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };

    // Only add optional fields if they have values
    if (request.email !== undefined && request.email !== "") {
      cleanedRequest.email = request.email;
    }
    if (request.address !== undefined && request.address !== "") {
      cleanedRequest.address = request.address;
    }
    if (request.preferredDate !== undefined && request.preferredDate !== "") {
      cleanedRequest.preferredDate = request.preferredDate;
    }
    if (request.isEmergency !== undefined) {
      cleanedRequest.isEmergency = request.isEmergency;
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedRequest);

    return {
      id: docRef.id,
      ...cleanedRequest,
    } as ServiceRequest;
  } catch (error) {
    console.error("Error adding service request:", error);
    throw error;
  }
}

/**
 * Update service request status in Firestore.
 */
export async function updateServiceRequestStatus(
  id: string,
  status: ServiceRequest["status"]
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating service request status:", error);
    throw error;
  }
}

/**
 * Get pending service requests count.
 */
export async function getPendingRequestsCount(): Promise<number> {
  const requests = await getServiceRequests();
  return requests.filter((r) => r.status === "Pending").length;
}
