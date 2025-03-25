import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "../../config.js";

const DriverLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Login Error", "Please enter email and password.");
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch(`${API_URL}/drivers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = await response.json();

      if (response.status === 403) {
        return Alert.alert("Login Denied", data.message || "Access forbidden.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Server responded with ${response.status}`
        );
      }

      if (data.token && data.driver) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userEmail", data.driver.email);
        await AsyncStorage.setItem("userId", data.driver._id);

        navigation.navigate("DriverDashboard");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#141E30", "#243B55"]} style={styles.container}>
      <Image source={require("./pic/sarathi.png")} style={styles.logo} />

      <Text style={styles.title}>Driver Login</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="white" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="lock"
          size={20}
          color="white"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#bbb"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? "Logging in..." : "LOGIN"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("DriverRegister")}
      >
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("ForgotPasswordDriver")}
      >
        <Text style={styles.forgetText}>forget password </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#00BFFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 15,
  },
  registerText: {
    color: "#00BFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  forgetText: {
    color: "#00BFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default DriverLoginScreen;
