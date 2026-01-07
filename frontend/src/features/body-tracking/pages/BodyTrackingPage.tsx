import React, { useState, useEffect } from 'react';
import { AvatarVisualizer } from '../components/AvatarVisualizer';
import { MeasurementInput } from '../components/MeasurementInput';
import { PhotoUpload } from '../components/PhotoUpload';
import { bodyTrackingService } from '../services/bodyTrackingService';
import { AnalysisItem, Gender, View } from '../types';

export const BodyTrackingPage: React.FC = () => {
  const [gender, setGender] = useState<Gender>('male');
  const [view, setView] = useState<View>('front');
  const [metrics, setMetrics] = useState<Record<string, number>>({
    weight: 78, height: 178, chest: 100, waist: 84, hips: 98, shoulders: 118, bicep: 35, thigh: 58
  });
  const [analysis, setAnalysis] = useState<AnalysisItem[]>([]);

  useEffect(() => {
    // Load initial analysis
    bodyTrackingService.getAnalysis(gender).then((data) => {
      // Ensure data.analysis matches AnalysisItem[]
      // In a real app we'd validate this, here we cast safely if the service returns matching shape
      setAnalysis((data as { analysis: AnalysisItem[] }).analysis);
    });
  }, [gender]);

  const handleMetricChange = (key: string, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
    // Debounce save in real app
    bodyTrackingService.saveMetric(key, value, key === 'weight' ? 'kg' : 'cm');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold">BT</div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Body Tracker</h1>
            <p className="text-xs text-gray-500">Proportion Analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['male', 'female'].map(g => (
            <button
              key={g}
              onClick={() => setGender(g as Gender)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gender === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g === 'male' ? '♂ Male' : '♀ Female'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr_300px] gap-6">
        {/* LEFT COLUMN: Inputs */}
        <div className="space-y-6">
          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Measurements</h2>
            <div className="space-y-1">
              <MeasurementInput 
                label="Weight" 
                value={metrics.weight} 
                unit="kg" 
                onChange={(v) => handleMetricChange('weight', v)} 
              />
              <MeasurementInput 
                label="Chest" 
                value={metrics.chest} 
                unit="cm" 
                onChange={(v) => handleMetricChange('chest', v)}
                status={analysis.find(a => a.part === 'chest')?.status}
                ideal={analysis.find(a => a.part === 'chest')?.ideal}
              />
              <MeasurementInput 
                label="Waist" 
                value={metrics.waist} 
                unit="cm" 
                onChange={(v) => handleMetricChange('waist', v)}
                status={analysis.find(a => a.part === 'waist')?.status}
                ideal={analysis.find(a => a.part === 'waist')?.ideal}
              />
              <MeasurementInput 
                label="Shoulders" 
                value={metrics.shoulders} 
                unit="cm" 
                onChange={(v) => handleMetricChange('shoulders', v)}
              />
              {/* More inputs... */}
            </div>
          </section>
        </div>

        {/* MIDDLE COLUMN: Avatar */}
        <div className="flex flex-col">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 relative min-h-[500px]">
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['front', 'side'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v as View)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      view === v ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full h-full flex items-center justify-center p-4">
              <AvatarVisualizer 
                measurements={metrics} 
                gender={gender} 
                view={view} 
                showGuides={true}
                showLabels={true}
                analysis={analysis}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Photos & Stats */}
        <div className="space-y-6">
          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Progress Photos</h2>
            <PhotoUpload onUpload={bodyTrackingService.uploadPhoto} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {/* Placeholder for gallery */}
              <div className="aspect-square bg-gray-100 rounded-lg"></div>
              <div className="aspect-square bg-gray-100 rounded-lg"></div>
              <div className="aspect-square bg-gray-100 rounded-lg"></div>
            </div>
          </section>

          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Analysis</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Optimal Parts</span>
                <span className="font-bold text-green-600">3/9</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-1/3"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
