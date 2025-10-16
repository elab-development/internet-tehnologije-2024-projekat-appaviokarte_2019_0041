import axios from "axios";

const api = axios.create({
  baseURL:   "http://127.0.0.1:8000/api/",
 
  withCredentials: false,
});

// Request: dodaj Authorization ako postoji token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: normalize error message i globalno hvatanje 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // opcija: obriši token i pošalji korisnika na login
      // localStorage.removeItem("auth_token");
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
