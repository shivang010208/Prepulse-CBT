import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Bookmark,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Brain,
  Globe,
  ExternalLink,
  Loader2,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { QuestionBookmark, ExamPaper, ExamQuestion } from '../types/exam';
import { StorageService } from '../services/storageService';
import { sanitizeQuestionOptions } from '../utils/optionSanitizer';
import { SolutionRenderer } from './SolutionRenderer';

interface RevisionVaultViewProps {
  papers: ExamPaper[];
  onStartPaper: (paper: ExamPaper) => void;
}

interface StoredAnalysis {
  solution: string;
  sources?: { title: string; url: string }[];
  googleSearchUrl?: string;
  analyzedAt: string;
}

const REVISION_ANALYSIS_STORAGE_KEY = 'preppulse_revision_analyses_v1';

export const RevisionVaultView: React.FC<RevisionVaultViewProps> = ({ papers, onStartPaper }) => {
  const [bookmarks, setBookmarks] = useState<QuestionBookmark[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  
  // AI In-Depth Analyses per question ID
  const [analyses, setAnalyses] = useState<Record<string, StoredAnalysis>>(() => {
    try {
      const saved = localStorage.getItem(REVISION_ANALYSIS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  const [analyzingMap, setAnalyzingMap] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  useEffect(() => {
    setBookmarks(StorageService.getBookmarks());
  }, []);

  // Save analyses to localStorage whenever updated
  const saveAnalysesToStorage = (updated: Record<string, StoredAnalysis>) => {
    try {
      localStorage.setItem(REVISION_ANALYSIS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to cache analyses:', e);
    }
  };

  const handleRemoveBookmark = (bmId: string, qNumber?: number) => {
    StorageService.removeBookmark(bmId);
    setBookmarks(StorageService.getBookmarks());
    setConfirmDeleteId(null);
    setDeleteToast(qNumber ? `Question ${qNumber} removed from Revision Deck` : 'Question removed');
    setTimeout(() => setDeleteToast(null), 2500);
  };

  const handleClearSubject = (subject: string) => {
    const toRemove = bookmarks.filter((b) => subject === 'all' || b.question.section === subject);
    toRemove.forEach((b) => StorageService.removeBookmark(b.id));
    setBookmarks(StorageService.getBookmarks());
    setDeleteToast(`Cleared ${toRemove.length} question(s)`);
    setTimeout(() => setDeleteToast(null), 2500);
  };

  const toggleReveal = (bmId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [bmId]: !prev[bmId],
    }));
  };

  // Perform AI & Google Search In-Depth Analysis with KaTeX Derivation
  const handleAnalyseQuestion = async (bmId: string, question: ExamQuestion, paperTitle: string) => {
    if (analyzingMap[bmId]) return;
    setAnalyzingMap((prev) => ({ ...prev, [bmId]: true }));

    // Automatically reveal the solution card to view analysis
    setRevealedSolutions((prev) => ({ ...prev, [bmId]: true }));

    try {
      const cleanOptions = sanitizeQuestionOptions(question.options);
      const res = await fetch('/api/search-google-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.text,
          options: cleanOptions,
          correctAnswer: question.correctOptionId,
          bookletExplanation: question.explanation,
          section: question.section,
          examType: 'Competitive Exam',
        }),
      });

      const data = await res.json();
      if (data.solution) {
        const newAnalysis: StoredAnalysis = {
          solution: data.solution,
          sources: data.sources || [],
          googleSearchUrl: data.googleSearchUrl,
          analyzedAt: new Date().toISOString(),
        };

        const updated = {
          ...analyses,
          [question.id]: newAnalysis,
        };
        setAnalyses(updated);
        saveAnalysesToStorage(updated);
      }
    } catch (err) {
      console.error('Failed to analyze question:', err);
    } finally {
      setAnalyzingMap((prev) => ({ ...prev, [bmId]: false }));
    }
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
              Revision Deck & Tricky Questions
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Saved questions from mock tests and Telegram papers. Review step-by-step KaTeX derivations, or generate deep AI analyses for tricky concepts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {bookmarks.length} In Deck
            </span>
          </div>
        </div>
      </div>

      {/* Subject Filter Bar and Bulk Actions */}
      {bookmarks.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Filter:</span>
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedSubject === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({bookmarks.length})
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

          {filteredBookmarks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove all ${filteredBookmarks.length} question(s) in this filter from your Revision Deck?`)) {
                  handleClearSubject(selectedSubject);
                }
              }}
              className="self-end sm:self-auto text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-slate-800/80"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Filtered ({filteredBookmarks.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {deleteToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{deleteToast}</span>
        </div>
      )}

      {/* Bookmarked Questions List */}
      {filteredBookmarks.length > 0 ? (
        <div className="space-y-5">
          {filteredBookmarks.map((bm) => {
            const q = bm.question;
            const isRevealed = revealedSolutions[bm.id] || false;
            const analysis = analyses[q.id];
            const isAnalyzing = analyzingMap[bm.id] || false;
            const isConfirmingDelete = confirmDeleteId === bm.id;

            return (
              <div
                key={bm.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden transition"
              >
                {/* Header */}
                <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/60">
                        {q.section}
                      </span>
                      <span className="text-xs text-slate-400 truncate max-w-xs">{bm.paperTitle}</span>
                    </div>
                  </div>

                  {/* Actions: Reveal Solution, Analyse with AI, Remove */}
                  <div className="flex items-center gap-2">
                    {/* Toggle Solution Reveal */}
                    <button
                      type="button"
                      onClick={() => toggleReveal(bm.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Hide Solution' : 'Reveal Solution'}</span>
                    </button>

                    {/* Analyse Question Action */}
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => handleAnalyseQuestion(bm.id, q, bm.paperTitle)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                        analysis
                          ? 'bg-cyan-950/80 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/90'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                      title="Generate in-depth step-by-step mathematical derivation & trap analysis"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{analysis ? 'Re-analyse' : 'Analyse Question'}</span>
                        </>
                      )}
                    </button>

                    {/* Delete Question with Safety Confirmation */}
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-800/80 rounded-lg p-1 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => handleRemoveBookmark(bm.id, q.questionNumber)}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded text-slate-300 hover:text-white text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(bm.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Remove from Revision Deck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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

                  {/* Loading Indicator for Ongoing Analysis */}
                  {isAnalyzing && (
                    <div className="mt-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-center gap-2.5 text-xs text-indigo-300 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Searching academic sources & deriving university-level KaTeX solution...</span>
                    </div>
                  )}

                  {/* In-Depth AI & Google Search Analysis Card */}
                  {analysis && (
                    <div className="mt-4 rounded-xl bg-slate-950/90 border border-cyan-900/50 p-4 space-y-3 shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span>In-Depth Academic Derivation & Trap Analysis</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          {analysis.googleSearchUrl && (
                            <a
                              href={analysis.googleSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                            >
                              <span>Google Search Results</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            disabled={isAnalyzing}
                            onClick={() => handleAnalyseQuestion(bm.id, q, bm.paperTitle)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Refresh</span>
                          </button>
                        </div>
                      </div>

                      {/* Rendered Mathematical Content */}
                      <SolutionRenderer content={analysis.solution} />

                      {/* Sources */}
                      {analysis.sources && analysis.sources.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Academic & Search References:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.sources.slice(0, 3).map((source, sIdx) => (
                              <a
                                key={sIdx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 text-[11px] text-cyan-300 border border-cyan-900/30 truncate max-w-xs"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{source.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Revealed Booklet Solution Card */}
                  {isRevealed && !analysis && (
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
            During any CBT mock test, click the <strong className="text-amber-400">"Save to Revision"</strong> button in the bottom bar to send tricky questions directly to this deck.
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
