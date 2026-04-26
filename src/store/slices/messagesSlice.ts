import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message, MESSAGES } from "../../auth/data/messages";

interface MessagesState {
  items: Message[];
  selectedMessageId: string | null;
  unreadCount: number;
}

const initialState: MessagesState = {
  items: MESSAGES,
  selectedMessageId: null,
  unreadCount: MESSAGES.filter((m) => m.unread).length,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    markAsRead(state, action: PayloadAction<string>) {
      const message = state.items.find((m) => m.id === action.payload);
      if (message && message.unread) {
        message.unread = false;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAsUnread(state, action: PayloadAction<string>) {
      const message = state.items.find((m) => m.id === action.payload);
      if (message && !message.unread) {
        message.unread = true;
        state.unreadCount += 1;
      }
    },
    markAllAsRead(state) {
      state.items.forEach((m) => (m.unread = false));
      state.unreadCount = 0;
    },
    selectMessage(state, action: PayloadAction<string | null>) {
      state.selectedMessageId = action.payload;
      if (action.payload) {
        const message = state.items.find((m) => m.id === action.payload);
        if (message && message.unread) {
          message.unread = false;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    deleteMessage(state, action: PayloadAction<string>) {
      const index = state.items.findIndex((m) => m.id === action.payload);
      if (index !== -1) {
        if (state.items[index].unread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(index, 1);
        if (state.selectedMessageId === action.payload) {
          state.selectedMessageId = null;
        }
      }
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.items.unshift(action.payload);
      if (action.payload.unread) {
        state.unreadCount += 1;
      }
    },
  },
});

export const {
  markAsRead,
  markAsUnread,
  markAllAsRead,
  selectMessage,
  deleteMessage,
  addMessage,
} = messagesSlice.actions;

// Selectors
export const selectAllMessages = (state: { messages: MessagesState }) =>
  state.messages.items;

export const selectUnreadMessages = (state: { messages: MessagesState }) =>
  state.messages.items.filter((m) => m.unread);

export const selectUnreadCount = (state: { messages: MessagesState }) =>
  state.messages.unreadCount;

export const selectSelectedMessage = (state: { messages: MessagesState }) =>
  state.messages.items.find((m) => m.id === state.messages.selectedMessageId) ?? null;

export const selectSelectedMessageId = (state: { messages: MessagesState }) =>
  state.messages.selectedMessageId;

export default messagesSlice.reducer;
