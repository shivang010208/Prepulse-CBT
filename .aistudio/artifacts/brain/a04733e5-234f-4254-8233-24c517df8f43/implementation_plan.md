# Implementation Plan: Exam Area Refinements & Revision Deck Analysis

## Objective
1. Remove the calculator tool completely from the active CBT exam area to emulate real examination conditions (NEET/JEE pattern).
2. Add a direct **"Save to Revision Deck"** bookmark button in the bottom action bar of the CBT exam view (right beside "Mark & Next"), with instant visual feedback and sync to `StorageService.toggleBookmark`.
3. Empower the **Revision Deck** (`RevisionVaultView`) with:
   - **Removal Controls**: Single question delete with confirmation or instant undo, plus subject-level clear.
   - **In-Depth Question Analysis**: An "Analyse with Google AI" button on each revision card that invokes `/api/search-google-solution` with KaTeX math rendering, displaying the 5-part university-level derivation (Fundamental Principles, Step-by-Step Derivation, Verification, Trap Analysis for Wrong Options, Exam Pro-Tips).
   - Local persistence of generated analyses so students can re-read them offline.

---

## Detailed Step-by-Step Changes

### Step 1: Clean Up Exam Area (`src/components/CBTTestView.tsx`)
- Remove `Calculator` icon and `CalculatorModal` imports and state (`showCalculator`).
- Remove the Calculator button in the top right header (`Calc`).
- Add a revision deck state tracker (`bookmarkedQuestions: Record<string, boolean>`) initialized from `StorageService.getBookmarks()`.
- Insert a **"Save to Revision"** toggle button in the bottom action bar beside "Mark & Next":
  - Unsaved: Outline bookmark icon + "Save to Revision" (amber/indigo hover).
  - Saved: Solid amber bookmark icon + "Saved to Deck" with quick badge/toast feedback.

### Step 2: Elevate the Revision Deck (`src/components/RevisionVaultView.tsx`)
- Add an **"Analyse Question"** button on each card with a sparkle/brain icon.
- When clicked:
  - Fetches complete step-by-step math derivation via `/api/search-google-solution`.
  - Displays loading pulse with search status.
  - Renders results using the custom `<SolutionRenderer />` (KaTeX equations, trap analysis, formulas).
  - Stores the analysis in component state and `localStorage` so it remains available offline.
- Add an explicit **"Remove from Deck"** button with quick badge feedback and confirmation/undo option.
- Provide quick links to Google Search results and reference links.

### Step 3: Verification
- Verify code compiles cleanly with `compile_applet` and passes TypeScript checks with `lint_applet`.
- Test the exam interface without the calculator, verify saving to revision deck during a mock test, and test question analysis inside the Revision Deck.
