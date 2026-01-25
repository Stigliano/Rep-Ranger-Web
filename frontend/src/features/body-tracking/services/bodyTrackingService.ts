import { apiClient } from '@/shared/lib/api/client';
import { AnalysisItem, BodyTrackingSession } from '../types';

interface AnalysisResponse {
  method: string;
  targets: Record<string, number>;
  analysis: AnalysisItem[];
}

export const bodyTrackingService = {
  getAnalysis: async (gender: 'male' | 'female'): Promise<AnalysisResponse> => {
    const response = await apiClient.get<AnalysisResponse>('/body-metrics/analysis', {
      params: { gender }
    });
    return response.data;
  },

  saveMetric: async (metricType: string, value: number, unit: string) => {
    const response = await apiClient.post('/body-metrics', {
      metricType,
      value,
      unit,
      measuredAt: new Date().toISOString()
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/body-metrics/history');
    return response.data;
  },

  uploadPhoto: async (file: File, view: string, date: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('viewType', view);
    formData.append('date', date);

    const response = await apiClient.post('/body-metrics/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPhotos: async () => {
    const response = await apiClient.get('/body-metrics/photos');
    return response.data;
  },

  createSession: async (date: string, photoIds: string[], weight?: number, notes?: string) => {
    const response = await apiClient.post<BodyTrackingSession>('/body-metrics/sessions', {
      date,
      photoIds,
      weight,
      notes
    });
    return response.data;
  },

  getSessions: async () => {
    const response = await apiClient.get<BodyTrackingSession[]>('/body-metrics/sessions');
    return response.data;
  }
};
