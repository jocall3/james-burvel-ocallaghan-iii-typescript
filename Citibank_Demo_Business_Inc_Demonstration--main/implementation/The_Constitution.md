
# Engineering Vision Specification: The Constitution

## 1. Core Philosophy: "The Inscribed Soul"

The Constitution (comprising The Charter and all subsequent Covenants) is not a set of guidelines; it is the source code of the Instrument's soul. It is the immutable, foundational law that governs the behavior of the AI Co-Pilot. This document specifies the engineering architecture required to ensure this constitution is not merely a text file, but a living, breathing, and enforceable part of the system.

## 2. Key Features & Functionality

*   **Immutable Storage:** All articles of the constitution are stored in a cryptographically verifiable, append-only ledger.
*   **Version Control:** Any change or amendment to the constitution creates a new, versioned entry, preserving the complete history of the system's laws.
*   **AI Ingestion:** The Ethical Governor AI must, upon initialization, read the current version of the constitution and load its principles into its core operational context.
*   **Real-time Enforcement:** Every significant action proposed by an operational AI must be auditable against the principles of the constitution.

## 3. AI Integration (Gemini API)

*   **Ethical Governor Mandate:** The core of the integration is the system prompt for the `EthicalGovernor` AI. This prompt is dynamically constructed to include the full text of the current, ratified constitution.
    *   **Prompt Structure:** `You are the Ethical Governor. Your sole purpose is to audit proposed actions against the following immutable constitution. [Full Text of All Covenants]... Now, review the following proposed action and respond with only APPROVE or VETO and a citation of the specific article that informed your decision.`
*   **Constitutional Amendment Helper:** An AI-powered tool in the Legal Suite that helps the sovereign draft new articles, ensuring the language is clear, unambiguous, and does not conflict with existing articles.

## 4. Primary Data Models

*   **`ConstitutionalArticle`:** A record containing `articleId`, `version`, `author`, `ratificationDate`, and the `contentText`.
*   **`ProposedAction`:** A structured object representing an action an AI wants to take, including `actionType`, `parameters`, and `sourceAI`.
*   **`GovernorVerdict`:** A record containing the `decision` (APPROVE/VETO), the `citedArticle`, and the `rationale`.

## 5. Technical Architecture

*   **Database:**
    *   **Primary Storage:** A QLDB (Quantum Ledger Database) or similar immutable ledger database is used to store the `ConstitutionalArticle` table. This provides a cryptographically verifiable history of all changes.
*   **Backend:**
    *   **Primary Service:** `governance-api`
    *   **Key Endpoints:**
        *   `GET /api/constitution/latest`: Retrieves the full text of the current, active constitution. The `ai-gateway` service calls this endpoint to construct the system prompt for the Ethical Governor.
        *   `POST /api/governance/audit`: The endpoint that the `ai-gateway` calls to have an action audited. It takes a `ProposedAction` and returns a `GovernorVerdict`.
    *   **Workflow:**
        1. An operational AI (e.g., AI Advisor) decides to take an action.
        2. It sends the `ProposedAction` to the `ai-gateway`.
        3. The `ai-gateway` calls the `governance-api` to have the action audited.
        4. The `governance-api` calls `GET /api/constitution/latest`, constructs the prompt for the Ethical Governor AI, and calls the Gemini API.
        5. It receives the verdict, logs it for audit purposes, and returns it to the `ai-gateway`.
        6. The `ai-gateway` only allows the original action to proceed if the verdict is `APPROVE`.
