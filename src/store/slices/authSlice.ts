import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser, UserRole } from "../../auth/auth.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    updateUserRole(state, action: PayloadAction<UserRole>) {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  loginSuccess,
  loginFailure,
  logout,
  updateUserRole,
  clearAuthError,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;

export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.user?.role ?? null;

export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.role === "admin";

export const selectIsEmployee = (state: { auth: AuthState }) =>
  state.auth.user?.role === "employee";

export const selectIsCustomer = (state: { auth: AuthState }) =>
  state.auth.user?.role === "customer";

export default authSlice.reducer;
