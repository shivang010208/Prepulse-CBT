# PrepPulse CBT - Autonomous Exam Ingestion & CBT Simulation Engine 🚀

> **Hackathon Submission:** Going beyond conversational chatbots by combining **multimodal document reasoning**, **agentic extraction workflows**, **grounded web search orchestration**, and **100% offline edge execution** into an autonomous exam preparation platform.

🌐 **Live Demo:** [https://ais-pre-56ogzwpk45olyxt5g5g3th-723477198949.asia-east1.run.app](https://ais-pre-56ogzwpk45olyxt5g5g3th-723477198949.asia-east1.run.app)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Google_AI_Studio-4285F4.svg?style=flat&logo=google)](https://ais-pre-56ogzwpk45olyxt5g5g3th-723477198949.asia-east1.run.app)
[![Hackathon Track](https://img.shields.io/badge/Track-Agentic_Workflows_&_Multimodal_AI-ff69b4.svg)](#-agentic-architecture--multimodal-intelligence)
[![Google AI Studio](https://img.shields.io/badge/LLM-Gemini_2.5_Flash_/_1.5_Flash-4285F4.svg?logo=google)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![KaTeX Math](https://img.shields.io/badge/Math_Renderer-KaTeX-3298dc.svg)](https://katex.org/)
[![PWA Offline Ready](https://img.shields.io/badge/PWA-100%25_Offline_Execution-purple.svg)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 💡 Problem Statement

Millions of students preparing for high-stakes competitive examinations (such as **NEET, JEE Main/Advanced, UPSC, GATE, and State CETs**) study from mock papers, test series, and question banks distributed as **unstructured PDFs, low-quality smartphone scans, and pasted text strings in Telegram study channels**.

However, students face three major friction points:
1. **Passive PDF Reading vs. Realistic Exam Pressure**: Reading a PDF on a screen does not prepare students for the strict timing, question-palette navigation, and negative-marking pressure of computerized testing environments (such as NTA CBT).
2. **Brittle Conversational Chatbots**: Simple Q&A chatbots are ineffective for end-to-end exam simulation—they lack document structure awareness, cannot parse 180 questions into interactive state machines, frequently hallucinate answers, and produce unformatted mathematical formulas.
3. **Connectivity Vulnerability**: Most digital assessment platforms require uninterrupted high-speed internet. Students in areas with intermittent connectivity or who study in airplane mode to avoid notifications cannot practice.

---

## 🎯 Solution Overview

**PrepPulse CBT** transforms unstructured exam materials into a fully interactive, timed **Computer-Based Testing (CBT) portal** with zero manual data entry.

Instead of a generic chatbot, PrepPulse implements an **autonomous task pipeline**:
* **Autonomous Document Ingestion Agent**: Accepts PDF documents, scanned images, or raw text clips directly from Telegram. The agent detects question boundaries, disambiguates column layouts, separates question stems from options, identifies the answer key, and categorizes subjects (Physics, Chemistry, Biology, Mathematics).
* **Deterministic Option Sanitizer**: Normalizes malformed options (e.g., inline numbers `(1) 12 m/s (2) 15 m/s` or messy OCR linebreaks) into standardized multiple-choice schemas.
* **Realistic CBT Simulation State Machine**: Implements authentic NTA exam mechanics with positive/negative scoring (+4 / -1), a responsive question palette (Answered, Not Answered, Marked for Review), and a digital scratchpad.
* **Grounded Multi-Step Derivation Agent**: For any tricky question, triggers an agentic workflow using **Google Gemini with Search Grounding** to search academic sources, verify options, analyze trap choices, and synthesize exhaustive step-by-step mathematical derivations formatted in **KaTeX**.
* **Edge-First Offline Revision Vault**: Powered by an installable PWA service worker and browser storage, allowing all parsed tests, question palettes, scratchpad notes, and derived solutions to run **100% offline**.

---

## 🧠 Agentic Architecture & Multimodal Intelligence

PrepPulse moves past traditional prompt-reply loops by orchestrating specialized agents:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INGESTION & REASONING PIPELINE                         │
└─────────────────────────────────────────────────────────────────────────────┘
  Raw Input (PDF / Telegram Scan / Text)
      │
      ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 1. Multimodal Document Extraction Agent (Gemini Flash)  │
 │    • Optical document layout analysis                   │
 │    • Multi-column question segmentation                 │
 │    • Automatic Answer Key & Solution extraction         │
 └────────────────────────────┬────────────────────────────┘
                              │
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 2. Deterministic Option Sanitizer Engine                │
 │    • Splits clustered inline choices                    │
 │    • Strips repetitive option tags (A, B, C, D)         │
 │    • Enforces structured JSON schema validation         │
 └────────────────────────────┬────────────────────────────┘
                              │
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 3. Interactive NTA CBT Exam Runtime (React + IndexedDB) │
 │    • Timer countdown & positive/negative tally          │
 │    • Rough sheet canvas & question palette grid         │
 │    • 1-Click "Save to Revision Deck" action             │
 └────────────────────────────┬────────────────────────────┘
                              │
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 4. Search-Grounded Academic Derivation Agent (Gemini)   │
 │    • Autonomous Google Search retrieval                 │
 │    • Formula identification & mathematical proofs       │
 │    • Trap Analysis for incorrect options                │
 │    • KaTeX typography rendering & local caching         │
 └─────────────────────────────────────────────────────────┘
```

### 1. Multimodal Document Agent
Uses **Google Gemini** multimodal vision to process multi-page exam booklets. It extracts dense questions containing mathematical fractions, chemical reactions, and physics notations directly from raw PDFs without manual retyping.

### 2. Search-Grounded AI Derivation Agent
When a student saves a problem to the **Revision Deck** or reviews test results, the derivation agent conducts live query expansion and search grounding via Google's search index to:
- Cite authoritative academic references.
- Deconstruct common conceptual traps that lead to the wrong answer choices.
- Output clean LaTeX math expressions (`$...$` and `$$...$$`) rendered with high-precision typography by **KaTeX**.

---

## 🛠️ Technologies, APIs, and Libraries

### AI & Multimodal Reasoning
* **Google Gemini API (`@google/genai`)**: Powers document extraction, multi-column exam reasoning, and search-grounded step-by-step derivations using free-tier API quotas.
* **Google Search Tool Grounding**: Grounds generated academic solutions against real textbook citations, preventing hallucinations.

### Frontend & CBT Architecture
* **React 19 & TypeScript**: High-performance UI rendering for real-time exam countdowns, scratchpad canvas, and question status trees.
* **Vite 8**: Ultra-fast module bundling and developer server.
* **Tailwind CSS v4**: Theme styling with zero-pill visual hierarchy and high-contrast dark palette.
* **Lucide React**: Crisp iconography for question navigation and status palettes.
* **Motion**: Smooth micro-interactions for modal flows and toasts.

### Math Typography & Document Parsing
* **KaTeX (`katex` + `@types/katex`)**: Fast, server/client-side mathematical equation rendering for complex calculus, kinematics, and chemical equilibrium.
* **`pdf-parse` & `pdfjs-dist`**: Multi-tiered PDF text and stream parsing with client/server fallbacks.

### PWA & Offline Engine
* **`vite-plugin-pwa` & Workbox**: Service Worker lifecycle management with auto-updates, `clientsClaim`, and instant `controllerchange` reloading.
* **Browser Storage (LocalStorage / IndexedDB)**: Offline persistence for tests, attempts, and cached AI derivations.

---

## 📋 Features at a Glance

| Feature | Description |
|---|---|
| **One-Click Paper Ingestion** | Upload Telegram PDFs, pasted questions, or images and generate complete tests instantly. |
| **Official CBT Interface** | Full-screen timed environment with countdown clocks, positive/negative marks (+4/-1, +2/-0.66), and status color-coding. |
| **Top & Bottom Submit Controls** | Clear, persistent submit controls accessible across all mobile and desktop viewports. |
| **Built-in Rough Sheet** | Drawing canvas to solve calculations directly inside the test window without external paper. |
| **Revision Deck** | One-click bookmarking from the exam action bar, subject-based filtering, and quick deletion controls. |
| **Deep Solution Derivations** | Five-point pedagogical breakdown with KaTeX rendering: Principle, Step-by-Step Derivation, Verification, Trap Analysis, and Exam Pro-Tips. |
| **100% Offline PWA** | Works without an active connection; installable on Android, iOS, Windows, macOS, and Linux. |

---

## 🚀 Step-by-Step Instructions to Run Locally

Follow these steps to set up and run the application locally on your machine.

### Prerequisites
* **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
* **npm**: `v9.0.0` or higher (comes bundled with Node.js)
* **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/preppulse-cbt.git
cd preppulse-cbt
```

---

### Step 2: Install Dependencies
```bash
npm install
```

---

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
*(If `.env.example` is not present, create a `.env` file directly)*:
```env
# Free Google AI Studio API Key (for Multimodal Extraction & Grounded Search)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (default 3000)
PORT=3000
```

> **Note:** The application includes seeded mock papers and offline parsing fallback, so the CBT simulation, Question Palette, and Scratchpad work immediately even without an API key. An API key enables the AI PDF Parser and Search-Grounded Solution Derivations.

---

### Step 4: Run the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### Step 5: Build & Run Production Bundle
To test the production build with full Service Worker PWA caching:

```bash
# 1. Compile the production bundle
npm run build

# 2. Launch production server
npm start
```

---

## 🧪 Testing the Autonomous Workflows

1. **Test the CBT Engine**:
   - Open the live demo or local instance.
   - Click **"Start CBT Test"** on any seeded test paper (e.g., NEET 2024 Full Mock).
   - Use the **Question Palette**, mark answers, use the **Rough Sheet**, and click **"Save to Revision"** on tricky questions.
   - Click **Submit** to view comprehensive score analytics.
2. **Test Autonomous PDF Ingestion**:
   - Click **"Upload Paper"** in the top navigation bar.
   - Paste sample Telegram test text or upload a mock test PDF.
   - Observe how the agent automatically segments questions, detects the answer key, and creates a playable test.
3. **Test Search-Grounded AI Derivations**:
   - Navigate to the **Offline Revision Deck** from the top menu.
   - On any bookmarked question, click **"Analyse Question"**.
   - Watch the agent search academic sources and render a step-by-step mathematical proof in KaTeX.

---

## 👥 Hackathon Submission Details

* **Project Name**: PrepPulse CBT - Student Exam Hub
* **Category / Track**: Beyond Chatbots: Agentic Workflows & Multimodal Reasoning
* **Primary Model**: Google Gemini (via `@google/genai` TypeScript SDK)
* **Live Deployment**: [PrepPulse on Google AI Studio](https://ais-pre-56ogzwpk45olyxt5g5g3th-723477198949.asia-east1.run.app)
* **License**: MIT
