import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import { API_URL } from "../../config.js";

const ForgotPasswordUserScreen = () => {
  const navigation = useNavigation(); // Initialize navigation

  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [userName, setUserName] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Verify user
  const handleVerifyUser = async () => {
    console.log("📤 Sending Data:", { email, phoneNo });

    try {
      const response = await fetch(`${API_URL}/users/verify-user `, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phoneNo }),
      });

      const data = await response.json();
      console.log("📥 Response:", data);

      if (data.success) {
        setUserName(data.user.name);
        setShowPasswordFields(true);
      } else {
        Alert.alert("Error", data.message || "Invalid Email or Phone Number");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      Alert.alert("Error", `Something went wrong: ${error.message}`);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.245.154:5000/api/users/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phoneNo, newPassword: password }),
        }
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Password Reset Successfully", [
          { text: "OK", onPress: () => navigation.replace("UserLogin") }, // Navigate to Login
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to Reset Password");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong! Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Forgot Password</Text>

      {!showPasswordFields ? (
        <>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Enter your phone number"
            value={phoneNo}
            onChangeText={setPhoneNo}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TouchableOpacity onPress={handleVerifyUser} style={styles.button}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Display User's Name */}
          <Text style={styles.userName}>Hello, {userName}!</Text>

          <TextInput
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
          />

          <TextInput
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? "Hide Password" : "Show Password"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResetPassword}
            style={[styles.button, styles.resetButton]}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// Styles for a clean UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  userName: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#007bff",
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#28a745",
  },
  showPasswordButton: {
    marginBottom: 15,
    alignSelf: "center",
  },
  showPasswordText: {
    color: "#007bff",
    fontWeight: "bold",
  },
});

export default ForgotPasswordUserScreen;
