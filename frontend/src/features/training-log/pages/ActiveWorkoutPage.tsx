import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui';
import { useCreateWorkoutLog } from '../api/queries';
import { CreateWorkoutLogDto } from '../api/training-log.api';
import { WorkoutSession } from '@/features/workout-program/api/workout-program.api';
import { ExerciseCard } from '../components/ExerciseCard';
import { RecoveryTimer } from '../components/RecoveryTimer';

// Extended type for form handling
type WorkoutLogForm = CreateWorkoutLogDto;

const LOCAL_STORAGE_KEY = 'active_workout_state';

export const ActiveWorkoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const createLog = useCreateWorkoutLog();

  const [timerStart, setTimerStart] = useState<number | null>(null);

  // Initialize session data from location or localStorage
  const [sessionData] = useState<WorkoutSession | null>(() => {
    if (location.state?.session) {
      return location.state.session;
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.session;
      } catch (e) {
        console.error('Failed to parse saved session', e);
        return null;
      }
    }
    return null;
  });

  const { control, handleSubmit, register, watch, formState: { errors } } = useForm<WorkoutLogForm>({
    defaultValues: () => {
      // 1. New Session from Navigation
      if (location.state?.session) {
        const s = location.state.session as WorkoutSession;
        return {
          sessionId: s.id,
          date: new Date().toISOString(),
          exercises: s.exercises?.map((e, idx) => ({
            exerciseId: e.exerciseId,
            orderIndex: idx,
            sets: Array.from({ length: e.sets }).map((_, sIdx) => ({
              setNumber: sIdx + 1,
              weight: e.weightKg,
              reps: e.reps,
              rpe: e.rpe || undefined,
              completed: false,
            })),
          })) || [],
        };
      }
      
      // 2. Resume from LocalStorage
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.form;
        } catch (e) {
          console.error('Failed to parse saved form', e);
        }
      }
      
      // Fallback (should be handled by redirect)
      return {
        date: new Date().toISOString(),
        exercises: [],
      };
    },
  });

  // Watch form changes and save to LocalStorage
  useEffect(() => {
    const subscription = watch((value) => {
      if (sessionData) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          session: sessionData,
          form: value,
          updatedAt: new Date().toISOString()
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, sessionData]);

  useEffect(() => {
    // Debug logging
    console.log('ActiveWorkoutPage mounted');
    console.log('Location state:', location.state);
    console.log('Local storage:', localStorage.getItem(LOCAL_STORAGE_KEY));
    console.log('Session data:', sessionData);

    if (!sessionData) {
      // Don't auto-navigate away immediately, show error UI first
      // navigate('/workout-programs');
    }
  }, [sessionData, navigate, location.state]);

  const onSubmit = (data: WorkoutLogForm) => {
    createLog.mutate(data, {
      onSuccess: () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        navigate('/workout-history'); // Navigate to history after completion
      },
    });
  };

  const handleCancel = () => {
    if (confirm('Sei sicuro di voler annullare l\'allenamento? I progressi andranno persi.')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        navigate(-1);
    }
  };

  const handleSetComplete = () => {
    setTimerStart(Date.now());
  };

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Dati Sessione Mancanti</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Non è stato possibile caricare i dati dell'allenamento. 
          Assicurati di aver selezionato una sessione dalla lista programmi.
        </p>
        <div className="space-y-2">
            <p className="text-xs text-gray-400 font-mono bg-gray-100 p-2 rounded">
                Debug info: {JSON.stringify({ hasLocationState: !!location.state, hasStored: !!localStorage.getItem(LOCAL_STORAGE_KEY) })}
            </p>
            <Button onClick={() => navigate('/workout-programs')} variant="primary">
            Torna ai Programmi
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 px-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{sessionData.name}</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
      </div>

      <RecoveryTimer startTime={timerStart} onClose={() => setTimerStart(null)} />

      <form onSubmit={handleSubmit(onSubmit)}>
        {sessionData.exercises?.map((e, idx) => (
          <ExerciseCard
            key={idx}
            control={control}
            exerciseIndex={idx}
            exerciseName={e.exerciseName || 'Esercizio senza nome'}
            onSetCompleted={handleSetComplete}
            errors={errors}
          />
        ))}

        <div className="mt-8 mb-4">
           <label className="block text-sm font-medium text-gray-700 mb-2">Note Sessione</label>
           <textarea
             {...register('notes')}
             className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
             rows={3}
             placeholder="Come è andata?"
           />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
            <div className="max-w-md mx-auto flex gap-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={handleCancel}>
                    Annulla
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={createLog.isPending}>
                    Termina
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
};

