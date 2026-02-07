import { CleanClockEvent } from "./Employee";

// types/socket.ts
export interface AppNotification {
  _id: string;
  adminId: string | null;
  managerId: string;
  message: string;
  sender: string;
  date: string; // ISO Date string from server
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SocketUser {
  _id: string;
  adminId: string;
  department: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
  pushToken: string;
  registeredAt: string;
  role: string;
  __v: number;
}

// Remove internal DB fields and tokens for UI usage
export type CleanNotification = Omit<AppNotification, "__v" | "adminId" | "updatedAt">;

export type CleanSocketUser = Omit<SocketUser, "__v" | "pushToken" | "adminId">;



export type LocationState = {
  latitude: number;
  longitude: number;
  address?: string | null;
};

export interface MonitoringContextType {
  onlineMembers: CleanSocketUser[];
  notifications: CleanNotification[];
  clockEvents: { in: CleanClockEvent[]; out: CleanClockEvent[] };
  badgeCount: number;
  isConnected: boolean;
  userName: string | null;
  setUserName: (name: string | null) => void;
  sessionId: string | null;
  pushToken: string | null;
  setSessionId: (id: string | null) => void;
  setPushToken: (token: string | null) => void;
  sendLocation: (location: LocationState) => void;
  emitClockingStatus: (message: string) => void;
  emitLogout: () => void;
  disconnectSocket: () => void;
}

export interface SearchClockResponse {
  success: boolean;
  message?: string;
  clockEvents: CleanClockEvent[];
}
