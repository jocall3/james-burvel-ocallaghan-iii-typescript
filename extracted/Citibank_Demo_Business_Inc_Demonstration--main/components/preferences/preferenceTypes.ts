/**
 * This module defines the data structures for user preferences within the advanced financial application.
 * Business value: By enabling granular user configuration across UI, security, digital identity,
 * agentic AI interactions, and payment orchestration, this module empowers users with
 * unprecedented control and personalization. It ensures adherence to user-defined security
 * postures (e.g., MFA, key rotation reminders), optimizes transaction flows via preferred settlement rails,
 * and allows for tailored agentic AI interactions. This significantly enhances user satisfaction,
 * reduces operational friction, and contributes to robust platform governance and compliance.
 * A highly personalized and controllable experience drives engagement and builds trust,
 * which are crucial for a high-value financial service operating at scale.
 */

export type ThemeOption = 'dark' | 'light' | 'system';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja';
export type FontSizeOption = 'small' | 'medium' | 'large' | 'x-large';
export type AgentRemediationMode = 'automatic' | 'manual_review' | 'manual_override';
export type SettlementRailType = 'fast' | 'batch' | 'prioritized'; // Reflects multi-rail orchestration
export type StablecoinSymbol = 'USD_C' | 'EUR_C' | 'GBP_C' | 'JPY_C';
export type PaymentConfirmationLevel = 'standard' | 'simplified' | 'detailed';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface UserPreferences {
    /**
     * The selected application theme, e.g., 'dark', 'light', 'system'.
     */
    theme: ThemeOption;
    /**
     * The selected application language, e.g., 'en', 'es', 'fr'.
     */
    language: LanguageCode;
    /**
     * A boolean indicating whether notifications are enabled for general app alerts.
     */
    notificationsEnabled: boolean;
    /**
     * A boolean indicating whether a dense layout is preferred for UI elements.
     */
    denseLayout: boolean;
    /**
     * A boolean indicating whether animation effects are enabled in the UI.
     */
    animationEffects: boolean;
    /**
     * The selected font size, e.g., 'small', 'medium', 'large'.
     */
    fontSize: FontSizeOption;
    /**
     * A boolean indicating user consent for agentic AI systems to perform automated actions on their behalf.
     * Essential for ethical AI governance and user empowerment.
     */
    agentInteractionConsent: boolean;
    /**
     * Defines the level of user intervention required for agent-initiated remediation actions.
     * Options include 'automatic', 'manual_review', or 'manual_override' for critical situations.
     * Provides granular control over agent autonomy, balancing efficiency with human oversight.
     */
    remediationApprovalMode: AgentRemediationMode;
    /**
     * The user's preferred default rail for initiating transactions.
     * This preference influences the routing logic in the multi-rail orchestration system,
     * allowing users to prioritize speed, cost, or other factors.
     */
    defaultSettlementRail: SettlementRailType;
    /**
     * The user's preferred stablecoin for displaying balances and initiating token-based transactions.
     * This enhances user experience by aligning with their primary digital asset preference.
     */
    preferredStablecoin: StablecoinSymbol;
    /**
     * A boolean indicating whether multi-factor authentication (MFA) is enabled for the user's account.
     * A fundamental security control, critical for protecting digital identity and assets.
     */
    multiFactorAuthEnabled: boolean;
    /**
     * The interval (in days) at which the system should remind the user to rotate their cryptographic keys.
     * Promotes proactive security hygiene and reduces long-term key compromise risks.
     */
    keyRotationReminderInterval: number;
    /**
     * The user's preferred display currency for all financial figures.
     * Essential for localization and user comprehension of monetary values.
     */
    defaultCurrency: CurrencyCode;
    /**
     * The desired level of confirmation detail for payment transactions, such as 'standard', 'simplified', or 'detailed'.
     * Improves user experience by tailoring the confirmation flow to individual preferences for speed vs. verification.
     */
    paymentConfirmationMode: PaymentConfirmationLevel;
}

/**
 * Represents the keys for all available user preferences.
 * This type is critical for dynamic preference management and UI generation,
 * ensuring strong type safety across the application when interacting with user settings.
 */
export type PreferenceKey = keyof UserPreferences;