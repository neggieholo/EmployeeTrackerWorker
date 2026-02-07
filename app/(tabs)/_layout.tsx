import { Tabs, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Alert, Text, View } from "react-native";
import { useMonitoring } from "../SocketContext";
import { postLogout } from "../services/api";

export default function TenantTabsLayout() {
  const { disconnectSocket, userName, emitLogout } = useMonitoring(); // Pull userName here
  const brandColor = "#1A73E8"; 
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          emitLogout(); 
          disconnectSocket();
          const result = await postLogout();
          if (result.success) {
            router.replace("/");
          } else {
            Alert.alert("Logout failed:", result.message);
          } 
        } 
      },
    ]);
  };

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
          tabBarStyle: { backgroundColor: brandColor, borderTopWidth: 0 },
          headerStyle: { backgroundColor: brandColor },
          headerTintColor: "#FFFFFF",
          headerTitleAlign: "left", // Titles on the left for all screens
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            headerShown: true, // Keep header on for the greeting
            // CUSTOM HEADER FOR DASHBOARD ONLY
            headerTitle: () => (
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                Hi, {userName || "Worker"}
              </Text>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            headerShown: true,
            headerRight: undefined, // No logout here
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="ChangePassword"
          options={{
            title: "Change Password",
            headerShown: true,
            headerRight: undefined, // No logout here
            tabBarIcon: ({ color, size }) => <Ionicons name="key-outline" size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="Records"
          options={{
            title: "Records",
            headerShown: true,
            headerRight: undefined, // No logout here
            tabBarIcon: ({ color, size }) => <Ionicons name="clipboard" size={size} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}