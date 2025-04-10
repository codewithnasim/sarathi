import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const UserRegistration = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phoneNo: "",
    adhaarCard: "",
    gender: "",
    dob: "",
    password: "",
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};
    const requiredFields = [
      "name",
      "email",
      "address",
      "phoneNo",
      "adhaarCard",

      "gender",
      "dob",
      "password",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phoneNo && !/^\d{10}$/.test(formData.phoneNo)) {
      newErrors.phoneNo = "Phone number must be 10 digits";
    }

    if (formData.adhaarCard && !/^\d{12}$/.test(formData.adhaarCard)) {
      newErrors.adhaarCard = "Aadhaar must be 12 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera roll permissions to upload photos"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prevData) => ({
        ...prevData,
        photo: result.assets ? result.assets[0].uri : result.uri,
      }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera permissions to take photos"
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prevData) => ({
        ...prevData,
        photo: result.assets ? result.assets[0].uri : result.uri,
      }));
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
    const formattedDate = currentDate.toISOString().split("T")[0];
    handleInputChange("dob", formattedDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill all required fields correctly."
      );
      return;
    }

    let submitForm = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "photo" && formData[key]) {
        submitForm.append(key, formData[key]);
      }
    });

    if (formData.photo) {
      submitForm.append("photo", {
        uri: formData.photo,
        type: "image/jpeg",
        name: "photo.jpg",
      });
    }

    console.log("Submitting Form Data:", submitForm);

    try {
      const response = await fetch(
        "https://sarathi-backend-file.onrender.com/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: submitForm,
        }
      );

      const data = await response.json();
      console.log("Registration Response:", data);

      if (response.ok) {
        Alert.alert("Success", "Registration successful!");
        navigation.navigate("UserLogin");
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <LinearGradient
      colors={["#9a8c98", "#c9ada7", "#f2e9e4"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Create Account</Text>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage}>
            {formData.photo ? (
              <Image
                source={{ uri: formData.photo }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={50} color="#fff" />
                <Text style={styles.uploadHint}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <TextInput
            style={[styles.input, errors.name && styles.errorInput]}
            placeholder="Full Name *"
            onChangeText={(text) => handleInputChange("name", text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            placeholder="Email Address *"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => handleInputChange("email", text)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={[styles.input, errors.address && styles.errorInput]}
            placeholder="Full Address *"
            multiline
            numberOfLines={3}
            onChangeText={(text) => handleInputChange("address", text)}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}

          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              errors.dob && styles.errorInput,
            ]}
            onPress={showDatepicker}
          >
            <Text
              style={formData.dob ? styles.dateText : styles.placeholderText}
            >
              {formData.dob || "Date of Birth *"}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <View
            style={[styles.pickerContainer, errors.gender && styles.errorInput]}
          >
            <Picker
              selectedValue={formData.gender}
              onValueChange={(itemValue) =>
                handleInputChange("gender", itemValue)
              }
              style={styles.picker}
              dropdownIconColor="#666"
            >
              <Picker.Item label="Select Gender *" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}
        </View>

        {/* Identification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>

          <TextInput
            style={[styles.input, errors.phoneNo && styles.errorInput]}
            placeholder="Phone Number *"
            keyboardType="phone-pad"
            maxLength={10}
            onChangeText={(text) => handleInputChange("phoneNo", text)}
          />
          {errors.phoneNo && (
            <Text style={styles.errorText}>{errors.phoneNo}</Text>
          )}

          <TextInput
            style={[styles.input, errors.adhaarCard && styles.errorInput]}
            placeholder="Aadhaar Card Number *"
            keyboardType="numeric"
            maxLength={12}
            onChangeText={(text) => handleInputChange("adhaarCard", text)}
          />
          {errors.adhaarCard && (
            <Text style={styles.errorText}>{errors.adhaarCard}</Text>
          )}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <View
            style={[
              styles.passwordContainer,
              errors.password && styles.errorInput,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Create Password *"
              secureTextEntry={!passwordVisible}
              onChangeText={(text) => handleInputChange("password", text)}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>Register Now</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("UserLogin")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  uploadHint: {
    color: "#fff",
    marginTop: 5,
    fontSize: 12,
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 0,
    right: "30%",
  },
  cameraButton: {
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e3c72",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  errorInput: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  passwordContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  registerButton: {
    backgroundColor: "#252422",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "black",
    marginRight: 5,
    fontSize: 15,
  },
  loginLink: {
    color: "blue",
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 15,
  },
});

export default UserRegistration;
