import React, { useState, useRef } from 'react';

interface PhotoUploadProps {
  onUpload: (file: File, view: 'front' | 'side' | 'back', date: string) => Promise<void>;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'side' | 'back'>('front');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        alert('File too large (max 10MB)');
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
    try {
      await onUpload(file, view, date);
      setFile(null);
      setPreview(null);
      alert('Photo uploaded successfully!');
    } catch (error) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
      <h3 className="font-semibold mb-4">Add Progress Photo</h3>
      
      {!preview ? (
        <div 
          className="cursor-pointer py-8"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-4xl block mb-2">📷</span>
          <span className="text-sm text-gray-500">Click to upload or drag & drop</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/png, image/jpeg" 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <img src={preview} alt="Preview" className="mx-auto h-48 object-contain rounded" />
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">View</label>
              <select 
                value={view} 
                onChange={(e) => setView(e.target.value as 'front' | 'side' | 'back')}
                className="w-full border rounded p-2 text-sm"
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
                className="w-full border rounded p-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => { setFile(null); setPreview(null); }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Save Photo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

