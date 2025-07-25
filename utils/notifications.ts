import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface ReminderData {
  id: string;
  title: string;
  body: string;
  date: Date;
  noteId: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissions non accordées pour les notifications');
        return false;
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return true;
    }
    
    return false;
  }

  static async scheduleReminder(reminder: ReminderData): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permissions de notification non accordées');
    }

    const trigger = reminder.date;
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { noteId: reminder.noteId, reminderId: reminder.id },
      },
      trigger,
    });

    return notificationId;
  }

  static async scheduleRepeatingReminder(reminder: ReminderData): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permissions de notification non accordées');
    }

    let trigger: any;

    switch (reminder.repeat) {
      case 'daily':
        trigger = {
          hour: reminder.date.getHours(),
          minute: reminder.date.getMinutes(),
          repeats: true,
        };
        break;
      case 'weekly':
        trigger = {
          hour: reminder.date.getHours(),
          minute: reminder.date.getMinutes(),
          weekday: reminder.date.getDay(),
          repeats: true,
        };
        break;
      case 'monthly':
        trigger = {
          hour: reminder.date.getHours(),
          minute: reminder.date.getMinutes(),
          day: reminder.date.getDate(),
          repeats: true,
        };
        break;
      default:
        trigger = reminder.date;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { noteId: reminder.noteId, reminderId: reminder.id },
      },
      trigger,
    });

    return notificationId;
  }

  static async cancelReminder(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  static addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default NotificationService; 