import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/hrms";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hrms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function fileUrl(relativePath) {
  if (!relativePath) {
    return "";
  }

  const baseOrigin = API_BASE_URL.replace(/\/api\/hrms$/, "");
  return `${baseOrigin}${relativePath}`;
}

export async function downloadBinary(url, filename) {
  const response = await api.get(url, { responseType: "blob" });
  const downloadUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(downloadUrl);
}
