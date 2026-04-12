import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import { useColors } from "@/context/theme";
import { ColorsType } from "@/constants/colors";
import { guides, Guide } from "@/data/guides";

const SAVED_KEY = "resilium_saved_guides_v1";

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

function GuideCard({
  guide,
  saved,
  onToggleSave,
  colors,
}: {
  guide: Guide;
  saved: boolean;
  onToggleSave: (id: string) => void;
  colors: ColorsType;
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(e => !e);
    if (expanded) setExpandedSection(null);
  };

  const styles2 = useMemo(() => createStyles(colors), [colors]);

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
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggleSave(guide.id); }}
            hitSlop={12}
          >
            <Feather
              name={saved ? "bookmark" : "bookmark"}
              size={17}
              color={saved ? colors.primary : colors.textMuted}
            />
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
              <Pressable
                style={styles2.sectionHeader}
                onPress={() => setExpandedSection(expandedSection === idx ? null : idx)}
              >
                <Text style={[styles2.sectionTitle, { color: colors.text }]}>{section.heading}</Text>
                <Feather
                  name={expandedSection === idx ? "chevron-up" : "chevron-down"}
                  size={15}
                  color={colors.textMuted}
                />
              </Pressable>
              {expandedSection === idx && (
                <Text style={[styles2.sectionContent, { color: colors.textSecondary }]}>{section.content}</Text>
              )}
            </View>
          ))}
          <View style={[styles2.offlineNote, { backgroundColor: colors.successMuted, borderColor: colors.success + "40" }]}>
            <Feather name="download" size={13} color={colors.success} />
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.success, flex: 1 }}>
              This guide is bundled with the app and available at all times — no internet connection needed.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function GuidesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles2 = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then(v => {
      if (v) setSavedIds(JSON.parse(v));
    });
  }, []);

  const toggleSave = async (id: string) => {
    const updated = savedIds.includes(id)
      ? savedIds.filter(s => s !== id)
      : [...savedIds, id];
    setSavedIds(updated);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const filteredGuides = useMemo(() => {
    if (filter === "essential") return guides.filter(g => g.essential);
    if (filter === "saved") return guides.filter(g => savedIds.includes(g.id));
    return guides;
  }, [filter, savedIds]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles2.header, { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[styles2.headerIcon, { backgroundColor: colors.primaryMuted }]}>
            <Feather name="book-open" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles2.headerTitle, { color: colors.text }]}>Crisis Guides</Text>
            <Text style={[styles2.headerSubtitle, { color: colors.textMuted }]}>All guides available offline</Text>
          </View>
        </View>
        <View style={styles2.filterRow}>
          {(["all", "essential", "saved"] as FilterType[]).map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles2.filterBtn,
                {
                  backgroundColor: filter === f ? colors.primary : colors.surface,
                  borderColor: filter === f ? colors.primary : colors.border,
                }
              ]}
            >
              <Text style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: filter === f ? colors.white : colors.textMuted,
                textTransform: "capitalize",
              }}>
                {f === "saved" ? "Saved" : f === "essential" ? "Essential" : "All"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}
      >
        {filteredGuides.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 40, gap: 10 }}>
            <Feather name="bookmark" size={32} color={colors.textMuted} />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.textSecondary }}>
              {filter === "saved" ? "No saved guides yet" : "No guides found"}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textMuted, textAlign: "center" }}>
              {filter === "saved" ? "Tap the bookmark icon on any guide to save it for quick access." : ""}
            </Text>
          </View>
        )}
        {filteredGuides.map(guide => (
          <GuideCard
            key={guide.id}
            guide={guide}
            saved={savedIds.includes(guide.id)}
            onToggleSave={toggleSave}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
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
      gap: 12,
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
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 16,
    },
    cardTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    cardSummary: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 20,
    },
    cardBody: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 4,
    },
    summaryText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 4,
    },
    sectionItem: {
      borderTopWidth: 1,
      paddingTop: 10,
      marginTop: 4,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 6,
    },
    sectionTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      flex: 1,
      marginRight: 8,
    },
    sectionContent: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 20,
      paddingBottom: 6,
    },
    offlineNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 10,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
    },
  });
}
