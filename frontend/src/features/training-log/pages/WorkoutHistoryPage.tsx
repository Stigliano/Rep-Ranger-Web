import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui';
import { useWorkoutLogs } from '../api/queries';

export const WorkoutHistoryPage = () => {
  const { data: logs, isLoading, error } = useWorkoutLogs();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-4 text-center">Caricamento storico...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Si è verificato un errore nel caricamento dei dati.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Storico Allenamenti</h1>
        <button 
            className="text-sm text-blue-600 font-medium"
            onClick={() => navigate('/workout-programs')}
        >
            Nuovo Allenamento
        </button>
      </div>
      
      <div className="space-y-4">
        {logs?.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg capitalize">
                  {new Date(log.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h3>
                <p className="text-sm text-gray-500">
                  {log.exercises.length} Esercizi • {log.durationMinutes ? `${log.durationMinutes} min` : 'N/D'}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">
                  {log.totalVolume ? `${log.totalVolume.toLocaleString()} Kg` : '-'}
                </div>
                <div className="text-xs text-gray-500">Volume</div>
              </div>
            </div>
            
            {log.notes && (
              <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                "{log.notes}"
              </p>
            )}
            
            {/* Short preview of exercises */}
            <div className="mt-3 flex flex-wrap gap-1">
                {log.exercises.slice(0, 3).map(ex => (
                    <span key={ex.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {ex.exercise.name}
                    </span>
                ))}
                {log.exercises.length > 3 && (
                    <span className="text-xs text-gray-400 px-2 py-1">
                        +{log.exercises.length - 3} altri
                    </span>
                )}
            </div>
          </Card>
        ))}

        {logs?.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
            <p className="mb-2">Non hai ancora registrato nessun allenamento.</p>
            <button 
                className="text-blue-600 font-medium underline"
                onClick={() => navigate('/workout-programs')}
            >
                Inizia il tuo primo allenamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

