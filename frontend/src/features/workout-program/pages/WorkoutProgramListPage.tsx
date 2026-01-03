import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/shared/ui';
import { workoutProgramApi, WorkoutProgram } from '../api/workout-program.api';
import { useAuthStore } from '@/app/store/auth.store';

export function WorkoutProgramListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const { data: programs, isLoading, error } = useQuery({
    queryKey: ['workout-programs'],
    queryFn: workoutProgramApi.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: workoutProgramApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-programs'] });
    },
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Errore nel caricamento dei programmi</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">I Miei Programmi</h1>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/workout-programs/new')}
          >
            Nuovo Programma
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {programs && programs.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">
            Nessun programma ancora. Crea il tuo primo programma!
          </p>
          <div className="text-center">
            <Button
              variant="primary"
              onClick={() => navigate('/workout-programs/new')}
            >
              Crea Programma
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs?.map((program) => (
            <WorkoutProgramCard
              key={program.id}
              program={program}
              onDelete={() => deleteMutation.mutate(program.id)}
              onView={() => navigate(`/workout-programs/${program.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkoutProgramCardProps {
  program: WorkoutProgram;
  onDelete: () => void;
  onView: () => void;
}

function WorkoutProgramCard({
  program,
  onDelete,
  onView,
}: WorkoutProgramCardProps) {
  return (
    <Card>
      <h3 className="text-xl font-semibold mb-2">{program.name}</h3>
      {program.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{program.description}</p>
      )}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          {program.durationWeeks} settimane
        </span>
        <span
          className={`px-2 py-1 rounded text-xs ${
            program.status === 'active'
              ? 'bg-green-100 text-green-800'
              : program.status === 'draft'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {program.status}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="small" onClick={onView}>
          Visualizza
        </Button>
        <Button variant="danger" size="small" onClick={onDelete}>
          Elimina
        </Button>
      </div>
    </Card>
  );
}

