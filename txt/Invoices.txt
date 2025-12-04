
# Engineering Vision Specification: Invoices

## 1. Core Philosophy: "The Tides of Obligation"

This module is the ledger of all promises of payment, both owed and due. It is the command center for managing the tides of capital obligation. Its purpose is to provide a clear forecast of cash flow by monitoring these tides and to issue timely alerts for any promise that has passed its due date without fulfillment.

## 2. Key Features & Functionality

*   **Invoice Dashboard:** A filterable list of all invoices, allowing users to view by status (Unpaid, Paid, Overdue).
*   **Accounts Receivable Aging Chart:** A bar chart that visualizes the amount of money owed to the company, bucketed by how long it has been overdue.
*   **Invoice Creation:** A feature to create and send new invoices.

## 3. AI Integration (Gemini API)

*   **AI Invoice Data Extraction (Conceptual):** A user could upload a PDF invoice from a vendor. The AI (using Gemini's multi-modal capabilities) would read the document, extract key information (vendor name, invoice number, amount, due date), and pre-fill the form to create a new bill in the system.
*   **AI Collections Assistant:** For an overdue invoice, the AI could be prompted to draft a polite but firm follow-up email to the client, which the user could then review and send.

## 4. Primary Data Models

*   **`Invoice`:** The core model, containing `id`, `invoiceNumber`, `counterpartyName`, `dueDate`, `amount`, and `status`.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `InvoicesView.tsx`
    *   **State Management:** Consumes `invoices` from `DataContext`. Local state for the status filter.
    *   **Key Libraries:** `recharts` for the A/R aging chart.
*   **Backend:**
    *   **Primary Service:** `invoicing-api`
    *   **Key Endpoints:**
        *   `GET /api/invoices`
        *   `POST /api/invoices`
        *   `GET /api/invoices/aging-report`: An endpoint that calculates the data for the A/R chart.
    *   **Automation:** The backend would have a scheduled job that runs daily to check for invoices that have passed their due date and automatically change their status to 'overdue'.
