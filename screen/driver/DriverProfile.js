import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        if (!storedEmail)
          return console.error("No email found in AsyncStorage.");

        const response = await fetch(`${API_URL}/drivers/email/${storedEmail}`);
        const data = await response.json();

        if (response.ok) setDriver(data);
        else console.error("Error fetching driver:", data.message);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
      <Image
        source={
          driver.photo
            ? { uri: `${API_URL}/${driver.photo}` }
            : require("./pic/d.png")
        }
        style={styles.profileImage}
      />
      <Text style={styles.name}>{driver.name}</Text>
      <View style={styles.infoContainer}>
        <InfoItem label="Email" value={driver.email} />
        <InfoItem label="Contact" value={driver.contact} />
        <InfoItem label="DOB" value={driver.dob} />
        <InfoItem label="Address" value={driver.address} />
        <InfoItem label="Experience" value={`${driver.experience} years`} />
        <InfoItem label="Experience Type" value={driver.expType} />
        <InfoItem label="License No" value={driver.licenseNo} />
        <InfoItem label="License Type" value={driver.licenseType} />
        <InfoItem label="Aadhaar No" value={driver.adharNo} />
      </View>
      {driver.adharPhoto && (
        <Image
          source={{ uri: `${API_URL}${driver.adharPhoto}` }}
          style={styles.adharImage}
        />
      )}
    </ScrollView>
  );
};

const InfoItem = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
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
    color: "#D9534F",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginBottom: 10,
  },
  adharImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginTop: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
});

export default DriverProfile;
