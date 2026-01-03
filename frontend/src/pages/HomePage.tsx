import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';
import { Button } from '@/shared/ui';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return null; // ProtectedRoute gestisce il redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Benvenuto, {user?.name}!</h1>
      <p className="text-gray-600 mb-6">
        Gestisci i tuoi programmi di allenamento
      </p>
      <Button variant="primary" onClick={() => navigate('/workout-programs')}>
        Vai ai Programmi
      </Button>
    </div>
  );
}

