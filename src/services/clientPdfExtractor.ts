import * as pdfjsLib from 'pdfjs-dist';

// Use local bundled worker with fallback
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch (e) {
    console.warn('Could not set worker URL, using default:', e);
  }
}

export interface PDFExtractionProgress {
  currentPage: number;
  totalPages: number;
  statusText: string;
}

export class ClientPdfExtractor {
  /**
   * Extracts text from an uploaded PDF file buffer page-by-page
   */
  static async extractTextFromPDF(
    file: File,
    onProgress?: (progress: PDFExtractionProgress) => void
  ): Promise<{ fullText: string; pageCount: number; pages: { pageNumber: number; text: string }[] }> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    const pages: { pageNumber: number; text: string }[] = [];
    let fullText = '';

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (onProgress) {
        onProgress({
          currentPage: pageNum,
          totalPages: pageCount,
          statusText: `Reading page ${pageNum} of ${pageCount}...`,
        });
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Sort items roughly top-to-bottom, left-to-right
      const items = textContent.items as any[];
      const pageStrings: string[] = [];

      let lastY: number | null = null;
      for (const item of items) {
        if (!item.str) continue;
        const currentY = item.transform ? item.transform[5] : null;

        // If line changed significantly, add newline
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
          pageStrings.push('\n');
        } else if (pageStrings.length > 0 && !pageStrings[pageStrings.length - 1].endsWith(' ')) {
          pageStrings.push(' ');
        }

        pageStrings.push(item.str);
        lastY = currentY;
      }

      const pageText = pageStrings.join('').trim();
      pages.push({ pageNumber: pageNum, text: pageText });
      fullText += `\n--- PAGE ${pageNum} ---\n` + pageText + '\n';
    }

    if (onProgress) {
      onProgress({
        currentPage: pageCount,
        totalPages: pageCount,
        statusText: `Extraction complete (${pageCount} pages). Structuring all questions...`,
      });
    }

    return { fullText, pageCount, pages };
  }
}
