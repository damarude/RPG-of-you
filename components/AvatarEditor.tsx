
import React, { useState } from 'react';
import { Loader2, Upload, Save, X, User, Camera } from 'lucide-react';

interface AvatarEditorProps {
  currentImage: string;
  currentName: string;
  onSave: (newImage: string, newName: string) => void;
  onCancel: () => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ 
    currentImage, currentName, 
    onSave, onCancel 
}) => {
  const [name, setName] = useState(currentName);
  const [previewImage, setPreviewImage] = useState<string>(currentImage);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 border-2 border-purple-500 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-purple-900/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-rpg font-bold text-white flex items-center gap-2">
            <User className="text-purple-400" /> Character Profile
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative w-40 h-40 rounded-full border-4 border-slate-700 group bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
             <div className="w-full h-full rounded-full overflow-hidden">
                <img 
                    src={previewImage || "https://picsum.photos/200"} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover pixel-art animate-idle"
                />
             </div>
             
             {/* Hover Overlay (Desktop) */}
             <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full z-10">
                <span className="text-xs font-bold flex flex-col items-center text-white">
                    <Upload size={20} className="mb-1" />
                    Upload Image
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
             </label>

             {/* Always Visible Mobile/Touch Button */}
             <label className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full border-4 border-slate-900 cursor-pointer shadow-lg z-30 transition-transform active:scale-95">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
             </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
            
          {/* Name Field */}
          <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Character Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={16} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-3 text-white focus:border-purple-500 outline-none font-bold placeholder:text-slate-600"
                  placeholder="Enter name..."
                />
              </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => onSave(previewImage, name)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/50 transform active:scale-95 mt-4"
          >
            Save Profile <Save size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
