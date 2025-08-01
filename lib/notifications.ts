import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static sentNotifications = new Set<string>();
  private static currentDeviceId: string | null = null;

  static async registerForPushNotificationsAsync() {
    let token;

    try {
      if (Platform.OS === "android") {
        console.log("Setting up Android notification channel...");
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          description: "Default notification channel",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
        });
        console.log("Android notification channel created successfully");
      }
    } catch (error) {
      console.error("Error setting up notification channel:", error);
    }

    if (Device.isDevice) {
      try {
        console.log("Checking notification permissions...");
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        console.log("Current permission status:", existingStatus);

        if (existingStatus !== "granted") {
          console.log("Requesting notification permissions...");
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          console.log("Permission request result:", status);
        }

        if (finalStatus !== "granted") {
          console.log("Failed to get push token for push notification!");
          console.log("Permission status:", finalStatus);
          return;
        }

        console.log("Notification permissions granted");
      } catch (error) {
        console.error("Error checking/requesting permissions:", error);
        return;
      }

      try {
        console.log("Getting Expo push token...");
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: "8777e47b-3e3a-45af-9682-9c9b40cd8b8b",
          })
        ).data;
        console.log("Push token generated successfully");
      } catch (error) {
        console.error("Error getting push token:", error);
        return;
      }

      // Store device ID for filtering
      this.currentDeviceId =
        Device.osInternalBuildId || Device.deviceName || "unknown";
      console.log("Push token:", token);
      console.log("Device ID:", this.currentDeviceId);
      console.log("Device details:", {
        osInternalBuildId: Device.osInternalBuildId,
        deviceName: Device.deviceName,
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
      });
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  static getCurrentDeviceId(): string | null {
    return this.currentDeviceId;
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any
  ) {
    // Create a unique key for this notification to prevent duplicates
    const notificationKey = `${title}-${body}-${JSON.stringify(data)}`;

    // Check if we've already sent this notification recently
    if (this.sentNotifications.has(notificationKey)) {
      console.log("Skipping duplicate notification:", title);
      return;
    }

    // Add to sent notifications set
    this.sentNotifications.add(notificationKey);

    // Remove from set after 5 seconds to allow future notifications
    setTimeout(() => {
      this.sentNotifications.delete(notificationKey);
    }, 5000);

    console.log("Sending push notification:", title);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
      console.log("Notification scheduled successfully");
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getBadgeCountAsync() {
    return await Notifications.getBadgeCountAsync();
  }

  static async setBadgeCountAsync(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }
}
