
# Engineering Vision Specification: Counterparties

## 1. Core Philosophy: "The Diplomatic Roster"

This module is the official registry of all verified entities with whom the enterprise conducts business. It is the Book of Names. Its purpose is to ensure that all financial decrees are issued to known, vetted entities, with the AI acting as a diplomat performing "reputational calculus" on new and existing partners.

## 2. Key Features & Functionality

*   **Counterparty Directory:** A searchable, sortable list of all vendors, clients, and partners.
*   **Status Tracking:** Clear status badges for each counterparty (e.g., Verified, Pending).
*   **New Counterparty Modal:** A form to add new entities to the directory, which triggers a verification workflow.

## 3. AI Integration (Gemini API)

*   **AI Business Verification (Conceptual):** When a new counterparty is added, the AI could be prompted to perform a web search for the company's name and domain. It would then summarize its findings, looking for red flags or confirming the business appears legitimate. This automates the first step of vendor due diligence.
*   **AI Risk Summary:** A user could click an "AI Risk Report" button on a counterparty. The AI would be prompted with the counterparty's name and industry to generate a summary of common risks associated with that type of business.

## 4. Primary Data Models

*   **`Counterparty`:** Contains `id`, `name`, `email`, `status`, and `createdDate`.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `CounterpartiesView.tsx`
    *   **State Management:** Consumes `counterparties` from `DataContext`. Local state for the "Add Counterparty" modal.
*   **Backend:**
    *   **Primary Service:** `entity-management-api`
    *   **Key Endpoints:**
        *   `GET /api/counterparties`
        *   `POST /api/counterparties`: Creates a new counterparty and starts the verification process.
    *   **Workflow:** Creating a new counterparty would trigger a backend workflow that might involve automated checks and, if necessary, create a task for a human compliance analyst to review and verify the entity.
