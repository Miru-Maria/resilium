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
import { guides, Guide } from "@/data/guides";

type Segment = "companion" | "guides";

const CACHE_KEY = "resilium_companion_messages_v1";
const SAVED_KEY = "resilium_saved_guides_v1";
const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

type Message = { role: "user" | "assistant"; content: string; createdAt: string };
type FilterType = "all" | "essential" | "saved";

function SituationBadge({ situation, colors }: { situation: string; colors: ColorsType }) {
  const badgeColor: Record<string, string> = {
    "Economic Disruption": colors.warning,
    "Natural Disaster": colors.danger,
    "Infrastructure Failure": "#6366F1",
    "Security": "#8B5CF6",
    "Health": colors.success,
    "General Emergency": colors.primary,
  };
  const bg = badgeColor[situation] || colors.primary;
  return (
    <View style={{ backgroundColor: bg + "20", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: bg }}>{situation}</Text>
    </View>
  );
}

function GuideCard({ guide, saved, onToggleSave, colors }: { guide: Guide; saved: boolean; onToggleSave: (id: string) => void; colors: ColorsType }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const styles2 = useMemo(() => createGuideStyles(colors), [colors]);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(e => !e);
    if (expanded) setExpandedSection(null);
  };

  return (
    <View style={[styles2.card, { borderColor: colors.border }]}>
      <Pressable onPress={toggle} style={styles2.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <SituationBadge situation={guide.situation} colors={colors} />
            {guide.essential && (
              <View style={{ backgroundColor: colors.primaryMuted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: colors.primary }}>Essential</Text>
              </View>
            )}
          </View>
          <Text style={[styles2.cardTitle, { color: colors.text }]}>{guide.title}</Text>
          {!expanded && (
            <Text style={[styles2.cardSummary, { color: colors.textSecondary }]} numberOfLines={2}>{guide.summary}</Text>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggleSave(guide.id); }} hitSlop={12}>
            <Feather name="bookmark" size={17} color={saved ? colors.primary : colors.textMuted} />
          </Pressable>
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
        </View>
      </Pressable>
      {expanded && (
        <View style={styles2.cardBody}>
          <Text style={[styles2.summaryText, { color: colors.textSecondary }]}>{guide.summary}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name="clock" size={12} color={colors.textMuted} />
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted }}>{guide.readingTime} read</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name="wifi-off" size={12} color={colors.success} />
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.success }}>Always available offline</Text>
            </View>
          </View>
          {guide.sections.map((section, idx) => (
            <View key={idx} style={[styles2.sectionItem, { borderColor: colors.borderLight }]}>
              <Pressable style={styles2.sectionHeader} onPress={() => setExpandedSection(expandedSection === idx ? null : idx)}>
                <Text style={[styles2.sectionTitle, { color: colors.text }]}>{section.heading}</Text>
                <Feather name={expandedSection === idx ? "chevron-up" : "chevron-down"} size={15} color={colors.textMuted} />
              </Pressable>
              {expandedSection === idx && (
                <Text style={[styles2.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
              )}
            </View>
          ))}
          <View style={[styles2.offlineNote, { backgroundColor: colors.successMuted, borderColor: colors.success + "40" }]}>
            <Feather name="download" size={13} color={colors.success} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.success, flex: 1 }}>
              Bundled with the app — available offline at all times.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function GuidesPanel({ colors, insets }: { colors: ColorsType; insets: ReturnType<typeof useSafeAreaInsets> }) {
  const styles2 = useMemo(() => createGuideStyles(colors), [colors]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then(v => { if (v) setSavedIds(JSON.parse(v)); });
  }, []);

  const toggleSave = async (id: string) => {
    const updated = savedIds.includes(id) ? savedIds.filter(s => s !== id) : [...savedIds, id];
    setSavedIds(updated);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const filteredGuides = useMemo(() => {
    if (filter === "essential") return guides.filter(g => g.essential);
    if (filter === "saved") return guides.filter(g => savedIds.includes(g.id));
    return guides;
  }, [filter, savedIds]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles2.filterRow, { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        {(["all", "essential", "saved"] as FilterType[]).map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles2.filterBtn, { backgroundColor: filter === f ? colors.primary : colors.surface, borderColor: filter === f ? colors.primary : colors.border }]}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: filter === f ? colors.white : colors.textMuted, textTransform: "capitalize" }}>
              {f === "saved" ? "Saved" : f === "essential" ? "Essential" : "All"}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
        {filteredGuides.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 40, gap: 10 }}>
            <Feather name="bookmark" size={32} color={colors.textMuted} />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.textSecondary }}>
              {filter === "saved" ? "No saved guides yet" : "No guides found"}
            </Text>
            {filter === "saved" && (
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted, textAlign: "center" }}>
                Tap the bookmark icon on any guide to save it for quick access.
              </Text>
            )}
          </View>
        )}
        {filteredGuides.map(guide => (
          <GuideCard key={guide.id} guide={guide} saved={savedIds.includes(guide.id)} onToggleSave={toggleSave} colors={colors} />
        ))}
      </ScrollView>
    </View>
  );
}

function MessageBubble({ message, colors }: { message: Message; colors: ColorsType }) {
  const isUser = message.role === "user";
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-end", gap: 8 }, isUser ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
      {!isUser && (
        <View style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }}>
          <Feather name="cpu" size={14} color={colors.primary} />
        </View>
      )}
      <View style={[{ borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 }, isUser ? { backgroundColor: colors.primary, maxWidth: "80%" } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, maxWidth: "85%" }]}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: isUser ? colors.white : colors.text }}>{message.content}</Text>
      </View>
    </View>
  );
}

function CompanionPanel({ colors, insets }: { colors: ColorsType; insets: ReturnType<typeof useSafeAreaInsets> }) {
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
      try { const cached = await AsyncStorage.getItem(CACHE_KEY); if (cached) setMessages(JSON.parse(cached)); } catch {}
    } finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { if (messages.length > 0) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (isOffline) { Alert.alert("You're offline", "A connection is needed to chat with your AI Companion."); return; }
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
      const final = [...updated, data.message as Message];
      setMessages(final);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(final));
    } catch {
      Alert.alert("Couldn't send", "Please check your connection and try again.");
      setMessages(messages);
    } finally { setSending(false); }
  };

  if (loading) return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );

  return (
    <ProGate>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {isOffline && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, backgroundColor: colors.warningMuted, borderColor: colors.warning }}>
            <Feather name="wifi-off" size={13} color={colors.warning} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, flex: 1, color: colors.warning }}>Offline — showing cached messages.</Text>
          </View>
        )}
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 12 }} keyboardShouldPersistTaps="handled">
          {messages.length === 0 && !sending && (
            <View style={{ alignItems: "center", paddingHorizontal: 8, paddingTop: 32, paddingBottom: 16, gap: 12 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 4, backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }}>
                <Feather name="cpu" size={28} color={colors.primary} />
              </View>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: -0.4, color: colors.text }}>Your AI Companion</Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22, textAlign: "center", marginBottom: 8, color: colors.textSecondary }}>
                Ask me anything about your resilience plan — resources, priorities, scenario planning, or just where to start.
              </Text>
              <View style={{ gap: 8, width: "100%" }}>
                {["What should I focus on first?", "How can I improve my financial resilience?", "What would help me most if I lost my job?"].map(prompt => (
                  <Pressable key={prompt} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]} onPress={() => setInput(prompt)}>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, color: colors.text }}>{prompt}</Text>
                    <Feather name="arrow-right" size={13} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {messages.map((m, i) => <MessageBubble key={i} message={m} colors={colors} />)}
          {sending && (
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder }}>
                <Feather name="cpu" size={14} color={colors.primary} />
              </View>
              <View style={{ borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
                <Text style={{ color: colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 14 }}>Thinking…</Text>
              </View>
            </View>
          )}
        </ScrollView>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingBottom: insets.bottom || 12 }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Inter_400Regular", fontSize: 14, maxHeight: 120, color: colors.text, backgroundColor: colors.background, borderColor: colors.border }}
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
            style={({ pressed }) => [{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: input.trim() && !sending ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 }]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Feather name="send" size={16} color={colors.white} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ProGate>
  );
}

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<Segment>("companion");

  const segments: Array<{ key: Segment; label: string; icon: string }> = [
    { key: "companion", label: "AI Companion", icon: "cpu" },
    { key: "guides", label: "Crisis Guides", icon: "book-open" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryMuted }}>
            <Feather name={segment === "companion" ? "cpu" : "book-open"} size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 17, letterSpacing: -0.3, color: colors.text }}>
              {segment === "companion" ? "AI Companion" : "Crisis Guides"}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1, color: colors.textMuted }}>
              {segment === "companion" ? "Personalized resilience guidance" : "All guides available offline"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", backgroundColor: colors.background, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: colors.border }}>
          {segments.map(seg => (
            <Pressable
              key={seg.key}
              onPress={() => { Haptics.selectionAsync(); setSegment(seg.key); }}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 8, backgroundColor: segment === seg.key ? colors.primary : "transparent" }}
            >
              <Feather name={seg.icon as any} size={13} color={segment === seg.key ? colors.white : colors.textMuted} />
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: segment === seg.key ? colors.white : colors.textMuted }}>
                {seg.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {segment === "companion" ? (
        <CompanionPanel colors={colors} insets={insets} />
      ) : (
        <GuidesPanel colors={colors} insets={insets} />
      )}
    </View>
  );
}

function createGuideStyles(colors: ColorsType) {
  return StyleSheet.create({
    filterRow: { flexDirection: "row", gap: 8 },
    filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
    cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 },
    cardTitle: { fontFamily: "Inter_700Bold", fontSize: 15, letterSpacing: -0.3, marginBottom: 4 },
    cardSummary: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
    cardBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 4 },
    summaryText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, marginBottom: 4 },
    sectionItem: { borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 6 },
    sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1, marginRight: 8 },
    sectionContent: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, paddingBottom: 6 },
    offlineNote: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, padding: 10, borderRadius: 10, borderWidth: 1 },
  });
}
