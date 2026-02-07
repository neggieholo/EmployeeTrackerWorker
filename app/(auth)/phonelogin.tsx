import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import PhoneInput from "react-native-phone-number-input"; // Ensure this is installed
import { SafeAreaView } from "react-native-safe-area-context";
import { useMonitoring } from "../SocketContext";
import FormInput from "../components/FormInput";
import "../global.css";
import registerForPushNotificationsAsync from "../services/Notifications";
import { postPhoneLogin } from "../services/api";

export default function PhoneLoginScreen() {
  const router = useRouter();
  const phoneInputRef = useRef<PhoneInput>(null);

  const [phone, setPhone] = useState<string>("");
  const [formattedPhone, setFormattedPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { setSessionId, setPushToken, setUserName } = useMonitoring();

  const handleLogin = async () => {
    // Validation
    const checkValid = phoneInputRef.current?.isValidNumber(phone);
    if (!checkValid) {
      return Alert.alert(
        "Invalid Phone",
        "Please enter a valid phone number for your region.",
      );
    }

    setLoading(true);

    try {
      // 1. Push Notifications
      try {
        const pushTokenResponse = await registerForPushNotificationsAsync();
        if (pushTokenResponse) setPushToken(pushTokenResponse);
      } catch (e) {
        console.warn("Push token skipped");
      }

      // 2. Main Phone Login Request
      const response = await postPhoneLogin(formattedPhone, password);

      if (response.success) {
        setUserName(response.displayName || null);
        setSessionId(response.sessionId || null);
        router.replace("/dashboard");
      } else {
        Alert.alert("Login Failed", response.message || "Invalid credentials");
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {/* 1. TOP SECTION */}
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

          {/* 2. MIDDLE SECTION */}
          <View className="flex-1 justify-start px-8">
            <View className="w-full p-3 mt-14 rounded-md shadow-md bg-white">
              {/* Identical Toggle - Clicking Email goes back to index */}
              <View className="flex-row mb-3 bg-gray-200 p-1 rounded-xl">
                <TouchableOpacity
                  onPress={() => router.replace("/")}
                  className="flex-1 py-3 rounded-lg items-center"
                >
                  <Text className="font-bold text-gray-500">Email</Text>
                </TouchableOpacity>
                <View className="flex-1 py-3 rounded-lg items-center bg-white shadow-sm">
                  <Text className="font-bold text-[#1A73E8]">Phone</Text>
                </View>
              </View>

              <Text className="text-2xl font-bold mb-3 text-gray-800">
                Login
              </Text>

              {/* Phone Input implementation */}
              <View className="mb-4">
                <PhoneInput
                  ref={phoneInputRef}
                  defaultValue={phone}
                  defaultCode="NG"
                  layout="first"
                  onChangeText={setPhone}
                  onChangeFormattedText={setFormattedPhone}
                  containerStyle={{
                    width: "100%",
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "#D1D5DB",
                    borderWidth: 1,
                    borderColor: "#374151",
                  }}
                  textInputStyle={{ color: "#000" }}
                  codeTextStyle={{ color: "#000" }}
                  textContainerStyle={{
                    backgroundColor: "transparent",
                    paddingVertical: 0,
                  }}
                />
              </View>

              <FormInput
                placeholder="Password"
                placeholderTextColor="#000000"
                className="bg-[#D1D5DB] text-black h-[40px] rounded-lg px-4 border border-[#6B7280]"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

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

          {/* 3. BOTTOM SECTION */}
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
