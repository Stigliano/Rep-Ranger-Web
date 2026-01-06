import { Link } from 'react-router-dom';
import { useWorkoutPrograms } from '../api/queries';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export const WorkoutProgramListPage = () => {
  const { data: programs, isLoading, error } = useWorkoutPrograms();

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
        Error loading programs. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Workout Programs</h1>
        <div className="space-x-2">
            <Link to="/workout-history">
                <Button variant="secondary">History</Button>
            </Link>
            <Link to="/workout-programs/new">
                <Button>Create Program</Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs?.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">No programs yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first workout program.</p>
            <div className="mt-6">
              <Link to="/workout-programs/new">
                <Button variant="secondary">Create Program</Button>
              </Link>
            </div>
          </div>
        )}

        {programs?.map((program) => (
          <Link key={program.id} to={`/workout-programs/${program.id}`} className="block">
            <Card 
              className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
              title={program.name}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {program.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-500">
                    <span className="font-medium">{program.durationWeeks}</span>
                    <span className="ml-1">weeks</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    program.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : program.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {program.status}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
