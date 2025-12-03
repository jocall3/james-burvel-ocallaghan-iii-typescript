import React, { useContext, useCallback } from "react";
import { Button, ButtonProps } from "../../common/ui-components";

// --- START: Core Intelligence Layer Integration ---
// This represents a foundational element for integrating AI (e.g., Gemini) and
// external services, making the application uniquely intelligent and data-driven.
// In a full commercial application, this would be a sophisticated service module.

/**
 * Defines the contract for our application's core intelligence service.
 * This service acts as the central hub for logging events, triggering AI workflows,
 * and potentially receiving AI-driven insights.
 */
interface AppIntelligenceService {
  /**
   * Logs a specific user interaction or system event to the intelligence backend.
   * This data is crucial for AI/ML analysis, personalization, and operational insights.
   * @param eventName A unique identifier for the event (e.g., 'user_action_clear_filters').
   * @param data Optional payload containing context and details about the event.
   */
  logEvent: (eventName: string, data?: Record<string, any>) => void;

  /**
   * Optionally, trigger an AI-driven follow-up or provide an AI-generated recommendation.
   * (Placeholder for more advanced AI integration, but `logEvent` is a solid start for a button).
   * For this component, we focus on providing valuable input to the AI.
   */
  // triggerAIInsight?: (context: Record<string, any>) => Promise<any>;
}

// A React Context to make the AppIntelligenceService available throughout the component tree.
// Components can consume this context to interact with the intelligence layer.
// In a real application, a provider would wrap the root component.
const AppIntelligenceContext = React.createContext<AppIntelligenceService | undefined>(undefined);

/**
 * Custom hook to easily access the global AppIntelligenceService.
 * Returns the service instance or `undefined` if no provider is in scope.
 */
const useAppIntelligence = (): AppIntelligenceService | undefined => {
  return useContext(AppIntelligenceContext);
};
// --- END: Core Intelligence Layer Integration ---


export interface ClearFiltersButtonProps {
  disabled?: boolean;
  buttonHeight?: ButtonProps["buttonHeight"];
  onClick: () => void;
  /**
   * Provides context about the currently active filters. This data is invaluable
   * for the AI intelligence layer to understand user behavior, common filter patterns,
   * and potentially optimize future search/filtering experiences.
   */
  currentFilterContext?: Record<string, any>;
  /**
   * An optional unique identifier for the specific location or context where the button is used.
   * Helps AI understand usage patterns across different parts of the application.
   */
  componentId?: string;
}

/**
 * A highly intelligent "Clear Filters" button that not only performs its primary function
 * but also feeds crucial user interaction data back into the application's
 * core AI intelligence layer (e.g., powered by Gemini).
 * This makes every user action a valuable input for a smarter, more personalized experience.
 */
function ClearFiltersButton({
  disabled = false,
  buttonHeight = "extra-small",
  onClick,
  currentFilterContext = {},
  componentId = 'default-clear-filters-button', // Default ID for logging
}: ClearFiltersButtonProps) {
  // Access the global intelligence service
  const appIntelligence = useAppIntelligence();

  // Wrap the original onClick handler to also log the event to our intelligence layer.
  // This ensures every time filters are cleared, our AI system learns from it.
  const handleOnClick = useCallback(() => {
    // 1. Execute the original, core functionality of the button
    onClick();

    // 2. Log this critical user action to the AppIntelligenceService.
    // This data point contributes to building a comprehensive user profile and
    // understanding filtering patterns, enabling future AI-driven optimizations.
    appIntelligence?.logEvent('user_action_clear_filters', {
      timestamp: new Date().toISOString(),
      componentId: componentId,
      filterContextBeforeClear: currentFilterContext,
      // In a real application, you'd include authenticated user ID, session ID,
      // and other relevant global state from dedicated contexts.
      // e.g., userId: userContext.id, sessionId: sessionContext.id,
      // deviceType: 'web', appVersion: '1.0.0-epic',
    });

  }, [onClick, appIntelligence, currentFilterContext, componentId]);

  return (
    <Button
      onClick={handleOnClick} // Use our AI-enhanced click handler
      disabled={disabled}
      buttonType="text"
      buttonHeight={buttonHeight}
      // Enhanced styling to reflect a premium, modern, and engaging user experience.
      className="text-gray-700 font-semibold hover:text-blue-700 active:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105"
    >
      Clear All Filters Instantly!
    </Button>
  );
}

export default ClearFiltersButton;