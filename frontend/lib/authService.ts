/**
 * Authentication API Service
 * Handles all auth-related API calls to the backend
 */
import { fetchWithAuth } from "./fetchWithAuth";
const API_BASE_URL = 'https://scriptishrxnewmark.onrender.com/v1';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  clinicId?: string;
  hospitalId?: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  clinic?: {
    id: string;
    name: string;
    npiNumber: string;
    [key: string]: any;
  };
  hospital?: {
    id: string;
    name: string;
    npiNumber: string;
    [key: string]: any;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface RegisterClinicRequest {
  eligibilityGate: {
    isUSAClinic: boolean;
    clinicType: string;
  };
  clinic: {
    name: string;
    npiNumber: string;
    taxId: string;
    stateLicenseNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    primaryPhone: string;
    workEmail: string;
    infusionChairCount: number;
    treatmentTypesOffered: string[];
  };
  admin: {
    firstName: string;
    lastName: string;
    password: string;
  };
}

export interface RegisterClinicResponse {
  clinicId: string;
  temporaryToken: string;
  nextStep: string;
  userId: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface VerifyEmailResponse {
  clinicId: string;
  status: string;
  nextStep: string;
}

export interface SignBAARequest {
  email: string;
  signatureData: string;
  adminName: string;
  adminTitle: string;
}

export interface SignBAAResponse {
  clinicId: string;
  status: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class AuthService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = API_BASE_URL;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Login failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      // If this response is for an infusion chair, store chair info and return
      if ((data as any).from === 'infusionChair') {
        try {
          localStorage.setItem('chair', JSON.stringify((data as any).data));
          localStorage.setItem('tenantType', 'infusionChair');
        } catch (e) {
          console.error('Failed to persist chair data to localStorage', e);
        }
        return data as unknown as LoginResponse;
      }
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store tenant information
      if (data.clinicId) {
        localStorage.setItem('clinicId', data.clinicId);
      }
      if (data.hospitalId) {
        localStorage.setItem('hospitalId', data.hospitalId);
      }
      
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a clinic
   */
  async registerClinic(
    request: RegisterClinicRequest
  ): Promise<RegisterClinicResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register/clinic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Registration failed: ${response.statusText}`
        );
      }
      const data = await response.json();

      // Store temporary token
      localStorage.setItem('temporaryToken', data.temporaryToken);
      localStorage.setItem('accessToken',data.accessToken)
      localStorage.setItem('clinicId', data.clinicId);

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a referring hospital
   */
  async registerHospital(
    request: any
  ): Promise<RegisterClinicResponse> {
    try {
      // Same endpoint as clinic for now, backend handles differentiation
      const response = await fetch(`${this.apiBaseUrl}/auth/register/hospital`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Registration failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Store temporary token
      localStorage.setItem('temporaryToken', data.temporaryToken);
      localStorage.setItem('accessToken',data.accessToken)
      localStorage.setItem('hospitalId', data.hospitalId);
      
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    try {
      const temporaryToken = localStorage.getItem('temporaryToken');
      
      if (!temporaryToken) {
        throw new Error('No temporary token found. Please register first.');
      }

      const response = await fetchWithAuth(`${this.apiBaseUrl}/auth/register/verify-email`, {
        method: 'POST',
     
        body: JSON.stringify(request),
      });

     

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Email verification failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Verify emails request:', data)
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sign BAA agreement
   */
  async signBAA(request: SignBAARequest): Promise<SignBAAResponse> {
    try {
      const temporaryToken = localStorage.getItem('temporaryToken');
      
      if (!temporaryToken) {
        throw new Error('No temporary token found. Please verify email first.');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/register/sign-baa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${temporaryToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `BAA signing failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Store access tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Clear temporary token
      localStorage.removeItem('temporaryToken');
      
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string): Promise<{ message: string }> {
    try {
      const temporaryToken = localStorage.getItem('temporaryToken');
      
      if (!temporaryToken) {
        throw new Error('No temporary token found. Please register first.');
      }

      const response = await fetch(
        `${this.apiBaseUrl}/auth/register/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${temporaryToken}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.message ||
            `Failed to resend verification: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        await fetch(`${this.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('temporaryToken');
      localStorage.removeItem('clinicId');
      localStorage.removeItem('hospitalId');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request password reset: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(
    resetToken: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to reset password: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch all clinics
   */
  async fetchAllClinics(): Promise<any> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('❌ No access token found in localStorage');
        return { isTokenExpired: true };
      }

      console.log('📤 Fetching clinics with token:', accessToken.substring(0, 20) + '...');
      
      const response = await fetch(`${this.apiBaseUrl}/clinics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('📥 Response status:', response.status);

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ 401 Unauthorized - Error details:', errorData);
        return { isTokenExpired: true };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error ${response.status}:`, errorData);
        throw new Error(`Failed to fetch clinics: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const clinics = await response.json();
      console.log('✅ Clinics fetched successfully:', clinics);
      return clinics;
    } catch (error) {
      console.error('💥 Error fetching clinics:', error);
      console.error('API Base URL:', this.apiBaseUrl);
      console.error('Error details:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: 'An unexpected error occurred',
    };
  }

  /**
   * Get auth headers
   */
  getAuthHeaders(): Record<string, string> {
    const accessToken = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store new access token
      localStorage.setItem('accessToken', data.accessToken);
      
      // Update refresh token if provided
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear tokens if refresh fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
  }
}

export const authService = new AuthService();
