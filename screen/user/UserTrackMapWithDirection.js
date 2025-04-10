import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const UserTrackMapWithDirection = () => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Example source and destination
  const source = { latitude: 12.9716, longitude: 77.5946 }; // Bangalore
  const destination = { latitude: 12.9352, longitude: 77.6093 };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));

        setRouteCoords(coords);
      } catch (error) {
        console.error("Error fetching route:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: (source.latitude + destination.latitude) / 2,
        longitude: (source.longitude + destination.longitude) / 2,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker coordinate={source} title="Source" />
      <Marker coordinate={destination} title="Destination" />
      <Polyline coordinates={routeCoords} strokeColor="#007bff" strokeWidth={4} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserTrackMapWithDirection;
