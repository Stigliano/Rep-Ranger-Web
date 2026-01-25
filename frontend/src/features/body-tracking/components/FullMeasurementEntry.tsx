import React, { useState } from 'react';
import { MEASUREMENT_GUIDELINES, MEASUREMENT_CATEGORIES } from '../data/measurement-guidelines';
import { MeasurementInput } from './MeasurementInput';

interface FullMeasurementEntryProps {
  initialMetrics: Record<string, number>;
  onSave: (metrics: Record<string, number>) => Promise<void>;
  onClose: () => void;
}

export const FullMeasurementEntry: React.FC<FullMeasurementEntryProps> = ({ initialMetrics, onSave, onClose }) => {
  const [metrics, setMetrics] = useState<Record<string, number>>(initialMetrics);
  const [activeTab, setActiveTab] = useState<string>(MEASUREMENT_CATEGORIES[0].id);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(metrics);
      onClose();
    } catch (error) {
      console.error('Failed to save all metrics', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Inserimento Misure Completo</h2>
            <p className="text-sm text-gray-500">Aggiorna tutte le tue misurazioni in un'unica sessione</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto px-6 pt-2">
          {MEASUREMENT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === cat.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(MEASUREMENT_GUIDELINES)
              .filter(g => g.category === activeTab)
              .map(guideline => (
                <div key={guideline.id} className="bg-gray-50 p-4 rounded-lg">
                  <MeasurementInput
                    label={guideline.label}
                    value={metrics[guideline.id] || 0}
                    unit={guideline.category === 'skinfold' ? 'mm' : (guideline.id === 'weight' ? 'kg' : 'cm')}
                    max={guideline.category === 'skinfold' ? 100 : 300}
                    step={guideline.category === 'skinfold' ? 1 : 0.5}
                    onChange={(v) => handleChange(guideline.id, v)}
                    guideline={guideline.instructions}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvataggio...
              </>
            ) : (
              'Salva Tutto'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
