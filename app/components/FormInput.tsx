import React from "react";
import { TextInput, View, TextInputProps } from "react-native";

interface FormInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function FormInput({ placeholder, value, onChangeText, secureTextEntry = false, keyboardType = "default", ...rest }: FormInputProps) {
  return (
  <View className="mb-4">
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="rgba(255,255,255,0.6)"
      keyboardType={keyboardType}
      className="border border-gray-300 rounded-lg px-4 py-3 bg-black/70 text-white"
      {...rest}
    />
  </View>
);
}
