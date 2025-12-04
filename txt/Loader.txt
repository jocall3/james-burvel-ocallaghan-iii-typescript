// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { SparklesIcon } from '../../icons.tsx';

// --- NEW ENUM FOR LOADING STAGES ---
/**
 * Defines the distinct stages of the story scaffolding process.
 * These can be used to display specific messages or trigger different UI states.
 * This provides a structured way to manage the asynchronous generation process.
 */
export enum StoryScaffoldingStage {
    INITIALIZING = 'Initializing the Story Engine',
    GENERATING_OUTLINE = 'Crafting the Core Narrative Outline',
    DEVELOPING_CHARACTERS = 'Bringing Characters to Life',
    DESIGNING_SETTING = 'Building the World and Atmosphere',
    WRITING_PROLOGUE = 'Penning the Opening Chapter',
    ADDING_DETAILS = 'Infusing Rich Detail and Flavor',
    REVIEWING_COHERENCE = 'Ensuring Narrative Coherence',
    FINALIZING_STORY = 'Polishing the Final Touches',
    COMPLETE = 'Story Scaffolding Complete!',
    FAILED = 'Story Scaffolding Failed!',
}

// --- NEW HELPER COMPONENTS FOR ENHANCED LOADER ---

/**
 * Props for the ProgressBar component.
 */
interface ProgressBarProps {
    /**
     * The current progress value (0-100).
     */
    progress: number;
    /**
     * Additional CSS classes to apply to the progress bar container.
     */
    className?: string;
    /**
     * Tailwind CSS class for the background color of the progress track.
     * @default 'bg-gray-700'
     */
    trackColor?: string;
    /**
     * Tailwind CSS class for the fill color of the progress bar.
     * @default 'bg-violet-500'
     */
    fillColor?: string;
}

/**
 * Renders a visual progress bar with customizable colors.
 * It clamps the progress value between 0 and 100 to ensure valid display.
 * @param {ProgressBarProps} props - The component's props.
 * @returns {JSX.Element} The ProgressBar component.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    className = '',
    trackColor = 'bg-gray-700',
    fillColor = 'bg-violet-500'
}) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    return (
        <div
            className={`w-full h-2 rounded-full ${trackColor} overflow-hidden ${className}`}
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Loading progress: ${clampedProgress}%`}
        >
            <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${fillColor}`}
                style={{ width: `${clampedProgress}%` }}
            ></div>
        </div>
    );
};

/**
 * Props for the LoadingTips component.
 */
interface LoadingTipsProps {
    /**
     * An array of strings, each representing a helpful tip to display.
     */
    tips: string[];
    /**
     * The interval in milliseconds at which to change the displayed tip.
     * @default 5000 (5 seconds)
     */
    intervalMs?: number;
    /**
     * Additional CSS classes to apply to the tips container.
     */
    className?: string;
    /**
     * Tailwind CSS class for the color of the tip text.
     * @default 'text-gray-400'
     */
    tipTextColor?: string;
}

/**
 * Displays a rotating list of helpful tips while content is loading.
 * Useful for keeping users engaged and informed during longer loading times.
 * @param {LoadingTipsProps} props - The component's props.
 * @returns {JSX.Element | null} The LoadingTips component, or null if no tips are provided.
 */
export const LoadingTips: React.FC<LoadingTipsProps> = ({
    tips,
    intervalMs = 5000,
    className = '',
    tipTextColor = 'text-gray-400'
}) => {
    const [currentTipIndex, setCurrentTipIndex] = React.useState(0);

    React.useEffect(() => {
        if (!tips || tips.length === 0) return;

        const interval = setInterval(() => {
            setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [tips, intervalMs]);

    if (!tips || tips.length === 0) {
        return null;
    }

    return (
        <p className={`mt-4 text-sm italic ${tipTextColor} transition-opacity duration-500 ease-in-out ${className}`} aria-live="polite">
            Tip: {tips[currentTipIndex]}
        </p>
    );
};

// --- ENHANCED LOADER COMPONENT ---

/**
 * Props for the enhanced Loader component.
 */
export interface EnhancedLoaderProps {
    /**
     * A specific message to display. If `currentStage` is provided, this will be overridden
     * unless an explicit `message` is set.
     */
    message?: string;
    /**
     * The current stage of the story scaffolding process. This drives the main message and
     * can influence other UI elements.
     */
    currentStage: StoryScaffoldingStage;
    /**
     * The progress percentage (0-100) to display in a progress bar.
     * The progress bar will only show if this prop is a valid number.
     */
    progressPercentage?: number;
    /**
     * An array of tips to cycle through while loading. These are displayed below the main message.
     */
    tipMessages?: string[];
    /**
     * An error message to display if the loading process fails. If provided, the loader
     * will switch to an error state, hiding progress and tips.
     */
    error?: string | null;
    /**
     * Callback function to execute when a retry action is requested.
     * A "Retry" button will be displayed if `error` is present and `onRetry` is provided.
     */
    onRetry?: () => void;
    /**
     * Additional CSS classes to apply to the main loader container.
     */
    className?: string;
    /**
     * If true, hides the main spinner animation.
     * @default false
     */
    hideSpinner?: boolean;
    /**
     * Tailwind CSS class for the color of the sparkle icon.
     * @default 'text-violet-400'
     */
    sparkleColor?: string;
    /**
     * Tailwind CSS class for the color of the spinner border.
     * @default 'border-violet-400'
     */
    spinnerColor?: string;
    /**
     * Tailwind CSS class for the color of the main message text.
     * @default 'text-gray-300'
     */
    messageTextColor?: string;
    /**
     * Optional custom content to display within the loader, below the message/progress.
     * This allows for highly flexible additions to the loader UI.
     */
    children?: React.ReactNode;
}

/**
 * A highly customizable and robust loader component designed for story scaffolding,
 * featuring progress indication, dynamic tips, and error handling with retry functionality.
 * This component provides rich user feedback during asynchronous operations.
 *
 * @param {EnhancedLoaderProps} props - The component's props.
 * @returns {JSX.Element} The Loader component.
 */
export const Loader: React.FC<EnhancedLoaderProps> = ({
    message,
    currentStage,
    progressPercentage,
    tipMessages,
    error,
    onRetry,
    className = '',
    hideSpinner = false,
    sparkleColor = 'text-violet-400',
    spinnerColor = 'border-violet-400',
    messageTextColor = 'text-gray-300',
    children,
}) => {
    // Determine the primary message to display
    const displayMessage = message || (currentStage === StoryScaffoldingStage.FAILED && error) || currentStage;
    const isErrorState = currentStage === StoryScaffoldingStage.FAILED && error;
    const showProgress = typeof progressPercentage === 'number' && progressPercentage >= 0 && progressPercentage <= 100 && currentStage !== StoryScaffoldingStage.COMPLETE && !isErrorState;
    const showTips = tipMessages && tipMessages.length > 0 && !isErrorState && currentStage !== StoryScaffoldingStage.COMPLETE;

    return (
        <div
            className={`flex flex-col items-center justify-center h-full p-8 text-center bg-gray-900 rounded-lg shadow-xl ${className}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            {!hideSpinner && (
                <div className="relative mb-6">
                    <div className={`w-24 h-24 border-4 border-dashed rounded-full animate-spin ${spinnerColor}`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <SparklesIcon className={`w-10 h-10 ${sparkleColor} animate-pulse`} />
                    </div>
                </div>
            )}

            {isErrorState ? (
                <>
                    <p className="mt-4 text-xl font-semibold text-red-500">Error: {error}</p>
                    <p className="mt-2 text-md text-gray-400">Please try again or contact support if the issue persists.</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-75"
                            aria-label="Retry story scaffolding"
                        >
                            Retry Scaffolding
                        </button>
                    )}
                </>
            ) : (
                <>
                    <p className={`mt-2 text-xl font-medium ${messageTextColor}`}>{displayMessage}</p>

                    {showProgress && (
                        <div className="w-2/3 mt-6 max-w-sm">
                            <ProgressBar progress={progressPercentage!} />
                            <p className={`mt-2 text-sm ${messageTextColor}`}>{progressPercentage!}% Complete</p>
                        </div>
                    )}

                    {showTips && (
                        <LoadingTips tips={tipMessages!} />
                    )}

                    {children && <div className="mt-8">{children}</div>}
                </>
            )}
        </div>
    );
};

// Export the enhanced Loader component as the default export, replacing the original one.
export default Loader;