import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator 
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://sarathi-backend-file.onrender.com";

const AdminManageUsers = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (id, isBlocked) => {
    try {
      const url = `${BASE_URL}/api/admin/users/${isBlocked ? "unblock" : "block"}/${id}`;
      await axios.put(url);
      fetchUsers();
      Alert.alert("Success", `User ${isBlocked ? "unblocked" : "blocked"} successfully`);
    } catch (error) {
      Alert.alert("Error", "Failed to update user status");
    }
  };

  const handleRemoveUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/users/remove/${id}`);
      fetchUsers();
      Alert.alert("Success", "User removed successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to remove user");
    }
  };

  const handleViewProfile = (email) => {
    console.log("Navigating with email: ", email); // Log to verify
    navigation.navigate("UserProfileAdmin", { email }); // Ensure email is passed correctly
  };

  const handleSendMessage = (user) => {
    console.log(user);
    navigation.navigate("SendNotificationUser", { 
    name: user?.name?.trim(), 
    email: user?.email?.toLowerCase() 
});

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Users</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#004D40" />
      ) : users.length === 0 ? (
        <Text style={styles.noUsersText}>No users found</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Image source={{ uri: item.photo || "https://via.placeholder.com/50" }} style={styles.userImage} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>

              {/* Buttons placed below Name & Email */}
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, item.isBlocked ? styles.unblock : styles.block]}
                  onPress={() => handleBlockUnblock(item._id, item.isBlocked)}
                >
                  <Ionicons name={item.isBlocked ? "checkmark-circle-outline" : "ban"} size={20} color="white" />
                  <Text style={styles.buttonText}>{item.isBlocked ? "Unblock" : "Block"}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.remove]}
                  onPress={() => handleRemoveUser(item._id)}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.viewProfile]}
                  onPress={() => handleViewProfile(item.email)} // Passing email correctly here
                >
                  <Ionicons name="eye-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.sendMessage]}
                  onPress={() => handleSendMessage(item)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Notification</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#004D40" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#333", textAlign: "center" },
  userCard: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    elevation: 3,
    alignItems: "center"
  },
  userImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
  userInfo: { alignItems: "center" },
  userName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#666", marginBottom: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "center", marginTop: 5 },
  button: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8, 
    marginHorizontal: 5, 
    minWidth: 100
  },
  block: { backgroundColor: "red" },
  unblock: { backgroundColor: "green" },
  remove: { backgroundColor: "#d32f2f" },
  viewProfile: { backgroundColor: "#0288d1" },
  sendMessage: { backgroundColor: "#4caf50" },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 5 },
  noUsersText: { fontSize: 18, color: "#333", textAlign: "center" }
});

export default AdminManageUsers;
