import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import CheckBox from "react-native-check-box";
import { API_URL } from "../../config.js";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
    dob: "",
    address: "",
    experience: "",
    expType: [],
    licenseNo: "",
    adharNo: "",
    photo: null,
    adharPhoto: null,
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (value) => {
    setFormData((prevData) => {
      const updatedExpType = prevData.expType.includes(value)
        ? prevData.expType.filter((item) => item !== value)
        : [...prevData.expType, value];
      return { ...prevData, expType: updatedExpType };
    });
  };

  const pickImage = async (imageType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prevData) => ({
        ...prevData,
        [imageType]: result.assets[0],
      }));
    }
  };

  const handleRegister = async () => {
    if (!/^[0-9]{10}$/.test(formData.contact)) {
      Alert.alert("Error", "Contact must be exactly 10 digits");
      return;
    }
    if (!/^[0-9]{12}$/.test(formData.adharNo)) {
      Alert.alert("Error", "Aadhaar number must be exactly 12 digits");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.contact ||
      !formData.password ||
      !formData.address
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    let submitForm = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] && key !== "photo" && key !== "adharPhoto") {
        submitForm.append(key, formData[key]);
      }
    });

    if (formData.photo) {
      submitForm.append("photo", {
        uri: formData.photo.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      });
    }

    if (formData.adharPhoto) {
      submitForm.append("adharPhoto", {
        uri: formData.adharPhoto.uri,
        type: "image/jpeg",
        name: "adharPhoto.jpg",
      });
    }

    try {
      const response = await fetch(`${API_URL}/drivers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: submitForm,
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Waiting for approval");
        navigation.navigate("DriverLogin");
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    handleInputChange("dob", date.toISOString().split("T")[0]); // Format YYYY-MM-DD
    hideDatePicker();
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Driver Registration</Text>
      {[
        { placeholder: "Name", key: "name" },
        { placeholder: "Email", key: "email", keyboardType: "email-address" },
        {
          placeholder: "Contact",
          key: "contact",
          keyboardType: "phone-pad",
          maxLength: 10,
        },
        { placeholder: "Address", key: "address" },
        {
          placeholder: "Experience (in years)",
          key: "experience",
          keyboardType: "numeric",
        },
        { placeholder: "License Number", key: "licenseNo" },
        {
          placeholder: "Aadhaar Number",
          key: "adharNo",
          keyboardType: "numeric",
          maxLength: 12,
        },
      ].map(({ placeholder, key, keyboardType, maxLength }) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={placeholder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onChangeText={(text) => handleInputChange(key, text)}
        />
      ))}

      <TouchableOpacity onPress={showDatePicker} style={styles.input}>
        <Text>{formData.dob || "Select Date of Birth"}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        maximumDate={new Date()} // Restrict future dates
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          onChangeText={(text) => handleInputChange("password", text)}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? "eye-off" : "eye"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Experience Type:</Text>
      <CheckBox
        style={styles.checkbox}
        onClick={() => handleCheckboxChange("heavyVehicle")}
        isChecked={formData.expType.includes("heavyVehicle")}
        rightText="Heavy Vehicle"
      />
      <CheckBox
        style={styles.checkbox}
        onClick={() => handleCheckboxChange("lightVehicle")}
        isChecked={formData.expType.includes("lightVehicle")}
        rightText="Light Vehicle"
      />

      <TouchableOpacity
        onPress={() => pickImage("photo")}
        style={styles.uploadButton}
      >
        <Text>Pick Profile Photo</Text>
      </TouchableOpacity>
      {formData.photo && (
        <Image
          source={{ uri: formData.photo.uri }}
          style={styles.imagePreview}
        />
      )}

      <TouchableOpacity
        onPress={() => pickImage("adharPhoto")}
        style={styles.uploadButton}
      >
        <Text>Pick Aadhaar Photo</Text>
      </TouchableOpacity>
      {formData.adharPhoto && (
        <Image
          source={{ uri: formData.adharPhoto.uri }}
          style={styles.imagePreview}
        />
      )}

      <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 10 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 10,
  },
  passwordInput: { flex: 1 },
  uploadButton: {
    padding: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "blue",
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  registerButtonText: { color: "white", fontWeight: "bold" },
  label: { marginBottom: 10, fontWeight: "bold" },
  checkbox: { marginBottom: 10 },
});

export default RegisterScreen;
