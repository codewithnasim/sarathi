import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://sarathi-backend-file.onrender.com";

const UserBookDriver = () => {
  const [driver, setDriver] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropCoordinates, setDropCoordinates] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const mapRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { driverEmail } = route.params;

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (email) {
          setUserEmail(email);
        } else {
          Alert.alert("Error", "Please log in to book a ride.");
        }
      } catch (error) {
        console.error("Error retrieving user email:", error);
      }
    };

    const fetchDriverDetails = async () => {
      try {
        console.log("Fetching driver details for:", driverEmail);

        if (!driverEmail) {
          console.error("No driver email provided!");
          return;
        }

        const response = await fetch(
          `${BASE_URL}/api/drivers/email/${driverEmail}`
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server Error: ${text}`);
        }

        const data = await response.json();
        console.log("Fetched driver details:", data);

        if (data) {
          setDriver(data);
        } else {
          throw new Error("Driver not found");
        }
      } catch (error) {
        console.error("Error fetching driver details:", error.message);
        Alert.alert(
          "Error",
          "Failed to fetch driver details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        setPickupCoordinates({ latitude, longitude });

        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode && geocode.length > 0) {
          const address = `${geocode[0].name || ""}, ${
            geocode[0].street || ""
          }, ${geocode[0].city || ""}, ${geocode[0].region || ""}`;
          setPickupLocation(
            address.replace(/, ,/g, ",").replace(/^,|,$/g, "").trim()
          );
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to fetch current location.");
      }
    };

    getUserEmail();
    fetchDriverDetails();
    getCurrentLocation();
  }, [driverEmail]);

  const searchLocations = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const result = await Location.geocodeAsync(query);
      if (result.length > 0) {
        const locations = await Promise.all(
          result.slice(0, 5).map(async (item) => {
            const address = await Location.reverseGeocodeAsync({
              latitude: item.latitude,
              longitude: item.longitude,
            });

            if (address && address.length > 0) {
              const formattedAddress = `${address[0].name || ""}, ${
                address[0].street || ""
              }, ${address[0].city || ""}, ${address[0].region || ""}`;
              return {
                id: `${item.latitude}-${item.longitude}`,
                name: formattedAddress
                  .replace(/, ,/g, ",")
                  .replace(/^,|,$/g, "")
                  .trim(),
                latitude: item.latitude,
                longitude: item.longitude,
              };
            }
            return null;
          })
        );

        setSearchResults(locations.filter((location) => location !== null));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      Alert.alert("Error", "Failed to search locations. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    const coordinate = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    if (isSearchingPickup) {
      setPickupLocation(location.name);
      setPickupCoordinates(coordinate);
    } else {
      setDropLocation(location.name);
      setDropCoordinates(coordinate);
    }

    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);

    // Animate map to the selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...coordinate,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        },
        1000
      );
    }
  };

  const openSearchModal = (isPickup) => {
    setIsSearchingPickup(isPickup);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchModal(true);
  };

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setDropCoordinates(coordinate);

    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      if (geocode && geocode.length > 0) {
        const address = `${geocode[0].name || ""}, ${
          geocode[0].street || ""
        }, ${geocode[0].city || ""}, ${geocode[0].region || ""}`;
        setDropLocation(
          address.replace(/, ,/g, ",").replace(/^,|,$/g, "").trim()
        );
      } else {
        setDropLocation(
          `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(
            5
          )}`
        );
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setDropLocation(
        `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`
      );
    }
  };

  const handleRequestRide = async () => {
    if (!pickupCoordinates || !dropCoordinates) {
      Alert.alert("Error", "Please select pickup and drop locations.");
      return;
    }

    try {
      const pickupLocationString = `${pickupCoordinates.latitude},${pickupCoordinates.longitude}`;
      const dropLocationString = `${dropCoordinates.latitude},${dropCoordinates.longitude}`;

      const response = await fetch(`${BASE_URL}/api/rides/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          driverEmail,
          pickupLocation: pickupLocationString,
          dropoffLocation: dropLocationString,
        }),
      });

      const data = await response.json();
      console.log("📥 Ride Request Response:", data);

      if (response.ok) {
        Alert.alert("Success", "Ride request sent successfully!");
        navigation.navigate("TripSummary", { rideDetails: data.rideRequest });
      } else {
        Alert.alert("Error", data.message || "Failed to request ride");
      }
    } catch (error) {
      console.error("🚨 Error requesting ride:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Book Your Ride</Text>
        <Text style={styles.headerSubtitle}>
          Enter pickup and drop locations
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : driver ? (
        <View style={styles.card}>
          <Image
            source={{ uri: `${BASE_URL}${driver.photo}` }}
            style={styles.driverPhoto}
          />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ViewDriverProfile", { email: driver.email })
            }
            style={styles.driverInfo}
          >
            <Text style={styles.name}>🚗 {driver.name}</Text>
            <Text style={styles.detail}>📍 {driver.address}</Text>
            <Text style={styles.detail}>📞 {driver.contact}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.errorText}>Driver not found</Text>
      )}

      <View style={styles.locationsCard}>
        <TouchableOpacity
          style={styles.locationInput}
          onPress={() => openSearchModal(true)}
        >
          <View style={styles.iconContainer}>
            <View style={styles.dot} />
          </View>
          <Text
            style={
              pickupLocation ? styles.locationText : styles.locationPlaceholder
            }
          >
            {pickupLocation || "Enter pickup location"}
          </Text>
          <Ionicons name="search" size={20} color="#888" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.locationInput}
          onPress={() => openSearchModal(false)}
        >
          <View style={styles.iconContainer}>
            <View style={styles.square} />
          </View>
          <Text
            style={
              dropLocation ? styles.locationText : styles.locationPlaceholder
            }
          >
            {dropLocation || "Enter drop location"}
          </Text>
          <Ionicons name="search" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
              }
            : {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
              }
        }
        onPress={handleMapPress}
      >
        {pickupCoordinates && (
          <Marker
            coordinate={pickupCoordinates}
            pinColor="green"
            title="Pickup"
          />
        )}
        {dropCoordinates && (
          <Marker coordinate={dropCoordinates} pinColor="red" title="Drop" />
        )}
      </MapView>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestRide}
        disabled={!pickupCoordinates || !dropCoordinates}
      >
        <Text style={styles.buttonText}>🚕 Request Ride</Text>
      </TouchableOpacity>

      {/* Location Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isSearchingPickup
                  ? "Search Pickup Location"
                  : "Search Drop Location"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowSearchModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a location..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLocations(text);
                }}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            {searchLoading ? (
              <ActivityIndicator
                style={styles.searchLoading}
                size="large"
                color="#007BFF"
              />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleLocationSelect(item)}
                  >
                    <Ionicons
                      name="location"
                      size={20}
                      color="#007BFF"
                      style={styles.locationIcon}
                    />
                    <Text style={styles.resultText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  searchQuery.length > 2 ? (
                    <Text style={styles.noResults}>No locations found</Text>
                  ) : searchQuery.length > 0 ? (
                    <Text style={styles.noResults}>
                      Type at least 3 characters to search
                    </Text>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  headerCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#007BFF",
    borderRadius: 0,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e0e0e0",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    margin: 16,
  },
  locationsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  square: {
    width: 12,
    height: 12,
    backgroundColor: "#F44336",
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 36,
  },
  map: {
    flex: 1,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#28A745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  searchLoading: {
    marginTop: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  locationIcon: {
    marginRight: 12,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  noResults: {
    padding: 16,
    textAlign: "center",
    color: "#888",
  },
});

export default UserBookDriver;
