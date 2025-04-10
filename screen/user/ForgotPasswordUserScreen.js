import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const ForgotPasswordUserScreen = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [userName, setUserName] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleVerifyUser = async () => {
    try {
      const response = await fetch("https://sarathi-backend-file.onrender.com/api/users/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phoneNo }),
      });

      const data = await response.json();
      if (data.success) {
        setUserName(data.user.name);
        setShowPasswordFields(true);
      } else {
        Alert.alert("Error", data.message || "Invalid Email or Phone Number");
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
      const response = await fetch("https://sarathi-backend-file.onrender.com/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phoneNo, newPassword: password }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Password Reset Successfully", [
          { text: "OK", onPress: () => navigation.replace("UserLogin") },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to Reset Password");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong! Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.inner}>

        {/* Optional Logo */}
        <Image source={require("./pic/sarathi.png")} style={styles.logo} />

        <Text style={styles.heading}>Forgot Password</Text>

        {!showPasswordFields ? (
          <>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Enter your phone number"
              placeholderTextColor="#ccc"
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
            <Text style={styles.userName}>Hello, {userName}!</Text>

            <TextInput
              placeholder="Enter new password"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />

            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor="#ccc"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
              <Text style={styles.showPasswordText}>{showPassword ? "Hide Password" : "Show Password"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResetPassword} style={[styles.button, styles.resetButton]}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00BFFF",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  button: {
    backgroundColor: "#00BFFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#28a745",
    marginTop: 20,
  },
  showPasswordButton: {
    marginBottom: 10,
  },
  showPasswordText: {
    color: "#00BFFF",
    fontWeight: "bold",
  },
});

export default ForgotPasswordUserScreen;
