import React, { useState } from 'react';
import {
  Send,
  Clock,
  Award,
  Play,
  CheckCircle2,
  Trash2,
  FileText,
  Calendar,
  Sparkles,
  TrendingUp,
  Brain,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ExamPaper, ExamAttempt } from '../types/exam';

interface HomeDashboardProps {
  papers: ExamPaper[];
  attempts: ExamAttempt[];
  onStartPaper: (paper: ExamPaper) => void;
  onOpenUploadModal: () => void;
  onViewAttemptResult: (attempt: ExamAttempt, paper: ExamPaper) => void;
  onDeletePaper: (paperId: string) => void;
  onGoToRevision: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  papers,
  attempts,
  onStartPaper,
  onOpenUploadModal,
  onViewAttemptResult,
  onDeletePaper,
  onGoToRevision,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Stats calculation
  const totalTestsAttempted = attempts.length;
  const avgScorePct =
    totalTestsAttempted > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalTestsAttempted)
      : 0;
  const totalQuestionsPracticed = attempts.reduce((sum, a) => sum + a.attemptedCount, 0);

  const examTypes = ['all', ...Array.from(new Set(papers.map((p) => p.examType)))];

  const filteredPapers = papers.filter((p) => {
    if (selectedFilter === 'all') return true;
    return p.examType === selectedFilter;
  });

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6 pb-24">
      {/* Hero Welcome & Primary Action */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Student Exam Preparation Suite
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Offline Ready
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Turn Telegram Question Papers into Real Timed CBT Tests
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Upload mock tests & PDF papers from Telegram channels for free with solutions. Practice in an authentic time-bounded Computer-Based Test environment and review solutions offline during revision sessions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition"
            >
              <Send className="w-4 h-4" />
              <span>Upload Telegram Paper</span>
            </button>
            <button
              onClick={onGoToRevision}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs md:text-sm border border-slate-700 transition"
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>Revision Deck</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tests Taken</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">{totalTestsAttempted}</div>
          <span className="text-[11px] text-slate-400">Total mock sessions</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg Score</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">{avgScorePct}%</div>
          <span className="text-[11px] text-slate-400">Overall accuracy</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Questions</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{totalQuestionsPracticed}</div>
          <span className="text-[11px] text-slate-400">Practiced & solved</span>
        </div>
      </div>

      {/* Available Exam Papers Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Your Question Papers in Cloud & Local Vault</h2>
            <p className="text-xs text-slate-400">Take timed tests and access anytime without internet</p>
          </div>

          {/* Exam Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {examTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
                  selectedFilter === type
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Exams' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-md group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-900 text-indigo-300 font-bold text-[11px]">
                    {paper.examType}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Offline Cached
                    </span>
                    {paper.source === 'telegram_upload' && (
                      <button
                        onClick={() => onDeletePaper(paper.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Paper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                  {paper.title}
                </h3>
                {paper.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{paper.description}</p>
                )}

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {paper.durationMinutes} Mins
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    {paper.questions.length} Questions
                  </span>
                  <span>·</span>
                  <span className="text-slate-300 font-mono">
                    +{paper.positiveMark} / -{paper.negativeMark}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Sections:</span>
                  <span className="text-slate-300 font-medium">{paper.sections.join(', ')}</span>
                </div>

                <button
                  onClick={() => onStartPaper(paper)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Test</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Attempts History */}
      {attempts.length > 0 && (
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Test Attempts & Solutions</h2>
            <span className="text-xs text-slate-400">{attempts.length} Finished</span>
          </div>

          <div className="space-y-2.5">
            {attempts.slice(0, 5).map((att) => {
              const matchedPaper = papers.find((p) => p.id === att.paperId);
              return (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-indigo-400">{att.examType}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(att.startTime).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate max-w-sm">
                      {att.paperTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Score Tag */}
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        {att.score} / {att.maxMarks}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {att.correctCount} Correct · {att.incorrectCount} Wrong
                      </div>
                    </div>

                    {matchedPaper && (
                      <button
                        onClick={() => onViewAttemptResult(att, matchedPaper)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
