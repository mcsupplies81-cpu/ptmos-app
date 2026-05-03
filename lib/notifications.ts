import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleProtocolReminders(
  protocols: Array<{ id: string; name: string; dose_amount: number; dose_unit: string; time_of_day: string; status: string }>,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const active = protocols.filter((p) => p.status === 'active');

  for (const protocol of active) {
    const [hour, minute] = protocol.time_of_day.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your dose 💉',
        body: `${protocol.name} — ${protocol.dose_amount}${protocol.dose_unit}`,
        data: { protocolId: protocol.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
