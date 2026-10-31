import React from 'react';
import katex from 'katex';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface SolutionRendererProps {
  content: string;
  className?: string;
}

/**
 * Safely renders LaTeX math expression to HTML string using KaTeX
 */
function renderMath(tex: string, displayMode: boolean = false): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    return tex;
  }
}

/**
 * Renders inline text with math ($...$), bold (**...**), italic (*...*), and code (`...`)
 */
function renderInlineFormattedText(text: string): React.ReactNode {
  // First match math expressions $...$ and $$(display)$$, as well as bold/code
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex to match math: $$...$$ or $...$, or **bold**, or `code`
  const inlineRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/;

  while (remaining.length > 0) {
    const match = remaining.match(inlineRegex);
    if (!match) {
      tokens.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    const matchIndex = match.index!;
    if (matchIndex > 0) {
      tokens.push(<span key={keyIdx++}>{remaining.substring(0, matchIndex)}</span>);
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      const tex = matchedStr.slice(2, -2);
      const html = renderMath(tex, true);
      tokens.push(
        <span
          key={keyIdx++}
          className="my-1.5 block overflow-x-auto py-1 text-center font-serif text-indigo-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      const tex = matchedStr.slice(1, -1);
      const html = renderMath(tex, false);
      tokens.push(
        <span
          key={keyIdx++}
          className="inline-block px-1 align-baseline text-indigo-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      tokens.push(
        <strong key={keyIdx++} className="font-bold text-white">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      tokens.push(
        <code
          key={keyIdx++}
          className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-amber-300"
        >
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      tokens.push(
        <em key={keyIdx++} className="italic text-slate-300">
          {matchedStr.slice(1, -1)}
        </em>
      );
    }

    remaining = remaining.substring(matchIndex + matchedStr.length);
  }

  return <>{tokens}</>;
}

export const SolutionRenderer: React.FC<SolutionRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines/blocks
  const rawLines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let elementIdx = 0;

  let inMathBlock = false;
  let mathBlockBuffer: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Check for multi-line display math $$ ... $$
    if (trimmed.startsWith('$$') && !trimmed.slice(2).includes('$$')) {
      inMathBlock = true;
      mathBlockBuffer = [trimmed.slice(2)];
      continue;
    }
    if (inMathBlock) {
      if (trimmed.endsWith('$$')) {
        inMathBlock = false;
        mathBlockBuffer.push(trimmed.slice(0, -2));
        const tex = mathBlockBuffer.join('\n');
        const html = renderMath(tex, true);
        elements.push(
          <div
            key={elementIdx++}
            className="my-3 overflow-x-auto rounded-xl bg-indigo-950/40 p-3 text-center border border-indigo-900/30"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } else {
        mathBlockBuffer.push(rawLine);
      }
      continue;
    }

    // Single-line display math $$ ... $$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const tex = trimmed.slice(2, -2);
      const html = renderMath(tex, true);
      elements.push(
        <div
          key={elementIdx++}
          className="my-3 overflow-x-auto rounded-xl bg-indigo-950/40 p-3 text-center border border-indigo-900/30"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      continue;
    }

    // Blank lines
    if (!trimmed) {
      continue;
    }

    // Dividers (--- or ***)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(<hr key={elementIdx++} className="my-3.5 border-slate-800/80" />);
      continue;
    }

    // Markdown Headings (#, ##, ###, ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const titleText = headingMatch[2].replace(/\*\*/g, '');

      // Theme-specific icons and colors based on section type
      let headerIcon = <BookOpen className="h-4 w-4" />;
      let headerColorClass = 'text-cyan-300 bg-cyan-950/40 border-cyan-800/40';

      if (/formula|principle|governing|law/i.test(titleText)) {
        headerIcon = <BookOpen className="h-4 w-4 text-cyan-400" />;
        headerColorClass = 'text-cyan-300 bg-cyan-950/50 border-cyan-800/50';
      } else if (/derivation|calculation|step/i.test(titleText)) {
        headerIcon = <Calculator className="h-4 w-4 text-indigo-400" />;
        headerColorClass = 'text-indigo-200 bg-indigo-950/50 border-indigo-800/50';
      } else if (/verification|correct/i.test(titleText)) {
        headerIcon = <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
        headerColorClass = 'text-emerald-200 bg-emerald-950/50 border-emerald-800/50';
      } else if (/trap|pitfall|incorrect|mistake/i.test(titleText)) {
        headerIcon = <AlertTriangle className="h-4 w-4 text-amber-400" />;
        headerColorClass = 'text-amber-200 bg-amber-950/50 border-amber-800/50';
      } else if (/pro-tip|shortcut|trick|tip/i.test(titleText)) {
        headerIcon = <Sparkles className="h-4 w-4 text-purple-400" />;
        headerColorClass = 'text-purple-200 bg-purple-950/50 border-purple-800/50';
      }

      if (level <= 2) {
        elements.push(
          <div
            key={elementIdx++}
            className={`mt-4 mb-2.5 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider ${headerColorClass}`}
          >
            {headerIcon}
            <span>{titleText}</span>
          </div>
        );
      } else {
        elements.push(
          <div
            key={elementIdx++}
            className={`mt-3.5 mb-2 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${headerColorClass}`}
          >
            {headerIcon}
            <span>{titleText}</span>
          </div>
        );
      }
      continue;
    }

    // Step indicators (Step 1:, 1., etc.)
    const stepMatch = trimmed.match(/^(?:####\s*)?(?:Step\s*(\d+)[:.]?|(\d+)[.)]\s*)\s*(.+)$/i);
    if (stepMatch && !trimmed.startsWith('$')) {
      const stepNum = stepMatch[1] || stepMatch[2];
      const stepText = stepMatch[3];
      elements.push(
        <div key={elementIdx++} className="mt-2.5 mb-1.5 flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-[10px] font-bold text-indigo-300 border border-indigo-500/40">
            {stepNum}
          </span>
          <div className="flex-1 text-xs text-slate-200 leading-relaxed font-sans">
            {renderInlineFormattedText(stepText)}
          </div>
        </div>
      );
      continue;
    }

    // Bullet list items (*, -, •)
    const bulletMatch = trimmed.match(/^[*•-]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={elementIdx++} className="my-1 flex items-start gap-2 pl-1.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" />
          <div className="flex-1 text-xs text-slate-200 leading-relaxed font-sans">
            {renderInlineFormattedText(bulletMatch[1])}
          </div>
        </div>
      );
      continue;
    }

    // Regular paragraphs with math formatting
    elements.push(
      <p key={elementIdx++} className="my-1.5 text-xs text-slate-200 leading-relaxed font-sans">
        {renderInlineFormattedText(trimmed)}
      </p>
    );
  }

  return (
    <div className={`solution-container text-slate-200 ${className}`}>
      {elements}
    </div>
  );
};
