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
import { API_URL } from "../../config.js";

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

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

  const pickImage = async () => {
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

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: submitForm,
      });

      const data = await response.json();

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
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Create Account</Text>
          <Text style={styles.subHeader}>Join us today!</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.name && styles.errorInput]}
            placeholder="Full Name"
            placeholderTextColor="#999"
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => handleInputChange("email", text)}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Address Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="home-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.address && styles.errorInput]}
            placeholder="Address"
            placeholderTextColor="#999"
            onChangeText={(text) => handleInputChange("address", text)}
          />
        </View>
        {errors.address && (
          <Text style={styles.errorText}>{errors.address}</Text>
        )}

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="call-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.phoneNo && styles.errorInput]}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            onChangeText={(text) => handleInputChange("phoneNo", text)}
          />
        </View>
        {errors.phoneNo && (
          <Text style={styles.errorText}>{errors.phoneNo}</Text>
        )}

        {/* Aadhaar Card Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="card-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.adhaarCard && styles.errorInput]}
            placeholder="Aadhaar Card Number"
            placeholderTextColor="#999"
            keyboardType="numeric"
            onChangeText={(text) => handleInputChange("adhaarCard", text)}
          />
        </View>
        {errors.adhaarCard && (
          <Text style={styles.errorText}>{errors.adhaarCard}</Text>
        )}

        {/* Gender Picker */}
        <View
          style={[styles.inputContainer, errors.gender && styles.errorInput]}
        >
          <Ionicons
            name="transgender-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <Picker
            selectedValue={formData.gender}
            onValueChange={(itemValue) =>
              handleInputChange("gender", itemValue)
            }
            style={styles.picker}
            dropdownIconColor="#666"
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        {/* Date of Birth */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TouchableOpacity style={styles.dateInput} onPress={showDatepicker}>
            <Text
              style={formData.dob ? styles.dateText : styles.placeholderText}
            >
              {formData.dob || "Date of Birth"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}
        </View>
        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.password && styles.errorInput]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!passwordVisible}
            onChangeText={(text) => handleInputChange("password", text)}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* Profile Photo */}
        <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
          <Ionicons name="camera-outline" size={20} color="#fff" />
          <Text style={styles.uploadText}> Choose Profile Photo</Text>
        </TouchableOpacity>
        {formData.photo && (
          <Image source={{ uri: formData.photo }} style={styles.imagePreview} />
        )}

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>Register Now</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("UserLogin")}>
            <Text style={styles.loginLink}> Login</Text>
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
    padding: 25,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "#ffeb3b",
    fontSize: 14,
    marginBottom: 15,
    marginLeft: 10,
  },
  picker: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  dateInput: {
    flex: 1,
    justifyContent: "center",
    height: "100%",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  eyeIcon: {
    padding: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  uploadText: {
    color: "#fff",
    fontSize: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#fff",
  },
  registerButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerText: {
    color: "#2575fc",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    color: "rgba(255,255,255,0.8)",
  },
  loginLink: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UserRegistration;
