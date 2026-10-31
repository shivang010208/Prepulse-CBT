import { ExamPaper, ExamAttempt, QuestionBookmark, ExamQuestion } from '../types/exam';
import { INITIAL_PAPERS } from './samplePapers';

const PAPERS_STORAGE_KEY = 'preppulse_exam_papers_v1';
const ATTEMPTS_STORAGE_KEY = 'preppulse_exam_attempts_v1';
const BOOKMARKS_STORAGE_KEY = 'preppulse_question_bookmarks_v1';

export class StorageService {
  // Papers
  static getPapers(): ExamPaper[] {
    try {
      const data = localStorage.getItem(PAPERS_STORAGE_KEY);
      if (!data) {
        // Seed initial papers
        this.savePapers(INITIAL_PAPERS);
        return INITIAL_PAPERS;
      }
      const loaded: ExamPaper[] = JSON.parse(data);
      // Ensure featured papers are present
      for (const initial of INITIAL_PAPERS) {
        if (!loaded.some((p) => p.id === initial.id)) {
          loaded.unshift(initial);
        }
      }
      this.savePapers(loaded);
      return loaded;
    } catch (e) {
      console.error('Failed to load papers from localStorage:', e);
      return INITIAL_PAPERS;
    }
  }

  static getPaper(id: string): ExamPaper | undefined {
    const papers = this.getPapers();
    return papers.find((p) => p.id === id);
  }

  static savePaper(paper: ExamPaper): void {
    const papers = this.getPapers();
    const index = papers.findIndex((p) => p.id === paper.id);
    if (index >= 0) {
      papers[index] = paper;
    } else {
      papers.unshift(paper);
    }
    this.savePapers(papers);
  }

  static savePapers(papers: ExamPaper[]): void {
    try {
      localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(papers));
    } catch (e) {
      console.error('Failed to save papers:', e);
    }
  }

  static deletePaper(id: string): void {
    const papers = this.getPapers().filter((p) => p.id !== id);
    this.savePapers(papers);
  }

  // Attempts
  static getAttempts(): ExamAttempt[] {
    try {
      const data = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to get attempts:', e);
      return [];
    }
  }

  static getAttempt(id: string): ExamAttempt | undefined {
    const attempts = this.getAttempts();
    return attempts.find((a) => a.id === id);
  }

  static saveAttempt(attempt: ExamAttempt): void {
    const attempts = this.getAttempts();
    attempts.unshift(attempt);
    try {
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
    } catch (e) {
      console.error('Failed to save attempt:', e);
    }
  }

  // Bookmarks / Revision
  static getBookmarks(): QuestionBookmark[] {
    try {
      const data = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to get bookmarks:', e);
      return [];
    }
  }

  static isBookmarked(questionId: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some((b) => b.questionId === questionId);
  }

  static toggleBookmark(paperId: string, question: ExamQuestion, paperTitle: string): boolean {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex((b) => b.questionId === question.id);

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (e) {
        console.error(e);
      }
      return false;
    } else {
      const newBookmark: QuestionBookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        paperId,
        questionId: question.id,
        paperTitle,
        question,
        bookmarkedAt: new Date().toISOString(),
      };
      bookmarks.unshift(newBookmark);
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (e) {
        console.error(e);
      }
      return true;
    }
  }

  static removeBookmark(bookmarkId: string): void {
    const bookmarks = this.getBookmarks().filter((b) => b.id !== bookmarkId);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error(e);
    }
  }

  // Client-side Fallback Parser for Telegram format when offline or quick parsing
  static parseTelegramTextOffline(rawText: string, title?: string): ExamPaper {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const questions: ExamQuestion[] = [];
    let currentQuestion: Partial<ExamQuestion> | null = null;
    let questionCounter = 1;

    // Regex matchers for Q1., Question 1:, 1., etc.
    const qStartRegex = /^(?:Q(?:uestion)?\.?\s*(\d+)[:.]?|(\d+)[.)])\s*(.*)/i;
    const optionRegex = /^([A-D])[.)\-:]\s*(.*)/i;
    const ansRegex = /^(?:(?:Ans(?:wer)?|Correct(?:\s*Option)?|Key)[:\s\-]+)([A-D])/i;
    const solRegex = /^(?:(?:Sol(?:ution)?|Expl(?:anation)?|Reason)[:\s\-]+)(.*)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const qMatch = line.match(qStartRegex);
      if (qMatch) {
        if (currentQuestion && currentQuestion.text && currentQuestion.options && currentQuestion.options.length > 0) {
          questions.push(this.finalizeQuestion(currentQuestion, questionCounter++));
        }
        currentQuestion = {
          id: `q-offline-${Date.now()}-${questionCounter}`,
          questionNumber: questionCounter,
          section: 'General',
          text: qMatch[3] || '',
          options: [],
          correctOptionId: 'A',
          explanation: 'Standard verified solution provided.',
          difficulty: 'Medium',
        };
        continue;
      }

      if (currentQuestion) {
        const optMatch = line.match(optionRegex);
        if (optMatch) {
          currentQuestion.options = currentQuestion.options || [];
          currentQuestion.options.push({
            id: optMatch[1].toUpperCase(),
            text: optMatch[2] || `Option ${optMatch[1]}`,
          });
          continue;
        }

        const ansMatch = line.match(ansRegex);
        if (ansMatch) {
          currentQuestion.correctOptionId = ansMatch[1].toUpperCase();
          continue;
        }

        const solMatch = line.match(solRegex);
        if (solMatch) {
          currentQuestion.explanation = solMatch[1] || 'Solution provided.';
          continue;
        }

        // Additional text continuation
        if (!currentQuestion.options || currentQuestion.options.length === 0) {
          currentQuestion.text = (currentQuestion.text ? currentQuestion.text + ' ' : '') + line;
        } else if (currentQuestion.explanation) {
          currentQuestion.explanation += ' ' + line;
        }
      }
    }

    if (currentQuestion && currentQuestion.text) {
      questions.push(this.finalizeQuestion(currentQuestion, questionCounter));
    }

    // If no questions detected via strict regex, create at least 1 formatted question or fallback
    if (questions.length === 0) {
      questions.push({
        id: `q-offline-${Date.now()}-1`,
        questionNumber: 1,
        section: 'General',
        text: rawText.slice(0, 300) || 'Uploaded Question Sample',
        options: [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' },
        ],
        correctOptionId: 'A',
        explanation: 'Review the text solution provided in your source paper.',
        difficulty: 'Medium',
      });
    }

    const paperTitle = title || `Telegram Practice Paper (${new Date().toLocaleDateString()})`;

    return {
      id: `paper-upload-${Date.now()}`,
      title: paperTitle,
      examType: 'Custom / Telegram',
      description: 'Imported from Telegram document or text dump.',
      durationMinutes: Math.max(15, questions.length * 2),
      totalMarks: questions.length * 4,
      positiveMark: 4,
      negativeMark: 1,
      sections: Array.from(new Set(questions.map((q) => q.section))),
      questions,
      createdAt: new Date().toISOString(),
      source: 'telegram_upload',
      isSavedOffline: true,
    };
  }

  private static finalizeQuestion(q: Partial<ExamQuestion>, num: number): ExamQuestion {
    const opts = q.options && q.options.length >= 2 ? q.options : [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
      { id: 'D', text: 'Option D' },
    ];

    return {
      id: q.id || `q-${num}`,
      questionNumber: num,
      section: q.section || 'General',
      text: q.text || `Question ${num}`,
      options: opts,
      correctOptionId: q.correctOptionId || 'A',
      explanation: q.explanation || 'Detailed solution is available in your revision session.',
      topic: q.topic || 'General Practice',
      difficulty: q.difficulty || 'Medium',
    };
  }
}
