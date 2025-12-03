import {
  JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition,
  CryptoWalletConnection,
  InternationalPaymentRequest,
} from "../src"; // Assuming the SDK is generated in the 'src' directory

// --- Authentication Setup ---
// In a real-world application, you would obtain an access token through the OAuth2 flow
// and configure the client to use it for authenticated requests.
const authToken = process.env.API_TOKEN || "your-bearer-token";

const apiClient = new JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition({
  // Configure the base URL to point to the virtual server or your actual API endpoint
  baseUrl: "https://virtserver.swaggerhub.com/JOCALL3_1/jamesburvelocallaghaniiiapi/1.0",
  // Setup the security handler to inject the bearer token into requests
  security: {
    oAuth2Auth: `Bearer ${authToken}`,
    apiKeyAuth: process.env.API_KEY || "your-api-key",
  },
});

/**
 * @file An example script demonstrating Web3 and global payment functionalities.
 * It shows how to list connected crypto wallets, their balances, retrieve an NFT
 * collection, and initiate an international payment with real-time FX rates.
 */
async function main() {
  console.log("🚀 Starting Web3 & Global Payments API Demonstration 🚀");

  try {
    // =================================================================
    // 🌐 Section 1: Web3 & Decentralized Finance (DeFi)
    // =================================================================
    console.log("\n--- 1. Fetching Connected Crypto Wallets ---");
    const walletsResponse = await apiClient.web3.listCryptoWallets({ limit: 5 });

    if (walletsResponse.ok && walletsResponse.data.data && walletsResponse.data.data.length > 0) {
      const wallets = walletsResponse.data.data;
      console.log(`✅ Found ${wallets.length} connected wallet(s).`);
      wallets.forEach((wallet: CryptoWalletConnection) => {
        console.log(`  - Wallet ID: ${wallet.id}`);
        console.log(`    Provider: ${wallet.walletProvider}`);
        console.log(`    Address: ${wallet.walletAddress}`);
        console.log(`    Network: ${wallet.blockchainNetwork}`);
      });

      // Use the first wallet for subsequent calls
      const firstWallet = wallets[0];

      // --- Get Balances for the first wallet ---
      console.log(`\n--- 2. Fetching Asset Balances for Wallet: ${firstWallet.id} ---`);
      const balancesResponse = await apiClient.web3.getCryptoWalletBalances({
        walletId: firstWallet.id!,
      });

      if (balancesResponse.ok && balancesResponse.data.data) {
        console.log("✅ Successfully retrieved asset balances:");
        balancesResponse.data.data.forEach(asset => {
          console.log(`  - ${asset.assetName} (${asset.assetSymbol}): ${asset.balance} (Value: $${asset.usdValue?.toFixed(2)})`);
        });
      } else {
        console.error("❌ Failed to retrieve wallet balances:", balancesResponse.error);
      }
    } else if (walletsResponse.ok) {
        console.log("🟡 No connected crypto wallets found for this user.");
    } else {
      console.error("❌ Failed to list crypto wallets:", walletsResponse.error);
    }

    // --- Get NFT Collection ---
    console.log("\n--- 3. Fetching User's NFT Collection ---");
    const nftsResponse = await apiClient.web3.getUserNFTCollection({ limit: 5 });
    if (nftsResponse.ok && nftsResponse.data.data && nftsResponse.data.data.length > 0) {
        console.log(`✅ Found ${nftsResponse.data.data.length} NFTs in the collection.`);
        nftsResponse.data.data.forEach(nft => {
            console.log(`  - NFT: ${nft.name} from '${nft.collectionName}'`);
            console.log(`    Token ID: ${nft.tokenId}`);
            console.log(`    Estimated Value: $${nft.estimatedValueUSD?.toFixed(2)}`);
        });
    } else if (nftsResponse.ok) {
        console.log("🟡 No NFTs found in the user's collection.");
    } else {
        console.error("❌ Failed to retrieve NFT collection:", nftsResponse.error);
    }


    // =================================================================
    // 💸 Section 2: Global Payments & Foreign Exchange (FX)
    // =================================================================
    console.log("\n--- 4. Retrieving Real-time & Predictive FX Rates (USD to EUR) ---");
    const fxRatesResponse = await apiClient.payments.getFxRates({
        baseCurrency: "USD",
        targetCurrency: "EUR",
        forecastDays: 7,
    });

    if (fxRatesResponse.ok && fxRatesResponse.data) {
        const rates = fxRatesResponse.data;
        console.log("✅ Successfully retrieved FX rates:");
        console.log(`  - Current Mid-Market Rate: 1 USD = ${rates.currentRate?.mid} EUR`);
        if (rates.predictiveRates && rates.predictiveRates.length > 0) {
            const prediction = rates.predictiveRates[0];
            console.log(`  - AI 7-Day Forecast: 1 USD ≈ ${prediction.predictedMidRate} EUR (Confidence: ${prediction.aiModelConfidence! * 100}%)`);
        }
    } else {
        console.error("❌ Failed to retrieve FX rates:", fxRatesResponse.error);
    }

    // --- Initiate an International Payment ---
    console.log("\n--- 5. Initiating an International Wire Transfer ---");
    const paymentPayload: InternationalPaymentRequest = {
        sourceAccountId: "acc_chase_checking_4567", // A valid source account ID for the user
        amount: 2500.00,
        sourceCurrency: "USD",
        targetCurrency: "EUR",
        beneficiary: {
            name: "Quantum Innovations GmbH",
            address: "Innovationsstrasse 123, 10117 Berlin, Germany",
            bankName: "Deutsche Bank",
            iban: "DE89370400440532013000",
            swiftBic: "DEUTDEFF",
        },
        purpose: "Payment for Q3 software license.",
        fxRateLock: true,
        fxRateProvider: "proprietary_ai",
    };

    const paymentResponse = await apiClient.payments.initiateInternationalPayment(paymentPayload);

    if (paymentResponse.ok && paymentResponse.data) {
        const paymentStatus = paymentResponse.data;
        console.log("✅ International payment initiated successfully!");
        console.log(`  - Payment ID: ${paymentStatus.paymentId}`);
        console.log(`  - Status: ${paymentStatus.status}`);
        console.log(`  - Amount Sent: ${paymentStatus.sourceAmount} ${paymentStatus.sourceCurrency}`);
        console.log(`  - Amount to be Received: ${paymentStatus.targetAmount} ${paymentStatus.targetCurrency}`);
        console.log(`  - FX Rate Applied: ${paymentStatus.fxRateApplied}`);
        console.log(`  - Tracking URL: ${paymentStatus.trackingUrl}`);
    } else {
        console.error("❌ Failed to initiate international payment:", paymentResponse.error);
    }

  } catch (error) {
    console.error("\n🚨 An unexpected error occurred during the demonstration:", error);
  } finally {
    console.log("\n🏁 Web3 & Global Payments API Demonstration Finished 🏁");
  }
}

main();