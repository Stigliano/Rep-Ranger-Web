import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente per proteggere route che richiedono autenticazione
 * Reindirizza al login salvando la pagina di provenienza per il redirect successivo
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
