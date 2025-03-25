import React from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert 
} from "react-native";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const TripSummary = () => {
  const route = useRoute();
  const { rideDetails } = route.params || {};

  if (!rideDetails) {
    return <Text style={styles.errorText}>No ride details available</Text>;
  }

  // Extract ride details or use default values
  const userName = rideDetails.user?.name || "Unknown User";
  const userEmail = rideDetails.user?.email || "N/A";
  const userPhone = rideDetails.user?.phone || "N/A";

  const driverName = rideDetails.driver?.name || "Unknown Driver";
  const driverEmail = rideDetails.driver?.email || "N/A";
  const driverPhone = rideDetails.driver?.phone || "N/A";

  const pickupLocation = rideDetails.pickupLocation || "Unknown Pickup";
  const dropoffLocation = rideDetails.dropoffLocation || "Unknown Drop";
  const fare = rideDetails.fare || "100 INR";
  const vehicleType = rideDetails.vehicleType || "Standard";
  const status = rideDetails.status || "Pending";

  // Generate PDF Receipt
  const generatePDF = async () => {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="text-align: center; color: #007BFF;">Trip Receipt</h2>
          <hr/>
          <h3>User Details:</h3>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Phone:</strong> ${userPhone}</p>
          
          <h3>Driver Details:</h3>
          <p><strong>Name:</strong> ${driverName}</p>
          <p><strong>Email:</strong> ${driverEmail}</p>
          <p><strong>Phone:</strong> ${driverPhone}</p>

          <h3>Ride Details:</h3>
          <p><strong>Pickup:</strong> ${pickupLocation}</p>
          <p><strong>Dropoff:</strong> ${dropoffLocation}</p>
          <p><strong>Fare:</strong> ${fare}</p>
          <p><strong>Vehicle Type:</strong> ${vehicleType}</p>
          <p><strong>Status:</strong> ${status}</p>

          <hr/>
          <p style="text-align: center; color: #28A745;">Thank you for choosing our service!</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      const pdfPath = `${FileSystem.documentDirectory}trip_receipt.pdf`;

      await FileSystem.moveAsync({
        from: uri,
        to: pdfPath,
      });

      Alert.alert("Success", "Receipt generated successfully!", [
        { text: "View", onPress: () => Sharing.shareAsync(pdfPath) },
      ]);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate receipt.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🚖 Trip Summary</Text>

      {/* User Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="user" size={20} color="#007BFF" /> User Details
        </Text>
        <Text style={styles.detail}><MaterialIcons name="person" size={16} /> {userName}</Text>
        <Text style={styles.detail}><MaterialIcons name="email" size={16} /> {userEmail}</Text>
        <Text style={styles.detail}><MaterialIcons name="phone" size={16} /> {userPhone}</Text>
      </View>

      {/* Driver Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="id-card" size={20} color="#28A745" /> Driver Details
        </Text>
        <Text style={styles.detail}><MaterialIcons name="person" size={16} /> {driverName}</Text>
        <Text style={styles.detail}><MaterialIcons name="email" size={16} /> {driverEmail}</Text>
        <Text style={styles.detail}><MaterialIcons name="phone" size={16} /> {driverPhone}</Text>
      </View>

      {/* Ride Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <FontAwesome5 name="car" size={20} color="#FFC107" /> Ride Details
        </Text>
        <Text style={styles.detail}><MaterialIcons name="location-pin" size={16} /> Pickup: {pickupLocation}</Text>
        <Text style={styles.detail}><MaterialIcons name="location-on" size={16} /> Dropoff: {dropoffLocation}</Text>
        <Text style={styles.detail}><FontAwesome5 name="money-bill-alt" size={16} /> Fare: {fare}</Text>
        <Text style={styles.detail}><MaterialIcons name="directions-car" size={16} /> Vehicle: {vehicleType}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      {/* Download Button */}
      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText}>📄 Download Receipt</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 15, 
    color: "#007BFF" 
  },
  card: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    width: "100%", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    elevation: 5, 
    marginBottom: 15 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 5, 
    color: "#333" 
  },
  detail: { 
    fontSize: 16, 
    color: "#555", 
    marginTop: 5 
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28A745",
    marginTop: 10,
  },
  button: { 
    backgroundColor: "#007BFF", 
    padding: 15, 
    borderRadius: 10, 
    width: "100%", 
    alignItems: "center", 
    marginTop: 10 
  },
  buttonText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  errorText: { 
    fontSize: 18, 
    color: "red", 
    textAlign: "center" 
  },
});

export default TripSummary;
