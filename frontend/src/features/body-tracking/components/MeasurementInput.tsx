import React from 'react';

interface MeasurementInputProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  status?: 'optimal' | 'over' | 'under';
  ideal?: number;
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({ 
  label, value, unit, min = 0, max = 300, step = 0.5, onChange, status, ideal 
}) => {
  const handleChange = (newValue: number) => {
    const clamped = Math.min(max, Math.max(min, newValue));
    onChange(clamped);
  };

  const getStatusColor = () => {
    if (status === 'optimal') return 'text-green-600 bg-green-50';
    if (status === 'over') return 'text-amber-600 bg-amber-50';
    if (status === 'under') return 'text-blue-600 bg-blue-50';
    return '';
  };

  const getStatusText = () => {
    if (status === 'optimal') return '✓ Optimal';
    if (status === 'over') return '↓ Reduce';
    if (status === 'under') return '↑ Grow';
    return '';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <button 
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => handleChange(value - step)}
          >
            −
          </button>
          <div className="flex items-center border border-gray-300 rounded px-2 h-8 w-24">
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
              className="w-full text-center text-sm font-semibold outline-none"
              min={min}
              max={max}
              step={step}
            />
            <span className="text-xs text-gray-400 ml-1">{unit}</span>
          </div>
          <button 
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => handleChange(value + step)}
          >
            +
          </button>
        </div>
      </div>
      
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => handleChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />

      {status && (
        <div className={`mt-2 px-2 py-1 rounded text-xs flex justify-between items-center ${getStatusColor()}`}>
          <span className="font-semibold">{getStatusText()}</span>
          <span>Target: {ideal} {unit}</span>
        </div>
      )}
    </div>
  );
};

