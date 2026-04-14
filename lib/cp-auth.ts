// Synap API (Better Auth) — session cookies from api.synap.live (or env).

import { getSynapApiUrl } from './auth-config';

const CP_API_URL = getSynapApiUrl();
const IS_DEV = process.env.NODE_ENV === 'development';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
}

// Mock dev user for development mode
const devUser: User = {
  id: 'dev-user',
  email: 'dev@synap.local',
  name: 'Developer',
  role: 'admin',
};

/**
 * Check if user is authenticated by querying CP session
 * In development mode, automatically returns a mock admin user
 */
export async function getSession(): Promise<Session | null> {
  // In development mode, auto-authenticate as admin
  if (IS_DEV) {
    return {
      user: devUser,
      session: {
        id: 'dev-session',
        userId: 'dev-user',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  try {
    const res = await fetch(`${CP_API_URL}/auth/get-session`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    if (!data?.user) {
      return null;
    }

    return data as Session;
  } catch (error) {
    // During build time or if CP API is unavailable, return null (not authenticated)
    // This allows static generation to complete
    return null;
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Redirect to CP login page with return URL
 */
export function redirectToLogin(returnUrl?: string) {
  const currentUrl = returnUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedReturnUrl = encodeURIComponent(currentUrl);
  const loginUrl = `${getSynapApiUrl()}/auth/sign-in?callbackUrl=${encodedReturnUrl}`;
  
  if (typeof window !== 'undefined') {
    window.location.href = loginUrl;
  }
}

/**
 * Logout user by calling CP sign-out endpoint
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${CP_API_URL}/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout failed:', error);
  }
  
  // Redirect to home page after logout
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user?: User | null): boolean {
  return user?.role === 'admin';
}
