import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const RequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export const RequireAdmin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

export const RedirectIfAuthed = ({ to = '/' }: { to?: string }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={to} replace />;
  return <Outlet />;
};
