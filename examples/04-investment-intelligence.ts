import { JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition } from "../src"; // Adjust the import path to your generated SDK

// --- Configuration ---
// IMPORTANT: Replace with your actual access token.
// You can obtain a token through the OAuth 2.0 flow.
// For testing, you might use a long-lived developer token.
const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || "YOUR_OAUTH2_ACCESS_TOKEN";
const BASE_URL = "https://virtserver.swaggerhub.com/JOCALL3_1/jamesburvelocallaghaniiiapi/1.0";

// Initialize the API client with the base URL and security configuration
const apiClient = new JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition({
    baseUrl: BASE_URL,
    security: {
        oAuth2Auth: `Bearer ${ACCESS_TOKEN}`,
        // If using API Key authentication instead of OAuth2:
        // apiKeyAuth: "YOUR_API_KEY",
    },
});

/**
 * @function main
 * @description An asynchronous function to orchestrate the demonstration of the
 *              investment intelligence and portfolio management capabilities of the API.
 */
async function main() {
    console.log("🚀 Starting Investment Intelligence API Demonstration 🚀");
    console.log("-------------------------------------------------------\n");

    try {
        // 1. List all investment portfolios to get a high-level overview.
        console.log("Step 1: Listing all investment portfolios...");
        const portfoliosResponse = await apiClient.investments.listInvestmentPortfolios({ limit: 5 });

        if (!portfoliosResponse.data || portfoliosResponse.data.length === 0) {
            console.log("⚠️ No investment portfolios found for this user. Cannot proceed with the demonstration.");
            return;
        }

        console.log(`✅ Found ${portfoliosResponse.total} portfolios. Displaying the first ${portfoliosResponse.data.length}:`);
        portfoliosResponse.data.forEach(portfolio => {
            console.log(`  - Portfolio ID: ${portfolio.id}`);
            console.log(`    Name: ${portfolio.name}`);
            console.log(`    Total Value: ${portfolio.currency} ${portfolio.totalValue.toFixed(2)}`);
            console.log(`    Risk Tolerance: ${portfolio.riskTolerance}`);
        });
        console.log("\n-------------------------------------------------------\n");

        // 2. Select the first portfolio and retrieve its detailed information,
        //    including holdings and AI-driven performance insights.
        const targetPortfolioId = portfoliosResponse.data[0].id;
        console.log(`Step 2: Fetching detailed insights for portfolio ID: ${targetPortfolioId}...`);

        const portfolioDetails = await apiClient.investments.getInvestmentPortfolioDetails({ portfolioId: targetPortfolioId });

        console.log(`✅ Successfully retrieved details for "${portfolioDetails.name}":`);
        console.log(`   - Total Value: ${portfolioDetails.currency} ${portfolioDetails.totalValue.toFixed(2)}`);
        console.log(`   - Today's Gain/Loss: ${portfolioDetails.todayGainLoss.toFixed(2)}`);
        console.log(`   - Unrealized Gain/Loss: ${portfolioDetails.unrealizedGainLoss.toFixed(2)}`);

        if (portfolioDetails.holdings && portfolioDetails.holdings.length > 0) {
            console.log("   - Top Holdings:");
            portfolioDetails.holdings.slice(0, 3).forEach(holding => {
                console.log(`     - ${holding.symbol} (${holding.name}): ${holding.quantity} units @ ${holding.currentPrice.toFixed(2)} (Value: ${holding.marketValue.toFixed(2)})`);
            });
        }

        if (portfolioDetails.aiPerformanceInsights && portfolioDetails.aiPerformanceInsights.length > 0) {
            console.log("   - 🧠 Quantum AI Performance Insights:");
            portfolioDetails.aiPerformanceInsights.forEach(insight => {
                console.log(`     - [${insight.severity?.toUpperCase()}] ${insight.title}: ${insight.description}`);
            });
        }
        console.log("\n-------------------------------------------------------\n");

        // 3. Simulate an AI-driven portfolio rebalancing to align with a new risk tolerance.
        //    Using 'dryRun: true' ensures no actual trades are executed.
        console.log(`Step 3: Simulating an AI-driven rebalance for portfolio ID: ${targetPortfolioId}...`);
        console.log("   - Goal: Adjust portfolio to a 'medium' risk tolerance.");
        console.log("   - Mode: Dry Run (no actual trades will be executed).");

        const rebalanceStatus = await apiClient.investments.rebalanceInvestmentPortfolio({
            portfolioId: targetPortfolioId,
            requestBody: {
                targetRiskTolerance: "medium",
                dryRun: true, // This is crucial for simulation
                confirmationRequired: true,
            },
        });

        console.log("✅ Rebalancing simulation initiated successfully.");
        console.log(`   - Rebalance ID: ${rebalanceStatus.rebalanceId}`);
        console.log(`   - Status: ${rebalanceStatus.status}`);
        console.log(`   - AI Message: ${rebalanceStatus.statusMessage}`);
        console.log(`   - Estimated Impact: ${rebalanceStatus.estimatedImpact}`);

        // In a real-world scenario, you would poll the rebalance status until it becomes
        // 'pending_confirmation', at which point 'proposedTrades' would be populated.
        // For this example, we'll use mock data if the initial response doesn't include trades.
        if (rebalanceStatus.status === 'analyzing' || (rebalanceStatus.proposedTrades && rebalanceStatus.proposedTrades.length > 0)) {
            const mockProposedTrades = rebalanceStatus.proposedTrades || [
                { action: 'sell', symbol: 'AAPL', quantity: 10, estimatedPrice: 180.00 },
                { action: 'buy', symbol: 'VTI', quantity: 8, estimatedPrice: 225.00 },
                { action: 'sell', symbol: 'MSFT', quantity: 5, estimatedPrice: 320.00 },
                { action: 'buy', symbol: 'BND', quantity: 16, estimatedPrice: 100.00 },
            ];

            console.log("   - 🤖 Proposed Trades from AI:");
            mockProposedTrades.forEach(trade => {
                console.log(`     - ${trade.action?.toUpperCase()}: ${trade.quantity} shares of ${trade.symbol} @ ~$${trade.estimatedPrice?.toFixed(2)}`);
            });
            console.log("\n   - To execute these trades, you would confirm the rebalance operation using its ID.");
        }

    } catch (error) {
        console.error("❌ An error occurred during the investment intelligence demonstration:");
        if (error instanceof Error) {
            console.error(`   Message: ${error.message}`);
            // The generated SDK may wrap the response error in a 'body' property
            if ('body' in error && typeof (error as any).body === 'object') {
                console.error("   Error Details:", JSON.stringify((error as any).body, null, 2));
            }
        } else {
            console.error("   An unknown error occurred:", error);
        }
    } finally {
        console.log("\n-------------------------------------------------------");
        console.log("🏁 Investment Intelligence API Demonstration Finished 🏁");
    }
}

// Execute the main function
main();