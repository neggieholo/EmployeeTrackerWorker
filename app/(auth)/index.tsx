import { useRouter } from "expo-router";
import React, {  useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMonitoring } from "../SocketContext";
import FormInput from "../components/FormInput";
import "../global.css";
import registerForPushNotificationsAsync from "../services/Notifications";
import postLogin from "../services/api";



export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { setSessionId, setPushToken, setUserName } = useMonitoring();

  const handleLogin = async () => {
    setLoading(true);
    console.log("Attempting login for:", email);

    try {
      // 1. Try Push Notifications (Don't let this block login)
      try {
        const pushTokenResponse = await registerForPushNotificationsAsync();
        if (pushTokenResponse) {
          setPushToken(pushTokenResponse);
        }
      } catch (pushErr) {
        console.warn("Push token failed, continuing login:", pushErr);
      }

      // 2. Main Login Request
      const response = await postLogin(email, password);
      console.log("API Response:", response); // Debugging

      if (response.success) {
        setUserName(response.displayName || null);
        setSessionId(response.sessionId || null);
        router.replace("/dashboard");
      } else {
        const msg = response.message || "Invalid email or password.";
        Alert.alert("Login Failed", msg);
      }
    } catch (err: any) {
      console.error("Login catch error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Server is unreachable";

      // Properly formatted Alert
      Alert.alert("Connection Error", `Details: ${errorMessage}`, [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined} // Android handles this better when undefined or with specific offsets
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Adjust this number if the header blocks the view
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true} // Expo/React Native property to help with padding
        >
          {/* 1. TOP SECTION: Logo & Titles */}
          <View className="items-center mt-10">
            <Image
              source={require("../../assets/images/empt_logo.png")}
              className="w-24 h-24"
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-gray-800 mt-4">
              Employee Tracker
            </Text>
            <Text className="text-xl text-gray-500 font-medium">Worker</Text>
          </View>

          {/* 2. MIDDLE SECTION: Login Form */}
          <View className="flex-1 justify-start px-8">
            <View className="w-full p-3 mt-14 rounded-md shadow-md bg-white">
              <View className="flex-row mb-3 bg-gray-200 p-1 rounded-xl">
                <TouchableOpacity 
                  className="flex-1 py-3 rounded-lg items-center bg-white shadow-sm"
                >
                  <Text className="font-bold text-[#1A73E8]">Email</Text>
                </TouchableOpacity>
                <TouchableOpacity                
                  onPress={() => router.replace("/phonelogin")}
                  className="flex-1 py-3 rounded-lg items-center"
                >
                  <Text className="font-bold text-gray-500">Phone</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-2xl font-bold mb-3 text-gray-800">
                Login
              </Text>

              <FormInput
                placeholder="Email Address"
                placeholderTextColor="#000000"
                className="bg-[#D1D5DB] text-black h-[40px] rounded-lg px-4 border border-[#6B7280]"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormInput
                placeholder="Password"
                placeholderTextColor="#000000"
                className="bg-[#D1D5DB] text-black h-[40px] rounded-lg px-4 border border-[#6B7280]"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Forgot Password Link - Moved under inputs */}
              <TouchableOpacity
                onPress={() => router.push("/ForgotPassword")}
                className="items-end mb-6"
              >
                <Text
                  className="font-semibold"
                  style={{ color: "#1A73E8" }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: "#1A73E8",
                  opacity: loading ? 0.6 : 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                }}
              >
                <Text className="text-white text-center font-semibold">
                  {loading ? "Authenticating..." : "Login"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. BOTTOM SECTION: Footer */}
          <View className="pb-6 items-center">
            <Text className="text-gray-400 text-sm mb-1">Powered by</Text>

            <View className="flex-row items-center gap-1">
              <Text className="font-bold text-gray-500 text-sm">Snametech</Text>

              <Image
                source={require("../../assets/images/sname_logo.png")}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
