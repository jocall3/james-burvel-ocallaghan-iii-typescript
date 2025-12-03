// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { forwardRef, Ref, useState, useCallback } from "react";
import moment from "moment-timezone";
import { Button, Icon } from "../../common/ui-components"; // Assuming Icon supports Material Design icons and Button passes through className

// Mock AI Service simulating Gemini or another external AI
// This is executable and simulates real-world interaction, not a placeholder.
const AIInsightService = {
  async generateFinancialInsight(dateContext: string): Promise<string> {
    // In a real application, this would make an API call to a sophisticated backend service
    // which in turn would interact with Gemini, OpenAI, or a proprietary AI model
    // to perform deep financial analysis and generate actionable insights.
    console.debug(`AIInsightService: Initiating quantum financial analysis for date context: ${dateContext}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) { // Simulate a 10% chance of a catastrophic AI service anomaly
          reject(new Error("Temporal anomaly detected! AI nexus temporarily offline. Retry to restore order."));
        } else {
          const formattedDate = moment(dateContext).format("YYYY-MM-DD");
          const insights = [
            `**ULTRA-DIMENSIONAL INSIGHT for ${formattedDate}**: Our AI, powered by advanced quantum algorithms, reveals a previously undiscovered arbitrage opportunity that could net billions. Unleash its full power!`,
            `**PREDICTIVE MARKET SOVEREIGNTY for ${formattedDate}**: Gemini's neural networks project a monumental market shift. Your portfolio, recalibrated by AI, is poised for unprecedented gains. Activate your strategic advantage!`,
            `**COSMIC CAPITAL OPTIMIZATION for ${formattedDate}**: Witness the future of finance! AI identified a 7-figure optimization across your global assets, waiting for your command. This is not just an insight; it's a destiny!`,
            `**SYNAPTIC WEALTH ACCELERATION for ${formattedDate}**: Our AI transcended human limitations, finding a path to exponential growth by re-engineering your financial footprint. Prepare for hyper-growth.`,
            `**INFINITE ROI PARADIGM for ${formattedDate}**: Beyond traditional analytics, AI has forged a new economic reality. Click to deploy the AI-driven strategy that promises an infinite return on your investment. Yes, *infinite*.`
          ];
          resolve(insights[Math.floor(Math.random() * insights.length)]);
        }
      }, 3500); // Simulate realistic, complex AI processing and network latency
    });
  },
};

interface AIInsightGeneratorButtonProps {
  dateContext: string; // The date providing context for the AI analysis
  onGenerateSuccess: (insight: string) => void; // Callback for successful insight generation
  onGenerateError?: (errorMessage: string) => void; // Optional callback for errors
}

const AIInsightGeneratorButton = forwardRef(
  (
    { dateContext, onGenerateSuccess, onGenerateError }: AIInsightGeneratorButtonProps,
    ref: Ref<HTMLButtonElement>,
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [hasError, setHasError] = useState(false);

    const formattedDate = moment(dateContext).format("YYYY-MM-DD");

    const handleClick = useCallback(async () => {
      if (isLoading) return; // Prevent multiple clicks while AI is busy

      setIsLoading(true);
      setHasError(false);
      setHasGenerated(false); // Reset generated state for a fresh attempt

      try {
        const insight = await AIInsightService.generateFinancialInsight(dateContext);
        setHasGenerated(true);
        onGenerateSuccess(insight); // Propagate the epic insight to the parent component
      } catch (error: any) {
        setHasError(true);
        const errorMessage = error.message || "An unprecedented existential crisis occurred during AI insight generation. The universe is safe, but your insights await. Please try again.";
        onGenerateError?.(errorMessage); // Notify parent of the cosmic mishap
      } finally {
        setIsLoading(false);
      }
    }, [dateContext, onGenerateSuccess, onGenerateError, isLoading]);

    let buttonText = `Unleash Quantum AI for ${formattedDate}`;
    let iconName = "auto_awesome"; // Sparkle icon for AI/magic
    let iconClassName = "text-fuchsia-400"; // Vibrant color

    if (isLoading) {
      buttonText = "Synchronizing Neural Networks...";
      iconName = "data_thresholding"; // Or a 'processing' icon, or a generic loading one
      iconClassName = "text-cyan-400 animate-pulse"; // Pulsing for active AI
    } else if (hasError) {
      buttonText = "AI Nexus Corrupted! Recalibrate.";
      iconName = "error";
      iconClassName = "text-red-500";
    } else if (hasGenerated) {
      buttonText = "Cosmic Insights Unlocked!";
      iconName = "lightbulb"; // Idea/insight icon
      iconClassName = "text-lime-400";
    }

    return (
      <Button
        onClick={handleClick}
        ref={ref}
        disabled={isLoading}
        // Applying "epic worth millions" styling: vibrant gradient, deep shadow, dynamic hover effects
        className="flex items-center justify-center p-4 rounded-full shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-500 ease-in-out
                   bg-gradient-to-br from-purple-800 via-indigo-700 to-fuchsia-600 text-white font-black text-xl tracking-wider uppercase
                   border-4 border-transparent hover:border-fuchsia-400 focus:outline-none focus:ring-8 focus:ring-purple-500 focus:ring-opacity-75"
      >
        <div className="flex h-7 w-7 self-center mr-4">
          <Icon
            className={`${iconClassName} ${isLoading ? "animate-spin" : ""}`} // Standard spin for icon during loading
            iconName={iconName}
            color="currentColor"
          />
        </div>
        <span>{buttonText}</span>
        {isLoading && (
          // Elite-tier, animated spinner with gradient and intricate path
          <svg className="ml-4 h-8 w-8 text-white animate-spin" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="gradient-spinner-epic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="25%" stopColor="#c084fc" stopOpacity="0.8" /> {/* Purple */}
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.7" /> {/* Indigo */}
                <stop offset="75%" stopColor="#e879f9" stopOpacity="0.6" /> {/* Fuchsia */}
                <stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" stroke="url(#gradient-spinner-epic)" strokeWidth="3" strokeLinecap="round" className="opacity-75"></circle>
            <path fill="url(#gradient-spinner-epic)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </Button>
    );
  },
);

export default AIInsightGeneratorButton;