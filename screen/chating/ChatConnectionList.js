import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "../../config.js";

const ChatConnectionList = ({ navigation }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const route = useRoute();
  const email = route.params?.email;
  const value = route.params?.value;

  useEffect(() => {
    if (!email) {
      setError("No email provided!");
      setLoading(false);
      return;
    }

    const fetchConnections = async () => {
      try {
        const response = await fetch(
          `${API_URL}/chat-connections/get/${email}`
        );
        const data = await response.json();
        setConnections(data.connections || []);
      } catch (err) {
        setError("Failed to load connections. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [email]);

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            userEmail: item.userEmail,
            driverEmail: item.driverEmail,
            value: value,
          })
        }
      >
        <Text style={styles.itemText}>
          User Email: <Text style={styles.itemValue}>{item.userEmail}</Text>
        </Text>
        <Text style={styles.itemText}>
          Driver Email: <Text style={styles.itemValue}>{item.driverEmail}</Text>
        </Text>
        <Text style={styles.itemText}>
          Created At:{" "}
          <Text style={styles.itemValue}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </Text>
      </TouchableOpacity>
    ),
    [navigation, value]
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#ff7e5f", "#feb47b"]} style={styles.container}>
      {connections.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyMessage}>No connections available.</Text>
        </View>
      ) : (
        <FlatList
          data={connections}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item._id?.toString() || Math.random().toString()
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  itemValue: {
    fontWeight: "bold",
    color: "#007bff",
  },
  errorMessage: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  emptyMessage: {
    fontSize: 18,
    color: "#888",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 15,
  },
});

export default ChatConnectionList;
