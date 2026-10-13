import useAuthStore from '@/lib/store/auth';

export const useAuth = () => {
  const {
    authUser,
    token,
    requestLoading,
    setAuthUser,
    setToken,
    setRequestLoading,
    login,
    logout,
  } = useAuthStore();

  return {
    user: authUser,
    token,
    isLoading: requestLoading,
    isAuthenticated: !!token && !!authUser,
    isAdmin: authUser?.role === 'ADMIN',
    isOwner: (authUser as any)?.orgRole === 'OWNER',
    organization: (authUser as any)?.organization,
    
    // Actions
    setAuthUser,
    setToken,
    setRequestLoading,
    login,
    logout,
  };
};
