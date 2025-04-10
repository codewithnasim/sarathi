import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const BookingSummary = ({ driver, tripDetails }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Summary</Text>
      <Text>Driver: {driver.name}</Text>
      <Text>Vehicle: {driver.vehicle}</Text>
      <Text>Pickup Location: {tripDetails.pickup}</Text>
      <Text>Drop-off Location: {tripDetails.dropoff}</Text>
      <Text>Estimated Fare: ${tripDetails.fare}</Text>
      <Button title="Confirm Booking" onPress={() => alert('Booking Confirmed!')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default BookingSummary;
