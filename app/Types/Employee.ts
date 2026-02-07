export interface EmployeeClockEvent {
  _id: string;
  adminId: string;
  managerId: string;
  workerId: string;
  name: string;
  department: string;
  status: "clocked in" | "clocked out";
  
  // Clock-in data
  clockInTime: string; // ISO string from backend
  clockInLocation: string;
  clockInComment?: string;

  // Clock-out data
  clockOutTime: string | null;
  clockOutLocation?: string;
  clockOutComment?: string;

  date: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Clean version for the UI (Optional but recommended)
export type CleanClockEvent = Omit<EmployeeClockEvent, "__v" | "adminId" | "managerId">;

export default interface NetworkError {
  message?: string;
  success?: boolean;
  response?: {
    data?: {
      message?: string;
      success?: boolean;
    };
  };
}

export interface Employee {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  gender: string;
  role: string;
  supervisingManagerId?: string;
}

// This matches the format expected by your Profile/Detail view
export type EmployeeProfile = {
  Name: string;
  Email: string;
  Phone: string;
  Department: string;
  Gender: string;
  Role: string;
};