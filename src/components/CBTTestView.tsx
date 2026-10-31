import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  PenTool,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  RotateCcw,
  Grid,
  X,
  Sparkles,
} from 'lucide-react';
import { ExamPaper, ExamAttempt, QuestionAttemptState } from '../types/exam';
import { StorageService } from '../services/storageService';
import { ScratchpadModal } from './ScratchpadModal';
import { sanitizeQuestionOptions } from '../utils/optionSanitizer';

interface CBTTestViewProps {
  paper: ExamPaper;
  onFinishTest: (attempt: ExamAttempt) => void;
  onExitWithoutSaving: () => void;
}

export const CBTTestView: React.FC<CBTTestViewProps> = ({
  paper,
  onFinishTest,
  onExitWithoutSaving,
}) => {
  // Timer State
  const totalSeconds = paper.durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [startTime] = useState(new Date().toISOString());

  // Navigation State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState<string>(
    paper.sections[0] || 'General'
  );

  // Question Attempt States: keyed by question ID
  const [attemptStates, setAttemptStates] = useState<Record<string, QuestionAttemptState>>(() => {
    const initial: Record<string, QuestionAttemptState> = {};
    paper.questions.forEach((q, idx) => {
      initial[q.id] = {
        selectedOptionId: null,
        status: idx === 0 ? 'not_answered' : 'not_visited',
        timeSpentSeconds: 0,
      };
    });
    return initial;
  });

  // Track time spent per question
  const questionStartTimeRef = useRef<number>(Date.now());

  // Tools state
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Bookmark / Revision Deck sync state
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    const existing = StorageService.getBookmarks();
    existing.forEach((b) => {
      map[b.questionId] = true;
    });
    return map;
  });
  const [bookmarkToast, setBookmarkToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const currentQuestion = paper.questions[currentQuestionIndex];

  // Tick down timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Accumulate time on question change
  const recordQuestionTime = () => {
    if (!currentQuestion) return;
    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();

    setAttemptStates((prev) => {
      const existing = prev[currentQuestion.id] || {
        selectedOptionId: null,
        status: 'not_visited',
        timeSpentSeconds: 0,
      };
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          timeSpentSeconds: existing.timeSpentSeconds + elapsed,
        },
      };
    });
  };

  const handleSelectOption = (optionId: string) => {
    setAttemptStates((prev) => {
      const current = prev[currentQuestion.id] || {
        selectedOptionId: null,
        status: 'not_answered',
        timeSpentSeconds: 0,
      };
      // Toggle if clicked same
      const newOption = current.selectedOptionId === optionId ? null : optionId;
      return {
        ...prev,
        [currentQuestion.id]: {
          ...current,
          selectedOptionId: newOption,
          status: newOption ? 'answered' : 'not_answered',
        },
      };
    });
  };

  const handleClearResponse = () => {
    setAttemptStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionId: null,
        status: 'not_answered',
      },
    }));
  };

  const handleMarkForReviewAndNext = () => {
    recordQuestionTime();
    setAttemptStates((prev) => {
      const current = prev[currentQuestion.id];
      const hasAnswer = Boolean(current.selectedOptionId);
      return {
        ...prev,
        [currentQuestion.id]: {
          ...current,
          status: hasAnswer ? 'answered_marked' : 'marked',
        },
      };
    });

    goToNextQuestion();
  };

  const handleSaveAndNext = () => {
    recordQuestionTime();
    setAttemptStates((prev) => {
      const current = prev[currentQuestion.id];
      return {
        ...prev,
        [currentQuestion.id]: {
          ...current,
          status: current.selectedOptionId ? 'answered' : 'not_answered',
        },
      };
    });

    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < paper.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const nextQ = paper.questions[nextIdx];
      setSelectedSection(nextQ.section);

      // mark next as not_answered if it was not_visited
      setAttemptStates((prev) => {
        const nextState = prev[nextQ.id];
        if (nextState?.status === 'not_visited') {
          return {
            ...prev,
            [nextQ.id]: { ...nextState, status: 'not_answered' },
          };
        }
        return prev;
      });
    }
  };

  const goToPrevQuestion = () => {
    recordQuestionTime();
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      const prevQ = paper.questions[prevIdx];
      setSelectedSection(prevQ.section);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    recordQuestionTime();
    setCurrentQuestionIndex(index);
    const targetQ = paper.questions[index];
    setSelectedSection(targetQ.section);

    setAttemptStates((prev) => {
      const state = prev[targetQ.id];
      if (state?.status === 'not_visited') {
        return {
          ...prev,
          [targetQ.id]: { ...state, status: 'not_answered' },
        };
      }
      return prev;
    });

    setShowPaletteDrawer(false);
  };

  const handleToggleRevisionDeck = () => {
    if (!currentQuestion) return;
    const isNowSaved = StorageService.toggleBookmark(paper.id, currentQuestion, paper.title);
    setBookmarkedMap((prev) => ({
      ...prev,
      [currentQuestion.id]: isNowSaved,
    }));

    setBookmarkToast({
      message: isNowSaved
        ? `Question ${currentQuestion.questionNumber} added to Revision Deck`
        : `Question ${currentQuestion.questionNumber} removed from Revision Deck`,
      visible: true,
    });

    setTimeout(() => {
      setBookmarkToast((prev) => ({ ...prev, visible: false }));
    }, 2200);
  };

  // Submit test calculations
  const calculateResultAndSubmit = () => {
    recordQuestionTime();

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalScore = 0;

    const sectionScores: Record<
      string,
      { score: number; maxScore: number; attempted: number; correct: number; incorrect: number }
    > = {};

    paper.sections.forEach((sec) => {
      sectionScores[sec] = { score: 0, maxScore: 0, attempted: 0, correct: 0, incorrect: 0 };
    });

    paper.questions.forEach((q) => {
      const state = attemptStates[q.id];
      const selected = state?.selectedOptionId;
      const sec = q.section || 'General';

      if (!sectionScores[sec]) {
        sectionScores[sec] = { score: 0, maxScore: 0, attempted: 0, correct: 0, incorrect: 0 };
      }
      sectionScores[sec].maxScore += paper.positiveMark;

      if (!selected) {
        unattemptedCount++;
      } else {
        sectionScores[sec].attempted++;
        if (selected.toUpperCase() === q.correctOptionId.toUpperCase()) {
          correctCount++;
          totalScore += paper.positiveMark;
          sectionScores[sec].score += paper.positiveMark;
          sectionScores[sec].correct++;
        } else {
          incorrectCount++;
          totalScore -= paper.negativeMark;
          sectionScores[sec].score -= paper.negativeMark;
          sectionScores[sec].incorrect++;
        }
      }
    });

    const timeTaken = totalSeconds - timeLeft;
    const maxMarks = paper.questions.length * paper.positiveMark;
    const percentage = maxMarks > 0 ? Math.round((Math.max(0, totalScore) / maxMarks) * 100) : 0;

    const finalAttempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      paperId: paper.id,
      paperTitle: paper.title,
      examType: paper.examType,
      startTime,
      endTime: new Date().toISOString(),
      timeTakenSeconds: timeTaken,
      totalQuestions: paper.questions.length,
      attemptedCount: correctCount + incorrectCount,
      correctCount,
      incorrectCount,
      unattemptedCount,
      score: totalScore,
      maxMarks,
      percentage,
      answers: attemptStates,
      sectionScores,
    };

    StorageService.saveAttempt(finalAttempt);
    onFinishTest(finalAttempt);
  };

  const handleAutoSubmit = () => {
    calculateResultAndSubmit();
  };

  // Format time MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // < 5 mins

  // Question Status counts
  const answeredCount = Object.values(attemptStates).filter(
    (s) => s.status === 'answered' || s.status === 'answered_marked'
  ).length;
  const markedCount = Object.values(attemptStates).filter(
    (s) => s.status === 'marked' || s.status === 'answered_marked'
  ).length;
  const notAnsweredCount = Object.values(attemptStates).filter((s) => s.status === 'not_answered').length;
  const notVisitedCount = Object.values(attemptStates).filter((s) => s.status === 'not_visited').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Test Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitWithoutSaving}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Exit Test"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs md:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {paper.title}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="font-semibold text-indigo-400">{paper.examType}</span>
              <span>·</span>
              <span>+{paper.positiveMark} / -{paper.negativeMark}</span>
            </div>
          </div>
        </div>

        {/* Right Header Tools: Timer, Scratchpad, Palette Toggle */}
        <div className="flex items-center gap-2">
          {/* Scratchpad Trigger */}
          <button
            onClick={() => setShowScratchpad(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
            title="Open Scratchpad"
          >
            <PenTool className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Rough Sheet</span>
          </button>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs shadow-xs border ${
              isLowTime
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-cyan-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="tracking-wider">{formatTimer(timeLeft)}</span>
          </div>

          {/* Question Palette Drawer Trigger (Mobile) */}
          <button
            onClick={() => setShowPaletteDrawer(true)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="View Questions Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Section Filter Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Section:</span>
        {paper.sections.map((sec) => {
          const secQuestions = paper.questions.filter((q) => q.section === sec);
          const isSelected = selectedSection === sec;
          return (
            <button
              key={sec}
              onClick={() => {
                setSelectedSection(sec);
                const firstInSec = paper.questions.findIndex((q) => q.section === sec);
                if (firstInSec >= 0) handleJumpToQuestion(firstInSec);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{sec}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {secQuestions.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center Question Canvas */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 pb-28">
          <div className="max-w-3xl mx-auto w-full space-y-5">
            {/* Question Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">
                  Question {currentQuestion.questionNumber}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-semibold text-[11px]">
                  {currentQuestion.section}
                </span>
                {currentQuestion.topic && (
                  <span className="hidden sm:inline text-slate-400 text-[11px]">
                    · {currentQuestion.topic}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span className="text-emerald-400">+{paper.positiveMark} Marks</span>
                <span>·</span>
                <span className="text-rose-400">-{paper.negativeMark} Negative</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm md:text-base leading-relaxed text-slate-100 font-normal">
              {currentQuestion.text}
            </div>

            {/* Diagram if available */}
            {currentQuestion.diagramUrl && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 max-w-sm">
                <img
                  src={currentQuestion.diagramUrl}
                  alt="Question Diagram"
                  className="rounded-lg max-h-48 object-contain"
                />
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {sanitizeQuestionOptions(currentQuestion.options).map((option) => {
                const isSelected =
                  attemptStates[currentQuestion.id]?.selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full min-h-[52px] p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {option.id}
                    </div>
                    <div className="flex-1 pt-0.5 text-xs md:text-sm font-medium leading-normal text-slate-100">
                      {option.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Desktop Question Palette */}
        <aside className="hidden lg:flex w-80 flex-col bg-slate-900 border-l border-slate-800">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Question Palette
            </h3>
            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-600 font-bold text-white flex items-center justify-center text-[10px]">
                  {answeredCount}
                </span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-600 font-bold text-white flex items-center justify-center text-[10px]">
                  {notAnsweredCount}
                </span>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-purple-600 font-bold text-white flex items-center justify-center text-[10px]">
                  {markedCount}
                </span>
                <span>Marked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-slate-800 font-bold text-slate-400 flex items-center justify-center text-[10px]">
                  {notVisitedCount}
                </span>
                <span>Not Visited</span>
              </div>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {paper.questions.map((q, idx) => {
                const state = attemptStates[q.id];
                const isCurrent = idx === currentQuestionIndex;
                let bgClass = 'bg-slate-800 text-slate-300';

                if (state?.status === 'answered') {
                  bgClass = 'bg-emerald-600 text-white font-bold';
                } else if (state?.status === 'not_answered') {
                  bgClass = 'bg-amber-600 text-white font-bold';
                } else if (state?.status === 'marked') {
                  bgClass = 'bg-purple-600 text-white font-bold';
                } else if (state?.status === 'answered_marked') {
                  bgClass = 'bg-purple-700 text-white font-bold ring-2 ring-emerald-400';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition active:scale-95 ${bgClass} ${
                      isCurrent ? 'ring-2 ring-cyan-400 scale-105 shadow-md' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Submit Button in Palette */}
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition"
            >
              Submit Test Paper
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Question Palette Drawer */}
      {showPaletteDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[75vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Question Navigation Grid</h3>
                <p className="text-xs text-slate-400">Tap question number to navigate</p>
              </div>
              <button
                onClick={() => setShowPaletteDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {paper.questions.map((q, idx) => {
                  const state = attemptStates[q.id];
                  const isCurrent = idx === currentQuestionIndex;
                  let bgClass = 'bg-slate-800 text-slate-300';

                  if (state?.status === 'answered') {
                    bgClass = 'bg-emerald-600 text-white font-bold';
                  } else if (state?.status === 'not_answered') {
                    bgClass = 'bg-amber-600 text-white font-bold';
                  } else if (state?.status === 'marked') {
                    bgClass = 'bg-purple-600 text-white font-bold';
                  } else if (state?.status === 'answered_marked') {
                    bgClass = 'bg-purple-700 text-white font-bold ring-2 ring-emerald-400';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition active:scale-95 ${bgClass} ${
                        isCurrent ? 'ring-2 ring-cyan-400 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Answered: <strong className="text-emerald-400">{answeredCount}</strong> / {paper.questions.length}
              </span>
              <button
                onClick={() => {
                  setShowPaletteDrawer(false);
                  setShowSubmitConfirm(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CBT Fixed Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2.5 sm:p-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Left Actions: Clear, Mark & Next, Save to Revision Deck */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleClearResponse}
              disabled={!attemptStates[currentQuestion.id]?.selectedOptionId}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium min-h-[44px] flex items-center justify-center transition"
            >
              Clear
            </button>
            <button
              onClick={handleMarkForReviewAndNext}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-semibold min-h-[44px] flex items-center justify-center transition whitespace-nowrap"
            >
              Mark & Next
            </button>
            
            {/* Save to Revision Deck Toggle Button */}
            <button
              type="button"
              onClick={handleToggleRevisionDeck}
              className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold min-h-[44px] flex items-center gap-1.5 transition whitespace-nowrap border ${
                bookmarkedMap[currentQuestion.id]
                  ? 'bg-amber-950/90 border-amber-600/70 text-amber-300 shadow-xs'
                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-amber-200'
              }`}
              title={
                bookmarkedMap[currentQuestion.id]
                  ? 'Question is saved in your Revision Deck (Click to remove)'
                  : 'Save this question to your Revision Deck for offline revision'
              }
            >
              <Bookmark
                className={`w-3.5 h-3.5 shrink-0 ${
                  bookmarkedMap[currentQuestion.id] ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline">
                {bookmarkedMap[currentQuestion.id] ? 'Saved to Deck' : 'Save to Revision'}
              </span>
              <span className="sm:hidden">
                {bookmarkedMap[currentQuestion.id] ? 'Saved' : 'Revision'}
              </span>
            </button>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="p-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={handleSaveAndNext}
              className="px-4 sm:px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px] flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-95 transition"
            >
              <span>Save & Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>

            {/* Mobile Submit CTA button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="lg:hidden px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold min-h-[44px] flex items-center justify-center transition"
            >
              Submit
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Bookmark Toast Feedback */}
      {bookmarkToast.visible && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/50 text-amber-200 px-4 py-2 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-md">
          <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span>{bookmarkToast.message}</span>
        </div>
      )}

      {/* Scratchpad Modal */}
      <ScratchpadModal isOpen={showScratchpad} onClose={() => setShowScratchpad(false)} />

      {/* Submit Test Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ready to Submit Test?</h3>
                <p className="text-xs text-slate-400">Review your attempt summary before final submission.</p>
              </div>
            </div>

            {/* Tally Breakdown Table */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="p-2 rounded-lg bg-slate-900 flex justify-between items-center">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold font-mono text-white">{paper.questions.length}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-900 flex justify-between items-center">
                <span className="text-emerald-300 font-semibold">Answered:</span>
                <span className="font-bold font-mono text-emerald-300">{answeredCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-900 flex justify-between items-center">
                <span className="text-amber-300 font-semibold">Not Answered:</span>
                <span className="font-bold font-mono text-amber-300">{notAnsweredCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-900 flex justify-between items-center">
                <span className="text-purple-300 font-semibold">Marked Review:</span>
                <span className="font-bold font-mono text-purple-300">{markedCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Time remaining: <strong className="text-cyan-400 font-mono">{formatTimer(timeLeft)}</strong>. After submitting, you will be taken to detailed score analysis with full question solutions.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={calculateResultAndSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
