import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DriverPrivacyPolicy = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Driver Privacy Policy</Text>
      
      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.text}>We value your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and share data.</Text>
      
      <Text style={styles.sectionTitle}>2. Information We Collect</Text>
      <Text style={styles.text}>We may collect personal details such as name, email, phone number, driving license details, location data, and payment information.</Text>
      
      <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
      <Text style={styles.text}>We use your data to provide services, process payments, enhance security, and improve user experience.</Text>
      
      <Text style={styles.sectionTitle}>4. Data Sharing & Security</Text>
      <Text style={styles.text}>We do not sell your data. Your information is shared only with necessary service providers and law enforcement when required by law.</Text>
      
      <Text style={styles.sectionTitle}>5. Location Tracking</Text>
      <Text style={styles.text}>We track your location to provide accurate ride services and ensure passenger safety.</Text>
      
      <Text style={styles.sectionTitle}>6. Your Rights</Text>
      <Text style={styles.text}>You have the right to access, update, or delete your data. Contact us for any data-related requests.</Text>
      
      <Text style={styles.sectionTitle}>7. Updates to Policy</Text>
      <Text style={styles.text}>We may update this policy from time to time. Continued use of our services implies acceptance of the changes.</Text>
      
      <Text style={styles.footer}>For any questions or concerns, contact our support team.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#004D40',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default DriverPrivacyPolicy;
