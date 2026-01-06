import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { useState } from 'react';
import { EditProfileForm } from '../components/EditProfileForm';

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          Errore nel caricamento del profilo.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profilo Utente</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Modifica Profilo
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="p-6">
          <EditProfileForm
            user={user}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Informazioni Personali</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <span className="block text-sm text-gray-500">Nome</span>
                <span className="text-lg font-medium">{user.profile?.name || user.name}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Email</span>
                <span className="text-lg">{user.email}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Età</span>
                <span className="text-lg">{user.profile?.age ? `${user.profile.age} anni` : '-'}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Genere</span>
                <span className="text-lg capitalize">{user.profile?.gender || '-'}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Altezza</span>
                <span className="text-lg">{user.profile?.heightCm ? `${user.profile.heightCm} cm` : '-'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Profilo Atletico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <span className="block text-sm text-gray-500">Livello</span>
                <span className="text-lg capitalize">{user.profile?.athleteLevel || '-'}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Volume Settimanale</span>
                <span className="text-lg">{user.profile?.weeklyVolumeHours ? `${user.profile.weeklyVolumeHours} ore` : '-'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Abitudini & Preferenze</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {user.profile?.mealsPerDay && (
                <div>
                    <span className="block text-sm text-gray-500">Pasti al giorno</span>
                    <span className="text-lg">{user.profile.mealsPerDay}</span>
                </div>
              )}
              {user.profile?.mealTiming && (
                <div>
                    <span className="block text-sm text-gray-500">Timing pasti</span>
                    <span className="text-lg">{user.profile.mealTiming}</span>
                </div>
              )}
               {user.profile?.macroTracking && (
                <div>
                    <span className="block text-sm text-gray-500">Tracciamento Macro</span>
                    <span className="text-lg">{user.profile.macroTracking}</span>
                </div>
              )}
               {user.profile?.supplements && (
                <div>
                    <span className="block text-sm text-gray-500">Integratori</span>
                    <span className="text-lg">{user.profile.supplements}</span>
                </div>
              )}
            </div>
            {!user.profile?.mealsPerDay && !user.profile?.mealTiming && !user.profile?.macroTracking && !user.profile?.supplements && (
                 <p className="text-gray-500 italic">Nessuna informazione aggiuntiva inserita.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

