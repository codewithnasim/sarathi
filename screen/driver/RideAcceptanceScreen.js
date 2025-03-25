import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../config.js";

const BASE_URL = `${API_URL}`;

const RideAcceptanceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [driverEmail, setDriverEmail] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [loading, setLoading] = useState(false);

  // Safely extract route params with defaults
  const {
    riderName = "Unknown Rider",
    pickup = "",
    dropoff = "",
    vehicle = "Standard",
    riderPhoto = "https://via.placeholder.com/150",
    riderEmail = "",
    rideId = "",
  } = route.params || {};

  useEffect(() => {
    const getDriverEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        setDriverEmail(email || "");
      } catch (error) {
        console.error("Error getting driver email:", error);
      }
    };
    getDriverEmail();
  }, []);

  const parseLocation = (location) => {
    try {
      if (!location) return null;
      const coords = location.split(",").map(Number);
      if (coords.length !== 2 || coords.some(isNaN)) return null;
      return { latitude: coords[0], longitude: coords[1] };
    } catch (error) {
      console.error("Error parsing location:", error);
      return null;
    }
  };

  const pickupCoords = parseLocation(pickup);
  const dropoffCoords = parseLocation(dropoff);

  const handleAction = async (action) => {
    if (loading) return;
    setLoading(true);

    try {
      if (action === "accept") {
        await acceptRide();
      } else {
        await rejectRide();
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      Alert.alert("Error", `Failed to ${action} ride. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async () => {
    // 1. First accept the ride
    const response = await axios.put(`${BASE_URL}/rides/accept/${rideId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to accept ride");
    }

    // 2. Then create chat connection
    await createChatConnection();

    // 3. Send notification if message exists
    if (notificationText.trim()) {
      await sendNotification();
    }

    // 4. Navigate to next screen
    navigation.navigate("UserDriverConnection", {
      targetLocation: pickup,
      driverEmail,
    });
  };

  const rejectRide = async () => {
    await axios.put(`${BASE_URL}/rides/reject/${rideId}`);
    navigation.goBack();
  };

  const createChatConnection = async () => {
    if (!riderEmail || !driverEmail) return;

    await axios.post(`${BASE_URL}/chat-connections/create`, {
      userEmail: riderEmail.toLowerCase(),
      driverEmail: driverEmail.toLowerCase(),
    });
  };

  const sendNotification = async () => {
    await axios.post(`${BASE_URL}/notifications/sendnotifications`, {
      recipientEmail: riderEmail.toLowerCase(),
      senderName: "Driver",
      senderEmail: driverEmail.toLowerCase(),
      message: notificationText,
    });
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
          <Marker coordinate={pickupCoords} title="Pickup" pinColor="green" />
          <Marker coordinate={dropoffCoords} title="Dropoff" pinColor="red" />
        </MapView>
      ) : (
        <Text style={styles.errorText}>Location data not available</Text>
      )}

      <View style={styles.card}>
        <Image
          source={{ uri: riderPhoto }}
          style={styles.riderPhoto}
          defaultSource={{ uri: "https://via.placeholder.com/150" }}
        />
        <View style={styles.details}>
          <Text style={styles.text}>Rider: {riderName}</Text>
          <Text style={styles.text} numberOfLines={1}>
            Pickup: {pickup}
          </Text>
          <Text style={styles.text} numberOfLines={1}>
            Dropoff: {dropoff}
          </Text>
          <Text style={styles.text}>Vehicle: {vehicle}</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Optional message to rider..."
        value={notificationText}
        onChangeText={setNotificationText}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, styles.acceptButton]}
        onPress={() => handleAction("accept")}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>✅ Accept Ride</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.rejectButton]}
        onPress={() => handleAction("reject")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>❌ Reject Ride</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  riderPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default RideAcceptanceScreen;
