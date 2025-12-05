import { toast } from 'react-toastify';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  jwt: string;
  user: User;
}

class AuthService {
  private tokenKey = 'cashier_jwt';
  private userKey = 'cashier_user';

  async login(identifier: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.jwt) {
        this.setSession(data.jwt, data.user);

        return true;
      } else {
        console.error('Login failed:', data);
        toast.error(data.error?.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setSession(token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();
