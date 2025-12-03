import { JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition } from "@jburvel-ocallaghan-iii/jburvel-ocallaghan-iii-api-the-quantum-core-publisher-edition";
import type { CorporateCard, FinancialAnomaly } from "@jburvel-ocallaghan-iii/jburvel-ocallaghan-iii-api-the-quantum-core-publisher-edition/models";

// Initialize the SDK with your API key and OAuth2 token
// In a real-world scenario, you would obtain the OAuth2 token through an authorization flow
const client = new JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition({
  // It's recommended to use environment variables for sensitive data
  apiKeyAuth: process.env.API_KEY || "YOUR_API_KEY",
  oAuth2Auth: process.env.OAUTH_TOKEN || "YOUR_OAUTH_TOKEN",
});

/**
 * Main function to demonstrate corporate finance and risk management features.
 */
async function manageCorporateFinanceAndRisk() {
  console.log("--- Starting Corporate Finance & Risk Management Demo ---");

  try {
    // 1. List all corporate cards for the organization
    console.log("\n1. Listing all corporate cards...");
    const corporateCardsResponse = await client.corporate.listCorporateCardsDetailed({
      limit: 5,
    });

    if (!corporateCardsResponse.data || corporateCardsResponse.data.length === 0) {
      console.log("No corporate cards found. Ending demo.");
      return;
    }

    const cards: CorporateCard[] = corporateCardsResponse.data;
    console.log(`Successfully retrieved ${cards.length} corporate cards.`);
    console.log("First card details:", JSON.stringify(cards[0], null, 2));

    const cardToUpdate = cards[0];
    const cardId = cardToUpdate.id;

    // 2. Programmatically update spending controls for a specific card
    console.log(`\n2. Updating spending controls for card ID: ${cardId}...`);
    const updatedControls = {
      ...cardToUpdate.controls,
      monthlyLimit: 3000.00, // Increase monthly limit
      internationalTransactions: true, // Enable international transactions
      merchantCategoryRestrictions: ["Software Subscriptions", "Travel", "Office Supplies"],
    };

    const updatedCard = await client.corporate.updateCorporateCardControls({
      cardId,
      requestBody: updatedControls,
    });

    console.log("Card controls updated successfully.");
    console.log("New controls:", JSON.stringify(updatedCard.controls, null, 2));

    // 3. Instantly freeze the card for security
    console.log(`\n3. Freezing card ID: ${cardId} for security...`);
    const frozenCard = await client.corporate.toggleCorporateCardFreeze({
      cardId,
      requestBody: { freeze: true },
    });

    console.log(`Card status is now: ${frozenCard.status}, Frozen: ${frozenCard.frozen}`);

    // 4. Retrieve a list of AI-detected financial anomalies
    console.log("\n4. Retrieving critical, new financial anomalies detected by AI...");
    const anomaliesResponse = await client.corporate.listFinancialAnomalies({
      status: "New",
      severity: "Critical",
      limit: 5,
    });

    if (!anomaliesResponse.data || anomaliesResponse.data.length === 0) {
      console.log("No new critical anomalies found.");
    } else {
      const anomalies: FinancialAnomaly[] = anomaliesResponse.data;
      console.log(`Found ${anomalies.length} new critical anomalies.`);
      const anomalyToReview = anomalies[0];
      console.log("Top anomaly:", JSON.stringify(anomalyToReview, null, 2));

      // 5. Update the status of an anomaly to begin investigation
      console.log(`\n5. Updating status for anomaly ID: ${anomalyToReview.id} to 'Under Review'...`);
      const updatedAnomaly = await client.corporate.updateAnomalyStatus({
        anomalyId: anomalyToReview.id,
        requestBody: {
          status: "Under Review",
          resolutionNotes: "Compliance team is investigating the transaction with the cardholder.",
        },
      });

      console.log("Anomaly status updated successfully.");
      console.log("New status:", updatedAnomaly.status);
      console.log("Resolution notes:", updatedAnomaly.resolutionNotes);
    }

  } catch (error) {
    console.error("An error occurred during the corporate finance demo:", error);
  } finally {
    console.log("\n--- Corporate Finance & Risk Management Demo Finished ---");
  }
}

// Execute the main function
manageCorporateFinanceAndRisk();