import React, { useState } from 'react';
import {
  Download,
  Share2,
  PlusSquare,
  X,
  Smartphone,
  Laptop,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If already installed and launched as standalone PWA
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
        <Check className="w-3 h-3 text-emerald-400" />
        <span>Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap min-h-[36px] cursor-pointer"
        title="Install PrepPulse CBT App directly on Mobile or Desktop"
      >
        <Download className="w-3.5 h-3.5 text-indigo-200" />
        <span>Install App</span>
      </button>

      {/* Universal PWA Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Install PrepPulse CBT</h3>
                  <p className="text-[11px] text-slate-400">100% Offline & Instant Exam Practice</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Instructions */}
            <div className="space-y-3 text-xs">
              {isIOS ? (
                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-indigo-300">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>iPhone / iPad (Safari)</span>
                  </div>
                  <div className="space-y-2 text-slate-300 pl-1">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-white shrink-0">1.</span>
                      <p>
                        Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />{' '}
                        <strong className="text-white">Share</strong> button in the Safari bottom bar.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-white shrink-0">2.</span>
                      <p>
                        Scroll down and tap{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />{' '}
                        <strong className="text-white">Add to Home Screen</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 font-semibold text-indigo-300">
                      <Smartphone className="w-4 h-4 text-indigo-400" />
                      <span>Android (Chrome / Samsung / Brave)</span>
                    </div>
                    <div className="space-y-2 text-slate-300 pl-1">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-white shrink-0">1.</span>
                        <p>
                          Tap the <strong className="text-white">⋮ (three dots)</strong> menu in the top-right corner of Chrome.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-white shrink-0">2.</span>
                        <p>
                          Tap <strong className="text-white">Install App</strong> or{' '}
                          <strong className="text-white">Add to Home screen</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 font-semibold text-indigo-300">
                      <Laptop className="w-4 h-4 text-indigo-400" />
                      <span>Desktop (Chrome / Edge / Windows / Mac)</span>
                    </div>
                    <p className="text-slate-300 pl-1 leading-relaxed">
                      Click the <Download className="w-3.5 h-3.5 inline mx-1 text-indigo-400" />{' '}
                      <strong className="text-white">Install icon</strong> inside your browser URL address bar to launch it as a full-screen desktop test app.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Share / Copy Link for classmates */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Share with classmates:</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy App URL</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white transition active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
