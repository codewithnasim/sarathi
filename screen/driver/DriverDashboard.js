import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { DrawerActions } from "@react-navigation/native";
import {
  AntDesign,
  FontAwesome,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { API_URL } from "../../config.js";

const { width, height } = Dimensions.get("window");
const BASE_URL = `${API_URL}`;

const DriverDashboard = ({ navigation }) => {
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [email, setEmail] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [darkMode, setDarkMode] = useState(false);

  // Theme colors
  const colors = {
    light: {
      background: "#F5F5F5",
      card: "#FFFFFF",
      text: "#2A2A2A",
      primary: "#00AA55",
      secondary: "#FF6B6B",
      border: "#E0E0E0",
    },
    dark: {
      background: "#121212",
      card: "#1E1E1E",
      text: "#FFFFFF",
      primary: "#00CC66",
      secondary: "#FF5252",
      border: "#333333",
    },
  };

  const theme = darkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchDriverDetails();
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("driverTheme");
      if (savedTheme) {
        setDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const saveThemePreference = async (value) => {
    try {
      await AsyncStorage.setItem("driverTheme", value ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveThemePreference(newMode);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  useEffect(() => {
    if (isOnline) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isOnline]);

  const fetchDriverDetails = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (!storedEmail) {
        Alert.alert("Error", "No email found.");
        setLoading(false);
        return;
      }
      setEmail(storedEmail);
      const response = await fetch(`${BASE_URL}/drivers/email/${storedEmail}`);
      const data = await response.json();
      if (response.ok) {
        setDriver(data);
        setIsOnline(data.isOnline || false);
      } else {
        Alert.alert("Error", "Failed to fetch driver details.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location access is required to go online."
      );
      return false;
    }
    return true;
  };

  const updateDriverLocation = async () => {
    try {
      if (!email) return;

      // Check and request location permissions first
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission not granted");
      }

      // Check if location services are enabled
      let serviceStatus = await Location.hasServicesEnabledAsync();
      if (!serviceStatus) {
        throw new Error("Location services are disabled");
      }

      // Try to get current location with a timeout
      let location = await Location.getCurrentPositionAsync({
        timeout: 5000, // 5 seconds timeout
        maximumAge: 10000, // Accept cached location up to 10 seconds old
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setLocation(location.coords);

      await fetch(`${BASE_URL}/driver-location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, latitude, longitude }),
      });
    } catch (error) {
      console.error("Error updating location:", error);

      // More specific error handling
      if (error.message.includes("Location permission not granted")) {
        Alert.alert(
          "Location Permission",
          "Please grant location permission to update your location.",
          [{ text: "OK" }]
        );
      } else if (error.message.includes("Location services are disabled")) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Location Error",
          "Unable to get current location. Please check your device settings.",
          [{ text: "OK" }]
        );
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isOnline) {
      updateDriverLocation();
      interval = setInterval(updateDriverLocation, 5000);
    }
    return () => clearInterval(interval);
  }, [isOnline]);

  const toggleOnlineStatus = useCallback(async () => {
    try {
      const newStatus = !isOnline;
      if (newStatus) {
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) return;
        await updateDriverLocation();
      } else {
        setLocation(null);
      }
      setIsOnline(newStatus);
    } catch (error) {
      Alert.alert("Error", "Unable to update status.");
    }
  }, [isOnline]);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  if (loading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!driver) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: theme.background }]}
      >
        <MaterialIcons name="error-outline" size={50} color="#FF6B6B" />
        <Text style={[styles.errorText, { color: theme.text }]}>
          Driver profile not found
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={fetchDriverDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Drawer Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
        }}
      >
        <TouchableOpacity
          onPress={toggleDrawer}
          style={{ padding: 5 }} // Add some padding for better touch area
        >
          <Ionicons name="menu" size={30} color={theme.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 10,
            color: theme.text,
          }}
        >
          Driver Dashboard
        </Text>
      </View>

      <Animated.View
        style={[
          styles.statusCard,
          {
            backgroundColor: theme.card,
            borderColor: isOnline ? theme.primary : theme.secondary,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={styles.statusContent}>
          <View style={styles.statusIndicatorContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isOnline ? theme.primary : theme.secondary },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.text }]}>
              {isOnline ? "You're online" : "You're offline"}
            </Text>
          </View>
          <Text style={[styles.statusSubText, { color: theme.text }]}>
            {isOnline
              ? "Looking for rides"
              : "Go online to start receiving ride requests"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleOnlineStatus}
          style={[
            styles.statusButton,
            { backgroundColor: isOnline ? theme.secondary : theme.primary },
          ]}
        >
          <Text style={styles.statusButtonText}>
            {isOnline ? "Go Offline" : "Go Online"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ₹{driver.earning || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>
            Earnings
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {driver.totalDrives || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Trips</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {driver.rating || "N/A"}
          </Text>
          <Text style={[styles.statLabel, { color: theme.text }]}>Rating</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Quick Actions
      </Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("RideRequests")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#FFD70020" }]}>
            <FontAwesome5 name="car" size={24} color="#FFD700" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Ride Requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("Earnings")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#00AA5520" }]}>
            <FontAwesome5 name="money-bill-wave" size={24} color="#00AA55" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Earnings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("Review")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#FF6B6B20" }]}>
            <AntDesign name="star" size={24} color="#FF6B6B" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate("DriverProfile")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#4ECDC420" }]}>
            <FontAwesome5 name="user-alt" size={24} color="#4ECDC4" />
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Recent Activity
      </Text>
      <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
        <View style={styles.activityItem}>
          <View
            style={[styles.activityIcon, { backgroundColor: theme.background }]}
          >
            <FontAwesome5 name="car-side" size={18} color={theme.text} />
          </View>
          <View style={styles.activityDetails}>
            <Text style={[styles.activityTitle, { color: theme.text }]}>
              Trip Completed
            </Text>
            <Text style={[styles.activityTime, { color: theme.text }]}>
              Today, 10:30 AM
            </Text>
          </View>
          <Text style={[styles.activityAmount, { color: theme.primary }]}>
            ₹245
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.activityItem}>
          <View
            style={[styles.activityIcon, { backgroundColor: theme.background }]}
          >
            <FontAwesome5 name="star" size={18} color={theme.text} />
          </View>
          <View style={styles.activityDetails}>
            <Text style={[styles.activityTitle, { color: theme.text }]}>
              New Rating Received
            </Text>
            <Text style={[styles.activityTime, { color: theme.text }]}>
              Today, 10:35 AM
            </Text>
          </View>
          <Text style={[styles.activityRating, { color: "#FFD700" }]}>
            5.0 ★
          </Text>
        </View>
      </View>

      {/* Floating Action Buttons */}
      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: theme.primary }]}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            email: driver.email,
            value: 2,
          })
        }
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      {isOnline && (
        <TouchableOpacity
          style={[styles.rideButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("RideRequests")}
        >
          <Entypo name="location" size={24} color="white" />
          <Text style={styles.rideButtonText}>View Ride Requests</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    fontWeight: "500",
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  notificationBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
  },
  statusContent: {
    marginBottom: 16,
  },
  statusIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusSubText: {
    fontSize: 14,
  },
  statusButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  activityCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    marginTop: 4,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activityRating: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  chatButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rideButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rideButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Drawer styles
  drawerContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 20,
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  drawerName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  drawerEmail: {
    fontSize: 14,
    opacity: 0.8,
  },
  drawerMenu: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    marginTop: "auto",
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
});

export default DriverDashboard;
