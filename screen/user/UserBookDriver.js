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
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { API_URL } from "../../config.js";

const BASE_URL = `${API_URL}`;

const UserBookDriver = () => {
  const [driver, setDriver] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropCoordinates, setDropCoordinates] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null); // 'pickup' or 'drop' or null
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { driverEmail } = route.params;
  const mapRef = useRef(null);

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (email) {
          setUserEmail(email);
        } else {
          Alert.alert("Error", "Please log in to book a ride.");
          navigation.navigate("Login");
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
          `${BASE_URL}/drivers/email/${driverEmail}`
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
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        const currentCoords = { latitude, longitude };

        setCurrentLocation(currentCoords);
        setPickupCoordinates(currentCoords);
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });

        // Use reverse geocoding to get the location name
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode && geocode.length > 0) {
          const address = geocode[0].name
            ? `${geocode[0].name}, ${geocode[0].street || ""} ${
                geocode[0].city || ""
              }, ${geocode[0].region || ""}`
            : `${geocode[0].street || ""} ${geocode[0].city || ""}, ${
                geocode[0].region || ""
              }`;

          setPickupLocation(address);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to fetch current location.");
      }
    };

    getUserEmail();
    fetchDriverDetails();
    getCurrentLocation();
  }, [driverEmail, navigation]);

  useEffect(() => {
    // Calculate estimated fare, distance and duration when both pickup and drop locations are set
    if (pickupCoordinates && dropCoordinates) {
      calculateEstimates();
    }
  }, [pickupCoordinates, dropCoordinates]);

  // Search for locations using Expo Location's geocoding
  const searchLocations = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      // Use Expo Location's geocodeAsync to search for locations
      const locations = await Location.geocodeAsync(query);

      // For each location, get more details using reverseGeocodeAsync
      const detailedResults = await Promise.all(
        locations.slice(0, 5).map(async (loc) => {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: loc.latitude,
            longitude: loc.longitude,
          });

          if (geocode && geocode.length > 0) {
            const item = geocode[0];
            return {
              id: `${loc.latitude},${loc.longitude}`,
              description: item.name
                ? `${item.name}, ${item.street || ""} ${item.city || ""}, ${
                    item.region || ""
                  }`
                : `${item.street || ""} ${item.city || ""}, ${
                    item.region || ""
                  }`,
              coordinates: {
                latitude: loc.latitude,
                longitude: loc.longitude,
              },
            };
          }

          return null;
        })
      );

      setSearchResults(detailedResults.filter((item) => item !== null));
    } catch (error) {
      console.error("Error searching locations:", error);
      setSearchResults([]);
    }
  };

  // Generate some predefined common locations if search fails
  const generatePredefinedLocations = (query) => {
    const cityName = "Your City"; // Replace with actual city based on user's region
    return [
      {
        id: "predefined1",
        description: `Airport, ${cityName}`,
        coordinates: {
          latitude: currentLocation ? currentLocation.latitude + 0.02 : 0,
          longitude: currentLocation ? currentLocation.longitude + 0.02 : 0,
        },
      },
      {
        id: "predefined2",
        description: `Central Mall, ${cityName}`,
        coordinates: {
          latitude: currentLocation ? currentLocation.latitude - 0.01 : 0,
          longitude: currentLocation ? currentLocation.longitude + 0.01 : 0,
        },
      },
      {
        id: "predefined3",
        description: `Railway Station, ${cityName}`,
        coordinates: {
          latitude: currentLocation ? currentLocation.latitude + 0.01 : 0,
          longitude: currentLocation ? currentLocation.longitude - 0.01 : 0,
        },
      },
    ];
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);

    if (text.length >= 3) {
      // Try to search using geocoding
      await searchLocations(text);

      // If no results, add some predefined locations
      if (searchResults.length === 0) {
        setSearchResults(generatePredefinedLocations(text));
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectLocation = (item) => {
    if (activeSearch === "pickup") {
      setPickupLocation(item.description);
      setPickupCoordinates(item.coordinates);
    } else if (activeSearch === "drop") {
      setDropLocation(item.description);
      setDropCoordinates(item.coordinates);
    }

    focusMapOnLocation(item.coordinates);
    setModalVisible(false);
    setActiveSearch(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const calculateEstimates = () => {
    try {
      // Calculate distance between pickup and drop locations (in km)
      const distance = calculateDistance(
        pickupCoordinates.latitude,
        pickupCoordinates.longitude,
        dropCoordinates.latitude,
        dropCoordinates.longitude
      );

      setEstimatedDistance(distance.toFixed(2));

      // Estimate duration (assuming average speed of 30 km/h)
      const durationInMinutes = Math.round((distance / 30) * 60);
      setEstimatedDuration(durationInMinutes);

      // Calculate fare (base rate + per km rate)
      const BASE_FARE = 50; // Base fare in INR/local currency
      const PER_KM_RATE = 12; // Rate per km
      const fare = BASE_FARE + distance * PER_KM_RATE;
      setEstimatedFare(Math.round(fare));
    } catch (error) {
      console.error("Error calculating estimates:", error);
    }
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleRequestRide = async () => {
    if (!pickupCoordinates || !dropCoordinates) {
      Alert.alert(
        "Error",
        "Please enter both pickup location and drop location."
      );
      return;
    }

    try {
      const pickupLocationString = `${pickupCoordinates.latitude},${pickupCoordinates.longitude}`;
      const dropLocationString = `${dropCoordinates.latitude},${dropCoordinates.longitude}`;

      const response = await fetch(`${BASE_URL}/rides/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          driverEmail,
          pickupLocation: pickupLocationString,
          dropoffLocation: dropLocationString,
          estimatedFare,
          estimatedDistance,
          estimatedDuration,
          pickupAddress: pickupLocation,
          dropoffAddress: dropLocation,
        }),
      });

      const data = await response.json();
      console.log("📥 Ride Request Response:", data);

      if (response.ok) {
        Alert.alert("Success", "Ride request sent successfully!");

        // Navigate to TripSummary with ride details
        navigation.navigate("TripSummary", { rideDetails: data.rideRequest });
      } else {
        Alert.alert("Error", data.message || "Failed to request ride");
      }
    } catch (error) {
      console.error("🚨 Error requesting ride:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const focusMapOnLocation = (coordinates) => {
    if (mapRef.current && coordinates) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    }
  };

  const openSearchModal = (type) => {
    setActiveSearch(type);
    setModalVisible(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleMapClick = (event) => {
    const coordinate = event.nativeEvent.coordinate;

    if (activeSearch === "pickup") {
      setPickupCoordinates(coordinate);
      updateLocationFromCoordinates(coordinate, true);
      setModalVisible(false);
      setActiveSearch(null);
    } else if (activeSearch === "drop") {
      setDropCoordinates(coordinate);
      updateLocationFromCoordinates(coordinate, false);
      setModalVisible(false);
      setActiveSearch(null);
    }
  };

  const updateLocationFromCoordinates = async (coordinates, isPickup) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0].name
          ? `${geocode[0].name}, ${geocode[0].street || ""} ${
              geocode[0].city || ""
            }, ${geocode[0].region || ""}`
          : `${geocode[0].street || ""} ${geocode[0].city || ""}, ${
              geocode[0].region || ""
            }`;

        if (isPickup) {
          setPickupLocation(address);
        } else {
          setDropLocation(address);
        }
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : driver ? (
          <View style={styles.card}>
            <Image
              source={{ uri: `${BASE_URL}${driver.photo}` }}
              style={styles.driverPhoto}
            />
            <View style={styles.driverInfo}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ViewDriverProfile", {
                    email: driver.email,
                  })
                }
              >
                <Text style={styles.name}>{driver.name}</Text>
                <Text style={styles.detail}>📍 {driver.address}</Text>
                <Text style={styles.detail}>📞 {driver.contact}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {driver.rating || "4.8"}</Text>
                  <Text style={styles.trips}>
                    🚗 {driver.tripsCompleted || "124"} trips
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>Driver not found</Text>
        )}

        <View style={styles.locationContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📍</Text>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => openSearchModal("pickup")}
            >
              <Text
                style={
                  pickupLocation ? styles.inputText : styles.inputPlaceholder
                }
                numberOfLines={1}
              >
                {pickupLocation || "Set Pickup Location"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🏁</Text>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => openSearchModal("drop")}
            >
              <Text
                style={
                  dropLocation ? styles.inputText : styles.inputPlaceholder
                }
                numberOfLines={1}
              >
                {dropLocation || "Set Drop Location"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={true}
          onPress={handleMapClick}
        >
          {pickupCoordinates && (
            <Marker
              coordinate={pickupCoordinates}
              title="Pickup"
              pinColor="#007BFF"
            />
          )}
          {dropCoordinates && (
            <Marker
              coordinate={dropCoordinates}
              title="Drop"
              pinColor="#FF5722"
            />
          )}
        </MapView>

        {estimatedFare && pickupCoordinates && dropCoordinates && (
          <View style={styles.estimateCard}>
            <Text style={styles.estimateTitle}>Ride Estimate</Text>
            <View style={styles.estimateRow}>
              <View style={styles.estimateItem}>
                <Text style={styles.estimateIcon}>💰</Text>
                <Text style={styles.estimateValue}>₹{estimatedFare}</Text>
                <Text style={styles.estimateLabel}>Est. Fare</Text>
              </View>
              <View style={styles.estimateItem}>
                <Text style={styles.estimateIcon}>📏</Text>
                <Text style={styles.estimateValue}>{estimatedDistance} km</Text>
                <Text style={styles.estimateLabel}>Distance</Text>
              </View>
              <View style={styles.estimateItem}>
                <Text style={styles.estimateIcon}>⏱️</Text>
                <Text style={styles.estimateValue}>
                  {estimatedDuration} min
                </Text>
                <Text style={styles.estimateLabel}>Duration</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            !pickupCoordinates || !dropCoordinates ? styles.disabledButton : {},
          ]}
          onPress={handleRequestRide}
          disabled={!pickupCoordinates || !dropCoordinates}
        >
          <Text style={styles.buttonText}>Request Ride</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setActiveSearch(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeSearch === "pickup"
                  ? "Set Pickup Location"
                  : "Set Drop Location"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setActiveSearch(null);
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
            />

            <Text style={styles.tapMapText}>
              Or go back and tap on the map to select a location
            </Text>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => selectLocation(item)}
                >
                  <Text style={styles.resultIcon}>📍</Text>
                  <Text style={styles.resultText}>{item.description}</Text>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
              ListEmptyComponent={
                searchQuery.length >= 3 ? (
                  <Text style={styles.noResults}>
                    No locations found. Try a different search or tap on the
                    map.
                  </Text>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  driverPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 6,
  },
  rating: {
    fontSize: 14,
    color: "#333",
    marginRight: 12,
  },
  trips: {
    fontSize: 14,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginBottom: 10,
  },
  locationContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 16,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
  },
  inputText: {
    color: "#333",
    fontSize: 16,
  },
  inputPlaceholder: {
    color: "#888",
    fontSize: 16,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  estimateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estimateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  estimateRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  estimateItem: {
    alignItems: "center",
  },
  estimateIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 4,
  },
  estimateLabel: {
    fontSize: 12,
    color: "#777",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#B0C4DE",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#555",
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  tapMapText: {
    textAlign: "center",
    color: "#777",
    marginVertical: 8,
  },
  resultsList: {
    marginTop: 8,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  noResults: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    padding: 16,
  },
});

export default UserBookDriver;
