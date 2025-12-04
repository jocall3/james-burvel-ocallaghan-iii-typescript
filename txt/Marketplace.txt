
# Engineering Vision Specification: Marketplace

## 1. Core Philosophy: "The Agora"

The Marketplace is not a store; it is a curated gallery of possibilities. Its merchant is an echo of the user themselves. Its purpose is to listen to the story of the user's actions and reflect back to them the tools their journey might require next. It transforms commerce from an act of being sold to, to an act of being understood.

## 2. Key Features & Functionality

*   **AI-Curated Products:** The entire product catalog is generated dynamically by the AI based on the user's recent transaction history.
*   **AI Justification:** Every product includes a short, plain-English justification from the AI explaining why it was recommended.
*   **Seamless Purchase:** A "Buy Now" button allows users to purchase an item, which immediately appears as a new entry in their transaction history.
*   **Loading State:** A visually appealing skeleton loader provides feedback while the AI is curating the products.

## 3. AI Integration (Gemini API)

*   **Product Curation & Generation:** This is the core of the module. The `fetchMarketplaceProducts` function in `DataContext` creates a summary of the user's recent transactions. This summary is sent to `gemini-2.5-flash` with a prompt instructing it to generate a diverse list of 5 compelling product recommendations. A detailed `responseSchema` is used to ensure the AI returns a structured array of products, each with a `name`, `price`, `category`, and `aiJustification`.

## 4. Primary Data Models

*   **`MarketplaceProduct`:** The structured object for a product, containing `id`, `name`, `price`, `category`, `imageUrl`, and `aiJustification`.
*   **`Transaction`:** A purchase action creates a new `expense` transaction.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `MarketplaceView.tsx`
    *   **State Management:** The generated products are stored in the `DataContext` to avoid re-fetching on every view load. The component consumes this state.
*   **Backend:**
    *   **Primary Service:** `marketplace-api`
    *   **Key Endpoints:**
        *   `GET /api/marketplace/recommendations`: The endpoint that takes a user ID, compiles their transaction history, calls the Gemini API, and returns the curated product list.
        *   `POST /api/marketplace/purchase`: The endpoint to handle the purchase of a product.
