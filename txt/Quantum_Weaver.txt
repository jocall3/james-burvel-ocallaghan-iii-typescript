
# Engineering Vision Specification: Quantum Weaver

## 1. Core Philosophy: "The Incubator"

This module is the high-tech forge where a thread of an idea is woven into the fabric of a tangible enterprise. Its purpose is to act as a co-founder, nurturing a nascent business idea by testing its logic, providing simulated capital, and generating a strategic plan for its crucial first steps.

## 2. Key Features & Functionality

*   **Multi-Stage Workflow:** Guides the user through a `Pitch -> Test -> Approved` flow.
*   **AI Business Plan Analysis:** The AI provides initial feedback and asks insightful follow-up questions.
*   **AI Funding & Coaching Plan:** The AI determines a simulated seed funding amount and generates a complete, multi-step coaching plan.
*   **Structured Output:** The AI's responses are structured as JSON, allowing for a clean and professional UI presentation.

## 3. AI Integration (Gemini API)

*   **Two-Step AI Chain:** The module uses a chain of two distinct `generateContent` calls.
    1.  **Analysis Call:** The first call takes the business plan and uses a `responseSchema` to generate `{ feedback, questions }`. This is a maieutic (Socratic) step to help the user think critically.
    2.  **Generation Call:** The second call takes the same business plan and uses a different `responseSchema` to generate `{ loanAmount, coachingPlan }`. This is a generative step to create the final strategic assets.

## 4. Primary Data Models

*   **`QuantumWeaverState`:** A comprehensive local state object that tracks the current `stage`, `businessPlan`, `feedback`, `questions`, `loanAmount`, `coachingPlan`, and any `error`.
*   **`AIPlan`:** The structured object representing the coaching plan.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `QuantumWeaverView.tsx`
    *   **State Management:** Uses a single, complex `useState` object (`weaverState`) to manage the entire multi-stage flow of the feature.
*   **Backend:**
    *   **Primary Service:** `incubator-api` (conceptual).
    *   **Key Endpoints:**
        *   `POST /api/incubator/pitch`: Initiates the first AI analysis step.
        *   `POST /api/incubator/finalize`: Initiates the second AI generation step.
    *   The backend service would be responsible for constructing the detailed prompts and `responseSchema` objects for the Gemini API calls.
