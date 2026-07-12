import { useState } from "react";
import { createContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";
import { useContext } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  const Signup = async ({ name, email, password, phone }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/signup", {
        name,
        email,
        phone,
        password,
      });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success("Signup Successful");
      return true;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "Signup failed";
      seterror(msg);
      toast.error(msg);
      return false;
    } finally {
      setloading(false);
    }
  };
  const Login = async ({ email, password }) => {
    setloading(true);
    seterror(null);
    try {
      let resolvedDeviceId = localStorage.getItem("deviceId");
      if (!resolvedDeviceId) {
        resolvedDeviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("deviceId", resolvedDeviceId);
      }
      const res = await axiosInstance.post("/user/login", {
        email,
        password,
        deviceId: resolvedDeviceId,
      });

      if (res.data.status === "pending_otp") {
        return res.data;
      }

      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success("Login Successful");
      return { status: "success" };
    } catch (error) {
      const msg =
        error.response?.data?.message || error.response?.data || "Login failed";
      seterror(msg);
      toast.error(msg);
      return false;
    } finally {
      setloading(false);
    }
  };
  const verifyDeviceLogin = async (sessionId, otp) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/verify-device-otp", {
        sessionId,
        otp,
      });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success("Device Verified & Logged In");
      return true;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.response?.data || "Verification failed";
      seterror(msg);
      toast.error(msg);
      return false;
    } finally {
      setloading(false);
    }
  };
  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };
  
  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get("/user/profile");
      if (res.data.data) {
        const stored = localStorage.getItem("user");
        const token = stored ? JSON.parse(stored).token : null;
        const updatedUser = { ...res.data.data, token };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, Signup, Login, Logout, verifyDeviceLogin, refreshUser, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
