import { useEffect, useState } from 'react';

interface RecoveryTimerProps {
  startTime: number | null; // Timestamp when it started
  onClose: () => void;
}

export const RecoveryTimer = ({ startTime, onClose }: RecoveryTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    
    // Initial update
    setElapsed(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!startTime) return null;

  return (
    <div className="fixed bottom-24 right-4 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 z-50 animate-fade-in-up">
      <div className="flex flex-col items-center">
         <span className="text-xs text-gray-400 uppercase tracking-wider">Recupero</span>
         <span className="font-mono text-xl font-bold">{formatTime(elapsed)}</span>
      </div>
      <button 
        onClick={onClose} 
        className="ml-2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

