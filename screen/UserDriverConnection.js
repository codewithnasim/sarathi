import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";

const DriverRideTracking = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { locationString, driverEmail } = route.params || {};

  const [driverLocation, setDriverLocation] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState(null);

  // Parse and set user coordinates
  useEffect(() => {
    if (locationString) {
      const [lat, lng] = locationString.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setUserCoordinates({ latitude: lat, longitude: lng });
      } else {
        console.error("Invalid user coordinates from locationString:", locationString);
      }
    }
  }, [locationString]);

  // Track driver's real-time location
  useEffect(() => {
    let locationSubscription;

    const watchDriverLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setDriverLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    };

    watchDriverLocation();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  const initialRegion = {
    latitude: userCoordinates?.latitude || 22.5838,
    longitude: userCoordinates?.longitude || 88.4405,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {userCoordinates && (
          <Marker
            coordinate={userCoordinates}
            title="User Location"
            pinColor="blue"
          />
        )}

        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="You (Driver)"
            pinColor="green"
          />
        )}
      </MapView>
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

export default DriverRideTracking;
