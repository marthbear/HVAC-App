import AsyncStorage from "@react-native-async-storage/async-storage";

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

const STORAGE_KEY = "@service_requests";

/**
 * Default service requests for first time users.
 */
const DEFAULT_REQUESTS: ServiceRequest[] = [
  {
    id: "sr-1",
    name: "Robert Martinez",
    phone: "(804) 555-9999",
    email: "robert@email.com",
    address: "321 Oak Lane, Richmond, VA",
    serviceType: "Service call",
    isEmergency: true,
    description: "AC not working at all. No cool air coming out.",
    preferredDate: "ASAP",
    status: "Pending",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sr-2",
    name: "Linda Thompson",
    phone: "(804) 555-7777",
    email: "linda.t@email.com",
    address: "555 Maple Dr, Henrico, VA",
    serviceType: "Preventative maintenance",
    isEmergency: false,
    description: "Annual maintenance check for furnace before winter.",
    preferredDate: "Next week",
    status: "Pending",
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get all service requests from AsyncStorage.
 */
export async function getServiceRequests(): Promise<ServiceRequest[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // First time - save default requests
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REQUESTS));
    return DEFAULT_REQUESTS;
  } catch (error) {
    console.error("Error loading service requests:", error);
    return DEFAULT_REQUESTS;
  }
}

/**
 * Get service request by ID.
 */
export async function getServiceRequestById(id: string): Promise<ServiceRequest | undefined> {
  const requests = await getServiceRequests();
  return requests.find((request) => request.id === id);
}

/**
 * Add a new service request.
 */
export async function addServiceRequest(
  request: Omit<ServiceRequest, "id" | "status" | "submittedAt">
): Promise<ServiceRequest> {
  const newRequest: ServiceRequest = {
    ...request,
    id: `sr-${Date.now()}`,
    status: "Pending",
    submittedAt: new Date().toISOString(),
  };

  const requests = await getServiceRequests();
  requests.unshift(newRequest);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(requests));

  return newRequest;
}

/**
 * Update service request status.
 */
export async function updateServiceRequestStatus(
  id: string,
  status: ServiceRequest["status"]
): Promise<void> {
  const requests = await getServiceRequests();
  const request = requests.find((r) => r.id === id);
  if (request) {
    request.status = status;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }
}

/**
 * Get pending service requests count.
 */
export async function getPendingRequestsCount(): Promise<number> {
  const requests = await getServiceRequests();
  return requests.filter((r) => r.status === "Pending").length;
}
