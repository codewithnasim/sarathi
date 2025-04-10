import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const BASE_URL = "https://sarathi-backend-file.onrender.com";

const TripHistoryUser = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTripHistory = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) {
          Alert.alert("Error", "User not logged in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/rides/user/${email}`);
        if (!response.ok) throw new Error("Failed to fetch trip history");

        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trip history:", error);
        Alert.alert("Error", "Could not load trip history.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripHistory();
  }, []);

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("TripSummary", { rideDetails: item })}
    >
      <View style={styles.cardHeader}>
        <MaterialIcons name="date-range" size={20} color="#0077b6" />
        <Text style={styles.tripDate}>
          {item.createdAt ? new Date(item.createdAt).toDateString() : "Unknown Date"}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <FontAwesome5 name="map-marker-alt" size={14} color="#000" />
        <Text style={styles.tripText}>Pickup: {item.pickupLocation || "N/A"}</Text>
      </View>

      <View style={styles.detailRow}>
        <FontAwesome5 name="map-pin" size={14} color="#000" />
        <Text style={styles.tripText}>Dropoff: {item.dropoffLocation || "N/A"}</Text>
      </View>

      <View style={styles.detailRow}>
        <FontAwesome5 name="rupee-sign" size={14} color="#000" />
        <Text style={styles.tripText}>
          Fare: ₹{typeof item.fare === "number" ? item.fare.toFixed(2) : "N/A"}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <FontAwesome5 name="user" size={14} color="#000" />
        <Text style={styles.tripText}>
          Driver: {item.driver?.name || "N/A"}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.status,
            item.status === "Completed"
              ? styles.completed
              : styles.pending,
          ]}
        >
          {item.status || "Unknown"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚘 Trip History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0077b6" />
      ) : trips.length > 0 ? (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          renderItem={renderTripItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.noTrips}>No trip history available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#caf0f8",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#023e8a",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tripDate: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#0077b6",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  tripText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  statusContainer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  completed: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  pending: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  noTrips: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginTop: 30,
  },
});

export default TripHistoryUser;
