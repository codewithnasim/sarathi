import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const BASE_URL = "https://sarathi-backend-file.onrender.com/api/";

const AdminSettings = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    biometricAuth: false,
    autoApprove: false,
  });
  const [admin, setAdmin] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    fetchAdminData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchAdminData = async () => {
    try {
      const adminEmail = await AsyncStorage.getItem("adminEmail");
      if (!adminEmail) {
        Alert.alert("Error", "Admin email not found. Please log in again.");
        navigation.replace("AdminLogin");
        return;
      }
      const response = await axios.get(
        `${BASE_URL}/api/admin/details?email=${adminEmail}`
      );
      setAdmin(response.data);
    } catch (error) {
      console.error("Error fetching admin details:", error);
      Alert.alert("Error", "Failed to fetch admin details.");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("adminToken");
          navigation.replace("AdminLogin");
        },
      },
    ]);
  };

  const toggleSetting = (setting) => {
    setSettings({ ...settings, [setting]: !settings[setting] });
  };

  return (
    <LinearGradient
      colors={
        settings.darkMode ? ["#121212", "#1E1E1E"] : ["#f5f7fa", "#e4e8f0"]
      }
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={settings.darkMode ? "#fff" : "#004D40"}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              { color: settings.darkMode ? "#fff" : "#004D40" },
            ]}
          >
            Settings
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={[styles.profileCard, settings.darkMode && styles.darkCard]}
        >
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                settings.darkMode && { color: "#fff" },
              ]}
            >
              {admin?.name || "Admin"}
            </Text>
            <Text
              style={[
                styles.profileEmail,
                settings.darkMode && { color: "#aaa" },
              ]}
            >
              {admin?.email || "admin@example.com"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              settings.darkMode && { color: "#fff" },
            ]}
          >
            App Settings
          </Text>

          <SettingItem
            icon="moon"
            name="Dark Mode"
            value={settings.darkMode}
            onToggle={() => toggleSetting("darkMode")}
            darkMode={settings.darkMode}
          />

          <SettingItem
            icon="notifications"
            name="Notifications"
            value={settings.notifications}
            onToggle={() => toggleSetting("notifications")}
            darkMode={settings.darkMode}
          />

          <SettingItem
            icon="finger-print"
            name="Biometric Authentication"
            value={settings.biometricAuth}
            onToggle={() => toggleSetting("biometricAuth")}
            darkMode={settings.darkMode}
          />
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              settings.darkMode && { color: "#fff" },
            ]}
          >
            Admin Preferences
          </Text>

          <SettingItem
            icon="checkmark-circle"
            name="Auto Approve Drivers"
            value={settings.autoApprove}
            onToggle={() => toggleSetting("autoApprove")}
            darkMode={settings.darkMode}
          />
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              settings.darkMode && { color: "#fff" },
            ]}
          >
            Account
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, settings.darkMode && styles.darkMenuItem]}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <Ionicons
              name="key"
              size={20}
              color={settings.darkMode ? "#4CAF50" : "#004D40"}
            />
            <Text
              style={[styles.menuText, settings.darkMode && { color: "#fff" }]}
            >
              Change Password
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={settings.darkMode ? "#666" : "#999"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, settings.darkMode && styles.darkMenuItem]}
            onPress={() => navigation.navigate("HelpCenter")}
          >
            <Ionicons
              name="help-circle"
              size={20}
              color={settings.darkMode ? "#4CAF50" : "#004D40"}
            />
            <Text
              style={[styles.menuText, settings.darkMode && { color: "#fff" }]}
            >
              Help Center
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={settings.darkMode ? "#666" : "#999"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            settings.darkMode && { backgroundColor: "#333" },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const SettingItem = ({ icon, name, value, onToggle, darkMode }) => (
  <View style={[styles.menuItem, darkMode && styles.darkMenuItem]}>
    <View style={styles.menuLeft}>
      <Ionicons
        name={icon}
        size={20}
        color={darkMode ? "#4CAF50" : "#004D40"}
      />
      <Text style={[styles.menuText, darkMode && { color: "#fff" }]}>
        {name}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      thumbColor={value ? "#fff" : "#f4f3f4"}
      trackColor={{ false: "#767577", true: darkMode ? "#4CAF50" : "#004D40" }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#1E1E1E",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#004D40",
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#004D40",
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkMenuItem: {
    backgroundColor: "#1E1E1E",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AdminSettings;
