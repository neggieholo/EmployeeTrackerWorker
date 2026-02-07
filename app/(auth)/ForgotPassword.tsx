import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert 
} from 'react-native';
import { resetPasswordLink } from '../services/api'; 
import { useRouter } from 'expo-router';

const ForgotPassword = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordLink(email);
      if (response.success) {
        Alert.alert(
          "Success", 
          response.message || "Check your inbox for reset instructions.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Error", response.message || "Something went wrong.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#001529] justify-center px-6"
    >
      <View className="bg-white/10 p-8 rounded-3xl border border-white/20 shadow-xl">
        <Text className="text-white text-3xl font-bold text-center mb-2">
          Forgot Password?
        </Text>
        <Text className="text-white/60 text-center mb-8">
          Enter your email and we&apos;ll send you a link to reset your password.
        </Text>

        <View className="mb-6">
          <TextInput
            className="bg-white/5 border border-white/10 rounded-xl p-4 color-white"
            placeholder="Enter your email"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity 
          activeOpacity={0.7}
          className={`bg-blue-500 p-4 rounded-xl items-center shadow-lg ${loading ? 'opacity-50' : 'opacity-100'}`}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/")} 
          className="mt-6 items-center"
        >
          <Text className="text-white/40 text-sm">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;