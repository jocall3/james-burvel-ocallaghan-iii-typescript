
# The Trajectory of Power
*A Guide to the Wealth Timeline Instrument*

---

## The Concept

The `WealthTimeline.tsx` component is a "trajectory map." It's a strategic chart designed to give the sovereign foresight, providing a view not just of their past campaigns, but also a projection of their future path to power.

---

### A Simple Metaphor: A Ballistics Chart

Think of this instrument as a ballistics chart for your financial power.

-   **The Path Already Traveled (`Area` chart)**: The solid, colored area of the chart represents the past. It's the ground you've already taken, showing the advances and retreats of your journey so far. It's a firm, solid foundation of historical fact.

-   **The Projected Trajectory (`Line` chart)**: The dashed line represents the most probable future path of your power, assuming your current momentum is maintained. It is not a guess; it is a calculated trajectory. It shows where your power is likely to be if you continue on your current vector.

-   **The Legend**: The legend clearly explains the two parts of the chart: "History" (the solid ground of your past actions) and "Projection" (the probable path ahead).

---

### How It Works

1.  **Charting the Past**: The component first calculates your historical resource levels. It sorts all `transactions` by date, starts with a known resource level, and then walks through the history, adding gains and subtracting expenditures to create a running total over time. This becomes the data for the solid `Area` chart.

2.  **Calculating Momentum**: To create the projection, it must understand your recent momentum. It calculates your average net resource flow (gains minus expenditures) over the last three months. This average becomes your "financial velocity."

3.  **Projecting the Future**: It takes your last known position and then projects it forward for the next six months by adding the calculated "financial velocity" for each month. This creates the data for the dashed `Line` chart.

4.  **Combining the Views**: The component uses a `ComposedChart`. This special instrument allows us to layer two different kinds of charts—an Area and a Line—on top of each other, seamlessly blending the unchangeable past and the probable future into a single, unified strategic view.

---

### The Philosophy: From History to Horizon

The purpose of this component is to connect the past to the future. By seeing your historical journey and a data-driven projection of your path forward on the same map, you can gain a powerful sense of strategic perspective. It helps you understand how your recent actions are shaping your destiny and empowers you to make conscious commands today to forge a more powerful tomorrow. It is a tool for looking back at the horizon you've crossed to better command the one ahead.
