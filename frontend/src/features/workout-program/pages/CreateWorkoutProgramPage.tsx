import { AxiosError } from 'axios';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateWorkoutProgram } from '../api/queries';
import { CreateWorkoutProgramDto, CreateWorkoutExerciseDto } from '../api/workout-program.api';
import { createWorkoutProgramSchema } from '../api/schemas';
import { WorkoutProgramForm } from '../components/WorkoutProgramForm';

export const CreateWorkoutProgramPage = () => {
  const navigate = useNavigate();
  const createProgram = useCreateWorkoutProgram();

  const methods = useForm<CreateWorkoutProgramDto>({
    resolver: zodResolver(createWorkoutProgramSchema),
    defaultValues: {
      name: '',
      description: '',
      durationWeeks: 4,
      microcycles: [
        {
          name: 'Microciclo 1',
          durationWeeks: 4,
          orderIndex: 0,
          sessions: [],
        },
      ],
    },
  });

  const onSubmit = (data: CreateWorkoutProgramDto) => {
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
            const { uiName, ...rest } = e as CreateWorkoutExerciseDto & { uiName?: string };
            return {
              ...rest,
              orderIndex: eIdx,
            };
          }),
        })),
      })),
    };

    createProgram.mutate(formattedData, {
      onSuccess: () => {
        navigate('/workout-programs');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Programma</h1>
        <p className="text-gray-600 mt-2">Crea un nuovo programma di allenamento personalizzato.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <WorkoutProgramForm 
            onCancel={() => navigate('/workout-programs')}
            isSubmitting={createProgram.isPending}
            submitLabel="Crea Programma"
          >
            {createProgram.error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
                Errore durante il salvataggio: {(createProgram.error as AxiosError<{ message: string }>)?.response?.data?.message || 'Errore sconosciuto'}
              </div>
            )}
          </WorkoutProgramForm>
        </form>
      </FormProvider>
    </div>
  );
};
