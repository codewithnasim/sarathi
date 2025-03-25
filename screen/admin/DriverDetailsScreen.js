import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import axios from "axios";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { API_URL } from "../../config.js";

const BASE_URL = `${API_URL}`;

const getImageUrl = (photo) => {
  return photo.startsWith("http") ? photo : `${BASE_URL}${photo}`;
};

const DriverDetailsScreen = ({ route, navigation }) => {
  const { driver } = route.params;
  const imageUrl = getImageUrl(driver.photo);

  const handleContactDriver = () => {
    Linking.openURL(`tel:${driver.contact}`);
  };

  const handleEditDriver = () => {
    Alert.alert("✏️ Edit Driver", "This feature is coming soon!");
  };

  const handleApprove = async () => {
    try {
      await axios.post(`${BASE_URL}/admin/approve-driver`, {
        driverId: driver._id,
      });
      Alert.alert("✅ Success", "Driver approved!");
      navigation.goBack();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Alert.alert(
        "❌ Error",
        error.response?.data?.message || "Failed to approve driver."
      );
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`${BASE_URL}/admin/reject-driver`, {
        driverId: driver._id,
      });
      Alert.alert("✅ Success", "Driver rejected.");
      navigation.goBack();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Alert.alert(
        "❌ Error",
        error.response?.data?.message || "Failed to reject driver."
      );
    }
  };

  const confirmAction = (action) => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${action} this driver?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () =>
            action === "approve" ? handleApprove() : handleReject(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.profileImage} />
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
          <Text style={styles.detail}>
            {driver.experience} years of experience
          </Text>
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactDriver}
        >
          <Text style={styles.buttonText}>📞 Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEditDriver}>
          <Text style={styles.buttonText}>✏️ Edit Details</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => confirmAction("approve")}
        >
          <Text style={styles.buttonText}>✅ Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => confirmAction("reject")}
        >
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
    backgroundColor: "#f5f5f5",
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#2ECC71",
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
  },
  editButton: {
    backgroundColor: "#F1C40F",
    padding: 12,
    borderRadius: 8,
    width: "47%",
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    width: "47%",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#FE4F2D",
    color: "white",
    padding: 12,
    borderRadius: 8,
    width: "47%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
});

export default DriverDetailsScreen;
