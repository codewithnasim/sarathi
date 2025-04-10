import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ForgotPasswordDriverScreen = () => {
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [driverName, setDriverName] = useState("");
  const navigation = useNavigation();

  const handleVerifyDriver = async () => {
    try {
      const response = await fetch("https://sarathi-backend-file.onrender.com/api/drivers/verify-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contact }),
      });

      const data = await response.json();
      if (data.success) {
        setDriverName(data.driver.name);
        setShowPasswordFields(true);
      } else {
        Alert.alert("Error", data.message || "Invalid Email or Contact Number");
      }
    } catch (error) {
      Alert.alert("Error", `Something went wrong: ${error.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch("https://sarathi-backend-file.onrender.com/api/drivers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contact, newPassword: password }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Password Reset Successfully", [
          { text: "OK", onPress: () => navigation.navigate("DriverLogin") },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to Reset Password");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong! Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: null })}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("./pic/sarathi.png")} // Change this to your image path
          style={styles.topImage}
        />

        <View style={styles.card}>
          <Text style={styles.heading}>🔐 Forgot Password</Text>

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
                placeholder="Enter your contact number"
                value={contact}
                onChangeText={setContact}
                style={styles.input}
                keyboardType="phone-pad"
              />

              <TouchableOpacity onPress={handleVerifyDriver} style={styles.button}>
                <Text style={styles.buttonText}>Verify Identity</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {driverName && <Text style={styles.welcomeText}>Welcome, {driverName} 👋</Text>}

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
                style={styles.togglePassword}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#007bff"
                />
                <Text style={styles.togglePasswordText}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3f2fd",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  topImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    marginBottom: 20,
    borderRadius: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#28a745",
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  resetButton: {
    backgroundColor: "#28a745",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  togglePassword: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
  togglePasswordText: {
    color: "#007bff",
    marginLeft: 8,
    fontWeight: "600",
  },
});

export default ForgotPasswordDriverScreen;
