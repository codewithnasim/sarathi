import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  FlatList,
} from "react-native";
import { Appbar, Divider, Card, Button } from "react-native-paper";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const promotions = [
  { id: 1, text: "🔥 20% Off on First Ride!", color: "#FF6F61" },
  { id: 2, text: "🎁 Refer & Earn Rewards", color: "#6A89CC" },
  { id: 3, text: "🚀 Priority Support for Premium Users", color: "#82CCDD" },
];

const UserDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const scrollRef = useRef(null);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    fetchUserData();
    requestLocationPermission();
    const interval = setInterval(() => {
      scrollToNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [promoIndex]);

  const scrollToNext = () => {
    const nextIndex = (promoIndex + 1) % promotions.length;
    setPromoIndex(nextIndex);
    scrollRef.current?.scrollToOffset({
      offset: nextIndex * width,
      animated: true,
    });
  };

  const fetchUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return;
      const url = `https://sarathi-backend-file.onrender.com/api/users/email/${email}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setUserData(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }
    getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      sendLocationToBackend(loc.coords);
    } catch (error) {
      console.error("Location error:", error);
    }
  };

  const sendLocationToBackend = async (coords) => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return;
      await fetch(
        "https://sarathi-backend-file.onrender.com/api/users/update-location",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            latitude: coords.latitude,
            longitude: coords.longitude,
          }),
        }
      );
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="User Dashboard"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Appbar.Action
          icon="account-circle"
          onPress={() => navigation.navigate("UserProfile")}
        />
        <Appbar.Action
          icon="bell-outline"
          onPress={() => navigation.navigate("UserNotificationScreen")}
        />
        <Appbar.Action
          icon="logout"
          onPress={() =>
            AsyncStorage.removeItem("userEmail").then(() =>
              navigation.replace("Login")
            )
          }
        />
      </Appbar.Header>

      {/* Promotions Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={promotions}
          renderItem={({ item }) => (
            <View style={[styles.promoCard, { backgroundColor: item.color }]}>
              <Text style={styles.promoText}>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0077b6"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Profile Info Card */}
          <Card style={styles.profileCard}>
            <Card.Content style={{ alignItems: "center" }}>
              {userData?.photo ? (
                <Image
                  source={{
                    uri: `https://sarathi-backend-file.onrender.com${userData.photo}`,
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <Icon name="account-circle" size={80} color="#ccc" />
              )}
              <Text style={styles.name}>{userData?.name || "User"}</Text>
              <Text style={styles.info}>📧 {userData?.email}</Text>
              <Text style={styles.info}>🏠 {userData?.address}</Text>
              {location && (
                <Text style={styles.info}>
                  📍 {location.latitude.toFixed(2)},{" "}
                  {location.longitude.toFixed(2)}
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Dashboard Buttons */}
          <View style={styles.gridContainer}>
            {[
              {
                icon: "history",
                label: "Trip History",
                screen: "TripHistoryUser",
              },
              { icon: "car", label: "Drivers", screen: "DriverSearch" },
              {
                icon: "map-marker",
                label: "Track",
                screen: "UserTrackMapWithDirection",
              },
              { icon: "credit-card", label: "Payment", screen: "Payments" },
              { icon: "account-edit", label: "Edit", screen: "UserProfile" },
              { icon: "star", label: "My Ratings", screen: "MyRatings" },
              { icon: "message", label: "Support", screen: "Support" },
              { icon: "chat", label: "Chat", screen: "ChatScreen" },
            ].map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.gridButton}
                onPress={() =>
                  navigation.navigate(
                    btn.screen,
                    btn.screen === "ChatConnectionList"
                      ? { name: userData?.name, value: 1 }
                      : {}
                  )
                }
              >
                <Icon name={btn.icon} size={28} color="#fff" />
                <Text style={styles.gridText}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Section */}
          {/* Summary Section */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Your Stats</Text>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Icon name="car" size={24} color="#0077b6" />
                  <Text style={styles.statNumber}>10</Text>
                  <Text style={styles.statLabel}>Trips</Text>
                </View>
                <View style={styles.statCard}>
                  <Icon name="star" size={24} color="#FFD700" />
                  <Text style={styles.statNumber}>4.5</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statCard}>
                  <Icon name="account-group" size={24} color="#6A89CC" />
                  <Text style={styles.statNumber}>120</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f8ff" },
  header: { backgroundColor: "#0077b6" },
  carouselContainer: { height: 100, marginVertical: 10 },
  promoCard: { width, justifyContent: "center", alignItems: "center" },
  promoText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  scrollContainer: { padding: 16 },
  profileCard: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "bold" },
  info: { fontSize: 14, color: "#333" },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridButton: {
    width: "47%",
    backgroundColor: "#0077b6",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  gridText: { color: "#fff", marginTop: 5, fontWeight: "bold" },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    alignSelf: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    width: "30%",
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#777",
  },
  statBox: { fontSize: 16, color: "#555" },
});

export default UserDashboard;
