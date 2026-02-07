import api from "./api";

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Project services
export const projectService = {
  getAll: async () => {
    const response = await api.get("/projects");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post("/projects", projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// Task services
export const taskService = {
  getAll: async (filters = {}) => {
    const response = await api.get("/tasks", { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// TimeLog services
export const timeLogService = {
  getAll: async (filters = {}) => {
    const response = await api.get("/timelogs", { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/timelogs/${id}`);
    return response.data;
  },

  create: async (timeLogData) => {
    const response = await api.post("/timelogs", timeLogData);
    return response.data;
  },

  update: async (id, timeLogData) => {
    const response = await api.put(`/timelogs/${id}`, timeLogData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/timelogs/${id}`);
    return response.data;
  },
};

// Report services
export const reportService = {
  getDashboard: async () => {
    const response = await api.get("/reports/dashboard");
    return response.data;
  },

  getReport: async (period) => {
    const response = await api.get(`/reports/${period}`);
    return response.data;
  },
};
