import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const earningsData = [
  {
    id: '1',
    source: 'Kolkata',
    destination: 'Howrah',
    vehicleType: 'Sedan',
    totalHours: '5 hrs',
    extraShift: '2 hrs',
    paymentType: 'UPI',
    totalFare: '₹500',
  },
];

const EarningHistoryScreen = () => {
  return (
    <LinearGradient colors={['#e0f7fa', '#ffffff']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e0f7fa" />

      <View style={styles.headerCard}>
        <Text style={styles.header}>💰 Earning History</Text>
        <Text style={styles.subHeader}>Your ride-based income summary</Text>
      </View>

      <FlatList
        data={earningsData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <FontAwesome5 name="map-marker-alt" size={18} color="#007bff" />
              <Text style={styles.infoText}>Source: {item.source}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="location-arrow" size={18} color="#007bff" />
              <Text style={styles.infoText}>Destination: {item.destination}</Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="directions-car" size={18} color="#555" />
              <Text style={styles.infoText}>Vehicle: {item.vehicleType}</Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="timer" size={18} color="#555" />
              <Text style={styles.infoText}>Total Hours: {item.totalHours}</Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="schedule" size={18} color="#555" />
              <Text style={styles.infoText}>Extra Shift: {item.extraShift}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="rupee-sign" size={16} color="#28a745" />
              <Text style={styles.infoText}>Payment: {item.paymentType}</Text>
            </View>
            <Text style={styles.fareText}>Total Fare: {item.totalFare}</Text>
          </View>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  headerCard: {
    backgroundColor: '#fff',
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
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    textAlign: 'right',
  },
});

export default EarningHistoryScreen;
