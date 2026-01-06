import React from 'react';
import { Link } from 'react-router-dom';
import { useProgressStats } from '../api/queries';
import { VolumeChart } from '../components/VolumeChart';
import { StatsCards } from '../components/StatsCards';
import { Card, Button, Skeleton } from '@/shared/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ProgressDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error, refetch } = useProgressStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Si è verificato un errore
        </h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Non siamo riusciti a caricare i dati dei tuoi progressi. 
          Verifica la tua connessione o riprova tra poco.
        </p>
        <Button onClick={() => refetch()} variant="secondary" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Riprova
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold self-start md:self-center">Progressi</h1>
      </div>

      <StatsCards
        consistencyScore={stats.consistencyScore}
        workoutStreak={stats.workoutStreak}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumeChart data={stats.weeklyVolume} />

        <Card className="p-4 h-96">
            <h3 className="text-lg font-semibold mb-4">Record Recenti</h3>
            {stats.recentPRs.length > 0 ? (
                <ul className="space-y-2 overflow-y-auto max-h-[300px] pr-2">
                    {stats.recentPRs.map((pr, idx) => (
                        <li key={idx} className="p-3 bg-gray-50 rounded border border-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                            <span className="text-sm">{pr}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <TrophyPlaceholder className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">Nessun PR recente</p>
                    <p className="text-sm text-center mt-1">
                        Continua ad allenarti con costanza<br/>per sbloccare nuovi record!
                    </p>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
};

function DashboardSkeleton() {
  return (
    <div className="container mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm bg-white">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 w-full rounded-xl border bg-white p-4">
             <Skeleton className="h-6 w-48 mb-4" />
             <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="h-96 w-full rounded-xl border bg-white p-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

function TrophyPlaceholder(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
