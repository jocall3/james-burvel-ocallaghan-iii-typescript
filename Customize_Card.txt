
# Engineering Vision Specification: Customize Card

## 1. Core Philosophy: "The Sigil of Authority"

This is the forge where identity is given physical form. The purpose is to transmute the user's internal values and narrative into an external sigil—a customized financial instrument that serves as a constant, silent reminder of the will that commands it. It is an act of declaration, not decoration.

## 2. Key Features & Functionality

*   **Image Upload:** Users can upload a base image to serve as the canvas for their design.
*   **AI Image Editing:** Users provide a natural language prompt to describe how the AI should edit the base image.
*   **Live Preview:** The generated card design is shown in a realistic preview component.
*   **AI Card Story:** The AI can generate a short, inspiring story or motto for the card based on the user's prompt, completing the personalization.

## 3. AI Integration (Gemini API)

*   **Multi-modal Image Editing (`gemini-2.5-flash-image-preview`):** This is the core AI feature. The system sends a multi-part `generateContent` request containing both the base image (as a base64 string) and the user's text prompt. The model returns the edited image.
*   **Narrative Generation (`gemini-2.5-flash`):** A second, text-only `generateContent` call is used for the "Card Story" feature. The AI is prompted to write a short, inspiring story based on the user's design prompt.

## 4. Primary Data Models

*   **Local State:** The component manages `baseImage`, `prompt`, `generatedImage`, `isLoading`, `error`, `cardStory`, and `isStoryLoading` using `useState`.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `CardCustomizationView.tsx`
    *   **State Management:** All state is managed locally within the component.
    *   **Logic:** Includes a `fileToBase64` utility function to convert the user's uploaded file into the format required by the Gemini API.
*   **Backend:**
    *   A backend proxy (`card-customization-api`) is essential here to manage the multi-modal API calls, handle potential errors, and protect the API key. It would receive the base64 image and prompt, make the call to Gemini, and return the resulting image data.
