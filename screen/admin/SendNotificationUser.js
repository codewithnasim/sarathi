import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { useRoute } from "@react-navigation/native";

const SendNotificationUser = () => {
  const route = useRoute();
  const { name, email } = route.params || {}; // Get user details safely

  const [notificationText, setNotificationText] = useState("");

  // Send Notification Function
  const sendNotification = async () => {
    if (!notificationText.trim()) {
      Alert.alert("⚠️ Error", "Please enter a message before sending.");
      return;
    }

    if (!email) {
      Alert.alert("⚠️ Error", "User email is missing.");
      return;
    }

    const notificationData = {
      recipientEmail: email.toLowerCase(),
      senderName: "Admin",
      senderEmail: "admin@example.com",
      message: notificationText,
    };

    try {
      const response = await fetch(
        "https://sarathi-backend-file.onrender.com/api/notifications/sendnotifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Success", "Notification sent successfully.");
        setNotificationText("");
      } else {
        throw new Error(data.error || "Failed to send notification.");
      }
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📢 Send Notification</Text>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <Text style={styles.userName}>👤 {name || "Unknown User"}</Text>
        <Text style={styles.userEmail}>📧 {email || "No Email Provided"}</Text>
      </View>

      {/* Notification Input */}
      <TextInput
        style={styles.input}
        placeholder="Type your message here..."
        placeholderTextColor="#aaa"
        value={notificationText}
        onChangeText={setNotificationText}
        multiline
      />

      {/* Send Button */}
      <TouchableOpacity style={styles.button} onPress={sendNotification}>
        <Text style={styles.buttonText}>📩 Send Notification</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#004D40", // Dark Theme
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  userCard: {
    width: "90%",
    backgroundColor: "#292D3E",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3C3F58",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D4FF",
  },
  userEmail: {
    fontSize: 16,
    color: "#CCCCCC",
    marginTop: 5,
  },
  input: {
    width: "90%",
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#2C2F40",
    fontSize: 16,
    color: "#fff",
    borderColor: "#555",
    textAlignVertical: "top",
    height: 100,
  },
  button: {
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SendNotificationUser;
