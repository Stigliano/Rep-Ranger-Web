export interface AnalysisItem {
  part: string;
  ideal: number;
  current?: number;
  deviation: number;
  status: 'optimal' | 'over' | 'under';
}

export interface BodyCompositionResult {
  bmi?: { value: number; status: string };
  whr?: { value: number; status: string };
  whtr?: { value: number; status: string };
  bodyFat?: {
    navy?: number;
    jacksonPollock3?: number;
    jacksonPollock7?: number;
    value: number;
    method: string;
  };
  ffmi?: { value: number; status: string };
}

export interface AnalysisResponse {
  method: string;
  targets: Record<string, number>;
  analysis: AnalysisItem[];
  composition?: BodyCompositionResult;
}

export type Gender = 'male' | 'female';
export type View = 'FRONT' | 'BACK' | 'LEFT_SIDE' | 'RIGHT_SIDE';

export interface Photo {
  id: string;
  photoUrl: string;
  viewType: View;
  date: string;
  notes?: string;
  sessionId?: string;
}

export interface BodyTrackingSession {
  id: string;
  date: string;
  weight?: number;
  notes?: string;
  photos: Photo[];
}

export interface BodyStats {
  y: Record<string, number>;
  w: Record<string, number>;
  d: Record<string, { f: number; b: number }>;
  headH: number;
  gMod: Record<string, number>;
  wMod: number;
  g: Gender;
}

export interface BodyMetric {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  measuredAt: string;
  userId?: string;
}
