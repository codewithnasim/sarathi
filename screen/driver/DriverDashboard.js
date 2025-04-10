import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Button } from "react-native-paper";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";

const BASE_URL = "https://sarathi-backend-file.onrender.com";
const { width } = Dimensions.get("window");

const menuItems = [
  { title: "Ride Requests", screen: "RideRequests" },
  { title: "Reviews", screen: "Review" },
  { title: "Earnings", screen: "Earnings" },
  { title: "Settings", screen: "Settings" },
  { title: "Profile", screen: "DriverProfile" },
  { title: "Support", screen: "DriverChatBot" },
];

const promotions = [
  {
    id: 1,
    title: "Earn more during peak hours!",
    image: require("./pic/oney(1).png"),
  },
  {
    id: 2,
    title: "Invite friends & get ₹100 bonus",
    image: require("./pic/oney.png"),
  },
  {
    id: 3,
    title: "Complete 10 rides for extra ₹200",
    image: require("./pic/oney(2).png"),
  },
];

const DriverDashboard = ({ navigation }) => {
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const carouselRef = useRef(null);
  const scrollIndex = useRef(0);

  useEffect(() => {
    fetchDriverDetails();
    getLocation();
    const interval = setInterval(() => {
      autoScrollCarousel();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(locationData.coords);
      const formattedLocation = `${address[0].city || ""}, ${
        address[0].region || ""
      }`;
      setLocation(formattedLocation);
    })();
  }, []);

  useEffect(() => {
    let locationInterval;

    const startLocationUpdates = async () => {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (!storedEmail) return;

      locationInterval = setInterval(async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") return;

          const loc = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = loc.coords;

          await fetch(`${BASE_URL}/api/driver-location/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: storedEmail, latitude, longitude }),
          });
        } catch (err) {
          console.error("Location update error:", err);
        }
      }, 10000); // Update every 10 seconds
    };

    if (isOnline) {
      startLocationUpdates();
    } else {
      clearInterval(locationInterval);
    }

    return () => clearInterval(locationInterval);
  }, [isOnline]);

  const fetchDriverDetails = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (!storedEmail) {
        Alert.alert("Error", "No email found.");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `${BASE_URL}/api/drivers/email/${storedEmail}`
      );
      const data = await response.json();
      if (response.ok) {
        setDriver(data);
        setIsOnline(data.isOnline || false);
      } else {
        Alert.alert("Error", "Failed to fetch driver details.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync(loc.coords);
    setLocation(address[0]?.city || "Unknown");
  };
  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    if (newStatus) {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const loc = await Location.getCurrentPositionAsync({});
      await fetch(`${BASE_URL}/api/driver-location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: storedEmail,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }),
      });
    }
  };

  const autoScrollCarousel = () => {
    if (carouselRef.current) {
      scrollIndex.current = (scrollIndex.current + 1) % promotions.length;
      carouselRef.current.scrollToIndex({
        index: scrollIndex.current,
        animated: true,
      });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
    );
  }

  if (!driver) {
    return <Text style={styles.errorText}>Driver profile not found</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E1E2F" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: driver.photo
              ? `${BASE_URL}${driver.photo}`
              : "https://via.placeholder.com/100",
          }}
          style={styles.profilePic}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.headerTopRow}>
            <Text style={styles.name}>Welcome, {driver.name}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("DriverNotificationScreen")}
            >
              <AntDesign name="bells" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.info}>
            💰 ₹{driver.earning || 0} | 🚗 {driver.totalDrives || 0} Rides
          </Text>
          <Text
            style={[styles.status, { color: isOnline ? "lightgreen" : "red" }]}
          >
            {isOnline ? "🟢 Online" : "🔴 Offline"}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <AntDesign name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{driver.rating || 4.8}</Text>
          </View>

          {/* Location */}
          <Text style={styles.locationText}>
            📍 {location || "Fetching location..."}
          </Text>
        </View>
      </View>

      {/* Status Button */}
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          onPress={toggleOnlineStatus}
          style={[
            styles.statusButton,
            isOnline ? styles.online : styles.offline,
          ]}
        >
          {isOnline ? "Go Offline" : "Go Online"}
        </Button>
      </View>

      {/* Carousel */}
      <FlatList
        ref={carouselRef}
        data={promotions}
        horizontal
        pagingEnabled
        snapToInterval={width * 0.85 + 12} // card width + marginRight
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.promoCard}>
            <Image source={item.image} style={styles.promoImage} />
            <Text style={styles.promoTitle}>{item.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.promoContainer}
      />

      {/* Menu Buttons */}
      <ScrollView contentContainerStyle={styles.menuContainer}>
        {menuItems
          .reduce((rows, item, index) => {
            if (index % 2 === 0) rows.push(menuItems.slice(index, index + 2));
            return rows;
          }, [])
          .map((row, i) => (
            <View key={i} style={styles.buttonRow}>
              {row.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.menuButton}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <AntDesign name="appstore-o" size={22} color="#3A3A55" />
                  <Text style={styles.menuText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
      </ScrollView>

      {/* Chat Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("ChatScreen")}
      >
        <FontAwesome name="comments" size={22} color="white" />
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", padding: 10 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1E3A8A",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    height: 160, // increased height
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 14,
  },
  locationText: {
    fontSize: 13,
    color: "#E0E0E0",
    marginTop: 5,
  },
  profilePic: { width: 80, height: 120, borderRadius: 30, marginRight: 20 },
  headerDetails: { flex: 1, marginLeft: 10 },
  name: { color: "white", fontSize: 18, fontWeight: "bold" },
  rating: { color: "#FFD700", fontSize: 14 },
  location: { color: "#D3D3D3", fontSize: 12 },

  statusButton: { flex: 1, padding: 12, borderRadius: 8, marginVertical: 10 },
  online: { backgroundColor: "#28A745" },
  offline: { backgroundColor: "#DC3545" },

  promoContainer: { paddingVertical: 10 },
  promoCard: {
    width: width * 0.85,
    marginRight: 12,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },
  promoImage: {
    width: "100%",
    height: 130,
    resizeMode: "cover", // Try "contain" if your images are small
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  promoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E1E2F",
    padding: 10,
  },

  menuContainer: { flexGrow: 1 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  menuButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  menuText: {
    fontSize: 14,
    marginLeft: 10,
    color: "#3A3A55",
    fontWeight: "bold",
  },

  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E2F",
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

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16, textAlign: "center", marginTop: 20 },
});

export default DriverDashboard;
