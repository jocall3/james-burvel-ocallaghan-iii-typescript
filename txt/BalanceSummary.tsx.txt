
# The Statement of Position
*A Guide to the Balance Summary Instrument*

---

## The Concept

The `BalanceSummary.tsx` component is the single most critical piece of intelligence on the sovereign's command center. It is the "statement of position," designed to answer two simple questions with absolute authority: "What is the current state of my resources?" and "What is their vector?"

---

### A Simple Metaphor: The Battle Map

Think of this instrument as the main battle map in the war room.

-   **The Large Number (`absoluteBalance`)**: This is the precise coordinate of your army's current position. It's large, clear, and undeniable.

-   **The Change (`recentMomentum`)**: This is your army's momentum—its speed and direction of advance or retreat over the last 30-day campaign.

-   **The Chart (`historicalTrajectory`)**: This is the line of past campaigns. It shows the territory you've already conquered or ceded, giving critical context to your current position and momentum.

---

### How It Works

1.  **The Distillation of Truth**: The component doesn't just display a number; it forges it. It takes the entire `transactions` chronicle and distills it into a single, cohesive statement of reality.

2.  **Calculating the Present**: It begins with a known position and then processes every single action in the chronicle, adding resources gained and subtracting resources expended, to arrive at the final, current **absoluteBalance**.

3.  **Calculating Momentum**: It then looks back 30 days into this chronicle to find the position at that time. By comparing that past state to the present, it calculates the **recentMomentum**.

4.  **Mapping the Campaign**: Finally, it takes the full history of your resource levels and plots it over time to draw the **historicalTrajectory** chart, the map of your journey so far.

---

### The Philosophy: A Foundation in Reality

The purpose of this component is to provide a single, truthful, and grounding piece of intelligence. Before you can plan your next campaign, you must know your exact position on the map. The Balance Summary provides this anchor in the present moment. The AI Instrument also uses this "snapshot of now" as the foundation for all its strategic counsel, ensuring its advice is always grounded in your current reality.
