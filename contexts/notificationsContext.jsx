import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
  } from "react";
  import * as Notifications from "expo-notifications";
  import { registerForPushNotificationsAsync } from "../utils/registerForPushNotificationsAsync";
  import { saveUserPushToken } from "../services/notificationService";
  import { useAuth } from "../hooks/useAuth";
  
  const NotificationContext = createContext(undefined);
  
  export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
      throw new Error(
        "useNotification must be used within a NotificationProvider"
      );
    }
    return context;
  };
  
  export const NotificationProvider = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState(null);
    const [notification, setNotification] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();
  
    const notificationListener = useRef();
    const responseListener = useRef();
  
    // Register for push notifications on mount
    useEffect(() => {
      registerForPushNotificationsAsync().then(
        (token) => {
          setExpoPushToken(token);
        },
        (error) => setError(error)
      );
  
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("🔔 Notification Received: ", notification);
          setNotification(notification);
        });
  
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(
            "🔔 Notification Response: ",
            JSON.stringify(response, null, 2),
            JSON.stringify(response.notification.request.content.data, null, 2)
          );
          // Handle the notification response here
        });
  
        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
          };
    }, []);

    // Save push token to Firestore when user logs in or token changes
    useEffect(() => {
      if (user?.uid && expoPushToken) {
        saveUserPushToken(user.uid, expoPushToken).catch((err) => {
          console.error("Failed to save push token:", err);
        });
      }
    }, [user?.uid, expoPushToken]);
  
    return (
      <NotificationContext.Provider
        value={{ expoPushToken, notification, error }}
      >
        {children}
      </NotificationContext.Provider>
    );
  };