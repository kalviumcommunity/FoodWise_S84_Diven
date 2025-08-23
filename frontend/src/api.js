// Chat endpoint
export const sendChat = (message) =>
  API.post("/api/chat", { message });

// Compare foods endpoint
export const compareFoods = (food1, food2) =>
  API.post("/api/compare", { food1, food2 });

// Nutrition analysis endpoint
export const analyzeFood = (food) =>
  API.post("/api/analyze", { food });

// Upload CSV endpoint
export const uploadCSV = (formData) =>
  API.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Health check
export const checkHealth = () => API.get("/api/health");
