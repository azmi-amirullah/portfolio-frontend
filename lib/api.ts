import { authService } from './services/auth-service';

export const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Wrapper around fetch that automatically prepends the API URL
 * and includes the Authorization header if authenticated.
 */
export async function apiFetch(
  endpoint: string,
  options?: ApiFetchOptions
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options || {};
  const token = authService.getToken();

  return fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...fetchOptions?.headers,
      ...(!skipAuth && token && { Authorization: `Bearer ${token}` }),
    },
  });
}
