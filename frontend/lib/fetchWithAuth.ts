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
      // Refresh failed. If this request is being made for an infusion chair (no tokens expected),
      // do not force a redirect to login here — allow the caller to handle the 401.
      const tenantType = typeof window !== 'undefined' ? localStorage.getItem('tenantType') : null;
      const chairCached = typeof window !== 'undefined' ? localStorage.getItem('chair') : null;
      console.error('Token refresh failed');
      if (tenantType === 'infusionChair' && chairCached) {
        console.log('Infusion chair request: skipping forced redirect on 401');
        return response;
      }

      // Non-chair flows: clear storage and redirect to login
      console.error('Redirecting to login due to failed refresh');
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
