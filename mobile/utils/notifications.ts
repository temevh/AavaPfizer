import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push notification permissions!');
    return false;
  }
  
  return true;
}

// Schedule a test notification
export async function scheduleTestNotification() {
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification 📬",
      body: 'This is a test push notification from your migraine tracker!',
      data: { type: 'test' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

// Schedule an immediate notification
export async function sendImmediateNotification(title: string, body: string) {
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'immediate' },
    },
    trigger: null, // null trigger means immediate
  });
}
