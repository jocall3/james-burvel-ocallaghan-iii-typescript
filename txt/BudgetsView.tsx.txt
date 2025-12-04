
# The Covenants of Will
*A Guide to the Budgets View*

---

## The Concept

The `BudgetsView.tsx`, nicknamed "Allocatra," is the command center for enforcing your financial will. It features interactive "covenant rings," detailed records of actions, and an integrated "AI Sage" for sharp, streaming analysis of your discipline.

---

### A Simple Metaphor: An Architect's Blueprint

Think of this view as the architect's workshop for your domain. A budget is not a cage; it's a blueprint you design for how you will allocate your resources to build your world.

-   **The Blueprints (`Budget Rings`)**: Each circular chart represents a blueprint for a domain of your life (e.g., "Dining," "Shopping"). The ring filling up shows how much of your allocated resources have been expended for the month. The color change (from disciplined cyan to warning amber to alert red) is a clear indicator of pressure on that covenant.

-   **The AI Sage (`AIConsejero`)**: This is your sharp and wise strategic advisor. It reviews your blueprints and your resource allocation and offers clear, helpful directives. It does not scold; it provides intelligence to help you enforce your will more effectively.

-   **The Bill of Materials (`BudgetDetailModal`)**: Selecting a blueprint opens a detailed view showing all the "materials" (transactions) that have been allocated to that part of the project. It provides absolute transparency.

-   **The Drafting Table (`NewBudgetModal`)**: This is where you can draft a new blueprint, declaring a new covenant for a new domain of your life.

---

### How It Works

1.  **Visualizing the Blueprints**: For each `budget`, the component calculates the percentage of the limit that has been spent. It uses a `RadialBarChart` to create the "ring" visualization, which is an intuitive way to see progress towards a declared limit.

2.  **The AI Sage's Counsel**: The `AIConsejero` is a powerful instrument. When it loads, it:
    -   Creates a simple text summary of all your covenants.
    -   Sends this summary to the Gemini API with a command to provide "one key insight or piece of advice."
    -   It uses the `sendMessageStream` method. This means the AI's response types out word-by-word, which feels more like receiving a direct, live briefing.

3.  **Commanding the Plans**: The view makes it easy to command your domain. You can see all your blueprints at a glance, select one to see the detailed records, and use the "New Budget" command to open a modal and forge a new covenant.

---

### The Philosophy: Will, Not Restriction

This view is designed to reframe the concept of budgeting. It is not about restriction; it is about **will**. It is a command center where the sovereign, with the help of a sharp AI advisor, can design a financial reality that truly reflects their priorities. The goal is to make the act of budgeting feel powerful, insightful, and decisive.
