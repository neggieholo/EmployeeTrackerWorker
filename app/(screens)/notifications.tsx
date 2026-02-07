import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useMonitoring } from "../SocketContext";
import { X, BellOff, Trash2 } from "lucide-react-native";

export default function NotificationsScreen() {
  const { notifications, deleteNotification, deleteAll } = useMonitoring();

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center bg-white mb-3 p-4 rounded-2xl shadow-sm border border-gray-100">
      <View className="flex-1 mr-2">
        <Text className="text-gray-900 font-semibold text-base">
          {item.sender}
        </Text>
        <Text className="text-gray-600 text-sm my-1">{item.message}</Text>
        <Text className="text-gray-400 text-[10px]">
          {new Date(item.date).toLocaleString()}
        </Text>
      </View>

      {/* Delete Single Notification */}
      <TouchableOpacity 
        onPress={() => deleteNotification(item._id)}
        className="bg-gray-100 p-2 rounded-full"
      >
        <X size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-end px-4 py-4 bg-white shadow-sm">

        {notifications.length > 0 && (
          <TouchableOpacity 
            onPress={deleteAll}
            className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <Trash2 size={16} color="#ef4444" />
            <Text className="text-red-500 font-bold text-xs ml-1">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center mt-20">
            <BellOff size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">No notifications yet</Text>
          </View>
        )}
      />
    </View>
  );
}