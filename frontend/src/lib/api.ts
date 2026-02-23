const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ========== Goals API ==========
export const goalsApi = {
  list: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return fetchApi<any[]>(`/api/goals${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => fetchApi<any>(`/api/goals/${id}`),

  create: (data: any) =>
    fetchApi<any>("/api/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<any>(`/api/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string, hard = false) =>
    fetchApi<any>(`/api/goals/${id}?hard=${hard}`, { method: "DELETE" }),

  reorder: (items: { id: string; order: number }[]) =>
    fetchApi<any>("/api/goals/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};

// ========== Records API ==========
export const recordsApi = {
  listBySeries: (seriesId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return fetchApi<any[]>(
      `/api/series/${seriesId}/records${qs ? `?${qs}` : ""}`
    );
  },

  listByGoal: (goalId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return fetchApi<any[]>(
      `/api/goals/${goalId}/records${qs ? `?${qs}` : ""}`
    );
  },

  get: (id: string) => fetchApi<any>(`/api/records/${id}`),

  create: (seriesId: string, data: any) =>
    fetchApi<any>(`/api/series/${seriesId}/records`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<any>(`/api/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<any>(`/api/records/${id}`, { method: "DELETE" }),

  search: (q: string, goalId?: string) => {
    const query = new URLSearchParams({ q });
    if (goalId) query.set("goal_id", goalId);
    return fetchApi<any[]>(`/api/records/search?${query}`);
  },
};

// ========== Series API ==========
export const seriesApi = {
  list: (goalId: string) =>
    fetchApi<any[]>(`/api/goals/${goalId}/series`),

  get: (seriesId: string) =>
    fetchApi<any>(`/api/series/${seriesId}`),

  create: (goalId: string, data: any) =>
    fetchApi<any>(`/api/goals/${goalId}/series`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (seriesId: string, data: any) =>
    fetchApi<any>(`/api/series/${seriesId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (seriesId: string) =>
    fetchApi<any>(`/api/series/${seriesId}`, { method: "DELETE" }),

  reorder: (items: { id: string; order: number }[]) =>
    fetchApi<any>("/api/series/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
};

// ========== Stats API ==========
export const statsApi = {
  overview: () => fetchApi<any>("/api/stats/overview"),

  heatmap: (goalId?: string, seriesId?: string) => {
    const query = new URLSearchParams();
    if (goalId) query.set("goal_id", goalId);
    if (seriesId) query.set("series_id", seriesId);
    const qs = query.toString();
    return fetchApi<any[]>(`/api/stats/heatmap${qs ? `?${qs}` : ""}`);
  },

  weekly: () => fetchApi<any[]>("/api/stats/weekly"),
};

// ========== Tags API ==========
export const tagsApi = {
  list: () => fetchApi<any[]>("/api/tags"),

  create: (data: { name: string; color?: string }) =>
    fetchApi<any>("/api/tags", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<any>(`/api/tags/${id}`, { method: "DELETE" }),
};

// ========== Upload API ==========
export const uploadApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};
