import React from 'react';
import { Card } from '@/shared/ui';
import { Trophy, Calendar, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  consistencyScore: number;
  workoutStreak: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  consistencyScore,
  workoutStreak,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Consistency Score</p>
          <p className="text-2xl font-bold">{consistencyScore}%</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-green-100 rounded-full">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Workout Streak</p>
          <p className="text-2xl font-bold">{workoutStreak} settimane</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-yellow-100 rounded-full">
          <Trophy className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Prossimo Obiettivo</p>
          <p className="text-sm font-semibold">Mantieni la streak!</p>
        </div>
      </Card>
    </div>
  );
};

