import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {
  generateSimplePDF,
  saveCSV,
  showNativePicker,
} from "../../modules/LocationModule";
import { searchClockEvents } from "../services/api";

export default function ReportsScreen() {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchInitialData = async () => {
    setLoading(true);
    const res = await searchClockEvents();
    if (res.success) setAllEvents(res.clockEvents);
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    fetchInitialData();
  };

  const handlePickDate = async (type: "start" | "end") => {
    try {
      const selectedDate = await showNativePicker();
      if (selectedDate && !selectedDate.includes("Error")) {
        if (type === "start") setStartDate(selectedDate);
        else setEndDate(selectedDate);
      }
    } catch (e) {
      console.log("Picker dismissed");
    }
  };

  const handleDateSearch = async () => {
    setLoading(true);
    const res = await searchClockEvents(
      startDate || null,
      endDate || null,
      null,
    );
    if (res.success) setAllEvents(res.clockEvents);
    else Alert.alert("No Results", res.message);
    setLoading(false);
  };

  const triggerNativeDownload = async (format: "csv" | "pdf") => {
    if (allEvents.length === 0)
      return Alert.alert("Empty", "No data to export.");
    setIsExporting(true);

    const now = new Date();
    const datePart = now.toISOString().split("T")[0]; // 2026-02-06
    const timePart = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // 11-50-44
    const fileName = `Report_${datePart}_${timePart}.${format}`;

    // Helper to clean data: Removes commas so they don't break CSV columns
    // and removes New Lines so they don't break PDF rows.
    const clean = (val: any) => {
      if (!val) return "N/A";
      return String(val).replace(/,/g, " ").replace(/\n/g, " ").trim();
    };

    const header =
      "Name,Status,Date,In-Time,In-Location,In-Comment,Out-Time,Out-Location,Out-Comment\n";

    const body = allEvents
      .map((e) => {
        const row = [
          clean(e.name),
          clean(e.status),
          e.date ? new Date(e.date).toLocaleDateString() : "N/A",
          e.clockInTime ? new Date(e.clockInTime).toLocaleTimeString() : "N/A",
          clean(e.clockInLocation),
          clean(e.clockInComment || "None"),
          e.clockOutTime
            ? new Date(e.clockOutTime).toLocaleTimeString()
            : "N/A",
          clean(e.clockOutLocation),
          clean(e.clockOutComment || "None"),
        ];
        return row.join(","); // Joining with a comma now works because 'clean' removed internal commas
      })
      .join("\n");

    try {
      let result;
      if (format === "csv") {
        result = await saveCSV(fileName, header + body);
      } else {
        // PDF Stacked Layout: Shows ALL data by wrapping it vertically
        const pdfBody = allEvents
          .map((e) => {
            const clockInDate = new Date(e.clockInTime);
            const clockOutDate = e.clockOutTime
              ? new Date(e.clockOutTime)
              : null;

            // Status Logic for the PDF
            const isPastMissing =
              !e.clockOutTime &&
              new Date(e.clockInTime).toDateString() !==
                new Date().toDateString();
            const displayStatus = isPastMissing
              ? "MISSING CLOCK-OUT"
              : e.status.toUpperCase();

            return [
              `NAME: ${clean(e.name)}`,
              `STATUS: ${displayStatus} | DATE: ${e.date ? new Date(e.date).toLocaleDateString() : "N/A"}`,
              `CLOCK-IN:  ${clockInDate.toLocaleTimeString()} at ${clean(e.clockInLocation)}`,
              e.clockInComment
                ? `IN-COMMENT: ${clean(e.clockInComment)}`
                : null,
              e.clockOutTime
                ? `CLOCK-OUT: ${clockOutDate?.toLocaleTimeString()} at ${clean(e.clockOutLocation)}`
                : `CLOCK-OUT: --- STILL ACTIVE / NO DATA ---`,
              e.clockOutComment
                ? `OUT-COMMENT: ${clean(e.clockOutComment)}`
                : null,
              `------------------------------------------------------------`, // Visual separator
              ` `, // Vertical spacing
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n");

        const pdfHeader =
          "DETAILED WORKER REPORT\nGenerated: " +
          new Date().toLocaleString() +
          "\n" +
          "=".repeat(60) +
          "\n\n";

        result = await generateSimplePDF(fileName, pdfHeader + pdfBody);
      }
      Alert.alert("Success", result);
    } catch (err: any) {
      Alert.alert("Export Error", err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] text-[#36AA8F] font-bold uppercase">
            {allEvents.length} Total Log(s)
          </Text>
        </View>
        {(startDate || endDate) && (
          <TouchableOpacity
            onPress={clearFilters}
            className="flex-row items-center bg-red-50 px-3 py-1 rounded-full"
          >
            <Ionicons name="refresh" size={14} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-1 text-xs">Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 p-4">
        {/* Filters and Search - Kept identical to your preferred style */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <View className="flex-row gap-2">
            <View className="flex-1 relative">
              <TouchableOpacity
                onPress={() => handlePickDate("start")}
                className="border border-gray-200 p-3 rounded-lg bg-gray-50 h-14 justify-center"
              >
                <Text className="text-[10px] text-gray-400 font-bold uppercase">
                  Start
                </Text>
                <Text className={startDate ? "text-gray-800" : "text-gray-400"}>
                  {startDate || "Select Date"}
                </Text>
              </TouchableOpacity>
              {startDate && (
                <TouchableOpacity
                  onPress={() => setStartDate("")}
                  className="absolute right-2 top-3 p-1"
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-1 relative">
              <TouchableOpacity
                onPress={() => handlePickDate("end")}
                className="border border-gray-200 p-3 rounded-lg bg-gray-50 h-14 justify-center"
              >
                <Text className="text-[10px] text-gray-400 font-bold uppercase">
                  End
                </Text>
                <Text className={endDate ? "text-gray-800" : "text-gray-400"}>
                  {endDate || "Select Date"}
                </Text>
              </TouchableOpacity>
              {endDate && (
                <TouchableOpacity
                  onPress={() => setEndDate("")}
                  className="absolute right-2 top-3 p-1"
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={handleDateSearch}
              className="bg-[#36AA8F] px-4 rounded-lg justify-center h-14"
            >
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => triggerNativeDownload("pdf")}
            className="flex-1 flex-row bg-red-500 p-3 rounded-xl items-center justify-center shadow-sm"
          >
            <Ionicons name="document-text" color="white" size={18} />
            <Text className="text-white ml-2 font-bold">PDF Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => triggerNativeDownload("csv")}
            className="flex-1 flex-row bg-[#36AA8F] p-3 rounded-xl items-center justify-center shadow-sm"
          >
            <Ionicons name="grid" color="white" size={18} />
            <Text className="text-white ml-2 font-bold">CSV Report</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#36AA8F" className="mt-10" />
        ) : (
          <FlatList
            data={allEvents}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const clockInDate = new Date(item.clockInTime);
              const today = new Date();

              // Formatting the shared date (e.g., "Feb 7, 2026")
              const sharedDate = clockInDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const isBeforeToday =
                clockInDate.getFullYear() < today.getFullYear() ||
                (clockInDate.getFullYear() === today.getFullYear() &&
                  clockInDate.getMonth() < today.getMonth()) ||
                (clockInDate.getFullYear() === today.getFullYear() &&
                  clockInDate.getMonth() === today.getMonth() &&
                  clockInDate.getDate() < today.getDate());

              return (
                <View className="bg-white p-4 mb-4 rounded-2xl shadow-sm border-l-4 border-[#36AA8F]">
                  {/* Top Section: Date and Status Badge */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="bg-gray-100 px-3 py-1 rounded-md">
                      <Text className="text-gray-600 font-bold text-xs">
                        {sharedDate}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${item.status === "clocked in" ? "bg-green-100" : "bg-gray-100"}`}
                    >
                      <Text
                        className={`text-[10px] font-bold uppercase ${item.status === "clocked in" ? "text-green-700" : "text-gray-700"}`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Worker Name */}
                  <Text className="font-bold text-gray-900 text-lg mb-3">
                    {item.name}
                  </Text>

                  {/* Clock IN Info */}
                  <View className="mb-4">
                    <View className="flex-row items-center mb-1">
                      <Ionicons
                        name="enter-outline"
                        size={14}
                        color="#36AA8F"
                      />
                      <Text className="ml-1 text-xs font-bold text-gray-400 uppercase">
                        Clock In Time
                      </Text>
                    </View>
                    <Text className="text-gray-800 text-base font-semibold">
                      {clockInDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {item.clockInLocation}
                    </Text>
                    {item.clockInComment ? (
                      <Text className="text-blue-600 text-xs italic mt-1">
                        &quot;{item.clockInComment}&quot;
                      </Text>
                    ) : null}
                  </View>

                  {/* Clock OUT Info */}
                  <View className="pt-3 border-t border-gray-100">
                    {item.clockOutTime ? (
                      <>
                        <View className="flex-row items-center mb-1">
                          <Ionicons
                            name="exit-outline"
                            size={14}
                            color="#ef4444"
                          />
                          <Text className="ml-1 text-xs font-bold text-gray-400 uppercase">
                            Clock Out Time
                          </Text>
                        </View>
                        <Text className="text-gray-800 text-base font-semibold">
                          {new Date(item.clockOutTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          {item.clockOutLocation}
                        </Text>
                        {item.clockOutComment ? (
                          <Text className="text-blue-600 text-xs italic mt-1">
                            &quot;{item.clockOutComment}&quot;
                          </Text>
                        ) : null}
                      </>
                    ) : (
                      <View className="flex-row items-center py-1">
                        <Ionicons
                          name={isBeforeToday ? "alert-circle" : "time"}
                          size={16}
                          color={isBeforeToday ? "#ef4444" : "#f59e0b"}
                        />
                        <Text
                          className={`ml-1 text-xs font-bold italic ${isBeforeToday ? "text-red-500" : "text-orange-500"}`}
                        >
                          {isBeforeToday
                            ? "Missing clock-out (Past Record)"
                            : "On Active Duty (Currently)"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
