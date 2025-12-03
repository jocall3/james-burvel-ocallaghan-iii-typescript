/**
 * This module implements a sophisticated preferences management system, centralizing user-specific configurations for the entire financial platform.
 * Business value: It delivers a highly personalized and adaptive user experience, directly contributing to user satisfaction and operational efficiency.
 * By enabling granular control over interface themes, language, notification settings, and critical operational parameters like agent autonomy,
 * preferred token rails, and security features, this system empowers users to tailor the platform to their precise needs and risk profiles.
 * This customization capability reduces training overhead, mitigates user error, enhances system adoption, and ensures compliance with individual
 * operational mandates, ultimately translating into millions in operational savings and expanded user engagement. It is a foundational component
 * for human-in-the-loop agentic systems, allowing seamless integration of user intent with autonomous operations.
 */
import { useState, useEffect } from 'react';

export const usePreferences = () => {
    const [theme, setTheme] = useState<string>(
        localStorage.getItem('userTheme') || 'dark'
    );
    const [language, setLanguage] = useState<string>(
        localStorage.getItem('userLanguage') || 'en'
    );
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
        JSON.parse(localStorage.getItem('notificationsEnabled') || 'true')
    );
    const [denseLayout, setDenseLayout] = useState<boolean>(
        JSON.parse(localStorage.getItem('denseLayout') || 'false')
    );
    const [animationEffects, setAnimationEffects] = useState<boolean>(
        JSON.parse(localStorage.getItem('animationEffects') || 'true')
    );
    const [fontSize, setFontSize] = useState<string>(
        localStorage.getItem('fontSize') || 'medium'
    );

    // New preferences for Money20/20 architecture
    const [agentInteractionLevel, setAgentInteractionLevel] = useState<string>(
        localStorage.getItem('agentInteractionLevel') || 'assisted' // 'manual', 'assisted', 'autonomous'
    );
    const [mfaEnabled, setMfaEnabled] = useState<boolean>(
        JSON.parse(localStorage.getItem('mfaEnabled') || 'true')
    );
    const [preferredTokenRail, setPreferredTokenRail] = useState<string>(
        localStorage.getItem('preferredTokenRail') || 'default' // 'fast', 'batch', 'default'
    );
    const [realtimeDataRefreshInterval, setRealtimeDataRefreshInterval] = useState<number>(
        JSON.parse(localStorage.getItem('realtimeDataRefreshInterval') || '10') // seconds
    );
    const [telemetryOptIn, setTelemetryOptIn] = useState<boolean>(
        JSON.parse(localStorage.getItem('telemetryOptIn') || 'false')
    );
    const [identityVerificationLevel, setIdentityVerificationLevel] = useState<string>(
        localStorage.getItem('identityVerificationLevel') || 'standard' // 'basic', 'standard', 'enhanced'
    );
    const [fraudAlertThreshold, setFraudAlertThreshold] = useState<number>(
        JSON.parse(localStorage.getItem('fraudAlertThreshold') || '0.05') // e.g., 0.05 for 5% variance
    );
    const [transactionNotificationLevel, setTransactionNotificationLevel] = useState<string>(
        localStorage.getItem('transactionNotificationLevel') || 'critical' // 'all', 'critical', 'none'
    );

    useEffect(() => {
        localStorage.setItem('userTheme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('userLanguage', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    }, [notificationsEnabled]);

    useEffect(() => {
        localStorage.setItem('denseLayout', JSON.stringify(denseLayout));
    }, [denseLayout]);

    useEffect(() => {
        localStorage.setItem('animationEffects', JSON.stringify(animationEffects));
    }, [animationEffects]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    // Persist new preferences
    useEffect(() => {
        localStorage.setItem('agentInteractionLevel', agentInteractionLevel);
    }, [agentInteractionLevel]);

    useEffect(() => {
        localStorage.setItem('mfaEnabled', JSON.stringify(mfaEnabled));
    }, [mfaEnabled]);

    useEffect(() => {
        localStorage.setItem('preferredTokenRail', preferredTokenRail);
    }, [preferredTokenRail]);

    useEffect(() => {
        localStorage.setItem('realtimeDataRefreshInterval', JSON.stringify(realtimeDataRefreshInterval));
    }, [realtimeDataRefreshInterval]);

    useEffect(() => {
        localStorage.setItem('telemetryOptIn', JSON.stringify(telemetryOptIn));
    }, [telemetryOptIn]);

    useEffect(() => {
        localStorage.setItem('identityVerificationLevel', identityVerificationLevel);
    }, [identityVerificationLevel]);

    useEffect(() => {
        localStorage.setItem('fraudAlertThreshold', JSON.stringify(fraudAlertThreshold));
    }, [fraudAlertThreshold]);

    useEffect(() => {
        localStorage.setItem('transactionNotificationLevel', transactionNotificationLevel);
    }, [transactionNotificationLevel]);


    return {
        theme,
        setTheme,
        language,
        setLanguage,
        notificationsEnabled,
        setNotificationsEnabled,
        denseLayout,
        setDenseLayout,
        animationEffects,
        setAnimationEffects,
        fontSize,
        setFontSize,
        // Exporting new preferences
        agentInteractionLevel,
        setAgentInteractionLevel,
        mfaEnabled,
        setMfaEnabled,
        preferredTokenRail,
        setPreferredTokenRail,
        realtimeDataRefreshInterval,
        setRealtimeDataRefreshInterval,
        telemetryOptIn,
        setTelemetryOptIn,
        identityVerificationLevel,
        setIdentityVerificationLevel,
        fraudAlertThreshold,
        setFraudAlertThreshold,
        transactionNotificationLevel,
        setTransactionNotificationLevel,
    };
};

export default usePreferences;