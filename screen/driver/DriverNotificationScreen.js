import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const DriverNotificationScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'ride_request',
      title: 'New Ride Request!',
      message: 'A user has requested a ride. Tap to view details.',
      time: '5 min ago',
    },
    {
      id: '2',
      type: 'earning_update',
      title: 'Earnings Updated!',
      message: 'You earned ₹500 from your last ride.',
      time: '30 min ago',
    },
    {
      id: '3',
      type: 'alert',
      title: 'Traffic Alert',
      message: 'Heavy traffic reported on your usual route.',
      time: '1 hour ago',
    },
    {
      id: '4',
      type: 'ride_request',
      title: 'Urgent Ride Request!',
      message: 'A nearby user needs a ride immediately!',
      time: '2 hours ago',
    },
  ]);

  // Render each notification item
  const renderNotification = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      {/* Notification Icon */}
      <View style={styles.iconContainer}>
        {item.type === 'ride_request' && <MaterialIcons name="local-taxi" size={24} color="#007bff" />}
        {item.type === 'earning_update' && <FontAwesome5 name="money-bill-wave" size={24} color="green" />}
        {item.type === 'alert' && <MaterialIcons name="warning" size={24} color="red" />}
      </View>

      {/* Notification Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No new notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
        />
      )}
    </View>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  noNotifications: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default DriverNotificationScreen;
