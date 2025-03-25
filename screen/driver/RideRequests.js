import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { API_URL } from "../../config.js";
const BASE_URL = `${API_URL}`;

const RideRequests = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverEmail, setDriverEmail] = useState("");
  const [addresses, setAddresses] = useState({});

  useEffect(() => {
    const fetchDriverEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (email) {
          setDriverEmail(email);
          fetchRideRequests(email);
        } else {
          alert("Driver email not found. Please log in.");
        }
      } catch (error) {
        console.error("Error fetching driver email:", error);
      }
    };

    fetchDriverEmail();
  }, []);

  const fetchRideRequests = async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/rides/requests/${email}`);
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
        // Get readable addresses for all requests
        await getAddressesForRequests(data);
      } else {
        alert(data.message || "Failed to fetch ride requests.");
      }
    } catch (error) {
      console.error("Error fetching ride requests:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Convert coordinates to readable addresses
  const getAddressesForRequests = async (requests) => {
    const newAddresses = {};

    for (const request of requests) {
      try {
        // Parse pickup coordinates
        const pickupCoords = request.pickupLocation.split(",").map(Number);
        const pickupGeo = await Location.reverseGeocodeAsync({
          latitude: pickupCoords[0],
          longitude: pickupCoords[1],
        });

        // Parse dropoff coordinates
        const dropoffCoords = request.dropoffLocation.split(",").map(Number);
        const dropoffGeo = await Location.reverseGeocodeAsync({
          latitude: dropoffCoords[0],
          longitude: dropoffCoords[1],
        });

        newAddresses[request._id] = {
          pickup: formatAddress(pickupGeo[0]),
          dropoff: formatAddress(dropoffGeo[0]),
        };
      } catch (error) {
        console.error("Error getting address:", error);
        newAddresses[request._id] = {
          pickup: request.pickupLocation,
          dropoff: request.dropoffLocation,
        };
      }
    }

    setAddresses(newAddresses);
  };

  const formatAddress = (geo) => {
    if (!geo) return "Unknown location";
    return `${geo.name || geo.street}, ${geo.city || geo.region}`;
  };

  const handleAccept = (item) => {
    navigation.navigate("RideAcceptance", {
      rideId: item._id,
      riderName: item.userId?.name || "Unknown",
      riderEmail: item.userId?.email || "No Email",
      pickup: addresses[item._id]?.pickup || item.pickupLocation,
      dropoff: addresses[item._id]?.dropoff || item.dropoffLocation,
      fare: item.estimatedFare || "N/A",
      distance: item.estimatedDistance || "N/A",
      duration: item.estimatedDuration || "N/A",
      riderPhoto: item.userId?.photo || "https://via.placeholder.com/50",
      vehicle: item.vehicleType || "Unknown",
    });
  };

  const handleReject = async (rideId) => {
    try {
      const response = await fetch(`${BASE_URL}/rides/reject/${rideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Ride rejected successfully!");
        setRequests((prev) =>
          prev.map((req) =>
            req._id === rideId ? { ...req, status: "rejected" } : req
          )
        );
      } else {
        alert(data.message || "Failed to reject ride.");
      }
    } catch (error) {
      console.error("Error rejecting ride:", error);
      alert("Network error while rejecting ride.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚖 Ride Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : requests.length > 0 ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.requestCard, getStatusStyle(item.status)]}>
              <View style={styles.rideDetails}>
                <Text style={styles.riderName}>
                  {item.userId?.name || "Unknown Rider"}
                </Text>

                {/* Ride Information */}
                <View style={styles.rideInfoRow}>
                  <Text style={styles.infoLabel}>📍 Pickup:</Text>
                  <Text style={styles.infoText}>
                    {addresses[item._id]?.pickup || item.pickupLocation}
                  </Text>
                </View>

                <View style={styles.rideInfoRow}>
                  <Text style={styles.infoLabel}>🏁 Dropoff:</Text>
                  <Text style={styles.infoText}>
                    {addresses[item._id]?.dropoff || item.dropoffLocation}
                  </Text>
                </View>

                <View style={styles.rideInfoRow}>
                  <Text style={styles.infoLabel}>💰 Fare:</Text>
                  <Text style={styles.infoText}>
                    ₹{item.estimatedFare || "N/A"}
                  </Text>
                </View>

                <View style={styles.rideInfoRow}>
                  <Text style={styles.infoLabel}>📏 Distance:</Text>
                  <Text style={styles.infoText}>
                    {item.estimatedDistance || "N/A"} km
                  </Text>
                </View>

                <View style={styles.rideInfoRow}>
                  <Text style={styles.infoLabel}>⏱ Duration:</Text>
                  <Text style={styles.infoText}>
                    {item.estimatedDuration || "N/A"} min
                  </Text>
                </View>

                <Text
                  style={[styles.statusText, getStatusTextColor(item.status)]}
                >
                  Status: {item.status.toUpperCase()}
                </Text>
              </View>

              {item.status === "pending" && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(item)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(item._id)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noRequests}>No ride requests found.</Text>
      )}
    </View>
  );
};

// Style helper functions remain the same
const getStatusStyle = (status) => {
  switch (status) {
    case "accepted":
      return { backgroundColor: "#e8f5e9", borderLeftColor: "#4caf50" };
    case "rejected":
      return { backgroundColor: "#ffebee", borderLeftColor: "#f44336" };
    default:
      return { backgroundColor: "#fff", borderLeftColor: "#9e9e9e" };
  }
};

const getStatusTextColor = (status) => {
  switch (status) {
    case "accepted":
      return { color: "#4caf50" };
    case "rejected":
      return { color: "#f44336" };
    default:
      return { color: "#9e9e9e" };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  requestCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 5,
    elevation: 2,
  },
  rideDetails: {
    marginBottom: 12,
  },
  riderName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  rideInfoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "bold",
    width: 80,
    color: "#555",
  },
  infoText: {
    flex: 1,
    color: "#333",
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noRequests: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 40,
  },
});

export default RideRequests;
