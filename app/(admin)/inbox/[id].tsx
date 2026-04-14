import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import {
  getConversation,
  getMessages,
  sendMessage,
  markConversationAsRead,
  formatBubbleTime,
  Conversation,
  Message,
} from "@/src/services/messaging";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadConversation();
  }, [id]);

  const loadConversation = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [conv, msgs] = await Promise.all([
        getConversation(id),
        getMessages(id),
      ]);

      setConversation(conv);
      setMessages(msgs);

      // Mark as read
      if (conv?.unread) {
        await markConversationAsRead(id);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !id) return;

    setSending(true);
    try {
      const newMessage = await sendMessage(id, replyText.trim());
      setMessages((prev) => [...prev, newMessage]);
      setReplyText("");

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "employee":
        return "person-circle";
      case "customer":
        return "home";
      case "system":
        return "notifications";
      default:
        return "mail";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "employee":
        return "#007AFF";
      case "customer":
        return "#34C759";
      case "system":
        return "#FF9500";
      default:
        return "#666";
    }
  };

  const isFromAdmin = (message: Message) => {
    return message.senderId === "admin";
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="mail-unread-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Conversation not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isSystemMessage = conversation.participantType === "system";
  const canReply = !isSystemMessage;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={[styles.headerAvatar, { backgroundColor: getTypeColor(conversation.participantType) + "20" }]}>
              <Ionicons
                name={getTypeIcon(conversation.participantType) as any}
                size={20}
                color={getTypeColor(conversation.participantType)}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerName, { color: theme.text }]} numberOfLines={1}>
                {conversation.participantName}
              </Text>
              <Text style={[styles.headerSubject, { color: theme.textSecondary }]} numberOfLines={1}>
                {conversation.subject}
              </Text>
            </View>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {/* System Alert Banner */}
          {isSystemMessage && (
            <View style={[styles.alertBanner, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={styles.alertBannerText}>
                This is a system notification. No reply needed.
              </Text>
            </View>
          )}

          {messages.map((message) => {
            const fromAdmin = isFromAdmin(message);

            return (
              <View
                key={message.id}
                style={[
                  styles.messageBubbleContainer,
                  fromAdmin ? styles.messageBubbleContainerRight : styles.messageBubbleContainerLeft,
                ]}
              >
                {!fromAdmin && (
                  <View style={[styles.bubbleAvatar, { backgroundColor: getTypeColor(message.senderType) + "20" }]}>
                    <Ionicons
                      name={getTypeIcon(message.senderType) as any}
                      size={16}
                      color={getTypeColor(message.senderType)}
                    />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    fromAdmin
                      ? [styles.messageBubbleRight, { backgroundColor: theme.primary }]
                      : [styles.messageBubbleLeft, { backgroundColor: theme.surface }],
                  ]}
                >
                  {!fromAdmin && (
                    <Text style={[styles.bubbleSender, { color: getTypeColor(message.senderType) }]}>
                      {message.senderName}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: fromAdmin ? "#fff" : theme.text },
                    ]}
                  >
                    {message.content}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleTime,
                      { color: fromAdmin ? "rgba(255,255,255,0.7)" : theme.textMuted },
                    ]}
                  >
                    {formatBubbleTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Reply Input */}
        {canReply ? (
          <View style={[styles.replyContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <TextInput
              style={[styles.replyInput, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: replyText.trim() ? theme.primary : theme.border },
              ]}
              onPress={handleSend}
              disabled={!replyText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.noReplyContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <Ionicons name="lock-closed" size={16} color={theme.textMuted} />
            <Text style={[styles.noReplyText, { color: theme.textMuted }]}>
              System notifications cannot be replied to
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSubject: {
    fontSize: 13,
    marginTop: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
  },
  messageBubbleContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  messageBubbleContainerLeft: {
    justifyContent: "flex-start",
  },
  messageBubbleContainerRight: {
    justifyContent: "flex-end",
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    borderBottomRightRadius: 4,
  },
  bubbleSender: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  replyInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  noReplyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
  },
  noReplyText: {
    fontSize: 14,
  },
});
