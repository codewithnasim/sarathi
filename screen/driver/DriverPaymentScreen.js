import React from "react";
import { View, Alert, StyleSheet, Image } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { Button, Card, Text } from "react-native-paper";

const RazorpayPaymentScreen = () => {
  const handlePayment = () => {
    const options = {
      description: "Ride Payment",
      image: "https://your-logo-url.com/logo.png", // Optional
      currency: "INR",
      key: "rzp_test_EpmHCbXBLFaO4G", // ✅ Your Test Key
      amount: "50000", // ₹500.00 in paisa
      name: "Sarathi Rides",
      prefill: {
        email: "test@example.com",
        contact: "9999999999",
        name: "Ranjit Yadav",
      },
      theme: { color: "#007bff" },
    };

    RazorpayCheckout.open(options)
      .then(data => {
        Alert.alert(
          "✅ Payment Successful",
          `Payment ID: ${data.razorpay_payment_id}`
        );
      })
      .catch(error => {
        Alert.alert(
          "❌ Payment Failed",
          error.description || "Something went wrong during the payment process."
        );
      });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card} elevation={4}>
        <Card.Content>
          <Image
            source={require("./pic/d.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text variant="titleLarge" style={styles.title}>Complete Your Payment</Text>
          <Text style={styles.amount}>Amount: ₹500.00</Text>
          <Text style={styles.description}>Pay securely with Razorpay</Text>
          <Button
            mode="contained"
            onPress={handlePayment}
            style={styles.payButton}
            icon="credit-card"
          >
            Pay Now
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default RazorpayPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 150,
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  amount: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#2C3E50",
  },
  description: {
    textAlign: "center",
    marginBottom: 20,
    color: "#616A6B",
  },
  payButton: {
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: "#007bff",
  },
});
