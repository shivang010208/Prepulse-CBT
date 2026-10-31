import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Share2,
  RotateCcw,
  BookOpen,
  Check,
  Tag,
  GraduationCap,
  Globe,
  Search,
  ExternalLink,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ExamAttempt, ExamPaper, ExamQuestion } from '../types/exam';
import { StorageService } from '../services/storageService';
import { sanitizeQuestionOptions } from '../utils/optionSanitizer';
import { SolutionRenderer } from './SolutionRenderer';

interface ExamResultViewProps {
  attempt: ExamAttempt;
  paper: ExamPaper;
  onRetake: () => void;
  onGoToRevision: () => void;
  onBackToDashboard: () => void;
}

interface GoogleSolutionData {
  solution: string;
  sources: { title: string; url: string }[];
  searchQueries: string[];
  googleSearchUrl?: string;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  paper,
  onRetake,
  onGoToRevision,
  onBackToDashboard,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'incorrect' | 'correct' | 'unattempted'>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState<boolean>(true);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    paper.questions.forEach((q) => {
      map[q.id] = StorageService.isBookmarked(q.id);
    });
    return map;
  });

  // Google Search Grounded Detailed Solutions State
  const [googleSolutions, setGoogleSolutions] = useState<Record<string, GoogleSolutionData>>({});
  const [searchingMap, setSearchingMap] = useState<Record<string, boolean>>({});
  const [batchSearching, setBatchSearching] = useState(false);

  const toggleExpandSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [qId]: !(prev[qId] ?? allExpanded),
    }));
  };

  const handleToggleAllSolutions = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const map: Record<string, boolean> = {};
    paper.questions.forEach((q) => {
      map[q.id] = nextState;
    });
    setExpandedSolutions(map);
  };

  const handleToggleBookmark = (question: ExamQuestion) => {
    const newState = StorageService.toggleBookmark(paper.id, question, paper.title);
    setBookmarkedMap((prev) => ({
      ...prev,
      [question.id]: newState,
    }));
  };

  // Search Google Engine & Generate Detailed Solution via Google AI
  const handleSearchGoogleSolution = async (question: ExamQuestion) => {
    if (searchingMap[question.id]) return;
    setSearchingMap((prev) => ({ ...prev, [question.id]: true }));

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
          examType: paper.examType,
        }),
      });

      const data = await res.json();
      if (data.solution) {
        setGoogleSolutions((prev) => ({
          ...prev,
          [question.id]: {
            solution: data.solution,
            sources: data.sources || [],
            searchQueries: data.searchQueries || [],
            googleSearchUrl: data.googleSearchUrl,
          },
        }));
      }
    } catch (e) {
      console.error('Failed to search google solution:', e);
    } finally {
      setSearchingMap((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  // Search all incorrect questions on Google Engine with Google AI
  const handleBatchSearchIncorrect = async () => {
    const incorrectQs = paper.questions.filter((q) => {
      const answerState = attempt.answers[q.id];
      const selected = answerState?.selectedOptionId;
      return selected && selected.toUpperCase() !== q.correctOptionId.toUpperCase();
    });

    if (incorrectQs.length === 0 || batchSearching) return;
    setBatchSearching(true);

    for (const q of incorrectQs) {
      if (!googleSolutions[q.id]) {
        await handleSearchGoogleSolution(q);
      }
    }

    setBatchSearching(false);
  };

  // Filtered Questions
  const filteredQuestions = paper.questions.filter((q) => {
    const answerState = attempt.answers[q.id];
    const selected = answerState?.selectedOptionId;
    if (activeFilter === 'correct') {
      return selected && selected.toUpperCase() === q.correctOptionId.toUpperCase();
    }
    if (activeFilter === 'incorrect') {
      return selected && selected.toUpperCase() !== q.correctOptionId.toUpperCase();
    }
    if (activeFilter === 'unattempted') {
      return !selected;
    }
    return true;
  });

  // Calculate percentage and format time
  const percentage = Math.max(0, Math.round((attempt.score / (paper.totalMarks || 1)) * 100));
  const minutesTaken = Math.floor(attempt.timeTakenSeconds / 60);
  const secondsTaken = attempt.timeTakenSeconds % 60;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Exam Submission & Performance Report
            </span>
            <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
              {paper.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retake Exam</span>
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Scorecard Summary Hero Card */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 p-5 sm:p-7 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Score Radial / Big Stat */}
            <div className="flex items-center gap-4 md:col-span-1 border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0 md:pr-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-600/20 border-2 border-indigo-500/40 flex flex-col items-center justify-center text-center shrink-0">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
                  {attempt.score}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  / {paper.totalMarks} Marks
                </span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 mb-1">
                  <Award className="w-3 h-3" />
                  Score: {percentage}%
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {percentage >= 75
                    ? 'Excellent Rank!'
                    : percentage >= 50
                    ? 'Good Performance!'
                    : 'Revision Required'}
                </h2>
                <p className="text-xs text-slate-400">
                  Time: {minutesTaken}m {secondsTaken}s
                </p>
              </div>
            </div>

            {/* Quick Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 md:col-span-3">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-900/50">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Correct</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
                  {attempt.correctCount}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-0.5">
                  +{attempt.correctCount * paper.positiveMark} Marks
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/50">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Incorrect</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-rose-300">
                  {attempt.incorrectCount}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-0.5">
                  -{attempt.incorrectCount * paper.negativeMark} Negative
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Skipped</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-300">
                  {attempt.unattemptedCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">0 Marks</div>
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Exam completed on {new Date(attempt.endTime).toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToRevision}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 font-semibold transition"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open Revision Vault</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section & Question Review Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                Question-by-Question Analysis & Solutions
              </h3>
              <p className="text-xs text-slate-400">
                Review your selected choices alongside the step-by-step derivations and official answer keys.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchSearchIncorrect}
                disabled={batchSearching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-cyan-300 border border-indigo-700/40 text-xs font-semibold transition disabled:opacity-50"
              >
                {batchSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching Google AI...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Search Incorrect on Google AI</span>
                  </>
                )}
              </button>
              <button
                onClick={handleToggleAllSolutions}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition"
              >
                {allExpanded ? 'Collapse All Solutions' : 'Expand All Solutions'}
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Questions ({paper.questions.length})
            </button>
            <button
              onClick={() => setActiveFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'incorrect'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Incorrect ({attempt.incorrectCount})
            </button>
            <button
              onClick={() => setActiveFilter('correct')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Correct ({attempt.correctCount})
            </button>
            <button
              onClick={() => setActiveFilter('unattempted')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeFilter === 'unattempted'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Skipped ({attempt.unattemptedCount})
            </button>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const answerState = attempt.answers[q.id];
              const selectedOption = answerState?.selectedOptionId;
              const isCorrect = selectedOption && selectedOption.toUpperCase() === q.correctOptionId.toUpperCase();
              const isWrong = selectedOption && selectedOption.toUpperCase() !== q.correctOptionId.toUpperCase();
              const isUnattempted = !selectedOption;
              const isExpanded = expandedSolutions[q.id] ?? allExpanded;
              const isBookmarked = bookmarkedMap[q.id] || false;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isCorrect
                      ? 'bg-slate-900/90 border-emerald-900/50'
                      : isWrong
                      ? 'bg-slate-900/90 border-rose-900/50'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  {/* Question Card Top Bar */}
                  <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">Q{q.questionNumber}.</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-semibold border border-slate-700">
                        {q.section}
                      </span>
                      {q.topic && (
                        <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-500" />
                          {q.topic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Tag */}
                      {isCorrect && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct (+{paper.positiveMark})
                        </span>
                      )}
                      {isWrong && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 text-xs font-semibold border border-rose-800/60">
                          <XCircle className="w-3.5 h-3.5" />
                          Incorrect (-{paper.negativeMark})
                        </span>
                      )}
                      {isUnattempted && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
                          Unattempted (0)
                        </span>
                      )}

                      {/* Bookmark Toggle */}
                      <button
                        onClick={() => handleToggleBookmark(q)}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                        className={`p-1.5 rounded-lg border transition ${
                          isBookmarked
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      {/* Expand / Collapse Button */}
                      <button
                        onClick={() => toggleExpandSolution(q.id)}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
                        title={isExpanded ? 'Hide Solution' : 'Show Solution'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <p className="text-sm font-medium text-slate-100 leading-relaxed">
                      {q.text}
                    </p>

                    {/* Diagram / Schematic rendering */}
                    {(q.diagramSvg || q.diagramUrl || q.diagramDescription) && (
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-2.5 max-w-xl">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Question Diagram</span>
                        </div>

                        {q.diagramSvg && (
                          <div
                            className="p-2 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-center overflow-x-auto"
                            dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                          />
                        )}

                        {q.diagramUrl && (
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center">
                            <img
                              src={q.diagramUrl}
                              alt="Question Diagram"
                              className="rounded-lg max-h-48 object-contain"
                            />
                          </div>
                        )}

                        {q.diagramDescription && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            <strong className="text-cyan-300">Context: </strong>
                            {q.diagramDescription}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sanitizeQuestionOptions(q.options).map((opt) => {
                        const isThisCorrect = opt.id.toUpperCase() === q.correctOptionId.toUpperCase();
                        const isThisStudentChoice = selectedOption && selectedOption.toUpperCase() === opt.id.toUpperCase();

                        let optClasses = 'border-slate-800 bg-slate-950/60 text-slate-300';
                        if (isThisCorrect) {
                          optClasses = 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold';
                        } else if (isThisStudentChoice && !isThisCorrect) {
                          optClasses = 'border-rose-500/60 bg-rose-950/40 text-rose-200';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition ${optClasses}`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isThisCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : isThisStudentChoice
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {opt.id}
                            </span>
                            <div className="flex-1 leading-snug">
                              <span>{opt.text}</span>
                              {isThisCorrect && (
                                <span className="block text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Correct Answer
                                </span>
                              )}
                              {isThisStudentChoice && !isThisCorrect && (
                                <span className="block text-[11px] text-rose-400 font-bold mt-1">
                                  ✗ Your Marked Choice
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dedicated Step-by-Step Solution Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                        <div className="rounded-2xl bg-indigo-950/25 border border-indigo-900/50 p-4 space-y-3">
                          {/* Solution Header Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/40 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide">
                                Step-by-Step Solution & Derivation
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-700/60">
                                Correct: Option ({q.correctOptionId})
                              </span>
                              {isWrong && selectedOption && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-700/60">
                                  Marked: Option ({selectedOption})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Derivation Content */}
                          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                            <SolutionRenderer content={q.explanation} />
                          </div>

                          {/* Google Search Grounded Detailed AI Solution Section */}
                          <div className="pt-1">
                            {!googleSolutions[q.id] && !searchingMap[q.id] ? (
                              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Need a More Detailed Google AI Derivation?</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Search the Google engine for complete textbook derivations, coaching notes, and exhaustive step-by-step calculations.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={`https://www.google.com/search?q=${encodeURIComponent(q.text + ' ' + (q.section || '') + ' question solution')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                                  >
                                    <span>Google Search</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                  <button
                                    type="button"
                                    disabled={searchingMap[q.id]}
                                    onClick={() => handleSearchGoogleSolution(q)}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition active:scale-95"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Search Google with AI</span>
                                  </button>
                                </div>
                              </div>
                            ) : searchingMap[q.id] ? (
                              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-center gap-2.5 text-xs text-indigo-300 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                <span>Searching Google engine for academic derivations & compiling in-depth Google AI solution...</span>
                              </div>
                            ) : (
                              <div className="rounded-xl bg-slate-900/90 border border-cyan-900/50 p-4 space-y-3 shadow-md">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                                    <Globe className="w-4 h-4 text-cyan-400" />
                                    <span>Google AI Grounded In-Depth Solution</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs">
                                    <a
                                      href={googleSolutions[q.id].googleSearchUrl || `https://www.google.com/search?q=${encodeURIComponent(q.text + ' solution')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                                    >
                                      <span>Google Search Results</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleSearchGoogleSolution(q)}
                                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>Re-search</span>
                                    </button>
                                  </div>
                                </div>

                                <SolutionRenderer content={googleSolutions[q.id].solution} />

                                {googleSolutions[q.id].sources && googleSolutions[q.id].sources.length > 0 && (
                                  <div className="pt-2 border-t border-slate-800/80">
                                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                      Google Search Grounded Academic References:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {googleSolutions[q.id].sources.slice(0, 4).map((source, sIdx) => (
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
                          </div>

                          {/* Solution Meta & Topic Tags */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                            <div className="flex items-center gap-3">
                              <span>
                                <strong className="text-slate-300">Subject:</strong> {q.section}
                              </span>
                              {q.topic && (
                                <span>
                                  <strong className="text-slate-300">Topic:</strong> {q.topic}
                                </span>
                              )}
                              {q.difficulty && (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                  {q.difficulty}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleBookmark(q)}
                              className="text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
                            >
                              <Bookmark className="w-3 h-3" />
                              {isBookmarked ? 'Saved in Revision Vault' : 'Save for Revision'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
