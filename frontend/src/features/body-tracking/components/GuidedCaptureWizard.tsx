import React, { useState, useRef, useEffect } from 'react';
import { View, BodyTrackingSession } from '../types';
import { GhostOverlay } from './GhostOverlay';
import { bodyTrackingService } from '../services/bodyTrackingService';

interface GuidedCaptureWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  lastSession?: BodyTrackingSession;
}

type Step = 'setup' | 'capture' | 'review';
const CAPTURE_ORDER: View[] = ['FRONT', 'RIGHT_SIDE', 'BACK', 'LEFT_SIDE'];

export const GuidedCaptureWizard: React.FC<GuidedCaptureWizardProps> = ({ onComplete, onCancel, lastSession }) => {
  const [step, setStep] = useState<Step>('setup');
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState<Record<View, { file: File, url: string, id?: string }>>({} as any);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const currentView = CAPTURE_ORDER[currentViewIndex];

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `${currentView}_${date}.jpg`, { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            setCapturedPhotos(prev => ({
              ...prev,
              [currentView]: { file, url }
            }));
            
            if (currentViewIndex < CAPTURE_ORDER.length - 1) {
              setCurrentViewIndex(prev => prev + 1);
            } else {
              setStep('review');
            }
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleRetake = (view: View) => {
    const index = CAPTURE_ORDER.indexOf(view);
    setCurrentViewIndex(index);
    setStep('capture');
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // 1. Upload all photos
      const photoIds: string[] = [];
      for (const view of CAPTURE_ORDER) {
        const photoData = capturedPhotos[view];
        if (photoData) {
          const result = await bodyTrackingService.uploadPhoto(photoData.file, view, date);
          photoIds.push(result.id);
        }
      }

      // 2. Create Session
      await bodyTrackingService.createSession(
        date, 
        photoIds, 
        weight === '' ? undefined : Number(weight), 
        notes
      );

      onComplete();
    } catch (err) {
      console.error("Failed to save session", err);
      alert("Failed to save session. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getPreviousPhotoUrl = (view: View) => {
    if (!lastSession) return undefined;
    const photo = lastSession.photos.find(p => p.viewType === view);
    return photo?.photoUrl;
  };

  if (step === 'setup') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">New Check-in</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={e => setWeight(Number(e.target.value))}
                placeholder="Optional"
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="How are you feeling?"
                className="w-full border rounded-lg p-2 h-24"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={onCancel} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={() => setStep('capture')} 
                className="flex-1 py-2 bg-black text-white rounded-lg font-medium"
              >
                Start Capture
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'capture') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="text-white text-center p-4">
              <p className="mb-4">{cameraError}</p>
              <button onClick={onCancel} className="px-4 py-2 bg-white text-black rounded">Close</button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              <GhostOverlay view={currentView} previousPhotoUrl={getPreviousPhotoUrl(currentView)} />
            </>
          )}
        </div>
        
        <div className="bg-black/80 p-6 text-white safe-area-bottom">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium opacity-70">
              Step {currentViewIndex + 1} of 4
            </div>
            <div className="font-bold text-lg">
              {currentView.replace('_', ' ')}
            </div>
            <button onClick={() => setStep('review')} className="text-sm opacity-70">
              Skip
            </button>
          </div>
          
          <div className="flex justify-center items-center gap-8">
            <button onClick={onCancel} className="text-white/70">Cancel</button>
            <button 
              onClick={handleCapture}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
            >
              <div className="w-14 h-14 bg-white rounded-full active:scale-90 transition-transform" />
            </button>
            <button className="w-8 h-8 opacity-0">Swap</button> {/* Placeholder for layout */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <h2 className="font-bold text-lg">Review Check-in</h2>
        <button onClick={onCancel} className="text-gray-500">Close</button>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4">
        {CAPTURE_ORDER.map(view => (
          <div key={view} className="space-y-2">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative group">
              {capturedPhotos[view] ? (
                <>
                  <img src={capturedPhotos[view].url} alt={view} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleRetake(view)}
                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity"
                  >
                    Retake
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Missing
                </div>
              )}
            </div>
            <div className="text-center text-sm font-medium text-gray-900">
              {view.replace('_', ' ')}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t mt-auto sticky bottom-0 bg-white">
        <button 
          onClick={handleSubmit}
          disabled={isUploading || Object.keys(capturedPhotos).length !== 4}
          className="w-full py-3 bg-black text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Saving...' : 'Complete Check-in'}
        </button>
      </div>
    </div>
  );
};
