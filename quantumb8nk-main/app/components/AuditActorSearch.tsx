// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { OrganizationUser } from "../../generated/dashboard/graphqlSchema";
// The original ApiKeySelect is being replaced conceptually by our new, more focused ExternalAppIntegrationSelect.
// import ApiKeySelect, { ALL_API_KEYS_ID } from "../containers/ApiKeySelect";
import UserGroupSelect from "./UserGroupSelect";

const USER = "User";
// API_KEY is retained for potential legacy or generic non-named integrations if necessary,
// but the primary focus shifts to named external apps.
const API_KEY = "APIKey"; 
const EXTERNAL_APP = "ExternalApp"; // New actor type for named external application integrations

// Define the structure for the query input. Assuming Query is a flexible object.
// We'll augment it for our new needs, focusing on clarity and extensibility.
interface Query {
  [key: string]: string | undefined; // Allows for dynamic fields like `field`
  actor_type?: string; // Type of the selected actor (User, APIKey, ExternalApp)
  userGroupSelectedLabel?: string; // Display label for a selected user
  externalAppSelectedLabel?: string; // New: Display label for a selected external app
}

// Interface for a single external application, providing structured data.
interface ExternalApp {
  id: string; // Unique identifier for the app
  name: string; // Display name of the app
  description: string; // Short description for context
  icon: string; // A visual representation (e.g., an emoji, URL to an SVG/PNG)
}

// Hardcoded data for our "epic" external applications.
// In a real application, this would come from an API or configuration service.
const externalApps: ExternalApp[] = [
  {
    id: "gemini-ai-suite-123",
    name: "Gemini AI Suite Pro",
    description: "Unleash cutting-edge AI for intelligence & automation. Powering 🚀 next-gen decisions.",
    icon: "✨",
  },
  {
    id: "citibank-fin-connect-456",
    name: "Citibank FinConnect",
    description: "Seamlessly integrate with Citibank's core financial services. Your secure 🏦 gateway.",
    icon: "🏦",
  },
  {
    id: "quantum-data-insights-789",
    name: "Quantum Data Insights",
    description: "Advanced analytics and predictive modeling platform. Unlock 📈 deep business insights.",
    icon: "📈",
  },
  // Include an option for generic API keys if there's still a need for non-named integrations.
  // This is treated as another "external app" from a selection perspective.
  {
    id: "generic-api-key-option",
    name: "Generic API Key (Legacy)",
    description: "Connect to other integrations not explicitly listed above. Use your 🔑 custom keys.",
    icon: "🔑",
  },
];

// Props for the individual ExternalAppCard component.
interface ExternalAppCardProps {
  app: ExternalApp;
  isSelected: boolean;
  onClick: (appId: string) => void;
  disabled?: boolean;
}

/**
 * A visually appealing card component representing an external application.
 * Designed to elevate the user experience beyond a simple dropdown.
 */
function ExternalAppCard({ app, isSelected, onClick, disabled }: ExternalAppCardProps) {
  const cardStyle: React.CSSProperties = {
    border: `2px solid ${isSelected ? "#007bff" : "#e0e0e0"}`, // Highlight selected card
    borderRadius: "16px", // Softer, more modern corners
    padding: "20px",
    margin: "10px",
    textAlign: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: isSelected ? "#e6f2ff" : "#ffffff", // Light blue for selected, white for others
    boxShadow: isSelected
      ? "0 6px 12px rgba(0,0,0,0.15)"
      : "0 3px 6px rgba(0,0,0,0.08)", // More pronounced shadow for selected
    transition: "all 0.3s ease-in-out", // Smooth transitions for hover/selection
    flex: "1 1 calc(33.33% - 20px)", // Responsive layout for 3 columns on larger screens
    minWidth: "220px",
    maxWidth: "350px",
    opacity: disabled ? 0.6 : 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "3.5em", // Larger icons
    marginBottom: "15px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.3em",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "0.95em",
    color: "#666",
    lineHeight: "1.4",
  };

  return (
    <div
      style={cardStyle}
      onClick={disabled ? undefined : () => onClick(app.id)}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyPress={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          onClick(app.id);
        }
      }}
    >
      <div style={iconStyle}>{app.icon}</div>
      <div style={titleStyle}>{app.name}</div>
      <div style={descriptionStyle}>{app.description}</div>
    </div>
  );
}

// Props for the ExternalAppIntegrationSelect component.
interface ExternalAppIntegrationSelectProps {
  overrideOnAppSelect: (appId: string, appName: string) => void;
  overrideCurrentSelectedAppId?: string | null;
  disabled?: boolean;
}

/**
 * A primary selector component for our featured external application integrations.
 * This component showcases the "Gemini and other external apps" as the main focus.
 */
function ExternalAppIntegrationSelect({
  overrideOnAppSelect,
  overrideCurrentSelectedAppId,
  disabled = false,
}: ExternalAppIntegrationSelectProps) {
  return (
    <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #f0f0f0", borderRadius: "16px", backgroundColor: "#fdfdfd" }}>
      <label style={{ display: "block", marginBottom: "20px", fontWeight: "bold", fontSize: "1.3em", color: "#333", textAlign: "center" }}>
        🚀 Select Your Power-Up Integration 🚀
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        {externalApps.map((app) => (
          <ExternalAppCard
            key={app.id}
            app={app}
            isSelected={overrideCurrentSelectedAppId === app.id}
            onClick={(id) => {
                const selectedApp = externalApps.find(a => a.id === id);
                if (selectedApp) {
                    overrideOnAppSelect(id, selectedApp.name);
                }
            }}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

// Props for the main AuditActorSearch component.
interface AuditActorSearchProps {
  updateQuery: (input: Query) => void;
  field: string;
  query: Query;
  actor: Record<string, string>; // Generic record for actor details (e.g., { actorType: "User", actorId: "123" })
  disabled?: boolean;
}

/**
 * The main component for searching and selecting an audit actor,
 * now with a strong emphasis on external application integrations.
 */
function AuditActorSearch({
  updateQuery,
  field,
  query,
  actor,
  disabled = false,
}: AuditActorSearchProps) {
  // Determine the display label for the currently selected actor, prioritizing external apps.
  const selectedActorLabel = (query.externalAppSelectedLabel || query.userGroupSelectedLabel) as string;

  // Function to clear all actor-related selections.
  const resetQuery = () =>
    updateQuery({
      [field]: undefined,
      actor_type: undefined,
      userGroupSelectedLabel: undefined,
      externalAppSelectedLabel: undefined, // Also reset the new app label
    });

  // Handler for when a user group is selected.
  const updateUserGroup = (value?: OrganizationUser) => {
    if (value?.user.id) {
      updateQuery({
        [field]: value.user.id,
        actor_type: USER,
        userGroupSelectedLabel: `${value.user.name ?? ""} (${
          value.user.email
        })`,
        externalAppSelectedLabel: undefined, // Clear app selection when a user is chosen
      });
    } else resetQuery(); // If no user is selected, reset everything.
  };

  // New handler for when an external application is selected.
  const updateExternalApp = (appId: string, appName: string) => {
    if (appId) { // Ensure a valid app ID is provided.
      updateQuery({
        [field]: appId,
        actor_type: EXTERNAL_APP,
        externalAppSelectedLabel: appName,
        userGroupSelectedLabel: undefined, // Clear user selection when an app is chosen
      });
    } else {
        resetQuery(); // If an invalid app ID (or null/undefined) is passed, reset.
    }
  };

  // Helper to get the currently selected user's ID from the actor prop.
  const currentUserId = () => (actor.actorType === USER ? actor.actorId : null);
  // Helper to get the currently selected external app's ID from the actor prop.
  const currentExternalAppId = () =>
    actor.actorType === EXTERNAL_APP ? actor.actorId : null;

  const userId = currentUserId();
  const externalAppId = currentExternalAppId(); // Retrieve the ID of the currently selected external app.

  // Prepare the `selectValue` object for the `UserGroupSelect` component.
  // It only populates if a user is explicitly selected and the label matches.
  const userSelectValue =
    userId && actor.actorType === USER && selectedActorLabel
      ? { value: { user: { id: userId } }, label: selectedActorLabel }
      : undefined;

  return (
    <>
      {/* Our new, prominent ExternalAppIntegrationSelect component */}
      <ExternalAppIntegrationSelect
        overrideOnAppSelect={updateExternalApp}
        overrideCurrentSelectedAppId={externalAppId}
        disabled={disabled}
      />

      {/* The existing UserGroupSelect, now secondary to external apps */}
      <UserGroupSelect
        onChange={updateUserGroup}
        selectValue={userSelectValue}
        label="User"
        disabled={disabled}
      />
    </>
  );
}

export default AuditActorSearch;