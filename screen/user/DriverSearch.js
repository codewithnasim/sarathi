import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const BASE_URL = "https://sarathi-backend-file.onrender.com"; // Replace with your backend IP
const screenWidth = Dimensions.get("window").width;

const DriverSearch = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const getUserEmailAndDrivers = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        const userEmail = await AsyncStorage.getItem("userEmail");
        console.log("User email:", userEmail); // 👈 Add this line

        if (!email) {
          Alert.alert("Login Required", "Please log in to book a ride.");
          return;
        }
        await fetchNearbyDrivers();
      } catch (error) {
        console.error("Error getting user email:", error);
      }
    };

    getUserEmailAndDrivers();
  }, []);

  const fetchNearbyDrivers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/drivers/all`);
      if (!response.ok) throw new Error("Failed to fetch drivers");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid driver data");

      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      Alert.alert("Error", "Failed to load drivers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleDriverSelect = async (driverEmail) => {
  try {
    const userEmail = await AsyncStorage.getItem("userEmail");
    if (!userEmail) {
      Alert.alert("Login Required", "Please log in first.");
      return;
    }

    const userRes = await fetch(`${BASE_URL}/api/rideSession/active/${userEmail}`);
    const userData = await userRes.json();

    if (userData?.session) {
      Alert.alert(
        "Active Session Found",
        "You already have an active ride. Do you want to delete it and book a new driver?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete & Continue",
            onPress: async () => {
              await fetch(`${BASE_URL}/api/rideSession/${userData.session._id}`, {
                method: "DELETE",
              });
              checkDriverAndProceed(driverEmail);
            },
          },
        ]
      );
    } else {
      checkDriverAndProceed(driverEmail);
    }
  } catch (err) {
    console.error("Session check error:", err);
    Alert.alert("Error", "Something went wrong while checking sessions.");
  }
};

const checkDriverAndProceed = async (driverEmail) => {
  try {
    console.log("Checking session for driver email:", driverEmail);

    const driverRes = await fetch(`${BASE_URL}/api/rideSession/active/${driverEmail}`);

    if (driverRes.status === 404) {
      // No session, proceed
      navigation.navigate("UserBookDriver", { driverEmail });
      return;
    }

    if (!driverRes.ok) {
      throw new Error("Failed to fetch driver session");
    }

    const driverData = await driverRes.json();

    if (driverData?.session) {
      Alert.alert("Driver Busy", "This driver is currently on a ride. Please choose another driver.");
    } else {
      navigation.navigate("UserBookDriver", { driverEmail });
    }
  } catch (err) {
    console.error("Driver session check error:", err);
    Alert.alert("Error", "Could not check driver session.");
  }
};



  const renderDriver = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleDriverSelect(item.email)}
    >
      <Image
        source={{
          uri: item.photo ? `${BASE_URL}${item.photo}` : "https://via.placeholder.com/80",
        }}
        style={styles.image}
      />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.phone}>📞 {item.contact}</Text>
      <View style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Driver</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="directions-car" size={28} color="#fff" />
        <Text style={styles.headerText}>Nearby Drivers</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 30 }} />
      ) : drivers.length > 0 ? (
        <FlatList
          data={drivers}
          key={"two-columns"}
          numColumns={2}
          renderItem={renderDriver}
          keyExtractor={(item) => item._id}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.noDriversText}>No drivers available nearby.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingTop: 20,
  },
  header: {
    backgroundColor: "#007BFF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: screenWidth / 2 - 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noDriversText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 30,
  },
});

export default DriverSearch;
