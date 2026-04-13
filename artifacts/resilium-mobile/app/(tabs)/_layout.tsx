import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/context/theme";

function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <Feather name={name as any} size={size} color={color} />;
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "android" ? 6 : 0,
          paddingTop: 6,
          height: 56 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="trending-up" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="clipboard" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check-in",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="check-circle" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="layers" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-data"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="user" color={color} size={size - 2} />
          ),
        }}
      />
      <Tabs.Screen name="companion" options={{ href: null }} />
      <Tabs.Screen name="guides" options={{ href: null }} />
    </Tabs>
  );
}
