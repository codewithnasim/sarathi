import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  // 🔹 Fetch User Data
  const fetchUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) {
        Alert.alert("Error", "User email not found. Please log in again.");
        setLoading(false);
        return;
      }

      const url = `https://sarathi-backend-file.onrender.com/api/users/email/${email}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setUserData(data);
      } else {
        Alert.alert("Error", data.message || "User not found.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userEmail");
    Alert.alert("Logged Out", "You have been logged out successfully.");
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : userData ? (
        <View style={styles.profileContainer}>
          {/* User Image */}
          <Image
            source={{
              uri: userData.photo
                ? `http://192.168.245.154:5000${userData.photo}`
                : "https://via.placeholder.com/120",
            }}
            style={styles.userPhoto}
            resizeMode="cover"
          />

          {/* User Info */}
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userInfo}>📧 {userData.email}</Text>
          <Text style={styles.userInfo}>🏡 {userData.address}</Text>
          <Text style={styles.userInfo}>📞 {userData.phoneNo}</Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Alert.alert("Edit Profile", "Edit feature coming soon!")
            }
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Alert.alert("Help & Support", "Redirecting to help...")
            }
          >
            <Text style={styles.buttonText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.errorText}>User data not found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: "90%",
  },
  userPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  button: {
    marginTop: 15,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});

export default UserProfile;
