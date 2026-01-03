import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente per proteggere route che richiedono autenticazione
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

