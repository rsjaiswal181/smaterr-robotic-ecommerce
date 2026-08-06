import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export const useAuthBootstrap = () => {
  const { accessToken, setUser, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setReady(true);
      return;
    }
    authService
      .getMe()
      .then((user) => setUser(user))
      .catch(() => logout())
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
};

export const useAuth = () => {
  const { user, accessToken, setAuth, setUser, logout } = useAuthStore();
  return {
    user,
    isAuthenticated: !!user && !!accessToken,
    isAdmin: user?.role === 'admin',
    setAuth,
    setUser,
    logout: async () => {
      try {
        await authService.logout();
      } finally {
        logout();
      }
    },
  };
};
