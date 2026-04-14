import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/src/config/firebase";

export type MessageType = "employee" | "customer" | "system";

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: MessageType;
  content: string;
  timestamp: Timestamp;
  read: boolean;
};

export type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantType: MessageType;
  subject: string;
  lastMessage: string;
  lastMessageTime: Timestamp;
  unread: boolean;
  unreadCount: number;
};

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    participantId: "emp-001",
    participantName: "John Smith",
    participantType: "employee",
    subject: "Request for Time Off",
    lastMessage: "I would like to request time off for next week...",
    lastMessageTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 30)), // 30 min ago
    unread: true,
    unreadCount: 1,
  },
  {
    id: "2",
    participantId: "emp-002",
    participantName: "Sarah Johnson",
    participantType: "employee",
    subject: "Equipment Issue",
    lastMessage: "The van's AC unit needs maintenance...",
    lastMessageTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 1 day ago
    unread: true,
    unreadCount: 2,
  },
  {
    id: "3",
    participantId: "cust-001",
    participantName: "Smith Residence",
    participantType: "customer",
    subject: "Service Feedback",
    lastMessage: "Thank you for the excellent service today...",
    lastMessageTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 1 day ago
    unread: false,
    unreadCount: 0,
  },
  {
    id: "4",
    participantId: "system",
    participantName: "System",
    participantType: "system",
    subject: "Weekly Report Ready",
    lastMessage: "Your weekly performance report is now available. Revenue this week: $12,450. Jobs completed: 24. Customer satisfaction: 4.8/5.",
    lastMessageTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)), // 2 days ago
    unread: false,
    unreadCount: 0,
  },
  {
    id: "5",
    participantId: "emp-003",
    participantName: "Mike Williams",
    participantType: "employee",
    subject: "Question about Schedule",
    lastMessage: "Can I switch shifts with Sarah on Thursday?",
    lastMessageTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)), // 2 days ago
    unread: false,
    unreadCount: 0,
  },
];

// Mock messages for each conversation
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      conversationId: "1",
      senderId: "emp-001",
      senderName: "John Smith",
      senderType: "employee",
      content: "Hi, I would like to request time off for next week from Monday to Wednesday. I have a family event to attend.",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 30)),
      read: false,
    },
  ],
  "2": [
    {
      id: "m2",
      conversationId: "2",
      senderId: "emp-002",
      senderName: "Sarah Johnson",
      senderType: "employee",
      content: "Hey, I wanted to let you know that the AC unit in my service van isn't cooling properly.",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 25)),
      read: true,
    },
    {
      id: "m3",
      conversationId: "2",
      senderId: "admin",
      senderName: "Admin",
      senderType: "system",
      content: "Thanks for letting me know. Can you drop it off at the shop tomorrow morning?",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24.5)),
      read: true,
    },
    {
      id: "m4",
      conversationId: "2",
      senderId: "emp-002",
      senderName: "Sarah Johnson",
      senderType: "employee",
      content: "Sure, I can do that. What time works best?",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)),
      read: false,
    },
  ],
  "3": [
    {
      id: "m5",
      conversationId: "3",
      senderId: "cust-001",
      senderName: "Smith Residence",
      senderType: "customer",
      content: "Thank you for the excellent service today! John was very professional and fixed our AC quickly.",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 26)),
      read: true,
    },
    {
      id: "m6",
      conversationId: "3",
      senderId: "admin",
      senderName: "Admin",
      senderType: "system",
      content: "Thank you so much for the kind words! We're glad John was able to help. Please don't hesitate to reach out if you need anything else.",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)),
      read: true,
    },
  ],
  "4": [
    {
      id: "m7",
      conversationId: "4",
      senderId: "system",
      senderName: "System",
      senderType: "system",
      content: "Your weekly performance report is now available.\n\n📊 Weekly Summary:\n• Revenue: $12,450\n• Jobs Completed: 24\n• Customer Satisfaction: 4.8/5\n• Average Response Time: 2.3 hours\n\n🏆 Top Performer: John Smith (8 jobs)\n\n📈 Revenue is up 12% from last week!",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)),
      read: true,
    },
  ],
  "5": [
    {
      id: "m8",
      conversationId: "5",
      senderId: "emp-003",
      senderName: "Mike Williams",
      senderType: "employee",
      content: "Hey, I was wondering if I could switch shifts with Sarah on Thursday? I have a doctor's appointment in the morning.",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 50)),
      read: true,
    },
    {
      id: "m9",
      conversationId: "5",
      senderId: "admin",
      senderName: "Admin",
      senderType: "system",
      content: "Let me check with Sarah and get back to you.",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 49)),
      read: true,
    },
    {
      id: "m10",
      conversationId: "5",
      senderId: "admin",
      senderName: "Admin",
      senderType: "system",
      content: "Good news! Sarah confirmed she can switch. You're all set for Thursday.",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 48)),
      read: true,
    },
  ],
};

/**
 * Get all conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  // TODO: Replace with Firestore query
  return mockConversations.sort(
    (a, b) => b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis()
  );
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | null> {
  // TODO: Replace with Firestore query
  return mockConversations.find((c) => c.id === id) || null;
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  // TODO: Replace with Firestore query
  return mockMessages[conversationId] || [];
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  senderName: string = "Admin"
): Promise<Message> {
  const newMessage: Message = {
    id: `m${Date.now()}`,
    conversationId,
    senderId: "admin",
    senderName,
    senderType: "system",
    content,
    timestamp: Timestamp.now(),
    read: true,
  };

  // Add to mock data
  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = [];
  }
  mockMessages[conversationId].push(newMessage);

  // Update conversation's last message
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.lastMessage = content;
    conversation.lastMessageTime = newMessage.timestamp;
  }

  // TODO: Replace with Firestore addDoc
  return newMessage;
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  // Update mock data
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.unread = false;
    conversation.unreadCount = 0;
  }

  const messages = mockMessages[conversationId];
  if (messages) {
    messages.forEach((m) => {
      m.read = true;
    });
  }

  // TODO: Replace with Firestore updateDoc
}

/**
 * Get unread count
 */
export async function getUnreadCount(): Promise<number> {
  return mockConversations.filter((c) => c.unread).length;
}

/**
 * Format timestamp for display
 */
export function formatMessageTime(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format timestamp for message bubbles
 */
export function formatBubbleTime(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
