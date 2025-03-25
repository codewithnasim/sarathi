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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../config.js";

const BASE_URL = `${API_URL}`;

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigation = useNavigation();

  // Fetch admin details
  const fetchAdminData = async () => {
    try {
      const adminEmail = await AsyncStorage.getItem("adminEmail");

      if (!adminEmail) {
        Alert.alert("Error", "Admin email not found. Please log in again.");
        navigation.replace("AdminLogin");
        return;
      }

      console.log(
        "Fetching admin details from:",
        `${API_URL}/admin/details?email=${adminEmail}`
      );

      const response = await axios.get(
        `${API_URL}/admin/details?email=${adminEmail}`
      );

      console.log("Admin details response:", response.data);
      setAdmin(response.data);
    } catch (error) {
      console.error(
        "Error fetching admin details:",
        error?.response?.data || error.message
      );

      if (error.response?.status === 404) {
        Alert.alert("Error", "Admin details not found.");
      } else {
        Alert.alert("Error", "Failed to fetch admin details.");
      }
    }
  };

  const fetchPendingDrivers = async () => {
    setLoading(true);
    setError(false);

    try {
      console.log(
        "Fetching pending drivers from:",
        `${API_URL}/admin/pending-drivers`
      );

      const response = await axios.get(`${API_URL}/admin/pending-drivers`);

      console.log("Pending drivers response:", response.data);
      setPendingDrivers(response.data);
    } catch (error) {
      console.error(
        "Error fetching pending drivers:",
        error?.response?.data || error.message
      );

      if (error.response?.status === 404) {
        Alert.alert("Error", "No pending drivers found.");
      } else {
        Alert.alert("Error", "Failed to fetch pending drivers.");
      }

      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Add a delay to handle Render cold start
  useEffect(() => {
    setTimeout(() => {
      fetchAdminData();
      fetchPendingDrivers();
    }, 3000); // Delay by 3 seconds
  }, []);

  return (
    <View style={styles.container}>
      {/* Admin Profile Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: admin?.photo ? admin.photo : "https://via.placeholder.com/70",
          }}
          style={styles.profileImage}
          onError={(e) =>
            console.log("Admin Photo Load Error:", e.nativeEvent.error)
          }
        />

        <View>
          <Text style={styles.adminName}>{admin?.name || "Admin"}</Text>
          <Text style={styles.adminEmail}>
            {admin?.email || "admin@example.com"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Pending Driver Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#004D40" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load drivers.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPendingDrivers}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : pendingDrivers.length === 0 ? (
        <Text style={styles.noData}>No pending driver requests</Text>
      ) : (
        <FlatList
          data={pendingDrivers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("DriverDetailsScreen", { driver: item })
              }
            >
              <Image
                source={{
                  uri: `${API_URL}/${item.photo.replace(/^\/+/, "")}`, // Ensures correct URL
                }}
                style={styles.driverImage}
                onError={(e) =>
                  console.error("Driver Photo Load Error:", e.nativeEvent.error)
                }
              />

              <View style={styles.cardInfo}>
                <Text style={styles.driverName}>{item.name}</Text>
                <Text style={styles.driverEmail}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom Buttons Section */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={fetchPendingDrivers}
        >
          <Ionicons name="refresh" size={22} color="white" />
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AllDriversScreen")}
        >
          <Ionicons name="people-outline" size={22} color="white" />
          <Text style={styles.buttonText}>Manage Drivers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AdminManageUsers")}
        >
          <Ionicons name="person-circle-outline" size={22} color="white" />
          <Text style={styles.buttonText}>Manage Users</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E0F2F1" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#004D40",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  profileImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  adminName: { fontSize: 20, fontWeight: "bold", color: "white" },
  adminEmail: { fontSize: 14, color: "white" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  driverImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  cardInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  driverEmail: { fontSize: 14, color: "#666" },
  errorContainer: { alignItems: "center", marginTop: 20 },
  errorText: { fontSize: 16, color: "red" },
  retryButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryText: { color: "white", fontSize: 16 },
  noData: { fontSize: 18, textAlign: "center", color: "#555", marginTop: 20 },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#004D40",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  buttonText: { color: "white", fontSize: 16, marginLeft: 8 },
});

export default AdminDashboard;
