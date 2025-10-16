import api from "./axios";

export const login = (email, password) =>
  api.post("/api/login", { email, password }).then((r) => r.data);

export const register = (name, email, password, role = "customer") =>
  api.post("/api/register", { name, email, password, role }).then((r) => r.data);

export const me = () => api.get("/api/me").then((r) => r.data);

export const logout = () => api.post("/api/logout").then((r) => r.data);
