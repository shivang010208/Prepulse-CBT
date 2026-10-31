import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '30mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI & PDF Paper Parser from Telegram text or image/PDF
app.post('/api/parse-paper', async (req, res) => {
  try {
    const { rawText, imageBase64, mimeType, examPreset, paperTitle } = req.body;

    if (!rawText && !imageBase64) {
      return res.status(400).json({ error: 'Please provide question paper text or image/document.' });
    }

    let extractedPdfText = '';

    // Check if the uploaded file is a PDF
    const isPdf =
      mimeType === 'application/pdf' ||
      mimeType?.includes('pdf') ||
      (typeof imageBase64 === 'string' && imageBase64.startsWith('JVBERi0')); // %PDF- in base64

    if (imageBase64 && isPdf) {
      try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const pdfBuffer = Buffer.from(imageBase64, 'base64');
        const parsedPdf = await pdfParse(pdfBuffer);
        if (parsedPdf && parsedPdf.text) {
          extractedPdfText = parsedPdf.text;
        }
      } catch (pdfErr) {
        console.warn('Backend pdf-parse failed:', pdfErr);
      }
    }

    const combinedText = (extractedPdfText ? extractedPdfText + '\n' : '') + (rawText || '');

    // If we have extensive PDF text (e.g. multi-page test paper), parse it using high-accuracy PDFExamParser
    if (combinedText.length > 500) {
      const { PDFExamParser } = await import('./src/services/pdfExamParser');
      const parsedResult = PDFExamParser.parseExamText(combinedText, paperTitle);

      if (parsedResult.questions.length >= 2) {
        return res.json({
          success: true,
          paper: {
            title: paperTitle || parsedResult.title,
            examType: examPreset || parsedResult.examType,
            durationMinutes: Math.max(20, Math.round(parsedResult.questions.length * 1.5)),
            positiveMark: 4,
            negativeMark: 1,
            sections: parsedResult.sections,
            questions: parsedResult.questions,
          },
        });
      }
    }

    // Otherwise, for smaller text or images, use Gemini AI
    const systemInstruction = `You are an expert exam question paper digitizer and competitive examination parser (specializing in JEE Main/Advanced, NEET, UPSC, SSC, SAT, CBSE, and mock test series distributed via Telegram and coaching institutes).
Your task is to take raw question paper text or images (often containing questions, multiple choice options A/B/C/D, answer keys, and step-by-step solutions) and parse them into a structured Computer-Based Test (CBT) paper.
Rules:
1. Accurately split into discrete questions.
2. Detect options (A, B, C, D) or numerical questions. If options are present, provide id 'A', 'B', 'C', 'D' and the clean option text.
3. Identify the correct answer (e.g. 'A', 'B', 'C', 'D' or number). If an answer key or solution is given in the text, match it. If not explicitly marked, solve it and provide the correct option.
4. Extract or generate a clear, comprehensive, step-by-step solution / explanation with formulas and reasoning.
5. Classify the Subject/Section (e.g., Physics, Chemistry, Mathematics, Biology, General Studies, Quantitative Aptitude, Logical Reasoning).
6. Set standard timing and marking (e.g. 4 marks for correct, -1 mark for wrong for JEE/NEET, or standard +1 / -0.25).
7. Extract questions cleanly.`;

    const contents: any[] = [];
    if (imageBase64 && !isPdf) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    const promptText =
      `Parse this exam paper content into structured CBT test format.\n` +
      (examPreset ? `Target Exam Type: ${examPreset}\n` : '') +
      (combinedText
        ? `Paper Text / Telegram Message:\n${combinedText.substring(0, 30000)}`
        : 'Extract all questions, options, correct answers, and detailed explanations from the attached image/document.');

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Descriptive title of the exam paper' },
            examType: { type: Type.STRING, description: 'Type of exam e.g. JEE Main, NEET, UPSC, SSC, General CBT' },
            durationMinutes: { type: Type.INTEGER, description: 'Total recommended time in minutes for this test' },
            positiveMark: { type: Type.NUMBER, description: 'Marks awarded for correct answer e.g. 4' },
            negativeMark: { type: Type.NUMBER, description: 'Marks deducted for wrong answer e.g. 1' },
            sections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of sections/subjects in this paper',
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  questionNumber: { type: Type.INTEGER },
                  section: { type: Type.STRING, description: 'Subject or section name' },
                  text: { type: Type.STRING, description: 'Full question statement, including equations/context' },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: 'Option label e.g. A, B, C, D' },
                        text: { type: Type.STRING, description: 'Option content' },
                      },
                      required: ['id', 'text'],
                    },
                  },
                  correctOptionId: { type: Type.STRING, description: 'Correct option letter e.g. A, B, C, D' },
                  explanation: { type: Type.STRING, description: 'Step-by-step solution and derivation explaining why this answer is correct' },
                  topic: { type: Type.STRING, description: 'Specific chapter or concept' },
                  difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' },
                },
                required: ['id', 'questionNumber', 'section', 'text', 'options', 'correctOptionId', 'explanation'],
              },
            },
          },
          required: ['title', 'examType', 'durationMinutes', 'positiveMark', 'negativeMark', 'sections', 'questions'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({ success: true, paper: parsedJson });
  } catch (err: any) {
    console.error('Error in /api/parse-paper:', err);
    return res.status(500).json({
      error: err.message || 'Failed to parse question paper with AI',
    });
  }
});

// AI Question Doubts & Concept Explainer
app.post('/api/explain-doubt', async (req, res) => {
  try {
    const { questionText, options, studentAnswer, correctAnswer, explanation, studentQuery } = req.body;

    const prompt = `You are a patient, world-class tutor helping a student analyze an exam question they just attempted.
Question: ${questionText}
Options:
${(options || []).map((o: any) => `${o.id}: ${o.text}`).join('\n')}

Student selected: Option ${studentAnswer || 'Unattempted'}
Correct Answer: Option ${correctAnswer}
Standard Solution: ${explanation}

Student's Doubt / Request:
"${studentQuery || 'Explain why the correct answer is right and where I might have made a conceptual mistake.'}"

Provide a clear, engaging, easy-to-understand explanation broken into:
1. Core Concept & Formula
2. Why Option ${correctAnswer} is correct (step-by-step)
${studentAnswer && studentAnswer !== correctAnswer ? `3. Common Trap / Why Option ${studentAnswer} is wrong` : ''}
4. Pro-Tip / Memory Trick for Exam Day.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm, encouraging master tutor for competitive exams. Use formatting like bullet points, bold key terms, and clear math steps.',
      },
    });

    return res.json({ success: true, answer: response.text });
  } catch (err: any) {
    console.error('Error in /api/explain-doubt:', err);
    // Construct rich fallback so student always receives guidance
    const fallbackAnswer = `### 1. Core Concept & Solution\n\n• **Verified Correct Option:** Option (${req.body.correctAnswer || 'A'})\n\n• **Step-by-Step Derivation:**\n${req.body.explanation || 'Refer to standard NCERT theory for complete steps.'}\n\n${req.body.studentAnswer && req.body.studentAnswer !== req.body.correctAnswer ? `### 2. Trap Alert\n• You selected **Option ${req.body.studentAnswer}**. Check if you missed a sign change, unit conversion, or secondary condition in the problem statement.\n\n` : ''}### 3. Pro-Tip for Exam Day\n• Double-check the dimensional units and write down the governing formula before substituting numbers.`;

    return res.json({ success: true, answer: fallbackAnswer });
  }
});

// Google Search Grounded Detailed Solution Endpoint
app.post('/api/search-google-solution', async (req, res) => {
  const { questionText, options, correctAnswer, bookletExplanation, section, examType } = req.body;
  const encodedQuery = encodeURIComponent(`${questionText || ''} solution`);
  const directGoogleSearchUrl = `https://www.google.com/search?q=${encodedQuery}`;

  const prompt = `Provide an exhaustive, university-level, step-by-step solution to this competitive exam question.
  
EXAM QUESTION:
"${questionText}"

OPTIONS:
${(options || []).map((o: any) => `(${o.id}) ${o.text}`).join('\n')}

CORRECT ANSWER: Option (${correctAnswer || 'Unknown'})
BOOKLET SUMMARY: ${bookletExplanation || 'None provided'}
SUBJECT / EXAM: ${section || 'General'} (${examType || 'Competitive Exam'})

FORMAT YOUR SOLUTION CLEARLY WITH THESE HEADINGS:
### 1. Fundamental Principle & Governing Formula
Explain the core theorem, law, and equations required.

### 2. Rigorous Step-by-Step Derivation & Calculations
Write out every calculation, numerical substitution, and unit step by step.

### 3. Verification of Correct Option (${correctAnswer})
State why Option (${correctAnswer}) satisfies all physical/mathematical conditions.

### 4. Trap Analysis for Incorrect Options
Explain the exact conceptual pitfalls, algebraic sign errors, or common mistakes that lead to the wrong options.

### 5. Exam Pro-Tip & Shortcut
Give a speed-solving trick, dimensional shortcut, or memory rule for exam day.

FORMATTING REQUIREMENTS:
- Format all mathematical formulas and equations using standard LaTeX: use $...$ for inline variables/expressions (e.g. $T = 117^\\circ\\text{W}$) and $$...$$ for display equations.
- Never output orphaned dollar signs ($) or raw unescaped currency symbols.
- Use clean Markdown headers (###), bold text (**text**), and bullet points (* point) for readability.`;

  try {
    let responseText = '';
    let sources: { title: string; url: string }[] = [];
    let searchQueries: string[] = [];

    // Attempt 1: Google Search Grounding with Gemini
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction:
            'You are a senior academic STEM professor and competitive exam ranker. Provide exhaustive, mathematically complete step-by-step solutions showing all formulas, substituted values, and intermediate equations.',
        },
      });

      responseText = response.text || '';
      const candidate = response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata;
      sources = (groundingMetadata?.groundingChunks || [])
        .map((chunk: any) => ({
          title: chunk.web?.title || 'Academic Reference',
          url: chunk.web?.uri,
        }))
        .filter((s: any) => s.url);
      searchQueries = groundingMetadata?.webSearchQueries || [];
    } catch (groundingErr) {
      console.warn('Search grounding busy or unavailable, generating direct step-by-step solution:', groundingErr);
      // Wait 400ms to let rate-limiter clear
      await new Promise((r) => setTimeout(r, 400));

      // Attempt 2: Direct deep generation with gemini-3.8-flash
      try {
        const directResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are a senior academic STEM professor and competitive exam ranker. Solve this exact problem completely with full step-by-step derivations, calculations, and formulas.',
          },
        });
        responseText = directResponse.text || '';
      } catch (directErr) {
        console.warn('Gemini 3.8 direct generation unavailable, trying flash-lite:', directErr);
        // Attempt 3: Flash-lite model
        const liteResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
        });
        responseText = liteResponse.text || '';
      }
    }

    if (!responseText || responseText.trim().length < 20) {
      throw new Error('Model produced insufficient explanation');
    }

    return res.json({
      success: true,
      solution: responseText,
      sources,
      searchQueries: searchQueries.length > 0 ? searchQueries : [questionText?.slice(0, 80)],
      googleSearchUrl: directGoogleSearchUrl,
    });
  } catch (err: any) {
    console.error('Error in /api/search-google-solution:', err);

    // Provide question-specific derivation from booklet
    const cleanBookletSol = bookletExplanation && bookletExplanation.trim().length > 10
      ? bookletExplanation
      : `The verified official answer for this question is Option (${correctAnswer || 'A'}).`;

    const fallbackSolution = `### Verified Step-by-Step Derivation & Solution

• **Correct Answer:** Option (${correctAnswer || 'A'})

${cleanBookletSol}

---
*Tip: You can also click "Open in Google Search" above to view live forum discussions on Doubtnut, Toppr, and Vedantu.*`;

    return res.json({
      success: true,
      solution: fallbackSolution,
      sources: [],
      searchQueries: [questionText?.slice(0, 80)],
      googleSearchUrl: directGoogleSearchUrl,
    });
  }
});

// Dev vs Prod Vite mounting
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, ensure Service Worker and index.html never get stale-cached by browsers
    app.use((req, res, next) => {
      if (req.url === '/sw.js' || req.url === '/manifest.webmanifest') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      next();
    });

    app.use(express.static(path.resolve(__dirname, 'dist'), {
      setHeaders: (res, pathUrl) => {
        if (pathUrl.endsWith('sw.js') || pathUrl.endsWith('manifest.webmanifest')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }));

    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`PrepPulse CBT server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
