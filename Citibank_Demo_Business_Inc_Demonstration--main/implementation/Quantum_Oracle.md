
# Engineering Vision Specification: Quantum Oracle

## 1. Core Philosophy: "The Loom of Potential Futures"

The Oracle moves beyond reactive analysis to proactive simulation. It is the loom upon which the threads of potential futures are woven. Its purpose is to help the user architect time itself by exploring the probable consequences of their choices, transforming an unavoidable fate into a series of branching paths from which they can consciously choose a better one.

## 2. Key Features & Functionality

*   **Natural Language Scenario Input:** Users can describe a complex hypothetical scenario in plain English.
*   **Full-State Financial Model:** The simulation uses a complete model of the user's financial life as its starting point, making the forecast deeply personalized.
*   **Multi-Faceted Report:** The output includes a narrative summary, key quantitative impacts, strategic recommendations, and a visual chart of the projection.
*   **Interactive Parameters:** Users can adjust key variables like the duration and amount of a financial event.

## 3. AI Integration (Gemini API)

*   **Stateful Projection:** This is a simulated API call, but the vision is that the backend would compile a comprehensive snapshot of the user's financial state. This snapshot, along with the user's natural language prompt, would be sent to the Gemini API.
*   **Structured Response:** The prompt would instruct the AI to act as a financial analyst and return a structured JSON object matching the `SimulationResponse` type. This includes the AI's narrative summary, its identification of key impacts, its recommendations, and the raw data for the projection chart.

## 4. Primary Data Models

*   **`SimulationRequest`:** The data sent to the (simulated) API, containing the `prompt` and `parameters`.
*   **`SimulationResponse`:** The rich, structured object returned from the API, containing all facets of the simulation result.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `QuantumOracleView.tsx`
    *   **State Management:** Local state for user inputs (`prompt`, `duration`, `amount`) and the `result` object returned from the simulation.
    *   **Key Libraries:** `recharts` for the projected balance AreaChart.
*   **Backend:**
    *   **Primary Service:** `simulation-api`
    *   **Key Endpoints:**
        *   `POST /api/oracle/simulate`: The endpoint that receives the user's scenario.
    *   **Logic:** This service would be highly complex, responsible for:
        1.  Assembling the user's full financial state.
        2.  Constructing the detailed prompt for the Gemini API.
        3.  Making the call to Gemini.
        4.  Validating and returning the structured JSON response.
