import { ExamPaper, ExamQuestion } from '../types/exam';

export interface ParsedPDFResult {
  title: string;
  examType: string;
  sections: string[];
  questions: ExamQuestion[];
  rawTextLength: number;
}

export class PDFExamParser {
  /**
   * Main entry to parse extracted PDF text into structured exam
   */
  static parseExamText(rawText: string, customTitle?: string): ParsedPDFResult {
    // 1. Locate Answer Keys section (safely near the end of the paper)
    const answerKeyIndex = this.findAnswerKeySectionIndex(rawText);
    const solutionsIndex = this.findSolutionsSectionIndex(rawText);

    const answerKeyText = answerKeyIndex !== -1 ? rawText.substring(answerKeyIndex) : '';
    const solutionText = solutionsIndex !== -1 ? rawText.substring(solutionsIndex) : '';

    // 2. Extract Answer Keys & Solutions
    const answerKeyMap = this.extractAnswerKeys(answerKeyText || rawText);
    const solutionMap = this.extractSolutions(solutionText || rawText);

    // 3. Question text is everything before the answer keys / solutions table
    let questionText = rawText;
    const cutIndex = Math.min(
      answerKeyIndex !== -1 ? answerKeyIndex : Infinity,
      solutionsIndex !== -1 ? solutionsIndex : Infinity
    );

    if (cutIndex !== Infinity && cutIndex > 1000) {
      questionText = rawText.substring(0, cutIndex);
    }

    // 4. Extract questions by section with proper global offsets
    const questions = this.extractQuestions(questionText, answerKeyMap, solutionMap);

    // 5. Determine exam title and sections
    const detectedSections = Array.from(new Set(questions.map((q) => q.section)));
    const examType = this.detectExamType(rawText, detectedSections);

    let autoTitle = 'Competitive Mock Test';
    if (rawText.includes('ALLEN') || rawText.includes('1103CMD')) {
      autoTitle = 'ALLEN NEET Major Test Series (1103CMD303034260001)';
    } else if (rawText.includes('Aakash') || rawText.includes('AAKASH')) {
      autoTitle = 'Aakash AIATS Mock Test';
    } else if (rawText.includes('FIITJEE')) {
      autoTitle = 'FIITJEE AITS Mock Test';
    } else if (rawText.includes('Resonance')) {
      autoTitle = 'Resonance Rank Booster Mock Test';
    }

    const title = customTitle || autoTitle;

    return {
      title,
      examType,
      sections: detectedSections.length > 0 ? detectedSections : ['Physics', 'Chemistry', 'Biology'],
      questions,
      rawTextLength: rawText.length,
    };
  }

  private static findAnswerKeySectionIndex(text: string): number {
    // Look for ANSWER KEYS header, preferentially in the second half of the document
    const regex = /\bANSWER\s*KEYS?\b/gi;
    let match;
    let lastIndex = -1;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > text.length * 0.25) {
        lastIndex = match.index;
      }
    }
    return lastIndex;
  }

  private static findSolutionsSectionIndex(text: string): number {
    const regex = /\b(?:SOLUTIONS?|HINTS?\s*&\s*SOLUTIONS?)\b/gi;
    let match;
    let lastIndex = -1;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > text.length * 0.25) {
        lastIndex = match.index;
      }
    }
    return lastIndex;
  }

  /**
   * Extracts answer keys from tables like:
   * Q. 1 2 3 4 ...
   * A. 4 1 4 3 ...
   * Also supports individual "Final Answer: option (3)" or "Ans: B"
   */
  private static extractAnswerKeys(text: string): Map<number, string> {
    const keyMap = new Map<number, string>();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length - 1; i++) {
      const qLine = lines[i];
      const aLine = lines[i + 1];

      // Match "Q. 1 2 3 ... " followed by "A. 4 1 4 ... "
      if (/^Q[.:\s]/i.test(qLine) && /^A[.:\s]/i.test(aLine)) {
        const qNums = qLine
          .replace(/^Q[.:\s]*/i, '')
          .trim()
          .split(/\s+/)
          .map(Number)
          .filter((n) => !isNaN(n));
        const aNums = aLine
          .replace(/^A[.:\s]*/i, '')
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        for (let k = 0; k < Math.min(qNums.length, aNums.length); k++) {
          const qNum = qNums[k];
          let ans = aNums[k];
          if (ans === '1') ans = 'A';
          else if (ans === '2') ans = 'B';
          else if (ans === '3') ans = 'C';
          else if (ans === '4') ans = 'D';

          keyMap.set(qNum, ans.toUpperCase());
        }
      }
    }

    // Match individual answer lines like "Final answer: option (3)", "Final answer : 3", "Final Answer: (2)"
    const singleAnsRegex = /(?:Final\s*Answer\s*[:\-]\s*(?:option\s*)?\(?([1-4A-D])\)?|Ans(?:wer)?[:\s\-=]+(?:\(?[1-4A-D]\)?)|Correct\s*Answer\s*is\s*Option\s*\(?([1-4A-D])\)?)/gi;
    // Also scan lines for "Q. X ... A. Y"
    const pairRegex = /Q\.?\s*(\d{1,3})[\s\-:]+([1-4A-D])/gi;
    let match;
    while ((match = pairRegex.exec(text)) !== null) {
      const qNum = parseInt(match[1], 10);
      let ans = match[2];
      if (ans === '1') ans = 'A';
      else if (ans === '2') ans = 'B';
      else if (ans === '3') ans = 'C';
      else if (ans === '4') ans = 'D';
      keyMap.set(qNum, ans.toUpperCase());
    }

    return keyMap;
  }

  /**
   * Extracts solutions from "SOLUTIONS" section:
   * e.g.,
   * 1) Explanation text...
   * 2) NCERT XI Pg #300...
   */
  private static extractSolutions(text: string): Map<number, string> {
    const solMap = new Map<number, string>();
    const lines = text.split('\n');

    let currentQNum: number | null = null;
    let currentExplanation: string[] = [];

    const flushCurrent = () => {
      if (currentQNum !== null && currentExplanation.length > 0) {
        solMap.set(currentQNum, currentExplanation.join('\n').trim());
      }
      currentExplanation = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      // Match "1)", "1.", "Q1)", "Q.1", "44)"
      const startMatch = line.match(/^(?:Q\.?\s*)?(\d{1,3})[.)]\s*(.*)$/);
      if (startMatch && !line.includes(') (') && !line.startsWith('(')) {
        const num = parseInt(startMatch[1], 10);
        if (num >= 1 && num <= 300) {
          flushCurrent();
          currentQNum = num;
          if (startMatch[2]) {
            currentExplanation.push(startMatch[2]);
          }
          continue;
        }
      }

      if (currentQNum !== null) {
        currentExplanation.push(line);
      }
    }

    flushCurrent();
    return solMap;
  }

  /**
   * Extracts individual questions and options across all sections
   */
  private static extractQuestions(
    text: string,
    answerKeyMap: Map<number, string>,
    solutionMap: Map<number, string>
  ): ExamQuestion[] {
    const lines = text.split('\n');
    const questions: ExamQuestion[] = [];

    let currentSection = 'Physics';
    let sectionQuestionOffset = 0; // offset for global numbering when sections restart at 1
    let previousSectionTotal = 0;

    let localQNumber: number | null = null;
    let currentQText: string[] = [];
    let currentOptions: { id: string; text: string }[] = [];
    let globalIndex = 1;

    const flushQuestion = () => {
      if (localQNumber !== null && currentQText.length > 0) {
        // Compute the global exam question number
        // In NEET: Physics is 1-45, Chemistry is 46-90 (or 1-45), Biology is 91-180 (or 1-90)
        let globalQNumber = localQNumber;
        if (localQNumber <= 45 && currentSection === 'Chemistry') {
          globalQNumber = 45 + localQNumber;
        } else if (localQNumber <= 90 && currentSection === 'Biology') {
          globalQNumber = 90 + localQNumber;
        }

        // Deduplicate and ensure all options A, B, C, D are cleanly defined
        const uniqueOptionsMap = new Map<string, string>();
        for (const opt of currentOptions) {
          if (!uniqueOptionsMap.has(opt.id)) {
            // Strip any accidental leading option prefixes like "(A) " or "1) "
            const cleanText = opt.text.replace(/^(?:\([1-4A-D]\)|[1-4A-D][.)])\s*/i, '').trim();
            uniqueOptionsMap.set(opt.id, cleanText || `Option ${opt.id}`);
          }
        }

        let finalOptions: { id: string; text: string }[] = [];
        if (uniqueOptionsMap.size >= 2) {
          const expectedIds = ['A', 'B', 'C', 'D'];
          // Keep existing sorted options, filling any missing slot cleanly
          finalOptions = expectedIds.map((id) => ({
            id,
            text: uniqueOptionsMap.get(id) || `Option (${id})`,
          }));
        } else {
          finalOptions = [
            { id: 'A', text: 'Option (1)' },
            { id: 'B', text: 'Option (2)' },
            { id: 'C', text: 'Option (3)' },
            { id: 'D', text: 'Option (4)' },
          ];
        }

        // Try both globalQNumber and localQNumber for answer key and solution
        let correctOpt =
          answerKeyMap.get(globalQNumber) ||
          answerKeyMap.get(localQNumber) ||
          'A';

        if (correctOpt === '1') correctOpt = 'A';
        if (correctOpt === '2') correctOpt = 'B';
        if (correctOpt === '3') correctOpt = 'C';
        if (correctOpt === '4') correctOpt = 'D';

        const explanation =
          solutionMap.get(globalQNumber) ||
          solutionMap.get(localQNumber) ||
          `Detailed solution: Correct option is (${correctOpt}). Refer to NCERT / standard notes for complete derivation.`;

        questions.push({
          id: `q-${currentSection.toLowerCase()}-${globalQNumber}-${Date.now()}-${globalIndex++}`,
          questionNumber: globalQNumber,
          section: currentSection,
          text: currentQText.join(' ').replace(/\s+/g, ' ').trim(),
          options: finalOptions,
          correctOptionId: correctOpt,
          explanation,
          topic: `${currentSection} High-Yield Concept`,
          difficulty: 'Medium',
        });
      }

      localQNumber = null;
      currentQText = [];
      currentOptions = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Section header detection (PHYSICS, CHEMISTRY, BIOLOGY)
      const secMatch = line.match(/^(?:PHYSICS|CHEMISTRY|BIOLOGY|BOTANY|ZOOLOGY|MATHEMATICS|MATHS?|GENERAL\s*STUDIES)\b/i);
      if (secMatch) {
        flushQuestion();
        const header = secMatch[0].toUpperCase();
        if (header.includes('PHYSICS')) currentSection = 'Physics';
        else if (header.includes('CHEMISTRY')) currentSection = 'Chemistry';
        else if (header.includes('BIOLOGY') || header.includes('BOTANY') || header.includes('ZOOLOGY')) currentSection = 'Biology';
        else if (header.includes('MATH')) currentSection = 'Mathematics';
        else if (header.includes('GENERAL')) currentSection = 'General Studies';
        continue;
      }

      // Check if line starts a new question: e.g. "1)", "1.", "Q1)", "Q.1", "12) A block..."
      const qStartMatch = line.match(/^(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[.)]\s*(.*)$/);
      const isOptionLine = /^\([1-4A-D]\)/i.test(line);

      if (qStartMatch && !isOptionLine) {
        const qNum = parseInt(qStartMatch[1], 10);
        if (qNum >= 1 && qNum <= 300) {
          flushQuestion();
          localQNumber = qNum;
          if (qStartMatch[2]) {
            currentQText.push(qStartMatch[2]);
          }
          continue;
        }
      }

      // Check if line contains one or more options: e.g. "(1) 200° W (2) 139° W" or "(A) Speed increases (B) Frequency decreases"
      const optionDelimiterRegex = /(?:^|\s{2,}|\t|\s+(?=\([1-4A-D]\)|[1-4A-D][.)]))(?:\(([1-4A-D])\)|([1-4A-D])[.)])\s*/gi;
      const optionMatches = [...line.matchAll(optionDelimiterRegex)];

      if (optionMatches.length > 0 && localQNumber !== null) {
        for (let m = 0; m < optionMatches.length; m++) {
          const match = optionMatches[m];
          const rawOpt = (match[1] || match[2]).toUpperCase();
          let optLetter = rawOpt;
          if (rawOpt === '1') optLetter = 'A';
          else if (rawOpt === '2') optLetter = 'B';
          else if (rawOpt === '3') optLetter = 'C';
          else if (rawOpt === '4') optLetter = 'D';

          const startIndex = match.index! + match[0].length;
          const endIndex = m + 1 < optionMatches.length ? optionMatches[m + 1].index! : line.length;
          let optText = line.substring(startIndex, endIndex).trim();
          optText = optText.replace(/^(?:\([1-4A-D]\)|[1-4A-D][.)])\s*/i, '').trim();

          currentOptions.push({
            id: optLetter,
            text: optText || `Option ${optLetter}`,
          });
        }
        continue;
      }

      // Continuation line for Question statement
      if (localQNumber !== null) {
        if (currentOptions.length === 0) {
          currentQText.push(line);
        } else {
          // Continuation for last option text
          const lastOpt = currentOptions[currentOptions.length - 1];
          lastOpt.text += ' ' + line;
        }
      }
    }

    flushQuestion();

    // Ensure sequential numbering across whole paper
    questions.forEach((q, idx) => {
      q.questionNumber = idx + 1;
    });

    return questions;
  }

  private static detectExamType(text: string, sections: string[]): string {
    if (text.includes('NEET') || (sections.includes('Physics') && sections.includes('Chemistry') && sections.includes('Biology'))) {
      return 'NEET';
    }
    if (text.includes('JEE') || (sections.includes('Physics') && sections.includes('Chemistry') && sections.includes('Mathematics'))) {
      return 'JEE Main';
    }
    if (text.includes('UPSC') || text.includes('Civil Services')) {
      return 'UPSC';
    }
    if (text.includes('SSC')) {
      return 'SSC CGL';
    }
    return 'Competitive CBT';
  }
}
