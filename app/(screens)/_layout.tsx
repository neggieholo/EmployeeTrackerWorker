import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function ScreensLayout() {
  return (
    <SafeAreaProvider>
        <Stack>
          {/* Register screen */}
          <Stack.Screen
            name="notifications"
            options={{
              title: "Notifications",
              headerShown: true,
            }}
          />
          
        </Stack>
    </SafeAreaProvider>
  );
}
