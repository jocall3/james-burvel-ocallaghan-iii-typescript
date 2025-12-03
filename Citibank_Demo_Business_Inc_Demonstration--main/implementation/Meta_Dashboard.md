# Engineering Vision Specification: Meta Dashboard

## 1. Core Philosophy: "The Command Center"

The Meta Dashboard is the sovereign's true command center. It is not a dashboard of data, but a dashboard of *capabilities*. It is the OS layer, the launchpad from which all other modules and instruments are accessed. Its purpose is to provide a sense of total command over the entire platform, presenting the user with a clear overview of their available tools.

## 2. Key Features & Functionality

*   **Module-as-App Paradigm:** Each major feature of the platform is presented as a distinct, launchable "app" in a grid.
*   **Live Analytics Previews:** Each app tile is not a static icon, but a live window into the module itself, showing real-time KPIs and charts via the `ViewAnalyticsPreview` component. This creates a sense of a living, breathing system.
*   **Modal Navigation:** Launching an "app" opens it in an immersive, full-screen modal, keeping the user oriented with the Command Center as their home base.

## 3. AI Integration (Gemini API)

*   **AI-Powered Previews (Conceptual):** The analytics previews themselves could be powered by Gemini. The AI could be prompted to "generate the single most important KPI chart for the Transactions module right now," creating a dynamic and intelligent preview.

## 4. Primary Data Models

*   **`NavItem`:** The component uses the existing navigation items from `constants.tsx` as the source for the tiles to display.
*   **`View`:** The `View` enum is used to identify and launch modules.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `MetaDashboardView.tsx`
    *   **State Management:** Receives an `openModal` function prop from `App.tsx` to control the modal system.
    *   **Key Components:** `DashboardTile`, `ViewAnalyticsPreview`.
*   **Backend:**
    *   This view is primarily a frontend orchestration layer. Its data comes from the existing analytics previews, which are powered by the various backend services for each module.
