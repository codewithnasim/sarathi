import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const BASE_URL = "https://sarathi-backend-file.onrender.com";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    fetchAdminData();
    fetchPendingDrivers();

    // Start animations
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

  const fetchPendingDrivers = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/pending-drivers`);
      setPendingDrivers(response.data);
    } catch (error) {
      console.error("Error fetching pending drivers:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f5f7fa", "#e4e8f0"]} style={styles.container}>
      {/* Admin Profile Header with Glass Morphism Effect */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(0,77,64,0.8)", "rgba(0,150,136,0.9)"]}
          style={styles.glassCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={{ uri: admin?.photo || "https://via.placeholder.com/70" }}
            style={styles.profileImage}
          />
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{admin?.name || "Admin"}</Text>
            <Text style={styles.adminEmail}>
              {admin?.email || "admin@example.com"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchPendingDrivers}
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Pending Requests Section */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Driver Requests</Text>
          <Text style={styles.countBadge}>{pendingDrivers.length}</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#004D40" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color="#ff4444" />
            <Text style={styles.errorText}>Failed to load drivers</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchPendingDrivers}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : pendingDrivers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={50} color="#4CAF50" />
            <Text style={styles.emptyText}>All clear! No pending requests</Text>
          </View>
        ) : (
          <FlatList
            data={pendingDrivers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10 * index],
                        }),
                      },
                    ],
                  },
                ]}
                onPress={() =>
                  navigation.navigate("DriverDetailsScreen", { driver: item })
                }
              >
                <Image
                  source={{
                    uri: item.photo || "https://via.placeholder.com/50",
                  }}
                  style={styles.driverImage}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.driverName}>{item.name}</Text>
                  <Text style={styles.driverEmail}>{item.email}</Text>
                </View>
                <View style={styles.statusIndicator} />
              </TouchableOpacity>
            )}
          />
        )}
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("AllDriversScreen")}
        >
          <Ionicons name="people" size={24} color="#004D40" />
          <Text style={styles.navText}>Drivers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("AdminManageUsers")}
        >
          <Ionicons name="person" size={24} color="#004D40" />
          <Text style={styles.navText}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("AdminSettings")}
        >
          <Ionicons name="settings" size={24} color="#004D40" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  glassCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  adminInfo: {
    flex: 1,
    marginLeft: 15,
  },
  adminName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 3,
  },
  adminEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  refreshButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004D40",
    marginRight: 10,
  },
  countBadge: {
    backgroundColor: "#004D40",
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: "bold",
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
    color: "#ff4444",
    marginVertical: 15,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#004D40",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#004D40",
    marginTop: 15,
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#004D40",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  driverEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFC107",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "white",
    borderRadius: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#004D40",
    marginTop: 5,
    fontWeight: "500",
  },
});

export default AdminDashboard;
