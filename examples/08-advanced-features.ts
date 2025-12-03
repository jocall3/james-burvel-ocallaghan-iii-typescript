import axios from 'axios';
import {
  GenerateVideoRequest,
  AdvancedGenerateVideoRequest,
  VideoOperationStatus,
  WebhookSubscriptionCreationRequest,
  WebhookSubscriptionUpdateRequest,
  Notification,
  MarketplaceProduct,
  ProductImpactSimulation,
  Error as APIError,
} from './types'; // Assuming types.ts contains all OpenAPI-generated types

// Configuration
const API_BASE_URL = 'https://virtserver.swaggerhub.com/JOCALL3_1/jamesburvelocallaghaniiiapi/1.0';
const ACCESS_TOKEN = 'YOUR_OAUTH2_ACCESS_TOKEN'; // Replace with your actual OAuth2 token
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API Key if using API Key auth

// Axios instance for API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Prioritize OAuth2 for most operations as per OpenAPI spec
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    // Fallback or alternative for API Key where applicable
    'X-API-Key': API_KEY,
  },
});

// --- Helper Functions ---

/**
 * Handles API errors gracefully.
 * @param error The error object.
 * @param operationName The name of the operation that failed.
 */
const handleApiError = (error: unknown, operationName: string): void => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as APIError;
    console.error(`Error during ${operationName}:`);
    console.error(`  Code: ${apiError?.code}`);
    console.error(`  Message: ${apiError?.message}`);
    if (apiError?.details) {
      console.error(`  Details: ${JSON.stringify(apiError.details, null, 2)}`);
    }
    console.error(`  HTTP Status: ${error.response?.status}`);
  } else {
    console.error(`An unexpected error occurred during ${operationName}:`, error);
  }
};

/**
 * Simulates a delay for polling operations.
 * @param ms The delay in milliseconds.
 */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Advanced Features Examples ---

/**
 * 1. AI Ad Studio (Veo 2.0): Generate a Standard Video Ad
 */
async function generateStandardVideoAdExample() {
  console.log('\n--- AI Ad Studio: Generating Standard Video Ad ---');
  const adRequest: GenerateVideoRequest = {
    prompt: "A short, inspiring ad showcasing 's seamless financial management for small businesses.",
    style: "Explainer",
    lengthSeconds: 20,
    aspectRatio: "16:9",
    brandColors: ["#4CAF50", "#2196F3"],
    keywords: ["fintech", "business", "efficiency", "growth"],
  };

  try {
    const response = await api.post<{ operationId: string; estimatedCompletionTimeSeconds: number }>(
      '/ai/ads/generate',
      adRequest
    );
    const { operationId, estimatedCompletionTimeSeconds } = response.data;
    console.log(`Video ad generation initiated. Operation ID: ${operationId}`);
    console.log(`Estimated completion time: ${estimatedCompletionTimeSeconds} seconds.`);

    // Poll for status
    let status: VideoOperationStatus | undefined;
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 5000; // Poll every 5 seconds

    console.log('Polling for video generation status...');
    while (status?.status !== 'done' && status?.status !== 'error' && attempts < maxAttempts) {
      await delay(pollInterval);
      attempts++;
      const statusResponse = await api.get<VideoOperationStatus>(`/ai/ads/operations/${operationId}`);
      status = statusResponse.data;
      console.log(`  Attempt ${attempts}: Status - ${status.status}, Progress: ${status.progressPercentage}%`);

      if (status.status === 'done') {
        console.log('Video ad generated successfully!');
        console.log(`  Video URL: ${status.videoUri}`);
        console.log(`  Preview Image URL: ${status.previewImageUri}`);
      } else if (status.status === 'error') {
        console.error(`Video generation failed: ${status.errorMessage}`);
      }
    }

    if (status?.status !== 'done') {
      console.warn('Video generation did not complete within the expected time or attempts.');
    }

  } catch (error) {
    handleApiError(error, 'generateStandardVideoAd');
  }
}

/**
 * 2. AI Ad Studio (Veo 2.0): Generate an Advanced Video Ad
 */
async function generateAdvancedVideoAdExample() {
  console.log('\n--- AI Ad Studio: Generating Advanced Video Ad ---');
  const advancedAdRequest: AdvancedGenerateVideoRequest = {
    prompt: "A sophisticated ad targeting investors, highlighting 's AI-driven portfolio management and predictive analytics.",
    style: "Cinematic",
    lengthSeconds: 45,
    aspectRatio: "16:9",
    voiceoverText: "Unlock the future of investing with Quantum Core's AI. Predictive insights, personalized strategies, unparalleled growth.",
    voiceoverStyle: "female_friendly",
    backgroundMusicGenre: "cinematic",
    audienceTarget: "investor",
    callToAction: {
      text: "Invest Smarter. Visit DemoBank.com/invest",
      url: "https://demobank.com/invest",
      displayTimeSeconds: 7,
    },
    brandAssets: ["https://demobank.com/assets/quantum_logo.png"],
  };

  try {
    const response = await api.post<{ operationId: string; estimatedCompletionTimeSeconds: number }>(
      '/ai/ads/generate/advanced',
      advancedAdRequest
    );
    const { operationId, estimatedCompletionTimeSeconds } = response.data;
    console.log(`Advanced video ad generation initiated. Operation ID: ${operationId}`);
    console.log(`Estimated completion time: ${estimatedCompletionTimeSeconds} seconds.`);

    // In a real application, you'd poll for status as in the standard example.
    console.log('Polling for status (simplified for example, check `generateStandardVideoAdExample` for full polling logic)...');
    await delay(10000); // Simulate waiting for a bit
    const statusResponse = await api.get<VideoOperationStatus>(`/ai/ads/operations/${operationId}`);
    const status = statusResponse.data;
    console.log(`  Current Status: ${status.status}, Progress: ${status.progressPercentage}%`);
    if (status.status === 'done') {
      console.log(`  Advanced Video URL: ${status.videoUri}`);
    } else if (status.status === 'error') {
      console.error(`  Advanced Video generation failed: ${status.errorMessage}`);
    }

  } catch (error) {
    handleApiError(error, 'generateAdvancedVideoAd');
  }
}

/**
 * 3. Developer Tools & API Management: Manage Webhook Subscriptions
 */
async function manageWebhooksExample() {
  console.log('\n--- Developer Tools: Managing Webhook Subscriptions ---');

  // 3.1. List existing webhooks
  try {
    const listResponse = await api.get('/developers/webhooks');
    console.log('Existing Webhook Subscriptions:');
    if (listResponse.data.data.length > 0) {
      listResponse.data.data.forEach((wh: any) => {
        console.log(`  ID: ${wh.id}, URL: ${wh.callbackUrl}, Events: ${wh.events.join(', ')}, Status: ${wh.status}`);
      });
    } else {
      console.log('  No webhooks found.');
    }
  } catch (error) {
    handleApiError(error, 'listWebhookSubscriptions');
  }

  // 3.2. Create a new webhook
  const newWebhookRequest: WebhookSubscriptionCreationRequest = {
    callbackUrl: 'https://my-dev-app.com/webhooks/new-transactions',
    events: ['transaction.created', 'transaction.updated'],
    secret: 'my_super_secret_for_webhooks_123', // Optional, but good practice
  };

  let newWebhookId: string | undefined;
  try {
    const createResponse = await api.post('/developers/webhooks', newWebhookRequest);
    newWebhookId = createResponse.data.id;
    console.log(`\nNew Webhook Created: ID: ${newWebhookId}, URL: ${createResponse.data.callbackUrl}`);
  } catch (error) {
    handleApiError(error, 'createWebhookSubscription');
  }

  // 3.3. Update the new webhook (e.g., pause it and change events)
  if (newWebhookId) {
    const updateWebhookRequest: WebhookSubscriptionUpdateRequest = {
      status: 'paused',
      events: ['transaction.created'], // Only listen to 'created' events now
    };
    try {
      const updateResponse = await api.put(`/developers/webhooks/${newWebhookId}`, updateWebhookRequest);
      console.log(`\nWebhook ${newWebhookId} Updated: Status: ${updateResponse.data.status}, Events: ${updateResponse.data.events.join(', ')}`);
    } catch (error) {
      handleApiError(error, 'updateWebhookSubscription');
    }

    // 3.4. Delete the webhook
    try {
      await api.delete(`/developers/webhooks/${newWebhookId}`);
      console.log(`\nWebhook ${newWebhookId} Deleted successfully.`);
    } catch (error) {
      handleApiError(error, 'deleteWebhookSubscription');
    }
  }
}

/**
 * 4. Notifications & Proactive Alerts: Check and Manage Notifications
 */
async function manageNotificationsExample() {
  console.log('\n--- Notifications: Checking and Managing Alerts ---');

  // 4.1. List unread notifications with high severity
  try {
    const listResponse = await api.get('/notifications/me', {
      params: { status: 'unread', severity: 'high', limit: 5 },
    });
    console.log('Unread High-Severity Notifications:');
    if (listResponse.data.data.length > 0) {
      listResponse.data.data.forEach((notif: Notification) => {
        console.log(`  ID: ${notif.id}, Title: "${notif.title}", Severity: ${notif.severity}, Timestamp: ${notif.timestamp}`);
      });

      // 4.2. Mark the first unread notification as read
      const firstUnreadNotifId = listResponse.data.data[0].id;
      if (firstUnreadNotifId) {
        await api.post(`/notifications/${firstUnreadNotifId}/mark-read`);
        console.log(`\nNotification ${firstUnreadNotifId} marked as read.`);
      }
    } else {
      console.log('  No unread high-severity notifications found.');
    }
  } catch (error) {
    handleApiError(error, 'listUserNotifications/markNotificationAsRead');
  }

  // 4.3. Get and update notification settings
  try {
    const settingsResponse = await api.get('/notifications/settings');
    console.log('\nCurrent Notification Settings:');
    console.log(`  Email: ${settingsResponse.data.channelPreferences.email}, Push: ${settingsResponse.data.channelPreferences.push}, SMS: ${settingsResponse.data.channelPreferences.sms}`);
    console.log(`  Quiet Hours Enabled: ${settingsResponse.data.quietHours.enabled}, Start: ${settingsResponse.data.quietHours.startTime}, End: ${settingsResponse.data.quietHours.endTime}`);

    // Update settings: enable SMS, enable quiet hours from 10 PM to 7 AM
    const updateSettingsRequest = {
      channelPreferences: {
        sms: true,
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '07:00',
      },
    };
    const updatedSettingsResponse = await api.put('/notifications/settings', updateSettingsRequest);
    console.log('\nUpdated Notification Settings:');
    console.log(`  Email: ${updatedSettingsResponse.data.channelPreferences.email}, Push: ${updatedSettingsResponse.data.channelPreferences.push}, SMS: ${updatedSettingsResponse.data.channelPreferences.sms}`);
    console.log(`  Quiet Hours Enabled: ${updatedSettingsResponse.data.quietHours.enabled}, Start: ${updatedSettingsResponse.data.quietHours.startTime}, End: ${updatedSettingsResponse.data.quietHours.endTime}`);

  } catch (error) {
    handleApiError(error, 'get/updateNotificationSettings');
  }
}

/**
 * 5. Marketplace (Plato AI): Interact with AI-Curated Products and Simulate Impact
 */
async function marketplaceExample() {
  console.log('\n--- Marketplace (Plato AI): Products and Impact Simulation ---');

  // 5.1. List AI-curated marketplace products (e.g., insurance, high personalization)
  try {
    const productsResponse = await api.get('/marketplace/products', {
      params: { category: 'insurance', aiPersonalizationLevel: 'high', limit: 2 },
    });
    console.log('AI-Curated Insurance Products (High Personalization):');
    if (productsResponse.data.data.length > 0) {
      productsResponse.data.data.forEach((product: MarketplaceProduct) => {
        console.log(`  ID: ${product.id}, Name: "${product.name}", Provider: ${product.provider}`);
        console.log(`    Description: ${product.description}`);
        console.log(`    AI Score: ${product.aiPersonalizationScore}, Reason: ${product.aiRecommendationReason}`);
      });

      // 5.2. Simulate the financial impact of the first recommended product (e.g., a loan)
      const firstProduct = productsResponse.data.data[0];
      if (firstProduct.category === 'loans') { // Assuming a loan product for simulation example
        console.log(`\nSimulating impact for product: "${firstProduct.name}" (ID: ${firstProduct.id})`);
        const simulationRequest = {
          simulationParameters: {
            loanAmount: 20000,
            repaymentTermMonths: 48,
          },
        };
        const simulationResponse = await api.post<ProductImpactSimulation>(
          `/marketplace/products/${firstProduct.id}/impact-simulate`,
          simulationRequest
        );
        console.log('Simulation Result:');
        console.log(`  Summary: ${simulationResponse.data.narrativeSummary}`);
        simulationResponse.data.keyImpacts.forEach(impact => {
          console.log(`  - ${impact.metric}: ${impact.value} (Severity: ${impact.severity})`);
        });
        if (simulationResponse.data.aiRecommendations) {
          console.log('  AI Recommendations:');
          simulationResponse.data.aiRecommendations.forEach(rec => console.log(`    - ${rec.title}: ${rec.description}`));
        }
      } else {
        console.log(`\nSkipping simulation for "${firstProduct.name}" as it's not a loan product in this example.`);
      }

      // 5.3. Redeem an offer (example, assuming an offer ID exists)
      const exampleOfferId = 'offer_home_ins_promo_1'; // This would come from a product's offerDetails
      console.log(`\nAttempting to redeem offer ID: ${exampleOfferId}`);
      try {
        const redeemResponse = await api.post(`/marketplace/offers/${exampleOfferId}/redeem`, {
          paymentAccountId: 'acc_chase_checking_4567', // Replace with a valid account ID
        });
        console.log(`Offer Redemption Status: ${redeemResponse.data.status}`);
        console.log(`  Message: ${redeemResponse.data.message}`);
      } catch (error) {
        handleApiError(error, `redeemMarketplaceOffer for ${exampleOfferId}`);
      }

    } else {
      console.log('  No highly personalized insurance products found.');
    }
  } catch (error) {
    handleApiError(error, 'listMarketplaceProducts/simulateMarketplaceProductImpact');
  }
}


/**
 * Main function to run all examples.
 */
async function main() {
  console.log('Starting Advanced Features Examples for James Burvel O\'Callaghan III API...');

  await generateStandardVideoAdExample();
  await generateAdvancedVideoAdExample();
  await manageWebhooksExample();
  await manageNotificationsExample();
  await marketplaceExample();

  console.log('\nAll Advanced Features Examples Completed.');
}

main().catch(console.error);