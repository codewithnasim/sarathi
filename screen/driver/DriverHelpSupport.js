import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const DriverHelpSupport = () => {
  const handleContactSupport = () => {
    Alert.alert("Contact Support", "For assistance, email us at support@example.com or call +1 800 123 4567.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help & Support</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.faq}>• How do I reset my password?</Text>
        <Text style={styles.faq}>• How do I update my profile?</Text>
        <Text style={styles.faq}>• How do I report an issue?</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContactSupport}>
        <Text style={styles.buttonText}>Contact Support</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.reportButton]} onPress={() => Alert.alert("Report Issue", "Describe your issue in detail.")}>
        <Text style={styles.buttonText}>Report an Issue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  faq: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DriverHelpSupport;
