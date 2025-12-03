
# The Unquestionable Record
*A Guide to the Transaction History*

---

## The Concept

The `TransactionsView.tsx`, nicknamed "FlowMatrix," is the complete and unalterable record of your financial history. It features advanced filtering, sorting, and an integrated "Plato's Intelligence Suite" that acts as a master historian, capable of reading the story within the data and revealing its hidden truths.

---

### A Simple Metaphor: The Royal Archives

Think of this view as the complete and unabridged royal archives of your domain.

-   **The Entries (`Transactions`)**: The main list of transactions are the immutable entries in your historical record, organized chronologically.

-   **The Index (`Filtering & Sorting`)**: The controls at the top allow you to instantly command the archives, letting you jump directly to all records of "tribute received" (income) or sort the record by the most significant events ("amount").

-   **The Magnifying Glass (`TransactionDetailModal`)**: Selecting any single transaction opens a modal that provides a "magnifying glass" view, showing all the fine-print details of that particular historical event.

-   **The Royal Historian (`Plato's Intelligence Suite`)**: This is a powerful AI historian who has read your entire archive and can reveal insights you might have missed.
    -   **Subscription Hunter**: Finds recurring treaties that may be "forgotten pacts."
    -   **Anomaly Detection**: Points out a "historical anomaly"—a record that does not fit the established pattern of your rule.
    -   **Tax Deduction Finder**: Identifies records relevant to the laws of the land.
    -   **Savings Finder**: Suggests an "alternative history," showing how a different choice could have preserved resources.

---

### How It Works

1.  **Displaying the Record**: The component gets the full list of `transactions` from the `DataContext`. The `useMemo` hook is a crucial performance optimization. It ensures the record is only re-filtered and re-sorted when you issue a new command, not on every single re-render, keeping the interface swift and responsive.

2.  **AI Analysis**: The `AITransactionWidget` is the home of your AI historian. When you command it to "Ask Plato AI," it:
    -   Creates a concise summary of recent events to provide context.
    -   Sends this summary along with a specific `prompt` (like "Find potential subscriptions") to the Gemini API.
    -   For some tasks, it provides a `responseSchema`. This is a powerful feature that commands Gemini to reply with structured JSON, not just plain text. This makes the AI's intelligence reliable and easy to integrate.

3.  **Providing Clarity**: The view uses clear visual language. Gained resources are green, expended resources are red. A simple table makes the data easy to scan. The whole experience is designed to make interrogating your own history feel powerful, not intimidating.

---

### The Philosophy: Finding Truth in the Record

A list of transactions is just data. But within that data is a story of will, choices, and priorities. The purpose of this view, and its AI partner, is to help you read and understand your own history, so you can become a more intentional author of the history yet to come.
