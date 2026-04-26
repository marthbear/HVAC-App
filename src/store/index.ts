import { configureStore } from "@reduxjs/toolkit";
import serviceRequestsReducer from "./slices/serviceRequestsSlice";
import jobsReducer from "./slices/jobsSlice";
import messagesReducer from "./slices/messagesSlice";
import customersReducer from "./slices/customersSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    serviceRequests: serviceRequestsReducer,
    jobs: jobsReducer,
    messages: messagesReducer,
    customers: customersReducer,
    auth: authReducer,
    ui: uiReducer,
  },
});

// Infer types from store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
