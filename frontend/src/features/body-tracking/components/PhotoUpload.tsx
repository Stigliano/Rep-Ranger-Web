import React, { useState, useRef, useEffect } from 'react';

interface PhotoUploadProps {
  onUpload: (file: File, view: 'front' | 'side' | 'back', date: string) => Promise<void>;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'side' | 'back'>('front');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File too large (max 10MB)' });
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      await onUpload(file, view, date);
      setFile(null);
      setPreview(null);
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center relative overflow-hidden transition-colors hover:bg-gray-50/80">
      <h3 className="font-semibold mb-4 text-gray-800">Add Progress Photo</h3>
      
      {message && (
        <div className={`mb-4 px-3 py-2 rounded text-sm font-medium ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        } animate-in fade-in slide-in-from-top-2 duration-300`}>
          {message.text}
        </div>
      )}

      {!preview ? (
        <div 
          className="cursor-pointer py-8 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-4xl block mb-2 transform transition-transform group-hover:scale-110">📷</span>
          <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            Click to upload or drag & drop
          </span>
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/png, image/jpeg" 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative inline-block">
            <img src={preview} alt="Preview" className="mx-auto h-48 object-contain rounded shadow-sm border border-gray-200 bg-white" />
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {(file?.size ? (file.size / 1024 / 1024).toFixed(2) : 0)} MB
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">View</label>
              <select 
                value={view} 
                onChange={(e) => setView(e.target.value as 'front' | 'side' | 'back')}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
              >
                <option value="front">Front</option>
                <option value="side">Side</option>
                <option value="back">Back</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <button 
              onClick={() => { setFile(null); setPreview(null); setMessage(null); }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Uploading...
                </span>
              ) : 'Save Photo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

