import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ViewDriverProfile = ({ route }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const { email } = route.params;

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        // Retrieve stored email from AsyncStorage
        const storedEmail = email;

        if (!storedEmail) {
          console.error("❌ No email found in AsyncStorage.");
          return;
        }

        console.log("📩 Stored Email:", storedEmail);

        // Fetch driver data from MongoDB
        const response = await fetch(
          `https://sarathi-backend-file.onrender.com/api/drivers/email/${storedEmail}`
        );
        const data = await response.json();

        if (response.ok) {
          setDriver(data);
        } else {
          console.error("❌ Error fetching driver:", data.message);
        }
      } catch (error) {
        console.error("❌ Fetch Error:", error);
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
      {/* Profile Image */}
      <Image
        source={
          driver.photo
            ? { uri: `http://192.168.245.154:5000${driver.photo}` }
            : require("./pic/d.png")
        }
        style={styles.profileImage}
      />

      {/* Driver Details */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.info}>📧 Email: {driver.email}</Text>
        <Text style={styles.info}>📞 Contact: {driver.contact}</Text>
        <Text style={styles.info}>📆 DOB: {driver.dob}</Text>
        <Text style={styles.info}>🏠 Address: {driver.address}</Text>
        <Text style={styles.info}>
          🔰 Experience: {driver.experience} years
        </Text>
        <Text style={styles.info}>🛠️ Experience Type: {driver.expType}</Text>
        <Text style={styles.info}>🆔 License No: {driver.licenseNo}</Text>
        <Text style={styles.info}>📜 License Type: {driver.licenseType}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  adharImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginTop: 20,
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#343a40",
  },
  info: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 5,
  },
});
export default ViewDriverProfile;
