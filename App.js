import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer, DrawerActions } from "@react-navigation/native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Driver Screens
import DriverLoginScreen from "./screen/driver/DriverLoginScreen";
import DriverRegisterScreen from "./screen/driver/DriverRegisterScreen";
import DriverDashboard from "./screen/driver/DriverDashboard";
import TripHistory from "./screen/driver/TripHistory";
import DriverProfile from "./screen/driver/DriverProfile";
import ReviewScreen from "./screen/driver/ReviewScreen";
import RideRequests from "./screen/driver/RideRequests";
import RideAcceptanceScreen from "./screen/driver/RideAcceptanceScreen";
import EarningHistoryScreen from "./screen/driver/EarningHistoryScreen";
import SettingsScreen from "./screen/driver/SettingsScreen";
import SupportScreen from "./screen/driver/SupportScreen";
import DriverHelpSupport from "./screen/driver/DriverHelpSupport";
import DriverNotificationScreen from "./screen/driver/DriverNotificationScreen";
import DriverPrivacyPolicy from "./screen/driver/DriverPrivacyPolicy";
import DriverPaymentScreen from "./screen/driver/DriverPaymentScreen";
import ForgotPasswordDriverScreen from "./screen/driver/ForgotPasswordDriverScreen";

// User Screens
import UserDashboard from "./screen/user/UserDashboard";
import UserRegistration from "./screen/user/UserRegistration";
import UserLoginScreen from "./screen/user/UserLoginScreen";
import DriverSearch from "./screen/user/DriverSearch";
import BookingSummary from "./screen/user/BookingSummary";
import TripHistoryUser from "./screen/user/TripHistoryUser";
import UserProfile from "./screen/user/UserProfile";
import UserBookDriver from "./screen/user/UserBookDriver";
import TripSummary from "./screen/user/TripSummary";
import UserNotificationScreen from "./screen/user/UserNotificationScreen";
import ForgotPasswordUserScreen from "./screen/user/ForgotPasswordUserScreen";
import ViewDriverProfile from "./screen/user/ViewDriverProfile";

// Admin Screens
import AdminDashboard from "./screen/admin/AdminDashboard";
import AdminLogin from "./screen/admin/AdminLogin";
import DriverDetailsScreen from "./screen/admin/DriverDetailsScreen";
import AllDriversScreen from "./screen/admin/AllDriversScreen";
import AdminManageUsers from "./screen/admin/AdminManageUsers";
import UserProfileAdmin from "./screen/admin/UserProfileAdmin";
import SendNotificationUser from "./screen/admin/SendNotificationUser";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Common Screens
import LandingPage from "./screen/LandingPage";
import UserDriverConnection from "./screen/UserDriverConnection";

// Chat Screens
import ChatConnectionList from "./screen/chating/ChatConnectionList";
import ChatScreen from "./screen/chating/ChatScreen";
//togglebutton
// import AppNavigator from "./screen/AppNavigator";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
function MainStackNavigator({ navigation }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="LandingPage"
        component={LandingPage}
        options={{
          title: "Landing Page",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
      <Stack.Screen name="UserDashboard" component={UserDashboard} />
      <Stack.Screen name="DriverProfile" component={DriverProfile} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
const handleLogout = async (navigation) => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userEmail");
            navigation.replace("AuthStack");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
        style: "destructive",
      },
    ],
    { cancelable: false }
  );
};

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Sarathi</Text>
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => handleLogout(props.navigation)}
      >
        <Ionicons name="log-out-outline" size={24} color="red" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

// Drawer Navigator for Driver
function DriverDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="DriverDashboardDrawer"
        component={DriverDashboard}
        options={{
          title: "Dashboard",
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={focused ? "#7CC" : "#ccc"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="DriverProfileDrawer"
        component={DriverProfile}
        options={{
          title: "Profile",
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={focused ? "#7CC" : "#ccc"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="EarningsDrawer"
        component={EarningHistoryScreen}
        options={{
          title: "Earnings",
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={size}
              color={focused ? "#7CC" : "#ccc"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="SettingsDrawer"
        component={SettingsScreen}
        options={{
          title: "Settings",
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={focused ? "#7CC" : "#ccc"}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{ headerShown: false }}
      >
        {/* Common Screens */}
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen
          name="UserDriverConnection"
          component={UserDriverConnection}
        />
        <Stack.Screen
          name="ChatConnectionList"
          component={ChatConnectionList}
        />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />

        {/* Authentication Screens */}
        <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
        <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
        <Stack.Screen name="UserLogin" component={UserLoginScreen} />
        <Stack.Screen name="UserRegistration" component={UserRegistration} />

        {/* Driver Screens */}
        <Stack.Screen
          name="DriverDashboard"
          component={DriverDrawerNavigator}
        />
        <Stack.Screen name="TripHistory" component={TripHistory} />
        <Stack.Screen name="DriverProfile" component={DriverProfile} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="RideRequests" component={RideRequests} />
        <Stack.Screen name="RideAcceptance" component={RideAcceptanceScreen} />
        <Stack.Screen name="Earnings" component={EarningHistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="DriverHelpSupport" component={DriverHelpSupport} />
        <Stack.Screen
          name="DriverNotificationScreen"
          component={DriverNotificationScreen}
        />
        <Stack.Screen
          name="DriverPrivacyPolicy"
          component={DriverPrivacyPolicy}
        />
        <Stack.Screen name="DriverPayment" component={DriverPaymentScreen} />
        <Stack.Screen
          name="ForgotPasswordDriver"
          component={ForgotPasswordDriverScreen}
        />

        {/* User Screens */}
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="DriverSearch" component={DriverSearch} />
        <Stack.Screen name="BookingSummary" component={BookingSummary} />
        <Stack.Screen name="TripHistoryUser" component={TripHistoryUser} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="UserBookDriver" component={UserBookDriver} />
        <Stack.Screen name="TripSummary" component={TripSummary} />
        <Stack.Screen
          name="UserNotificationScreen"
          component={UserNotificationScreen}
        />
        <Stack.Screen
          name="ForgotPasswordUser"
          component={ForgotPasswordUserScreen}
        />
        <Stack.Screen name="ViewDriverProfile" component={ViewDriverProfile} />

        {/* Admin Screens */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} />
        <Stack.Screen
          name="DriverDetailsScreen"
          component={DriverDetailsScreen}
        />
        <Stack.Screen name="AllDriversScreen" component={AllDriversScreen} />
        <Stack.Screen name="AdminManageUsers" component={AdminManageUsers} />
        <Stack.Screen name="UserProfileAdmin" component={UserProfileAdmin} />
        <Stack.Screen
          name="SendNotificationUser"
          component={SendNotificationUser}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    height: 150,
    backgroundColor: "#7CC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  drawerHeaderText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  logoutText: {
    marginLeft: 10,
    color: "red",
    fontSize: 16,
  },
});
