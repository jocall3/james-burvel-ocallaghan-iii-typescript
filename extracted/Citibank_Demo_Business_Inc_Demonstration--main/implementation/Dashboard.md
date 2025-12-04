
# Engineering Vision Specification: The Dashboard

## 1. Core Philosophy: "The Throne Room"

The Dashboard is the sovereign's seat of power. It is not a report, but a command center that provides a calm, clear, and holistic view of their entire financial domain at a single glance. Its purpose is to transform the chaos of financial data into the clarity required for decisive command.

## 2. Key Features & Functionality

*   **Balance Summary:** A high-level view of total assets and recent momentum.
*   **Recent Transactions:** A quick-glance log of the latest financial actions.
*   **AI Insights:** Proactive, actionable directives from the AI co-pilot.
*   **Wealth Timeline:** A historical and projected view of the user's net worth trajectory.
*   **Dynamic KPIs:** AI-generated charts and metrics tailored to the user's specific questions.
*   **Integration Codex:** An embedded component revealing the APIs and integrations powering the dashboard.

## 3. AI Integration (Gemini API)

*   **AI Insights Generation:** On view load, the `DataContext` compiles a summary of recent transactions and budget performance. This is sent to the `gemini-2.5-flash` model with a prompt to generate 2-3 concise, actionable insights. A `responseSchema` ensures the output is structured JSON.
*   **Dynamic KPI Generation:** The user describes a desired insight in natural language (e.g., "Compare my spending on subscriptions vs. dining"). The AI translates this into a data query, executes it (conceptually), and generates a chart configuration to visualize the result.

## 4. Primary Data Models

*   **`Transaction`:** The immutable record of a financial exchange.
*   **`Asset`:** A representation of accumulated value (e.g., stocks, crypto).
*   **`AIInsight`:** A structured object containing a title, description, and urgency level for an AI-generated tip.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `DashboardView.tsx`
    *   **State Management:** Primarily consumes data from the global `DataContext`.
    *   **Key Libraries:** Recharts for all chart-based widgets.
*   **Backend:**
    *   **Primary Service:** `dashboard-aggregator-api`
    *   **Key Endpoints:**
        *   `GET /api/dashboard/summary`: Fetches all necessary data for the initial dashboard load.
    *   **Database Interaction:** Reads from nearly all primary tables (`transactions`, `assets`, `budgets`, `goals`) to create a holistic snapshot.
