
# Engineering Vision Specification: The Nexus

## 1. Core Philosophy: "The Map of Consequence"

The Nexus is the consciousness of the Instrument, made visible. It is not a chart but a living map of the web of causality within the user's financial life. Its purpose is to reveal the hidden, second-order connections between actions and outcomes, elevating the user's perspective from linear lists to systemic understanding.

## 2. Key Features & Functionality

*   **Force-Directed Graph:** Visualizes all financial entities (user, transactions, goals, budgets, anomalies) as nodes and their relationships as links.
*   **Interactive Exploration:** Users can drag, zoom, and click on nodes to explore the graph.
*   **Detail Panel:** Selecting a node reveals its detailed information and a list of its direct relationships.
*   **Pathfinding:** Identifies the shortest path of consequence between two selected nodes.

## 3. AI Integration (Gemini API)

*   **Relationship Explanation:** When a user clicks on a link between two nodes, `generateContent` is used to explain the nature of that relationship in plain English (e.g., "This transaction exceeded your 'Dining' budget, which is delaying progress on your 'Vacation' goal.").
*   **Natural Language Graph Traversal:** A user can ask, "Show me how my recent freelance income is connected to my investment performance." The AI translates this into a graph traversal query, highlighting the relevant path in the UI.

## 4. Primary Data Models

*   **`NexusNode`:** Represents an entity, containing an `id`, `label`, `type`, `value` (for sizing), and `color`.
*   **`NexusLink`:** Represents a relationship, containing `source` and `target` node IDs and a `relationship` description.
*   **`NexusGraphData`:** A container for the complete set of nodes and links.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `TheNexusView.tsx`
    *   **State Management:** Fetches the graph data from `DataContext`'s `getNexusData` method. Local state for user interactions (e.g., `selectedNode`).
    *   **Key Libraries:** `d3-force` for the graph simulation and rendering.
*   **Backend:**
    *   **Primary Service:** The `getNexusData` method in `DataContext` acts as the service layer for this view.
    *   **Database Interaction:** The method queries multiple tables (`transactions`, `goals`, `budgets`) and constructs the graph data on-the-fly. A dedicated graph database (like Neo4j) would be used in a production system.
