import React, { useState } from 'react';
import { BodyTrackingSession, View } from '../types';

interface ComparisonGalleryProps {
  sessions: BodyTrackingSession[];
}

const VIEWS: View[] = ['FRONT', 'RIGHT_SIDE', 'BACK', 'LEFT_SIDE'];

export const ComparisonGallery: React.FC<ComparisonGalleryProps> = ({ sessions }) => {
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<View>('FRONT');

  const toggleSession = (id: string) => {
    setSelectedSessionIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(sid => sid !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id]; // Keep the last one and add new one
      }
      return [...prev, id];
    });
  };

  // Default to most recent session if nothing selected
  const displaySessions = selectedSessionIds.length > 0 
    ? sessions.filter(s => selectedSessionIds.includes(s.id)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : sessions.length > 0 ? [sessions[0]] : [];

  return (
    <div className="flex flex-col h-full">
      {/* View Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {VIEWS.map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeView === view 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {view.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Session List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">History</h3>
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => toggleSession(session.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedSessionIds.includes(session.id)
                  ? 'border-black bg-gray-50 ring-1 ring-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">
                  {new Date(session.date).toLocaleDateString()}
                </span>
                {selectedSessionIds.indexOf(session.id) !== -1 && (
                  <span className="text-[10px] bg-black text-white px-1.5 rounded-full">
                    {selectedSessionIds.indexOf(session.id) === 0 ? 'A' : 'B'}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {session.weight ? `${session.weight} kg` : 'No weight'}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">No sessions recorded</div>
          )}
        </div>

        {/* Comparison Area */}
        <div className="bg-gray-50 rounded-xl p-4 min-h-[400px] flex items-center justify-center border border-gray-200">
          {displaySessions.length === 0 ? (
            <div className="text-gray-400 text-sm">Select a session to view</div>
          ) : (
            <div className={`grid ${displaySessions.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 w-full max-w-4xl`}>
              {displaySessions.map((session, idx) => {
                const photo = session.photos.find(p => p.viewType === activeView);
                return (
                  <div key={session.id} className="space-y-2">
                    <div className="aspect-[3/4] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                      {photo ? (
                        <img 
                          src={photo.photoUrl} 
                          alt={`${activeView} - ${session.date}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          No photo
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">
                        {session.weight ? `${session.weight} kg` : 'N/A'}
                      </div>
                      {displaySessions.length > 1 && idx === 1 && displaySessions[0].weight && session.weight && (
                        <div className={`text-xs font-bold ${session.weight < displaySessions[0].weight ? 'text-green-600' : 'text-red-600'}`}>
                          {(session.weight - displaySessions[0].weight).toFixed(1)} kg
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
