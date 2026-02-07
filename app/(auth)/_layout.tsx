import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade", // This makes the switch smooth instead of sliding
          animationDuration: 0, // Very fast transition
        }}
      >
        {/* Login screen */}
        <Stack.Screen
          name="index" // maps to app/index.tsx
          options={{
            title: "Email Login", // custom title
            headerShown: false, // hide the header
          }}
        />

        <Stack.Screen
          name="phonelogin" // maps to app/index.tsx
          options={{
            title: "Phone Login", // custom title
            headerShown: false, // hide the header
          }}
        />

        {/* Register screen */}
        <Stack.Screen
          name="ForgotPassword"
          options={{
            title: "Forgot Password",
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
