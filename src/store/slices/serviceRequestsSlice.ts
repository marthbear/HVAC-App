import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getServiceRequests,
  updateServiceRequestStatus,
  ServiceRequest,
} from "../../auth/data/serviceRequests";

/**
 * State shape for service requests
 */
interface ServiceRequestsState {
  items: ServiceRequest[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ServiceRequestsState = {
  items: [],
  status: "idle",
  error: null,
};

/**
 * Async thunk to fetch all service requests from Firestore
 */
export const fetchServiceRequests = createAsyncThunk(
  "serviceRequests/fetchAll",
  async () => {
    const requests = await getServiceRequests();
    return requests;
  }
);

/**
 * Async thunk to update a service request's status
 */
export const updateRequestStatus = createAsyncThunk(
  "serviceRequests/updateStatus",
  async ({
    id,
    status,
  }: {
    id: string;
    status: ServiceRequest["status"];
  }) => {
    await updateServiceRequestStatus(id, status);
    return { id, status };
  }
);

const serviceRequestsSlice = createSlice({
  name: "serviceRequests",
  initialState,
  reducers: {
    // For local optimistic updates if needed
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchServiceRequests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchServiceRequests.fulfilled,
        (state, action: PayloadAction<ServiceRequest[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch service requests";
      })
      // Update status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const request = state.items.find((r) => r.id === id);
        if (request) {
          request.status = status;
        }
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update status";
      });
  },
});

export const { clearError } = serviceRequestsSlice.actions;

// Selectors
export const selectAllRequests = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.items;

export const selectPendingRequests = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.items.filter((r) => r.status === "Pending");

export const selectRequestsStatus = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.status;

export const selectRequestsError = (state: { serviceRequests: ServiceRequestsState }) =>
  state.serviceRequests.error;

export default serviceRequestsSlice.reducer;
