import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileSchema } from '../api/schemas';
import { UserData, profileApi } from '../api/profile.api';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface EditProfileFormProps {
  user: UserData;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditProfileForm = ({ user, onCancel, onSuccess }: EditProfileFormProps) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.profile?.name || user.name || '',
      age: user.profile?.age || undefined,
      gender: user.profile?.gender || undefined,
      heightCm: user.profile?.heightCm || undefined,
      athleteLevel: user.profile?.athleteLevel || undefined,
      weeklyVolumeHours: user.profile?.weeklyVolumeHours || undefined,
      mealsPerDay: user.profile?.mealsPerDay || '',
      mealTiming: user.profile?.mealTiming || '',
      macroTracking: user.profile?.macroTracking || '',
      supplements: user.profile?.supplements || '',
      trainingLog: user.profile?.trainingLog || '',
      heartRateMonitoring: user.profile?.heartRateMonitoring || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      onSuccess();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del profilo');
    },
  });

  const onSubmit = (data: UpdateProfileSchema) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateProfileMutation.mutate(data as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Età"
          type="number"
          {...register('age', { valueAsNumber: true })}
          error={errors.age?.message}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Genere</label>
          <select
            {...register('gender')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Seleziona...</option>
            <option value="male">Maschio</option>
            <option value="female">Femmina</option>
            <option value="other">Altro</option>
          </select>
          {errors.gender?.message && (
            <p className="text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <Input
          label="Altezza (cm)"
          type="number"
          {...register('heightCm', { valueAsNumber: true })}
          error={errors.heightCm?.message}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Livello Atleta</label>
          <select
            {...register('athleteLevel')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Seleziona...</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzato</option>
            <option value="competitive">Competitivo</option>
          </select>
          {errors.athleteLevel?.message && (
            <p className="text-sm text-red-600">{errors.athleteLevel.message}</p>
          )}
        </div>

        <Input
          label="Ore allenamento settimanali"
          type="number"
          step="0.5"
          {...register('weeklyVolumeHours', { valueAsNumber: true })}
          error={errors.weeklyVolumeHours?.message}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Abitudini & Preferenze</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Pasti al giorno" {...register('mealsPerDay')} />
          <Input label="Timing pasti" {...register('mealTiming')} />
          <Input label="Tracciamento macro" {...register('macroTracking')} />
          <Input label="Integratori" {...register('supplements')} />
          <Input label="Log allenamento" {...register('trainingLog')} />
          <Input label="Monitoraggio FC" {...register('heartRateMonitoring')} />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Annulla
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </div>
    </form>
  );
};

