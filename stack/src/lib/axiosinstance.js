import axios from "axios";

const axiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? "" : (process.env.BACKEND_URL || "http://localhost:5000"),
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return req;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const msg = error.response?.data?.message || "";
      if (
        msg.toLowerCase().includes("token") || 
        msg.toLowerCase().includes("authentication required")
      ) {
        localStorage.removeItem("user");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
