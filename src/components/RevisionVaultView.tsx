import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Bookmark,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  Sparkles,
  ArrowRight,
  Brain,
  Wifi,
  ChevronRight,
} from 'lucide-react';
import { QuestionBookmark, ExamPaper } from '../types/exam';
import { StorageService } from '../services/storageService';
import { sanitizeQuestionOptions } from '../utils/optionSanitizer';
import { SolutionRenderer } from './SolutionRenderer';

interface RevisionVaultViewProps {
  papers: ExamPaper[];
  onStartPaper: (paper: ExamPaper) => void;
}

export const RevisionVaultView: React.FC<RevisionVaultViewProps> = ({ papers, onStartPaper }) => {
  const [bookmarks, setBookmarks] = useState<QuestionBookmark[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [activePracticeIndex, setActivePracticeIndex] = useState<number | null>(null);

  useEffect(() => {
    setBookmarks(StorageService.getBookmarks());
  }, []);

  const handleRemoveBookmark = (bmId: string) => {
    StorageService.removeBookmark(bmId);
    setBookmarks(StorageService.getBookmarks());
  };

  const toggleReveal = (bmId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [bmId]: !prev[bmId],
    }));
  };

  const allSubjects = Array.from(
    new Set(bookmarks.map((b) => b.question.section || 'General'))
  );

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedSubject === 'all') return true;
    return b.question.section === selectedSubject;
  });

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>Offline Revision Sessions</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Personalized Weak Areas & Bookmarks
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              All saved telegram papers and bookmarked tricky questions remain stored on your device for distraction-free revision, even in airplane mode.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {bookmarks.length} Saved in Vault
            </span>
          </div>
        </div>
      </div>

      {/* Subject Filter Bar */}
      {allSubjects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Filter Subject:</span>
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Subjects ({bookmarks.length})
          </button>
          {allSubjects.map((sub) => {
            const count = bookmarks.filter((b) => b.question.section === sub).length;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Bookmarked Questions List */}
      {filteredBookmarks.length > 0 ? (
        <div className="space-y-4">
          {filteredBookmarks.map((bm, idx) => {
            const q = bm.question;
            const isRevealed = revealedSolutions[bm.id] || false;

            return (
              <div
                key={bm.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden transition"
              >
                {/* Header */}
                <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/60">
                        {q.section}
                      </span>
                      <span className="text-xs text-slate-400 truncate max-w-xs">{bm.paperTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReveal(bm.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Hide Solution' : 'Reveal Solution'}</span>
                    </button>

                    <button
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Remove from revision"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">{q.text}</p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {sanitizeQuestionOptions(q.options).map((opt) => {
                      const isCorrect = isRevealed && opt.id.toUpperCase() === q.correctOptionId.toUpperCase();
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold ring-1 ring-emerald-500/40'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="flex-1 pt-0.5 leading-snug">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Revealed Solution Card */}
                  {isRevealed && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-2">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Correct Option: {q.correctOptionId}</span>
                      </div>
                      <SolutionRenderer content={q.explanation} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Questions Saved in Revision Deck Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Take a mock test or review your test analysis, and click the bookmark icon on questions you found tricky. They will appear here for fast offline revision.
          </p>
          {papers.length > 0 && (
            <button
              onClick={() => onStartPaper(papers[0])}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              <span>Take a Mock Test</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
