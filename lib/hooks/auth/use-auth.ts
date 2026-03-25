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
    isAdmin: authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'SONA_ADMIN',
    isOwner: authUser?.orgRole === 'OWNER',
    organization: authUser?.organization,
    
    // Actions
    setAuthUser,
    setToken,
    setRequestLoading,
    login,
    logout,
  };
};
