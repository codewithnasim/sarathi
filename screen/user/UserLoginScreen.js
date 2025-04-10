import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";

const { width, height } = Dimensions.get("window");

const UserLoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const passwordInputRef = useRef();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const carPosition = useRef(new Animated.Value(-100)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Car animation at bottom
    Animated.loop(
      Animated.sequence([
        Animated.timing(carPosition, {
          toValue: width + 100,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(carPosition, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true); // Show loading state

    try {
      const response = await fetch(
        "https://sarathi-backend-file.onrender.com/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

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
    <LinearGradient colors={["#e5e5e5", "#e5e5e5"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <Animated.View
            style={[
              styles.loginBox,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/sarathi.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.header}>Welcome Back!</Text>
            <Text style={styles.subHeader}>Sign in to continue</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Icon
                  name="envelope"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder={emailError || "Email"}
                  placeholderTextColor={emailError ? "#ff4444" : "#999"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current.focus()}
                  blurOnSubmit={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Icon
                  name="lock"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  placeholder={passwordError || "Password"}
                  placeholderTextColor={passwordError ? "#ff4444" : "#999"}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "eye-slash" : "eye"}
                    size={20}
                    color="#666"
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading ? styles.buttonDisabled : null,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialLoginText}>Or login with</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="facebook" size={24} color="#3b5998" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="apple" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={() => navigation.navigate("UserRegistration")}
              >
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPasswordUser")}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Animated Car at bottom - Only show when keyboard is not visible */}
          {!isKeyboardVisible && (
            <Animated.View
              style={{
                position: "absolute",
                top: 20,
                transform: [{ translateX: carPosition }],
              }}
            >
              <Image
                source={require("../user/pic/car.png")}
                style={styles.carImage}
              />
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBox: {
    width: "90%",
    maxWidth: 400,
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  carImage: {
    width: 120,
    height: 60,
    resizeMode: "contain",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1e3c72",
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 15,
  },
  eyeIcon: {
    marginLeft: -30,
  },

  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 15,
    zIndex: 1,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    paddingLeft: 45,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  loginButton: {
    width: "100%",
    padding: 16,
    backgroundColor: "#1e3c72",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#1e3c72",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  socialLoginContainer: {
    marginVertical: 15,
    width: "100%",
  },
  socialLoginText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  linkText: {
    color: "#1e3c72",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default UserLoginScreen;
