
# Engineering Vision Specification: Transactions

## 1. Core Philosophy: "The Immutable Chronicle"

The Transactions view is the complete and unalterable record of the user's financial history. It is the Great Library from which all wisdom is derived. Its purpose is to provide not just data, but a searchable, analyzable narrative of the user's journey, with an AI historian to reveal its hidden stories.

## 2. Key Features & Functionality

*   **Infinite Scroll List:** A performant, paginated list of all transactions.
*   **Advanced Filtering & Sorting:** Controls to filter by type, date range, amount, and category, and to sort by date or amount.
*   **Natural Language Search:** A search bar to find specific transactions.
*   **Plato's Intelligence Suite:** A set of AI-powered widgets for deeper analysis.
*   **Transaction Detail Modal:** A modal view showing all metadata for a selected transaction.

## 3. AI Integration (Gemini API)

*   **Subscription Hunter:** `generateContent` analyzes transaction history to find recurring payments that may be forgotten subscriptions. A `responseSchema` ensures the output is a structured list.
*   **Anomaly Detection:** The AI is prompted to identify a single transaction that seems most unusual compared to the user's typical spending patterns and provide a rationale.
*   **Tax Deduction Finder:** The AI scans for expenses that could potentially be tax-deductible for the user's profession (e.g., freelance consultant).
*   **Savings Finder:** The AI suggests one specific, actionable way to save money based on observed spending habits.

## 4. Primary Data Models

*   **`Transaction`:** The core data model, containing `id`, `type`, `category`, `description`, `amount`, and `date`.
*   **`DetectedSubscription`:** A structured object returned by the AI containing the `name` and `estimatedAmount` of a potential subscription.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `TransactionsView.tsx`
    *   **State Management:** Consumes `transactions` from `DataContext`. Uses local state (`useState`) for filters, sorting, and search terms.
    *   **Key Libraries:** `recharts` for the monthly spending overview chart.
*   **Backend:**
    *   **Primary Service:** The `DataContext` currently serves the data. A dedicated `transactions-api` would handle pagination, filtering, and searching in production.
    *   **Key Endpoints:**
        *   `GET /api/transactions?filter=...&sort=...`
        *   `POST /api/transactions/ai-insight`: An endpoint to trigger a specific AI analysis widget.
