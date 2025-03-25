import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";
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
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = `${API_URL}`; // Ensure this is correct

const AllDriversScreen = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`${BASE_URL}/admin/all-drivers`);
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError(true);
      Alert.alert("Error", "Failed to fetch drivers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (driverId, isBlocked) => {
    const action = isBlocked ? "Unblock" : "Block";

    Alert.alert(
      `${action} Driver`,
      `Are you sure you want to ${action.toLowerCase()} this driver?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          onPress: async () => {
            try {
              const response = await axios.post(
                `${BASE_URL}/admin/toggle-driver-status`,
                { driverId }
              );

              if (response.data.success) {
                setDrivers((prevDrivers) =>
                  prevDrivers.map((driver) =>
                    driver._id === driverId
                      ? { ...driver, isBlocked: !isBlocked }
                      : driver
                  )
                );

                Alert.alert(
                  "Success",
                  `Driver has been ${action.toLowerCase()}ed.`
                );
              } else {
                Alert.alert(
                  "Error",
                  response.data.message ||
                    `Failed to ${action.toLowerCase()} driver.`
                );
              }
            } catch (error) {
              console.error(`${action} error:`, error.response?.data || error);
              Alert.alert("Error", `Failed to ${action.toLowerCase()} driver.`);
            }
          },
        },
      ]
    );
  };

  const handleRemove = async (driverId) => {
    Alert.alert(
      "Remove Driver",
      "Are you sure you want to remove this driver?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${BASE_URL}/admin/delete-driver/${driverId}`
              );

              if (response.data.success) {
                setDrivers((prevDrivers) =>
                  prevDrivers.filter((driver) => driver._id !== driverId)
                );
                Alert.alert("Success", "Driver has been removed.");
              } else {
                Alert.alert(
                  "Error",
                  response.data.message || "Failed to remove driver."
                );
              }
            } catch (error) {
              console.error("Remove error:", error.response?.data || error);
              Alert.alert("Error", "Failed to remove driver.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>All Registered Drivers</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load drivers.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDrivers}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri: item.photo?.startsWith("http")
                    ? item.photo
                    : `${BASE_URL}${item.photo}`, // Ensure correct URL
                }}
                style={styles.driverImage}
              />

              <Text style={styles.driverName}>{item.name}</Text>

              <View style={styles.buttonContainer}>
                {/* View Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate("DriverDetailsScreen", { driver: item })
                  }
                >
                  <Ionicons name="eye-outline" size={22} color="white" />
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>

                {/* Block / Unblock Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    item.isBlocked ? styles.unblockButton : styles.blockButton,
                  ]}
                  onPress={() => handleBlock(item._id, item.isBlocked)}
                >
                  <Ionicons
                    name={
                      item.isBlocked
                        ? "checkmark-circle-outline"
                        : "ban-outline"
                    }
                    size={22}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    {item.isBlocked ? "Unblock" : "Block"}
                  </Text>
                </TouchableOpacity>

                {/* Remove Button */}
                <TouchableOpacity
                  style={[styles.button, styles.removeButton]}
                  onPress={() => handleRemove(item._id)}
                >
                  <Ionicons name="trash-outline" size={22} color="white" />
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>

                {/* Notification Button */}
                <TouchableOpacity
                  style={[styles.button, styles.notifyButton]}
                  onPress={() =>
                    navigation.navigate("SendNotificationUser", {
                      name: item.name,
                      email: item.email,
                    })
                  }
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="white"
                  />
                  <Text style={styles.buttonText}>Notify</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#004D40" },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },

  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    alignItems: "center",
  },

  driverImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 12,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 5,
    width: 100,
    justifyContent: "center",
  },

  blockButton: { backgroundColor: "#FF4500" },
  unblockButton: { backgroundColor: "#28A745" },
  removeButton: { backgroundColor: "#DC143C" },
  notifyButton: { backgroundColor: "#FFD700" }, // Yellow button for notification

  buttonText: {
    color: "white",
    fontSize: 14,
    marginLeft: 5,
    fontWeight: "600",
  },

  errorContainer: { alignItems: "center", marginTop: 20 },
  errorText: { fontSize: 16, color: "red" },
  retryButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryText: { color: "white", fontSize: 16 },
  loader: { marginTop: 20 },
});

export default AllDriversScreen;
