const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  return "https://rootx-school-ms-server.vercel.app";
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
