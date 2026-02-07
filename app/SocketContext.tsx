import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { io, Socket } from "socket.io-client";
import { fetchTodayClock, postLogout } from "./services/api";
import { CleanClockEvent } from "./Types/Employee";
import {
  CleanNotification,
  CleanSocketUser,
  MonitoringContextType,
  LocationState
} from "./Types/Socket";

export const MonitoringContext = createContext<
  MonitoringContextType | undefined
>(undefined);

export default function MonitoringProvider({
  children,
}: {
  children: ReactNode;
}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  // Auth States
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Data States
  const [onlineMembers, setOnlineMembers] = useState<CleanSocketUser[]>([]);
  const [notifications, setNotifications] = useState<CleanNotification[]>([]);
  const [clockEvents, setClockEvents] = useState<{
    in: CleanClockEvent[];
    out: CleanClockEvent[];
  }>({ in: [], out: [] });
  const badgeCount = notifications.length;

  const disconnectSocket = () => {
    if (socketRef.current) {
      console.log("🔌 Manually disconnecting socket...");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    // Only connect if we have a valid session ID from login
    if (!sessionId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const newSocket = io("http://10.35.61.113:3060", {
      path: "/api/socket.io", // 👈 MUST match the server path exactly
      transports: ["websocket"],
      autoConnect: true,
      extraHeaders: {
        cookie: `connect.sid=${sessionId}`,
      }
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Manager Connected via Session ID");
    });

    newSocket.on("onlineCheck", (users: CleanSocketUser[]) => {
      console.log("Online members update:", users);
      setOnlineMembers(users);
    });

    newSocket.on(
      "messages",
      (data: CleanNotification | CleanNotification[]) => {
        setNotifications((prev) => {
          const incoming = Array.isArray(data) ? data : [data];

          // Combine and remove duplicates based on the _id from your logs
          const combined = [...incoming, ...prev];
          return combined.filter(
            (v, i, a) => a.findIndex((t) => t._id === v._id) === i,
          );
        });
      },
    );

    newSocket.on("notification_deleted", (id: string) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    });

    newSocket.on("all_notifications_deleted", () => setNotifications([]));

    newSocket.on("disconnect", async (reason) => {
      setIsConnected(false);
      console.log("❌ Manager Disconnected");
      if (
        reason === "io server disconnect" ||
        reason === "io client disconnect"
      ) {
        try {
          await postLogout();
          setSessionId(null); // Clear local state
          router.replace("/");
          // Alert.alert(
          //   "Session Ended",
          //   "You have been logged out by the server.",
          // );
        } catch (err) {
          router.replace("/");
        }
      } else {
        // It was just a network drop! Socket.io will try to reconnect automatically.
        console.log("Keep calm, attempting to reconnect...");
      }
    });

    socketRef.current = newSocket; // 2. Assign to ref instead of state

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [sessionId, pushToken, router]);

  const sendLocation = (location: LocationState) => {
  if (socketRef.current && socketRef.current.connected) {
    const timestamp = new Date().toISOString();
    
    socketRef.current.emit("user_location", {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      timestamp,
    });
    console.log(`📍 Location sent: ${location.latitude}, ${location.longitude}`);
  }
};

  const emitClockingStatus = (message: string) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log("📡 Emitting clocking_status:", message);
      socketRef.current.emit("clocking_status", { message });
    } else {
      console.warn("⚠️ Socket not connected, could not emit status");
    }
  };

  const emitLogout = () => {
    if (socketRef.current && socketRef.current.connected) {
      console.log("📤 Emitting employee_logged_out...");
      socketRef.current.emit("employee_logged_out");
    } else {
      console.warn("⚠️ Socket not connected, could not emit logout event");
    }
  };

  return (
    <MonitoringContext.Provider
      value={{
        onlineMembers,
        clockEvents,
        notifications,
        badgeCount,
        isConnected,
        userName,
        setUserName,
        sessionId,
        pushToken,
        setSessionId,
        setPushToken,
        sendLocation,
        emitClockingStatus,
        emitLogout,
        disconnectSocket,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
}

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context)
    throw new Error("useMonitoring must be used within MonitoringProvider");
  return context;
};
