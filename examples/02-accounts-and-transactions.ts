import { JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition } from "../src"; // Adjust the import path as needed

// --- Configuration ---
// IMPORTANT: In a real application, use environment variables or a secure config system
// for your API keys and tokens. Avoid hardcoding credentials.
const AUTH_TOKEN = process.env.QUANTUM_CORE_AUTH_TOKEN || "YOUR_OAUTH2_ACCESS_TOKEN";
const API_KEY = process.env.QUANTUM_CORE_API_KEY || "YOUR_API_KEY";

// Initialize the Quantum Core API Client
// This assumes you have a valid authentication token.
const quantumCoreClient = new JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition({
  security: {
    oAuth2Auth: `Bearer ${AUTH_TOKEN}`,
    apiKeyAuth: API_KEY,
  },
});

/**
 * @function main
 * @description An asynchronous function to demonstrate interacting with financial accounts and transactions.
 * It showcases listing accounts, fetching detailed analytics, filtering transactions, and updating transaction data.
 */
async function main() {
  console.log("🚀 Starting Quantum Core API showcase for Accounts & Transactions...");
  console.log("==================================================================\n");

  try {
    // -----------------------------------------------------------------
    // 1. List Linked Financial Accounts
    // -----------------------------------------------------------------
    console.log("Step 1: Fetching the first 5 linked financial accounts...");
    const linkedAccountsResponse = await quantumCoreClient.accounts.listLinkedAccounts({
      limit: 5,
    });

    if (!linkedAccountsResponse.data || linkedAccountsResponse.data.length === 0) {
      console.log("No linked accounts found. Please link an account to proceed with the rest of the example.");
      return;
    }

    console.log(`✅ Success! Found ${linkedAccountsResponse.total} total accounts. Displaying up to 5:`);
    linkedAccountsResponse.data.forEach(account => {
      console.log(`  - Account: ${account.name} (${account.institutionName})`);
      console.log(`    ID: ${account.id}`);
      console.log(`    Type: ${account.subtype}`);
      console.log(`    Balance: ${account.currentBalance} ${account.currency}`);
    });
    console.log("\n");

    // Select the first account for the next steps
    const primaryAccountId = linkedAccountsResponse.data[0].id;

    // -----------------------------------------------------------------
    // 2. Get Detailed Account Analytics & Forecasts
    // -----------------------------------------------------------------
    console.log(`Step 2: Fetching detailed analytics for account ID: ${primaryAccountId}...`);
    const accountDetails = await quantumCoreClient.accounts.getAccountDetailsAndAnalytics({
      accountId: primaryAccountId,
    });

    console.log("✅ Success! Retrieved detailed analytics:");
    console.log(`  - Account Holder: ${accountDetails.accountHolder}`);
    console.log(`  - Opened Date: ${accountDetails.openedDate}`);
    console.log("  - AI-Powered Cash Flow Forecast:");
    console.log(`    - Next 30 Days: $${accountDetails.projectedCashFlow?.days30}`);
    console.log(`    - Next 90 Days: $${accountDetails.projectedCashFlow?.days90}`);
    console.log(`    - AI Confidence: ${accountDetails.projectedCashFlow?.confidenceScore}%\n`);


    // -----------------------------------------------------------------
    // 3. List & Filter Transactions with Advanced Options
    // -----------------------------------------------------------------
    console.log("Step 3: Fetching recent 'Dining & Restaurants' transactions over $10...");
    const transactionsResponse = await quantumCoreClient.transactions.listTransactionsEnhanced({
      limit: 5,
      category: "Dining & Restaurants",
      minAmount: 10.00,
      startDate: "2024-07-01", // Using an example date range for demonstration
      endDate: "2024-07-31",
    });

    if (!transactionsResponse.data || transactionsResponse.data.length === 0) {
      console.log("No matching transactions found for the specified filters.");
    } else {
      console.log(`✅ Success! Found ${transactionsResponse.total} matching transactions. Displaying up to 5:`);
      transactionsResponse.data.forEach(txn => {
        console.log(`  - Txn ID: ${txn.id}`);
        console.log(`    Date: ${txn.date}, Description: ${txn.description}`);
        console.log(`    Amount: ${txn.amount} ${txn.currency}, Category: ${txn.category}`);
      });
      console.log("\n");

      // Select the first transaction for the next step
      const transactionToUpdateId = transactionsResponse.data[0].id;

      // -----------------------------------------------------------------
      // 4. Manually Categorize a Transaction
      // -----------------------------------------------------------------
      console.log(`Step 4: Recategorizing transaction ID ${transactionToUpdateId} to 'Business > Client Meal'...`);
      const updatedTransaction = await quantumCoreClient.transactions.categorizeTransaction({
        transactionId: transactionToUpdateId,
        requestBody: {
          category: "Business > Client Meal",
          notes: "Lunch meeting with Quantum Corp team.",
          applyToFuture: true, // Teach the AI for future categorizations
        },
      });

      console.log("✅ Success! Transaction has been recategorized.");
      console.log(`  - New Category: ${updatedTransaction.category}`);
      console.log(`  - Notes Added: "${updatedTransaction.notes}"`);
      console.log(`  - AI Learning Enabled: ${updatedTransaction.aiCategoryConfidence ? 'Yes, confidence is now ' + updatedTransaction.aiCategoryConfidence : 'No'}`);
    }

  } catch (error) {
    console.error("❌ An error occurred during the API showcase:");
    // The SDK should throw a structured error object for better error handling
    if (error instanceof Error) {
        console.error(`Error name: ${error.name}`);
        console.error(`Error message: ${error.message}`);
        // If the error object contains more details (like from the API response), log them
        const anyError = error as any;
        if (anyError.body) {
            console.error("Error details:", JSON.stringify(anyError.body, null, 2));
        }
    } else {
        console.error("An unknown error occurred:", error);
    }
  } finally {
    console.log("\n==================================================================");
    console.log("🏁 Showcase for Accounts & Transactions finished.");
  }
}

// Execute the main function
main();