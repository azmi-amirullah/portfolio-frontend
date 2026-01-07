import { toast } from 'react-toastify';
import { createClient } from '../supabase/client';

export interface User {
  id: string;
  email: string;
  username?: string;
}

class AuthService {
  private supabase = createClient();

  async login(identifier: string, password: string): Promise<boolean> {
    try {
      // Convert username to email (only for @guest.local domain)
      const email = identifier.includes('@')
        ? identifier
        : `${identifier}@guest.local`;

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login failed:', error);
        toast.error(error.message || 'Login failed');
        return false;
      }

      if (data.user) {
        return true;
      }

      toast.error('Login failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  }

  async getUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || user.email?.split('@')[0],
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return !!session;
  }

  getSupabaseClient() {
    return this.supabase;
  }
}

export const authService = new AuthService();
