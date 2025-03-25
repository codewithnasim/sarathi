import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { Card, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../config.js";

const BASE_URL = `${API_URL}`;

const DriverSearch = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (email) {
          setUserEmail(email);
        } else {
          console.log("User email not found in AsyncStorage");
          alert("Please log in to book a ride.");
        }
      } catch (error) {
        console.error("Error retrieving email from AsyncStorage:", error);
      } finally {
        fetchNearbyDrivers();
      }
    };
    getUserEmail();
  }, []);

  const fetchNearbyDrivers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/drivers/all`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Drivers</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.driverContainer}>
                  <Image
                    source={{
                      uri: item.photo || "https://via.placeholder.com/60",
                    }}
                    style={styles.driverImage}
                  />
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{item.name}</Text>
                    <Text style={styles.infoText}>📞 {item.contact}</Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={() =>
                    navigation.navigate("UserBookDriver", {
                      driverEmail: item.email,
                    })
                  }
                  color="#007BFF"
                >
                  Book Driver
                </Button>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
    padding: 10,
  },
  driverContainer: { flexDirection: "row", alignItems: "center" },
  driverImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  infoText: { fontSize: 14, color: "#777", marginVertical: 5 },
});

export default DriverSearch;
