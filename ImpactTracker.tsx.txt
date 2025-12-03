
# The Measure of Your Will
*A Guide to the Green Impact Instrument*

---

## The Concept

The `ImpactTracker.tsx` component is a simple, clear monument to the tangible echo of your will upon the world. It is a testament to the principle that your financial decisions, when focused, can create a real, measurable effect in the physical realm.

---

### A Simple Metaphor: The Royal Garden

Think of this instrument as a royal garden that you alone cultivate through your actions.

-   **The Garden's Heart (`TreeIcon`)**: The central tree symbol represents the living, growing result of your focused will.

-   **The Harvest (`treesPlanted`)**: This number shows the total harvest from your garden so far—the total number of trees your will has brought into being.

-   **The Next Seed (`progress`)**: The progress bar shows how close you are to manifesting the next tree. It visualizes the power of your accumulated will in real-time, making the act of creation feel immediate and tangible.

---

### How It Works

1.  **Channeling the Will**: The `DataContext` is responsible for the core logic. It keeps track of a special counter (`spendingForNextTree`). Every time you execute an expense transaction, a portion of that expended energy is channeled into this counter.

2.  **Manifesting a Tree**: When the counter reaches the `COST_PER_TREE` threshold, your will has accumulated enough focus. The `DataContext` increases the `treesPlanted` count by one and resets the counter, carrying over any remainder of your will.

3.  **Visualizing Power**: The `ImpactTracker` component simply receives the current `treesPlanted` count and the `progress` (which is a measure of your accumulated will towards the next manifestation) from the `DataContext`.

4.  **A Simple Display**: The component then displays this information in a clean, elegant, and powerful way. The progress bar filling up provides a satisfying sense of accomplishment and demonstrates the undeniable power of your focused intent.

---

### The Philosophy: Will Made Manifest

This component is a core part of our mission. We believe that finance is an instrument of will. The Impact Tracker is a simple, beautiful way to make that belief tangible. It connects your everyday commands to a positive, measurable outcome, transforming the mundane act of spending into a deliberate act of creation. It is a constant, clear reminder that your choices have an echo, and that you have the power to make that echo a generative one.
