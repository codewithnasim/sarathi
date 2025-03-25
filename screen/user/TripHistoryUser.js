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
import { API_URL } from "../../config.js";

const BASE_URL = `${API_URL}`; // Change to your backend URL

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

        const response = await fetch(`${BASE_URL}/rides/user/${email}`);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : trips.length > 0 ? (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tripContainer}
              onPress={() =>
                navigation.navigate("TripSummary", { rideDetails: item })
              }
            >
              <Text style={styles.tripDate}>
                {item.createdAt
                  ? new Date(item.createdAt).toDateString()
                  : "Unknown Date"}
              </Text>

              {item.pickupLocation && (
                <Text style={styles.tripDetail}>
                  🚖 Pickup: {item.pickupLocation}
                </Text>
              )}

              {item.dropoffLocation && (
                <Text style={styles.tripDetail}>
                  📍 Dropoff: {item.dropoffLocation}
                </Text>
              )}

              <Text style={styles.tripDetail}>
                💰 Fare: ₹{item.fare ? item.fare.toString() : "N/A"}
              </Text>

              <Text style={styles.tripDetail}>
                👤 Driver: {item.driver?.name ? item.driver.name : "N/A"}
              </Text>

              <Text
                style={[
                  styles.status,
                  item.status === "accepted"
                    ? styles.completed
                    : styles.pending,
                ]}
              >
                Status: {item.status ? item.status.toString() : "Unknown"}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noTrips}>No trip history available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  tripContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  tripDate: { fontSize: 16, fontWeight: "bold", color: "#333" },
  tripDetail: { fontSize: 14, color: "#555", marginTop: 5 },
  status: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
  completed: { color: "green" },
  pending: { color: "orange" },
  noTrips: { fontSize: 16, textAlign: "center", color: "#888", marginTop: 20 },
});

export default TripHistoryUser;
