import useAuthStore from '@/lib/store/auth';

/**
 * Authentication initialization utility
 * Handles initializing auth state from server cookies
 */

/**
 * Initialize authentication state
 * This should be called on app startup to sync Zustand store with server state
 */
export const initializeAuth = async (): Promise<void> => {
  const { initialize } = useAuthStore.getState();
  await initialize();
};

/**
 * Check if auth is initialized
 */
export const isAuthInitialized = (): boolean => {
  const { isInitialized } = useAuthStore.getState();
  return isInitialized;
};

/**
 * Get current auth state
 */
export const getAuthState = () => {
  const { authUser, token, isInitialized } = useAuthStore.getState();
  return {
    user: authUser,
    token,
    isAuthenticated: !!authUser && !!token,
    isInitialized,
  };
};

/**
 * Wait for auth initialization
 * Useful for components that need to wait for auth state
 */
export const waitForAuthInit = (): Promise<void> => {
  return new Promise((resolve) => {
    const { isInitialized } = useAuthStore.getState();
    
    if (isInitialized) {
      resolve();
      return;
    }

    // Subscribe to store changes
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isInitialized) {
        unsubscribe();
        resolve();
      }
    });
  });
};


