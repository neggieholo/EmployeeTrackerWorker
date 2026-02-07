import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { User, Mail, Phone } from "lucide-react-native";
// Import the new function
import { getProfile } from "@/app/services/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
    const data = await getProfile();
    
    // In your backend, you send 'error' on failure, not 'success: false'
    if (data.error) {
      Alert.alert("Error", data.error);
      // If unauthorized, you might want to kick them to login
      if (data.error.includes("Unauthorized")) router.replace("/");
    } else {
      setProfile(data);
      console.log("Profile data loaded:", data);
    }
    setLoading(false);
  };
    loadData();
  }, [router]);

 

  if (loading) return <ActivityIndicator size="large" className="flex-1" color="#36AA8F" />;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="p-6">
        <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <InfoRow icon={<User size={20} color="gray"/>} label="Name" value={profile?.Name} />
            <InfoRow icon={<Mail size={20} color="gray"/>} label="Email" value={profile?.Email} />
            <InfoRow icon={<Phone size={20} color="gray"/>} label="Phone" value={profile?.Phone} />
            <View className="mt-4 p-2 bg-[#36AA8F10] self-start rounded-lg">
                <Text className="text-[#1A73E8] font-bold uppercase text-xs">{profile?.Role}</Text>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: any) {
    return (
        <View className="flex-row items-center mb-6">
            <View className="w-10">{icon}</View>
            <View>
                <Text className="text-gray-400 text-xs">{label}</Text>
                <Text className="text-gray-800 text-lg font-semibold">{value || 'Not set'}</Text>
            </View>
        </View>
    );
}