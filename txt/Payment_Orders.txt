
# Engineering Vision Specification: Payment Orders

## 1. Core Philosophy: "The Chain of Command"

This module is the central clearing house for all major movements of the enterprise treasury. It is the formal system for issuing and approving Decrees of Payment. Its purpose is to ensure every significant expenditure flows through the established Chain of Command, providing a clear, auditable trail and preventing bottlenecks in the flow of the creator's will.

## 2. Key Features & Functionality

*   **Payment Queue:** A filterable list of all payment orders, allowing users to view items by status (e.g., Needs Approval, Processing, Completed).
*   **Approval Workflow:** Simple "Approve" and "Deny" actions for users with the correct permissions.
*   **Volume Chart:** A bar chart visualizing the total value of payments currently in each stage of the process.
*   **Creation Modal:** A form for creating new payment orders.

## 3. AI Integration (Gemini API)

*   **AI Duplicate Detection (Conceptual):** Before a new payment order is created, the AI could be prompted with the new order's details and a history of recent payments. The AI would then provide a "probability of being a duplicate" score and a rationale, helping to prevent accidental double payments.
*   **AI Compliance Pre-Screen:** The details of a new payment could be sent to Gemini with a prompt asking it to check for any potential compliance red flags (e.g., "Does a payment of this size to a new vendor in this jurisdiction require additional documentation?").

## 4. Primary Data Models

*   **`PaymentOrder`:** The core data model, containing `id`, `counterpartyName`, `amount`, `status`, `date`, and `type`.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `PaymentOrdersView.tsx`
    *   **State Management:** Consumes `paymentOrders` from `DataContext` and calls `updatePaymentOrderStatus`. Local state for filters and modal visibility.
    *   **Key Libraries:** `recharts` for the volume chart.
*   **Backend:**
    *   **Primary Service:** `payments-api`
    *   **Key Endpoints:**
        *   `GET /api/payments/orders`: List all payment orders.
        *   `POST /api/payments/orders`: Create a new order.
        *   `POST /api/payments/orders/{id}/approve`: Approve an order.
        *   `POST /api/payments/orders/{id}/deny`: Deny an order.
    *   **Database Interaction:** Manages the `payment_orders` table. Would integrate with a workflow engine to handle multi-step approval processes.
