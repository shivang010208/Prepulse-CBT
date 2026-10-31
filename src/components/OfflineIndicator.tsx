import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-slate-950 px-4 py-2.5 text-xs font-semibold shadow-xl shadow-amber-500/20 backdrop-blur-md border border-amber-400 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
      <span>Offline Mode active — All test papers, revision notes & attempts are cached locally.</span>
    </div>
  );
};
