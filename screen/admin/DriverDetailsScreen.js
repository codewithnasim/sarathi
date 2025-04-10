import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import axios from "axios";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const BASE_URL = "https://sarathi-backend-file.onrender.com"; // Replace with your actual backend IP

const DriverDetailsScreen = ({ route, navigation }) => {
  const { driver } = route.params;

  const imageUrl = driver.photo.startsWith("http") ? driver.photo : `${BASE_URL}${driver.photo}`;

  // Contact Driver
  const handleContactDriver = () => {
    Linking.openURL(`tel:${driver.contact}`);
  };

  // Edit Driver Details (Future Feature)
  const handleEditDriver = () => {
    Alert.alert("✏️ Edit Driver", "This feature is coming soon!");
  };

  // Approve Driver
  const handleApprove = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/approve-driver`, { driverId: driver._id });
      Alert.alert("✅ Success", "Driver approved!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("❌ Error", "Failed to approve driver.");
    }
  };

  // Reject Driver
  const handleReject = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/reject-driver`, { driverId: driver._id });
      Alert.alert("✅ Success", "Driver rejected.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("❌ Error", "Failed to reject driver.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <Image source={{ uri: imageUrl }} style={styles.profileImage} />

      {/* Driver Details Section */}
      <View style={styles.infoCard}>
        <Text style={styles.name}>{driver.name}</Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color="#3498DB" />
          <Text style={styles.detail}>{driver.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome5 name="phone" size={18} color="#2ECC71" />
          <Text style={styles.detail}>{driver.contact}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color="#E74C3C" />
          <Text style={styles.detail}>{driver.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome5 name="briefcase" size={18} color="#F1C40F" />
          <Text style={styles.detail}>{driver.experience} years of experience</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="card-membership" size={20} color="#9B59B6" />
          <Text style={styles.detail}>License No: {driver.licenseNo}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="badge" size={20} color="#1ABC9C" />
          <Text style={styles.detail}>License Type: {driver.licenseType}</Text>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome5 name="id-card" size={18} color="#FF5733" />
          <Text style={styles.detail}>Aadhar No: {driver.adharNo}</Text>
        </View>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactDriver}>
          <Text style={styles.buttonText}>📞 Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEditDriver}>
          <Text style={styles.buttonText}>✏️ Edit Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
          <Text style={styles.buttonText}>✅ Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
          <Text style={styles.buttonText}>❌ Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: "center", 
    backgroundColor: "#004D40" // Soft Grey Background
  },
  profileImage: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    marginBottom: 15, 
    borderWidth: 4, 
    borderColor: "#3498DB"
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  name: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 15, 
    color: "#2C3E50",
    fontFamily: "sans-serif-medium"
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detail: { 
    fontSize: 16, 
    color: "#333", 
    marginLeft: 10,
    fontFamily: "sans-serif"
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%", 
    marginBottom: 15,
  },
  contactButton: { 
    backgroundColor: "#3498DB", 
    padding: 12, 
    borderRadius: 8, 
    width: "47%", 
    alignItems: "center",
    elevation: 3,
  },
  editButton: { 
    backgroundColor: "#F1C40F", 
    padding: 12, 
    borderRadius: 8, 
    width: "47%", 
    alignItems: "center",
    elevation: 3,
  },
  approveButton: { 
    backgroundColor: "#2ECC71", 
    padding: 12, 
    borderRadius: 8, 
    width: "47%", 
    alignItems: "center", 
    elevation: 3,
  },
  rejectButton: { 
    backgroundColor: "#E74C3C", 
    padding: 12, 
    borderRadius: 8, 
    width: "47%", 
    alignItems: "center", 
    elevation: 3,
  },
  buttonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold",
    fontFamily: "sans-serif-medium"
  },
});

export default DriverDetailsScreen;
