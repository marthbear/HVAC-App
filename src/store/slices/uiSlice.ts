import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

interface UIState {
  isLoading: boolean;
  loadingMessage: string | null;
  notifications: Notification[];
  modals: Record<string, Modal>;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
}

const initialState: UIState = {
  isLoading: false,
  loadingMessage: null,
  notifications: [],
  modals: {},
  sidebarOpen: true,
  theme: "system",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean | string>) {
      if (typeof action.payload === "boolean") {
        state.isLoading = action.payload;
        state.loadingMessage = null;
      } else {
        state.isLoading = true;
        state.loadingMessage = action.payload;
      }
    },
    clearLoading(state) {
      state.isLoading = false;
      state.loadingMessage = null;
    },
    addNotification(state, action: PayloadAction<Omit<Notification, "id">>) {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearAllNotifications(state) {
      state.notifications = [];
    },
    openModal(state, action: PayloadAction<{ id: string; data?: Record<string, unknown> }>) {
      state.modals[action.payload.id] = {
        id: action.payload.id,
        isOpen: true,
        data: action.payload.data,
      };
    },
    closeModal(state, action: PayloadAction<string>) {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action: PayloadAction<UIState["theme"]>) {
      state.theme = action.payload;
    },
  },
});

export const {
  setLoading,
  clearLoading,
  addNotification,
  removeNotification,
  clearAllNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
} = uiSlice.actions;

// Selectors
export const selectIsLoading = (state: { ui: UIState }) => state.ui.isLoading;

export const selectLoadingMessage = (state: { ui: UIState }) => state.ui.loadingMessage;

export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;

export const selectModal = (modalId: string) => (state: { ui: UIState }) =>
  state.ui.modals[modalId] ?? { id: modalId, isOpen: false };

export const selectIsModalOpen = (modalId: string) => (state: { ui: UIState }) =>
  state.ui.modals[modalId]?.isOpen ?? false;

export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;

export const selectTheme = (state: { ui: UIState }) => state.ui.theme;

export default uiSlice.reducer;
