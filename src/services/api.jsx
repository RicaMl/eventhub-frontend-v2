import axios from "axios";

// ─── Base configuration ────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// with jwt
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("eh-token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
//   }
// );

// with token authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("eh-token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("eh-token");
      localStorage.removeItem("eh-user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  login: (username, password) =>
    api.post("/auth/login/", { username, password }).then((r) => r.data),

  register: (data) =>
    api.post("/auth/signup/", data).then((r) => r.data),

  getProfile: () =>
    api.get("/auth/me/").then((r) => r.data),

  updateProfile: (data) =>
    api.patch("/auth/me/", data).then((r) => r.data),
};

// ─── Events ────────────────────────────────────────────────────────────────
export const eventService = {
  getAll: (params = {}) =>
    api.get("/events/", { params }).then((r) => r.data),

  getOne: (id) =>
    api.get(`/events/${id}/`).then((r) => r.data),

  create: (data) =>
    api.post("/events/", data).then((r) => r.data),

  update: (id, data) =>
    api.patch(`/events/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/events/${id}/`).then((r) => r.data),

  getParticipants: (id) =>
    api.get(`/events/${id}/participants/`).then((r) => r.data),

  addParticipant: (eventId, participantId) =>
    api.post(`/events/${eventId}/add_participant/`, { participant_id: participantId }).then((r) => r.data),
};

// ─── Participants ──────────────────────────────────────────────────────────
export const participantService = {
  getAll: (params = {}) =>
    api.get("/participants/", { params }).then((r) => r.data),

  getOne: (id) =>
    api.get(`/participants/${id}/`).then((r) => r.data),

  create: (data) =>
    api.post("/participants/", data).then((r) => r.data),

  update: (id, data) =>
    api.patch(`/participants/${id}/`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/participants/${id}/`).then((r) => r.data),

  getEvents: (id) =>
    api.get(`/participants/${id}/events/`).then((r) => r.data),
};

// ─── Registrations ─────────────────────────────────────────────────────────
export const registrationService = {
  getAll: (params = {}) =>
    api.get("/registrations/", { params }).then((r) => r.data),

  register: (eventId) =>
    api.post("/registrations/", { event_id: eventId }).then((r) => r.data),

  unregister: (registrationId) =>
    api.delete(`/registrations/${registrationId}/`).then((r) => r.data),

  unregisterByEvent: (eventId) =>
    api.delete(`/registrations/by-event/?event_id=${eventId}`).then((r) => r.data),

  getMyRegistrations: () =>
    api.get("/registrations/my/").then((r) => r.data),
};

// ─── Dashboard stats ───────────────────────────────────────────────────────
export const statsService = {
  getStats: () =>
    api.get("/dashboard/").then((r) => r.data),
};

export default api;
