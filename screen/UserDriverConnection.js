import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { API_URL } from "../config.js";

const UserDriverConnection = () => {
  const navigation = useNavigation();
  const route = useRoute();

  console.log("Route Params:", route.params);

  const { locationString, driverEmail } = route.params || {};

  if (!driverEmail) {
    console.error("Missing driverEmail! Check navigation params.");
  }

  const [userLocation, setUserLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  const [targetLatitude, targetLongitude] = locationString
    ? locationString.split(",").map(Number)
    : [null, null];

  useEffect(() => {
    let locationSubscription;

    const updateUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    };
    updateUserLocation();

    const fetchDriverLocation = async () => {
      if (!driverEmail) return;
      try {
        let response = await fetch(`${API_URL}/driver-location/${driverEmail}`);
        let data = await response.json();
        if (data.success) {
          setDriverLocation({
            latitude: data.data.latitude,
            longitude: data.data.longitude,
          });
        } else {
          console.error("Driver location not found");
        }
      } catch (error) {
        console.error("Error fetching driver location:", error);
      }
    };

    const interval = setInterval(fetchDriverLocation, 5000);

    return () => {
      if (locationSubscription) locationSubscription.remove();
      clearInterval(interval);
    };
  }, [driverEmail]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: targetLatitude || 22.8605517,
          longitude: targetLongitude || 88.3923833,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {targetLatitude && targetLongitude && (
          <Marker
            coordinate={{
              latitude: targetLatitude,
              longitude: targetLongitude,
            }}
            title="Target Location"
            pinColor="red"
          />
        )}

        {driverLocation && (
          <Marker coordinate={driverLocation} title="Driver" pinColor="green" />
        )}
      </MapView>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() =>
          navigation.navigate("ChatScreen", { senderEmail: driverEmail })
        }
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  chatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 30,
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserDriverConnection;
