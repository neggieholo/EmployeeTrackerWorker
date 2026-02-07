import { useMonitoring } from "@/app/SocketContext";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import * as LocationModule from "../../modules/LocationModule";
import "../global.css";
import { fetchClockButtonStatus, fetchLastClocking, postClockEvent } from "../services/api";
import { LocationState } from "../Types/Socket";

export default function Dashboard() {
  const { userName, emitClockingStatus, sendLocation } = useMonitoring();
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTimes, setLastTimes] = useState({ lastClockIn: "...", lastClockOut: "..." });

  const [comment, setComment] = useState("");
  const webViewRef = useRef<WebView>(null);
  const [clockInfo, setClockInfo] = useState({
    text: "Clock In",
    enable: true,
  });

  const refreshDashboardData = async () => {
    const [times, status] = await Promise.all([
      fetchLastClocking(),
      fetchClockButtonStatus()
    ]);
    setLastTimes(times);
    setClockInfo(status);
  };

  // 1. Fetch on load
  useEffect(() => {
    refreshDashboardData();
  }, []);

  const formatTime = (timeString?: string) => {
    if (!timeString) return "No record today";
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  useEffect(() => {
    const startTrackingSafely = async () => {
      console.log("Checking permissions...");

      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        try {
          // This triggers the native Android popup to turn on Location
          await Location.enableNetworkProviderAsync();
        } catch (error: any) {
          console.log("User refused to enable location services");
          return; // Stop if they won't turn it on
        }
      }
      const ignored = await LocationModule.isBatteryOptimizationIgnored();

      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (fgStatus === "granted") {
        await Location.requestBackgroundPermissionsAsync();

        console.log("Permissions granted, starting native module...");
        if (!ignored) {
          try {
            LocationModule.requestBatteryOptimization();
          } catch (e) {
            console.log("Battery setting popup skipped or failed", e);
          }
        }
        try {
          LocationModule.startTracking();
        } catch (e) {
          console.error("Failed to start native tracking", e);
        }
      }
    };

    startTrackingSafely();

    // 3. LISTEN for the updates coming from Kotlin
    const subscription = LocationModule.addLocationListener((data) => {
      // console.log("Update received in UI:", data);
      if (webViewRef.current) {
        const moveScript = `updateMap(${data.latitude}, ${data.longitude});`;
        webViewRef.current.injectJavaScript(moveScript);
      }
      setLocation(data);
      sendLocation(data);
    });

    return () => {
      subscription.remove();
    };
  }, []);


const handleClockAction = async () => {
  if (!location?.address) {
    Alert.alert("Error", "Location address not found.");
    return;
  }

  setIsLoading(true);
  try {
    // 1. Post to Backend (The router.post("/clock-in") we discussed)
    const result = await postClockEvent(
      userName || "Unknown Worker", 
      location.address, 
      comment
    );

    if (result.success) {
      // 2. Emit to Socket (This triggers the real-time update for Managers)
      // result.emit is the string: "Name clocked in at Time"
      emitClockingStatus(result.emit!);

      // 3. UI Cleanup
      setComment("");
      Alert.alert("Success", result.message);
      
      // Refresh local display labels
      refreshDashboardData(); 
    }
  } catch (error:any) {
    Alert.alert("Error", "Check server connection");
  } finally {
    setIsLoading(false);
  }
};

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: #f3f4f6; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-control-attribution { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map, marker;

          // Initialize Map immediately
          map = L.map('map', { 
            zoomControl: false,
            attributionControl: false 
          }).setView([0, 0], 2);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

          // Function called from React Native
          function updateMap(lat, lon) {
            if (!map) return;
            
            var newPos = [lat, lon];
            
            if (!marker) {
              // First time: Create marker and center map
              marker = L.marker(newPos).addTo(map);
              map.setView(newPos, 16);
            } else {
              // Updates: Move marker and pan smoothly
              marker.setLatLng(newPos);
              map.panTo(newPos);
            }
          }
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ paddingVertical: 5 }} // Added spacing for status bar and bottom
      showsVerticalScrollIndicator={false}
    >
      <View className="w-[90%] mx-auto mt-2 gap-y-4">
        {/* Last Clock In Label */}
        <View>
          <Text className="text-gray-800 font-bold text-md mb-1 ml-1">
            Last Clock In Time
          </Text>
          <View>
          <View className="bg-gray-100 p-1 rounded-lg border border-gray-300">
            <Text className="text-gray-600 text-base">{lastTimes.lastClockIn}</Text>
          </View>
        </View>
        </View>

        {/* Last Clock Out Label */}
        <View>
          <Text className="text-gray-800 font-bold text-md mb-1 ml-1">
            Last Clock Out Time
          </Text>
          <View>
          <View className="bg-gray-100 p-1 rounded-lg border border-gray-300">
            <Text className="text-gray-600 text-base">{lastTimes.lastClockOut}</Text>
          </View>
        </View>
        </View>

        {/* Comments Input */}
        <View>
          <TextInput
            placeholder="Comments (optional)"
            multiline
            numberOfLines={3}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
            className="bg-white border border-gray-300 p-2 rounded-lg h-32 text-base text-gray-800"
          />
        </View>

        <TouchableOpacity
          disabled={!clockInfo.enable || isLoading}
          className={`p-1 mb-4 rounded-xl shadow-md items-center justify-center ${
            clockInfo.enable ? "bg-[#1A73E8]" : "bg-gray-400"
          } ${isLoading ? "opacity-70" : "opacity-100"}`}
          onPress={handleClockAction}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {clockInfo.text}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="h-80 w-[85%] mx-auto border-y border-gray-300 overflow-hidden rounded-xl bg-gray-200">
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          scrollEnabled={false}
          className="flex-1"
          // Use location to set the INITIAL state, but don't bind the
          // whole HTML string to the location state to avoid re-renders.
          source={{ html: mapHtml }}
          onLoadEnd={() => {
            if (location) {
              const initScript = `updateMap(${location.latitude}, ${location.longitude});`;
              webViewRef.current?.injectJavaScript(initScript);
            }
          }}
        />
      </View>

      {/* 3. Location Address at the Bottom */}
      <View className="p-6 items-center">
        <Text className="text-gray-500 text-xs tracking-widest uppercase mb-1">
          Your current location:
        </Text>

        <Text className="text-gray-900 text-lg font-bold text-center leading-6">
          {location?.address ?? "Resolving address..."}
        </Text>

        {location && (
          <View className="mt-2 bg-gray-200 px-3 py-1 rounded-full">
            <Text className="text-gray-600 text-[10px] font-mono">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
