import React from 'react';
import { View } from '../types';

interface GhostOverlayProps {
  view: View;
  previousPhotoUrl?: string;
}

export const GhostOverlay: React.FC<GhostOverlayProps> = ({ view, previousPhotoUrl }) => {
  if (previousPhotoUrl) {
    return (
      <div className="absolute inset-0 pointer-events-none opacity-30 z-10">
        <img 
          src={previousPhotoUrl} 
          alt="Ghost overlay" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback guides if no previous photo
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
      <div className="w-full h-full border-2 border-white/30 relative">
        {/* Center Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30 transform -translate-x-1/2"></div>
        
        {/* Eye Level (Approx) */}
        <div className="absolute top-[15%] left-0 right-0 h-px bg-white/30"></div>
        
        {/* Shoulder Level (Approx) */}
        <div className="absolute top-[25%] left-0 right-0 h-px bg-white/30"></div>
        
        {/* Hip Level (Approx) */}
        <div className="absolute top-[50%] left-0 right-0 h-px bg-white/30"></div>
        
        {/* Knee Level (Approx) */}
        <div className="absolute top-[75%] left-0 right-0 h-px bg-white/30"></div>
      </div>
      <div className="absolute bottom-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        Align {view.toLowerCase().replace('_', ' ')} with guides
      </div>
    </div>
  );
};
