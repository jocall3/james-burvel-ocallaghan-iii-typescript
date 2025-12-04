
# The Chronicle of Actions
*A Guide to the Recent Transactions Instrument*

---

## The Concept

The `RecentTransactions.tsx` component acts as the "Chronicle of Actions." It provides a clear, scannable record of the sovereign's most recent exertions of will upon the world. Its purpose is to give immediate context to the numbers seen in the Statement of Position, answering the question, "What actions have led to my current state?"

---

### A Simple Metaphor: The Field Scribe's Log

Think of this instrument as the most recent page in a field scribe's log. It records the latest commands and their outcomes.

-   **The Action (`Transaction`)**: Each item in the list is a single action—a choice, a command, an exchange of resources.

-   **The Sigil (`TransactionIcon`)**: Each action is given a simple, clear sigil to show its nature at a glance. A cart for procurement, a banknote for tribute received. This makes the log easy to read and understand without needing to study every word.

-   **The Echo (`CarbonFootprintBadge`)**: Certain actions have an "echo" in the wider world. The carbon footprint badge is a non-judgmental, factual indicator of this connection, a tool for total awareness.

-   **The Full Chronicle (`View All` button)**: This instrument shows only the latest entries. The "View All Transactions" command is the order to unroll the full scroll and review the complete history of actions.

---

### How It Works

1.  **Receiving the Intelligence**: The component is given a short list of the most recent `transactions` from the Command Center. It doesn't need to know the entire history, only the most recent commands given.

2.  **Assigning a Sigil**: For each transaction, it examines the `category` (e.g., 'Dining', 'Shopping') and uses the `TransactionIcon` sub-component to select the appropriate, clarifying sigil.

3.  **Displaying the Record**: It then arranges the information for each action in a clean, authoritative row: the sigil, the description, the date, and the amount (green for resources gained, red for resources expended).

4.  **Showing the Echo**: If an action has a `carbonFootprint`, it uses the `CarbonFootprintBadge` to display this fact in a simple, unobtrusive way. The color of the badge provides a quick visual cue about the nature of the echo.

---

### The Philosophy: The Clarity of Consequence

The purpose of this component is to provide a space for immediate, clear-eyed reflection. By seeing the direct results of their recent choices laid out with factual clarity, the sovereign can forge a stronger connection between their will and its consequences. It is a simple tool for building power through awareness, one action at a time.
