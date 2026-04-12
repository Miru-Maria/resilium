import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";
import { ProGate } from "@/components/ProGate";

const CACHE_KEY = "resilium_companion_messages_v1";
const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

type Message = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

function MessageBubble({ message, colors }: { message: Message; colors: ColorsType }) {
  const isUser = message.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }]}>
          <Feather name="cpu" size={14} color={colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary, maxWidth: "80%" }
            : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, maxWidth: "85%" },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? colors.white : colors.text },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator({ colors }: { colors: ColorsType }) {
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
      <View style={[styles.avatar, { backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }]}>
        <Feather name="cpu" size={14} color={colors.primary} />
      </View>
      <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={{ color: colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 14 }}>Thinking…</Text>
      </View>
    </View>
  );
}

function CompanionChat({ colors, insets }: { colors: ColorsType; insets: ReturnType<typeof useSafeAreaInsets> }) {
  const { getAuthHeaders } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadHistory = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`https://${DOMAIN}/api/companion/history`, { headers });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const msgs: Message[] = data.messages || [];
      setMessages(msgs);
      setIsOffline(false);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(msgs));
    } catch {
      setIsOffline(true);
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) setMessages(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (isOffline) {
      Alert.alert("You're offline", "A connection is needed to chat with your AI Companion.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");
    setSending(true);
    const userMsg: Message = { role: "user", content: text, createdAt: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`https://${DOMAIN}/api/companion/chat`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("send failed");
      const data = await res.json();
      const aiMsg: Message = data.message;
      const final = [...updated, aiMsg];
      setMessages(final);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(final));
    } catch {
      Alert.alert("Couldn't send", "Please check your connection and try again.");
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  const styles2 = useMemo(() => createStyles(colors), [colors]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {isOffline && (
        <View style={[styles2.offlineBanner, { backgroundColor: colors.warningMuted, borderColor: colors.warning }]}>
          <Feather name="wifi-off" size={13} color={colors.warning} />
          <Text style={[styles2.offlineText, { color: colors.warning }]}>Offline — showing cached messages. New messages require a connection.</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && !sending && (
          <View style={styles2.emptyState}>
            <View style={[styles2.emptyIcon, { backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }]}>
              <Feather name="cpu" size={28} color={colors.primary} />
            </View>
            <Text style={[styles2.emptyTitle, { color: colors.text }]}>Your AI Companion</Text>
            <Text style={[styles2.emptyBody, { color: colors.textSecondary }]}>
              Ask me anything about your resilience plan — resources, priorities, scenario planning, or just where to start. I know your assessment results and will give you personalized guidance.
            </Text>
            <View style={{ gap: 8, width: "100%" }}>
              {[
                "What should I focus on first?",
                "How can I improve my financial resilience?",
                "What would help me most if I lost my job?",
              ].map(prompt => (
                <Pressable
                  key={prompt}
                  style={({ pressed }) => [
                    styles2.promptChip,
                    { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }
                  ]}
                  onPress={() => { setInput(prompt); }}
                >
                  <Text style={[styles2.promptChipText, { color: colors.text }]}>{prompt}</Text>
                  <Feather name="arrow-right" size={13} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} colors={colors} />
        ))}
        {sending && <TypingIndicator colors={colors} />}
      </ScrollView>

      <View style={[styles2.inputRow, { borderColor: colors.border, backgroundColor: colors.surface, paddingBottom: insets.bottom || 12 }]}>
        <TextInput
          style={[styles2.textInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          placeholder="Ask your AI Companion…"
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable
          style={({ pressed }) => [
            styles2.sendButton,
            {
              backgroundColor: input.trim() && !sending ? colors.primary : colors.border,
              opacity: pressed ? 0.8 : 1,
            }
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Feather name="send" size={16} color={colors.white} />
          }
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function CompanionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles2 = useMemo(() => createStyles(colors), [colors]);

  return (
    <ProGate>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles2.header, { paddingTop: insets.top + 12 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles2.headerIcon, { backgroundColor: colors.primaryMuted }]}>
              <Feather name="cpu" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles2.headerTitle, { color: colors.text }]}>AI Companion</Text>
              <Text style={[styles2.headerSubtitle, { color: colors.textMuted }]}>Personalized resilience guidance</Text>
            </View>
          </View>
        </View>
        <CompanionChat colors={colors} insets={insets} />
      </View>
    </ProGate>
  );
}

function createStyles(colors: ColorsType) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 17,
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      marginTop: 1,
    },
    offlineBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    offlineText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      flex: 1,
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 8,
      paddingTop: 32,
      paddingBottom: 16,
      gap: 12,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      letterSpacing: -0.4,
    },
    emptyBody: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 22,
      textAlign: "center",
      marginBottom: 8,
    },
    promptChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    promptChipText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      flex: 1,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopWidth: 1,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      maxHeight: 120,
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    bubbleRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    bubbleRowUser: {
      justifyContent: "flex-end",
    },
    bubbleRowAssistant: {
      justifyContent: "flex-start",
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    bubble: {
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    bubbleText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 21,
    },
  });
}

const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
});
