import { apiClient } from '@/shared/lib/api/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * API client per autenticazione
 */
export const authApi = {
  /**
   * Login utente
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Registrazione nuovo utente
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (
    data: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      data,
    );
    return response.data;
  },

  /**
   * Get profilo utente corrente
   */
  getMe: async (): Promise<any> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

