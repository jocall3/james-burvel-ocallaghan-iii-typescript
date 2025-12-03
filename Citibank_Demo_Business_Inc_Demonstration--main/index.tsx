import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './components/App';
import { DataProvider } from './context/DataContext';

// --- Commercial-Grade Production Enhancements: Core System Imports ---
// Error handling for robust, resilient user experience
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
// User authentication and session management for secure access
import { AuthProvider } from './context/AuthContext';
// Theming and UI personalization for brand consistency and user preference
import { ThemeProvider } from './context/ThemeContext';
// Internationalization (i18n) for global audience reach
import { I18nProvider } from './context/I18nContext';
// Feature flagging for A/B testing, phased rollouts, and dynamic configuration
import { FeatureFlagProvider } from './context/FeatureFlagContext';
// Advanced analytics and telemetry for deep user insights and product optimization
import { AnalyticsProvider } from './context/AnalyticsContext';
// Dedicated provider for core AI service integration and AI-driven features
import { AIIntegrationProvider } from './context/AIIntegrationContext';

// Utility imports for comprehensive system operation
import { reportWebVitals } from './utils/reportWebVitals'; // For performance monitoring
import { Logger } from './utils/Logger'; // Enhanced logging service
import { ConfigManager } from './config/ConfigManager'; // Centralized configuration manager

// Initialize the global logger for application-wide logging
const logger = new Logger('ApplicationBoot');

// --- Root Element and Application Initialization ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Critical error: application cannot mount. Log prominently and throw.
  logger.critical("Initialization Failed: Root DOM element 'root' not found. Application cannot render.");
  throw new Error("Could not find root element to mount to. Please ensure the DOM contains a div with id='root'.");
}

const root = ReactDOM.createRoot(rootElement);

// --- Render the Application with a Comprehensive Provider Stack ---
// This deeply nested structure ensures all core services are available throughout the application,
// reflecting a production-ready, feature-rich ecosystem.
root.render(
  <React.StrictMode>
    {/* Global Error Boundary: Catches unhandled errors anywhere in the component tree */}
    {/* and provides a graceful fallback UI, preventing application crashes. */}
    <GlobalErrorBoundary>
      {/* Theme Provider: Manages global UI themes, enabling personalization and brand adaptation. */}
      {/* Can integrate with user preferences and dynamic styling for a premium experience. */}
      <ThemeProvider>
        {/* Internationalization Provider: Enables multi-language support, crucial for global commercial products. */}
        {/* Manages translations and locale-specific formatting. */}
        <I18nProvider>
          {/* Authentication Provider: Handles user login, session management, and authorization roles. */}
          {/* Essential for secure and personalized user experiences in any commercial application. */}
          <AuthProvider>
            {/* Feature Flag Provider: Dynamically controls feature visibility for A/B testing, staged rollouts, */}
            {/* and targeted user experiences without requiring code deployments. */}
            <FeatureFlagProvider>
              {/* Analytics Provider: Collects comprehensive user interaction and performance data. */}
              {/* Designed for integration with advanced AI-powered analytics platforms for deep insights. */}
              <AnalyticsProvider>
                {/* AI Integration Provider: Manages connections, configurations, and state for all AI-driven services. */}
                {/* This is the central hub for infusing intelligent capabilities throughout the product. */}
                <AIIntegrationProvider>
                  {/* Data Provider: The original data context, now operating within a fully-fledged service ecosystem. */}
                  {/* Manages global application data, potentially interacting with AI models for data enrichment. */}
                  <DataProvider>
                    {/* The core application component, now empowered by a full stack of enterprise-grade services. */}
                    <App />
                  </DataProvider>
                </AIIntegrationProvider>
              </AnalyticsProvider>
            </FeatureFlagProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);

// --- Post-Render Application Lifecycle and Monitoring ---

// 1. Performance Monitoring: Critical for maintaining a high-quality user experience and identifying bottlenecks.
// Reports essential Web Vitals metrics (LCP, FID, CLS, etc.) to the configured analytics service.
// This data is invaluable for AI-driven performance optimization and user experience enhancement.
reportWebVitals((metric) => {
  logger.performance(`Web Vitals Metric Captured: ${metric.name} - ${metric.value.toFixed(2)}ms`);
  // In a commercial product, this would typically send data to a sophisticated analytics backend.
  // Example: AnalyticsService.sendWebVitalMetric(metric);
});

// 2. Service Worker Registration: Enabling Progressive Web App (PWA) capabilities.
// Enhances offline functionality, improves loading times, and provides app-like experiences.
// Crucial for a competitive, modern web application.
if ('serviceWorker' in navigator && ConfigManager.getAppConfig().enableServiceWorker) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        logger.info(`Service Worker registered successfully. Scope: ${registration.scope}`);
        // Optionally, check for updates or manage existing registrations.
      })
      .catch(error => {
        logger.error(`Service Worker registration failed: ${error.message}`, error);
      });
  });
} else {
  logger.warn('Service Worker API not available or disabled by configuration. PWA features may be limited.');
}

// 3. Environment and Configuration Logging: Providing critical context for debugging and operational insights.
// Logs key application configuration at startup, aiding in rapid diagnosis of environment-specific issues.
logger.info(`Application successfully initialized in environment: ${ConfigManager.getEnvironmentName()}`);
logger.debug(`Active Feature Flags: ${JSON.stringify(ConfigManager.getFeatureFlagConfig().activeFlags)}`);
// Additional startup diagnostics or API health checks could be initiated here.
// Example: ApiService.checkConnectivity().then(() => logger.info('API connectivity confirmed.')).catch(e => logger.error('API connectivity failed.', e));

// This expanded index.tsx now represents the robust, scalable, and monitorable entry point
// of a high-value, commercial-grade application, primed for advanced features including AI integration.
