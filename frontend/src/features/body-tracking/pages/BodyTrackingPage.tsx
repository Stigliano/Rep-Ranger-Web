import React, { useState, useEffect } from 'react';
import { AvatarVisualizer } from '../components/AvatarVisualizer';
import { MeasurementInput } from '../components/MeasurementInput';
import { GuidedCaptureWizard } from '../components/GuidedCaptureWizard';
import { ComparisonGallery } from '../components/ComparisonGallery';
import { ProgressCharts } from '../components/ProgressCharts';
import { FullMeasurementEntry } from '../components/FullMeasurementEntry';
import { bodyTrackingService } from '../services/bodyTrackingService';
import { AnalysisItem, Gender, View, BodyTrackingSession, BodyCompositionResult, BodyMetric } from '../types';
import { MEASUREMENT_CATEGORIES, MEASUREMENT_GUIDELINES } from '../data/measurement-guidelines';

export const BodyTrackingPage: React.FC = () => {
  const [gender, setGender] = useState<Gender>('male');
  const [view, setView] = useState<View>('FRONT');
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState<AnalysisItem[]>([]);
  const [composition, setComposition] = useState<BodyCompositionResult | undefined>(undefined);
  const [sessions, setSessions] = useState<BodyTrackingSession[]>([]);
  const [history, setHistory] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showFullEntry, setShowFullEntry] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('general');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analysisData, sessionsData, historyData] = await Promise.all([
        bodyTrackingService.getAnalysis(gender),
        bodyTrackingService.getSessions(),
        bodyTrackingService.getHistory()
      ]);
      
      setAnalysis(analysisData.analysis);
      setComposition(analysisData.composition);
      setSessions(sessionsData);
      setHistory(historyData);
      
      // Update metrics from analysis data if available
      const newMetrics = { ...metrics };
      
      // Populate with current values from analysis
      analysisData.analysis.forEach(item => {
        if (item.current) {
          newMetrics[item.part] = item.current;
        }
      });
      
      setMetrics(newMetrics);
    } catch (err) {
      console.error('Failed to load body tracking data', err);
      // More specific error handling could be added here based on error type
      setError('Errore durante il caricamento dei dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]);

  const handleMetricChange = async (key: string, value: number) => {
    // Optimistic update
    setMetrics(prev => ({ ...prev, [key]: value }));
    
    try {
      // Determine unit based on key or guideline
      const unit = MEASUREMENT_GUIDELINES[key]?.category === 'skinfold' ? 'mm' : (key === 'weight' ? 'kg' : 'cm');
      await bodyTrackingService.saveMetric(key, value, unit);
      
      // Reload analysis to update targets and status based on new value
      const data = await bodyTrackingService.getAnalysis(gender);
      setAnalysis(data.analysis);
      setComposition(data.composition);
      
      // Refresh history for charts
      const historyData = await bodyTrackingService.getHistory();
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to save metric', err);
      setError('Errore durante il salvataggio della metrica.');
    }
  };

  const handleFullEntrySave = async (newMetrics: Record<string, number>) => {
    try {
      // Save all changed metrics
      const promises = Object.entries(newMetrics).map(([key, value]) => {
        if (value !== metrics[key]) {
          const unit = MEASUREMENT_GUIDELINES[key]?.category === 'skinfold' ? 'mm' : (key === 'weight' ? 'kg' : 'cm');
          return bodyTrackingService.saveMetric(key, value, unit);
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      await loadData();
    } catch (err) {
      console.error('Failed to save full entry', err);
      throw err; // Let modal handle error state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold">BT</div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Body Tracker</h1>
            <p className="text-xs text-gray-500">Analisi e Composizione Corporea</p>
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
              {g === 'male' ? '♂ Uomo' : '♀ Donna'}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-[400px_1fr_300px] gap-6 mb-8 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* LEFT COLUMN: Inputs */}
        <div className="space-y-6">
          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Misure</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFullEntry(true)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium transition-colors"
                  title="Inserimento completo"
                >
                  📝 Full
                </button>
                <select 
                  value={activeCategory} 
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black"
                >
                  {MEASUREMENT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
              {Object.values(MEASUREMENT_GUIDELINES)
                .filter(g => g.category === activeCategory)
                .map(guideline => (
                  <MeasurementInput 
                    key={guideline.id}
                    label={guideline.label}
                    value={metrics[guideline.id] || 0}
                    unit={guideline.category === 'skinfold' ? 'mm' : (guideline.id === 'weight' ? 'kg' : 'cm')}
                    max={guideline.category === 'skinfold' ? 100 : 300}
                    step={guideline.category === 'skinfold' ? 1 : 0.5}
                    onChange={(v) => handleMetricChange(guideline.id, v)}
                    status={analysis.find(a => a.part === guideline.id)?.status}
                    ideal={analysis.find(a => a.part === guideline.id)?.ideal}
                    guideline={guideline.instructions}
                  />
                ))}
            </div>
          </section>
        </div>

        {/* MIDDLE COLUMN: Avatar */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 relative min-h-[500px]">
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['FRONT', 'LEFT_SIDE'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v as View)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      view === v ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {v === 'FRONT' ? 'Fronte' : 'Lato'}
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

          {/* Progress Charts Section */}
          <ProgressCharts metrics={history} />
        </div>

        {/* RIGHT COLUMN: Actions & Analysis */}
        <div className="space-y-6">
          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Azioni</h2>
            <button 
              onClick={() => setShowWizard(true)}
              className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>📷</span> Nuovo Check-in
            </button>
          </section>

          {/* Body Composition Card */}
          {composition && (
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Composizione Corporea</h2>
              <div className="space-y-4">
                {composition.bodyFat && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-semibold mb-1">Massa Grassa ({composition.bodyFat.method})</div>
                    <div className="text-2xl font-bold text-blue-900">{composition.bodyFat.value}%</div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {composition.bmi && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">BMI</div>
                      <div className="text-lg font-bold">{composition.bmi.value}</div>
                      <div className="text-xs text-gray-600">{composition.bmi.status}</div>
                    </div>
                  )}
                  {composition.ffmi && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">FFMI</div>
                      <div className="text-lg font-bold">{composition.ffmi.value}</div>
                      <div className="text-xs text-gray-600">{composition.ffmi.status}</div>
                    </div>
                  )}
                  {composition.whr && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">WHR</div>
                      <div className="text-lg font-bold">{composition.whr.value}</div>
                      <div className="text-xs text-gray-600">{composition.whr.status}</div>
                    </div>
                  )}
                  {composition.whtr && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">WHtR</div>
                      <div className="text-lg font-bold">{composition.whtr.value}</div>
                      <div className="text-xs text-gray-600">{composition.whtr.status}</div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Analisi Proporzioni</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Parti Ottimali</span>
                <span className="font-bold text-green-600">
                  {analysis.filter(a => a.status === 'optimal').length}/{analysis.length}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(analysis.filter(a => a.status === 'optimal').length / Math.max(analysis.length, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* BOTTOM SECTION: Gallery */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Galleria Progressi</h2>
        <ComparisonGallery sessions={sessions} />
      </section>

      {/* WIZARD MODAL */}
      {showWizard && (
        <GuidedCaptureWizard 
          onComplete={() => {
            setShowWizard(false);
            loadData();
          }}
          onCancel={() => setShowWizard(false)}
          lastSession={sessions[0]}
        />
      )}

      {/* FULL ENTRY MODAL */}
      {showFullEntry && (
        <FullMeasurementEntry 
          initialMetrics={metrics}
          onSave={handleFullEntrySave}
          onClose={() => setShowFullEntry(false)}
        />
      )}
    </div>
  );
};
