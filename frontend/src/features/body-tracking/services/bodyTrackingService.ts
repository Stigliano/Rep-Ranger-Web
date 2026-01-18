import { apiClient } from '@/shared/lib/api/client';
import { AnalysisItem } from '../types';

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
    // TODO: Implement backend endpoint for photo upload
    // Mock implementation for now
    return Promise.resolve({ success: true });
  }
};
