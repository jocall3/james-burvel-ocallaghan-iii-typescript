// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from "react";
import { startCase } from "lodash";
import moment from "moment-timezone";
import { cn } from "~/common/utilities/cn";
import { Button, Icon, SelectField, Spinner } from "../../common/ui-components"; // Added Spinner
import {
  Group, // Re-mapped for strategic rebranding
  User, // Re-mapped for strategic rebranding
  ReviewActionEnum, // Re-mapped for strategic rebranding
  Reviewer, // Re-mapped for strategic rebranding
  RequiredReviewer, // Re-mapped for strategic rebranding
} from "../../generated/dashboard/graphqlSchema"; // Will use new conceptual types instead

// --- Mocking External Services and AI (for demonstration) ---
// In a real application, these would be actual API calls to Gemini, Salesforce, etc.
// The goal is to make this *epic* and *executable*, so we simulate these integrations.

/** Simulates a call to Gemini AI for a decision recommendation. */
async function callGeminiAI(
  ruleName: string,
  dataContext: any,
): Promise<{ recommendation: DecisionActionEnum; confidence: number; explanation: string }> {
  console.log(`Gemini AI analyzing: ${ruleName} with context:`, dataContext);
  return new Promise((resolve) => {
    setTimeout(() => {
      const decision = Math.random() > 0.7 ? DecisionActionEnum.Approve : DecisionActionEnum.Deny;
      resolve({
        recommendation: decision,
        confidence: Math.round(Math.random() * 20 + 80), // 80-100% confidence for 'epic' AI
        explanation: `Gemini AI's deep learning models indicate '${startCase(decision)}' based on real-time market dynamics and predictive analytics for rule '${ruleName}'.`,
      });
    }, 2000); // Simulate advanced AI processing time
  });
}

/** Simulates calling an external partner service for additional insights or actions. */
async function callPartnerService(
  serviceName: string,
  ruleId: string,
): Promise<{ status: "success" | "failure"; details: string }> {
  console.log(`Calling partner service '${serviceName}' for rule '${ruleId}'`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const status = Math.random() > 0.2 ? "success" : "failure"; // 80% success rate for 'best app ever'
      resolve({
        status,
        details:
          status === "success"
            ? `Epic integration! ${serviceName} verified all required data points and provided critical compliance insights.`
            : `Warning: ${serviceName} reported a minor anomaly. Human review recommended.`,
      });
    }, 1500); // Simulate external API latency
  });
}

// --- End Mocking ---

// Re-defining core types to reflect the new vision for "the best app ever"
export enum DecisionActionEnum {
  Approve = "APPROVE",
  Deny = "DENY",
  Automated = "AUTOMATED",
  HumanOverride = "HUMAN_OVERRIDE",
  PartnerConsulted = "PARTNER_CONSULTED",
  Pending = "PENDING",
  Future = "FUTURE",
}

// Strategic rebranding of core entities
interface PartnerService {
  id: string;
  name: string;
  path?: string; // Link to the external service's dashboard/details
  description?: string;
}

interface HumanOperator {
  id: string;
  name: string;
  path?: string; // Link to the human operator's profile/dashboard
}

interface DecisionAgent {
  id?: string;
  action: DecisionActionEnum;
  actionTime?: string; // ISO string date
  humanOperator?: HumanOperator;
  partnerService?: PartnerService; // The external partner that took action or was consulted
  aiModel?: {
    id: string;
    name: string; // e.g., "Gemini AI"
    confidence: number;
    explanation: string;
  };
  canActAsServices?: PartnerService[]; // Roles/services a human operator can act as
}

interface RequiredDecisionAgent {
  id?: string;
  numberOfAgents?: number; // How many human/AI/partner actions are needed
  conditionalServices?: PartnerService[]; // Which specific services are needed
}

export enum RuleStatus {
  Pending,
  Approved,
  Denied,
  Automated, // New status for AI-driven decisions
}

export interface RuleInterface {
  id?: string;
  /** When `true`, sets the rule as the active decision point needing resolution within the IntelliFlow. */
  activeRule?: boolean;
  /** Name of the rule or policy */
  name?: string;
  /** Path to the comprehensive rule documentation or policy */
  path?: string;
  /** Describes the primary objective or condition of this rule.
   *
   * An example might be "High-Value Transaction Vetting" or "Compliance Assurance Check"
   */
  decisionObjective: string;
  /** Decision Agents (AI, Human, Partner) associated with the given rule */
  decisionAgents?: DecisionAgent[];
  /** Required decision agents associated with triggered rule */
  requiredDecisionAgents?: RequiredDecisionAgent[];
  /** Contextual data for AI analysis or external partner services */
  dataContext?: any;
}

interface SharedSynergyBlockProps {
  /** Allows you to pass custom styles to the outermost div of the component. */
  className?: string;
  /** Action fired when a decision is made or an external service is engaged. */
  onDecisionAction?: (
    action: DecisionActionEnum,
    partnerServiceId: string | null, // The service making the decision (if applicable)
    decisionAgentId: string | null, // The specific agent slot being filled
    isExecutiveOverride: boolean,
  ) => void;
  /** Action fired when an external AI is explicitly consulted. */
  onConsultAI?: (ruleId: string, dataContext: any) => void;
  /** Action fired when an external partner service is explicitly engaged. */
  onEngagePartnerService?: (serviceId: string, ruleId: string) => void;
}

interface DecisionLogEntryProps {
  /** When `true`, the decision was an executive override */
  executiveOverride?: boolean;
  /** Used with conditional decision agents */
  conditionalServicesComponent?: React.ReactNode;
  /** Allows you to pass custom styles to the outermost div of the component. */
  className?: string;
  /** Action the agent decided with. */
  action?: DecisionActionEnum;
  /** Time the decision was made. */
  actionTime?: Date;
  /** Partner service associated with the decision. */
  partnerService?: PartnerService;
  /** Human operator who made the decision. */
  humanOperator?: HumanOperator;
  /** AI Model that made the decision or recommendation. */
  aiModel?: DecisionAgent["aiModel"];
}

/**
 * Renders a log entry for a decision made by an AI, Human Operator, or Partner Service.
 * This is the 'history' of a decision point, enriched with source information.
 */
function DecisionLogEntry({
  executiveOverride = false,
  conditionalServicesComponent,
  className,
  action,
  actionTime,
  humanOperator,
  partnerService,
  aiModel,
}: DecisionLogEntryProps) {
  let decisionSource: React.ReactNode;
  let decisionText: string = "";

  if (humanOperator) {
    decisionText = startCase(action || "Decision") + " by ";
    decisionSource = (
      <Button
        buttonType="link"
        display="inline-block"
        onClick={(): void => {
          window.open(humanOperator?.path, "_blank");
        }}
      >
        {humanOperator?.name}
      </Button>
    );
  } else if (aiModel) {
    decisionText = "Automated by ";
    decisionSource = (
      <span className="font-bold text-purple-600">
        {aiModel.name} ({aiModel.confidence}% confidence)
      </span>
    );
  } else if (partnerService) {
    decisionText = "Via Partner ";
    decisionSource = (
      <Button
        buttonType="link"
        display="inline-block"
        onClick={(): void => {
          window.open(partnerService?.path, "_blank");
        }}
      >
        {partnerService?.name}
      </Button>
    );
  } else {
    decisionSource = <span className="italic text-gray-500">System</span>;
  }

  return (
    <div className={cn(className, "align-middle flex items-start text-sm bg-white p-3 rounded-md shadow-sm")}>
      <Icon
        alignment="baseline"
        className="mr-2.5 shrink-0 text-gray-400 mt-0.5"
        color="currentColor"
        iconName="time_60_s"
        size="s"
      />
      <div className="flex flex-col flex-grow">
        <span className="flex items-center gap-1">
          {action === DecisionActionEnum.Approve && (
            <span className="text-green-600 font-bold">APPROVED</span>
          )}
          {action === DecisionActionEnum.Deny && (
            <span className="text-red-600 font-bold">DENIED</span>
          )}
          {action === DecisionActionEnum.Automated && (
            <span className="text-blue-600 font-bold">AUTOMATED</span>
          )}
          {action === DecisionActionEnum.HumanOverride && (
            <span className="text-orange-600 font-bold">OVERRIDDEN</span>
          )}
          {action === DecisionActionEnum.PartnerConsulted && (
            <span className="text-yellow-600 font-bold">CONSULTED</span>
          )}
          {" "}
          {decisionSource}
          {humanOperator && partnerService && ( // If a human acted *as* a service
            <>
              {" leveraging "}
              {executiveOverride && !partnerService ? (
                <span className="font-bold text-red-500">
                  Executive Privilege
                </span>
              ) : (
                <Button
                  buttonType="link"
                  display="inline-block"
                  onClick={(): void => {
                    window.open(partnerService?.path, "_blank");
                  }}
                >
                  {partnerService?.name}
                </Button>
              )}
            </>
          )}
          {conditionalServicesComponent && (
            <span className="ml-1 text-gray-500 text-xs">
              (managing {conditionalServicesComponent} flow)
            </span>
          )}
        </span>
        {aiModel?.explanation && (
          <span className="text-xs text-gray-600 italic mt-1">
            "{aiModel.explanation}"
          </span>
        )}
        {actionTime && (
          <span className="text-xs text-gray-500 mt-1">
            on {moment(actionTime).format("MMMM Do YYYY, h:mm a")}
          </span>
        )}
      </div>
    </div>
  );
}

interface IntelliDecisionPanelProps extends SharedSynergyBlockProps {
  /** Executive override agent, if it exists. */
  executiveOverrideAgent: DecisionAgent;
  /** Services or AI models the item needs decisions from. */
  targetServices?: PartnerService[];
  /** A list of `PartnerService` roles the human operator can act as. */
  canActAsServices?: PartnerService[];
  /** When `true`, disables all actions. */
  disableActions?: boolean;
  /** The total number of decisions needed for row. Defaults to 1. */
  numberOfDecisions?: number;
  /** Current decision agent id needing action */
  decisionAgentId?: string;
  /** Rule ID this panel belongs to */
  ruleId: string;
  /** Contextual data for AI analysis */
  dataContext?: any;
}

/**
 * Renders the intelligence-driven decision panel, showcasing AI insights and options for human or partner intervention.
 * This is where the magic happens, making it "epic and worth millions."
 */
function IntelliDecisionPanel({
  executiveOverrideAgent,
  targetServices = [],
  canActAsServices = [],
  className,
  disableActions = false,
  numberOfDecisions = 1,
  onDecisionAction,
  onConsultAI,
  onEngagePartnerService,
  decisionAgentId,
  ruleId,
  dataContext,
}: IntelliDecisionPanelProps) {
  const [currentActorServiceId, setCurrentActorServiceId] = useState<
    string | null
  >(
    canActAsServices.length > 1 || canActAsServices.length === 0
      ? null
      : canActAsServices && canActAsServices[0].id,
  );
  const [geminiRecommendation, setGeminiRecommendation] = useState<
    Awaited<ReturnType<typeof callGeminiAI>> | null
  >(null);
  const [partnerConsultResult, setPartnerConsultResult] = useState<
    Awaited<ReturnType<typeof callPartnerService>> | null
  >(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingPartner, setIsLoadingPartner] = useState(false);

  useEffect(() => {
    // Automatically consult Gemini AI for initial recommendation upon panel load
    // This is a key "epic" feature for proactive intelligence.
    if (!geminiRecommendation && onConsultAI && dataContext && !isLoadingAI) {
      handleConsultGemini();
    }
  }, [ruleId, dataContext, onConsultAI]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConsultGemini = async () => {
    setIsLoadingAI(true);
    try {
      const result = await callGeminiAI(ruleId, dataContext);
      setGeminiRecommendation(result);
      onConsultAI?.(ruleId, dataContext); // Notify parent component if needed
    } catch (error) {
      console.error("Failed to consult Gemini AI:", error);
      // Handle AI consultation error gracefully in UI
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleEngagePartner = async (serviceId: string, serviceName: string) => {
    setIsLoadingPartner(true);
    try {
      const result = await callPartnerService(serviceName, ruleId);
      setPartnerConsultResult(result);
      onEngagePartnerService?.(serviceId, ruleId); // Notify parent
    } catch (error) {
      console.error(`Failed to engage partner ${serviceName}:`, error);
      // Handle partner engagement error gracefully
    } finally {
      setIsLoadingPartner(false);
    }
  };

  const selectOptions = canActAsServices.map((service) => ({
    label: service.name,
    value: service.id,
  }));

  const targetServicesComponent = targetServices?.map(
    (service, index, array) => {
      const lastElement = array.length - 1 === index;
      return (
        <span key={`target_services_${service.id}`}>
          <Button
            buttonType="link"
            className={cn("pr-1", !lastElement && "mr-1")}
            display="inline-block"
            onClick={(): void => {
              window.open(service?.path, "_blank");
            }}
            disabled={disableActions}
          >
            {service?.name}
          </Button>
          {!lastElement && "or "}
        </span>
      );
    },
  );

  if (executiveOverrideAgent) {
    return (
      <DecisionLogEntry
        executiveOverride
        conditionalServicesComponent={targetServicesComponent}
        action={executiveOverrideAgent.action}
        actionTime={new Date(executiveOverrideAgent.actionTime as string)}
        humanOperator={executiveOverrideAgent.humanOperator as HumanOperator}
      />
    );
  }
  return (
    <div className={cn("flex flex-col gap-2 bg-gray-50 p-4 rounded-lg border border-blue-100", className)}>
      <div className="flex items-center text-sm font-medium text-blue-700">
        <Icon
          alignment="baseline"
          className="mr-2.5 shrink-0 text-blue-500"
          color="currentColor"
          iconName="star_circle" // A more 'epic' icon
          size="s"
        />
        <span className="font-bold text-lg text-blue-800">
          {numberOfDecisions}{" "}
          {numberOfDecisions > 1 ? "Strategic Decisions" : "Strategic Decision"}{" "}
          needed from {targetServicesComponent}
        </span>
      </div>

      <div className="ml-7 flex flex-col gap-3 p-4 border border-blue-200 rounded-md bg-white shadow-lg">
        <h3 className="font-extrabold text-xl text-purple-800 mb-2">Cognitive Intelligence Hub</h3>

        {/* Gemini AI Recommendation Block - Always present for immediate insight */}
        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md border border-purple-200">
          {isLoadingAI ? (
            <Spinner size="sm" className="text-purple-600" />
          ) : geminiRecommendation ? (
            <Icon iconName="smart_toy" className="text-purple-600 text-xl" />
          ) : (
            <Icon iconName="robot" className="text-gray-400 text-xl" />
          )}
          <span className="font-bold text-purple-800">Gemini AI Insight:</span>
          {geminiRecommendation ? (
            <div className="flex flex-col text-sm">
              <span className={cn("font-semibold", {
                "text-green-700": geminiRecommendation.recommendation === DecisionActionEnum.Approve,
                "text-red-700": geminiRecommendation.recommendation === DecisionActionEnum.Deny,
              })}>
                {startCase(geminiRecommendation.recommendation)}{" "}
                <span className="text-gray-600 font-normal">
                  ({geminiRecommendation.confidence}% confidence)
                </span>
              </span>
              <span className="italic text-gray-500 text-xs mt-0.5">
                "{geminiRecommendation.explanation}"
              </span>
            </div>
          ) : (
            <Button
              buttonType="link"
              onClick={handleConsultGemini}
              disabled={disableActions || isLoadingAI}
              leftIcon={<Icon iconName="lightbulb_outline" />}
              className="text-purple-600 hover:text-purple-800"
            >
              Proactively Consult Gemini AI
            </Button>
          )}
        </div>

        {/* External Partner Integrations - Dynamic buttons for engagement */}
        {targetServices.length > 0 && (
          <div className="flex flex-col gap-2 mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
            <span className="font-bold text-blue-800 text-lg">
              Partner Ecosystem Engagement:
            </span>
            <div className="flex flex-wrap gap-2">
              {targetServices.map((service) => (
                <Button
                  key={`partner_engage_${service.id}`}
                  buttonType="tertiary"
                  size="small"
                  onClick={() => handleEngagePartner(service.id, service.name)}
                  disabled={disableActions || isLoadingPartner}
                  leftIcon={isLoadingPartner ? <Spinner size="xs" /> : <Icon iconName="group_add" />}
                  className="!bg-blue-600 hover:!bg-blue-700 text-white font-semibold"
                >
                  Engage {service.name} for Validation
                </Button>
              ))}
            </div>
            {partnerConsultResult && (
              <p className={cn("text-xs mt-1 p-2 rounded-md", {
                "bg-green-100 text-green-700 border border-green-300": partnerConsultResult.status === "success",
                "bg-red-100 text-red-700 border border-red-300": partnerConsultResult.status === "failure",
              })}>
                <span className="font-bold">{startCase(partnerConsultResult.status)}: </span>
                {partnerConsultResult.details}
              </p>
            )}
          </div>
        )}

        {/* Human Operator Decision Controls - For critical human oversight */}
        {canActAsServices.length > 0 && (
          <div className="flex flex-col gap-2 mt-3 p-2 bg-green-50 rounded-md border border-green-200">
            <span className="font-bold text-green-800 text-lg">Human Operator Oversight:</span>
            {canActAsServices.length > 1 && (
              <SelectField
                name="multiRoleDeciderSelect"
                selectValue={currentActorServiceId}
                options={selectOptions}
                handleChange={(value: string) => {
                  setCurrentActorServiceId(value);
                }}
                placeholder="Select your operational role"
                className="!border-green-300"
              />
            )}
            <div className="flex w-full flex-row gap-2">
              {[DecisionActionEnum.Approve, DecisionActionEnum.Deny].map(
                (action) => (
                  <Button
                    key={action}
                    buttonType={action === DecisionActionEnum.Approve ? "primary" : "secondary"}
                    disabled={!currentActorServiceId || disableActions}
                    fullWidth
                    onClick={() => {
                      onDecisionAction?.(
                        action,
                        currentActorServiceId as string, // This is the service the human acts *as*
                        decisionAgentId as string, // The specific agent slot
                        false, // isExecutiveOverride
                      );
                    }}
                    leftIcon={<Icon iconName={action === DecisionActionEnum.Approve ? "checkmark_circle" : "clear_circle"} />}
                    className={cn(
                      action === DecisionActionEnum.Approve ? "!bg-green-600 hover:!bg-green-700" : "!bg-red-600 hover:!bg-red-700",
                      "text-white font-bold text-md shadow-md"
                    )}
                  >
                    {startCase(action)} Transaction
                  </Button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ruleStatus(
  decisionAgents: DecisionAgent[],
  executiveOverrideAgent?: DecisionAgent,
): RuleStatus {
  const actions = decisionAgents
    .filter(
      (agent) =>
        agent.action !== DecisionActionEnum.Pending &&
        agent.action !== DecisionActionEnum.Future,
    )
    .map((agent) => agent.action) as DecisionActionEnum[];

  if (actions.length === 0) {
    return RuleStatus.Pending;
  }

  // If any agent (AI, Human, Partner) explicitly approved or executive override approved
  if (
    actions.includes(DecisionActionEnum.Approve) ||
    actions.includes(DecisionActionEnum.Automated) ||
    executiveOverrideAgent?.action === DecisionActionEnum.Approve ||
    executiveOverrideAgent?.action === DecisionActionEnum.Automated
  ) {
    return RuleStatus.Approved;
  }

  // If any agent (AI, Human, Partner) explicitly denied or executive override denied
  if (
    actions.includes(DecisionActionEnum.Deny) ||
    executiveOverrideAgent?.action === DecisionActionEnum.Deny
  ) {
    return RuleStatus.Denied;
  }

  return RuleStatus.Pending;
}

function renderStatusIcon(
  decisionAgents: DecisionAgent[],
  executiveOverrideAgent?: DecisionAgent,
) {
  const currentRuleStatus = ruleStatus(decisionAgents, executiveOverrideAgent);

  switch (currentRuleStatus) {
    case RuleStatus.Pending:
      return (
        <Icon
          className="mr-2 shrink-0 text-orange-400 text-xl"
          color="currentColor"
          iconName="error_outlined"
        />
      );
    case RuleStatus.Approved:
      return (
        <Icon
          className="mr-2 shrink-0 text-green-500 text-xl"
          color="currentColor"
          iconName="checkmark_circle"
        />
      );
    case RuleStatus.Denied:
      return (
        <Icon
          className="mr-2 shrink-0 text-red-500 text-xl"
          color="currentColor"
          iconName="clear_circle"
        />
      );
    case RuleStatus.Automated:
      return (
        <Icon
          className="mr-2 shrink-0 text-blue-500 text-xl"
          color="currentColor"
          iconName="smart_toy"
        />
      );
    default:
      return (
        <Icon
          className="mr-2 shrink-0 text-gray-400 text-xl"
          color="currentColor"
          iconName="question_circle"
        />
      );
  }
}

interface SynergyHubBlockProps extends SharedSynergyBlockProps {
  /** Executive override agent, if it exists. */
  executiveOverrideAgent?: IntelliDecisionPanelProps["executiveOverrideAgent"];
  /** When `true`, disables all actions. */
  disableActions?: IntelliDecisionPanelProps["disableActions"];
  /** When `true`, shows any decision actions the user can take and decisions that have already occurred. */
  renderDecisionDetails?: boolean;
  /** Rules triggered within the block.
   *
   * Each rule can have multiple decisions needed, or decisions already received.
   *
   * If there is more than one rule triggered, it will display the rules triggered in the order they exist in the array.
   */
  rules: RuleInterface[];
}

/**
 * Renders an advanced decision block, integrating AI insights, partner services, and human oversight.
 * This is the core 'Synergy Hub' component, designed for commercial standards and an "epic" user experience.
 */
function SynergyHubBlock({
  executiveOverrideAgent,
  children,
  className,
  disableActions = false,
  onDecisionAction,
  onConsultAI,
  onEngagePartnerService,
  renderDecisionDetails,
  rules,
}: React.PropsWithChildren<SynergyHubBlockProps>) {
  return (
    <div
      className={cn(
        "border border-gray-100 rounded-xl shadow-2xl bg-white overflow-hidden", // Enhanced, modern styling
        className,
      )}
    >
      {/* Epic Header for the Synergy Hub */}
      <div className="p-4 bg-gradient-to-r from-blue-700 to-purple-800 text-white rounded-t-xl mb-4">
        <h2 className="text-3xl font-extrabold px-2">Synergy Hub: IntelliFlow Engine</h2>
        <p className="px-2 text-md opacity-90 mt-1">
          Unleashing the power of Gemini AI and integrated partner networks for superior decisioning.
        </p>
      </div>

      <div className="px-4 pb-4">
        {rules?.map((rule, index) => (
          <div
            key={`synergy_rule_row_${rule.id || rule.name || index}`}
            className="flex flex-col gap-4 pb-6 mb-6 last:pb-0 last:mb-0 border-b border-gray-200 last:border-b-0"
          >
            <div className="flex flex-row items-start">
              {rules.length > 1 ? (
                <div
                  className={cn(
                    "mr-3 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg",
                    rule.activeRule ? "bg-orange-500" : "bg-gray-500", // Brighter active rule
                  )}
                >
                  {index + 1}
                </div>
              ) : (
                renderStatusIcon(rule.decisionAgents || [], executiveOverrideAgent)
              )}
              <div className="font-extrabold text-2xl text-gray-900 flex-grow leading-tight">
                {rule.decisionObjective}
                {rule.path && (
                  <>
                    <br />
                    <Button
                      buttonType="link"
                      className="break-word !items-start !whitespace-normal text-left text-blue-600 hover:text-blue-800 text-lg font-medium mt-1"
                      display="inline-block"
                      onClick={(): void => {
                        window.open(rule.path, "_blank");
                      }}
                    >
                      {rule.name || "View Policy Details"}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div
              className={cn(
                "ml-2 pl-6 pt-3", // Increased padding for visual weight
                rules.length > 1 && "border-l-4 border-dashed border-purple-300", // Distinct visual for nested rules
              )}
            >
              {renderDecisionDetails && (
                <div className="flex flex-col gap-5">
                  {rule.decisionAgents
                    ? rule.decisionAgents?.map((agent) => {
                        switch (agent.action) {
                          case DecisionActionEnum.Pending:
                          case DecisionActionEnum.Future:
                            return (
                              <IntelliDecisionPanel
                                key={`${agent.action}_${agent.id}`}
                                executiveOverrideAgent={
                                  executiveOverrideAgent as DecisionAgent
                                }
                                targetServices={agent.canActAsServices as PartnerService[]} // Using canActAsServices for target services
                                canActAsServices={agent.canActAsServices}
                                onDecisionAction={onDecisionAction}
                                onConsultAI={onConsultAI}
                                onEngagePartnerService={onEngagePartnerService}
                                disableActions={disableActions}
                                decisionAgentId={agent.id}
                                ruleId={rule.id || `rule-${index}`}
                                dataContext={rule.dataContext}
                              />
                            );
                          case DecisionActionEnum.Approve:
                          case DecisionActionEnum.Deny:
                          case DecisionActionEnum.Automated:
                          case DecisionActionEnum.HumanOverride:
                          case DecisionActionEnum.PartnerConsulted:
                            return (
                              <DecisionLogEntry
                                key={`${agent.action}_${agent.id}`}
                                action={agent.action}
                                actionTime={
                                  new Date(agent.actionTime as string)
                                }
                                partnerService={agent.partnerService as PartnerService}
                                humanOperator={agent.humanOperator as HumanOperator}
                                aiModel={agent.aiModel}
                              />
                            );
                          default:
                            return null;
                        }
                      })
                    : rule.requiredDecisionAgents &&
                      rule.requiredDecisionAgents.map((requiredAgent, reqIndex) => (
                        <IntelliDecisionPanel
                          key={`required_agent_${requiredAgent.id || reqIndex}`}
                          targetServices={requiredAgent.conditionalServices}
                          numberOfDecisions={requiredAgent.numberOfAgents}
                          executiveOverrideAgent={
                            executiveOverrideAgent as DecisionAgent
                          }
                          ruleId={rule.id || `rule-${index}`}
                          dataContext={rule.dataContext}
                        />
                      ))}
                </div>
              )}
              {children}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ExecutiveOverrideModuleProps extends SharedSynergyBlockProps {
  /** When `true`, disables buttons */
  disableActions?: boolean;
}

/**
 * A highly privileged module for executive-level final decision making, bypassing standard IntelliFlows.
 */
function ExecutiveOverrideModule({
  className,
  disableActions,
  onDecisionAction,
}: ExecutiveOverrideModuleProps) {
  return (
    <SynergyHubBlock
      className={cn(className, "border-red-400 bg-red-50 !shadow-red-200/50")} // Highlight for overrides
      renderDecisionDetails
      rules={[
        {
          activeRule: true,
          decisionObjective: "Executive Oversight & Final Override",
          dataContext: { reason: "Executive discretion applied" }
        },
      ]}
    >
      <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800 font-semibold text-lg">
        <Icon iconName="warning_outline" className="text-red-600 mr-2" />
        As an Executive, you possess the ultimate authority to override all system recommendations and decision flows for this transaction. Use with utmost caution.
      </div>
      <div className="flex w-full flex-row gap-2 mt-4">
        {[DecisionActionEnum.Approve, DecisionActionEnum.Deny].map((action) => (
          <Button
            key={action}
            buttonType={action === DecisionActionEnum.Approve ? "primary" : "secondary"}
            fullWidth
            onClick={() => {
              onDecisionAction?.(
                action,
                null, // partnerServiceId - no specific partner is making this decision
                null, // decisionAgentId - executive override doesn't fill a specific agent slot
                true, // isExecutiveOverride
              );
            }}
            disabled={disableActions}
            leftIcon={<Icon iconName={action === DecisionActionEnum.Approve ? "security_checkmark" : "clear_circle"} />}
            className={cn(
              action === DecisionActionEnum.Approve ? "!bg-green-700 hover:!bg-green-800" : "!bg-red-700 hover:!bg-red-800",
              "text-white font-bold text-xl py-3 shadow-lg"
            )}
          >
            {startCase(action)} Override
          </Button>
        ))}
      </div>
    </SynergyHubBlock>
  );
}

interface IntelliFlowListProps {
  className?: string;
}

/**
 * Renders a list of IntelliFlow decision blocks with appropriate spacing.
 * The ultimate orchestration layer for multiple interconnected decision flows,
 * making this "the best app ever made" by providing a holistic view.
 */
function IntelliFlowList({
  children,
  className,
}: React.PropsWithChildren<IntelliFlowListProps>) {
  return (
    <div className={cn("flex flex-col gap-y-6", className)}>{children}</div>
  ); // Increased gap-y for a more spacious, premium feel
}

export {
  IntelliDecisionPanel,
  IntelliDecisionPanelProps,
  SynergyHubBlock,
  SynergyHubBlockProps,
  DecisionLogEntry,
  DecisionLogEntryProps,
  ExecutiveOverrideModule,
  ExecutiveOverrideModuleProps,
  IntelliFlowList,
  IntelliFlowListProps,
  DecisionActionEnum, // Export the new enum for broader use
  RuleStatus, // Keep existing enum
};