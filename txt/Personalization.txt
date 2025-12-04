
# Engineering Vision Specification: Personalization

## 1. Core Philosophy: "The Studio of the Self"

This module is the space where the user's inner landscape is projected onto the application's outer vessel. It is an act of attuning one's reality to one's own frequency. Its purpose is to empower the user to shape their digital environment into a true reflection of their inner state, based on the principle that the environment in which one thinks affects the quality of one's thoughts.

## 2. Key Features & Functionality

*   **Dynamic Visuals:** Users can select from pre-defined, animated background effects like "Aurora Illusion."
*   **AI Background Generator:** Users can describe a desired background in a text prompt, and the AI will generate a unique image.
*   **Custom Image URL:** Users can also provide a URL for a static background image.
*   **Persistent Settings:** All choices are saved to `localStorage` to persist across sessions.

## 3. AI Integration (Gemini API)

*   **Image Generation (`imagen-4.0-generate-001`):** The core AI feature uses the `ai.models.generateImages` function. The user's text prompt is sent to the Imagen model, which returns a base64-encoded string of the generated JPEG image. This string is then used to create a `data:image/jpeg;base64,...` URL which is applied as the background.

## 4. Primary Data Models

*   **Local State:** The component uses local state to manage the `imageUrl` and `aiPrompt` inputs.
*   **Global State (`DataContext`):** The final choices (`customBackgroundUrl`, `activeIllusion`) are stored in the global context so the main `App.tsx` component can apply them to the entire application.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `PersonalizationView.tsx`
    *   **State Management:** Local state for inputs, global context for final settings. The `setCustomBackgroundUrl` and `setActiveIllusion` functions in `DataContext` handle saving the settings to `localStorage`.
*   **Backend:**
    *   Like other modules, the image generation call would ideally be proxied through a backend service to protect the API key. The backend would simply receive the prompt and return the base64 image data.
