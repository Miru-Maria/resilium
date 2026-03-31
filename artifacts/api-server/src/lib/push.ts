import { db, usersTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { logger } from "./logger.js";

interface PushMessage {
  to: string;
  sound?: "default";
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

export async function sendPushNotificationsToUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (userIds.length === 0) return;

  const rows = await db
    .select({ id: usersTable.id, pushToken: usersTable.pushToken })
    .from(usersTable)
    .where(inArray(usersTable.id, userIds));

  const messages: PushMessage[] = rows
    .filter(r => r.pushToken && r.pushToken.startsWith("ExponentPushToken["))
    .map(r => ({
      to: r.pushToken as string,
      sound: "default",
      title,
      body,
      ...(data ? { data } : {}),
    }));

  if (messages.length === 0) {
    logger.info({ userCount: userIds.length }, "No valid push tokens found for users");
    return;
  }

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      logger.error({ status: res.status }, "Expo push API returned non-OK status");
      return;
    }

    const result = await res.json() as { data: ExpoPushTicket[] };
    const errors = result.data?.filter(t => t.status === "error") ?? [];
    if (errors.length > 0) {
      logger.warn({ errors }, "Some push notifications failed");
    }
    logger.info({ sent: messages.length, errors: errors.length }, "Push notifications sent");
  } catch (err) {
    logger.error({ err }, "Failed to send push notifications");
  }
}
