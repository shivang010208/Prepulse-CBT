# PrepPulse CBT - Student Exam Hub 🚀

> Turn Telegram test PDFs, scanned papers, and mock booklets into timed Computer-Based Tests (CBT) with step-by-step derivations, KaTeX math rendering, and 100% offline PWA support.
>
> 🌐 **Live Demo:** [https://symphonious-snickerdoodle-382326.netlify.app/](https://symphonious-snickerdoodle-382326.netlify.app/)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-00ad9f.svg?style=flat&logo=netlify)](https://symphonious-snickerdoodle-382326.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-orange.svg)](https://ai.google.dev/)

---

## 📌 Overview

**PrepPulse CBT** is an open-source, exam-prep workspace designed for competitive exam aspirants (NEET, JEE Main/Advanced, UPSC, GATE, SSC, and State CETs). 

Students often find mock papers, coaching booklets (Allen, Resonance, Aakash, etc.), and test keys shared on Telegram channels as static PDFs or images. PrepPulse instantly parses these PDFs or pasted text into an **official NTA-style timed CBT exam interface**, tracks your score with positive/negative marking schemes, and provides step-by-step mathematical derivations with KaTeX formatting.

---

## ✨ Key Features

- 📑 **Smart PDF & Telegram Parser**:
  - Automatically parses exam PDFs, multi-column questions, and answer keys.
  - Robust option sanitizer splits multi-choice strings (e.g., `(1) 11.3 N  (2) 19.6 N`) into standard A, B, C, D choices.
  - Extracts subject sections (Physics, Chemistry, Biology / Mathematics).

- ⏱️ **Authentic CBT Testing Environment**:
  - NTA-style Question Palette with real-time status indicators (Answered, Not Answered, Marked for Review, Not Visited).
  - Configurable countdown timer, positive/negative marking (+4/-1 for NEET/JEE, +2/-0.66, etc.).
  - Built-in Scratchpad canvas for rough calculations and scientific calculator.

- 🧮 **Textbook-Quality Derivations & KaTeX Math**:
  - Formulas, fractions, and Greek symbols rendered cleanly with **KaTeX** ($...$ and $$...$$).
  - Clear sectioning: *Fundamental Principles*, *Step-by-Step Derivation*, *Trap Analysis for Wrong Options*, and *Exam Pro-Tips*.
  - Grounded Google AI Search solver to fetch university-level step-by-step solutions for any problem.

- 📱 **Installable Progressive Web App (PWA)**:
  - 1-click install on Android, iOS (Safari Add to Home Screen), and Desktop (Windows, macOS, Linux).
  - 100% offline capability — downloaded test papers and attempts persist locally using IndexedDB/LocalStorage.
  - Auto-updating service worker keeps test papers and features synced.

- 📚 **Mistake Vault & Revision Tracker**:
  - Bookmark tricky questions with 1-click.
  - Filter bookmarked questions by subject for targeted revision before exam day.
  - Re-attempt tests to track percentage improvement over time.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion.
- **Math Rendering**: KaTeX with customized `SolutionRenderer` supporting display and inline LaTeX.
- **Backend / API**: Express, Node.js (`tsx`), Google Gen AI SDK (`@google/genai`).
- **PWA & Offline**: `vite-plugin-pwa`, Workbox Service Workers, LocalStorage / IndexedDB.
- **PDF Processing**: `pdf-parse`, `pdfjs-dist`, Client-side & Server-side extraction fallback.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/preppulse-cbt.git
   cd preppulse-cbt
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory (optional for local mock testing, required for Google AI search solver):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

To create an optimized production build:
```bash
npm run build
```

To run the production server:
```bash
npm start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
