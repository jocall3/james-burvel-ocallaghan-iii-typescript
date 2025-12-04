
# The Interrogation Room
*A Guide to the AI Advisor*

---

## The Concept

The `AIAdvisorView.tsx`, nicknamed "Quantum," is the primary command interface for the application. It's the "Interrogation Room," a dedicated space where the sovereign can issue direct queries to their AI instrument and receive definitive answers. It maintains a persistent session and uses your command history to provide smart, context-aware suggestions for your next line of questioning.

---

### A Simple Metaphor: Interrogating an Oracle

Think of this view as having a direct line to an omniscient oracle that is bound to answer you truthfully.

-   **The Interrogation (`messages`)**: The main part of the view is the record of your interrogation—a simple back-and-forth between you and your AI instrument.

-   **Contextual Awareness (`previousView`)**: The oracle knows what you were last focused on. If you come from the "Covenants" (Budgets) view, its first suggestions will be about enforcing your will in that domain. This makes the interrogation efficient and relevant.

-   **Suggested Lines of Questioning (`examplePrompts`)**: To begin the interrogation, the oracle offers a few relevant questions you might want to ask, based on the context of your last command. This eliminates ambiguity and makes it easy to get to the truth.

-   **The Oracle's Oath (`systemInstruction`)**: The instrument has been bound by an oath: "helpful, professional, and slightly futuristic." This ensures its answers are always clear, concise, and serve your will.

---

### How It Works

1.  **Binding the Oracle**: When the component first loads, it creates a `Chat` instance with the Gemini API. This instance is stored in a `useRef`, which is crucial because it ensures the *same interrogation session* persists. This is how the AI remembers your entire line of questioning. The AI's oath is sworn here using the `systemInstruction`.

2.  **Issuing a Query**: When you send a message, the `handleSendMessage` function is called.
    -   It immediately adds your query to the record so the interface feels instant.
    -   It sends the query to the Gemini API using the persistent `chatRef.current.sendMessage`. This method automatically includes the entire previous interrogation, giving the AI full context.
    -   When the AI's definitive answer comes back, it's added to the record.

3.  **Providing Context**: The `App` component keeps track of the `previousView` you were commanding. It passes this information to the `AIAdvisorView`. The component then uses this to look up the most relevant `examplePrompts`, making the initial screen feel intelligent and prepared for your command.

---

### The Philosophy: Definitive Answers

This component is designed to make getting to the truth as easy as asking a direct question. Instead of navigating complex reports, you simply issue a query in plain English. The AI instrument, with its memory of the conversation and context of your recent commands, can provide the clear, concise, and definitive answers required to exercise effective rule.
