import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
// import * as Location from "expo-location";
import { Button, Card, Appbar, Divider } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { API_URL } from "../../config.js";

const UserDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchUserData();
    requestLocationPermission();
  }, []);

  const fetchUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) {
        setLoading(false);
        return;
      }
      const url = `${API_URL}/users/email/${email}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setUserData(data);
      } else {
        console.error("Error fetching user:", data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }
    getCurrentLocation();
  };

  // Add to your imports at the top

  // Modify the getCurrentLocation function:
  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);

      // Get location name using reverse geocoding
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Create location object with both coordinates and address information
      const locationData = {
        coords: location.coords,
        address: geocode[0] ? formatAddress(geocode[0]) : "Unknown location",
      };

      setLocation(locationData);
      sendLocationToBackend(location.coords, locationData.address);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Helper function to format address
  const formatAddress = (addressObj) => {
    const parts = [];
    if (addressObj.name) parts.push(addressObj.name);
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.region) parts.push(addressObj.region);
    if (addressObj.country) parts.push(addressObj.country);

    return parts.join(", ");
  };

  // Modify the sendLocationToBackend function:
  const sendLocationToBackend = async (coords, locationName) => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return;
      await fetch(`${API_URL}/users/update-location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          latitude: coords.latitude,
          longitude: coords.longitude,
          locationName: locationName, // Add the location name
        }),
      });
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  // Then update the display in the Card.Content section:

  useEffect(() => {
    const locationInterval = setInterval(() => {
      getCurrentLocation();
    }, 10000);
    return () => clearInterval(locationInterval);
  }, []);

  return (
    <LinearGradient
      colors={["#00b4d8", "#0096c7", "#0077b6"]}
      style={styles.gradient}
    >
      {/* App Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="User Dashboard"
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon={({ size, color }) => (
            <Icon name="account-circle" size={size} color={color} />
          )}
          onPress={() => navigation.navigate("UserProfile")}
        />
        <Appbar.Action
          icon={({ size, color }) => (
            <Icon name="bell-outline" size={size} color={color} />
          )}
          onPress={() => navigation.navigate("UserNotificationScreen")}
        />
        <Appbar.Action
          icon={({ size, color }) => (
            <Icon name="logout" size={size} color={color} />
          )}
          onPress={() =>
            AsyncStorage.removeItem("userEmail").then(() =>
              navigation.replace("Login")
            )
          }
        />
      </Appbar.Header>

      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {userData?.name || "User"} 👋</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Card style={styles.userCard}>
            <Card.Content>
              <View style={styles.imageContainer}>
                {userData?.photo ? (
                  <Image
                    source={{
                      uri: `${API_URL}${userData.photo}`,
                    }}
                    style={styles.userPhoto}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.noPhotoText}>No Photo</Text>
                )}
              </View>
              <Text style={styles.userInfo}>📧 Email : {userData?.email}</Text>
              <Text style={styles.userInfo}>
                🏡 User Address : {userData?.address}
              </Text>
              {location && (
                <Text style={styles.userInfo}>
                  📍Current Location: {location.address || "Unknown location"}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        <Divider style={styles.divider} />

        {/* Buttons for Various Actions */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.button}
            icon="history"
            onPress={() => navigation.navigate("TripHistoryUser")}
          >
            Trip History
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            icon="car"
            onPress={() => navigation.navigate("DriverSearch")}
          >
            Nearby Drivers
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            icon="map-marker"
            onPress={() => alert("Track Live Location")}
          >
            Track Location
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            icon="credit-card"
            onPress={() => alert("Make a Payment")}
          >
            Make Payment
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            icon="message"
            onPress={() => alert("Contact Support")}
          >
            Contact Support
          </Button>
          {/* Newly added buttons */}
          <Button
            mode="contained"
            style={styles.button}
            icon="car"
            onPress={() => navigation.navigate("DriverSearch")}
          >
            Book a Ride
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            icon="star"
            onPress={() => navigation.navigate("MyRatings")}
          >
            My Ratings
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            icon="account-edit"
            onPress={() => navigation.navigate("UserProfile")}
          >
            Edit Profile
          </Button>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              navigation.navigate("ChatConnectionList", {
                email: userData?.email,
                value: 1,
              })
            }
          >
            <FontAwesome name="comments" size={24} color="white" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, padding: 20 },
  header: { backgroundColor: "#0077b6" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff",
    alignSelf: "center",
  },
  noPhotoText: {
    fontSize: 14,
    color: "#0077b6",
    textAlign: "center",
    marginBottom: 10,
  },
  userInfo: { fontSize: 14, color: "#333", marginBottom: 2 },
  divider: { backgroundColor: "#0077b6", height: 1, marginVertical: 15 },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#ff6f61",
    paddingVertical: 10,
    width: "48%",
    marginBottom: 10,
    borderRadius: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default UserDashboard;
