import axiosInstance from "../lib/axios";

export const sessionApi = {
  // 1. Create Session mein data aur token dono pass honge
  createSession: async ({ data, token }) => {
    const response = await axiosInstance.post("/sessions", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 2. Active Sessions ke liye sirf token chahiye
  getActiveSessions: async (token) => {
    const response = await axiosInstance.get("/sessions/active", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 3. My Recent Sessions
  getMyRecentSessions: async (token) => {
    const response = await axiosInstance.get("/sessions/my-recent", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 4. Get Session By ID
  getSessionById: async (id, token) => {
    const response = await axiosInstance.get(`/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 5. Join Session
  joinSession: async (id, token) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 6. End Session
  endSession: async (id, token) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 7. Get Stream Token (Chat ke liye)
  getStreamToken: async (token) => {
    const response = await axiosInstance.get(`/chat/token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};