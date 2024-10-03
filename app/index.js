import { View, Text, StatusBar, Platform, Button,Alert } from "react-native";
import React, { useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";


export default function Index() {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  // Request Notification Permission
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("auth status:", authStatus);
    } else {
      console.log("Notification permission not granted");
    }
  };

  // Get FCM Token
  const getToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log("FCM clound messaging Token is:", fcmToken);
        setToken(fcmToken);

        // Send this token to your server to register the device for notifications
        // await registerDeviceWithServer(fcmToken);
      } else {
        console.log("Failed to get FCM token");
      }
    } catch (error) {
      console.log("Error getting FCM token:", error);
    }
  };

  // Handle Incoming Messages (Foreground)
  const handleIncomingMessages = () => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("message arrive:", JSON.stringify(remoteMessage));
      Alert.alert(
        "New FCM Message",
        remoteMessage.notification?.title || "Notification received"
      );
      setNotification(remoteMessage.notification);
    });

    return unsubscribe; 
  };

  
  const handleBackgroundMessages = () => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });
  };

  
  const unsubcribeFn = async () => {
    try {
      await messaging().deleteToken();
      console.log("FCM token deleted, device unsubscribed");
      setToken(null);
    } catch (error) {
      console.log("Error unsubscribing from FCM:", error);
    }
  };

  useEffect(() => {
    requestUserPermission(); 
    getToken(); 

    const unsubscribeForegroundMessages = handleIncomingMessages(); 
    handleBackgroundMessages();

    // Clean up when component unmount
    return () => {
      unsubscribeForegroundMessages();
    };
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>FCM Token:</Text>
      <Text selectable>{token || "No token generated"}</Text>

      {/* {notification && (
        <View>
          <Text>Notification Title: {notification.title}</Text>
          <Text>Notification Body: {notification.body}</Text>
        </View>
      )} */}

      <Button
        title="Unsubscribe from Notifications"
        onPress={unsubcribeFn}
      />
    </View>
  );
}
