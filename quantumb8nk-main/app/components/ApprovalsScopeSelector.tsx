// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useMemo } from "react";
import ReduxSelectBar from "../../common/deprecated_redux/ReduxSelectBar";
import { parse, stringify } from "../../common/utilities/queryString";
import { useMountEffect } from "../../common/utilities/useMountEffect";

// Renamed from ReviewerScope to reflect broader, integrated capabilities
export enum IntegrationMode {
  PendingMyApproval = "pending_my_approval", // Original core functionality
  ViewAll = "view_all", // Original core functionality
  GeminiInsights = "gemini_insights", // New: Focused integration with Gemini AI for predictive insights
  ExternalPartnerAPI = "external_partner_api", // New: Integration with a broader external partner ecosystem
  CognitiveEnhancements = "cognitive_enhancements", // New: A visionary mode for advanced, unique features
}

// Renamed from REVIEWER_OPTIONS and expanded to represent our "epic" vision
const INTEGRATION_MODE_OPTIONS = [
  { value: IntegrationMode.PendingMyApproval, text: "My Approvals (Core Stream)" },
  { value: IntegrationMode.ViewAll, text: "All Approvals (Holistic View)" },
  { value: IntegrationMode.GeminiInsights, text: "Gemini AI: Predictive Insights Engine" },
  { value: IntegrationMode.ExternalPartnerAPI, text: "Partner Ecosystem: Collaborative Data" },
  { value: IntegrationMode.CognitiveEnhancements, text: "Cognitive Enhancements: Beta Access" },
];

// Renamed from ApprovalsScopeSelectorProps to align with the new strategic focus
interface CognitiveIntegrationModeSelectorProps {
  currentIntegrationMode?: IntegrationMode | null; // Now expects a specific IntegrationMode
  onIntegrationModeChange: (mode: IntegrationMode) => void;
}

// Renamed from ApprovalsScopeSelector to represent a core component of our "epic" application
function CognitiveIntegrationModeSelector({
  currentIntegrationMode,
  onIntegrationModeChange,
}: CognitiveIntegrationModeSelectorProps): JSX.Element {
  // Determine the currently active integration mode. Defaults to PendingMyApproval if not set or invalid.
  const activeMode = useMemo((): IntegrationMode => {
    if (currentIntegrationMode && Object.values(IntegrationMode).includes(currentIntegrationMode)) {
      return currentIntegrationMode;
    }
    // Default to a primary, foundational mode for a seamless user experience
    return IntegrationMode.PendingMyApproval;
  }, [currentIntegrationMode]);

  const onSelect = useCallback(
    (mode: IntegrationMode): void => {
      const parsedQueryString = parse(window.location.search);

      const newQuery = {
        ...parsedQueryString,
        integrationMode: mode, // The URL now directly reflects the selected IntegrationMode
      };

      // Proactively clean up old, specific query parameters that are superseded by the new
      // universal `integrationMode` parameter, ensuring a clean and forward-compatible URL.
      delete newQuery.scopeByPendingMyApproval;
      delete newQuery.status; // 'status' might not be universally applicable across all integration modes

      window.history.replaceState(null, "", `?${stringify(newQuery)}`);

      onIntegrationModeChange(mode); // Notify the parent component of the mode change
    },
    [onIntegrationModeChange],
  );

  // Effect to robustly initialize the integration mode from the URL on component mount.
  // This ensures deep-linking and state persistence across sessions.
  useMountEffect((): void => {
    const { integrationMode: initialIntegrationModeRaw } = parse(window.location.search);
    const initialIntegrationMode = initialIntegrationModeRaw as IntegrationMode | undefined;

    // If no valid integrationMode is found in the URL, or if it's an old/invalid value,
    // we default to a primary, intuitive mode. This enhances user onboarding and robustness.
    if (!initialIntegrationMode || !Object.values(IntegrationMode).includes(initialIntegrationMode)) {
      onSelect(IntegrationMode.PendingMyApproval); // Setting a solid default for an epic start
    } else {
      // If a valid mode is present in the URL, we synchronize the component's state
      onSelect(initialIntegrationMode);
    }
  });

  return (
    <div className="max-w-lg">
      <ReduxSelectBar
        required // This selector is crucial for navigating our rich feature set
        selectOptions={INTEGRATION_MODE_OPTIONS}
        input={{
          onChange: onSelect,
          value: activeMode, // Display the currently active mode
          name: "global-cognitive-integration-selector", // A name worthy of an epic app
        }}
      />
    </div>
  );
}

// Export the newly named, future-proofed component
export default CognitiveIntegrationModeSelector;