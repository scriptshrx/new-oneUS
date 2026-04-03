import { authService } from './authService';

/**
 * Fetch wrapper that automatically refreshes token on 401
 * Handles expired access tokens by refreshing and retrying the request
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth header if not already present
  const accessToken = localStorage.getItem('accessToken');
  console.log('The retrieved access token for this fetch:',accessToken)
  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, { ...options, headers });

  // If 401, try to refresh token and retry
  if (response.status === 401) {
    console.log('Token expired (401), attempting refresh...');
    const refreshSuccess = await authService.refreshAccessToken();

    if (refreshSuccess) {
      // Get new token and retry
      const newAccessToken = localStorage.getItem('accessToken');
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      console.log('Token refreshed, retrying request...');
      response = await fetch(url, { ...options, headers });
    } else {
      // Refresh failed, redirect to login
      console.error('Token refresh failed, redirecting to login');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('hospital');
        localStorage.removeItem('hospitalAdmin');
        window.location.href = '/login';
      }
    }
  }

  return response;
}
