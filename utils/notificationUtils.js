import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler (how notifications are handled when app is foregrounded)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // Or true, depending on desired behavior
  }),
});

/**
 * Requests notification permissions from the user.
 * @returns {Promise<boolean>} True if permission granted, false otherwise.
 */
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    // Alert.alert('Notification Permission', 'Failed to get push token for push notification!');
    console.log('Notification permission not granted.');
    return false;
  }

  // For Android, set notification channel (required for custom sound, etc.)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250], // Vibrate pattern
      lightColor: '#FF231F7C', // Light color for notification
    });
  }
  return true;
};

/**
 * Schedules a local notification for a topic revision.
 * @param {string} topicName The name of the topic for the notification body.
 * @param {Date} revisionDate The date and time for the notification.
 * @param {string} topicId The ID of the topic (for data payload).
 * @returns {Promise<string|null>} The notification ID if scheduled, otherwise null.
 */
export const scheduleRevisionNotification = async (topicName, revisionDate, topicId) => {
  const hasPermission = await requestNotificationPermissions(); // Ensure permissions
  if (!hasPermission) {
    console.log('Cannot schedule notification, permission denied.');
    return null;
  }

  // It's good to schedule notifications for a specific time, e.g., 9 AM on the revision day.
  // For now, let's set it for the beginning of the day (midnight) or a fixed time.
  // For more precise timing, ensure revisionDate includes time.
  // If revisionDate is just a date, let's set it for, say, 9:00 AM.
  const triggerDate = new Date(revisionDate);
  if (triggerDate.getHours() === 0 && triggerDate.getMinutes() === 0 && triggerDate.getSeconds() === 0) {
    triggerDate.setHours(9, 0, 0, 0); // Default to 9 AM if only date is provided
  }

  // If the trigger date is in the past, don't schedule
  if (triggerDate < new Date()) {
    console.log('Attempted to schedule notification in the past for:', topicName);
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Revise Topic! 🤓',
        body: `Time to revise: ${topicName}`,
        data: { topicId: topicId, type: 'revisionReminder' }, // Optional data payload
        sound: 'default', // Optional: use a custom sound file
      },
      trigger: triggerDate,
    });
    console.log(`Notification scheduled for ${topicName} on ${triggerDate}: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Cancels a scheduled local notification.
 * @param {string} notificationId The ID of the notification to cancel.
 */
export const cancelNotification = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error)
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancels all scheduled local notifications.
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled.');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

// It might be good to request permissions once when the app starts.
// For example, in App.js:
// useEffect(() => {
//   requestNotificationPermissions();
// }, []);
