import { CleanClockEvent } from "../Types/Employee";
import { SearchClockResponse } from "../Types/Socket";

const BASE_URL = "http://10.21.77.113:3060/api";

export default async function postLogin(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_URL}/worker/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();
    console.log("Login response:", data);

    return data;
  } catch (err) {
    console.log("Error:", err);
    return { success: false, message: "Network error" };
  }
}

export const postPhoneLogin = async (phoneNumber: string, password: string) => {
  try {
    const res = await fetch(`${BASE_URL}/worker/phone_login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, password }),
      credentials: "include", // 🟢 Critical for session handling
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: "Network error" };
  }
};

export const postRegister = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/register/tenant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      credentials: "include", // for session cookies
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("Registration error:", err);
    return { success: false, message: "Network error" };
  }
};

export const resetPasswordLink = async (email: string) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include", // for session cookies
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("Reset password error:", err);
    return { success: false, message: "Network error" };
  }
};

export const postChangePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const res = await fetch(`${BASE_URL}/worker/change_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: "include",
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("Change password error:", err);
    return { success: false, message: "Network error" };
  }
};

/**
 * Logs out the current user and destroys the session on the server
 */
export const postLogout = async () => {
  try {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: "GET", // Matches your app.get route
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Required to send the session cookie for destruction
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("Logout API error:", err);
    return { success: false, message: "Network error during logout" };
  }
};

export const fetchTodayClock = async (): Promise<{
  clockedInEvents: CleanClockEvent[];
  clockedOutEvents: CleanClockEvent[];
}> => {
  try {
    const response = await fetch(`${BASE_URL}/records/get-self-clock-events`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();

    if (!data.success || !Array.isArray(data.clockEvents)) {
      return { clockedInEvents: [], clockedOutEvents: [] };
    }

    const events: CleanClockEvent[] = data.clockEvents;
    const todayStr = new Date().toISOString().split("T")[0];

    const todayEvents = events.filter((event) => {
      if (!event.clockInTime) return false;
      const eventDateStr = new Date(event.clockInTime)
        .toISOString()
        .split("T")[0];
      return eventDateStr === todayStr;
    });

    todayEvents.sort(
      (a, b) =>
        new Date(a.clockInTime).getTime() - new Date(b.clockInTime).getTime(),
    );

    return {
      clockedInEvents: todayEvents.filter((e) => e.status === "clocked in"),
      clockedOutEvents: todayEvents.filter((e) => e.status === "clocked out"),
    };
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    return { clockedInEvents: [], clockedOutEvents: [] };
  }
};


export const getProfile = async () => {
  try {
    const res = await fetch(`${BASE_URL}/worker/profile`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Crucial for session-based auth
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.log("Profile Fetch Error:", err);
    return { success: false, message: "Network error fetching profile" };
  }
};

/**
 * Searches for clock events. 
 * All arguments are optional. If none are provided, returns 10 most recent.
 */
export const searchClockEvents = async (
  startDate?: string | null, 
  endDate?: string | null, 
  name?: string | null
): Promise<SearchClockResponse> => {
  try {
    const requestBody: any = {};
    if (startDate) {
      requestBody.dateQuery = {
        startDate: startDate,
        endDate: endDate || startDate,
      };
    }

    if (name && name.trim() !== "") {
      requestBody.name = name.trim();
    }

    const res = await fetch(`${BASE_URL}/records/get-self-clock-events`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      credentials: "include", // Essential for aaPanel session cookies
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    // Log the response for debugging on your new emulator
    console.log("🛠️ Search API Response:", data);

    // Ensure we always return a valid object structure even if records aren't found
    if (!data.success) {
      return { 
        success: false, 
        message: data.message || "No records found", 
        clockEvents: [] 
      };
    }

    return data;
  } catch (err) {
    console.error("❌ Search Clock Events Error:", err);
    return { 
      success: false, 
      message: "Network error while searching records", 
      clockEvents: [] 
    };
  }
};

export const fetchClockButtonStatus = async (): Promise<{
  text: string;
  enable: boolean;
}> => {
  try {
    const response = await fetch(`${BASE_URL}/records/get-last-clock-event`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    console.log("Last clock event data:", data);

    // 1. Basic check: If success is false or data is missing
    if (!data || !data.timestamp || !data.type) {
      return { text: "Clock In", enable: true };
    }

    // 2. FIXED DATE PARSING: Handle the ISO string directly
    const lastDate = new Date(data.timestamp); 
    const today = new Date();

    const isSameDay =
      lastDate.getFullYear() === today.getFullYear() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getDate() === today.getDate();

    console.log(`Checking Day: LastEvent(${lastDate.toDateString()}) vs Today(${today.toDateString()}) - Match: ${isSameDay}`);

    // 3. Logic based on state
    if (data.type === "clocked in" && isSameDay) {
      console.log("Data.type:", data.type);
      return { text: "Clock Out", enable: true };
    } else if (data.type === "clocked out" && isSameDay) {
      return { text: "Clocked Out (Completed)", enable: false };
    } else {
      // It's a new day or no activity yet
      return { text: "Clock In", enable: true };
    }
  } catch (error) {
    console.error("❌ Error fetching last clock event:", error);
    return { text: "Clock In", enable: false }; // Disable to prevent double-clocks on error
  }
};

export const fetchLastClocking = async (): Promise<{
  lastClockIn: string;
  lastClockOut: string;
}> => {
  try {
    const response = await fetch(`${BASE_URL}/records/get-last-clocking`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Ensures aaPanel session is recognized
    });

    const data = await response.json();

    if (data && data.success !== false) {
      // Helper for the Flutter-style formatting: DD/MM/YYYY HH:mm
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      };

      return {
        lastClockIn: formatDate(data.lastClockInTime),
        lastClockOut: formatDate(data.lastClockOutTime),
      };
    }
    return { lastClockIn: "N/A", lastClockOut: "N/A" };
  } catch (error) {
    console.error("❌ Error fetching last clocking:", error);
    return { lastClockIn: "Error", lastClockOut: "Error" };
  }
};

export const postClockEvent = async (
  fullName: string,
  address: string,
  comment: string
): Promise<{ success: boolean; message?: string; emit?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/records/clock-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName,
        address,
        comment: comment.trim(),
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Clock Event Error:", error);
    return { success: false, message: "Network error occurred." };
  }
};