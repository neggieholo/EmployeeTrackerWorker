import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react-native";
import { postChangePassword } from "../services/api";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    // 1. Basic Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length <= 8) {
    const passError = "New password must be more than 8 characters";
    setError(passError);
    Alert.alert("Security Requirement", passError);
    return;
  }

    setError(null);
    setLoading(true);

    try {
      const result = await postChangePassword(currentPassword, newPassword);

      if (result.success) {
        Alert.alert("Success", "Password changed successfully", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        // Use the specific error message from your backend (e.g., "Current password incorrect")
        setError(result.error || result.message || "Failed to change password");
      }
    } catch (err) {
      setError("A network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-gray-500 mb-8">
          Ensure your new password is secure and at least 6 characters long.
        </Text>

        {/* Error Message Display */}
        {error && (
          <View className="bg-red-50 p-4 rounded-xl mb-6 flex-row items-center border border-red-100">
            <AlertCircle size={20} color="#ef4444" />
            <Text className="text-red-600 ml-2 font-medium">{error}</Text>
          </View>
        )}

        {/* Input Fields */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Current Password</Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-14 shadow-sm">
              <Lock size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter current password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">New Password</Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-14 shadow-sm">
              <Lock size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter new password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">Confirm New Password</Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-14 shadow-sm">
              <Lock size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Repeat new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={loading}
          className={`mt-10 h-14 rounded-2xl flex-row items-center justify-center shadow-md ${
            loading ? "bg-gray-400" : "bg-[#1A73E8]"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <CheckCircle2 size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold text-lg ml-2">Update Password</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}