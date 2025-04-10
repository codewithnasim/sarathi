import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://sarathi-backend-file.onrender.com";
const ORS_API_KEY = "5b3ce3597851110001cf62483612d17921e44615970e0bb7eff31e8b";
const OPENCAGE_API_KEY = "60143b91955644bf95b55a46cb7fc36e"; // 🛑 Replace with your OpenCage API Key

const { width } = Dimensions.get("window");

const RideAcceptanceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    riderName,
    pickup,
    dropoff,
    vehicle,
    riderPhoto,
    riderEmail,
    rideId,
  } = route.params;

  const [driverEmail, setDriverEmail] = useState(null);
  const [notificationText, setNotificationText] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");

  const parseLocation = (location) => {
    if (!location || !location.includes(",")) return null;
    const [lat, lon] = location.split(",").map((v) => parseFloat(v.trim()));
    if (isNaN(lat) || isNaN(lon)) return null;
    return { latitude: lat, longitude: lon };
  };

  const pickupCoords = parseLocation(pickup);
  const dropoffCoords = parseLocation(dropoff);

  useEffect(() => {
    const getDriverEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) setDriverEmail(email);
    };

    const fetchAddresses = async () => {
      if (pickupCoords) {
        const address = await getAddressFromCoords(
          pickupCoords.latitude,
          pickupCoords.longitude
        );
        setPickupAddress(address);
      }

      if (dropoffCoords) {
        const address = await getAddressFromCoords(
          dropoffCoords.latitude,
          dropoffCoords.longitude
        );
        setDropoffAddress(address);
      }
    };

    getDriverEmail();
    if (pickupCoords && dropoffCoords) {
      fetchRoute();
      fetchAddresses();
    }
  }, [pickup, dropoff]);

  const getAddressFromCoords = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`
      );
      const result = response.data.results[0];
      return result?.formatted || "Unknown location";
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Unknown location";
    }
  };

  const fetchRoute = async () => {
    try {
      const start = [pickupCoords.longitude, pickupCoords.latitude];
      const end = [dropoffCoords.longitude, dropoffCoords.latitude];

      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
        { coordinates: [start, end] },
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const geometry = response.data.features[0].geometry.coordinates;
      const properties = response.data.features[0].properties.summary;

      const route = geometry.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      }));

      setRouteCoords(route);
      setDistance((properties.distance / 1000).toFixed(2)); // in km
      setDuration((properties.duration / 60).toFixed(0)); // in minutes
    } catch (error) {
      console.error("Route fetch error:", error);
      Alert.alert("Route Error", "Failed to load route.");
    }
  };

  const sendNotification = async () => {
    if (!notificationText.trim()) {
      Alert.alert("Error", "Please enter a message before sending.");
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/notifications/sendnotifications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail: riderEmail?.toLowerCase(),
            senderName: "Driver",
            senderEmail: driverEmail?.toLowerCase(),
            message: notificationText,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Notification Sent", "Message sent to rider.");
        setNotificationText("");
        acceptRide();
      } else {
        throw new Error(data.error || "Notification failed.");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const acceptRide = async () => {
    if (!driverEmail || !riderEmail) {
      Alert.alert("Error", "Missing email info.");
      return;
    }

    try {
      const existingSession = await checkExistingSession();

      if (existingSession) {
        Alert.alert(
          "Active Ride Session Found",
          "You already have a session. Do you want to delete it and start a new one?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete & Proceed",
              onPress: async () => {
                const deleted = await deleteSessionById(existingSession._id);
                if (deleted) {
                  await createNewSession();
                } else {
                  Alert.alert("Error", "Failed to delete session.");
                }
              },
            },
          ]
        );
      } else {
        await createNewSession();
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong.");
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rides/reject/${rideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Ride Rejected", "Ride has been rejected.");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Could not reject ride.");
      }
    } catch (err) {
      Alert.alert("Network Error", "Try again later.");
    }
  };

  const checkExistingSession = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/rideSession/active/${driverEmail}`
      );
      const data = await res.json();
      return res.ok ? data.session : null;
    } catch (error) {
      console.error("Session check failed:", error);
      return null;
    }
  };

  const deleteSessionById = async (sessionId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/rideSession/${sessionId}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch (error) {
      console.error("Session delete failed:", error);
      return false;
    }
  };

  const createNewSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/rideSession/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email: riderEmail },
          driver: { email: driverEmail },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert(
          "Session Error",
          data.message || "Could not create session."
        );
        return;
      }

      const acceptResponse = await fetch(
        `${BASE_URL}/api/rides/accept/${rideId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "accepted" }),
        }
      );

      const acceptData = await acceptResponse.json();
      if (!acceptResponse.ok) {
        Alert.alert(
          "Accept Error",
          acceptData.message || "Failed to accept ride."
        );
        return;
      }

      Alert.alert("✅ Ride Accepted", "Navigating to live tracking...");
      navigation.navigate("UserDriverConnection", {
        targetLocation: pickup,
        driverEmail,
      });
    } catch (error) {
      console.error("Full error:", error);
      Alert.alert("Error", "Something went wrong. Check console for details.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚖 Ride Confirmation</Text>

      {pickupCoords && dropoffCoords ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: pickupCoords.latitude,
            longitude: pickupCoords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={pickupCoords} title="Pickup Location" />
          <Marker coordinate={dropoffCoords} title="Dropoff Location" />
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#007bff"
              strokeWidth={4}
            />
          )}
        </MapView>
      ) : (
        <Text style={styles.errorText}>❌ Invalid coordinates</Text>
      )}

      {distance && duration && (
        <Text style={styles.routeInfo}>
          📏 Distance: {distance} km ⏱ Duration: {duration} minutes
        </Text>
      )}

      <View style={styles.card}>
        <Image source={{ uri: riderPhoto }} style={styles.riderPhoto} />
        <View style={styles.rideDetails}>
          <Text style={styles.infoText}>👤 {riderName}</Text>
          <Text style={styles.infoText}>📍 Pickup: {pickupAddress}</Text>
          <Text style={styles.infoText}>📌 Dropoff: {dropoffAddress}</Text>
          <Text style={styles.infoText}>🚘 Vehicle: {vehicle}</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Message to rider..."
        value={notificationText}
        onChangeText={setNotificationText}
      />

      <TouchableOpacity style={styles.button} onPress={sendNotification}>
        <Text style={styles.buttonText}>📩 Confirm & Notify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.rejectButton]}
        onPress={handleReject}
      >
        <Text style={styles.buttonText}>❌ Reject Ride</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f7fa",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#007bff",
  },
  map: { width: "100%", height: 280, borderRadius: 12, marginBottom: 10 },
  routeInfo: { fontSize: 16, color: "#444", marginBottom: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    elevation: 3,
    alignItems: "center",
    marginBottom: 15,
  },
  riderPhoto: { width: 70, height: 70, borderRadius: 35, marginRight: 12 },
  rideDetails: { flex: 1 },
  infoText: { fontSize: 15, color: "#555", marginVertical: 2 },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  button: {
    width: "100%",
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  rejectButton: { backgroundColor: "#dc3545" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: { color: "red", fontSize: 16, marginVertical: 8 },
});

export default RideAcceptanceScreen;
