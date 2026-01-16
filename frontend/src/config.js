// Environment configuration helper
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  // Add other config variables as needed
};

// Export individual values for convenience
export const { API_BASE_URL, WS_URL } = config;