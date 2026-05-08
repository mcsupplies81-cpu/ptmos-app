import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Protocol } from '@/stores/protocolStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = 'dose-reminders';

type DoseReminderProtocol = Pick<Protocol, 'id' | 'name' | 'dose_amount' | 'dose_unit' | 'time_of_day' | 'status'>;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Dose reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestPermission(): Promise<boolean> {
  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function parseTimeOfDay(timeOfDay: string): { hour: number; minute: number } | null {
  const [hourText, minuteText] = timeOfDay.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

export async function scheduleDoseReminders(protocols: DoseReminderProtocol[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestPermission();
  if (!hasPermission) return;

  const activeProtocols = protocols.filter((protocol) => protocol.status === 'active');

  for (const protocol of activeProtocols) {
    const reminderTime = parseTimeOfDay(protocol.time_of_day);
    if (!reminderTime) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `dose-reminder-${protocol.id}`,
      content: {
        title: 'Dose reminder',
        body: `Time for ${protocol.name} — ${protocol.dose_amount}${protocol.dose_unit}`,
        data: { protocolId: protocol.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminderTime.hour,
        minute: reminderTime.minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
