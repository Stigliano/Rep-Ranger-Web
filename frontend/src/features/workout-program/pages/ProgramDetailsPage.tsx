import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workoutProgramApi, WorkoutSession } from '../api/workout-program.api';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export const ProgramDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: program, isLoading, error } = useQuery({
    queryKey: ['workout-program', id],
    queryFn: () => workoutProgramApi.findOne(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        Error loading program details.
      </div>
    );
  }

  if (!program) return <div>Program not found</div>;

  const handleStartSession = (session: WorkoutSession) => {
    navigate('/workout/active', { state: { session } });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
          <p className="text-gray-500 mt-1">{program.description}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/workout-programs')}>
            Back to List
          </Button>
          <Button variant="primary" onClick={() => navigate(`/workout-programs/${program.id}/edit`)}>
            Modifica Programma
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {program.microcycles.map((microcycle) => (
          <div key={microcycle.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              {microcycle.name}
              <span className="text-sm font-normal text-gray-500 ml-2">({microcycle.durationWeeks} weeks)</span>
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {microcycle.sessions.map((session) => (
                <Card key={session.id} title={session.name} className="bg-white hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Day {session.dayOfWeek}</span>
                        <span>{session.estimatedDurationMinutes ? `${session.estimatedDurationMinutes} min` : ''}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {session.exercises?.length || 0} Exercises
                      </p>
                      <div className="text-xs text-gray-500 space-y-1 mt-2">
                        {session.exercises?.slice(0, 3).map((ex, idx) => (
                            <div key={idx} className="truncate">• {ex.exerciseName || 'Exercise'}</div>
                        ))}
                        {(session.exercises?.length || 0) > 3 && <div className="italic text-gray-400">...and more</div>}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-2" 
                      variant="primary"
                      onClick={() => handleStartSession(session)}
                    >
                      Start Session
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

