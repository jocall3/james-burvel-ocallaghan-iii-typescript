// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import type { StoryDocument } from '../../../types';

// --- NEW HELPER UTILITIES & COMPONENTS (All exported as per instruction) ---

/**
 * Estimates the reading time for a given text.
 * @param text The string content to estimate reading time for.
 * @returns A string indicating the estimated reading time (e.g., "5 min read").
 */
export const estimateReadingTime = (text: string): string => {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.split(/\s+/g).filter(Boolean).length;
    if (wordCount === 0) return '0 min read';
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
};

/**
 * Props for the MagazineHeader component.
 */
interface MagazineHeaderProps {
    title: string;
    author?: string; // Optional author, assuming StoryDocument might be extended later
    publishDate?: string; // Optional publish date, assuming StoryDocument might be extended later
    readingTime?: string; // Overall document reading time
}

/**
 * MagazineHeader component for displaying the document's main title, author, publish date, and reading time.
 * Designed for a prominent, professional look.
 */
export const MagazineHeader: React.FC<MagazineHeaderProps> = ({ title, author, publishDate, readingTime }) => {
    return (
        <header className="magazine-header mb-8 text-center border-b border-gray-200 pb-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">{title}</h1>
            {author && <p className="text-lg sm:text-xl text-gray-700 mt-3">By <span className="font-semibold text-blue-700">{author}</span></p>}
            {(publishDate || readingTime) && (
                <p className="text-md text-gray-500 mt-2 flex justify-center items-center gap-2">
                    {publishDate && <time dateTime={new Date(publishDate).toISOString().split('T')[0]}>Published on {publishDate}</time>}
                    {publishDate && readingTime && <span className="text-gray-400">•</span>}
                    {readingTime && <span aria-label={`Estimated reading time: ${readingTime}`}>{readingTime}</span>}
                </p>
            )}
        </header>
    );
};

/**
 * Props for the MagazineTableOfContents component.
 */
interface TableOfContentsProps {
    chapters: Array<{ id: string; title: string }>;
    // `onNavigate` is provided for potential future features like smooth scrolling or state management.
    onNavigate?: (chapterId: string) => void;
}

/**
 * MagazineTableOfContents component provides navigation links to different chapters.
 * It uses anchor links for basic navigation.
 */
export const MagazineTableOfContents: React.FC<TableOfContentsProps> = ({ chapters, onNavigate }) => {
    return (
        <nav aria-label="Table of Contents" className="magazine-toc mb-8 p-4 bg-blue-50 bg-opacity-70 rounded-lg shadow-md border border-blue-100">
            <h3 className="text-xl font-bold mb-3 text-blue-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                Table of Contents
            </h3>
            <ul className="list-disc pl-6 text-gray-800">
                {chapters.map(chapter => (
                    <li key={chapter.id} className="mb-2">
                        <a
                            href={`#chapter-${chapter.id}`} // Standard anchor link
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate?.(chapter.id);
                                document.getElementById(`chapter-${chapter.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="text-blue-700 hover:text-blue-900 hover:underline transition-colors duration-200 font-medium"
                        >
                            {chapter.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

/**
 * Props for the MagazineImage component.
 */
interface MagazineImageProps {
    src: string;
    alt: string;
    className?: string; // Additional classes for custom styling
    caption?: string; // Optional image caption
    isHero?: boolean; // Flag to apply hero image styling
}

/**
 * MagazineImage component for displaying images with enhanced features like captions and lazy loading.
 */
export const MagazineImage: React.FC<MagazineImageProps> = ({ src, alt, className, caption, isHero = false }) => {
    const baseClasses = isHero
        ? "magazine-hero-image w-full h-96 object-cover object-center rounded-xl shadow-lg"
        : "w-full h-auto object-contain rounded-lg shadow-sm"; // Changed object-cover to object-contain for non-hero images
    return (
        <figure className={`magazine-figure my-6 ${className || ''} ${isHero ? 'mx-auto' : ''}`}>
            <img
                src={src}
                alt={alt}
                loading="lazy" // Enable native lazy loading for performance
                className={`${baseClasses} block transition-transform duration-300 hover:scale-[1.01]`}
            />
            {caption && <figcaption className="text-sm text-gray-600 text-center mt-3 px-2">{caption}</figcaption>}
        </figure>
    );
};

/**
 * Props for the MagazineQuote component.
 */
interface MagazineQuoteProps {
    text: string;
    author?: string; // Optional author for the quote
}

/**
 * MagazineQuote component for stylized blockquotes.
 */
export const MagazineQuote: React.FC<MagazineQuoteProps> = ({ text, author }) => {
    return (
        <blockquote className="magazine-quote border-l-4 border-blue-500 pl-6 py-3 my-8 italic text-lg sm:text-xl text-gray-800 bg-blue-50 bg-opacity-60 rounded-r-lg shadow-inner">
            <p className="mb-3 leading-relaxed">&ldquo;{text}&rdquo;</p>
            {author && <footer className="text-right text-base text-gray-600 font-medium">— {author}</footer>}
        </blockquote>
    );
};

/**
 * Represents a generic content block within a page.
 */
interface ContentBlock {
    type: 'text' | 'image' | 'quote';
    data: any; // Data structure depends on the type (e.g., string for text, MagazineImageProps for image)
}

/**
 * Parses raw page text and images into a structured array of ContentBlocks.
 * This function intelligently interleaves text, images, and attempts to identify quotes.
 * It's a significant upgrade from the original `renderPageContent` logic.
 * @param text The full text content of a page.
 * @param images An array of image URLs for the page.
 * @param isFirstPage Boolean indicating if this is the first page of a chapter, for hero image placement.
 * @returns An array of ContentBlock objects.
 */
export const parsePageContentToBlocks = (text: string, images: string[], isFirstPage: boolean): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const mutableImages = [...images];

    // Place a prominent hero image if it's the first page and images are available
    if (isFirstPage && mutableImages.length > 0) {
        const heroImageSrc = mutableImages.shift();
        if (heroImageSrc) {
            blocks.push({
                type: 'image',
                data: { src: heroImageSrc, alt: 'Chapter illustration', isHero: true, caption: 'Opening illustration for the chapter.' }
            });
        }
    }

    let textBuffer: string[] = [];
    let imageCounter = 0; // To help with alt text and conditional styling

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const trimmedParagraph = paragraph.trim();

        // Simple heuristic to detect potential quotes: starts and ends with quotes, and is sufficiently long.
        // This could be made more robust with specific markdown parsing or explicit content types in StoryDocument.
        if (trimmedParagraph.startsWith('"') && trimmedParagraph.endsWith('"') && trimmedParagraph.length > 50) {
            if (textBuffer.length > 0) {
                blocks.push({ type: 'text', data: textBuffer.join('\n\n') });
                textBuffer = [];
            }
            blocks.push({ type: 'quote', data: { text: trimmedParagraph.substring(1, trimmedParagraph.length - 1) } });
            continue;
        }

        // Add paragraph to buffer
        textBuffer.push(paragraph);

        // Interleave images after every 2-3 paragraphs for a magazine-like flow
        const imagePlacementInterval = isFirstPage ? 2 : 3; // Place images more frequently on first pages
        if ((i + 1) % imagePlacementInterval === 0 && mutableImages.length > 0) {
            if (textBuffer.length > 0) {
                blocks.push({ type: 'text', data: textBuffer.join('\n\n') });
                textBuffer = [];
            }
            const imgUrl = mutableImages.shift();
            if (imgUrl) {
                imageCounter++;
                const isEven = imageCounter % 2 === 0;
                blocks.push({
                    type: 'image',
                    data: {
                        src: imgUrl,
                        alt: `Story illustration ${imageCounter}: ${trimmedParagraph.substring(0, 50)}...`, // More descriptive alt
                        className: `w-full md:w-2/3 ${isEven ? 'md:float-right md:ml-6' : 'md:float-left md:mr-6'} clear-both my-4`,
                        caption: `Figure ${imageCounter}: Relevant imagery for the story.`
                    }
                });
            }
        }
    }

    // Add any remaining text from the buffer
    if (textBuffer.length > 0) {
        blocks.push({ type: 'text', data: textBuffer.join('\n\n') });
    }

    // Add any remaining images at the end of the page if they couldn't be interleaved
    mutableImages.forEach((imgUrl, idx) => {
        blocks.push({
            type: 'image',
            data: { src: imgUrl, alt: `Additional illustration ${idx + 1}`, caption: `Supplementary image ${idx + 1}.` }
        });
    });

    return blocks;
};

/**
 * Props for the MagazinePage component.
 */
interface MagazinePageProps {
    pageId: string;
    contentBlocks: ContentBlock[];
    pageNumber?: number; // Optional page number to display
}

/**
 * MagazinePage component responsible for rendering the content blocks of a single page.
 * It dynamically renders text, images, and quotes based on the `contentBlocks` array.
 */
export const MagazinePage: React.FC<MagazinePageProps> = ({ pageId, contentBlocks, pageNumber }) => {
    return (
        <div id={`page-${pageId}`} className="magazine-page my-8 p-6 sm:p-8 bg-white rounded-xl shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {contentBlocks.map((block, index) => {
                switch (block.type) {
                    case 'text':
                        return (
                            <div key={`text-${pageId}-${index}`} className="magazine-columns my-4 text-gray-800 leading-relaxed text-justify columns-1 sm:columns-2 md:columns-2 lg:columns-3 gap-8">
                                {block.data.split('\n\n').map((paragraph: string, pIdx: number) => (
                                    // Using `mb-4` for paragraph spacing, `first:mt-0` for cleaner top margin
                                    <p key={`p-${pageId}-${index}-${pIdx}`} className="mb-4 first:mt-0 break-inside-avoid-column">{paragraph}</p>
                                ))}
                            </div>
                        );
                    case 'image':
                        return <MagazineImage key={`img-${pageId}-${index}`} {...block.data} />;
                    case 'quote':
                        return <MagazineQuote key={`quote-${pageId}-${index}`} {...block.data} />;
                    default:
                        // Fallback for unknown block types, ensuring robustness
                        console.warn(`Unknown content block type encountered: ${block.type}`);
                        return null;
                }
            })}
            {pageNumber !== undefined && (
                <div className="absolute bottom-4 right-6 text-sm text-gray-400 font-light" aria-label={`Page number ${pageNumber}`}>Page {pageNumber}</div>
            )}
        </div>
    );
};

/**
 * Props for the MagazineChapter component.
 */
interface MagazineChapterProps {
    chapter: StoryDocument['chapters'][0];
    chapterIndex: number; // Index of the chapter within the document
    totalChapters: number; // Total number of chapters for rendering separators
}

/**
 * MagazineChapter component responsible for rendering a single chapter, including its title and pages.
 * It calculates and displays the reading time for the chapter.
 */
export const MagazineChapter: React.FC<MagazineChapterProps> = ({ chapter, chapterIndex, totalChapters }) => {
    // Calculate total text for the chapter to estimate reading time
    const totalChapterText = chapter.pages.map(p => p.page_text).join(' ');
    const chapterReadingTime = estimateReadingTime(totalChapterText);

    return (
        <section id={`chapter-${chapter.id}`} className="magazine-chapter mb-16 pt-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 border-b-2 border-blue-200 pb-4 relative group">
                <span className="text-blue-600 text-opacity-75 text-sm absolute top-0 left-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold uppercase tracking-wide">
                    Chapter {chapterIndex + 1}
                </span>
                {chapter.title}
                <span className="ml-3 text-lg font-normal text-gray-500">({chapterReadingTime})</span>
            </h2>
            {chapter.pages.map((page, pageIndex) => (
                <MagazinePage
                    key={page.id}
                    pageId={page.id}
                    contentBlocks={parsePageContentToBlocks(page.page_text, page.images, pageIndex === 0)}
                    pageNumber={pageIndex + 1}
                />
            ))}
            {chapterIndex < totalChapters - 1 && (
                // Horizontal rule as a visual separator between chapters
                <div className="flex justify-center my-12">
                    <hr className="w-1/2 md:w-1/3 border-t-2 border-dashed border-gray-300" aria-hidden="true" />
                </div>
            )}
        </section>
    );
};

// --- END NEW HELPER UTILITIES & COMPONENTS ---

/**
 * Props for the main MagazinePreview component.
 */
interface MagazinePreviewProps {
    doc: StoryDocument;
}

/**
 * MagazinePreview is the main component that orchestrates the display of a StoryDocument
 * in a magazine-like format. It integrates various sub-components to deliver a rich,
 * professional, and market-ready content preview experience.
 */
const MagazinePreview: React.FC<MagazinePreviewProps> = ({ doc }) => {
    // Calculate total reading time for the entire document
    const fullText = doc.chapters.flatMap(c => c.pages.map(p => p.page_text)).join(' ');
    const totalReadingTime = estimateReadingTime(fullText);

    // Provide simulated author and publish date for demo purposes, as StoryDocument doesn't currently contain them
    const simulatedAuthor = "A.I. Storyteller, J.B.O. III";
    const simulatedPublishDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-screen-lg mx-auto magazine-preview font-serif text-gray-900 antialiased bg-gray-50 min-h-screen">
            {/* Main Header for the document */}
            <MagazineHeader
                title={doc.title}
                author={simulatedAuthor}
                publishDate={simulatedPublishDate}
                readingTime={totalReadingTime}
            />

            {/* Table of Contents, only shown if there's more than one chapter */}
            {doc.chapters.length > 1 && (
                <MagazineTableOfContents chapters={doc.chapters.map(c => ({ id: c.id, title: c.title }))} />
            )}

            {/* Main content area containing all chapters */}
            <main className="magazine-content">
                {doc.chapters.map((chapter, index) => (
                    <MagazineChapter
                        key={chapter.id}
                        chapter={chapter}
                        chapterIndex={index}
                        totalChapters={doc.chapters.length}
                    />
                ))}
            </main>

            {/* A simple footer for copyright and branding */}
            <footer className="magazine-footer mt-20 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} {simulatedAuthor}. All rights reserved.</p>
                <p className="mt-1">Powered by Citibank Demo Business Inc. AI</p>
                <p className="mt-1 text-xs">For demonstration purposes only. Not for distribution.</p>
            </footer>
        </div>
    );
};

export default MagazinePreview;