import React from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

const tripData = [
  {
    id: "1",
    date: "2025-02-10",
    pickup: "Location A",
    drop: "Location B",
    fare: "$20",
    distance: "15 km",
  },
  {
    id: "2",
    date: "2025-02-12",
    pickup: "Location C",
    drop: "Location D",
    fare: "$25",
    distance: "20 km",
  },
  {
    id: "3",
    date: "2025-02-15",
    pickup: "Location E",
    drop: "Location F",
    fare: "$18",
    distance: "12 km",
  },
];

const TripHistory = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View style={styles.tripItem}>
      <Text style={styles.tripText}>Date: {item.date}</Text>
      <Text style={styles.tripText}>Pickup: {item.pickup}</Text>
      <Text style={styles.tripText}>Drop: {item.drop}</Text>
      <Text style={styles.tripText}>Fare: {item.fare}</Text>
      <Text style={styles.tripText}>Distance: {item.distance}</Text>
      <Button
        title="View Details"
        onPress={() => navigation.navigate("Earnings")}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip History</Text>
      <FlatList
        data={tripData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  tripItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  tripText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default TripHistory;
