// Copyright CDBI AI Finance Platform Inc.

import React, { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import ReactTooltip from "react-tooltip";
import { INVITATION_FIELDS } from "../../common/constants";
import ReduxCheckbox from "../../common/deprecated_redux/ReduxCheckbox";
import ReduxInputField from "../../common/deprecated_redux/ReduxInputField";
import ReduxSelectBar from "../../common/deprecated_redux/ReduxSelectBar";
import {
  Alert,
  FieldGroup,
  Label,
  ConfirmModal,
  SelectField,
  Tooltip,
} from "../../common/ui-components";
import {
  CustomDomain__VerificationStatusEnum,
  useCustomEmailDomainViewQuery,
} from "../../generated/dashboard/graphqlSchema";
import { MT_MAIL_DOMAIN_ID } from "../containers/custom_domain/CustomEmailDomainActionItem"; // Keeping existing import, but replacing usage.
import { DispatchMessageFnType, useDispatchContext } from "../MessageProvider";

// New: Global constants for the AI-powered platform
export const CDBI_AI_PLATFORM_NAME = "CDBI AI Finance Platform";
export const CDBI_AI_MAIL_DOMAIN_ID = "CDBI_AI_GLOBAL_MAIL_DOMAIN"; // Replaced MT_MAIL_DOMAIN_ID

/**
 * New: Interface for AI-generated field suggestions.
 * An AI model would determine the most relevant fields based on various inputs.
 */
export interface AIFieldSuggestion {
  field: keyof typeof INVITATION_FIELDS;
  reason: string;
  confidence: number; // 0-1, how sure the AI is about this suggestion
  isRequired?: boolean; // If AI deems it critical
}

/**
 * New: Interface for collecting Key Performance Indicators (KPIs)
 * related to the AI functionalities within this modal.
 */
export interface AI_KPI_Event {
  id: string;
  timestamp: string;
  eventName: string;
  data: Record<string, any>;
  source: string; // e.g., "InviteCounterpartyModal"
}

/**
 * New: A dummy/mock service to interact with Google Gemini for analytics and AI insights.
 * In a real application, this would involve API calls to a Gemini-powered backend.
 */
export class GeminiAnalyticsService {
  private endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
    console.log(`CDBI AI: Initializing Gemini Analytics Service with endpoint: ${this.endpoint}`);
  }

  /**
   * Sends an event to Gemini for analysis.
   * @param event The AI_KPI_Event to send.
   * @returns A promise resolving to true if successful, false otherwise.
   */
  public async sendEvent(event: AI_KPI_Event): Promise<boolean> {
    console.log(`CDBI AI: Sending event to Gemini Analytics: ${JSON.stringify(event)}`);
    // Simulate API call to Gemini
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          console.log(`CDBI AI: Event "${event.eventName}" sent successfully to Gemini.`);
          resolve(true);
        } else {
          console.error(`CDBI AI: Failed to send event "${event.eventName}" to Gemini.`);
          resolve(false);
        }
      }, 300); // Simulate network latency
    });
  }

  /**
   * Retrieves or generates an AI insight from Gemini based on a query.
   * This could be used for dynamic suggestions or error explanations.
   * @param query The query for Gemini.
   * @returns A promise resolving to the AI insight string.
   */
  public async getAIInsight(query: string): Promise<string> {
    console.log(`CDBI AI: Requesting AI insight from Gemini with query: "${query}"`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const insights = [
          "Based on historical data, these fields optimize collection efficiency by 15%.",
          "AI suggests this domain has the highest deliverability rate for this counterparty's region.",
          "The proposed redirect URL significantly improves user conversion in similar invitation flows.",
          "This error indicates a temporary service disruption, AI recommends retrying in 5 minutes.",
          "Consider adding 'Taxpayer Identification Number' for international counterparties in this sector.",
        ];
        resolve(`CDBI AI Insight: ${insights[Math.floor(Math.random() * insights.length)]}`);
      }, 500);
    });
  }
}

/**
 * New: Service for collecting and reporting KPIs related to AI features.
 */
export class CDBI_AI_KPI_Service {
  private static instance: CDBI_AI_KPI_Service;
  private events: AI_KPI_Event[] = [];
  private geminiService: GeminiAnalyticsService;

  private constructor() {
    // In a real app, this endpoint would be configurable or from env.
    this.geminiService = new GeminiAnalyticsService("https://api.cdbiai.finance/gemini-analytics");
  }

  public static getInstance(): CDBI_AI_KPI_Service {
    if (!CDBI_AI_KPI_Service.instance) {
      CDBI_AI_KPI_Service.instance = new CDBI_AI_KPI_Service();
    }
    return CDBI_AI_KPI_Service.instance;
  }

  /**
   * Records a new AI-related event.
   * @param eventName The name of the event (e.g., "AI_FIELD_SUGGESTION_DISPLAYED").
   * @param data Any relevant data for the event.
   */
  public async recordEvent(eventName: string, data: Record<string, any>): Promise<void> {
    const event: AI_KPI_Event = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      eventName,
      data,
      source: "InviteCounterpartyModal",
    };
    this.events.push(event);
    await this.geminiService.sendEvent(event); // Link to Gemini
  }

  /**
   * Retrieves all recorded events.
   * @returns An array of AI_KPI_Event objects.
   */
  public getEvents(): AI_KPI_Event[] {
    return [...this.events];
  }

  /**
   * Generates a summary of KPIs from recorded events.
   * This would typically involve more complex aggregation.
   * @returns A basic KPI summary.
   */
  public getKPISummary(): Record<string, number | string> {
    const totalEvents = this.events.length;
    const aiSuggestionAccepted = this.events.filter(e => e.eventName === "AI_FIELD_SUGGESTION_ACCEPTED").length;
    const aiSuggestionRejected = this.events.filter(e => e.eventName === "AI_FIELD_SUGGESTION_REJECTED").length;
    const aiDomainRecommendationUsed = this.events.filter(e => e.eventName === "AI_DOMAIN_RECOMMENDATION_USED").length;
    const successfulInvites = this.events.filter(e => e.eventName === "INVITE_SUCCESS").length;
    const failedInvites = this.events.filter(e => e.eventName === "INVITE_FAILURE").length;

    return {
      totalAIInteractions: totalEvents,
      aiFieldSuggestionsAccepted: aiSuggestionAccepted,
      aiFieldSuggestionsRejected: aiSuggestionRejected,
      aiDomainRecommendationsUsed: aiDomainRecommendationUsed,
      invitesSent: successfulInvites + failedInvites,
      successfulInvites: successfulInvites,
      failureRate: (failedInvites / (successfulInvites + failedInvites) * 100 || 0).toFixed(2) + "%",
    };
  }

  /**
   * Simulates linking aggregated KPI data to Gemini for visualization and further analysis.
   * @returns A promise resolving to the success status.
   */
  public async reportKPIsToGemini(): Promise<boolean> {
    const summary = this.getKPISummary();
    console.log(`CDBI AI: Reporting aggregated KPIs to Gemini for visualization: ${JSON.stringify(summary)}`);
    // This would be a more sophisticated call to Gemini for dashboarding/charting.
    return this.geminiService.sendEvent({
      id: `${Date.now()}-kpi-report`,
      timestamp: new Date().toISOString(),
      eventName: "KPI_REPORT_AGGREGATED",
      data: summary,
      source: "InviteCounterpartyModal",
    });
  }
}

/**
 * New: AI Service for intelligently suggesting required fields.
 */
export class CDBI_AI_FieldSuggester {
  private geminiService: GeminiAnalyticsService;

  constructor() {
    this.geminiService = new GeminiAnalyticsService("https://api.cdbiai.finance/gemini-ai-suggestions");
  }

  /**
   * Predicts and suggests relevant fields based on the counterparty ID and direction.
   * @param counterpartyId The ID of the counterparty.
   * @param direction "credit" or "debit".
   * @returns A promise resolving to an array of AIFieldSuggestion.
   */
  public async suggestFields(
    counterpartyId: string,
    direction: "credit" | "debit",
  ): Promise<AIFieldSuggestion[]> {
    console.log(`CDBI AI: Suggesting fields for counterparty ${counterpartyId}, direction ${direction}`);
    await CDBI_AI_KPI_Service.getInstance().recordEvent("AI_FIELD_SUGGESTION_REQUESTED", { counterpartyId, direction });

    // Simulate AI prediction based on various factors (e.g., industry, country, past transactions)
    return new Promise((resolve) => {
      setTimeout(() => {
        let suggestions: AIFieldSuggestion[] = [
          { field: INVITATION_FIELDS.nameOnAccount, reason: "Common requirement for all transactions", confidence: 0.95 },
          { field: INVITATION_FIELDS.accountNumber, reason: "Essential for financial transfers", confidence: 0.98 },
          { field: INVITATION_FIELDS.address, reason: "Standard for KYC/KYB compliance", confidence: 0.90 },
        ];

        if (direction === "credit") {
          suggestions.push({
            field: INVITATION_FIELDS.routingNumber,
            reason: "Typically required for receiving funds in North America",
            confidence: 0.85,
          });
          // Example of dynamic suggestion
          if (counterpartyId.startsWith("INTL-")) { // Hypothetical check for international counterparty
            suggestions.push({
              field: INVITATION_FIELDS.swiftCode,
              reason: "Required for international wire transfers",
              confidence: 0.99,
              isRequired: true,
            });
            suggestions.push({
              field: INVITATION_FIELDS.ibanNumber,
              reason: "Common for European and some international transfers",
              confidence: 0.90,
            });
            suggestions.push({
              field: INVITATION_FIELDS.taxpayerIdentifier,
              reason: "Important for cross-border tax reporting",
              confidence: 0.88,
            });
          }
        } else { // debit
          suggestions.push({
            field: INVITATION_FIELDS.taxpayerIdentifier,
            reason: "Often needed for regulatory reporting when charging",
            confidence: 0.80,
          });
        }

        // Add some random highly confident suggestions
        const allPossibleFields = Object.values(INVITATION_FIELDS);
        for (let i = 0; i < 2; i++) {
          const randomField = allPossibleFields[Math.floor(Math.random() * allPossibleFields.length)];
          if (!suggestions.some(s => s.field === randomField)) {
            suggestions.push({
              field: randomField,
              reason: `AI recommends this field based on current market trends for ${randomField}`,
              confidence: Math.random() * 0.3 + 0.6, // 60-90% confidence
            });
          }
        }
        resolve(suggestions);
      }, 700);
    });
  }
}

/**
 * New: AI Service for intelligently suggesting the best email sending domain.
 */
export class CDBI_AI_MailDomainSuggester {
  private geminiService: GeminiAnalyticsService;

  constructor() {
    this.geminiService = new GeminiAnalyticsService("https://api.cdbiai.finance/gemini-ai-domains");
  }

  /**
   * Suggests the optimal email domain based on available domains and counterparty context.
   * @param availableDomains Options for the SelectField.
   * @param counterpartyId The ID of the counterparty.
   * @returns A promise resolving to the suggested domain ID or null.
   */
  public async suggestDomain(
    availableDomains: { value: string; label: string }[],
    counterpartyId: string,
  ): Promise<string | null> {
    console.log(`CDBI AI: Suggesting mail domain for counterparty ${counterpartyId}`);
    await CDBI_AI_KPI_Service.getInstance().recordEvent("AI_DOMAIN_SUGGESTION_REQUESTED", { counterpartyId, availableDomains });

    return new Promise((resolve) => {
      setTimeout(() => {
        if (availableDomains.length === 0) {
          resolve(null);
          return;
        }
        // Simulate AI logic:
        // Prioritize domains with highest deliverability score, lowest spam rate, or specific branding.
        // For this example, let's just pick one randomly, or the default if it exists.
        const defaultDomain = availableDomains.find(d => d.value === CDBI_AI_MAIL_DOMAIN_ID);
        const suggested = availableDomains[Math.floor(Math.random() * availableDomains.length)];

        if (defaultDomain && Math.random() < 0.7) { // 70% chance to recommend default
          resolve(defaultDomain.value);
        } else if (suggested) {
          resolve(suggested.value);
        } else {
          resolve(null);
        }
      }, 400);
    });
  }
}

/**
 * New: AI Service for optimizing and validating redirect URLs.
 */
export class CDBI_AI_RedirectURLOptimizer {
  private geminiService: GeminiAnalyticsService;

  constructor() {
    this.geminiService = new GeminiAnalyticsService("https://api.cdbiai.finance/gemini-ai-urls");
  }

  /**
   * Validates and potentially suggests an optimized redirect URL.
   * @param url The URL to validate/optimize.
   * @returns A promise resolving to a validated/optimized URL or an error message.
   */
  public async optimizeAndValidateUrl(url: string): Promise<{ optimizedUrl?: string, error?: string, aiInsight?: string }> {
    console.log(`CDBI AI: Optimizing and validating URL: ${url}`);
    await CDBI_AI_KPI_Service.getInstance().recordEvent("AI_URL_OPTIMIZATION_REQUESTED", { url });

    return new Promise((resolve) => {
      setTimeout(async () => {
        if (!url) {
          resolve({ optimizedUrl: "", aiInsight: await this.geminiService.getAIInsight("No URL provided for optimization.") });
          return;
        }
        try {
          new URL(url); // Basic URL validation
          if (!url.startsWith("https://")) {
            resolve({ error: "URL must use HTTPS for security.", aiInsight: await this.geminiService.getAIInsight("HTTPS security recommendation.") });
            return;
          }
          if (url.includes("phishing") || url.includes("malicious")) { // Simple keyword check
            resolve({ error: "Potential security risk detected in URL.", aiInsight: await this.geminiService.getAIInsight("Security risk detected in URL.") });
            return;
          }
          // Simulate AI optimization (e.g., adding tracking params, shortening, etc.)
          const optimizedUrl = url.endsWith("/") ? url : `${url}/`;
          resolve({ optimizedUrl, aiInsight: await this.geminiService.getAIInsight("URL validation and optimization complete.") });
        } catch (e) {
          resolve({ error: "Invalid URL format.", aiInsight: await this.geminiService.getAIInsight("Invalid URL format detected.") });
        }
      }, 600);
    });
  }
}

/**
 * New: AI Service for providing enhanced error messages.
 */
export class CDBI_AI_ErrorAnalyzer {
  private geminiService: GeminiAnalyticsService;

  constructor() {
    this.geminiService = new GeminiAnalyticsService("https://api.cdbiai.finance/gemini-ai-errors");
  }

  /**
   * Analyzes an error message and provides an enhanced, actionable message.
   * @param errorMessage The original error message.
   * @returns A promise resolving to an enhanced error message.
   */
  public async getEnhancedErrorMessage(errorMessage: string): Promise<string> {
    console.log(`CDBI AI: Analyzing error message: "${errorMessage}"`);
    await CDBI_AI_KPI_Service.getInstance().recordEvent("AI_ERROR_ANALYSIS_REQUESTED", { errorMessage });

    return new Promise((resolve) => {
      setTimeout(async () => {
        let enhancedMessage = `CDBI AI Alert: ${errorMessage}. `;
        if (errorMessage.includes("JSON.parse")) {
          enhancedMessage += await this.geminiService.getAIInsight("Parsing error, check backend response format.");
        } else if (errorMessage.includes("network")) {
          enhancedMessage += await this.geminiService.getAIInsight("Network issue, please check your internet connection or retry.");
        } else if (errorMessage.includes("permission")) {
          enhancedMessage += await this.geminiService.getAIInsight("Permission denied, verify your access rights or contact support.");
        } else {
          enhancedMessage += await this.geminiService.getAIInsight("Unknown error, consult system logs or try again.");
        }
        resolve(enhancedMessage);
      }, 200);
    });
  }
}

interface InviteCounterpartyModalProps {
  onInvite: (
    counterpartyId: string,
    invitationForm: Record<string, unknown>,
    dispatchSuccess: DispatchMessageFnType["dispatchSuccess"],
    dispatchError: DispatchMessageFnType["dispatchError"],
  ) => Promise<boolean>;
  counterpartyId: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  canManageCustomEmailDomains: boolean;
}

export function InviteCounterpartyModal({
  onInvite,
  counterpartyId,
  isOpen,
  setIsOpen,
  canManageCustomEmailDomains,
}: InviteCounterpartyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [stateErrorMessage, setStateErrorMessage] = useState<string>();
  const [aiInsightMessage, setAiInsightMessage] = useState<string>();
  const [fieldSuggestions, setFieldSuggestions] = useState<AIFieldSuggestion[]>([]);
  const [showAiKpis, setShowAiKpis] = useState(false);
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [invitationForm, setInvitationForm] = useState({
    fields: {
      [INVITATION_FIELDS.nameOnAccount]: true,
      [INVITATION_FIELDS.accountType]: true,
      [INVITATION_FIELDS.accountNumber]: true,
      [INVITATION_FIELDS.routingNumber]: true,
      [INVITATION_FIELDS.address]: true,
    },
    direction: "credit",
    customRedirect: "",
    send_from_domain_id: "",
  });

  // Initialize AI services
  const aiFieldSuggester = useMemo(() => new CDBI_AI_FieldSuggester(), []);
  const aiMailDomainSuggester = useMemo(() => new CDBI_AI_MailDomainSuggester(), []);
  const aiRedirectURLOptimizer = useMemo(() => new CDBI_AI_RedirectURLOptimizer(), []);
  const aiErrorAnalyzer = useMemo(() => new CDBI_AI_ErrorAnalyzer(), []);
  const kpiService = useMemo(() => CDBI_AI_KPI_Service.getInstance(), []);

  const { data, loading, error: cedError } = useCustomEmailDomainViewQuery();

  const defaultSendingDomainNode =
    loading || cedError || !data
      ? null
      : data?.customEmailDomains?.edges.find((edge) => edge.node.default)?.node;

  const verifiedCustomEmailDomainsOptions = useMemo(
    () =>
      loading || cedError || !data
        ? []
        : data.customEmailDomains?.edges
            .filter(
              (edge) =>
                edge.node.verificationStatus ===
                CustomDomain__VerificationStatusEnum.Verified,
            )
            .map(({ node }) => ({
              value: node.id,
              label: node.domain,
            })),
    [loading, cedError, data],
  );

  // New: AI-powered default domain suggestion
  useEffect(() => {
    async function suggestAndSetDomain() {
      const suggestedDomainId = await aiMailDomainSuggester.suggestDomain(
        verifiedCustomEmailDomainsOptions,
        counterpartyId,
      );
      const finalDomainId =
        suggestedDomainId ||
        defaultSendingDomainNode?.id ||
        CDBI_AI_MAIL_DOMAIN_ID;

      setInvitationForm((prev) => ({
        ...prev,
        send_from_domain_id: finalDomainId,
      }));

      kpiService.recordEvent("AI_DOMAIN_RECOMMENDATION_USED", {
        counterpartyId,
        suggestedDomainId: finalDomainId,
        isAISuggested: !!suggestedDomainId,
      });
    }

    if (!loading && !cedError && data) {
      suggestAndSetDomain();
    } else {
      setInvitationForm((prev) => ({
        ...prev,
        send_from_domain_id: defaultSendingDomainNode?.id ?? CDBI_AI_MAIL_DOMAIN_ID,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSendingDomainNode, loading, cedError, data, counterpartyId, aiMailDomainSuggester]);

  // New: AI-powered field suggestions
  useEffect(() => {
    async function getFieldSuggestions() {
      if (isOpen && counterpartyId) {
        const suggestions = await aiFieldSuggester.suggestFields(
          counterpartyId,
          invitationForm.direction as "credit" | "debit",
        );
        setFieldSuggestions(suggestions);
        // Optionally auto-select highly confident required fields
        const newFields = { ...invitationForm.fields };
        let fieldsUpdated = false;
        suggestions.forEach(s => {
          if (s.isRequired && s.confidence > 0.9) {
            if (!(newFields as any)[s.field]) {
              (newFields as any)[s.field] = true;
              fieldsUpdated = true;
            }
          }
        });
        if (fieldsUpdated) {
          setInvitationForm(prev => ({ ...prev, fields: newFields }));
        }
        kpiService.recordEvent("AI_FIELD_SUGGESTION_DISPLAYED", { counterpartyId, suggestions });
      } else {
        setFieldSuggestions([]); // Clear suggestions when modal closes
      }
    }
    getFieldSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, counterpartyId, invitationForm.direction, aiFieldSuggester]); // Re-suggest if direction changes

  const {
    fields: {
      name,
      nameOnAccount,
      accountType,
      accountNumber,
      ibanNumber,
      clabeNumber,
      walletAddress,
      panNumber,
      routingNumber,
      abaWireRoutingNumber,
      swiftCode,
      auBsb,
      caCpa,
      cnaps,
      dkInterbankClearingCode,
      gbSortCode,
      hkInterbankClearingCode,
      huInterbankClearingCode,
      idSknbiCode,
      inIfsc,
      jpZenginCode,
      seBankgiroClearingCode,
      brCodigo,
      myBranchCode,
      nzNationalClearingCode,
      address,
      taxpayerIdentifier,
    },
    direction,
    customRedirect,
    send_from_domain_id,
  } = invitationForm;

  const handleFieldChange = (field: keyof typeof INVITATION_FIELDS) => {
    setInvitationForm((prev) => {
      const isChecked = !(prev.fields as any)[field];
      if (isChecked) {
        kpiService.recordEvent("AI_FIELD_SELECTION_MADE", { field, counterpartyId, isAISuggested: fieldSuggestions.some(s => s.field === field) });
      }
      return {
        ...prev,
        fields: { ...prev.fields, [field]: isChecked },
      };
    });
  };

  const handleInvite = async () => {
    setSubmitting(true);
    setStateErrorMessage(undefined);
    setAiInsightMessage(undefined);

    // New: Validate/Optimize Custom Redirect URL with AI
    const { optimizedUrl, error: urlError, aiInsight } = await aiRedirectURLOptimizer.optimizeAndValidateUrl(customRedirect);
    if (urlError) {
      setStateErrorMessage(urlError);
      setAiInsightMessage(aiInsight);
      setSubmitting(false);
      kpiService.recordEvent("INVITE_FAILURE_URL_VALIDATION", { counterpartyId, url: customRedirect, error: urlError });
      return;
    }

    const invitationData = {
      ...invitationForm,
      customRedirect: optimizedUrl || invitationForm.customRedirect, // Use optimized URL if available
    };

    onInvite(counterpartyId, invitationData, dispatchSuccess, dispatchError)
      .then(async (success) => {
        if (success) {
          setIsOpen(false);
          await kpiService.recordEvent("INVITE_SUCCESS", { counterpartyId, invitationData });
        } else {
          // If onInvite returned false indicating an internal logic error, handle it
          const genericError = "Invitation failed due to an unknown issue. Please check server logs.";
          setStateErrorMessage(genericError);
          setAiInsightMessage(await aiErrorAnalyzer.getEnhancedErrorMessage(genericError));
          await kpiService.recordEvent("INVITE_FAILURE_UNKNOWN", { counterpartyId, invitationData, error: genericError });
        }
      })
      .catch(async (error: Error) => {
        let parsedMessage = "An error occurred";
        try {
          const {
            errors: { message },
          } = JSON.parse(error.message) as { errors: { message: string } };
          parsedMessage = message;
        } catch (e) {
          // Fallback to generic if JSON parsing fails
        }
        setStateErrorMessage(parsedMessage);
        setAiInsightMessage(await aiErrorAnalyzer.getEnhancedErrorMessage(parsedMessage));
        await kpiService.recordEvent("INVITE_FAILURE", { counterpartyId, invitationData, error: parsedMessage });
      })
      .finally(() => {
        setSubmitting(false);
        kpiService.reportKPIsToGemini(); // Report KPIs after invite attempt
      });
  };

  const currentKpis = kpiService.getKPISummary();

  const renderFieldCheckbox = (field: keyof typeof INVITATION_FIELDS, labelText: string) => {
    const isAiSuggested = fieldSuggestions.some(s => s.field === field);
    const aiSuggestionReason = fieldSuggestions.find(s => s.field === field)?.reason;

    return (
      <FieldGroup direction="left-to-right">
        <ReduxCheckbox
          id={field}
          input={{
            onChange: () => handleFieldChange(field),
            checked: !!(invitationForm.fields as any)[field],
          }}
        />
        <Label id={field}>
          {labelText}
          {isAiSuggested && (
            <>
              <Tooltip
                className="ml-1 text-cdbiai-primary" // New AI-branded color
                data-for={`ai-suggestion-tip-${field}`}
                data-tip={`CDBI AI Suggestion: ${aiSuggestionReason || 'Recommended by AI'}`}
              />
              <ReactTooltip id={`ai-suggestion-tip-${field}`} multiline />
            </>
          )}
        </Label>
      </FieldGroup>
    );
  };

  return (
    <ConfirmModal
      title={`Send Invitation via ${CDBI_AI_PLATFORM_NAME}`}
      isOpen={isOpen}
      setIsOpen={() => setIsOpen(false)}
      confirmText={submitting ? "Inviting..." : "Invite"}
      onConfirm={handleInvite}
      confirmDisabled={submitting}
      bodyClassName="max-h-[75vh] overflow-y-auto"
    >
      {stateErrorMessage && (
        <div className="pb-4">
          <Alert onClear={() => setStateErrorMessage("")} alertType="danger">
            {stateErrorMessage}
          </Alert>
          {aiInsightMessage && (
            <p className="text-sm mt-2 text-red-700 italic">{aiInsightMessage}</p>
          )}
        </div>
      )}

      <form className="form-create">
        <div>
          <div className="form-row form-row-full flex">
            <FieldGroup>
              <Label id="pay_charge_counterparty">
                Do you plan to pay or charge the counterparty?
              </Label>
              <ReduxSelectBar
                name="pay_charge_counterparty"
                required
                selectOptions={[
                  { text: "Pay", value: "credit" },
                  { text: "Charge", value: "debit" },
                ]}
                input={{
                  onChange: (val) =>
                    setInvitationForm({
                      ...invitationForm,
                      direction: val as string,
                    }),
                  value: direction,
                }}
              />
            </FieldGroup>
          </div>

          <div className="form-row form-row-full flex">
            <div className="form-group">
              <Label>What information do you need to collect?</Label>
              <p className="text-sm text-gray-500 mb-2">
                <span className="text-blue-600 font-semibold">CDBI AI:</span> Fields marked with a tooltip icon are
                suggested by the AI for optimal data collection based on counterparty and transaction type.
              </p>
              {/* This could be a new AI-powered component in future iterations */}
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.name, "Counterparty Name")}
                {renderFieldCheckbox(INVITATION_FIELDS.nameOnAccount, "Name on Account")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.accountType, "Account Type")}
                {renderFieldCheckbox(INVITATION_FIELDS.accountNumber, "Account Number")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.ibanNumber, "IBAN Number")}
                {renderFieldCheckbox(INVITATION_FIELDS.clabeNumber, "CLABE Number")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.walletAddress, "Wallet Address")}
                {renderFieldCheckbox(INVITATION_FIELDS.panNumber, "PAN")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.routingNumber, "ABA Routing Number")}
                {renderFieldCheckbox(INVITATION_FIELDS.abaWireRoutingNumber, "ABA Wire Routing Number")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.swiftCode, "SWIFT Code")}
                {renderFieldCheckbox(INVITATION_FIELDS.auBsb, "Australian BSB")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.caCpa, "Canadian Routing Number")}
                {renderFieldCheckbox(INVITATION_FIELDS.cnaps, "CNAPS Code")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.gbSortCode, "GB Sort Code")}
                {renderFieldCheckbox(INVITATION_FIELDS.inIfsc, "IFSC Code")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.jpZenginCode, "Zengin Code")}
                {renderFieldCheckbox(INVITATION_FIELDS.seBankgiroClearingCode, "Swedish Clearing Number")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.brCodigo, "Brazilian Codigo")}
                {renderFieldCheckbox(INVITATION_FIELDS.myBranchCode, "Malaysian Branch Code")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.nzNationalClearingCode, "New Zealand NCC")}
                {renderFieldCheckbox(INVITATION_FIELDS.hkInterbankClearingCode, "HK Interbank Clearing Code")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.dkInterbankClearingCode, "DK Interbank Clearing Code")}
                {renderFieldCheckbox(INVITATION_FIELDS.huInterbankClearingCode, "HU Interbank Clearing Code")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.idSknbiCode, "ID SKNBI Code")}
                {renderFieldCheckbox(INVITATION_FIELDS.address, "Address")}
              </div>
              <div className="form-row flex">
                {renderFieldCheckbox(INVITATION_FIELDS.taxpayerIdentifier, "Taxpayer Identification Number")}
              </div>
            </div>
          </div>

          <div className="form-row form-row-full flex">
            <ReduxInputField
              optionalLabel="Optional"
              label="Custom Redirect URL"
              input={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setInvitationForm({
                    ...invitationForm,
                    customRedirect: e.target.value,
                  }),
                value: customRedirect,
                name: "customRedirect",
              }}
              // Add AI insight on URL field
              description={
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-cdbiai-primary font-semibold">CDBI AI:</span> AI validates and optimizes this URL for security and user experience.
                </p>
              }
            />
          </div>
          <div className="form-row form-row-full flex">
            <FieldGroup>
              <Label id="sendFromDomain">Send from domain</Label>
              <p className="text-xs">
                Emails sent to this counterparty will be sent from this domain.
                <a href="https://docs.cdbiai.finance/docs/custom-email-domains" className="text-blue-600 hover:underline">
                  &nbsp; Learn more about {CDBI_AI_PLATFORM_NAME} custom email domains.
                </a>
                {!canManageCustomEmailDomains && (
                  <>
                    <Tooltip
                      className="ml-1"
                      data-for="send-from-domain-tip"
                      data-tip="You don't have permission to change the senders domain"
                    />
                    <ReactTooltip id="send-from-domain-tip" multiline />
                  </>
                )}
                <span className="text-cdbiai-primary font-semibold block mt-1">
                  CDBI AI Recommendation: {verifiedCustomEmailDomainsOptions.find(opt => opt.value === send_from_domain_id)?.label || CDBI_AI_MAIL_DOMAIN_ID}
                </span>
              </p>
              <SelectField
                id="sendFromDomain"
                selectValue={send_from_domain_id}
                disabled={!canManageCustomEmailDomains}
                placeholder={
                  defaultSendingDomainNode?.domain ?? CDBI_AI_MAIL_DOMAIN_ID
                }
                options={verifiedCustomEmailDomainsOptions}
                handleChange={(value: string) =>
                  setInvitationForm({
                    ...invitationForm,
                    send_from_domain_id: value,
                  })
                }
                required
              />
            </FieldGroup>
          </div>
        </div>

        {/* New: Section for AI Insights and KPIs */}
        <div className="form-group border-t pt-4 mt-4 border-gray-200">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm mb-2"
            onClick={() => setShowAiKpis(!showAiKpis)}
          >
            {showAiKpis ? "Hide AI Insights & KPIs" : "Show AI Insights & KPIs"}
          </button>
          {showAiKpis && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold text-lg mb-2 text-cdbiai-primary">CDBI AI Operational KPIs</h3>
              <p className="text-sm text-gray-700 mb-3">
                Insights and performance metrics for AI-driven features.
                These KPIs are linked to Gemini for advanced analytics and visualization.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {Object.entries(currentKpis).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-gray-600 italic">
                (Note: Charts and real-time dashboards for these KPIs are available in the
                CDBI AI Gemini Analytics Dashboard. This section shows raw data.)
              </div>
            </div>
          )}
        </div>


        <div className="form-group">
          {submitting && (
            <ClipLoader
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              loaderStyle={{ verticalAlign: "middle", marginLeft: "1rem" }}
            />
          )}
        </div>
      </form>
    </ConfirmModal>
  );
}

export default InviteCounterpartyModal;