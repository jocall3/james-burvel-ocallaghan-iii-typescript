// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './Icon'; // Assuming Icon component exists and handles various icons

// --- Helper Components (Internal to this file) ---

/**
 * Renders the AI generated content, potentially supporting simple markdown or streaming effects.
 * This is a simplified markdown renderer. For a real-world application requiring rich markdown,
 * a dedicated markdown parsing library (e.g., 'react-markdown') would typically be used.
 */
interface AIPopoverContentDisplayProps {
  text: string;
  isStreaming?: boolean;
}

const AIPopoverContentDisplay: React.FC<AIPopoverContentDisplayProps> = ({ text, isStreaming = false }) => {
  // Simple markdown-like rendering for bold and links.
  // This helps demonstrate enhanced content presentation without adding external libraries.
  const renderTextWithSimpleMarkdown = (input: string) => {
    let output = input;
    // Basic bolding: **text** -> <strong>text</strong>
    output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Basic links: [Text](URL) -> <a href="URL">Text</a>
    output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline cursor-pointer">$1</a>');
    return <span dangerouslySetInnerHTML={{ __html: output }} />;
  };

  if (isStreaming) {
    return (
      <div className="flex items-center space-x-2 animate-pulse" aria-label="Generating content">
        <span className="block h-3 w-3 bg-gray-500 rounded-full"></span>
        <span className="block h-3 w-3 bg-gray-500 rounded-full animation-delay-200"></span>
        <span className="block h-3 w-3 bg-gray-500 rounded-full animation-delay-400"></span>
        <span className="text-gray-400 text-xs italic">Generating content...</span>
      </div>
    );
  }

  return <p className="text-sm leading-relaxed">{renderTextWithSimpleMarkdown(text)}</p>;
};

/**
 * Skeleton loader for the AI popover content, providing a better user experience during loading.
 */
const AIPopoverSkeleton: React.FC = () => (
  <div className="space-y-2 animate-pulse p-1" aria-label="Loading AI content">
    <div className="h-3 bg-gray-600 rounded w-full"></div>
    <div className="h-3 bg-gray-600 rounded w-5/6"></div>
    <div className="h-3 bg-gray-600 rounded w-4/5"></div>
  </div>
);

/**
 * Provides actionable controls for the AI content, such as copy to clipboard, regenerate,
 * and user feedback (helpful/not helpful).
 */
interface AIPopoverActionsProps {
  content: string | string[];
  onCopy?: (text: string) => void;
  onRegenerate?: () => void;
  onFeedback?: (isHelpful: boolean, text: string) => void;
  showFeedback?: boolean;
}

const AIPopoverActions: React.FC<AIPopoverActionsProps> = ({
  content,
  onCopy,
  onRegenerate,
  onFeedback,
  showFeedback = true,
}) => {
  // If content is an array, join it for actions that operate on the whole output.
  const contentString = Array.isArray(content) ? content.join('\n\n') : content;
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const handleCopy = useCallback(() => {
    if (onCopy && contentString) {
      onCopy(contentString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  }, [onCopy, contentString]);

  const handleFeedback = useCallback((isHelpful: boolean) => {
    if (onFeedback && contentString) {
      onFeedback(isHelpful, contentString);
      setFeedbackGiven(isHelpful);
      // Feedback state can be made persistent or reset based on product requirements.
    }
  }, [onFeedback, contentString]);

  // Don't render the actions section if no actions are provided.
  if (!onCopy && !onRegenerate && (!onFeedback || !showFeedback)) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-700">
      <div className="flex items-center gap-2">
        {onCopy && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1 rounded-md text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            title="Copy to clipboard"
            aria-label="Copy AI content to clipboard"
          >
            <Icon name={copied ? "check" : "copy"} size={12} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1 rounded-md text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            title="Regenerate AI content"
            aria-label="Regenerate AI content"
          >
            <Icon name="refresh" size={12} />
            Regenerate
          </button>
        )}
      </div>

      {onFeedback && showFeedback && (
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <span>Was this helpful?</span>
          <button
            onClick={() => handleFeedback(true)}
            className={`p-1 rounded-full ${feedbackGiven === true ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
            title="Mark as helpful"
            aria-label="Mark AI content as helpful"
            disabled={feedbackGiven !== null} // Disable after feedback to prevent multiple submissions
          >
            <Icon name="thumb-up" size={12} />
          </button>
          <button
            onClick={() => handleFeedback(false)}
            className={`p-1 rounded-full ${feedbackGiven === false ? 'bg-red-600 text-white' : 'hover:bg-gray-700'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
            title="Mark as not helpful"
            aria-label="Mark AI content as not helpful"
            disabled={feedbackGiven !== null} // Disable after feedback
          >
            <Icon name="thumb-down" size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main AIPopover Component ---

/**
 * Defines the placement options for the AI Popover relative to its inferred trigger.
 * Note: Actual dynamic positioning requires a reference to the trigger element and
 * a dedicated positioning library (e.g., Floating UI, Popper.js) for robust collision detection
 * and viewport adjustments. For this isolated component, these are primarily semantic hints
 * for applying appropriate Tailwind CSS transform-origin and offset classes.
 */
export type AIPopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

export interface AIPopoverProps {
  /** The content to display within the popover. Can be a single string or an array of strings for multiple suggestions/variants. */
  content: string | string[] | null;
  /** Indicates whether the AI is currently generating content. When true, a skeleton loader or streaming indicator is shown. */
  isLoading: boolean;
  /** Optional error message to display in case of AI generation failure. Overrides content and loading states. */
  error?: string | null;
  /** If true, a streaming animation will be shown instead of a full skeleton loader when `isLoading` is true. */
  isStreaming?: boolean;
  /** Callback function to be invoked when the user requests to regenerate the AI content. */
  onRegenerate?: () => void;
  /** Callback function to be invoked when the user copies the AI content to the clipboard. Receives the content as an argument. */
  onCopy?: (text: string) => void;
  /** Callback function to be invoked when the user provides feedback (helpful/not helpful) on the AI content. Receives feedback status and content. */
  onFeedback?: (isHelpful: boolean, content: string) => void;
  /** The title displayed at the top of the popover. Defaults to "AI Preview". */
  title?: string;
  /**
   * The desired placement of the popover relative to its conceptual trigger.
   * This influences the CSS positioning and animation origin.
   * Default is 'right'.
   */
  placement?: AIPopoverPlacement;
  /** Duration in milliseconds to delay the appearance of the popover after its visibility conditions are met. */
  showDelay?: number;
  /** Duration in milliseconds to delay the disappearance of the popover after its visibility conditions are no longer met. */
  hideDelay?: number;
  /** Custom class name to apply to the popover's main container for additional styling. */
  className?: string;
  /** If true, a close button will be displayed in the popover's header. */
  showCloseButton?: boolean;
  /** Callback function invoked when the close button is clicked. */
  onClose?: () => void;
  /** When `content` is an array, this 0-indexed number specifies which suggestion is currently displayed. */
  activeSuggestionIndex?: number;
  /** Callback function invoked when a different suggestion is selected from the navigation controls. */
  onSelectSuggestion?: (index: number) => void;
  /** If true, the "Was this helpful?" feedback controls will be shown. Defaults to true. */
  showFeedbackControls?: boolean;
}

const AIPopover: React.FC<AIPopoverProps> = ({
  content,
  isLoading,
  error = null,
  isStreaming = false,
  onRegenerate,
  onCopy,
  onFeedback,
  title = 'AI Preview',
  placement = 'right', // Default placement
  showDelay = 0,
  hideDelay = 0,
  className = '',
  showCloseButton = false,
  onClose,
  activeSuggestionIndex = 0,
  onSelectSuggestion,
  showFeedbackControls = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null); // For potential future focus management or dynamic positioning

  // Determine if the popover should logically be shown based on its content/state.
  const hasContent = content !== null && (Array.isArray(content) ? content.length > 0 : content.trim().length > 0);
  const shouldRender = isLoading || error || hasContent;

  // Manages the delayed visibility of the popover.
  useEffect(() => {
    if (shouldRender) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (!isVisible && showDelay > 0) {
        if (!showTimeoutRef.current) {
          showTimeoutRef.current = setTimeout(() => setIsVisible(true), showDelay);
        }
      } else if (!isVisible) { // No delay or already visible
        setIsVisible(true);
      }
    } else {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (isVisible && hideDelay > 0) {
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => setIsVisible(false), hideDelay);
        }
      } else if (isVisible) { // No delay or already hidden
        setIsVisible(false);
      }
    }

    // Cleanup timeouts on unmount
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [shouldRender, showDelay, hideDelay, isVisible]); // isVisible added to effect dependencies for accurate state check

  // Only render the popover element in the DOM if it's logically visible.
  if (!isVisible && !shouldRender) {
    return null;
  }

  const currentContent = Array.isArray(content) ? content[activeSuggestionIndex] : content;
  const showActions = onCopy || onRegenerate || (onFeedback && showFeedbackControls);
  const hasMultipleSuggestions = Array.isArray(content) && content.length > 1;

  // Determines the Tailwind CSS classes for positioning and transform-origin based on `placement`.
  // This simulates dynamic placement without requiring a reference element or a positioning library.
  const getPlacementClasses = (p: AIPopoverPlacement) => {
    switch (p) {
      case 'top': return 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom';
      case 'bottom': return 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top';
      case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right';
      case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left';
      case 'top-start': return 'bottom-full left-0 mb-2 origin-bottom-left';
      case 'top-end': return 'bottom-full right-0 mb-2 origin-bottom-right';
      case 'bottom-start': return 'top-full left-0 mt-2 origin-top-left';
      case 'bottom-end': return 'top-full right-0 mt-2 origin-top-right';
      case 'left-start': return 'right-full top-0 mr-2 origin-top-right';
      case 'left-end': return 'right-full bottom-0 mr-2 origin-bottom-right';
      case 'right-start': return 'left-full top-0 ml-2 origin-top-left';
      case 'right-end': return 'left-full bottom-0 ml-2 origin-bottom-left';
      default: return 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left'; // Fallback to right
    }
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-live="polite" // Announces updates to screen readers
      aria-label={`${title} popover`}
      className={`absolute w-72 bg-gray-800 text-white rounded-lg shadow-xl p-4 z-50 pointer-events-auto animate-fade-in ${getPlacementClasses(placement)} ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* AI Sparkle Icon */}
        <Icon name="sparkles" size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
        <div className="flex-grow">
          <h4 className="font-bold mb-1 text-base">{title}</h4>
          {/* Optional Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              aria-label="Close popover"
            >
              <Icon name="x" size={14} />
            </button>
          )}

          {/* Content Area */}
          {error && <p className="text-red-400 mt-2 text-sm">Error: {error}</p>}
          {isLoading && !error && (isStreaming ? <AIPopoverContentDisplay text="" isStreaming={true} /> : <AIPopoverSkeleton />)}
          {!isLoading && !error && !hasContent && (
            <p className="text-gray-400 mt-2 text-sm">No AI preview available.</p>
          )}
          {!isLoading && !error && currentContent && (
            <AIPopoverContentDisplay text={currentContent} />
          )}

          {/* Multiple Suggestions Navigation */}
          {hasMultipleSuggestions && onSelectSuggestion && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-gray-700 text-gray-400 text-xs">
              <span>Suggestions:</span>
              {content!.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSelectSuggestion(index)}
                  className={`px-2 py-1 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                    index === activeSuggestionIndex ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                  }`}
                  aria-label={`Select suggestion ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons & Feedback */}
          {currentContent && showActions && !error && !isLoading && (
            <AIPopoverActions
              content={currentContent}
              onCopy={onCopy}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
              showFeedback={showFeedbackControls}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPopover;

// --- Exported Hooks/Utilities for broader consumption ---

/**
 * A utility hook to manage the visibility state of a UI component (like a popover)
 * with optional show and hide delays. This provides a clean abstraction for
 * complex visibility logic often found in interactive components.
 */
export interface UseAIPopoverVisibilityProps {
  /** The initial visibility state of the component. */
  initialVisible?: boolean;
  /** Duration in milliseconds to delay showing the component. */
  showDelay?: number;
  /** Duration in milliseconds to delay hiding the component. */
  hideDelay?: number;
  /**
   * A boolean indicating if the component *should* be visible based on external logic.
   * This hook will manage the `isVisible` state based on this prop and the delays.
   */
  shouldShow?: boolean;
}

export const useAIPopoverVisibility = ({
  initialVisible = false,
  showDelay = 0,
  hideDelay = 0,
  shouldShow = true,
}: UseAIPopoverVisibilityProps) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback(() => {
    if (!shouldShow) return; // Prevent showing if not explicitly allowed
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (showDelay > 0) {
      if (!showTimeoutRef.current) {
        showTimeoutRef.current = setTimeout(() => setIsVisible(true), showDelay);
      }
    } else {
      setIsVisible(true);
    }
  }, [showDelay, shouldShow]);

  const hide = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideDelay > 0) {
      if (!hideTimeoutRef.current) {
        hideTimeoutRef.current = setTimeout(() => setIsVisible(false), hideDelay);
      }
    } else {
      setIsVisible(false);
    }
  }, [hideDelay]);

  // Effect to manage visibility based on `shouldShow` prop, respecting delays.
  useEffect(() => {
    if (shouldShow) {
      show();
    } else {
      hide();
    }
    // Cleanup timeouts on effect re-run or unmount
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [shouldShow, show, hide]); // `show` and `hide` are memoized by useCallback, so safe here.

  return { isVisible, show, hide };
};

// --- Assumed Tailwind CSS Animations ---
// The following Tailwind CSS keyframe animations are assumed to be defined in the project's
// `tailwind.config.js` or directly in a global CSS file. They are crucial for the smooth
// visual experience of the popover.
//
// @keyframes fade-in {
//   from { opacity: 0; transform: translateY(5px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fade-in {
//   animation: fade-in 0.2s ease-out forwards;
// }
//
// @keyframes pulse {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.5; }
// }
// .animate-pulse {
//   animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// }
//
// .animation-delay-200 { animation-delay: 200ms; }
// .animation-delay-400 { animation-delay: 400ms; }
//
// (Note: The original `animate-scale-in` was replaced with `animate-fade-in` for consistency
// with new positioning and broader applicability, assuming `fade-in` is defined.)