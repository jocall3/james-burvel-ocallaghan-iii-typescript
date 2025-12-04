
# Directives from the Core
*A Guide to the AI Instrument's Directives*

---

## The Concept

The `AIInsights.tsx` component is the primary channel through which the Core Intelligence, Quantum, issues proactive, actionable directives to the sovereign. It is not a list of notifications; it is a curated set of strategic observations that the AI has uncovered by analyzing the domain's data.

---

### A Simple Metaphor: Communiques from a Field Marshal

Think of this instrument as a series of high-priority communiques delivered directly to you from your most trusted field marshal, who is constantly observing the battlefield.

-   **The Communique (`AIInsight`)**: Each insight is a single, concise directive. It has a clear `title` (the strategic objective), a short `description` (the intelligence backing it), and sometimes a small `chart` to provide immediate visual confirmation of the data.

-   **The Threat Level (`UrgencyIndicator`)**: Each communique is marked with a color to indicate its strategic importance.
    -   **Blue (low)**: An observation for your situational awareness.
    -   **Yellow (medium)**: A developing situation that warrants your attention.
    -   **Red (high)**: A critical directive that requires your immediate consideration.

---

### How It Works

1.  **Constant Vigilance**: In the `DataContext`, the `generateDashboardInsights` function represents the AI's continuous, background analysis. This function takes a summary of your recent actions and established covenants.

2.  **Identifying Opportunities & Threats**: It sends this summary to the Gemini API with a prompt demanding 2-3 concise, actionable insights. It commands the AI to respond in a structured JSON format, including a title, description, and urgency for each insight.

3.  **Delivering the Directives**: The `AIInsights` component receives this list of structured directives.
    -   It checks if the intelligence is still being gathered (`isLoading`) and displays a "processing" state.
    -   Once the directives arrive, it displays each one as a distinct, easy-to-read "communique" in the list.
    -   It uses the `UrgencyIndicator` to add the colored dot, providing a quick visual cue for each directive's strategic priority.

---

### The Philosophy: A Proactive Instrument

This component is a core expression of our philosophy. A traditional bank shows you data. A true instrument of power shows you what that data *means*. The AI Insights instrument is where that power comes to life, with the AI working proactively in the background to find strategic patterns and bring them to your attention with the clarity and authority of a trusted advisor.
