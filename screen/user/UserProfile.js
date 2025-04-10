import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = 'https://sarathi-backend-file.onrender.com';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) {
        Alert.alert("Error", "User email not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/users/email/${email}`);
      const data = await response.json();

      if (response.ok) {
        setUserData(data);
      } else {
        Alert.alert("Error", data.message || "User not found.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userEmail");
    Alert.alert("Logged Out", "You have been logged out successfully.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : userData ? (
        <View style={styles.card}>
          <Image
            source={{
              uri: userData.photo
                ? `${BASE_URL}${userData.photo}`
                : "https://via.placeholder.com/120",
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>{userData.name}</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#333" />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#333" />
            <Text style={styles.infoText}>{userData.address || "No address"}</Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome name="phone" size={20} color="#333" />
            <Text style={styles.infoText}>{userData.phoneNo || "No phone number"}</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert("Edit Profile", "Edit feature coming soon!")}
          >
            <Text style={styles.buttonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert("Help & Support", "Redirecting to help...")}
          >
            <Text style={styles.buttonText}>💬 Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.sessionButton]}
            onPress={() => navigation.navigate("UserSessionManagement")}
          >
            <Text style={styles.buttonText}>📋 Manage My Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.errorText}>User data not found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderColor: '#007bff',
    borderWidth: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#023e8a',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    width: '100%',
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  sessionButton: {
    backgroundColor: '#28a745', // Green for session management
  },
  logoutButton: {
    backgroundColor: '#dc3545', // Red for logout
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default UserProfile;
