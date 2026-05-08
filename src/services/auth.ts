const API_BASE_URL = 'https://4j9s67zbu6.execute-api.us-east-1.amazonaws.com/prod';

export const authService = {
  login: async (email: string, password: string): Promise<{token: string, user: any}> => {
    const response = await fetch(`${API_BASE_URL}/bondoo/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Credenciales inválidas');
    }

    const data = await response.json();
    localStorage.setItem('adminToken', data.token);
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('adminToken');
  }
};
