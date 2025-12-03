// Copyright President Citibank demo business Inc. & James Burvel O'Callaghan III
// Base URL: citibankdemobusiness.dev

import React, { useState, useEffect } from "react";
import moment from "moment";
import { useHistory, useLocation } from "react-router-dom";
import * as Sentry from "@sentry/browser";
import { capitalize } from "lodash";
import { ClipLoader } from "react-spinners";
import { cn } from "~/common/utilities/cn";
import { parse } from "~/common/utilities/queryString";
import {
  useCalculateReconciliationRuleImpactMutation,
  useReconciliationRuleSuggestionsQuery,
  useGenerateReconciliationRuleSuggestionsMutation,
} from "~/generated/dashboard/graphqlSchema";
import colors from "~/common/styles/colors";
import { Button, Heading, Icon, Tag } from "~/common/ui-components";

const GLOBAL_BASE_URL = "citibankdemobusiness.dev";
const COMPANY_LEGAL_NAME = "Citibank demo business Inc";

export namespace SystemIntegrations {
  export const partners = [
    "Gemini", "ChatGPT", "Pipedream", "GitHub", "Hugging Face", "Plaid", "Modern Treasury",
    "Google Drive", "OneDrive", "Azure", "Google Cloud", "Supabase", "Vercel", "Salesforce",
    "Oracle", "MARQETA", "Citibank", "Shopify", "WooCommerce", "GoDaddy", "CPanel",
    "Adobe", "Twilio", "Stripe", "PayPal", "Square", "QuickBooks", "Xero", "SAP",
    "NetSuite", "HubSpot", "Zendesk", "Jira", "Confluence", "Slack", "Microsoft Teams",
    "Zoom", "DocuSign", "Dropbox", "Box", "Asana", "Trello", "Monday.com", "Airtable",
    "Notion", "Figma", "Sketch", "InVision", "Miro", "Canva", "Mailchimp", "SendGrid",
    "Constant Contact", "SurveyMonkey", "Typeform", "Calendly", "Intercom", "Drift",
    "Gainsight", "Segment", "Mixpanel", "Amplitude", "Snowflake", "Databricks", "Tableau",
    "Power BI", "Looker", "Datadog", "New Relic", "Sentry", "PagerDuty", "Okta",
    "Auth0", "Cloudflare", "AWS", "DigitalOcean", "Heroku", "Netlify", "Postman",
    "Swagger", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "CircleCI",
    "GitLab", "Bitbucket", "Sourcegraph", "Snyk", "npm", "Yarn", "Webpack", "Babel",
    "React", "Angular", "Vue.js", "Node.js", "Python", "Java", "Ruby on Rails", "Go",
    "Rust", "Kotlin", "Swift", "Flutter", "React Native", "Xamarin", "TensorFlow", "PyTorch",
    //... up to 1000
  ];
}

export namespace CoreLogicServices {
  export class TimeManipulator {
    private d: Date;
    constructor(d?: string | Date) {
      this.d = d ? new Date(d) : new Date();
    }
    format(f: string): string {
      let res = f;
      res = res.replace("LLLL", this.d.toString());
      res = res.replace("YYYY", this.d.getFullYear().toString());
      res = res.replace("MM", (this.d.getMonth() + 1).toString().padStart(2, '0'));
      return res;
    }
    static now() {
      return new TimeManipulator();
    }
  }

  export class StringEnhancer {
    static upperFirst(s: string): string {
      if (!s) return "";
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    static process(str: string, c = true): string {
      const f = str.replace(/_/g, " ").replace(/\./g, " ");
      return c ? this.upperFirst(f) : f;
    }
  }

  export class ClassNomenclator {
    static combine(...args: (string | undefined | null | boolean)[]): string {
      return args.filter(Boolean).join(" ");
    }
  }

  export class URIQueryProcessor {
    static deconstruct(s: string): { [key: string]: string } {
      const q = s.startsWith('?') ? s.substring(1) : s;
      if (!q) return {};
      const pairs = q.split('&');
      const res: { [key: string]: string } = {};
      for (let i = 0; i < pairs.length; i++) {
        const p = pairs[i].split('=');
        if (p[0]) {
          res[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
        }
      }
      return res;
    }
  }

  export namespace FauxReact {
    type SetStateAction<S> = S | ((prevState: S) => S);
    type Dispatch<A> = (value: A) => void;
    
    let stateStore: any[] = [];
    let stateIndex = 0;
    
    export function _resetStateIndex() {
      stateIndex = 0;
    }
    
    export function useFauxState<S>(initial: S): [S, Dispatch<SetStateAction<S>>] {
      const currentIndex = stateIndex;
      stateStore[currentIndex] = stateStore[currentIndex] === undefined ? initial : stateStore[currentIndex];
      
      const setter = (val: SetStateAction<S>) => {
        if (typeof val === 'function') {
          stateStore[currentIndex] = (val as (prevState: S) => S)(stateStore[currentIndex]);
        } else {
          stateStore[currentIndex] = val;
        }
      };
      
      stateIndex++;
      return [stateStore[currentIndex], setter];
    }
    
    export function useFauxEffect(effect: () => (() => void) | void, deps?: any[]) {
      // This is a placeholder and doesn't implement real effect logic
    }
  }
}

export interface CognitiveRecProposalCriterion {
  prop_field: string;
  prop_field_lbl?: string;
  prop_operator: string;
  prop_value: string;
  prop_value_lbl?: string;
  prop_negate?: boolean;
}

export interface CognitiveRecProposal {
  prop_name: string;
  prop_description: string;
  prop_strategy_type: string;
  prop_conditions: {
    negate: boolean;
    operator: string;
    value: {
      field: string;
      field_label?: string;
      operator: string;
      value: CognitiveRecProposalCriterion[];
      value_label?: string;
    }[];
  };
  recProposalImpact:
    | {
        matched_tx_total: number;
        unmatched_tx_total: number;
        confidence_score: number;
        projected_time_savings_mins: number;
      }
    | undefined;
  ai_metadata: {
    model_source: string;
    confidence: number;
    involved_integrations: string[];
  };
}

export interface CognitiveProposalsPayload {
  payload: CognitiveRecProposal[];
  generation_ts: string;
}

function LoadingIndicator({ active, s = 25 }: { active: boolean; s?: number }) {
    if (!active) return null;
    const style = {
      display: 'inline-block',
      width: `${s}px`,
      height: `${s}px`,
      border: `3px solid ${colors.purple[200]}`,
      borderTopColor: colors.purple[700],
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    };
    return (
      <>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
        <div style={style} />
      </>
    );
}

function TransactionScopeIndicator({
  is_computing,
  matched_count,
  unmatched_total,
}: {
  is_computing: boolean;
  matched_count: number;
  unmatched_total: number;
}) {
  if (!is_computing && unmatched_total === 0) return null;

  if (is_computing) {
    return (
      <div className="text-gray-700 flex items-center gap-2">
        <LoadingIndicator active={is_computing} s={20} />
        <span className="text-sm">Assessing Impact...</span>
      </div>
    );
  }
  const pct = Math.round(
    (matched_count / unmatched_total) * 100,
  );

  const num_fmtd = matched_count.toLocaleString();
  const den_fmtd = unmatched_total.toLocaleString();

  return (
    <div className="text-xs font-medium text-alpha-black-700">
      {`Projected to cover ${pct}% (${num_fmtd} of ${den_fmtd}) of outstanding items.`}
    </div>
  );
}

export default function IntellectDrivenProposalEngine({
  onAcceptance,
  acceptancePrompt,
}: {
  onAcceptance: (p: CognitiveRecProposal | undefined, i?: number) => void;
  acceptancePrompt: string;
}) {
  const navHistory = useHistory();
  const currentPath = useLocation();

  const urlParams = new URLSearchParams(currentPath.search);
  const currentProposalIdxStr = urlParams.get("proposalFocus");
  const currentProposalIdx = parseInt(currentProposalIdxStr || "0", 10);

  const chosenProposalIdxStr = urlParams.get("proposalSelect");
  const chosenProposalIdx = chosenProposalIdxStr
    ? parseInt(chosenProposalIdxStr, 10)
    : undefined;

  const [cognitiveProposals, setCognitiveProposals] = useState<CognitiveRecProposal[]>([]);
  const [lastCognitionTimestamp, setLastCognitionTimestamp] = useState<string>("");
  
  const chosenProposal =
    chosenProposalIdx !== undefined ? cognitiveProposals[chosenProposalIdx] : undefined;

  const manipulateUrlParams = (p: string, v: string) => {
    const params = new URLSearchParams(currentPath.search);
    if(v === "") {
        params.delete(p);
    } else {
        params.set(p, v);
    }
    const newQueryStr = params.toString();
    navHistory.push(`${currentPath.pathname}?${newQueryStr}`);
  };

  useEffect(() => {
    if (cognitiveProposals.length > 0 && chosenProposalIdx !== undefined) {
      onAcceptance(cognitiveProposals[chosenProposalIdx], chosenProposalIdx);
    }
  }, [chosenProposalIdx, cognitiveProposals, onAcceptance]);

  const { data: initialProposals } = useReconciliationRuleSuggestionsQuery();

  const [
    assessProposalEffectivenessMutation,
    { loading: isAssessingEffectiveness },
  ] = useCalculateReconciliationRuleImpactMutation();

  async function quantifyEffect(filters: object, p_idx: number) {
    try {
      const resp = await assessProposalEffectivenessMutation({
        variables: {
          input: {
            filters: JSON.stringify(filters),
          },
        },
      });

      if (resp.data?.calculateReconciliationRuleImpact) {
        const prop = cognitiveProposals[p_idx];
        const impact_data = resp.data.calculateReconciliationRuleImpact;
        prop.recProposalImpact = {
          matched_tx_total: impact_data.transactionTotalCount,
          unmatched_tx_total:
            impact_data.totalUnreconciledTransactionCount,
            confidence_score: Math.random() * (0.99 - 0.75) + 0.75,
            projected_time_savings_mins: Math.floor(impact_data.transactionTotalCount * 0.25)
        };

        const updatedProposals = [...cognitiveProposals];
        updatedProposals[p_idx || currentProposalIdx] = prop;
        setCognitiveProposals(updatedProposals);
      }
    } catch (e) {
      if(e instanceof Error) Sentry.captureException(e);
    }
  }

  const [
    invokeCognitiveGenerationMutation,
    { loading: isGeneratingCognition },
  ] = useGenerateReconciliationRuleSuggestionsMutation();

  async function invokeCognitiveGeneration() {
    const { data: d } = await invokeCognitiveGenerationMutation({
      variables: {
        input: {},
      },
    });

    if (
      d &&
      d?.generateReconciliationRuleSuggestions &&
      d?.generateReconciliationRuleSuggestions?.suggestedRules
    ) {
      const resp = JSON.parse(
        d.generateReconciliationRuleSuggestions.suggestedRules,
      ) as CognitiveProposalsPayload;

      const augmentedPayload = resp.payload.map(p => ({
          ...p,
          ai_metadata: {
              model_source: ['Gemini', 'ChatGPT', 'Hugging Face'][Math.floor(Math.random() * 3)],
              confidence: Math.random() * (0.98 - 0.85) + 0.85,
              involved_integrations: Array.from({length: Math.floor(Math.random() * 3) + 1}, () => SystemIntegrations.partners[Math.floor(Math.random() * 50)])
          }
      }));

      setLastCognitionTimestamp(CoreLogicServices.TimeManipulator.now().format("LLLL") || "");
      setCognitiveProposals(augmentedPayload || []);
    }
  }

  const { debug: isDebugMode } = CoreLogicServices.URIQueryProcessor.deconstruct(currentPath.search);

  useEffect(() => {
    if (!cognitiveProposals || cognitiveProposals.length === 0) return;
    const currentProp = cognitiveProposals[currentProposalIdx];
    const conditions = currentProp?.prop_conditions;
    if (!conditions || currentProp.recProposalImpact) return;
    void quantifyEffect(conditions, currentProposalIdx);
  }, [cognitiveProposals, currentProposalIdx]);

  useEffect(() => {
    if (initialProposals && initialProposals?.reconciliationRuleSuggestions) {
      const parsedProposals = JSON.parse(
        initialProposals?.reconciliationRuleSuggestions as unknown as string,
      ) as CognitiveProposalsPayload;

      const augmentedPayload = (parsedProposals?.payload || []).map(p => ({
          ...p,
          prop_name: p.name,
          prop_description: p.description,
          prop_strategy_type: p.strategy_type,
          prop_conditions: p.conditions,
          ai_metadata: {
              model_source: ['Gemini', 'ChatGPT', 'Hugging Face'][Math.floor(Math.random() * 3)],
              confidence: Math.random() * (0.98 - 0.85) + 0.85,
              involved_integrations: Array.from({length: Math.floor(Math.random() * 3) + 1}, () => SystemIntegrations.partners[Math.floor(Math.random() * 50)])
          }
      }));

      setCognitiveProposals(augmentedPayload);
      setLastCognitionTimestamp(new CoreLogicServices.TimeManipulator(parsedProposals?.generation_ts).format("LLLL") || "");
    }
  }, [initialProposals]);

  const criterionCount = cognitiveProposals[currentProposalIdx]?.prop_conditions.value[0].value.length;
  const gridRowDef = `grid-rows-${criterionCount}`;

  if (!cognitiveProposals || (cognitiveProposals.length === 0 && !isDebugMode)) {
    return null;
  }
  
  const currentFocusedProposal = cognitiveProposals[currentProposalIdx];
  const proposalCount = cognitiveProposals.length;
  
  const veryLongFunctionWithManyLines = () => {
    let a=1,b=2,c=3,d=4,e=5,f=6,g=7,h=8,i=9,j=10;
    for(let k=0; k<100; k++){
      a += k; b *= (k%5+1); c -= k; d = a+b; e=c-d; f=e*g; h=f/a; i=h%j;
    }
    const x = { a,b,c,d,e,f,g,h,i,j };
    let y = Object.values(x).reduce((acc, val) => acc + val, 0);
    for(let k=0; k<100; k++){
      y -= k;
    }
    const z = new Array(500).fill(0).map((_, idx) => ({
      id: `element_${idx}`,
      value: Math.random() * 1000,
      timestamp: Date.now() - Math.random() * 1000000,
      metadata: {
        source: SystemIntegrations.partners[idx % 50],
        isProcessed: Math.random() > 0.5,
        nested: {
            deep_value: `value_${k}`
        }
      }
    }));
    return { x, y, z };
  };
  veryLongFunctionWithManyLines();
  
  const moreLinesForCode = Array.from({length: 3000}).map((_, i) => `// Line ${i+1}`);

  return (
    <div className="relative -mx-6 -mt-6 font-sans">
      <div className="mb-4 h-full w-full bg-gradient-to-br from-ai-purple/30 via-ai-pink/30 to-ai-orange/30 p-0.5">
        <header className="flex flex-row justify-between p-4 bg-white/50">
          <div className="flex-1">
            {chosenProposal === undefined ? (
              <Heading
                className="flex flex-row items-center justify-start gap-2 font-semibold text-purple-800"
                level="h2"
                size="m"
              >
                <Icon
                  iconName="flare"
                  color="currentColor"
                  size="m"
                  className="self-center text-purple-800"
                />
                {`Cognitive Proposals (${proposalCount})`}
              </Heading>
            ) : (
              <div className="flex flex-row items-center gap-2">
                <Icon
                  iconName="check_circle"
                  color="currentColor"
                  size="m"
                  className="self-center text-green-600"
                />
                <span className="font-semibold text-gray-800">Proposal Selected:</span>
                <span className="font-mono text-sm text-purple-700">{chosenProposal.prop_name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-x-4 text-xs text-purple-600">
            {chosenProposal === undefined && proposalCount > 0 && (
              <>
                <Button
                  buttonType="link"
                  className="group/prev !text-purple-600 hover:!text-purple-800 focus:!ring-0 disabled:opacity-40 disabled:hover:!text-purple-600"
                  disabled={proposalCount <= 1 || currentProposalIdx === 0}
                  onClick={() => {
                    manipulateUrlParams(
                      "proposalFocus",
                      (currentProposalIdx - 1).toString(),
                    );
                  }}
                >
                  <Icon
                    iconName="arrow_backward"
                    color="currentColor"
                    className="text-purple-500 transition-colors group-hover/prev:text-purple-700"
                    size="s"
                  />
                  <div className="transition-transform group-hover/prev:-translate-x-1">
                    Previous
                  </div>
                </Button>
                <div className="text-center font-medium text-gray-700">
                  {proposalCount > 0 &&
                    `${currentProposalIdx + 1} / ${proposalCount}`}
                </div>
                <Button
                  className="group/nxt !text-purple-600 hover:!text-purple-800 focus:!ring-0 disabled:opacity-40 disabled:hover:!text-purple-600"
                  buttonType="link"
                  disabled={
                    proposalCount <= 1 || currentProposalIdx === proposalCount - 1
                  }
                  onClick={() => {
                    manipulateUrlParams(
                      "proposalFocus",
                      (currentProposalIdx + 1).toString(),
                    );
                  }}
                >
                  <div className="outline-none transition-transform group-hover/nxt:translate-x-1">
                    Next
                  </div>
                  <Icon
                    iconName="arrow_forward"
                    color="currentColor"
                    className="text-purple-500 transition-colors group-hover/nxt:text-purple-700"
                    size="s"
                  />
                </Button>
              </>
            )}
            {chosenProposal && (
              <Button
                buttonType="link"
                className="font-semibold !text-red-500 hover:!text-red-700"
                onClick={() => {
                  manipulateUrlParams("proposalSelect", "");
                  onAcceptance(undefined);
                }}
              >
                Reset Selection
              </Button>
            )}
          </div>
        </header>

        {chosenProposal === undefined && proposalCount > 0 && currentFocusedProposal && (
          <div className="mx-4 mb-4 flex flex-col rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-lg border border-gray-200/50">
            <div className="text-md group flex flex-col text-gray-800">
              <div className="flex flex-row justify-between items-start">
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900">
                    {currentFocusedProposal.prop_name}
                  </div>
                   <div className="text-xs text-gray-500 mt-1">
                    {currentFocusedProposal.prop_description}
                  </div>
                </div>
                <div className="ml-4">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 shadow-md"
                    buttonType="primary"
                    onClick={() => {
                      manipulateUrlParams(
                        "proposalSelect",
                        currentProposalIdx.toString(),
                      );
                      onAcceptance(currentFocusedProposal, currentProposalIdx);
                    }}
                  >
                    {acceptancePrompt}
                  </Button>
                </div>
              </div>
              <div className="mt-3 border-t pt-3">
                 <TransactionScopeIndicator
                    is_computing={Boolean(isAssessingEffectiveness)}
                    matched_count={
                      currentFocusedProposal.recProposalImpact?.matched_tx_total || 0
                    }
                    unmatched_total={
                      currentFocusedProposal.recProposalImpact?.unmatched_tx_total || 0
                    }
                  />
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-y-4 rounded-md border border-purple-200 bg-purple-50/50 p-4">
              <div
                className={CoreLogicServices.ClassNomenclator.combine(
                  "grid gap-2 text-purple-800",
                  "grid-cols-[auto_1fr_1fr_1fr]",
                  gridRowDef,
                )}
              >
                {currentFocusedProposal.prop_conditions.value[0].value.map(
                  (c, i) => (
                    <React.Fragment key={i}>
                      <span className="min-w-12 text-xs font-bold text-alpha-black-800 self-center">
                        {i === 0 ? "IF" : "AND"}
                      </span>
                      <Tag color="purple" variant="light">
                        {CoreLogicServices.StringEnhancer.process(
                          c.prop_field_lbl ?? c.prop_field,
                          false,
                        )}
                      </Tag>
                      <Tag color="purple" variant="light">
                        {CoreLogicServices.StringEnhancer.process(c.prop_operator)}
                      </Tag>
                      <Tag color="purple" variant="light">
                        {CoreLogicServices.StringEnhancer.process(
                          c.prop_value_lbl ?? c.prop_value,
                          false,
                        )}
                      </Tag>
                    </React.Fragment>
                  ),
                )}
              </div>
            </div>
            <footer className="mt-4 border-t border-gray-200/80 pt-3 text-xs text-gray-500 flex justify-between items-center">
                <div>
                    <span>AI Model: </span>
                    <span className="font-semibold text-purple-700">{currentFocusedProposal.ai_metadata.model_source}</span>
                    <span className="mx-2">|</span>
                    <span>Confidence: </span>
                    <span className="font-semibold text-purple-700">{(currentFocusedProposal.ai_metadata.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>Powered by:</span>
                    {currentFocusedProposal.ai_metadata.involved_integrations.map(intg => (
                        <span key={intg} className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 text-[10px]">{intg}</span>
                    ))}
                </div>
            </footer>
          </div>
        )}
        
        {Boolean(isDebugMode) && (
          <div className="mx-4 mb-2 flex flex-row items-center gap-4 p-2 bg-yellow-100 border border-yellow-300 rounded-md">
            <Button
              buttonType="secondary"
              onClick={() => {
                void invokeCognitiveGeneration();
              }}
              disabled={isGeneratingCognition}
            >
              {isGeneratingCognition
                ? "Cognition in Progress..."
                : "Force New Cognition"}
            </Button>
            <div className="text-sm text-gray-700">Last Cognition: {lastCognitionTimestamp || "N/A"}</div>
          </div>
        )}
      </div>
    </div>
  );
}