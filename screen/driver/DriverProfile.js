import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://sarathi-backend-file.onrender.com";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        if (!storedEmail) return;

        const response = await fetch(
          `${BASE_URL}/api/drivers/email/${storedEmail}`
        );
        const data = await response.json();
        if (response.ok) setDriver(data);
      } catch (error) {
        console.error("Error fetching driver:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Driver profile not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#1E3A8A" barStyle="light-content" />

      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={
            driver.photo
              ? { uri: `${BASE_URL}${driver.photo}` }
              : require("./pic/d.png")
          }
          style={styles.profileImage}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{driver.name}</Text>
          <Text style={styles.subText}>📧 {driver.email}</Text>
          <Text style={styles.subText}>📞 {driver.contact}</Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <Text style={styles.info}>📆 DOB: {driver.dob}</Text>
        <Text style={styles.info}>🏠 Address: {driver.address}</Text>
        <Text style={styles.info}>
          🔰 Experience: {driver.experience} years
        </Text>
        <Text style={styles.info}>🛠️ Type: {driver.expType}</Text>
      </View>

      {/* License Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>License Details</Text>
        <Text style={styles.info}>🆔 License No: {driver.licenseNo}</Text>
        <Text style={styles.info}>📜 License Type: {driver.licenseType}</Text>
      </View>

      {/* Aadhaar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aadhaar Info</Text>
        <Text style={styles.info}>🆔 Aadhaar No: {driver.adharNo}</Text>
        {driver.adharPhoto && (
          <Image
            source={{ uri: `${BASE_URL}${driver.adharPhoto}` }}
            style={styles.adharImage}
          />
        )}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#1E40AF" }]}
          onPress={() => console.log("Update Profile Pressed")} // Replace with your navigation
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
          onPress={async () => {
            await AsyncStorage.clear();
            // Navigate to login or landing screen
            console.log("Logged out");
          }}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DriverProfile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: "#F4F6FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#1E3A8A",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subText: {
    color: "#D3D3D3",
    fontSize: 14,
    marginTop: 3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  info: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
  },
  adharImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
