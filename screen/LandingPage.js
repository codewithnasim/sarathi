import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Clickable Logo - Redirects to Admin Login */}
      <TouchableOpacity onPress={() => navigation.navigate("AdminLogin")}>
        <Image source={require("./driver/pic/sarathi.png")} style={styles.logo} />
      </TouchableOpacity>

      <Text style={styles.title}>Welcome to Sarathi</Text>
      <Text style={styles.subtitle}>Your Trusted Ride Partner</Text>

      <TouchableOpacity
        style={styles.buttonUser}
        onPress={() => navigation.navigate("UserLogin")}
      >
        <Text style={styles.buttonText}>Continue as Coustomer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonDriver}
        onPress={() => navigation.navigate("DriverLogin")}
      >
        <Text style={styles.buttonText}>Continue as Driver</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonAdmin}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={styles.buttonText}>Continue as Admin</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 30,
  },
  buttonUser: {
    backgroundColor: "#007AFF",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDriver: {
    backgroundColor: "#28A745",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonAdmin: {
    backgroundColor: "#DC3545",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LandingPage;
