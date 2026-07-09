const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://4j9s67zbu6.execute-api.us-east-1.amazonaws.com/prod';

const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const apiService = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Error fetching ${endpoint}`);
    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error creating ${endpoint}`);
    return response.json();
  },

  async patch<T>(endpoint: string, id: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error updating ${endpoint}`);
    return response.json();
  },

  async delete(endpoint: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Error deleting ${endpoint}`);
  }
};
