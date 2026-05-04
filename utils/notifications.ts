import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes, type DailyTriggerInput, type WeeklyTriggerInput } from 'expo-notifications';

type ProtocolReminder = {
  id: string;
  name: string;
  time_of_day: string;
  frequency: string;
};

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const response = await Notifications.requestPermissionsAsync();
    return response.granted;
  } catch {
    return false;
  }
}

export async function scheduleProtocolReminder(protocol: ProtocolReminder): Promise<void> {
  try {
    const identifier = `protocol-${protocol.id}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);

    const [hourStr = '9', minuteStr = '0'] = protocol.time_of_day.split(':');
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (protocol.frequency !== 'Daily' && protocol.frequency !== 'Weekly') {
      return;
    }

    const trigger: DailyTriggerInput | WeeklyTriggerInput = protocol.frequency === 'Daily'
      ? { type: SchedulableTriggerInputTypes.DAILY, hour, minute }
      : { type: SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour, minute };

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'PT-OS Reminder',
        body: `Time for your ${protocol.name} dose`,
        data: { protocolId: protocol.id },
      },
      trigger,
    });
  } catch {
    // no-op
  }
}

export async function cancelProtocolReminder(protocolId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`protocol-${protocolId}`);
  } catch {
    // no-op
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // no-op
  }
}
