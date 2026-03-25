import useAuthStore from '@/lib/store/auth';

/**
 * Get the current auth token from Zustand store
 * This can be used in non-React contexts where hooks can't be used
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const state = useAuthStore.getState();
    return state.token;
  } catch (error) {
    console.warn('Failed to get token from Zustand store:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Get the current user from Zustand store
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const state = useAuthStore.getState();
    return state.authUser;
  } catch (error) {
    console.warn('Failed to get user from Zustand store:', error);
    return null;
  }
};
