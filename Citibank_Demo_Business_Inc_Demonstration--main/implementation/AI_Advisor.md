
# Engineering Vision Specification: AI Advisor

## 1. Core Philosophy: "The Interrogation Room"

This module is the primary command interface for the sovereign. It is a dedicated space to issue direct queries to the AI instrument and receive definitive answers. The AI acts as an oracle, bound to answer truthfully, with a persistent memory of the entire conversation and an awareness of the user's immediate context.

## 2. Key Features & Functionality

*   **Conversational Interface:** A classic chat UI for back-and-forth dialogue with the AI.
*   **Persistent Chat Session:** The AI remembers the entire conversation history, allowing for follow-up questions and contextual understanding.
*   **Context-Aware Prompts:** The initial screen suggests relevant questions based on the user's previous view in the application, solving the "blank page" problem.
*   **Streaming Responses:** The AI's responses are streamed token-by-token, creating a more dynamic and engaging experience.

## 3. AI Integration (Gemini API)

*   **Conversational Chat:** The core of the module is the use of `ai.chats.create` to establish a persistent, stateful conversation with the `gemini-2.5-flash` model.
*   **System Instruction:** The chat is initialized with a detailed system prompt that defines the AI's persona ("Quantum, an advanced AI financial advisor..."), its capabilities, and its tone.
*   **Context Injection (Conceptual):** While the current version uses `previousView` for prompts, a more advanced version would inject a real-time data snapshot into the prompt for every user message (as seen in `GlobalChatbot.tsx`), allowing the AI to answer questions like "What's my current balance?" with live data.

## 4. Primary Data Models

*   **`Message`:** A local state object representing a turn in the conversation, with a `role` ('user' or 'model') and `parts` (the text).
*   **`Chat`:** The `@google/genai` `Chat` object, stored in a `useRef` to persist across re-renders.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `AIAdvisorView.tsx`
    *   **State Management:** Uses local `useState` to manage the array of `messages` and the user's `input`. The `Chat` instance is held in a `useRef`.
*   **Backend:**
    *   This component interacts directly with the Gemini API from the client-side for simplicity. In a production environment, these calls would be proxied through a backend service (`ai-gateway`) to protect API keys and manage prompts.
