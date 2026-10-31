export interface CleanOption {
  id: string;
  text: string;
}

/**
 * Sanitizes and normalizes question options:
 * 1. Unpacks any options that were merged into a single option (e.g. "Option A (B) Option B")
 * 2. Strips redundant prefixes like "(A)", "A)", "1.", "(1)"
 * 3. Ensures standard A, B, C, D IDs
 */
export function sanitizeQuestionOptions(
  rawOptions?: { id: string; text: string }[]
): CleanOption[] {
  if (!rawOptions || !Array.isArray(rawOptions) || rawOptions.length === 0) {
    return [
      { id: 'A', text: 'Option (A)' },
      { id: 'B', text: 'Option (B)' },
      { id: 'C', text: 'Option (C)' },
      { id: 'D', text: 'Option (D)' },
    ];
  }

  const collected: { id: string; text: string }[] = [];

  for (const opt of rawOptions) {
    const rawText = (opt.text || '').trim();

    // Check if opt.text contains multiple packed options like "nRT (2) zero" or "(B) ..."
    const multiMatchRegex = /(?:^|\s{2,}|\t|\s+(?=\([1-4A-D]\)|[1-4A-D][.)]))(?:\(([1-4A-D])\)|([1-4A-D])[.)])\s*/gi;
    const matches = [...rawText.matchAll(multiMatchRegex)];

    if (matches.length > 1) {
      for (let m = 0; m < matches.length; m++) {
        const match = matches[m];
        const rawId = (match[1] || match[2]).toUpperCase();
        let letter = rawId;
        if (rawId === '1') letter = 'A';
        else if (rawId === '2') letter = 'B';
        else if (rawId === '3') letter = 'C';
        else if (rawId === '4') letter = 'D';

        const startIdx = match.index! + match[0].length;
        const endIdx = m + 1 < matches.length ? matches[m + 1].index! : rawText.length;
        let cleanText = rawText.substring(startIdx, endIdx).trim();
        cleanText = cleanText.replace(/^(?:\([1-4A-D]\)|[1-4A-D][.)])\s*/i, '').trim();

        collected.push({ id: letter, text: cleanText });
      }
    } else {
      let letter = (opt.id || 'A').toUpperCase();
      if (letter === '1') letter = 'A';
      else if (letter === '2') letter = 'B';
      else if (letter === '3') letter = 'C';
      else if (letter === '4') letter = 'D';

      let cleanText = rawText.replace(/^(?:\([1-4A-D]\)|[1-4A-D][.)])\s*/i, '').trim();
      collected.push({ id: letter, text: cleanText || `Option ${letter}` });
    }
  }

  // Deduplicate by option ID (A, B, C, D)
  const map = new Map<string, string>();
  for (const item of collected) {
    if (!map.has(item.id)) {
      map.set(item.id, item.text);
    }
  }

  const standardIds = ['A', 'B', 'C', 'D'];
  return standardIds.map((id, idx) => {
    const existing = map.get(id);
    if (existing) return { id, text: existing };
    // If fewer options were provided, check collected by index
    if (collected[idx] && !standardIds.includes(collected[idx].id)) {
      return { id, text: collected[idx].text };
    }
    return { id, text: `Option (${id})` };
  });
}
