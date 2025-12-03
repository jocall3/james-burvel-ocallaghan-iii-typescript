
# Engineering Vision Specification: Budgets

## 1. Core Philosophy: "The Covenants of Will"

A budget is not a restriction; it is a declaration of intent. This module reframes budgeting as an act of architecture, where the user designs a financial life that reflects their values. The AI acts not as a guard, but as a consulting architect, helping to ensure the user's self-imposed covenants are both sound and sustainable.

## 2. Key Features & Functionality

*   **Visual Budget Rings:** Intuitive radial charts that show progress towards a budget limit, changing color as spending increases.
*   **AI Sage Insights:** A streaming, conversational AI that provides one key piece of advice based on the current budget status.
*   **Historical Spending Chart:** A stacked bar chart showing spending by category over the last several months.
*   **Budget Detail Modal:** A drill-down view showing all transactions for a specific budget category.
*   **New Budget Creation:** A simple modal for adding new budget covenants.

## 3. AI Integration (Gemini API)

*   **AI Sage (Streaming Insights):** On view load, a summary of all budgets (`Name: $Spent of $Limit`) is sent to the `gemini-2.5-flash` model via `sendMessageStream`. The prompt asks for one concise, encouraging piece of advice. The streaming response feels like a live, thoughtful analysis.
*   **AI Budget Suggester (Conceptual):** A user could ask, "Suggest a budget for me." The AI would analyze their last 3 months of spending and generate a realistic starting budget with categorized limits.

## 4. Primary Data Models

*   **`BudgetCategory`:** Contains `id`, `name`, `limit`, `spent`, and `color`.
*   **`Transaction`:** Used to calculate the `spent` amount for each budget.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `BudgetsView.tsx`
    *   **State Management:** Consumes `budgets` and `transactions` from `DataContext`. Uses local state for modal visibility.
    *   **Key Libraries:** `recharts` for the RadialBarChart and BarChart.
*   **Backend:**
    *   **Primary Service:** `budgets-api`
    *   **Key Endpoints:**
        *   `GET /api/budgets`: Fetches all budgets.
        *   `POST /api/budgets`: Creates a new budget.
        *   `POST /api/budgets/ai-insight`: The endpoint for the AI Sage feature.
    *   **Database Interaction:** The `spent` amount for each budget is calculated dynamically by summing transactions, or updated via a trigger whenever a new transaction is added.
