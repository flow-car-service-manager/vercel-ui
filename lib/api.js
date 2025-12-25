// API configuration utility
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Helper function to make API calls
export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Helper function to handle paginated responses
export function handlePaginatedResponse(response) {
  // Check if response has pagination structure
  if (response && response.data !== undefined && response.pagination !== undefined) {
    return response.data;
  }
  // If it's already an array, return it
  if (Array.isArray(response)) {
    return response;
  }
  // Otherwise, wrap in array
  return [response];
}