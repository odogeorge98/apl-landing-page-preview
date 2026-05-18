import { useRouter } from 'next/navigation';
import { showSuccess, showError } from '@/lib/utils/error-handler';
import useAuthStore from '@/lib/store/auth';

export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      logout();
      
      router.replace('/');
      
      showSuccess('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      showSuccess('Logged out successfully');
    }
  };

  return { logout: handleLogout };
};
