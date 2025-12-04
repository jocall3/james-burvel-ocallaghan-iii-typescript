
# Engineering Vision Specification: Financial Goals

## 1. Core Philosophy: "The Declared Objectives"

A goal is not a wish; it is a dream with a strategy. This module is the war room where grand campaigns are planned. Its purpose is to transform a user's long-term aspirations from abstract desires into concrete, actionable strategic plans, with the AI acting as a master strategist to chart the course.

## 2. Key Features & Functionality

*   **Goal Dashboard:** A gallery of all user-defined goals, showing progress towards each.
*   **Goal Creation Wizard:** A simple, multi-step interface for defining a new goal (name, amount, date, icon).
*   **AI Plan Generation:** A one-click feature to have the AI generate a complete, multi-domain strategic plan to achieve a goal.
*   **Plan Viewer:** A detailed view that displays the AI's feasibility summary, recommended contribution, and step-by-step action plan.
*   **Projection Chart:** Visualizes the projected growth of savings towards the goal based on the AI's plan.

## 3. AI Integration (Gemini API)

*   **AI Plan Generation:** This is the core AI feature. The system sends the user's goal details along with a summary of their income and expenses to `gemini-2.5-flash`. A detailed `responseSchema` is used to compel the AI to return a structured JSON object containing a `feasibilitySummary`, a `monthlyContribution`, and an array of `steps`, where each step has a `title`, `description`, and `category` (e.g., Savings, Budgeting, Investing).

## 4. Primary Data Models

*   **`FinancialGoal`:** Contains the goal's `id`, `name`, `targetAmount`, `currentAmount`, etc. Crucially, it has a nullable `plan` field.
*   **`AIGoalPlan`:** The structured object returned by the AI, which is stored in the `plan` field of a `FinancialGoal`.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `FinancialGoalsView.tsx`
    *   **State Management:** Manages a multi-step view state (`LIST`, `CREATE`, `VIEW_PLAN`). Consumes and updates `financialGoals` in `DataContext`.
    *   **Key Libraries:** `recharts` for the projection AreaChart.
*   **Backend:**
    *   **Primary Service:** `goals-api`
    *   **Key Endpoints:**
        *   `GET /api/goals`
        *   `POST /api/goals`: Create a new goal.
        *   `POST /api/goals/{id}/generate-plan`: The endpoint that triggers the AI plan generation.
