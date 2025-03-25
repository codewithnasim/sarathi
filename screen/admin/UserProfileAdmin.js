import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../../config.js";

const UserProfileAdmin = ({ route, navigation }) => {
  const { email } = route.params || {}; // Destructure email from route.params
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!email) {
      console.error("User email is not passed properly");
      return;
    }

    const fetchUserData = async () => {
      try {
        console.log(`Making request to: ${API_URL}/admin/user/${email}`);
        const response = await axios.get(`${API_URL}/admin/user/${email}`);
        console.log("User data fetched:", response.data);

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [email]);

  if (!user) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  const phoneNo = user.phoneNo || "N/A";
  const photo = user.photo
    ? `${API_URL}${user.photo}`
    : "https://via.placeholder.com/150";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <Image source={{ uri: photo }} style={styles.userImage} />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <DetailRow label="Phone" value={phoneNo} />
        <DetailRow label="Address" value={user.address} />
        <DetailRow label="Aadhar Card" value={user.adhaarCard} />
        <DetailRow label="Driving License" value={user.drivingLicense} />
        <DetailRow label="Gender" value={user.gender} />
        <DetailRow label="Date of Birth" value={user.dob} />
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#004D40",
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
    padding: 25,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  userImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: "#007bff",
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: "#777",
    marginBottom: 20,
  },
  detailsContainer: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 16,
    color: "#444",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    color: "#555",
    fontWeight: "400",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    width: "45%",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default UserProfileAdmin;
