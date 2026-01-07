export interface AnalysisItem {
  part: string;
  ideal: number;
  current?: number;
  deviation: number;
  status: 'optimal' | 'over' | 'under';
}

export type Gender = 'male' | 'female';
export type View = 'front' | 'side' | 'back';

export interface BodyStats {
  y: Record<string, number>;
  w: Record<string, number>;
  d: Record<string, { f: number; b: number }>;
  headH: number;
  gMod: Record<string, number>;
  wMod: number;
  g: Gender;
}

