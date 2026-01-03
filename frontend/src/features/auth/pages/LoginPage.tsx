import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/shared/ui';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/app/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password obbligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);
      setAuth(response.user, response.accessToken, response.refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Errore durante il login. Riprova.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Accedi</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            isLoading={isLoading}
            className="w-full"
          >
            Accedi
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Non hai un account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Registrati
          </Link>
        </p>
      </Card>
    </div>
  );
}

