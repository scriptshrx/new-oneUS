'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/authService';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/chair-dashboard', '/'];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // Wait until pathname is available
      if (!pathname) return;

      const accessToken = localStorage.getItem('accessToken');
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

      // Allow infusion chairs to access /chair-dashboard without accessToken
      const isChairDashboard = pathname?.startsWith('/chair-dashboard');
      const tenantType = localStorage.getItem('tenantType');
      const chairCached = localStorage.getItem('chair');

      // Diagnostic logs for debugging redirect
      console.log('[ProtectedLayout] pathname=', pathname, 'isPublicRoute=', isPublicRoute, 'isChairDashboard=', isChairDashboard, 'tenantType=', tenantType, 'chairCached=', !!chairCached, 'accessToken=', !!accessToken);

      if (isChairDashboard && tenantType === 'infusionChair' && chairCached) {
        return; // skip token checks for infusion chairs
      }

      // Skip protection on public routes
      if (isPublicRoute) {
        return;
      }

      // No token on protected route = redirect to login
      if (!accessToken) {
        console.log('No access token found, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        // Decode token and check expiration
        const decoded = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAtMs = decoded.exp * 1000;
        const nowMs = Date.now();
        const expiresInSecs = (expiresAtMs - nowMs) / 1000;

        console.log(`Token expires in ${(expiresInSecs / 60).toFixed(2)} minutes`);

        // If less than 5 minutes remaining, refresh now
        if (expiresInSecs < 300) {
          console.log('Token expiring soon (< 5 min), refreshing now...');
          const success = await authService.refreshAccessToken();
          if (!success) {
            console.error('Token refresh failed');
            router.push('/login');
          }
        }

        // If already expired, refresh immediately
        if (expiresInSecs <= 0) {
          console.log('Token expired, refreshing...');
          const success = await authService.refreshAccessToken();
          if (!success) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error checking token:', error);
        // Invalid token format = redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      }
    };

    // Check on mount
    checkAndRefreshToken();

    // Check every 30 seconds
    const interval = setInterval(checkAndRefreshToken, 30000);

    return () => clearInterval(interval);
  }, [router, pathname]);

  return children;
}
