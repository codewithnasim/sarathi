import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../config.js";

const UserLoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true); // Show loading state

    try {
      navigation.replace("AppNavigator");
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login Response:", data); // ✅ Debug API response

      if (response.ok) {
        if (!data.user || !data.user.email) {
          Alert.alert("Error", "User email not found in response");
          return;
        }

        await AsyncStorage.setItem("userEmail", data.user.email); // ✅ Store user email
        await AsyncStorage.setItem("token", data.token || ""); // ✅ Store JWT token

        Alert.alert("Success", "Login successful!");
        navigation.replace("UserDashboard"); // ✅ Navigate to Dashboard
      } else {
        if (
          data.message ===
          "Your account has been blocked. Please contact admin."
        ) {
          Alert.alert(
            "Blocked",
            "Your account has been blocked. Please contact admin."
          );
        } else {
          Alert.alert("Error", data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <View style={styles.loginBox}>
        <Text style={styles.header}>User Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("UserRegistration")}
        >
          <Text style={styles.registerText}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPasswordUser")}
        >
          <Text style={styles.forgetText}>forget Password</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBox: {
    width: "85%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  loginButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3b5998",
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    marginTop: 15,
    color: "#3b5998",
    fontWeight: "bold",
    fontSize: 14,
  },
  forgetText: {
    color: "#3b5998",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default UserLoginScreen;
