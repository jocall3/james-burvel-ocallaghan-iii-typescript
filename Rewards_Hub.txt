
# Engineering Vision Specification: Rewards Hub

## 1. Core Philosophy: "The Spoils of Discipline"

This module is a system of alchemy designed to transmute the intangible virtue of financial discipline into a tangible, spendable currency. It is a testament to the principle that good choices create their own rewards. Its purpose is to make the reward for a virtuous act as immediate and satisfying as the temptation for an impulsive one, closing the loop between effort and reward.

## 2. Key Features & Functionality

*   **Points Dashboard:** A clear summary of the user's current points balance and level within the gamification system.
*   **Level & Progress Meter:** Visual feedback on the user's "financial level" and their progress towards the next one.
*   **Points History Chart:** A chart showing how the user's points have been earned over time.
*   **Redemption Marketplace:** A catalog of items (statement credits, gift cards, impact contributions) that can be redeemed with points.

## 3. AI Integration (Gemini API)

*   **AI Reward Suggester (Conceptual):** The AI could analyze a user's spending and goals to suggest the most motivating reward for them. "We see you're saving for a trip. Consider redeeming your points for a travel gift card to accelerate your goal!"
*   **AI Gamification Title Generator:** As users level up, `generateContent` could be used to create unique, inspiring level names beyond the pre-defined list, tailored to their specific financial achievements.

## 4. Primary Data Models

*   **`RewardPoints`:** An object storing the current `balance` and recent activity.
*   **`GamificationState`:** An object storing the user's `score`, `level`, `levelName`, and `progress`.
*   **`RewardItem`:** Defines an item available for redemption, including its `name`, `cost`, and `type`.

## 5. Technical Architecture

*   **Frontend:**
    *   **Component:** `RewardsHubView.tsx`
    *   **State Management:** Consumes `rewardPoints`, `gamification`, and `rewardItems` from `DataContext`. Calls the `redeemReward` function from context.
    *   **Key Libraries:** `recharts` for the points history chart.
*   **Backend:**
    *   **Primary Service:** `gamification-api`
    *   **Key Endpoints:**
        *   `GET /api/rewards/status`: Fetches the user's points and level.
        *   `POST /api/rewards/redeem`: The endpoint to handle a redemption action.
    *   **Database Interaction:** The `gamification` service would listen for events from other services (e.g., `transaction.created`, `goal.progress_made`) and update the user's score and points accordingly.
