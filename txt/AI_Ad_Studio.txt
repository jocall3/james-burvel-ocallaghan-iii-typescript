
# Engineering Vision Specification: AI Ad Studio

## 1. Core Philosophy: "The Propaganda Engine"

This module is the chamber where intent is given a voice that can move mountains. It is a studio not for advertisements, but for proclamations. It uses the power of generative video to transmute a whisper of will—a single line of text—into a powerful, resonant narrative that can be broadcast to the world.

## 2. Key Features & Functionality

*   **Text-to-Video Generation:** Users can generate high-quality video clips from a simple text prompt.
*   **Asynchronous Polling:** The UI provides clear feedback during the video generation process, which can take several minutes.
*   **Video Preview:** The final, generated video is displayed directly in the interface with playback controls.
*   **Clear Error Handling:** Provides user-friendly error messages if the generation fails.

## 3. AI Integration (Gemini API)

*   **Video Generation (`veo-2.0-generate-001`):** The core of the feature is the `ai.models.generateVideos` call. This initiates the asynchronous video generation job.
*   **Operation Polling (`ai.operations.getVideosOperation`):** The system uses a `while` loop with a `setTimeout` to periodically poll the status of the generation operation until it is `done`.
*   **Secure Video Fetching:** Once complete, the system fetches the video from the signed `uri` provided in the operation response, securely appending the `API_KEY`.

## 4. Primary Data Models

*   **Local State:** The component manages its state through a `generationState` variable ('idle', 'generating', 'polling', 'done', 'error'), along with state for the `prompt`, `videoUrl`, and any `error` messages.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `AIAdStudioView.tsx`
    *   **State Management:** Primarily local `useState` to manage the UI's state machine.
    *   **Key APIs:** `URL.createObjectURL` to create a playable URL from the fetched video blob, and `URL.revokeObjectURL` for cleanup.
*   **Backend:**
    *   While the current implementation calls Gemini directly from the client, a production architecture would use a backend service (`ad-studio-api`) to manage this process.
    *   The backend would handle the long-running polling loop and could use a WebSocket or Server-Sent Events (SSE) to notify the client when the video is ready, which is more efficient than client-side polling. It also keeps the API key secure.
