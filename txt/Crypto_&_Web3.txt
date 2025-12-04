
# Engineering Vision Specification: Crypto & Web3

## 1. Core Philosophy: "The New Dominion"

This module is the port of entry into the new, decentralized financial frontier. It is a testament to the principle that value is no longer confined to traditional systems. Its purpose is to provide a bridge between the old world and the new, with an AI that is bilingual, speaking the languages of both centralized and decentralized authority.

## 2. Key Features & Functionality

*   **Portfolio Management:** A clear overview of the user's crypto asset holdings and their total value.
*   **Web3 Wallet Integration:** Securely connect to a user's MetaMask wallet to display their address and balance.
*   **Fiat On-Ramp:** An integration with Stripe to allow users to purchase crypto with traditional currency.
*   **Virtual Card Issuance:** A feature to issue a virtual card (simulated via Marqeta) that can be linked to the user's crypto balance for real-world spending.
*   **NFT Gallery:** A viewer for the user's NFT assets.

## 3. AI Integration (Gemini API)

*   **AI NFT Minter (Conceptual):** While the current mint action is canned, an AI feature could allow a user to describe an NFT they want to create, and `generateImages` would generate the artwork for it before minting.
*   **AI On-Chain Transaction Explainer (See `OnChainAnalyticsView`):** A user could paste a transaction hash, and the AI would explain what happened in plain English.

## 4. Primary Data Models

*   **`CryptoAsset`:** Represents a fungible token holding (e.g., BTC, ETH).
*   **`NFTAsset`:** Represents a non-fungible token.
*   **`VirtualCard`:** Stores the details of the issued card.
*   **`PaymentOperation`:** A high-level record of funds movement, used for the simulated ledger.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `CryptoView.tsx`
    *   **State Management:** Consumes data from `DataContext`. Uses local state for modal visibility and form inputs.
    *   **Key Libraries:** Would use `ethers.js` or `web3.js` to interact with a user's wallet in a real application.
*   **Backend:**
    *   **Primary Service:** `web3-api`
    *   **Key Endpoints:**
        *   `POST /api/web3/buy-crypto`: Would integrate with the Stripe API.
        *   `POST /api/web3/issue-card`: Would integrate with the Marqeta API.
        *   `POST /api/web3/mint-nft`: Would handle the interaction with a smart contract on the blockchain.
    *   **Security:** The backend would be responsible for securely storing any necessary API keys and managing the complexities of blockchain transactions.
