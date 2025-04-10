import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://sarathi-backend-file.onrender.com";

const RideRequests = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverEmail, setDriverEmail] = useState("");

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
      const response = await fetch(`${BASE_URL}/api/rides/requests/${email}`);
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
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

  const handleAccept = (item) => {
    navigation.navigate("RideAcceptance", {
      riderName: item.userId?.name || "Unknown",
      riderEmail: item.userId?.email || "No Email",
      pickup: item.pickupLocation || "N/A",
      dropoff: item.dropoffLocation || "N/A",
      riderPhoto: item.userId?.photo || "https://via.placeholder.com/50",
      vehicle: item.vehicleType || "Unknown",
      rideId: item._id || "N/A",
    });
  };

  const handleReject = async (rideId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/rides/reject/${rideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (response.ok) {
        alert("🚫 Ride Rejected Successfully!");
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
            <View style={[styles.card, getStatusStyle(item.status)]}>
              <View style={styles.rideDetails}>
                <Text style={styles.riderName}>
                  {item.userId?.name || "Unknown Rider"}
                </Text>
                <Text style={styles.email}>📧 {item.userId?.email}</Text>
                <Text>
                  📍 Pickup:{" "}
                  <Text style={styles.bold}>{item.pickupLocation}</Text>
                </Text>
                <Text>
                  📌 Dropoff:{" "}
                  <Text style={styles.bold}>{item.dropoffLocation}</Text>
                </Text>
                <Text style={[styles.status, getStatusTextColor(item.status)]}>
                  🏷 Status: {item.status.toUpperCase()}
                </Text>
              </View>

              {item.status === "pending" && (
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(item)}
                  >
                    <Text style={styles.buttonText}>✅ Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item._id)}
                  >
                    <Text style={styles.buttonText}>❌ Reject</Text>
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

const getStatusStyle = (status) => {
  switch (status) {
    case "accepted":
      return {
        backgroundColor: "#D4EDDA",
        borderLeftColor: "green",
        borderLeftWidth: 5,
      };
    case "rejected":
      return {
        backgroundColor: "#F8D7DA",
        borderLeftColor: "red",
        borderLeftWidth: 5,
      };
    default:
      return {
        backgroundColor: "#ffffff",
        borderLeftColor: "gray",
        borderLeftWidth: 5,
      };
  }
};

const getStatusTextColor = (status) => {
  switch (status) {
    case "accepted":
      return { color: "green", fontWeight: "bold" };
    case "rejected":
      return { color: "red", fontWeight: "bold" };
    default:
      return { color: "#333" };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rideDetails: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  riderName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
  },
  email: {
    color: "#555",
    fontSize: 14,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  status: {
    marginTop: 5,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noRequests: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 50,
  },
});

export default RideRequests;
