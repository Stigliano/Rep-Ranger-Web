import React, { useMemo } from 'react';
import { AnalysisItem, Gender, View, BodyStats } from '../types';

// --- TYPES ---
interface AvatarProps {
  measurements: Record<string, number>;
  gender: Gender;
  view: View;
  showGuides?: boolean;
  showLabels?: boolean;
  analysis?: AnalysisItem[];
}

// --- CONSTANTS ---
const REFS = {
  male: {
    height: [160, 200, 178], headLength: [20, 26, 23], neckLength: [8, 14, 11],
    torsoLength: [44, 58, 52], armLength: [55, 75, 65], legLength: [75, 100, 88],
    weight: [55, 130, 78], neck: [34, 46, 39], shoulders: [105, 135, 118],
    chest: [86, 125, 100], waist: [68, 110, 84], hips: [85, 115, 98],
    bicep: [28, 45, 35], forearm: [24, 36, 29], wrist: [15, 20, 17],
    thigh: [50, 72, 58], calf: [34, 46, 38], ankle: [19, 26, 22]
  },
  female: {
    height: [150, 185, 165], headLength: [19, 24, 21], neckLength: [7, 12, 9],
    torsoLength: [40, 52, 46], armLength: [50, 68, 58], legLength: [70, 95, 82],
    weight: [45, 95, 58], neck: [30, 38, 32], shoulders: [90, 115, 98],
    chest: [78, 110, 88], waist: [58, 90, 68], hips: [88, 125, 98],
    bicep: [24, 36, 27], forearm: [20, 30, 23], wrist: [14, 18, 15],
    thigh: [50, 68, 56], calf: [32, 44, 35], ankle: [18, 24, 20]
  }
};

const norm = (v: number, min: number, max: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));

// --- BODY CALCULATION LOGIC ---
const calcBody = (m: Record<string, number>, g: Gender): BodyStats => {
  const r = REFS[g];
  const n = (k: string) => {
    const ref = r[k as keyof typeof r];
    if (!ref) return 0.5;
    return norm(m[k] || ref[2], ref[0], ref[1]);
  };

  const totalH = 440, headH = totalH / 8;
  const headR = 0.8 + n('headLength') * 0.4;
  const neckR = 0.7 + n('neckLength') * 0.6;
  const torsoR = 0.85 + n('torsoLength') * 0.3;
  const armR = 0.85 + n('armLength') * 0.3;
  const legR = 0.9 + n('legLength') * 0.2;
  const wMod = 0.85 + n('weight') * 0.35;

  const gMod = g === 'female' ? {
    shoulderW: 0.82, chestW: 0.88, waistW: 0.85, hipW: 1.18, thighW: 1.08, armW: 0.85, neckW: 0.85,
    bustProtrude: 1.3, hipCurve: 1.25, waistCurve: 0.92
  } : {
    shoulderW: 1.0, chestW: 1.0, waistW: 1.0, hipW: 1.0, thighW: 1.0, armW: 1.0, neckW: 1.0,
    bustProtrude: 1.0, hipCurve: 1.0, waistCurve: 1.0
  };

  const y: Record<string, number> = {
    headTop: 20,
    headBottom: 20 + headH * headR,
    neckBottom: 20 + headH * headR + headH * 0.35 * neckR,
    shoulder: 20 + headH * headR + headH * 0.4 * neckR,
    chest: 20 + headH * 1.8 * torsoR,
    waist: 20 + headH * 3.0 * torsoR,
    hip: 20 + headH * 3.8,
    crotch: 20 + headH * 4.2,
    midThigh: 20 + headH * 5.0 * legR,
    knee: 20 + headH * 5.8 * legR,
    midCalf: 20 + headH * 6.6 * legR,
    ankle: 20 + headH * 7.5 * legR,
    foot: 20 + headH * 7.9
  };

  y.elbow = y.shoulder + (y.hip - y.shoulder) * 0.65 * armR;
  y.wrist = y.elbow + (y.hip - y.shoulder) * 0.55 * armR;
  y.hand = y.wrist + headH * 0.4;

  const w = {
    head: headH * 0.42 * headR,
    neck: headH * (0.22 + n('neck') * 0.08) * gMod.neckW * wMod,
    shoulder: headH * (0.95 + n('shoulders') * 0.25) * gMod.shoulderW * wMod,
    chest: headH * (0.75 + n('chest') * 0.2) * gMod.chestW * wMod,
    waist: headH * (0.55 + n('waist') * 0.25) * gMod.waistW * gMod.waistCurve * wMod,
    hip: headH * (0.65 + n('hips') * 0.2) * gMod.hipW * gMod.hipCurve * wMod,
    thigh: headH * (0.38 + n('thigh') * 0.15) * gMod.thighW * wMod,
    knee: headH * (0.22 + n('thigh') * 0.06) * wMod,
    calf: headH * (0.22 + n('calf') * 0.1) * wMod,
    ankle: headH * (0.12 + n('ankle') * 0.04),
    foot: headH * 0.28,
    bicep: headH * (0.18 + n('bicep') * 0.1) * gMod.armW * wMod,
    elbow: headH * (0.13 + n('bicep') * 0.04) * gMod.armW * wMod,
    forearm: headH * (0.14 + n('forearm') * 0.06) * gMod.armW * wMod,
    wrist: headH * (0.09 + n('wrist') * 0.03),
    hand: headH * 0.15
  };

  const d = {
    head: { f: headH * 0.35, b: headH * 0.42 },
    neck: { f: headH * 0.12 * wMod, b: headH * 0.15 * wMod },
    chest: { f: headH * (0.28 + n('chest') * 0.15) * gMod.bustProtrude * wMod, b: headH * (0.18 + n('chest') * 0.1) * wMod },
    waist: { f: headH * (0.18 + n('waist') * 0.2) * wMod, b: headH * (0.12 + n('waist') * 0.08) * wMod },
    hip: { f: headH * (0.2 + n('hips') * 0.12) * wMod, b: headH * (0.28 + n('hips') * 0.18) * gMod.hipCurve * wMod },
    thigh: { f: headH * (0.2 + n('thigh') * 0.12) * wMod, b: headH * (0.25 + n('thigh') * 0.15) * wMod },
    knee: { f: headH * 0.15, b: headH * 0.18 },
    calf: { f: headH * (0.12 + n('calf') * 0.08) * wMod, b: headH * (0.22 + n('calf') * 0.12) * wMod },
    ankle: { f: headH * 0.1, b: headH * 0.12 },
    bicep: { f: headH * (0.1 + n('bicep') * 0.08) * wMod, b: headH * (0.12 + n('bicep') * 0.1) * wMod },
    forearm: { f: headH * (0.08 + n('forearm') * 0.05) * wMod, b: headH * (0.1 + n('forearm') * 0.06) * wMod }
  };

  return { y, w, d, headH, gMod, wMod, g };
};

// Logic for front and side views is preserved but commented/unused to satisfy linter until fully implemented
// /* eslint-disable @typescript-eslint/no-unused-vars */
// const generateFrontView = (body: BodyStats) => {
//     const { y, w } = body;
//     const cx = 150;
//     const anchors: Record<string, { x: number; y: number }> = {};
//     const setAnchor = (part: string, x: number, yPos: number) => { anchors[part] = { x, y: yPos }; };
    
//     // Skeleton
//     const head = `M ${cx} ${y.headTop} L ${cx} ${y.headBottom}`; // Dummy
//     setAnchor('neck', cx, y.neckBottom);
//     setAnchor('shoulders', cx + w.shoulder, y.shoulder);
//     setAnchor('chest', cx + w.chest, y.chest);
//     setAnchor('waist', cx + w.waist, y.waist);
    
//     return { head, neck: '', traps: {left:'', right:''}, shoulders: {left:'', right:''}, chest: {left:'', right:''}, abs: '', obliques: {left:'', right:''}, biceps: {left:'', right:''}, forearms: {left:'', right:''}, hands: {left:'', right:''}, quads: {left:'', right:''}, calves: {left:'', right:''}, feet: {left:'', right:''}, anchors };
// };

// const generateSideView = (_body: BodyStats) => {
//     // const { y, d } = body; // Unused
//     const anchors: Record<string, { x: number; y: number }> = {};
//     return { head: '', neck: '', chest: '', abs: '', glute: '', quads: '', calves: '', feet: '', arm: '', anchors };
// };
// /* eslint-enable @typescript-eslint/no-unused-vars */

export const AvatarVisualizer: React.FC<AvatarProps> = ({ measurements, gender, view, showGuides, showLabels }) => {
  const body = useMemo(() => calcBody(measurements, gender), [measurements, gender]);
  
  // Logic for front and side views is preserved but commented/unused to satisfy linter until fully implemented
  // const front = useMemo(() => generateFrontView(body), [body]);
  // const side = useMemo(() => generateSideView(body), [body]);

  const { y } = body;
  const cx = 150;

  // Unused color logic
  // const _getColor = (part: string) => {
  //   const item = analysis?.find(a => a.part === part);
  //   if (!item) return '#d1d5db';
  //   if (item.status === 'optimal') return '#22c55e';
  //   if (item.status === 'under') return '#3b82f6';
  //   return '#f59e0b';
  // };

  return (
    <svg viewBox="0 0 300 460" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="gradHead" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect x="0" y="0" width="300" height="460" fill="transparent" />

      {/* Placeholder for actual SVG paths */}
      <text x="150" y="230" textAnchor="middle" fill="#666">
        Avatar Visualization ({view})
        {showLabels ? ' (Labels On)' : ''}
      </text>

      {showGuides && (
        <g stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeDasharray="3 3">
          <line x1={cx} y1="15" x2={cx} y2="445" />
          {[y.shoulder, y.chest, y.waist, y.hip, y.knee].map((gy: number, i: number) => (
            <line key={i} x1="40" y1={gy} x2="260" y2={gy} stroke="rgba(0,0,0,0.08)" />
          ))}
        </g>
      )}
    </svg>
  );
};
