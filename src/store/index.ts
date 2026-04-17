import { configureStore } from "@reduxjs/toolkit";
import serviceRequestsReducer from "./slices/serviceRequestsSlice";

export const store = configureStore({
  reducer: {
    serviceRequests: serviceRequestsReducer,
  },
});

// Infer types from store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
