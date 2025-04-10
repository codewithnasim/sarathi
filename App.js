import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Driver Screens
import DriverLoginScreen from "./screen/driver/DriverLoginScreen";
import DriverDashboard from "./screen/driver/DriverDashboard";
import TripHistory from "./screen/driver/TripHistory";
import DriverProfile from "./screen/driver/DriverProfile";
import DriverRegisterScreen from "./screen/driver/DriverRegisterScreen";
import ReviewScreen from "./screen/driver/ReviewScreen";
import RideRequests from "./screen/driver/RideRequests";
import SettingsScreen from "./screen/driver/SettingsScreen";
import SupportScreen from "./screen/driver/SupportScreen";
import RideAcceptanceScreen from "./screen/driver/RideAcceptanceScreen";
import EarningHistoryScreen from "./screen/driver/EarningHistoryScreen";
import DriverPrivacyPolicy from "./screen/driver/DriverPrivacyPolicy";
import DriverNotificationScreen from "./screen/driver/DriverNotificationScreen";
import DriverHelpSupport from "./screen/driver/DriverHelpSupport";
import DriverPaymentScreen from "./screen/driver/DriverPaymentScreen";
import ForgotPasswordDriverScreen from "./screen/driver/ForgotPasswordDriverScreen";
import DriverChatBot from "./screen/driver/DriverChatBot";
import DriverSessionManagementScreen from "./screen/driver/DriverSessionManagementScreen";

// User Screens
import BookingSummary from "./screen/user/BookingSummary";
import UserProfile from "./screen/user/UserProfile";
import DriverSearch from "./screen/user/DriverSearch";
import TripHistoryUser from "./screen/user/TripHistoryUser";
import UserDashboard from "./screen/user/UserDashboard";
import UserRegistration from "./screen/user/UserRegistration";
import UserLoginScreen from "./screen/user/UserLoginScreen";
import UserBookDriver from "./screen/user/UserBookDriver";
import TripSummary from "./screen/user/TripSummary";
import UserNotificationScreen from "./screen/user/UserNotificationScreen";
import ForgotPasswordUserScreen from "./screen/user/ForgotPasswordUserScreen";
import ViewDriverProfile from "./screen/user/ViewDriverProfile";
import SearchComponent from "./screen/user/SearchComponent";
import UserTrackMapWithDirection from "./screen/user/UserTrackMapWithDirection";
import UserSessionManagementScreen from "./screen/user/UserSessionManagementScreen";

// Admin Screens
import AdminDashboard from "./screen/admin/AdminDashboard";
import AdminLogin from "./screen/admin/AdminLogin";
import DriverDetailsScreen from "./screen/admin/DriverDetailsScreen";
import AllDriversScreen from "./screen/admin/AllDriversScreen";
import AdminManageUsers from "./screen/admin/AdminManageUsers";
import UserProfileAdmin from "./screen/admin/UserProfileAdmin";
import SendNotificationUser from "./screen/admin/SendNotificationUser";
import AdminSettings from "./screen/admin/AdminSettings";

// Home Page
import LandingPage from "./screen/LandingPage";
import UserDriverConnection from "./screen/UserDriverConnection";

// chat connection
import ChatScreen from "./screen/chating/ChatScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{ headerShown: false }}
      >
        {/* Common Page */}
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen
          name="UserDriverConnection"
          component={UserDriverConnection}
        />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />

        {/* Authentication */}
        <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
        <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />

        {/* Driver Screens */}
        <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
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
        <Stack.Screen name="DriverChatBot" component={DriverChatBot} />
        <Stack.Screen
          name="DriverSessionManagement"
          component={DriverSessionManagementScreen}
        />

        {/* User Screens */}
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="UserRegistration" component={UserRegistration} />
        <Stack.Screen name="DriverSearch" component={DriverSearch} />
        <Stack.Screen name="BookingSummary" component={BookingSummary} />
        <Stack.Screen name="TripHistoryUser" component={TripHistoryUser} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="UserLogin" component={UserLoginScreen} />
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
        <Stack.Screen name="SearchComponent" component={SearchComponent} />
        <Stack.Screen
          name="UserTrackMapWithDirection"
          component={UserTrackMapWithDirection}
        />
        <Stack.Screen
          name="UserSessionManagement"
          component={UserSessionManagementScreen}
        />

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

        <Stack.Screen name="AdminSettings" component={AdminSettings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
