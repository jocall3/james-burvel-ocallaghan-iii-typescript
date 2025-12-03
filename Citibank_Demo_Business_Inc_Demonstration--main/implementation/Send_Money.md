
# Engineering Vision Specification: Send Money

## 1. Core Philosophy: "The Projection of Will"

The act of sending money is a projection of the user's will and resources. This module is designed to make this act feel both effortless and exceptionally secure. It is the Instrument's cannon, requiring precise targeting and an undeniable, biometric seal of approval before firing.

## 2. Key Features & Functionality

*   **Multi-Rail Payments:** Support for both traditional, bank-grade payment rails (simulated ISO 20022) and modern, social payment networks (simulated Cash App).
*   **Simple Input Form:** A clear, uncluttered form for specifying the recipient and amount.
*   **High-Fidelity Biometric Modal:** A secure and reassuring confirmation flow that uses the device camera to verify the user's identity.
*   **Animated Security Feedback:** A sequence of animations (scanning, success, ledger verification) to communicate the security of the process.

## 3. AI Integration (Gemini API)

*   **AI Recipient Verification (Conceptual):** Before sending, the AI could perform a quick risk assessment on the recipient's identifier (e.g., `@QuantumTag`) by checking it against known fraud databases or analyzing its history, providing a confidence score.
*   **AI Remittance Info Parser:** A user could type a messy note ("for invoice #12345 lunch meeting"), and the AI would parse it into a structured ISO 20022 remittance info field.

## 4. Primary Data Models

*   **`Transaction`:** A new `expense` transaction is created upon successful sending.
*   **Local State:** `paymentMethod`, `amount`, `recipient`, `remittance`, `showModal`.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `SendMoneyView.tsx`
    *   **State Management:** Primarily local `useState` for form inputs and modal visibility. Calls `addTransaction` from `DataContext` on success.
    *   **Key APIs:** `navigator.mediaDevices.getUserMedia` to access the camera for the biometric modal.
*   **Backend:**
    *   **Primary Service:** `payments-api`
    *   **Key Endpoints:**
        *   `POST /api/payments/send`: The endpoint that would handle the actual payment processing, integrating with external payment providers.
    *   **Security:** This service would be highly secure, handling authentication, authorization, and fraud checks before executing a payment.
