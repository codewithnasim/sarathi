import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

  const renderNotification = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconContainer}>
        {item.type === 'ride_request' && <MaterialIcons name="local-taxi" size={28} color="#007bff" />}
        {item.type === 'earning_update' && <FontAwesome5 name="money-bill-wave" size={24} color="#28a745" />}
        {item.type === 'alert' && <MaterialIcons name="warning" size={28} color="#dc3545" />}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#e0f7fa', '#ffffff']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e0f7fa" />
      <View style={styles.headerCard}>
        <Text style={styles.header}>📬 Driver Notifications</Text>
        <Text style={styles.subHeader}>Stay updated in real-time</Text>
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No new notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
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
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeader: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  noNotifications: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 30,
  },
});

export default DriverNotificationScreen;
