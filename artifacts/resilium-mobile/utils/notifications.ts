import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const MONTHLY_NOTIFICATION_ID = "resilium_monthly_checkin";
const SCHEDULED_KEY = "resilium_notification_scheduled";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  if (existing === "denied") return false;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return tokenData.data;
  } catch {
    return null;
  }
}

export async function scheduleMonthlyCheckin(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    // Cancel any existing monthly notification first
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier === MONTHLY_NOTIFICATION_ID) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // Schedule a notification 30 days from now
    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + 30);

    await Notifications.scheduleNotificationAsync({
      identifier: MONTHLY_NOTIFICATION_ID,
      content: {
        title: "Time to reassess your resilience",
        body: "It's been 30 days. A lot can change. Check your readiness score and update your plan.",
        data: { type: "monthly_checkin" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  } catch (err) {
    console.warn("Failed to schedule monthly check-in:", err);
  }
}

export async function registerPushTokenWithBackend(token: string, domain: string, authHeaders: Record<string, string> = {}): Promise<void> {
  try {
    await fetch(`https://${domain}/api/push-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch {
    // Non-critical — don't throw
  }
}

export async function setupNotifications(domain: string, authHeaders: Record<string, string> = {}): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await scheduleMonthlyCheckin();

  const token = await getExpoPushToken();
  if (token && domain) {
    await registerPushTokenWithBackend(token, domain, authHeaders);
  }
}
