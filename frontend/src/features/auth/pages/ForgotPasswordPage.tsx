import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/shared/ui';
import { authApi } from '../api/auth.api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email non valida'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(data);
      setIsSuccess(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Per sicurezza, non dovremmo rivelare se l'email esiste o no,
      // ma se c'è un errore di server generico lo mostriamo.
      // Il backend attuale ritorna 200 anche se l'email non esiste (security best practice),
      // quindi qui entreremo solo per errori di rete o server crash.
      let errorMessage = 'Si è verificato un errore. Riprova più tardi.';
      
      if (err.request) {
        errorMessage = 'Impossibile connettersi al server. Verifica la connessione.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Errore del server. Riprova più tardi.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 shadow-lg border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recupero Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Inserisci la tua email per ricevere le istruzioni
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
                  Richiesta inviata
                </h3>
                <div className="mt-2 text-sm leading-5 text-green-700">
                  <p>
                    Se l'indirizzo email è associato a un account, riceverai un link per reimpostare la password.
                  </p>
                </div>
                <div className="mt-4">
                  <Link to="/login" className="text-sm font-medium text-green-700 hover:text-green-600 underline">
                    Torna al login
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
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="nome@esempio.com"
                {...register('email')}
                error={errors.email?.message}
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                isLoading={isLoading}
                className="w-full flex justify-center"
              >
                {isLoading ? 'Invio in corso...' : 'Invia Istruzioni'}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-600">
            Ricordi la password?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Torna al login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

