import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://sarathi-backend-file.onrender.com";

const DriverSessionManagementScreen = () => {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmailAndSession = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        if (!storedEmail) {
          Alert.alert("Error", "No email found. Please log in.");
          return;
        }
        setEmail(storedEmail);
        await fetchSession(storedEmail);
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "Could not load session.");
      }
    };

    fetchEmailAndSession();
  }, []);

  const fetchSession = async (userEmail) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/rideSession/active/${userEmail}`
      );
      if (!res.ok) {
        setSession(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSession(data.session);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!session?._id) return;

    try {
      const res = await fetch(`${BASE_URL}/api/rideSession/${session._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        Alert.alert("Session Deleted", "Your session has been removed.");
        setSession(null);
      } else {
        Alert.alert("Error", "Failed to delete session.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Could not delete session.");
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#007BFF"
        style={{ marginTop: 30 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Active Session</Text>

      {session ? (
        <View style={styles.card}>
          <Text style={styles.label}>Session ID:</Text>
          <Text style={styles.value}>{session._id}</Text>

          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{session.status}</Text>

          <Text style={styles.label}>You:</Text>
          <Text style={styles.value}>{email}</Text>

          <Text style={styles.label}>Connected With:</Text>
          <Text style={styles.value}>
            {session.user?.email === email
              ? session.driver?.email
              : session.user?.email}
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleDeleteSession}>
            <Text style={styles.buttonText}>Delete Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondary]}>
            <Text style={styles.buttonText}>Close Session (Coming Soon)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noSessionText}>
          You are not in any active session.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F2F2F2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  value: {
    color: "#555",
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noSessionText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default DriverSessionManagementScreen;
