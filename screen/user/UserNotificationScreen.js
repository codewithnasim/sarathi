import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const UserNotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        let email = await AsyncStorage.getItem("userEmail");
        if (email) {
          email = email.toLowerCase();
          setUserEmail(email);
          fetchNotifications(email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    getUserEmail();
  }, []);

  const fetchNotifications = async (email) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://sarathi-backend-file.onrender.com/api/notifications/getnotifications/${email}`);
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch("https://sarathi-backend-file.onrender.com/api/notifications/markasread", { notificationId });
      setNotifications((prev) => prev.map((item) => item._id === notificationId ? { ...item, read: true } : item));
    } catch (error) {
      Alert.alert("Error", "Failed to mark as read.");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`https://sarathi-backend-file.onrender.com/api/notifications/delete/${notificationId}`);
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
    } catch (error) {
      Alert.alert("Error", "Failed to delete notification.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 15, backgroundColor: "#f9f9f9" }}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : notifications.length === 0 ? (
        <Text style={{ fontSize: 18, textAlign: "center", marginTop: 20 }}>No notifications available</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={() => fetchNotifications(userEmail)}
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: item.read ? "#d9f7be" : "#fff",
              marginVertical: 8,
              padding: 15,
              borderRadius: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.senderName}</Text>
                <Text style={{ fontSize: 14, color: "#666" }}>{item.message}</Text>
                <Text style={{ fontSize: 12, color: "#888", marginTop: 5 }}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!item.read && (
                  <TouchableOpacity onPress={() => markAsRead(item._id)}>
                    <MaterialIcons name="done" size={24} color="#007bff" style={{ marginRight: 10 }} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteNotification(item._id)}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default UserNotificationScreen;
