import { apiClient } from '@/shared/lib/api/client';

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  heightCm: number | null;
  photoUri: string | null;
  athleteLevel: 'beginner' | 'intermediate' | 'advanced' | 'competitive' | null;
  weeklyVolumeHours: number | null;
  trainingFocus: string[] | null;
  trainingLocations: string[] | null;
  mealsPerDay: string | null;
  mealTiming: string | null;
  macroTracking: string | null;
  supplements: string | null;
  trainingLog: string | null;
  heartRateMonitoring: string | null;
}

export interface UserSettings {
  language: 'it' | 'en';
  units: 'metric' | 'imperial';
  featureLevel: 'basic' | 'advanced';
  hapticFeedback: boolean;
  soundFeedback: boolean;
  autoSync: boolean;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
  settings: UserSettings;
}

export interface UpdateProfileRequest {
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  athleteLevel?: 'beginner' | 'intermediate' | 'advanced' | 'competitive';
  weeklyVolumeHours?: number;
  trainingFocus?: string[];
  trainingLocations?: string[];
  mealsPerDay?: string;
  mealTiming?: string;
  macroTracking?: string;
  supplements?: string;
  trainingLog?: string;
  heartRateMonitoring?: string;
}

export const profileApi = {
  getProfile: async (): Promise<UserData> => {
    const response = await apiClient.get<UserData>('/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserData> => {
    const response = await apiClient.patch<UserData>('/profile', data);
    return response.data;
  },
};

