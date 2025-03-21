import axios from "axios";

export const Client = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_URL,
});

Client.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const client = {
  get: (url) => Client.get(url),
  post: (url, data) => Client.post(url, data),
  put: (url, data) => Client.put(url, data),
  delete: (url) => Client.delete(url),
};

export default client;
