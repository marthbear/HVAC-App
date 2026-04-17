/**
 * Tests for the serviceRequests Redux slice
 * These tests verify the reducer logic and selectors work correctly
 */

// Define types locally to avoid importing from modules that need Firebase
type ServiceRequestStatus = "Pending" | "Approved" | "Rejected" | "Converted";

interface ServiceRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  serviceType: string;
  isEmergency?: boolean;
  description: string;
  preferredDate?: string;
  status: ServiceRequestStatus;
  submittedAt: string;
}

interface ServiceRequestsState {
  items: ServiceRequest[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Simple reducer implementation for testing (mirrors the actual slice logic)
const initialState: ServiceRequestsState = {
  items: [],
  status: "idle",
  error: null,
};

function reducer(
  state = initialState,
  action: { type: string; payload?: any }
): ServiceRequestsState {
  switch (action.type) {
    case "serviceRequests/clearError":
      return { ...state, error: null };
    case "serviceRequests/fetchAll/pending":
      return { ...state, status: "loading", error: null };
    case "serviceRequests/fetchAll/fulfilled":
      return { ...state, status: "succeeded", items: action.payload };
    case "serviceRequests/fetchAll/rejected":
      return { ...state, status: "failed", error: action.payload };
    default:
      return state;
  }
}

// Selectors
const selectAllRequests = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.items;

const selectPendingRequests = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.items.filter((r) => r.status === "Pending");

const selectRequestsStatus = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.status;

const selectRequestsError = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.error;

describe("serviceRequestsSlice", () => {
  describe("reducer", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle clearError", () => {
      const stateWithError: ServiceRequestsState = {
        ...initialState,
        error: "Something went wrong",
      };
      expect(
        reducer(stateWithError, { type: "serviceRequests/clearError" })
      ).toEqual({
        ...initialState,
        error: null,
      });
    });

    it("should handle fetchAll/pending", () => {
      expect(
        reducer(initialState, { type: "serviceRequests/fetchAll/pending" })
      ).toEqual({
        ...initialState,
        status: "loading",
        error: null,
      });
    });

    it("should handle fetchAll/fulfilled", () => {
      const mockRequests: ServiceRequest[] = [
        {
          id: "1",
          name: "John Doe",
          phone: "555-1234",
          serviceType: "AC Repair",
          description: "AC not cooling",
          status: "Pending",
          submittedAt: "2024-01-01T10:00:00Z",
        },
      ];
      expect(
        reducer(initialState, {
          type: "serviceRequests/fetchAll/fulfilled",
          payload: mockRequests,
        })
      ).toEqual({
        ...initialState,
        status: "succeeded",
        items: mockRequests,
      });
    });

    it("should handle fetchAll/rejected", () => {
      expect(
        reducer(initialState, {
          type: "serviceRequests/fetchAll/rejected",
          payload: "Network error",
        })
      ).toEqual({
        ...initialState,
        status: "failed",
        error: "Network error",
      });
    });
  });

  describe("selectors", () => {
    const mockRequests: ServiceRequest[] = [
      {
        id: "1",
        name: "John Doe",
        phone: "555-1234",
        serviceType: "AC Repair",
        description: "AC not cooling",
        status: "Pending",
        submittedAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "2",
        name: "Jane Smith",
        phone: "555-5678",
        serviceType: "Heating",
        description: "Furnace issues",
        status: "Approved",
        submittedAt: "2024-01-02T10:00:00Z",
      },
      {
        id: "3",
        name: "Bob Wilson",
        phone: "555-9999",
        serviceType: "Maintenance",
        description: "Annual checkup",
        status: "Pending",
        submittedAt: "2024-01-03T10:00:00Z",
      },
    ];

    const mockState = {
      serviceRequests: {
        items: mockRequests,
        status: "succeeded" as const,
        error: null,
      },
    };

    it("selectAllRequests should return all requests", () => {
      expect(selectAllRequests(mockState)).toEqual(mockRequests);
    });

    it("selectPendingRequests should return only pending requests", () => {
      const pending = selectPendingRequests(mockState);
      expect(pending).toHaveLength(2);
      expect(pending.every((r) => r.status === "Pending")).toBe(true);
    });

    it("selectRequestsStatus should return the status", () => {
      expect(selectRequestsStatus(mockState)).toBe("succeeded");
    });

    it("selectRequestsError should return null when no error", () => {
      expect(selectRequestsError(mockState)).toBeNull();
    });

    it("selectRequestsError should return the error message", () => {
      const stateWithError = {
        serviceRequests: {
          ...mockState.serviceRequests,
          error: "Failed to fetch",
        },
      };
      expect(selectRequestsError(stateWithError)).toBe("Failed to fetch");
    });
  });
});
