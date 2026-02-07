import React from 'react';
import { View, Text } from 'react-native';
import { Clock, User, MapPin } from 'lucide-react-native';
import { CleanClockEvent } from '../Types/Employee';

interface Props {
  event: CleanClockEvent;
  type: 'in' | 'out';
}

export default function ClockEventCard ({ event, type }: Props) {
  // Use clockOutTime if it's a clock-out event, otherwise clockInTime
  const displayTime = type === 'out' && event.clockOutTime 
    ? event.clockOutTime 
    : event.clockInTime;

  const formattedTime = new Date(displayTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View 
      className="bg-white p-4 mb-3 rounded-2xl flex-row items-center shadow-sm border-l-4" 
      style={{ borderLeftColor: type === 'in' ? '#36AA8F' : '#ef4444' }}
    >
      <View className="bg-gray-100 p-2 rounded-full mr-4">
        <User size={20} color="#4b5563" />
      </View>

      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-base">{event.name}</Text>
        <Text className="text-gray-500 text-xs uppercase tracking-wider">{event.department}</Text>
        
        {/* Location snippet */}
        <View className="flex-row items-center mt-1">
          <MapPin size={10} color="#9ca3af" />
          <Text className="text-gray-400 text-[10px] ml-1" numberOfLines={1}>
            {type === 'in' ? event.clockInLocation : event.clockOutLocation || "No location"}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
          <Clock size={12} color="#36AA8F" />
          <Text className="ml-1 text-gray-700 font-bold text-xs">{formattedTime}</Text>
        </View>
        <Text className={`text-[10px] font-black uppercase mt-2 ${type === 'in' ? 'text-[#36AA8F]' : 'text-red-500'}`}>
          {type === 'in' ? 'Entered' : 'Exited'}
        </Text>
      </View>
    </View>
  );
};