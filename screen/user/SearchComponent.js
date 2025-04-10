import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, FlatList, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import MapScreen from "./MapScreen";

const BASE_URL = "https://sarathi-backend-file.onrender.com"; // Replace with your actual backend URL

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Drivers from Backend
  const fetchNearbyDrivers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/drivers/all`);
      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format");
      }
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      Alert.alert("Error", "Failed to load drivers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyDrivers();
  }, []);

  // Search Functionality
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = drivers.filter((driver) =>
        driver.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={20} color="#333" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drivers..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Text style={styles.headerText}>Find Your Best Ride 🚗</Text>
        
        {/* Featured Section */}
<View style={{ height: 300 }}>
  <MapScreen />
</View>

        {/* Available Drivers List */}
        <Text style={styles.sectionTitle}>📍 Available Drivers</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0077b6" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredData.length > 0 ? filteredData : drivers}
            keyExtractor={(item) => item._id} // Assuming MongoDB `_id`
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card}>
                <Image 
                  source={{ uri: item.image || "https://via.placeholder.com/60" }}
                  style={styles.driverImage} 
                  onError={(e) => console.log("Broken Image", e)}
                />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{item.name}</Text>
                  <Text style={styles.driverRating}>⭐ {item.rating || "N/A"} Rating</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContainer: { marginTop: 70 },

  searchWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 40 },

  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#0077b6",
  },

  featuredContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  featuredImage: {
    width: "90%",
    height: 150,
    borderRadius: 15,
  },
  featuredText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 20, marginBottom: 10, color: "#333" },
  
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  driverImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  driverRating: { fontSize: 14, color: "green" },
});

export default SearchComponent;
