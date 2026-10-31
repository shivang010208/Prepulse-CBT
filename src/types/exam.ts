export interface ExamQuestion {
  id: string;
  questionNumber: number;
  section: string;
  text: string;
  diagramUrl?: string;
  diagramDescription?: string;
  diagramSvg?: string;
  options: {
    id: string; // 'A' | 'B' | 'C' | 'D'
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface ExamPaper {
  id: string;
  title: string;
  examType: string; // 'JEE Main' | 'NEET' | 'UPSC' | 'SSC CGL' | 'CBSE' | 'Custom'
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  positiveMark: number;
  negativeMark: number;
  sections: string[];
  questions: ExamQuestion[];
  createdAt: string;
  source: 'telegram_upload' | 'preset' | 'manual';
  isSavedOffline: boolean;
}

export interface QuestionAttemptState {
  selectedOptionId: string | null;
  status: 'answered' | 'marked' | 'answered_marked' | 'not_answered' | 'not_visited';
  timeSpentSeconds: number;
}

export interface ExamAttempt {
  id: string;
  paperId: string;
  paperTitle: string;
  examType: string;
  startTime: string;
  endTime: string;
  timeTakenSeconds: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  score: number;
  maxMarks: number;
  percentage: number;
  answers: Record<string, QuestionAttemptState>; // keyed by question.id
  sectionScores: Record<
    string,
    {
      score: number;
      maxScore: number;
      attempted: number;
      correct: number;
      incorrect: number;
    }
  >;
}

export interface QuestionBookmark {
  id: string;
  paperId: string;
  paperTitle: string;
  questionId: string;
  question: ExamQuestion;
  bookmarkedAt: string;
  notes?: string;
}
