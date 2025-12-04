// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import type { StoryDocument } from '../types';

// --- Utility Types and Interfaces ---

/**
 * Represents the format and content for a PDF header or footer.
 * Can be a simple string, or more complex HTML content.
 */
export type PdfTemplateContent = string;

/**
 * Defines the options for PDF generation, allowing customization of the output.
 */
export interface PdfGenerationOptions {
  /** The title for the PDF document metadata. Defaults to story title. */
  title?: string;
  /** The author for the PDF document metadata. Defaults to story author. */
  author?: string;
  /** Keywords for the PDF document metadata. */
  keywords?: string[];
  /** Subject for the PDF document metadata. */
  subject?: string;
  /** Page size, e.g., 'A4', 'Letter', 'Legal'. Defaults to 'A4'. */
  pageSize?: 'A4' | 'Letter' | 'SacredScroll' | 'Legal' | 'Tabloid' | 'Ledger';
  /** Page orientation, 'portrait' or 'landscape'. Defaults to 'portrait'. */
  orientation?: 'portrait' | 'landscape';
  /** Custom margins for the document. Values in CSS-like units (e.g., '1in', '20mm', '1cm'). */
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  /** HTML content or template for the header. Supports placeholders like {pageNumber}, {totalPages}, {title}. */
  headerTemplate?: PdfTemplateContent;
  /** HTML content or template for the footer. Supports placeholders. */
  footerTemplate?: PdfTemplateContent;
  /** Base URL for resolving relative paths in HTML, e.g., for images. */
  baseUrl?: string;
  /** Enable or disable background graphics (colors, images) in the PDF. Defaults to true. */
  printBackground?: boolean;
  /** Scale factor for the webpage rendering (e.g., 0.5 for 50%, 2 for 200%). Defaults to 1. */
  scale?: number;
}

/**
 * Custom error class for PDF generation failures.
 */
export class PdfGenerationError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(`PDF Generation Error: ${message}`);
    this.name = 'PdfGenerationError';
    Object.setPrototypeOf(this, PdfGenerationError.prototype);
  }
}

// --- Internal Utilities (Not exported, but part of the service's quality) ---

/**
 * A basic logger for internal use. In a real-world scenario, this would integrate with a global logging system.
 */
class Logger {
  private static instance: Logger;
  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, context?: Record<string, any>) {
    console.log(`[INFO] [PdfService] ${message}`, context ? JSON.stringify(context) : '');
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(`[WARN] [PdfService] ${message}`, context ? JSON.stringify(context) : '');
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    console.error(`[ERROR] [PdfService] ${message}`, error, context ? JSON.stringify(context) : '');
  }
}

const logger = Logger.getInstance();

/**
 * Converts a StoryDocument into an HTML string suitable for PDF rendering.
 * This class assumes the StoryDocument's 'content' field can be either plain text or HTML.
 * For production, this would involve a robust templating engine and potentially a Markdown parser.
 */
export class StoryContentProcessor {
  /**
   * Generates a complete HTML string from a StoryDocument.
   * @param doc The StoryDocument to process.
   * @param options PDF generation options to influence template.
   * @returns A Promise resolving to the HTML string.
   */
  public async toHtml(doc: StoryDocument, options?: PdfGenerationOptions): Promise<string> {
    logger.info(`Processing StoryDocument '${doc.title}' into HTML.`);

    // Sanitize and structure the content.
    // In a real scenario, this would use a proper HTML sanitizer to prevent XSS.
    const sanitizedContent = this.getSanitizedContent(doc.content);

    // Basic templating logic (simulate a real templating engine like Handlebars or EJS)
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${options?.title || doc.title || 'Untitled Document'}</title>
          <style>
              @page {
                  size: ${options?.pageSize || 'A4'} ${options?.orientation || 'portrait'};
                  margin: ${options?.margins?.top || '1cm'} ${options?.margins?.right || '1cm'} ${options?.margins?.bottom || '1cm'} ${options?.margins?.left || '1cm'};
                  @top-center { content: "${this.applyTemplatePlaceholders(options?.headerTemplate || '', doc, { currentPage: 0, totalPages: 0 }, false)}"; }
                  @bottom-center { content: "${this.applyTemplatePlaceholders(options?.footerTemplate || 'Page {pageNumber} / {totalPages}', doc, { currentPage: 0, totalPages: 0 }, false)}"; }
              }
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0; /* Margins set by @page rule */
                  padding: 0;
                  box-sizing: border-box;
              }
              h1, h2, h3, h4, h5, h6 {
                  color: #2c3e50;
                  margin-top: 1.5em;
                  margin-bottom: 0.8em;
              }
              h1 { font-size: 2.2em; border-bottom: 2px solid #ddd; padding-bottom: 0.3em; }
              h2 { font-size: 1.8em; }
              h3 { font-size: 1.4em; }
              p { margin-bottom: 1em; text-align: justify; }
              img { max-width: 100%; height: auto; display: block; margin: 1em auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
              blockquote {
                  border-left: 4px solid #f39c12;
                  padding-left: 1em;
                  margin-left: 0;
                  color: #555;
                  font-style: italic;
              }
              code {
                  background-color: #eee;
                  padding: 0.2em 0.4em;
                  border-radius: 3px;
              }
              pre {
                  background-color: #f8f8f8;
                  border: 1px solid #ddd;
                  padding: 1em;
                  border-radius: 5px;
                  overflow-x: auto;
              }
              /* Placeholder for dynamic styles */
          </style>
      </head>
      <body>
          <div class="pdf-content">
              <h1>${doc.title || 'Untitled Story'}</h1>
              ${doc.author ? `<p><em>By ${doc.author}</em></p>` : ''}
              ${doc.createdAt ? `<p><strong>Published:</strong> ${new Date(doc.createdAt).toLocaleDateString()}</p>` : ''}
              <hr/>
              ${sanitizedContent}
              ${this.generateSectionsHtml(doc)}
          </div>
      </body>
      </html>
    `;

    return htmlTemplate;
  }

  /**
   * A very basic sanitization/processing of the content.
   * In a real system, this would use a library like 'dompurify' or a Markdown parser.
   * For now, it assumes 'content' is mostly clean HTML or plain text that should be wrapped in paragraphs.
   * @param content The content string from StoryDocument.
   * @returns Sanitized/processed HTML string.
   */
  private getSanitizedContent(content: string | undefined): string {
    if (!content) return '';
    // Very basic check: if it looks like HTML (contains <, >), assume it's HTML.
    // Otherwise, wrap in paragraphs.
    if (/<[a-z][\s\S]*>/i.test(content)) {
      logger.warn("Content appears to be HTML. Skipping extensive sanitization for this stub. ENSURE real sanitization in production!");
      // For a real system, use DOMPurify: DOMPurify.sanitize(content);
      return content;
    } else {
      // Treat as plain text, convert newlines to paragraphs
      return `<p>${content.split('\n\n').map(p => p.trim()).filter(p => p).join('</p><p>')}</p>`;
    }
  }

  /**
   * Generates HTML for sections, assuming a StoryDocument structure with a 'sections' array.
   * This uses a type assertion as StoryDocument is an opaque type.
   * @param doc The StoryDocument.
   * @returns HTML string for sections.
   */
  private generateSectionsHtml(doc: StoryDocument): string {
    if (!('sections' in doc) || !Array.isArray((doc as any).sections)) {
      return '';
    }
    const sections = (doc as any).sections;
    if (!sections || sections.length === 0) return '';

    let sectionsHtml = '';
    for (const section of sections) {
      if (section && typeof section === 'object' && 'title' in section && 'body' in section) {
        sectionsHtml += `<h2>${section.title}</h2>`;
        sectionsHtml += `<p>${this.getSanitizedContent(section.body as string)}</p>`; // Assuming section.body is also string
        if ('imageUrl' in section && typeof section.imageUrl === 'string' && section.imageUrl) {
          sectionsHtml += `<img src="${section.imageUrl}" alt="${(section as any).caption || section.title || 'Image'}">`;
          if ('caption' in section && typeof section.caption === 'string' && section.caption) {
            sectionsHtml += `<p class="caption">${section.caption}</p>`;
          }
        }
      }
    }
    return sectionsHtml;
  }

  /**
   * Applies placeholders to a template string.
   * This is a very basic replacement; a full templating engine would be used in production.
   * @param template The template string.
   * @param doc The StoryDocument.
   * @param pageInfo Current page information (for header/footer).
   * @param escapeHTML Whether to escape HTML entities in the replacements. True for content, false for CSS content string.
   * @returns Processed string.
   */
  private applyTemplatePlaceholders(template: string, doc: StoryDocument, pageInfo: { currentPage: number, totalPages: number }, escapeHTML: boolean = true): string {
    let processed = template;

    const escape = (str: string | undefined) => {
      if (!str) return '';
      return escapeHTML ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;') : str;
    };

    processed = processed.replace(/{title}/g, escape(doc.title));
    processed = processed.replace(/{author}/g, escape(doc.author));
    processed = processed.replace(/{pageNumber}/g, String(pageInfo.currentPage));
    processed = processed.replace(/{totalPages}/g, String(pageInfo.totalPages));
    processed = processed.replace(/{currentDate}/g, new Date().toLocaleDateString());
    processed = processed.replace(/{currentTime}/g, new Date().toLocaleTimeString());
    processed = processed.replace(/{currentYear}/g, String(new Date().getFullYear()));
    // Add more placeholders as needed
    return processed;
  }
}

/**
 * The main PDF Generation Service.
 * This service orchestrates the conversion of a StoryDocument into a PDF.
 * It abstracts away the underlying PDF rendering engine.
 */
export class PdfGeneratorService {
  private readonly contentProcessor: StoryContentProcessor;

  constructor() {
    this.contentProcessor = new StoryContentProcessor();
  }

  /**
   * Generates a PDF document from a StoryDocument.
   * In a production environment, this would interface with a PDF rendering library
   * (e.g., Puppeteer for HTML-to-PDF, or PDF-LIB for programmatic PDF creation).
   *
   * @param doc The StoryDocument to convert to PDF.
   * @param options Optional settings for PDF generation.
   * @returns A Promise that resolves with a Uint8Array representing the PDF's binary content.
   * @throws {PdfGenerationError} if generation fails.
   */
  public async generatePdf(doc: StoryDocument, options?: PdfGenerationOptions): Promise<Uint8Array> {
    if (!doc || !doc.title) {
      logger.error('Invalid StoryDocument provided for PDF generation.', new Error('Document title is missing.'));
      throw new PdfGenerationError('StoryDocument is invalid or missing a title.');
    }

    logger.info(`Starting PDF generation for document: '${doc.title}'`, { docId: (doc as any).id });

    try {
      // 1. Convert StoryDocument to HTML
      const htmlContent = await this.contentProcessor.toHtml(doc, options);
      logger.info(`HTML content prepared for '${doc.title}'. Length: ${htmlContent.length} chars.`);

      // 2. Simulate PDF rendering (THIS IS A STUB FOR THE ACTUAL LIBRARY CALL)
      // In a real application, this would involve calling a library like Puppeteer or pdf-lib:
      //
      // import puppeteer from 'puppeteer'; // <-- This would be added if 'no new imports' wasn't a constraint
      // const browser = await puppeteer.launch({ headless: true });
      // const page = await browser.newPage();
      // // Set PDF metadata
      // await page.evaluate(opts => {
      //   document.title = opts.title;
      //   // More complex metadata might involve specific libraries or custom JS on page
      // }, { title: options?.title || doc.title });
      // await page.setContent(htmlContent, { waitUntil: 'networkidle0', baseURL: options?.baseUrl });
      // const pdfBuffer = await page.pdf({
      //   format: options?.pageSize || 'A4',
      //   landscape: options?.orientation === 'landscape',
      //   printBackground: options?.printBackground ?? true,
      //   scale: options?.scale ?? 1,
      //   margin: options?.margins,
      //   headerTemplate: options?.headerTemplate, // Puppeteer uses these for dynamic content
      //   footerTemplate: options?.footerTemplate,
      //   displayHeaderFooter: !!(options?.headerTemplate || options?.footerTemplate),
      // });
      // await browser.close();
      // return pdfBuffer;

      // Since we cannot import external libraries, we return a mock Uint8Array.
      logger.warn("Simulating PDF generation due to 'no new imports' constraint. Real PDF library integration is required for production.");

      // Example of mock PDF content (a very small, invalid PDF header for demonstration)
      // A more sophisticated mock could generate a simple text PDF using a built-in library,
      // but without external dependencies, even that is complex.
      const mockPdfHeader = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000055 00000 n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n104\n%%EOF`;
      const pdfBytes = new TextEncoder().encode(mockPdfHeader + `\n<!-- Mock PDF generated on ${new Date().toISOString()} for: ${doc.title} -->`);

      logger.info(`Successfully simulated PDF generation for '${doc.title}'.`);
      return pdfBytes; // Return a mock Uint8Array
    } catch (error: any) {
      logger.error(`Failed to generate PDF for document: '${doc.title}'`, error, { docId: (doc as any).id });
      throw new PdfGenerationError(`Failed to generate PDF for '${doc.title}': ${error.message}`, error);
    }
  }
}

// --- Main Exported Function ---

// Instantiate the service for direct use by the main export.
const pdfGenerator = new PdfGeneratorService();

/**
 * Generates a PDF document from a StoryDocument.
 * This is the primary entry point for PDF generation.
 *
 * @param doc The StoryDocument to convert.
 * @param options Optional settings for PDF generation.
 * @returns A Promise resolving to a `Uint8Array` containing the PDF's binary data.
 * @throws {PdfGenerationError} if the PDF generation process encounters an error.
 */
export const createPdf = async (doc: StoryDocument, options?: PdfGenerationOptions): Promise<Uint8Array> => {
  logger.info(`Public API call to createPdf for document: '${doc.title}'`);
  return pdfGenerator.generatePdf(doc, options);
};

// --- Additional Exported Utilities / Constants ---

/**
 * Provides standard PDF generation options presets.
 * These can be merged with specific document options for flexible configuration.
 */
export const PdfOptionPresets = {
  DEFAULT: {} as PdfGenerationOptions, // Empty for default behavior
  REPORT_STANDARD: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    headerTemplate: `<div style="width:100%; text-align:center; font-size:10px;">{{currentYear}} Report - {{title}}</div>`,
    footerTemplate: `<div style="width:100%; text-align:right; font-size:9px;">Page {{pageNumber}} of {{totalPages}}</div>`,
  } as PdfGenerationOptions,
  EBOOK_READABLE: {
    pageSize: 'SacredScroll', // A custom page size for thematic documents
    orientation: 'portrait',
    margins: { top: '3cm', right: '3cm', bottom: '3cm', left: '3cm' },
    printBackground: true,
    scale: 1.1, // Slightly larger text for readability
    headerTemplate: `<div style="width:100%; text-align:center; font-size:12px; font-style:italic;">{{title}} by {{author}}</div>`,
    footerTemplate: `<div style="width:100%; text-align:center; font-size:10px;">- {{pageNumber}} -</div>`,
  } as PdfGenerationOptions,
  // Add more presets as needed, e.g., for invoices, contracts, presentations.
};

/**
 * Creates a simple 'summary' PDF for a StoryDocument, focusing on key metadata.
 * This demonstrates how different PDF creation workflows could be exposed, potentially
 * using different templates or content processing logic.
 *
 * @param doc The StoryDocument to summarize.
 * @returns A Promise resolving to a `Uint8Array` containing the PDF's binary data.
 * @throws {PdfGenerationError} if the PDF generation process encounters an error.
 */
export const createStorySummaryPdf = async (doc: StoryDocument): Promise<Uint8Array> => {
  logger.info(`Generating summary PDF for document: '${doc.title}'`);

  if (!doc || !doc.title) {
    logger.error('Invalid StoryDocument provided for summary PDF generation.', new Error('Document title is missing.'));
    throw new PdfGenerationError('StoryDocument is invalid or missing a title for summary generation.');
  }

  // A dedicated content processor instance for summary, or a specific method on the shared one.
  const summaryContentProcessor = new StoryContentProcessor();

  // Create a specific HTML structure for the summary.
  const summaryHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Summary: ${doc.title}</title>
        <style>
            @page {
                size: A5 portrait;
                margin: 1.5cm;
                @bottom-center { content: "Story Summary"; }
            }
            body { font-family: 'Georgia', serif; margin: 0; line-height: 1.5; color: #444; }
            h1 { color: #0056b3; font-size: 1.8em; border-bottom: 1px solid #eee; padding-bottom: 0.5em; }
            h2 { color: #333; font-size: 1.3em; margin-top: 1.5em; }
            p { margin-bottom: 0.8em; }
            strong { color: #222; }
            em { color: #666; }
            blockquote { border-left: 5px solid #ccc; margin: 1.5em 0; padding: 0.5em 1em; background-color: #f9f9f9; font-style: italic; color: #555; }
            .meta-data p { margin: 0.2em 0; }
            .generation-info { font-size: 0.75em; color: #777; margin-top: 2em; text-align: center; }
        </style>
    </head>
    <body>
        <h1>Story Summary: ${summaryContentProcessor.applyTemplatePlaceholders(doc.title, doc, {currentPage: 0, totalPages: 0})}</h1>
        <div class="meta-data">
            <p><strong>Author:</strong> ${summaryContentProcessor.applyTemplatePlaceholders(doc.author || 'N/A', doc, {currentPage: 0, totalPages: 0})}</p>
            <p><strong>Published Date:</strong> ${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Last Updated:</strong> ${doc.updatedAt ? new Date((doc as any).updatedAt).toLocaleDateString() : 'N/A'}</p>
        </div>
        <h2>Overview</h2>
        <blockquote>
            ${summaryContentProcessor.getSanitizedContent((doc.content || '').substring(0, Math.min((doc.content || '').length, 500)))}${((doc.content || '').length > 500 ? '...' : '')}
        </blockquote>
        ${((doc as any).sections && ((doc as any).sections as any[]).length > 0) ? `
          <h2>Sections Included:</h2>
          <ul>
            ${((doc as any).sections as any[]).map(s => `<li>${s.title}</li>`).join('')}
          </ul>
        ` : ''}
        <div class="generation-info">
            <p><em>Summary generated by our service on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</em></p>
        </div>
    </body>
    </html>
  `;

  // Define specific options for the summary PDF
  const summaryOptions: PdfGenerationOptions = {
    title: `Summary: ${doc.title}`,
    author: doc.author || 'N/A',
    pageSize: 'A5',
    orientation: 'portrait',
    margins: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
    footerTemplate: 'Story Summary', // This content will be rendered by the @bottom-center CSS rule
  };

  try {
    // Simulate PDF generation with the specific summary HTML and options.
    // In a real system, you'd feed summaryHtml directly to the PDF rendering engine.
    logger.warn("Simulating summary PDF generation. Returning a mock Uint8Array.");
    const mockPdfHeader = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000055 00000 n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n104\n%%EOF`;
    const pdfBytes = new TextEncoder().encode(mockPdfHeader + `\n<!-- Mock Summary PDF generated on ${new Date().toISOString()} for: ${doc.title} -->`);
    return pdfBytes;
  } catch (error: any) {
    logger.error(`Failed to generate summary PDF for document: '${doc.title}'`, error, { docId: (doc as any).id });
    throw new PdfGenerationError(`Failed to generate summary PDF for '${doc.title}': ${error.message}`, error);
  }
};