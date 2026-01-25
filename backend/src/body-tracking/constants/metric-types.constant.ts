export const METRIC_TYPES = {
  // General
  WEIGHT: 'weight',
  HEIGHT: 'height',

  // Circumferences (Legacy & New)
  NECK: 'neck',
  SHOULDERS: 'shoulders',
  CHEST: 'chest',
  WAIST: 'waist',
  HIPS: 'hips',
  
  // Arms
  BICEP: 'bicep', // Legacy (assumed right or avg)
  BICEP_LEFT: 'bicep_left',
  BICEP_RIGHT: 'bicep_right',
  FOREARM: 'forearm', // Legacy
  FOREARM_LEFT: 'forearm_left',
  FOREARM_RIGHT: 'forearm_right',
  WRIST: 'wrist', // Legacy
  WRIST_LEFT: 'wrist_left',
  WRIST_RIGHT: 'wrist_right',

  // Legs
  THIGH: 'thigh', // Legacy
  THIGH_LEFT: 'thigh_left',
  THIGH_RIGHT: 'thigh_right',
  CALF: 'calf', // Legacy
  CALF_LEFT: 'calf_left',
  CALF_RIGHT: 'calf_right',
  ANKLE: 'ankle', // Legacy
  ANKLE_LEFT: 'ankle_left',
  ANKLE_RIGHT: 'ankle_right',

  // Lengths
  HEAD_LENGTH: 'head_length',
  NECK_LENGTH: 'neck_length',
  TORSO_LENGTH: 'torso_length',
  ARM_LENGTH: 'arm_length',
  LEG_LENGTH: 'leg_length',

  // Skinfolds (Plicometria) - Jackson-Pollock 3/7 sites
  SKINFOLD_CHEST: 'skinfold_chest', // Pettorale
  SKINFOLD_MIDAXILLARY: 'skinfold_midaxillary', // Ascellare media
  SKINFOLD_TRICEP: 'skinfold_tricep', // Tricipite
  SKINFOLD_SUBSCAPULAR: 'skinfold_subscapular', // Sottoscapolare
  SKINFOLD_ABDOMINAL: 'skinfold_abdominal', // Addominale
  SKINFOLD_SUPRAILIAC: 'skinfold_suprailiac', // Sovrailiaca
  SKINFOLD_THIGH: 'skinfold_thigh', // Coscia
} as const;

export type MetricType = typeof METRIC_TYPES[keyof typeof METRIC_TYPES];

export const VALID_METRIC_TYPES = Object.values(METRIC_TYPES);
