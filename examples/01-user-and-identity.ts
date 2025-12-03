import { OpenAPIClient } from 'openapi-client-axios';
import { Configuration } from 'openapi-client-axios';

// Assuming the OpenAPI specification is available at a URL or as a local file
// Replace with the actual path or URL to your OpenAPI spec
const OPENAPI_SPEC_URL = 'https://virtserver.swaggerhub.com/JOCALL3_1/jamesburvelocallaghaniiiapi/1.0';

async function manageUserIdentity() {
    const config: Configuration = {
        // You might need to configure authentication here if your API requires it for these operations
        // For example, using an API key or OAuth token.
        // If using OAuth, you'll need to handle the token acquisition flow separately.
        // apiKey: 'YOUR_API_KEY',
        // accessToken: 'YOUR_ACCESS_TOKEN',
    };

    const apiClient = new OpenAPIClient(OPENAPI_SPEC_URL, config);

    try {
        // 1. Register a New User
        console.log('Registering a new user...');
        const registrationResponse = await apiClient.registerUser({
            requestBody: {
                name: "James Burvel O'Callaghan III",
                email: "james.ocallaghan.iii@example.com",
                password: "SuperSecurePassword123!",
                phone: "+1-555-111-2222",
                dateOfBirth: "1995-07-22",
                address: {
                    street: "1 Quantum Leap Way",
                    city: "Aetheria",
                    state: "CA",
                    zip: "90210",
                    country: "USA"
                }
            }
        });
        console.log('User registered successfully:', JSON.stringify(registrationResponse.data, null, 2));
        const userId = registrationResponse.data.id; // Assuming user ID is returned

        // 2. Log in the User
        console.log('\nLogging in the user...');
        const loginResponse = await apiClient.userLogin({
            requestBody: {
                email: "james.ocallaghan.iii@example.com",
                password: "SuperSecurePassword123!"
            }
        });
        console.log('Login successful:', JSON.stringify(loginResponse.data, null, 2));
        // Store tokens for subsequent authenticated requests
        const accessToken = loginResponse.data.accessToken;
        apiClient.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // 3. Retrieve Current User Profile
        console.log('\nFetching current user profile...');
        const profileResponse = await apiClient.getCurrentUserEnhancedProfile();
        console.log('Current user profile:', JSON.stringify(profileResponse.data, null, 2));

        // 4. Update User Profile
        console.log('\nUpdating user profile...');
        const updateProfileResponse = await apiClient.updateCurrentUserProfile({
            requestBody: {
                name: "James B. O'Callaghan III",
                phone: "+1-555-333-4444",
                preferences: {
                    theme: "Dark-Quantum",
                    aiInteractionMode: "proactive",
                    notificationChannels: {
                        email: true,
                        push: true,
                        sms: true,
                        inApp: true
                    },
                    dataSharingConsent: true,
                    transactionGrouping: "merchant"
                }
            }
        });
        console.log('User profile updated:', JSON.stringify(updateProfileResponse.data, null, 2));

        // 5. Submit KYC Documentation
        console.log('\nSubmitting KYC documentation...');
        const kycSubmissionResponse = await apiClient.submitKYCDocuments({
            requestBody: {
                documentType: "drivers_license",
                documentNumber: "JD123456789",
                issueDate: "2021-05-15",
                expirationDate: "2031-05-15",
                countryOfIssue: "US",
                // In a real scenario, you would upload actual document images (base64 encoded or via multipart/form-data)
                // For this example, we'll use placeholder strings.
                documentFrontImage: "base64encoded_drivers_license_front_image_placeholder",
                documentBackImage: "base64encoded_drivers_license_back_image_placeholder",
                // If you have additional documents, you can include them here
                // additionalDocuments: ["base64encoded_utility_bill_placeholder"]
            }
        });
        console.log('KYC submission status:', JSON.stringify(kycSubmissionResponse.data, null, 2));

        // 6. Get Current KYC Status
        console.log('\nFetching current KYC status...');
        const kycStatusResponse = await apiClient.getKYCStatus();
        console.log('Current KYC status:', JSON.stringify(kycStatusResponse.data, null, 2));

        // Example of checking status after some time (simulated)
        // In a real application, you might poll or use webhooks to get updates.
        console.log('\nSimulating time passing for KYC verification...');
        // For demonstration, we'll assume the status might change.
        // In a real app, you'd fetch the status again after a delay.
        // For now, we'll just show the initial status.

    } catch (error: any) {
        console.error('An error occurred:', error.response?.data || error.message);
    }
}

manageUserIdentity();