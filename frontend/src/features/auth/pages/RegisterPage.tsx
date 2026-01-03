import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/shared/ui';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/app/store/auth.store';

const registerSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Password deve essere almeno 8 caratteri'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non corrispondono',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(response.user, response.accessToken, response.refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Errore durante la registrazione. Riprova.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Registrati</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            type="text"
            {...register('name')}
            error={errors.name?.message}
          />

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

          <Input
            label="Conferma Password"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            isLoading={isLoading}
            className="w-full"
          >
            Registrati
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Hai già un account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Accedi
          </Link>
        </p>
      </Card>
    </div>
  );
}

