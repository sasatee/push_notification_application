import { View, Text, StatusBar, Platform, Button,Alert } from "react-native";
import React, { useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";


export default function Index() {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  console.log("message save in USESTATE HOOK: ",notification)

  // Request Notification Permission
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      //console.log("auth status:", authStatus);
    } else {
      console.log("auth permission not granted");
    }
  };

  // Get FCM Token
  const getToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log("FCM Token:", fcmToken);
        setToken(fcmToken);

        // Send this token to your server to register the device for notifications
        // await registerDeviceWithServer(fcmToken);
      } else {
        console.log("Failed to get  token");
      }
    } catch (error) {
      console.log("Error token:", error);
    }
  };

  // Handle Incoming Messages (Foreground)
  const handleIncomingMessages = () => {
    const unsubscribe = messaging().onMessage(async (msg) => {
      
      Alert.alert(
       msg?.data?.title,
       msg?.data?.message
      );
      setNotification(msg?.data);
    });

    return unsubscribe; 
  };

  
  const handleBackgroundMessages = () => {
    messaging().setBackgroundMessageHandler(async (msg) => {
      console.log("Message handled in the background!", msg);
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

    // Clean up when component unmount/unsubscribe
    return () => {
      unsubscribeForegroundMessages();
    };
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>FCM Token:</Text>
      <Text selectable>{token || "No token generated"}</Text>

      {notification && (
        <View>
          <Text>Notification Title: {notification.title}</Text>
          <Text>Notification Body: {notification.message}</Text>
        </View>
      )}

      <Button
        title="Unmounted/unSubcribe"
        onPress={unsubcribeFn}
      />
    </View>
  );
}
