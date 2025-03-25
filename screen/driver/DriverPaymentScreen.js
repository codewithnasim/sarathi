import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { Button } from "react-native-paper";

const DriverPaymentScreen = () => {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);

  const handlePayPress = async () => {
    setLoading(true);

    // Simulate API request (Replace this with your actual API call to get a PaymentIntent)
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Payment successful!");
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Card Details</Text>
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: "4242 4242 4242 4242" }}
        style={styles.cardField}
      />
      <Button mode="contained" loading={loading} onPress={handlePayPress} style={styles.payButton}>
        Pay ₹5000
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F4F6F9" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  cardField: { height: 50, marginVertical: 20, borderRadius: 10 },
  payButton: { marginTop: 20 },
});

export default DriverPaymentScreen;
