
import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, AlertCircle, X, FileText, CheckCircle2, Ban } from 'lucide-react';
import { fetchChallengeFileSize } from '../services/challengeService';

interface ChallengeDownloadModalProps {
  skillName: string;
  url: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ChallengeDownloadModal: React.FC<ChallengeDownloadModalProps> = ({ skillName, url, onConfirm, onCancel }) => {
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
        if (!navigator.onLine) {
            setIsOnline(false);
            setChecking(false);
            return;
        }
        
        const size = await fetchChallengeFileSize(url);
        setFileSize(size);
        setChecking(false);
    };
    check();
  }, [url]);

  const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isUnavailable = !checking && fileSize === null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in zoom-in-95" onClick={onCancel}>
        <div 
            className="bg-slate-900 border-2 border-blue-500 rounded-2xl w-full max-w-sm p-6 relative shadow-[0_0_50px_rgba(59,130,246,0.2)]"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X size={24} />
            </button>

            <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${isUnavailable ? 'bg-red-900/10 border-red-500/50' : 'bg-blue-900/10 border-blue-500/50'}`}>
                    {isUnavailable ? <Ban className="text-red-500" size={40} /> : <Download className="text-blue-500" size={40} />}
                </div>
                <h2 className="text-xl font-rpg font-bold text-white uppercase tracking-wider">Download Data</h2>
                <p className="text-slate-400 text-xs mt-1">Expansion required for {skillName}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase font-bold">Status</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isOnline ? <Wifi size={14}/> : <WifiOff size={14}/>} {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-bold">File Size</span>
                    <span className={`text-xs font-mono font-bold ${isUnavailable ? 'text-red-400' : 'text-white'}`}>
                        {checking ? 'Checking...' : fileSize !== null ? formatBytes(fileSize) : 'Unavailable'}
                    </span>
                </div>
            </div>

            <div className="mb-6 text-xs text-slate-400 text-center leading-relaxed">
                {isOnline ? (
                    isUnavailable ? (
                        <p className="text-red-400">Content for this challenge is currently unavailable or still in development. Please check back later.</p>
                    ) : (
                        <p>Access the Great Archive to download the latest challenges for this skill. This allows offline play later.</p>
                    )
                ) : (
                    <p className="text-red-400">You must be connected to the internet to initialize this skill's challenge data.</p>
                )}
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-xs uppercase"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    disabled={!isOnline || checking || isUnavailable}
                    className={`flex-1 py-3 font-bold rounded-lg transition-colors text-xs uppercase shadow-lg flex items-center justify-center gap-2 ${!isOnline || isUnavailable ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}`}
                >
                    {isUnavailable ? <><Ban size={14}/> Unavailable</> : <><Download size={14}/> Download</>}
                </button>
            </div>
        </div>
    </div>
  );
};
