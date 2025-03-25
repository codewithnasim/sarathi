import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "react-native-image-picker";

const SettingsScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(require("./pic/d.png")); // Default image

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleEditImage = async () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // Open camera to take a picture
  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take a picture."
      );
      return;
    }

    ImagePicker.launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (
        !response.didCancel &&
        !response.error &&
        response.assets.length > 0
      ) {
        setProfileImage({ uri: response.assets[0].uri });
      }
    });
  };

  // Open gallery to choose a picture
  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Gallery access is required to choose a picture."
      );
      return;
    }

    ImagePicker.launchImageLibrary(
      { mediaType: "photo", quality: 1 },
      (response) => {
        if (
          !response.didCancel &&
          !response.error &&
          response.assets.length > 0
        ) {
          setProfileImage({ uri: response.assets[0].uri });
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Image with Edit Button */}
      <View style={styles.imageContainer}>
        <Image source={profileImage} style={styles.profileImage} />
        <TouchableOpacity style={styles.editButton} onPress={handleEditImage}>
          <Ionicons name="camera-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Settings</Text>

      {[
        { title: "Profile", screen: "DriverProfile", icon: "person-outline" },
        {
          title: "Notifications",
          screen: "DriverNotificationScreen",
          icon: "notifications-outline",
        },
        {
          title: "Privacy",
          screen: "DriverPrivacyPolicy",
          icon: "lock-closed-outline",
        },
        {
          title: "Payment Methods",
          screen: "DriverPayment",
          icon: "card-outline",
        },
        {
          title: "Help & Support",
          screen: "DriverHelpSupport",
          icon: "help-circle-outline",
        },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>{item.title}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="#fff"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#004D40",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: { position: "relative" },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  editButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#007bff",
    marginVertical: 8,
    borderRadius: 12,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#d9534f",
    marginVertical: 15,
    borderRadius: 12,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 5,
  },
  buttonText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  icon: { marginRight: 10 },
});

export default SettingsScreen;
