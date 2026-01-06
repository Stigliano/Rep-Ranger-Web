// Mock service - in production this would use axios/fetch
export const bodyTrackingService = {
  getAnalysis: async (gender: 'male' | 'female') => {
    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          method: 'casey_butt',
          targets: {
            chest: 105, shoulders: 125, waist: 78, bicep: 38, forearm: 30, thigh: 60, calf: 40
          },
          analysis: [
            { part: 'chest', ideal: 105, current: 100, deviation: -4.7, status: 'under' },
            { part: 'waist', ideal: 78, current: 84, deviation: 7.6, status: 'over' },
            { part: 'bicep', ideal: 38, current: 35, deviation: -7.8, status: 'under' }
          ]
        });
      }, 500);
    });
  },

  saveMetric: async (metricType: string, value: number, unit: string) => {
    console.log('Saving metric', { metricType, value, unit });
    return Promise.resolve({ success: true });
  },

  uploadPhoto: async (file: File, view: string, date: string) => {
    console.log('Uploading photo', { file, view, date });
    return Promise.resolve({ success: true });
  }
};

