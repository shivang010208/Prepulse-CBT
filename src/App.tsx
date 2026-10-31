import React, { useState, useEffect } from 'react';
import {
  Layers,
  Send,
  BookOpen,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  Home,
  CheckCircle,
  Wifi,
  WifiOff,
  History,
  Brain,
} from 'lucide-react';
import { ExamPaper, ExamAttempt } from './types/exam';
import { StorageService } from './services/storageService';
import { HomeDashboard } from './components/HomeDashboard';
import { CBTTestView } from './components/CBTTestView';
import { ExamResultView } from './components/ExamResultView';
import { RevisionVaultView } from './components/RevisionVaultView';
import { PaperUploaderModal } from './components/PaperUploaderModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useOnlineStatus } from './hooks/useOnlineStatus';

type ActiveTab = 'dashboard' | 'revision' | 'history';

export default function App() {
  const isOnline = useOnlineStatus();
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Active Flow states
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load from local storage / cloud cache
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const loadedPapers = StorageService.getPapers();
    const loadedAttempts = StorageService.getAttempts();
    setPapers(loadedPapers);
    setAttempts(loadedAttempts);
  };

  const handleStartPaper = (paper: ExamPaper) => {
    setActivePaper(paper);
    setIsTestRunning(true);
  };

  const handleFinishTest = (attempt: ExamAttempt) => {
    setIsTestRunning(false);
    setActiveAttempt(attempt);
    refreshData();
  };

  const handleExitTestWithoutSaving = () => {
    if (window.confirm('Are you sure you want to exit? Your progress in this test will not be saved.')) {
      setIsTestRunning(false);
      setActivePaper(null);
    }
  };

  const handleViewAttemptResult = (attempt: ExamAttempt, paper: ExamPaper) => {
    setActiveAttempt(attempt);
    setActivePaper(paper);
  };

  const handleDeletePaper = (paperId: string) => {
    if (window.confirm('Delete this question paper from your local storage?')) {
      StorageService.deletePaper(paperId);
      refreshData();
    }
  };

  const handlePaperCreated = (newPaper: ExamPaper) => {
    refreshData();
    // Offer to immediately start test
    setActivePaper(newPaper);
    setIsTestRunning(true);
  };

  // If student is currently taking a timed test, render fullscreen CBT portal
  if (isTestRunning && activePaper) {
    return (
      <CBTTestView
        paper={activePaper}
        onFinishTest={handleFinishTest}
        onExitWithoutSaving={handleExitTestWithoutSaving}
      />
    );
  }

  // If student is reviewing post-exam analytics and solutions
  if (activeAttempt && activePaper) {
    return (
      <ExamResultView
        attempt={activeAttempt}
        paper={activePaper}
        onRetake={() => {
          setActiveAttempt(null);
          setIsTestRunning(true);
        }}
        onGoToRevision={() => {
          setActiveAttempt(null);
          setActivePaper(null);
          setActiveTab('revision');
        }}
        onBackToDashboard={() => {
          setActiveAttempt(null);
          setActivePaper(null);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Bar Contract (Wordmark - Navigation - Action/Install) */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30 text-sm">
            PP
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-white">
            PrepPulse CBT
          </span>
        </div>

        {/* Zone 2: Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition hover:text-white ${activeTab === 'dashboard' ? 'text-white' : ''}`}
          >
            Exam Papers ({papers.length})
          </button>
          <button
            onClick={() => setActiveTab('revision')}
            className={`transition hover:text-white ${activeTab === 'revision' ? 'text-white' : ''}`}
          >
            Offline Revision Deck
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`transition hover:text-white ${activeTab === 'history' ? 'text-white' : ''}`}
          >
            Test History ({attempts.length})
          </button>
        </nav>

        {/* Zone 3: Actions & PWA Install */}
        <div className="flex items-center gap-2">
          {/* Online/Offline status pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                : 'bg-amber-950/60 border-amber-800/80 text-amber-400'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{isOnline ? 'Cloud Synced' : 'Offline Mode'}</span>
          </div>

          <PWAInstallButton />

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Paper</span>
          </button>
        </div>
      </header>

      {/* Main View Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'dashboard' && (
          <HomeDashboard
            papers={papers}
            attempts={attempts}
            onStartPaper={handleStartPaper}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onViewAttemptResult={handleViewAttemptResult}
            onDeletePaper={handleDeletePaper}
            onGoToRevision={() => setActiveTab('revision')}
          />
        )}

        {activeTab === 'revision' && (
          <RevisionVaultView papers={papers} onStartPaper={handleStartPaper} />
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-4 pb-24">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h1 className="text-base font-bold text-white">Full Mock Test History</h1>
              <span className="text-xs text-slate-400">{attempts.length} Finished Tests</span>
            </div>

            {attempts.length > 0 ? (
              <div className="space-y-3">
                {attempts.map((att) => {
                  const matched = papers.find((p) => p.id === att.paperId);
                  return (
                    <div
                      key={att.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
                          <span>{att.examType}</span>
                          <span>·</span>
                          <span className="text-slate-400 font-normal">
                            {new Date(att.startTime).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{att.paperTitle}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Completed in {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s · {att.attemptedCount} attempted
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="text-base font-black font-mono text-emerald-400">
                            {att.score} / {att.maxMarks}
                          </div>
                          <span className="text-[10px] text-slate-400">{att.percentage}% Score</span>
                        </div>
                        {matched && (
                          <button
                            onClick={() => handleViewAttemptResult(att, matched)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                          >
                            Review Solutions
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No past mock test attempts recorded yet.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Telegram Paper Upload Modal */}
      <PaperUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPaperCreated={handlePaperCreated}
      />

      {/* Global Offline Status Indicator */}
      <OfflineIndicator />

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from 10_mobile_touch_apps.md) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden">
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition ${
              activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Mock Papers</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-slate-400 hover:text-white transition"
          >
            <Send className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] tracking-tight mt-1">Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition ${
              activeTab === 'revision' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Revision</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition ${
              activeTab === 'history' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Attempts</span>
          </button>
        </div>
      </div>
    </div>
  );
}
