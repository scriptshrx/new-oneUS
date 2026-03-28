/**
 * Authentication API Service
 * Handles all auth-related API calls to the backend
 */

const API_BASE_URL = 'https://scriptishrxnewmark.onrender.com/v1';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  clinicId: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
          errorData.message || `Login failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('clinicId', data.clinicId);
      
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
          errorData.message || `Registration failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Store temporary token
      localStorage.setItem('temporaryToken', data.temporaryToken);
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
          errorData.message || `Registration failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Store temporary token
      localStorage.setItem('temporaryToken', data.temporaryToken);
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

      const response = await fetch(`${this.apiBaseUrl}/auth/register/verify-email`, {
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
          errorData.message || `Email verification failed: ${response.statusText}`
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
          errorData.message || `BAA signing failed: ${response.statusText}`
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
          errorData.message || `Failed to reset password: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
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
}

export const authService = new AuthService();
