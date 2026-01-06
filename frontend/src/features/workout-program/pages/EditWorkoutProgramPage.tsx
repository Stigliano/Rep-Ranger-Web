import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useWorkoutProgram, useUpdateWorkoutProgram } from '../api/queries';
import { createWorkoutProgramSchema, CreateWorkoutProgramSchema } from '../api/schemas';
import { WorkoutProgramForm } from '../components/WorkoutProgramForm';
import { WorkoutProgram } from '../api/workout-program.api';

// Helper to map API response to Form values
const mapProgramToForm = (program: WorkoutProgram): CreateWorkoutProgramSchema => ({
  id: program.id,
  name: program.name,
  description: program.description || '',
  durationWeeks: program.durationWeeks,
  microcycles: program.microcycles.map(m => ({
    id: m.id,
    name: m.name,
    durationWeeks: m.durationWeeks,
    orderIndex: m.orderIndex,
    objectives: m.objectives || '',
    notes: m.notes || '',
    sessions: m.sessions.map(s => ({
      id: s.id,
      name: s.name,
      dayOfWeek: s.dayOfWeek,
      orderIndex: s.orderIndex,
      estimatedDurationMinutes: s.estimatedDurationMinutes || undefined,
      notes: s.notes || '',
      exercises: s.exercises.map(e => ({
        id: e.id,
        exerciseId: e.exerciseId,
        uiName: e.exerciseName, // Pass name for UI display
        sets: e.sets,
        reps: e.reps,
        weightKg: e.weightKg,
        rpe: e.rpe || undefined,
        notes: e.notes || '',
        orderIndex: e.orderIndex,
      })).sort((a, b) => a.orderIndex - b.orderIndex)
    })).sort((a, b) => a.orderIndex - b.orderIndex)
  })).sort((a, b) => a.orderIndex - b.orderIndex)
});

export const EditWorkoutProgramPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: program, isLoading: isLoadingProgram, error: loadError } = useWorkoutProgram(id!);
  const updateProgram = useUpdateWorkoutProgram();

  const methods = useForm<CreateWorkoutProgramSchema>({
    resolver: zodResolver(createWorkoutProgramSchema),
    defaultValues: {
      name: '',
      description: '',
      durationWeeks: 4,
      microcycles: [],
    },
  });

  // Load data into form when available
  useEffect(() => {
    if (program) {
      methods.reset(mapProgramToForm(program));
    }
  }, [program, methods]);

  const onSubmit = (data: CreateWorkoutProgramSchema) => {
    // Ensure order indices are correct and clean data
    const formattedData = {
      ...data,
      microcycles: data.microcycles.map((m, mIdx) => ({
        ...m,
        orderIndex: mIdx,
        sessions: m.sessions.map((s, sIdx) => ({
          ...s,
          orderIndex: sIdx,
          exercises: s.exercises.map((e, eIdx) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { uiName, ...rest } = e;
            return {
              ...rest,
              orderIndex: eIdx,
            };
          }),
        })),
      })),
    };

    updateProgram.mutate(
      { id: id!, data: formattedData }, 
      {
        onSuccess: () => {
          navigate('/workout-programs');
        },
      }
    );
  };

  if (isLoadingProgram) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (loadError || !program) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          Programma non trovato o errore nel caricamento.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifica Programma</h1>
        <p className="text-gray-600 mt-2">Modifica il programma di allenamento "{program.name}".</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <WorkoutProgramForm 
            onCancel={() => navigate(`/workout-programs/${id}`)}
            isSubmitting={updateProgram.isPending}
            submitLabel="Salva Modifiche"
          >
            {updateProgram.error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
                Errore durante il salvataggio: {(updateProgram.error as AxiosError<{ message: string }>)?.response?.data?.message || 'Errore sconosciuto'}
              </div>
            )}
          </WorkoutProgramForm>
        </form>
      </FormProvider>
    </div>
  );
};

