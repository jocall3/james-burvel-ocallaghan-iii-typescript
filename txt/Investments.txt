
# Engineering Vision Specification: Investments

## 1. Core Philosophy: "The Observatory"

This module is the user's observatory for surveying the cosmos of capital. It is a place to project one's will into the future. Its purpose is to transform investing from a passive act of hope into an active, strategic campaign, providing tools to not only track wealth but to consciously architect its growth in alignment with one's values.

## 2. Key Features & Functionality

*   **Portfolio Overview:** A high-level summary of total investment value and asset allocation, visualized with a pie chart.
*   **AI Growth Simulator:** An interactive tool to project future portfolio value based on different monthly contributions.
*   **Asset Performance Chart:** A bar chart comparing the year-to-date performance of all assets in the portfolio.
*   **Social Impact Investing (ESG):** A curated list of companies that align with ethical values, with clear ESG ratings.
*   **Investment Modal:** A simple interface to simulate investing in a new asset.

## 3. AI Integration (Gemini API)

*   **AI Growth Simulator Logic:** While the projection is currently a simple calculation, a more advanced version would use Gemini. The AI would be given the user's portfolio, their contribution amount, and their risk tolerance, and asked to "run a Monte Carlo simulation to project the likely range of outcomes over 10 years," providing a more realistic, probabilistic forecast.
*   **ESG Summary (Conceptual):** When a user views an impact investment, the AI could be prompted to "summarize this company's latest ESG report in a few bullet points," providing deeper insight.

## 4. Primary Data Models

*   **`Asset`:** The core model, containing `name`, `value`, `color`, `performanceYTD`, and optionally `esgRating` and `description`.
*   **`Transaction`:** An "Invest" action creates a new expense transaction.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `InvestmentsView.tsx`
    *   **State Management:** Consumes `assets` and `impactInvestments` from `DataContext`. Uses local state for the simulator's contribution amount and the investment modal.
    *   **Key Libraries:** `recharts` for the PieChart, BarChart, and AreaChart.
*   **Backend:**
    *   **Primary Service:** `portfolio-api`
    *   **Key Endpoints:**
        *   `GET /api/portfolio`: Fetches all assets and their current values (which would be updated in real-time from a market data provider in production).
        *   `POST /api/portfolio/invest`: Executes a trade or investment.
