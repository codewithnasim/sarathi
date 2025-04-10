import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = ({ navigation }) => {
  const settings = [
    { title: "Profile", screen: "DriverProfile", icon: "person-outline" },
    { title: "Notifications", screen: "DriverNotificationScreen", icon: "notifications-outline" },
    { title: "Privacy", screen: "DriverPrivacyPolicy", icon: "lock-closed-outline" },
    { title: "Payment Methods", screen: "DriverPayment", icon: "card-outline" },
    { title: "Help & Support", screen: "DriverHelpSupport", icon: "help-circle-outline" },
    { title: "Manage My Session", screen: "DriverSessionManagement", icon: "time-outline" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require("./pic/d.png")} style={styles.profileImage} />
      <Text style={styles.header}>⚙️ Settings</Text>

      {settings.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            item.title === "Manage My Session" && styles.sessionButton,
          ]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>{item.title}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#007bff",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    marginVertical: 8,
    borderRadius: 14,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 4,
  },
  sessionButton: {
    backgroundColor: "#28a745", // Green for session management
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#d9534f",
    marginVertical: 20,
    borderRadius: 14,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 4,
  },
  buttonText: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  icon: {
    marginRight: 12,
  },
});

export default SettingsScreen;
