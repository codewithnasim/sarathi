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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
    dob: "",
    address: "",
    experience: "",
    expType: "",
    licenseNo: "",
    licenseType: "",
    adharNo: "",
    photo: null,
    adharPhoto: null,
  });

  const [customExpType, setCustomExpType] = useState("");
  const [expTypeList, setExpTypeList] = useState([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPicker, setShowPicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-GB"); // "DD/MM/YYYY"
      handleInputChange("dob", formattedDate);
    }
  };

  const addExperienceType = () => {
    if (customExpType.trim()) {
      const updatedExpTypes = [...expTypeList, customExpType.trim()];
      setExpTypeList(updatedExpTypes);
      setFormData({ ...formData, expType: updatedExpTypes.join(", ") });
      setCustomExpType("");
    }
  };

  const pickImage = async (imageType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prevData) => ({
        ...prevData,
        [imageType]: result.assets[0],
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.contact)) {
      Alert.alert("Error", "Contact must be exactly 10 digits");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.dob.trim()) {
      Alert.alert("Error", "Please enter your date of birth");
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Please enter your address");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.licenseNo.trim()) {
      Alert.alert("Error", "Please enter your license number");
      return false;
    }
    if (!/^[0-9]{12}$/.test(formData.adharNo)) {
      Alert.alert("Error", "Aadhaar number must be exactly 12 digits");
      return false;
    }
    if (!formData.photo) {
      Alert.alert("Error", "Please upload your profile photo");
      return false;
    }
    if (!formData.adharPhoto) {
      Alert.alert("Error", "Please upload your Aadhaar photo");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) {
      return;
    }

    setIsLoading(true);

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
      const response = await fetch(
        "https://sarathi-backend-file.onrender.com/api/drivers/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: submitForm,
        }
      );

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        Alert.alert(
          "Registration Successful",
          "Your registration is complete. Please wait for approval.",
          [{ text: "OK", onPress: () => navigation.navigate("DriverLogin") }]
        );
      } else {
        Alert.alert(
          "Registration Failed",
          data.message || "Please try again later"
        );
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Error",
        "Something went wrong. Please check your internet connection and try again."
      );
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={formData.name}
          onChangeText={(text) => handleInputChange("name", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Email Address <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => handleInputChange("email", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Contact Number <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          value={formData.contact}
          onChangeText={(text) => handleInputChange("contact", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create a secure password"
            secureTextEntry={!passwordVisible}
            value={formData.password}
            onChangeText={(text) => handleInputChange("password", text)}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Password must be at least 6 characters</Text>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
        <Text style={styles.buttonText}>Continue</Text>
        <Ionicons
          name="arrow-forward"
          size={18}
          color="#fff"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      <View style={styles.loginPrompt}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("DriverLogin")}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Details</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Date of Birth <Text style={styles.required}>*</Text>
        </Text>

        <Pressable onPress={() => setShowPicker(true)} style={styles.input}>
          <Text>{formData.dob || "DD/MM/YYYY"}</Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={
              formData.dob
                ? new Date(formData.dob.split("/").reverse().join("-"))
                : new Date()
            }
            mode="date"
            display="default"
            onChange={onChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Address <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Enter your complete address"
          multiline
          numberOfLines={3}
          value={formData.address}
          onChangeText={(text) => handleInputChange("address", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Years of Experience</Text>
        <TextInput
          style={styles.input}
          placeholder="Years of driving experience"
          keyboardType="numeric"
          value={formData.experience}
          onChangeText={(text) => handleInputChange("experience", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Experience Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.expType}
            style={styles.picker}
            onValueChange={(value) => handleInputChange("expType", value)}
          >
            <Picker.Item label="Select Experience Type" value="" />
            <Picker.Item label="Light Vehicle" value="light" />
            <Picker.Item label="Heavy Vehicle" value="heavy" />
            <Picker.Item label="Commercial Vehicle" value="commercial" />
            <Picker.Item label="Two Wheeler" value="two-wheeler" />
          </Picker>
        </View>
      </View>

      <View style={styles.customExpContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          placeholder="Add custom experience type"
          value={customExpType}
          onChangeText={setCustomExpType}
        />
        <TouchableOpacity
          style={styles.addExpButton}
          onPress={addExperienceType}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {formData.expType && (
        <View style={styles.selectedExpContainer}>
          <Text style={styles.selectedExpLabel}>Selected:</Text>
          <Text style={styles.selectedExpValue}>{formData.expType}</Text>
        </View>
      )}

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons
            name="arrow-back"
            size={18}
            color="#555"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verification Documents</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          License Number <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your driving license number"
          value={formData.licenseNo}
          onChangeText={(text) => handleInputChange("licenseNo", text)}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Aadhaar Number <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="12-digit Aadhaar number"
          keyboardType="numeric"
          maxLength={12}
          value={formData.adharNo}
          onChangeText={(text) => handleInputChange("adharNo", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Profile Photo <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage("photo")}
        >
          <Ionicons name="camera-outline" size={24} color="#555" />
          <Text style={styles.uploadText}>
            {formData.photo ? "Change Photo" : "Upload Photo"}
          </Text>
        </TouchableOpacity>

        {formData.photo && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: formData.photo.uri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setFormData({ ...formData, photo: null })}
            >
              <Ionicons name="close-circle" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Aadhaar Card Photo <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage("adharPhoto")}
        >
          <Ionicons name="document-outline" size={24} color="#555" />
          <Text style={styles.uploadText}>
            {formData.adharPhoto ? "Change Document" : "Upload Document"}
          </Text>
        </TouchableOpacity>

        {formData.adharPhoto && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: formData.adharPhoto.uri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setFormData({ ...formData, adharPhoto: null })}
            >
              <Ionicons name="close-circle" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.termsContainer}>
        <Ionicons name="information-circle-outline" size={18} color="#555" />
        <Text style={styles.termsText}>
          By registering, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons
            name="arrow-back"
            size={18}
            color="#555"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Register</Text>
              <Ionicons
                name="checkmark"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressIndicator, { width: `${(step / 3) * 100}%` }]}
        />
      </View>
      <View style={styles.stepIndicators}>
        <View style={[styles.stepDot, step >= 1 && styles.activeStepDot]}>
          <Text
            style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}
          >
            1
          </Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={[styles.stepDot, step >= 2 && styles.activeStepDot]}>
          <Text
            style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}
          >
            2
          </Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={[styles.stepDot, step >= 3 && styles.activeStepDot]}>
          <Text
            style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}
          >
            3
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Driver Registration</Text>
            <Text style={styles.headerSubtitle}>
              Create your driver account
            </Text>
          </View>

          {renderProgressBar()}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressIndicator: {
    height: "100%",
    backgroundColor: "#3275bb",
    borderRadius: 3,
  },
  stepIndicators: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStepDot: {
    backgroundColor: "#3275bb",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777",
  },
  activeStepNumber: {
    color: "#fff",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "#e0e0e0",
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  required: {
    color: "#ff3b30",
  },
  hint: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 12,
  },
  pickerContainer: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  customExpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addExpButton: {
    width: 45,
    height: 45,
    backgroundColor: "#3275bb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedExpContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  selectedExpLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginRight: 8,
  },
  selectedExpValue: {
    fontSize: 14,
    color: "#3275bb",
    fontWeight: "500",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    color: "#555",
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: "relative",
    alignSelf: "center",
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  termsText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: "#3275bb",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  registerButton: {
    backgroundColor: "#2c9e4b",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  backButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.45,
    marginRight: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    color: "#3275bb",
    fontWeight: "600",
  },
});

export default RegisterScreen;
