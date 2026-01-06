import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/shared/ui';
import { authApi } from '../api/auth.api';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'La password deve essere di almeno 8 caratteri'),
    confirmPassword: z.string().min(8, 'La password deve essere di almeno 8 caratteri'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non coincidono',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token mancante. Assicurati di aver cliccato sul link nell\'email.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({
        token,
        newPassword: data.password,
      });
      setIsSuccess(true);
      // Reindirizza al login dopo 3 secondi
      setTimeout(() => navigate('/login'), 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      let errorMessage = 'Errore durante il reset della password.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage = 'Impossibile connettersi al server.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link non valido</h2>
          <p className="text-gray-600 mb-6">
            Il link per il reset della password non è valido o è mancante.
          </p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline font-medium">
            Richiedi un nuovo link
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 shadow-lg border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Nuova Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Inserisci la tua nuova password
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r">
             <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm leading-5 font-medium text-green-800">
                  Password aggiornata!
                </h3>
                <div className="mt-2 text-sm leading-5 text-green-700">
                  <p>
                    La tua password è stata modificata con successo. Verrai reindirizzato al login tra pochi secondi...
                  </p>
                </div>
                <div className="mt-4">
                  <Link to="/login" className="text-sm font-medium text-green-700 hover:text-green-600 underline">
                    Vai subito al login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r flex items-start">
                <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Nuova Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />

              <Input
                label="Conferma Password"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                isLoading={isLoading}
                className="w-full flex justify-center"
              >
                {isLoading ? 'Salvataggio in corso...' : 'Imposta Password'}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

