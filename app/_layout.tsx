import * as Location from "expo-location";
import { Stack } from "expo-router";
import { MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { AppState, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MonitoringProvider from "./SocketContext";

export default function RootLayout() {
  const [isLocationOff, setIsLocationOff] = useState(false);

  const checkLocationStatus = async () => {
    const enabled = await Location.hasServicesEnabledAsync();

    // Update state only if it changed to avoid render loops
    setIsLocationOff((prev) => {
      if (prev !== !enabled) return !enabled;
      return prev;
    });
  };

  useEffect(() => {
    // 1. Initial check
    checkLocationStatus();

    // 2. The Interval (The "Real" Fix)
    // This runs every 2 seconds regardless of whether the app is
    // in the foreground, background, or if the shade is pulled down.
    const interval = setInterval(() => {
      checkLocationStatus();
    }, 2000);

    // 3. Keep AppState as a backup for instant wake-ups
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkLocationStatus();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []); // Empty array so it only mounts once

  if (isLocationOff) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-10">
        <View className="bg-red-100 p-6 rounded-full mb-6">
          <MapPin size={40} color="#ef4444" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center">
          GPS Disabled
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">
          This app requires active location services to function. Please turn on
          your GPS.
        </Text>
        <TouchableOpacity
          onPress={checkLocationStatus}
          className="bg-[#36AA8F] w-full py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Check Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <MonitoringProvider>
        <Stack>
          {/* Login screen */}
          <Stack.Screen
            name="(auth)" // maps to app/index.tsx
            options={{
              title: "Auth", // custom title
              headerShown: false, // hide the header
            }}
          />

          {/* Register screen */}
          <Stack.Screen
            name="(tabs)"
            options={{
              title: "",
              headerShown: false,
            }}
          />
          
          <Stack.Screen
            name="(screens)"
            options={{
              title: "Screens",
              headerShown: false,
            }}
          />
        </Stack>
      </MonitoringProvider>
    </SafeAreaProvider>
  );
}
