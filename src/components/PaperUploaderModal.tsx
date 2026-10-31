import React, { useState } from 'react';
import {
  X,
  Send,
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  FileCheck,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { ExamPaper } from '../types/exam';
import { StorageService } from '../services/storageService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ClientPdfExtractor, PDFExtractionProgress } from '../services/clientPdfExtractor';
import { PDFExamParser } from '../services/pdfExamParser';
import { ALLEN_NEET_PAPER } from '../services/allenTestPaper';
import { sanitizeQuestionOptions } from '../utils/optionSanitizer';

interface PaperUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperCreated: (paper: ExamPaper) => void;
}

export const PaperUploaderModal: React.FC<PaperUploaderModalProps> = ({
  isOpen,
  onClose,
  onPaperCreated,
}) => {
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'file_upload' | 'telegram_text'>('file_upload');
  const [rawText, setRawText] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [examType, setExamType] = useState('NEET');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [positiveMark, setPositiveMark] = useState(4);
  const [negativeMark, setNegativeMark] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<PDFExtractionProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewPaper, setPreviewPaper] = useState<ExamPaper | null>(null);

  if (!isOpen) return null;

  const handleLoadAllenMock = () => {
    setPreviewPaper(ALLEN_NEET_PAPER);
    setPaperTitle(ALLEN_NEET_PAPER.title);
    setExamType(ALLEN_NEET_PAPER.examType);
    setDurationMinutes(ALLEN_NEET_PAPER.durationMinutes);
    setPositiveMark(ALLEN_NEET_PAPER.positiveMark);
    setNegativeMark(ALLEN_NEET_PAPER.negativeMark);
  };

  const handleSampleTelegramFill = () => {
    setPaperTitle('Telegram Test Series - Physics & Chemistry Booster');
    setExamType('JEE Main');
    setDurationMinutes(25);
    setPositiveMark(4);
    setNegativeMark(1);
    setRawText(`Q1. An electron moves with velocity v in a magnetic field B at an angle of 90 degrees. What is the trajectory of the electron?
A) Straight line
B) Circular path
C) Parabolic path
D) Helical path
Ans: B
Solution: When a charged particle enters a uniform magnetic field perpendicular to the direction of motion, the magnetic Lorentz force (F = q * v x B) acts as a centripetal force perpendicular to velocity at all points, resulting in a uniform circular orbit.

Q2. What is the equivalent resistance between terminals A and B of an infinite ladder of 1 ohm resistors?
A) (1 + √5)/2 ohms
B) (√5 - 1)/2 ohms
C) 2 ohms
D) 1.5 ohms
Ans: A
Solution: Let the equivalent resistance of the infinite ladder be R_eq. Adding one more identical stage leaves the total resistance unchanged: R_eq = 1 + (1 * R_eq) / (1 + R_eq). Solving the quadratic equation R_eq² - R_eq - 1 = 0 yields R_eq = (1 + √5)/2 ≈ 1.618 ohms.

Q3. The work function of a metal is 2.5 eV. If light of frequency 10^15 Hz illuminates the metal surface, what is the maximum kinetic energy of the emitted photoelectrons? (Take h = 4.14 x 10^-15 eV·s)
A) 1.64 eV
B) 2.50 eV
C) 4.14 eV
D) 6.64 eV
Ans: A
Solution: According to Einstein's photoelectric equation: K_max = h*ν - Φ = (4.14 x 10^-15 eV·s * 10^15 s^-1) - 2.5 eV = 4.14 eV - 2.5 eV = 1.64 eV.`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg(null);
    setPdfProgress(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // Auto-populate title if empty
      if (!paperTitle) {
        setPaperTitle(file.name.replace(/\.pdf$/i, ''));
      }

      // Convert to base64 for fallback
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Clean = result.split(',')[1];
        setFileBase64(base64Clean);
      };
      reader.readAsDataURL(file);
    } else {
      // Image file
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Clean = result.split(',')[1];
        setFileBase64(base64Clean);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessPaper = async () => {
    setErrorMsg(null);

    const isPdf = selectedFile?.type === 'application/pdf' || selectedFile?.name.toLowerCase().endsWith('.pdf');

    if (activeTab === 'telegram_text' && !rawText.trim()) {
      setErrorMsg('Please paste the telegram question paper text or click "Try Sample Telegram Post"');
      return;
    }
    if (activeTab === 'file_upload' && !selectedFile && !rawText.trim()) {
      setErrorMsg('Please select a PDF or image file of your question paper');
      return;
    }

    setIsProcessing(true);

    try {
      // Case 1: PDF Document Processing (Browser PDF.js + PDFExamParser + Backend fallback)
      if (isPdf && selectedFile) {
        let extractedText = '';

        try {
          // Attempt client-side PDF text extraction
          const result = await ClientPdfExtractor.extractTextFromPDF(selectedFile, (progress) => {
            setPdfProgress(progress);
          });
          extractedText = result.fullText;
        } catch (pdfClientErr) {
          console.warn('Client-side PDF extraction failed, trying backend /api/parse-paper:', pdfClientErr);
        }

        // Parse extracted text into questions, sections, answer keys, and solutions
        if (extractedText && extractedText.length > 200) {
          const parsed = PDFExamParser.parseExamText(extractedText, paperTitle || selectedFile.name);

          if (parsed.questions.length > 0) {
            const paper: ExamPaper = {
              id: `paper-pdf-${Date.now()}`,
              title: paperTitle.trim() || parsed.title,
              examType: examType || parsed.examType,
              description: `Extracted from PDF (${selectedFile.name}) · ${parsed.questions.length} Questions with Answer Key & Solutions`,
              durationMinutes: durationMinutes || Math.max(25, Math.round(parsed.questions.length * 1.5)),
              totalMarks: parsed.questions.length * positiveMark,
              positiveMark,
              negativeMark,
              sections: parsed.sections,
              questions: parsed.questions,
              createdAt: new Date().toISOString(),
              source: 'telegram_upload',
              isSavedOffline: true,
            };

            setPreviewPaper(paper);
            setIsProcessing(false);
            return;
          }
        }

        // If client text extraction was empty or scanned image PDF, call server endpoint
        if (isOnline && fileBase64) {
          setPdfProgress({
            currentPage: 1,
            totalPages: 1,
            statusText: 'Analyzing PDF with server AI processor...',
          });

          const response = await fetch('/api/parse-paper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawText: extractedText || rawText.trim(),
              imageBase64: fileBase64,
              mimeType: 'application/pdf',
              examPreset: examType,
              paperTitle: paperTitle.trim() || selectedFile.name,
            }),
          });

          const data = await response.json();
          if (data.paper && data.paper.questions?.length > 0) {
            const generatedPaper: ExamPaper = {
              id: `paper-${Date.now()}`,
              title: paperTitle.trim() || data.paper.title || selectedFile.name,
              examType: data.paper.examType || examType,
              description: `Imported via PDF Parser on ${new Date().toLocaleDateString()}`,
              durationMinutes: durationMinutes || data.paper.durationMinutes || 45,
              totalMarks: data.paper.questions.length * positiveMark,
              positiveMark,
              negativeMark,
              sections: data.paper.sections || ['General'],
              questions: data.paper.questions.map((q: any, i: number) => ({
                ...q,
                id: q.id || `q-${i + 1}`,
                questionNumber: i + 1,
                options: sanitizeQuestionOptions(q.options),
              })),
              createdAt: new Date().toISOString(),
              source: 'telegram_upload',
              isSavedOffline: true,
            };

            setPreviewPaper(generatedPaper);
            setIsProcessing(false);
            return;
          }
        }
      }

      // Case 2: Text / Telegram Message or Image
      if (isOnline) {
        const response = await fetch('/api/parse-paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: rawText.trim(),
            imageBase64: fileBase64,
            mimeType: selectedFile?.type || 'image/jpeg',
            examPreset: examType,
            paperTitle: paperTitle.trim(),
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.paper) {
          throw new Error(data.error || 'Server parsing failed');
        }

        const generatedPaper: ExamPaper = {
          id: `paper-${Date.now()}`,
          title: paperTitle.trim() || data.paper.title || 'Telegram Mock Test',
          examType: data.paper.examType || examType,
          description: `Imported via Telegram parser on ${new Date().toLocaleDateString()}`,
          durationMinutes: durationMinutes || data.paper.durationMinutes || 30,
          totalMarks: (data.paper.questions?.length || 1) * positiveMark,
          positiveMark,
          negativeMark,
          sections: data.paper.sections || ['General'],
          questions: data.paper.questions.map((q: any, i: number) => ({
            ...q,
            id: q.id || `q-${i + 1}`,
            questionNumber: i + 1,
            options: sanitizeQuestionOptions(q.options),
          })),
          createdAt: new Date().toISOString(),
          source: 'telegram_upload',
          isSavedOffline: true,
        };

        setPreviewPaper(generatedPaper);
      } else {
        // Offline Fallback Regex Parser
        const parsed = StorageService.parseTelegramTextOffline(rawText, paperTitle);
        parsed.examType = examType;
        parsed.durationMinutes = durationMinutes;
        parsed.positiveMark = positiveMark;
        parsed.negativeMark = negativeMark;
        parsed.totalMarks = parsed.questions.length * positiveMark;
        setPreviewPaper(parsed);
      }
    } catch (err: any) {
      console.warn('Processing failed, falling back:', err);
      if (rawText.trim()) {
        const fallback = StorageService.parseTelegramTextOffline(rawText, paperTitle);
        fallback.examType = examType;
        fallback.durationMinutes = durationMinutes;
        fallback.positiveMark = positiveMark;
        fallback.negativeMark = negativeMark;
        setPreviewPaper(fallback);
      } else {
        setErrorMsg('Could not process this file. You can also paste text directly or click "Load Sample ALLEN NEET Test".');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!previewPaper) return;
    StorageService.savePaper(previewPaper);
    onPaperCreated(previewPaper);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Question Paper & Solutions</h2>
              <p className="text-xs text-slate-400">Multi-page PDF, Telegram text, or photo into timed CBT exam</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!previewPaper ? (
            <>
              {/* Quick Preset Banner for the Allen PDF */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">ALLEN NEET Major Test (1103CMD303034260001)</h4>
                    <p className="text-[11px] text-slate-300">Physics, Chemistry & Biology with Answer Key & Step-by-Step Solutions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadAllenMock}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition"
                >
                  Load Paper
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('file_upload')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition ${
                    activeTab === 'file_upload'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload PDF / Image File
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('telegram_text')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition ${
                    activeTab === 'telegram_text'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Telegram Message / Text
                </button>
              </div>

              {/* Basic Meta Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Paper Title</label>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    placeholder="e.g. ALLEN NEET Major Test Series"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="NEET">NEET UG</option>
                    <option value="JEE Main">JEE Main / Advanced</option>
                    <option value="UPSC">UPSC Civil Services</option>
                    <option value="SSC CGL">SSC CGL / Banking</option>
                    <option value="CBSE">CBSE Class 11-12</option>
                    <option value="Custom">Custom / General CBT</option>
                  </select>
                </div>
              </div>

              {/* Exam Rules / Marking Scheme */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    Correct (+Marks)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={1}
                    value={positiveMark}
                    onChange={(e) => setPositiveMark(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-1">
                    <Award className="w-3 h-3 text-rose-400" />
                    Wrong (-Marks)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min={0}
                    value={negativeMark}
                    onChange={(e) => setNegativeMark(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Main Input Form */}
              {activeTab === 'file_upload' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Upload Exam Paper PDF or Image:
                  </label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/40 transition">
                    <input
                      type="file"
                      id="paper-file-input"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="paper-file-input" className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-200">
                        {selectedFile ? selectedFile.name : 'Tap to select PDF or image test paper'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supports multi-page coaching PDFs (e.g. Allen, Aakash, Resonance), scanned pages, answer key grids, and solutions.
                      </p>
                    </label>
                  </div>

                  {pdfProgress && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-indigo-900/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-indigo-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{pdfProgress.statusText}</span>
                        </span>
                        <span className="font-mono">
                          {Math.round((pdfProgress.currentPage / (pdfProgress.totalPages || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-200"
                          style={{
                            width: `${(pdfProgress.currentPage / (pdfProgress.totalPages || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Telegram Question Paper Text with Solutions:
                    </label>
                    <button
                      type="button"
                      onClick={handleSampleTelegramFill}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                    >
                      <Sparkles className="w-3 h-3" />
                      Try Sample Telegram Post
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste question paper messages from Telegram channels here. Can contain questions, A/B/C/D options, answer keys (e.g. Ans: B), and step-by-step solutions..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              )}
            </>
          ) : (
            /* Preview of parsed paper */
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <div>
                  <h3 className="text-sm font-bold text-indigo-200">{previewPaper.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{previewPaper.questions.length} Questions</span>
                    <span>·</span>
                    <span>{previewPaper.sections.join(', ')}</span>
                    <span>·</span>
                    <span>{previewPaper.durationMinutes} Minutes</span>
                    <span>·</span>
                    <span>+{previewPaper.positiveMark} / -{previewPaper.negativeMark}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready to Take Test
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Extracted Questions ({previewPaper.questions.length} Questions across {previewPaper.sections.join(', ')})
                  </h4>
                  <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    <Lock className="w-3 h-3" />
                    <span>Solutions Locked until Submission</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-200/90">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    All verified answer keys and step-by-step solutions are securely locked. You will be able to analyze your score, inspect every question, and view the full solutions only after you complete and submit the test.
                  </p>
                </div>

                {previewPaper.questions.slice(0, 15).map((q, idx) => (
                  <div key={q.id || idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-slate-200">Question {q.questionNumber}</span>
                      <span className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {q.section}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed">{q.text}</p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-2 rounded-lg border border-slate-800/80 bg-slate-900/60 text-slate-300 text-[11px] flex items-start gap-1.5"
                        >
                          <span className="font-bold text-slate-400 shrink-0">{opt.id})</span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {previewPaper.questions.length > 15 && (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800 font-medium">
                    + {previewPaper.questions.length - 15} more questions extracted into CBT test mode
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          {!previewPaper ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProcessPaper}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Multi-Page PDF & Solutions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process PDF into CBT Test</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewPaper(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Upload Another
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save to Cloud & Take Test</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
