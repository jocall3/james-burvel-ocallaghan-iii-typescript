// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback } from "react";
import {
  MatchResult,
  useMatchResultQuery,
} from "../../generated/dashboard/graphqlSchema";
import {
  Label,
  Icon,
  Modal,
  ModalContainer,
  ModalFooter,
  Button,
  Stack,
  Chip,
  Clickable,
  Spinner,
  TextArea,
  Tabs, Tab, TabPanels, TabPanel,
} from "../../common/ui-components";
import StringReconciliationMatchResult from "./StringReconciliationMatchResult";
import DateOffsetReconciliationMatchResult from "./DateOffsetReconciliationMatchResult";
import PaymentReferenceReconciliationMatchResult from "./PaymentReferenceReconciliationMatchResult";
import FromTransactionReconciliationMatchResult from "./FromTransactionReconciliationMatchResult";
import GroupByReconciliationMatchResult from "./GroupByReconciliationMatchResult";
import BooleanReconciliationMatchResult from "./BooleanReconciliationMatchResult";
import { cn } from "~/common/utilities/cn";

// --- MOCK EXTERNAL INTEGRATIONS ---
// In a real commercial application, these would be actual API clients or context providers
// living in separate modules. For this exercise, they are embedded to demonstrate full implementation.

/**
 * Simulates a call to a Gemini-like AI model to get reconciliation suggestions.
 * It analyzes the current match context and provides an explanation and potential fixes.
 */
const fetchGeminiSuggestions = async (transactionContext: any) => {
    console.log("Gemini AI analyzing transaction context:", transactionContext);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    if (!transactionContext.matchResult.match) { // Only suggest if there's no match
        // Smart AI logic to suggest different matcher types based on patterns
        if (transactionContext.currentSelectField === 'equals' && transactionContext.actualValue && transactionContext.expectedValue) {
            // If it was an 'equals' match that failed, suggest regex or date_offset if values look like dates
            if (/\d{4}-\d{2}-\d{2}/.test(transactionContext.actualValue) && /\d{4}-\d{2}-\d{2}/.test(transactionContext.expectedValue)) {
                return {
                    explanation: `Gemini detected that the 'Equals' rule failed, likely due to a minor date variation. It recommends using a 'Between' (Date Offset) rule to account for common business day discrepancies.`,
                    suggestedMatcherType: 'date_offset',
                    suggestedMatcherValue: '0..1', // Suggest 0 to 1 business day offset
                    suggestedParser: null,
                    suggestedTransactionField: null,
                };
            } else if (transactionContext.actualValue && transactionContext.expectedValue && transactionContext.actualValue.toLowerCase().includes(transactionContext.expectedValue.toLowerCase())) {
                // If expected is part of actual (case-insensitive), suggest regex
                const escapedExpected = transactionContext.expectedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return {
                    explanation: `The 'Equals' rule failed, but Gemini observed the expected value is a substring of the actual transaction data. A 'Matches Regex' rule can effectively capture this pattern, ensuring robust reconciliation.`,
                    suggestedMatcherType: 'matches_regex',
                    suggestedMatcherValue: `(?i).*${escapedExpected}.*`, // Case-insensitive regex
                    suggestedParser: null,
                    suggestedTransactionField: null,
                };
            } else if (transactionContext.actualValue && !transactionContext.expectedValue) {
                // If no expected value but there's an actual, maybe suggest 'Any'
                 return {
                    explanation: `The system expected a value but found none. Gemini suggests using an 'Is Anything' rule to ensure transactions are always captured, then follow up with a manual review or a secondary rule.`,
                    suggestedMatcherType: 'any',
                    suggestedMatcherValue: null,
                    suggestedParser: null,
                    suggestedTransactionField: null,
                };
            }
        }
        // Generic fallback suggestion if specific conditions aren't met
        const escapedActual = transactionContext.actualValue ? transactionContext.actualValue.substring(0, Math.min(transactionContext.actualValue.length, 10)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
        return {
            explanation: `Gemini has analyzed the unmatched transaction and suggests exploring a different matcher type, such as 'Matches Regex' for flexible pattern matching, or reviewing external context for deeper insights. The current 'Expected' value is "${transactionContext.expectedValue}" while 'Actual' is "${transactionContext.actualValue}".`,
            suggestedMatcherType: 'matches_regex', // Default advanced suggestion
            suggestedMatcherValue: escapedActual ? `.*${escapedActual}.*` : '.*',
            suggestedParser: null,
            suggestedTransactionField: null,
        };
    }

    // If already matched, AI can provide affirmation or suggest optimization
    return {
        explanation: `Excellent! This transaction is already perfectly reconciled with the current rule. Gemini confirms its accuracy and efficiency.`,
        suggestedMatcherType: null,
        suggestedMatcherValue: null,
        suggestedParser: null,
        suggestedTransactionField: null,
    };
};

/**
 * Simulates fetching data from an external CRM system (e.g., Salesforce, HubSpot).
 */
export const fetchExternalCRMData = async (transactionId: string) => {
    console.log("Fetching CRM data for transaction:", transactionId);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    // Mock data based on transaction ID patterns
    if (transactionId.endsWith('001')) {
        return `Customer: Stellar Innovations (ID: C78901)\nContact: Anya Sharma (anya.s@stellar.com)\nRecent Activities: Last purchase 5 days ago, high engagement score, upcoming renewal.`;
    } else if (transactionId.endsWith('002')) {
        return `Customer: Quantum Dynamics (ID: Q11223)\nContact: Mark Chen (mark.c@quantum.net)\nRecent Activities: New customer onboarding in progress, account manager assigned: Emily R.`;
    } else if (transactionId.endsWith('003')) {
        return `Customer: Global Logistics Inc. (ID: G54321)\nContact: Sarah Lee (sarah.l@globallogistics.com)\nRecent Activities: Follow-up call scheduled for next week regarding service expansion.`;
    }
    return `No detailed CRM record found for this transaction ID. This could indicate a new customer or an internal ledger entry.`;
};

/**
 * Simulates fetching data from an external ERP system (e.g., SAP, Oracle, NetSuite).
 */
export const fetchExternalERPData = async (transactionId: string) => {
    console.log("Fetching ERP data for transaction:", transactionId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    // Mock data based on transaction ID patterns
    if (transactionId.endsWith('001')) {
        return `Invoice ID: INV-2024-X001 (Status: Pending Approval)\nOrder Value: $2,500.00\nPayment Terms: Net 45\nAssociated PO: PO-98765\nBudget Code: BGD-SALES`;
    } else if (transactionId.endsWith('002')) {
        return `Invoice ID: INV-2024-Y002 (Status: Paid - partial)\nOrder Value: $1,500.00 (Outstanding: $500)\nPayment Terms: Net 30\nProduct SKUs: SRV-CLOUD, LIC-BASIC`;
    } else if (transactionId.endsWith('003')) {
        return `Invoice ID: INV-2024-Z003 (Status: Completed & Paid)\nOrder Value: $7,200.00\nPayment Terms: Net 60\nProject ID: PRJ-ALPHA`;
    }
    return `No associated ERP invoice or order found for this transaction ID.`;
};

interface DatabaseReconciliationMatchResultProps {
  matchResult: MatchResult;
  strategyName: string;
  matcherType: string;
  transactionId: string;
  callback: (
    id: string,
    matcher: string,
    parser: string,
    transactionField: string,
    matchResultType: string,
    modified: boolean,
    tentative: boolean,
  ) => void;
  modalOpen?: boolean;
  removable?: boolean;
}

function DatabaseReconciliationMatchResult({
  matchResult,
  strategyName,
  matcherType,
  transactionId,
  callback,
  modalOpen = false,
  removable = true,
}: DatabaseReconciliationMatchResultProps) {
  const matcherId = strategyName + matcherType + matchResult.field;
  const [initialMatcherValue] = useState(matchResult.matcher);
  const [currentMatcherValue, setCurrentMatcherValue] = useState<string | null>(
    initialMatcherValue,
  );
  const [tempMatcherValue, setTempMatcherValue] = useState(
    initialMatcherValue || null,
  );
  const [updatedMatcherValue, setUpdatedMatcherValue] = useState(
    initialMatcherValue || null,
  );
  const [offsetStart, setOffsetStart] = useState(matchResult.startOffset);
  const [offsetEnd, setOffsetEnd] = useState(matchResult.endOffset);
  const [currentMatched, setCurrentMatched] = useState(matchResult.match);
  const [expectedValue, setExpectedValue] = useState(matchResult.expected);
  const [actualValue, setActualValue] = useState(matchResult.actual);
  const selectFieldLabelMap = {
    equals: "Equals",
    matches_regex: "Matches",
    date_offset: "Between",
    payment_reference: "Payment Reference",
    short_id: "Short ID",
    from_transaction: "From Transaction",
    is_true: "Is True",
    is_false: "Is False",
    is_null: "Is Null",
    any: "Any",
    group_by: "Group By",
  };
  const selectFieldReverseLabelMap: { [key: string]: string } = { // Explicitly type for safety
    Equals: "equals",
    Matches: "matches_regex",
    Between: "date_offset",
    "Payment Reference": "payment_reference",
    "Short ID": "short_id",
    "From Transaction": "from_transaction",
    "Is True": "is_true",
    "Is False": "is_false",
    "Is Null": "is_null",
    Any: "any",
    "Group By": "group_by",
  };
  const [isModalOpen, setIsModalOpen] = useState(modalOpen);
  const [wasTentative] = useState(modalOpen);
  const [isTentative, setIsTentative] = useState(modalOpen);
  const newMatcher = matchResult.suggestedMatcher === "-new matcher-";
  const [hoverState, setHoverState] = useState(false);
  const [isRemovable] = useState(removable);
  const [openRemoveMatcherModal, setOpenRemoveMatcherModal] = useState(false);
  const [currentSelectField, setCurrentSelectField] = useState(
    matchResult.matchResultType
      ? (selectFieldLabelMap[matchResult.matchResultType] as string)
      : null,
  );
  const [tempMatchResultType, setTempMatchResultType] = useState(
    matchResult.matchResultType,
  );
  const [updatedMatchResultType, setUpdatedMatchResultType] = useState(
    matchResult.matchResultType,
  );
  const [tempSelectField, setTempSelectField] = useState(currentSelectField);
  const [parserValue, setParserValue] = useState(matchResult.parser);
  const [updatedParserValue, setUpdatedParserValue] = useState(
    matchResult.parser,
  );
  const [showParserValue, setShowParserValue] = useState(!!matchResult.parser);
  const [tempPaymentReferenceTypeValue, setTempPaymentReferenceTypeValue] =
    useState<string | undefined>(matchResult.matcher);
  const [transactionFieldValue, setTransactionFieldValue] = useState(
    matchResult.transactionField,
  );
  const [updatedTransactionFieldValue, setUpdatedTransactionFieldValue] =
    useState(matchResult.transactionField);
  const [tempTransactionField, setTempTransactionField] = useState(
    matchResult.transactionField,
  );
  const [startDateValue, setStartDateValue] = useState(matchResult.startDate);
  const [updatedStartDateValue, setUpdatedStartDateValue] = useState(
    matchResult.startDate,
  );
  const [endDateValue, setEndDateValue] = useState(matchResult.endDate);
  const [updatedEndDateValue, setUpdatedEndDateValue] = useState(
    matchResult.endDate,
  );
  const selectFieldOptions = [
    {
      label: "Equals",
      value: "Equals",
    },
    {
      label: "Matches Regex",
      value: "Matches",
    },
    {
      label: "Within Date Range",
      value: "Between",
    },
    {
      label: "Payment Reference",
      value: "Payment Reference",
    },
    {
      label: "Short ID",
      value: "Short ID",
    },
    {
      label: "From Transaction",
      value: "From Transaction",
    },
    {
      label: "Is True",
      value: "Is True",
    },
    {
      label: "Is False",
      value: "Is False",
    },
    {
      label: "Is Null",
      value: "Is Null",
    },
    {
      label: "Is Anything",
      value: "Any",
    },
  ];

  // --- NEW STATE FOR GEMINI AI & EXTERNAL APP INTEGRATION ---
  const [aiSuggestions, setAiSuggestions] = useState<{
    explanation: string;
    suggestedMatcherType?: string;
    suggestedMatcherValue?: string;
    suggestedParser?: string;
    suggestedTransactionField?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [externalCRMData, setExternalCRMData] = useState<string | null>(null);
  const [externalERPData, setExternalERPData] = useState<string | null>(null);
  const [externalDataLoading, setExternalDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for Matcher Details, 1 for AI Insights, 2 for External Context


  const { data: matchResultData } = useMatchResultQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      transactionId,
      matcherInput: {
        id: matcherId,
        strategyName,
        field: matchResult.field,
        matcherType,
        matcher: tempMatcherValue,
        transactionField: transactionFieldValue,
        parser: parserValue,
        matchResultType: tempMatchResultType,
        startDate: startDateValue,
        endDate: endDateValue,
      },
    },
  });

  const matchResultCallback = (
    matchResultType: string | null | undefined,
    matcher: string | null | undefined,
    parser: string | null | undefined,
    showParser: boolean | null | undefined,
    transactionField: string | null | undefined,
    startDate: string | null | undefined,
    endDate: string | null | undefined,
  ) => {
    setExpectedValue(matchResultData?.matchResult?.expected || "");
    setActualValue(matchResultData?.matchResult?.actual || "");

    if (matchResultType) {
      setTempMatchResultType(
        selectFieldReverseLabelMap[matchResultType] as string,
      );
      setTempSelectField(matchResultType);
    }
    setTempMatcherValue(matcher || null);
    setParserValue(parser);
    setShowParserValue(showParser || false);
    setTransactionFieldValue(transactionField);
    setStartDateValue(startDate);
    setEndDateValue(endDate);
  };

  const matchResultHasChanged = () => {
    if (!matchResultData) {
      return false;
    }

    return (
      matchResult.matchResultType !==
        matchResultData.matchResult.matchResultType ||
      matchResult.matcher !== matchResultData.matchResult.matcher ||
      (matchResult.parser || null) !== matchResultData.matchResult.parser ||
      (matchResult.transactionField || null) !==
        matchResultData.matchResult.transactionField ||
      matchResult.startDate !== matchResultData.matchResult.startDate ||
      matchResult.endDate !== matchResultData.matchResult.endDate
    );
  };

  const matchResultIsEdited = () => {
    if (!matchResultData) {
      return false;
    }

    return (
      selectFieldReverseLabelMap[currentSelectField || ""] !==
        tempMatchResultType ||
      currentMatcherValue !== tempMatcherValue ||
      matchResultData.matchResult.parser !== parserValue ||
      matchResultData.matchResult.transactionField !== transactionFieldValue ||
      matchResultData.matchResult.startDate !== startDateValue ||
      matchResultData.matchResult.endDate !== endDateValue
    );
  };

  const matchResultIsUpdated = () => {
    if (!matchResultData) {
      return false;
    }

    return (
      matchResult.matchResultType !== updatedMatchResultType ||
      (matchResult.matcher !== updatedMatcherValue &&
        matchResult.matcher !== "" &&
        updatedMatcherValue !== null) ||
      matchResult.parser !== updatedParserValue ||
      matchResult.transactionField !== updatedTransactionFieldValue ||
      matchResult.startDate !== updatedStartDateValue ||
      matchResult.endDate !== updatedEndDateValue
    );
  };

  const updateDisabled = () => {
    if (matcherType === "payment_reference") {
      return !tempMatcherValue || !transactionFieldValue;
    }
    if (matcherType === "group_by") {
      const matchers =
        tempMatcherValue &&
        tempMatcherValue
          .slice(1, -1)
          .split(", ")
          .map((p) => p.slice(1));

      return Boolean(matchers && matchers.length === 1 && matchers[0] === "");
    }

    // New condition: if AI is suggesting, allow update to apply suggestion
    if (aiSuggestions && (aiSuggestions.suggestedMatcherType || aiSuggestions.suggestedMatcherValue || aiSuggestions.suggestedParser || aiSuggestions.suggestedTransactionField)) {
        // If there's an AI suggestion, and it hasn't been applied yet, the button should be enabled to apply it
        const aiApplied = (tempMatchResultType === aiSuggestions.suggestedMatcherType || !aiSuggestions.suggestedMatcherType) &&
                         (tempMatcherValue === aiSuggestions.suggestedMatcherValue || !aiSuggestions.suggestedMatcherValue) &&
                         (parserValue === aiSuggestions.suggestedParser || !aiSuggestions.suggestedParser) &&
                         (transactionFieldValue === aiSuggestions.suggestedTransactionField || !aiSuggestions.suggestedTransactionField);
        return aiApplied && !matchResultIsEdited() && !matchResultHasChanged(); // Only disable if AI is applied AND no other edits
    }

    return false;
  };

  const groupByMatchers =
    currentSelectField === "Group By"
      ? currentMatcherValue
          ?.slice(1, -1)
          .split(", ")
          .map((p) => p.slice(1))
      : null;

  const matcherChips = (classNames: string, matched: boolean, hover: boolean) => {
    let contentClasses = "";

    if (matched) {
      if (hover) {
        contentClasses = "bg-green-600 text-white hover:cursor-pointer";
      } else {
        contentClasses = "bg-green-500 text-white";
      }
    } else if (hover) {
      contentClasses = "bg-red-600 text-white hover:cursor-pointer";
    } else {
      contentClasses = "bg-red-500 text-white";
    }

    return (
      <Stack className={cn("overflow-hidden", classNames)}>
        {currentSelectField === "Equals" || currentSelectField === "Matches" ? (
          <div className="flex gap-px">
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {matchResult.field}
            </Chip>
            <Chip contentClassName={contentClasses}>{currentSelectField}</Chip>
            <Chip
              className="whitespace-nowrap"
              contentClassName={`${contentClasses} rounded-r`}
            >
              {currentMatcherValue}
            </Chip>
          </div>
        ) : null}
        {currentSelectField === "Any" ? (
          <div className="flex gap-px">
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {matchResult.field}
            </Chip>
            <Chip contentClassName={`${contentClasses} rounded-r`}>
              Is Anything
            </Chip>
          </div>
        ) : null}
        {currentSelectField === "Between" && offsetStart === offsetEnd && (
          <div className={`flex gap-px `}>
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {matchResult.field}
            </Chip>
            <Chip contentClassName={contentClasses}>Is </Chip>
            <Chip contentClassName={contentClasses}>{offsetStart}</Chip>
            <Chip contentClassName={`${contentClasses} rounded-r`}>
              Business Days
            </Chip>
          </div>
        )}
        {currentSelectField === "Between" && offsetStart !== offsetEnd && (
          <div className={`flex gap-px `}>
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {matchResult.field}
            </Chip>
            <Chip contentClassName={contentClasses}>Is Between</Chip>
            <Chip contentClassName={contentClasses}>
              {offsetStart}..{offsetEnd}
            </Chip>
            <Chip contentClassName={`${contentClasses} rounded-r`}>
              Business Days
            </Chip>
          </div>
        )}
        {currentSelectField === "Is Null" ? (
          <div className="flex gap-px">
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {matchResult.field}
            </Chip>
            <Chip contentClassName={`${contentClasses} rounded-r`}>
              {currentSelectField}
            </Chip>
          </div>
        ) : null}
        {currentSelectField === "Payment Reference" ? (
          <div className="flex gap-px">
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {tempPaymentReferenceTypeValue}
            </Chip>
            <Chip contentClassName={contentClasses}>Parsed From</Chip>
            <Chip contentClassName={`${contentClasses} rounded-r`}>
              {tempTransactionField}
            </Chip>
          </div>
        ) : null}
        {currentSelectField === "Short ID" ||
        currentSelectField === "From Transaction" ? (
          <div className="flex gap-px">
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {matchResult.field}
            </Chip>
            <Chip contentClassName={contentClasses}>From Transaction</Chip>
            <Chip contentClassName={`${contentClasses} rounded-r`}>
              {currentMatcherValue}
            </Chip>
          </div>
        ) : null}
        {currentSelectField === "Is True" ||
        currentSelectField === "Is False" ? (
          <div className="flex gap-px">
            <Chip contentClassName={`${contentClasses} rounded-l`}>
              {matchResult.field}
            </Chip>
            <Chip contentClassName={`${contentClasses} rounded-r`}>
              {currentSelectField}
            </Chip>
          </div>
        ) : null}
        {currentSelectField === "Group By" ? (
          <div className="flex gap-px overflow-x-scroll">
            {groupByMatchers?.map((m, i) => (
              <Chip
                key={m + i}
                contentClassName={`${i === 0 ? "rounded-l" : ""} ${
                  i === (groupByMatchers?.length || 1) - 1 ? "rounded-r" : ""
                } ${contentClasses}`}
              >
                {m}
              </Chip>
            ))}
          </div>
        ) : null}
      </Stack>
    );
  };

  // --- NEW AI & EXTERNAL APP INTEGRATION LOGIC ---

  const getAISuggestions = useCallback(async () => {
    setAiLoading(true);
    const data = await fetchGeminiSuggestions({
      transactionId,
      matchResult,
      currentMatcherValue,
      currentSelectField: selectFieldReverseLabelMap[currentSelectField || ""] || null,
      expectedValue,
      actualValue,
    });
    setAiSuggestions(data);
    setAiLoading(false);
  }, [transactionId, matchResult, currentMatcherValue, currentSelectField, expectedValue, actualValue, selectFieldReverseLabelMap]);

  const getExternalContext = useCallback(async () => {
    setExternalDataLoading(true);
    const crmData = await fetchExternalCRMData(transactionId);
    const erpData = await fetchExternalERPData(transactionId);
    setExternalCRMData(crmData);
    setExternalERPData(erpData);
    setExternalDataLoading(false);
  }, [transactionId]);

  useEffect(() => {
    if (isModalOpen && !currentMatched && !aiSuggestions && !aiLoading) {
      getAISuggestions();
    }
    if (isModalOpen && !externalCRMData && !externalERPData && !externalDataLoading) {
        getExternalContext();
    }
  }, [isModalOpen, currentMatched, aiSuggestions, aiLoading, externalCRMData, externalERPData, externalDataLoading, getAISuggestions, getExternalContext]);


  const applyAiSuggestion = () => {
    if (aiSuggestions) {
      if (aiSuggestions.suggestedMatcherType) {
        setTempMatchResultType(aiSuggestions.suggestedMatcherType);
        setTempSelectField(selectFieldLabelMap[aiSuggestions.suggestedMatcherType] as string);
      }
      if (aiSuggestions.suggestedMatcherValue) {
        setTempMatcherValue(aiSuggestions.suggestedMatcherValue);
      }
      if (aiSuggestions.suggestedParser) {
        setParserValue(aiSuggestions.suggestedParser);
        setShowParserValue(true);
      }
      if (aiSuggestions.suggestedTransactionField) {
        setTransactionFieldValue(aiSuggestions.suggestedTransactionField);
      }
      setActiveTab(0); // Switch to Matcher Details tab to show applied changes
    }
  };


  return (
    <div className="pr-2">
      <Modal
        isOpen={isModalOpen}
        title={
          <div className="flex items-center">
            <span className="flex-grow font-bold text-2xl text-blue-800">
              {matchResult.field} - Reconciliation Command Center
            </span>
            {matchResultData?.matchResult.match ? (
              <Icon
                className="ml-2 text-green-500"
                iconName="checkmark_circle"
                color="currentColor"
                size="l"
              />
            ) : (
              <Icon
                className="ml-2 text-red-500"
                iconName="remove_circle"
                color="currentColor"
                size="l"
              />
            )}
            <Label className="ml-2 text-sm text-gray-500">
              Transaction ID: {transactionId.substring(0, 8)}...
            </Label>
          </div>
        }
        onRequestClose={() => {
          if (!isTentative) setIsModalOpen(false);
          setAiSuggestions(null); // Clear AI suggestions on close
          setExternalCRMData(null);
          setExternalERPData(null);
        }}
        className="w-[90vw] max-w-[1200px]"
      >
        <ModalContainer className="min-h-[600px] flex flex-col">
          <Tabs selectedIndex={activeTab} onChange={setActiveTab} className="flex flex-col flex-grow">
            <Tab.List className="flex-shrink-0 border-b border-gray-200">
              <Tab className="py-3 px-6 text-lg font-medium text-gray-700 hover:text-blue-600 ui-selected:text-blue-800 ui-selected:border-b-2 ui-selected:border-blue-800 focus:outline-none">
                Matcher Details
              </Tab>
              <Tab className="py-3 px-6 text-lg font-medium text-gray-700 hover:text-blue-600 ui-selected:text-blue-800 ui-selected:border-b-2 ui-selected:border-blue-800 focus:outline-none">
                <Icon iconName="ai" size="m" className="mr-2" />
                Gemini AI Co-Pilot {aiLoading && <Spinner size="s" className="ml-2" />}
              </Tab>
              <Tab className="py-3 px-6 text-lg font-medium text-gray-700 hover:text-blue-600 ui-selected:text-blue-800 ui-selected:border-b-2 ui-selected:border-blue-800 focus:outline-none">
                <Icon iconName="apps" size="m" className="mr-2" />
                External Context {externalDataLoading && <Spinner size="s" className="ml-2" />}
              </Tab>
            </Tab.List>

            <TabPanels className="flex-grow overflow-y-auto p-4">
              {/* Matcher Details Tab Panel */}
              <TabPanel>
                <div className="p-2">
                  <div className="flex items-center mb-4">
                    <Label className="flex pb-2 pl-4 text-base font-medium">
                      Configure: {matchResult.field}
                    </Label>

                    <div className="ml-auto flex pl-2 pr-2">
                      {matchResultHasChanged() && !wasTentative ? (
                        <Clickable
                          onClick={() => {
                            matchResultCallback(
                              matchResult.matchResultType
                                ? (selectFieldLabelMap[
                                    matchResult.matchResultType
                                  ] as string)
                                : currentSelectField,
                              matchResult.matcher,
                              matchResult.parser,
                              !!matchResult.parser,
                              matchResult.transactionField,
                              matchResult.startDate || null,
                              matchResult.endDate || null,
                            );
                            setAiSuggestions(null); // Reset AI suggestions after manual reset
                          }}
                        >
                          <div className="mb-2 flex rounded-sm border px-2 items-center hover:bg-gray-100">
                            <Icon
                              className="self-center text-gray-500"
                              iconName="sync"
                              color="currentColor"
                              size="s"
                            />
                            <Label className="flex self-center p-1 text-xs hover:cursor-pointer">
                              Reset Change
                            </Label>
                          </div>
                        </Clickable>
                      ) : null}
                    </div>
                  </div>

                  <div className="border-t p-2" />
                  <div className="form-row flex w-full border-b-2 border-gray-50">
                    {tempSelectField === "Equals" ||
                    tempSelectField === "Matches" ||
                    tempSelectField === "Any" ||
                    tempSelectField === "Is Null" ? (
                      <StringReconciliationMatchResult
                        selectField={tempSelectField}
                        selectFieldOptions={selectFieldOptions.filter(
                          (op) =>
                            matchResultData?.matchResult?.matchResultTypeOptions
                              ?.map((o) => selectFieldLabelMap[o] as string)
                              ?.includes(op.value),
                        )}
                        matcher={tempMatcherValue}
                        suggestedMatcher={
                          matchResultData?.matchResult?.suggestedMatcher
                        }
                        callback={matchResultCallback}
                      />
                    ) : null}
                    {tempSelectField === "Between" ? (
                      <DateOffsetReconciliationMatchResult
                        selectField={tempSelectField}
                        selectFieldOptions={selectFieldOptions.filter(
                          (op) =>
                            matchResultData?.matchResult?.matchResultTypeOptions
                              ?.map((o) => selectFieldLabelMap[o] as string)
                              ?.includes(op.value),
                        )}
                        matcher={tempMatcherValue || ""}
                        startOffset={matchResultData?.matchResult?.startOffset}
                        endOffset={matchResultData?.matchResult?.endOffset}
                        startDate={matchResultData?.matchResult?.startDate}
                        endDate={matchResultData?.matchResult?.endDate}
                        callback={matchResultCallback}
                      />
                    ) : null}
                    {tempSelectField === "Payment Reference" ? (
                      <PaymentReferenceReconciliationMatchResult
                        selectFieldOptions={
                          matchResultData?.matchResult?.matchResultTypeOptions?.map(
                            (e) => ({ label: e, value: e }),
                          ) || []
                        }
                        matcher={tempMatcherValue}
                        referenceValue={matchResultData?.matchResult?.expected}
                        parser={parserValue}
                        showParser={showParserValue}
                        transactionField={transactionFieldValue}
                        transactionFieldString={
                          matchResultData?.matchResult?.transactionFieldValue
                        }
                        suggestedMatcher={
                          matchResultData?.matchResult?.suggestedMatcher
                        }
                        callback={matchResultCallback}
                      />
                    ) : null}
                    {tempSelectField === "Short ID" ||
                    tempSelectField === "From Transaction" ? (
                      <FromTransactionReconciliationMatchResult
                        selectField={tempSelectField}
                        selectFieldOptions={selectFieldOptions.filter(
                          (op) =>
                            matchResultData?.matchResult?.matchResultTypeOptions
                              ?.map((o) => selectFieldLabelMap[o] as string)
                              ?.includes(op.value),
                        )}
                        matcher={tempMatcherValue}
                        parser={parserValue}
                        showParser={showParserValue}
                        transactionField={transactionFieldValue}
                        transactionFieldString={
                          matchResultData?.matchResult?.transactionFieldValue
                        }
                        suggestedMatcher={
                          matchResultData?.matchResult?.suggestedMatcher
                        }
                        callback={matchResultCallback}
                      />
                    ) : null}
                    {tempSelectField === "Is True" ||
                    tempSelectField === "Is False" ? (
                      <BooleanReconciliationMatchResult
                        selectField={tempSelectField}
                        selectFieldOptions={selectFieldOptions.filter(
                          (op) =>
                            matchResultData?.matchResult?.matchResultTypeOptions
                              ?.map((o) => selectFieldLabelMap[o] as string)
                              ?.includes(op.value),
                        )}
                        callback={matchResultCallback}
                      />
                    ) : null}
                    {tempSelectField === "Group By" ? (
                      <GroupByReconciliationMatchResult
                        selectFieldOptions={(
                          matchResultData?.matchResult?.matchResultTypeOptions ||
                          matchResult.matchResultTypeOptions ||
                          []
                        ).map((e) => ({ value: e, label: e }))}
                        matcher={tempMatcherValue}
                        groupBy={matchResultData?.matchResult?.groupBy}
                        groupByGroups={matchResultData?.matchResult?.groupByGroups}
                        suggestedMatcher={
                          matchResultData?.matchResult?.suggestedMatcher
                        }
                        callback={matchResultCallback}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col pt-4 bg-gray-50 p-3 rounded-md">
                    <div className="flex mb-2">
                      <Label className="justify-right ml-auto flex self-center pb-1 pr-1 font-medium text-gray-700">
                        Expected Value:
                      </Label>
                      <Label className="flex break-all pb-1 font-semibold text-blue-700">
                        {matchResultData?.matchResult?.expected || expectedValue}
                      </Label>
                    </div>
                    <div className="flex">
                      <Label className="justify-right ml-auto flex self-center pb-2 pl-6 pr-1 font-medium text-gray-700">
                        Actual Transaction Value:
                      </Label>
                      <Label className="flex break-all pb-2 font-semibold text-purple-700">
                        {matchResultData?.matchResult?.actual || actualValue}
                      </Label>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Gemini AI Co-Pilot Tab Panel */}
              <TabPanel className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-inner">
                <div className="flex flex-col h-full">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                    <Icon iconName="sparkle" size="l" className="mr-3 text-purple-600" />
                    Gemini AI Co-Pilot: Intelligent Insights
                  </h2>
                  <p className="text-gray-700 mb-6 text-lg">
                    Harness the power of AI to supercharge your reconciliation process. Gemini analyzes your data, pinpoints discrepancies, and suggests optimal match strategies with unprecedented accuracy.
                  </p>

                  <div className="mb-6">
                    <Button
                      buttonType="primary"
                      onClick={getAISuggestions}
                      disabled={aiLoading}
                      className="text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {aiLoading ? (
                        <>
                          <Spinner className="mr-2" size="s" /> Generating Brilliance...
                        </>
                      ) : (
                        <>
                          <Icon iconName="brain" size="m" className="mr-2" />
                          Analyze & Suggest New Matcher
                        </>
                      )}
                    </Button>
                  </div>

                  {aiSuggestions && (
                    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg border border-purple-200">
                      <h3 className="text-xl font-bold text-blue-800 flex items-center">
                        <Icon iconName="lightbulb" size="m" className="mr-2 text-yellow-500" />
                        AI Recommendation:
                      </h3>
                      <TextArea
                        label="AI Explanation"
                        value={aiSuggestions.explanation}
                        readOnly
                        className="font-mono bg-gray-50 text-gray-800 border-gray-200 rounded-md p-3 text-base min-h-[120px]"
                      />
                      {aiSuggestions.suggestedMatcherType || aiSuggestions.suggestedMatcherValue || aiSuggestions.suggestedParser || aiSuggestions.suggestedTransactionField ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            {aiSuggestions.suggestedMatcherType && (
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Suggested Matcher Type</Label>
                                <Chip contentClassName="bg-indigo-100 text-indigo-800 font-medium py-1 px-3 rounded-full text-base">
                                  {selectFieldLabelMap[aiSuggestions.suggestedMatcherType] || aiSuggestions.suggestedMatcherType}
                                </Chip>
                              </div>
                            )}
                            {aiSuggestions.suggestedMatcherValue && (
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Suggested Matcher Value</Label>
                                <Chip contentClassName="bg-indigo-100 text-indigo-800 font-medium py-1 px-3 rounded-full text-base">
                                  {aiSuggestions.suggestedMatcherValue}
                                </Chip>
                              </div>
                            )}
                            {aiSuggestions.suggestedParser && (
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Suggested Parser</Label>
                                <Chip contentClassName="bg-indigo-100 text-indigo-800 font-medium py-1 px-3 rounded-full text-base">
                                  {aiSuggestions.suggestedParser}
                                </Chip>
                              </div>
                            )}
                            {aiSuggestions.suggestedTransactionField && (
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Suggested Transaction Field</Label>
                                <Chip contentClassName="bg-indigo-100 text-indigo-800 font-medium py-1 px-3 rounded-full text-base">
                                  {aiSuggestions.suggestedTransactionField}
                                </Chip>
                              </div>
                            )}
                          </div>
                          <Button
                            buttonType="primary"
                            onClick={applyAiSuggestion}
                            className="w-full mt-4 text-lg py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all"
                          >
                            <Icon iconName="auto_fix_high" size="m" className="mr-2" />
                            Apply AI's Masterful Suggestion
                          </Button>
                        </>
                      ) : (
                          <div className="text-gray-600 text-center py-4">
                              Gemini couldn't find a specific actionable suggestion at this moment, but its insights are provided above.
                          </div>
                      )}
                    </div>
                  )}
                  {!aiSuggestions && !aiLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center text-xl">
                      <Icon iconName="cognitive_service" size="xl" className="mb-4 text-purple-400 opacity-70" />
                      Click "Analyze & Suggest New Matcher" to unleash Gemini's reconciliation prowess.
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* External Context Tab Panel */}
              <TabPanel className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg shadow-inner">
                <div className="flex flex-col h-full">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                    <Icon iconName="link" size="l" className="mr-3 text-teal-600" />
                    External App Context: Comprehensive 360° View
                  </h2>
                  <p className="text-gray-700 mb-6 text-lg">
                    Integrate seamlessly with your CRM, ERP, and other vital business applications. Get instant, enriched data to accelerate decision-making and ensure flawless reconciliation.
                  </p>

                  <div className="mb-6">
                    <Button
                      buttonType="secondary"
                      onClick={getExternalContext}
                      disabled={externalDataLoading}
                      className="text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {externalDataLoading ? (
                        <>
                          <Spinner className="mr-2" size="s" /> Fetching Cross-App Intelligence...
                        </>
                      ) : (
                        <>
                          <Icon iconName="cloud_download" size="m" className="mr-2" />
                          Refresh External Data
                        </>
                      )}
                    </Button>
                  </div>

                  {externalCRMData || externalERPData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-lg border border-teal-200 flex-grow">
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-teal-800 flex items-center">
                          <Icon iconName="groups" size="m" className="mr-2 text-blue-500" />
                          CRM Insights (Salesforce, Hubspot, etc.)
                        </h3>
                        <TextArea
                          label="Customer Relationship Management Data"
                          value={externalCRMData || "No CRM data available for this transaction."}
                          readOnly
                          className="font-mono bg-gray-50 text-gray-800 border-gray-200 rounded-md p-3 text-base flex-grow min-h-[150px]"
                        />
                         <Button buttonType="text" className="text-blue-600 hover:underline self-end">
                            <Icon iconName="open_in_new" size="s" className="mr-1"/> Open in CRM
                         </Button>
                      </div>
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-teal-800 flex items-center">
                          <Icon iconName="business" size="m" className="mr-2 text-green-500" />
                          ERP Details (SAP, Oracle, etc.)
                        </h3>
                        <TextArea
                          label="Enterprise Resource Planning Data"
                          value={externalERPData || "No ERP data available for this transaction."}
                          readOnly
                          className="font-mono bg-gray-50 text-gray-800 border-gray-200 rounded-md p-3 text-base flex-grow min-h-[150px]"
                        />
                         <Button buttonType="text" className="text-blue-600 hover:underline self-end">
                            <Icon iconName="open_in_new" size="s" className="mr-1"/> View in ERP
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center text-xl">
                      <Icon iconName="sync_alt" size="xl" className="mb-4 text-teal-400 opacity-70" />
                      No external app data loaded yet. Click "Refresh External Data" to connect.
                    </div>
                  )}
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <ModalFooter className="flex-shrink-0 -mt-3 border-t pt-4 bg-gray-50">
            <div className="flex w-full space-x-4">
              <Button
                buttonType="secondary"
                className="flex-1 text-base py-3"
                onClick={() => {
                  setIsModalOpen(false);
                  setTempMatchResultType(updatedMatchResultType);
                  setTempMatcherValue(updatedMatcherValue);
                  if (isTentative)
                    callback(matcherId, "", "", "", "", false, true);
                  setAiSuggestions(null); // Clear AI suggestions on cancel
                  setExternalCRMData(null);
                  setExternalERPData(null);
                }}
              >
                Cancel & Discard AI Insights
              </Button>
              <Button
                id="reconcile-items-button"
                buttonType="primary"
                isSubmit
                disabled={
                  (!matchResultHasChanged() &&
                    !matchResultIsEdited() &&
                    !matchResultIsUpdated() &&
                    !isTentative &&
                    !aiSuggestions) || // Allow update if AI suggests something
                  matchResultData === null ||
                  updateDisabled()
                }
                className="flex-1 text-base py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl"
                onClick={() => {
                  setIsModalOpen(false);
                  setUpdatedMatcherValue(tempMatcherValue);
                  setUpdatedMatchResultType(tempMatchResultType);
                  setUpdatedParserValue(parserValue);
                  setUpdatedTransactionFieldValue(transactionFieldValue);
                  setUpdatedStartDateValue(startDateValue);
                  setUpdatedEndDateValue(endDateValue);
                  setCurrentSelectField(tempSelectField);

                  const matcherVal =
                    tempSelectField === "Between"
                      ? `${String(
                          matchResultData?.matchResult?.startOffset,
                        )}..${String(matchResultData?.matchResult?.endOffset)}`
                      : tempMatcherValue;

                  setTempMatcherValue(matcherVal);
                  setCurrentMatcherValue(matcherVal);
                  setCurrentMatched(
                    matchResultData?.matchResult.match || false,
                  );
                  setOffsetStart(matchResultData?.matchResult?.startOffset);
                  setOffsetEnd(matchResultData?.matchResult?.endOffset);
                  setTempTransactionField(
                    matchResultData?.matchResult?.transactionField,
                  );
                  setTempPaymentReferenceTypeValue(
                    matchResultData?.matchResult?.matcher,
                  );
                  callback(
                    matcherId,
                    matcherVal || "",
                    parserValue || "",
                    transactionFieldValue || "",
                    tempMatchResultType || "",
                    matchResultHasChanged() ||
                      matchResultIsEdited() ||
                      isTentative ||
                      (aiSuggestions !== null), // Indicate modification if AI suggestions were presented/applied
                    false,
                  );
                  setIsTentative(false);
                  setAiSuggestions(null); // Clear AI suggestions after update
                  setExternalCRMData(null);
                  setExternalERPData(null);
                }}
              >
                {isTentative ? "Add Matcher" : "Activate & Reconcile with Intelligence"}
              </Button>
            </div>
          </ModalFooter>
        </ModalContainer>
      </Modal>

      <div
        className="mb-1 flex w-full"
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
      >
        {matchResultIsUpdated() || newMatcher ? (
          <Icon
            className="mr-1 self-center text-blue-400 animate-pulse"
            iconName="bolt"
            color="currentColor"
            size="s"
          />
        ) : (
          <Icon
            className="mr-1 self-center text-gray-300"
            iconName="circle"
            color="currentColor"
            size="s"
          />
        )}

        <Clickable onClick={() => setIsModalOpen(true)} cursorStyle="pointer">
          <div
            className={`flex w-full flex-row justify-start overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
              currentMatched
                ? "bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
                : "bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200"
            }`}
          >
            {aiSuggestions && !currentMatched && (
              <Icon iconName="ai" size="m" className="text-purple-600 self-center ml-2 mr-1" />
            )}
            {matcherChips("flex-grow", currentMatched, hoverState)}

            {!currentMatched ? (
              <div className="ml-auto flex self-center pr-3">
                <Label className="mr-1 whitespace-nowrap italic text-red-600 font-medium">
                  Intelligent Debugging Required
                </Label>
                <Icon
                  className="mr-1 text-red-500 animate-bounce"
                  iconName="error_outlined"
                  color="currentColor"
                  size="m"
                />
              </div>
            ) : (
                 <div className="ml-auto flex self-center pr-3">
                     <Label className="mr-1 whitespace-nowrap italic text-green-700 font-medium">
                         Perfectly Reconciled!
                     </Label>
                     <Icon
                         className="mr-1 text-green-600"
                         iconName="thumb_up_alt"
                         color="currentColor"
                         size="m"
                     />
                 </div>
            )}
          </div>
        </Clickable>
        {(!hoverState || !isRemovable) && (
          <Clickable onClick={() => null}>
            <div className="self-center">
              <Icon
                className="ml-1 self-center text-transparent"
                iconName="remove"
                color="currentColor"
                size="m"
                alignment="baseline"
              />
            </div>
          </Clickable>
        )}
        {hoverState && isRemovable && (
          <Clickable onClick={() => setOpenRemoveMatcherModal(true)}>
            <div className="self-center p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200">
              <Icon
                className="text-red-600"
                iconName="delete"
                color="currentColor"
                size="m"
                alignment="baseline"
              />
            </div>
          </Clickable>
        )}

        <Modal
          isOpen={openRemoveMatcherModal}
          title="Confirm Matcher Deletion"
          onRequestClose={() => setOpenRemoveMatcherModal(false)}
        >
          <ModalContainer>
            <div className="p-2 py-4 text-center">
              <Icon iconName="warning" size="xl" className="text-yellow-500 mb-4" />
              <Label className="ml-auto mr-auto flex flex-col items-center text-lg font-medium">
                Are you absolutely sure you want to remove
                <b className="px-1 text-red-700">{matchResult.field}</b> matcher?
                This action is irreversible and may impact future reconciliations.
              </Label>
              {matcherChips("flex justify-center pt-4", true, false)}
            </div>

            <ModalFooter className="-mt-3 border-none">
              <div className="flex w-full space-x-4">
                <Button
                  buttonType="secondary"
                  className="flex-1 py-3 text-base"
                  onClick={() => {
                    setOpenRemoveMatcherModal(false);
                  }}
                >
                  <Icon iconName="undo" size="m" className="mr-2" />
                  No, Keep This Masterpiece
                </Button>
                <Button
                  id="reconcile-items-button"
                  buttonType="primary"
                  isSubmit
                  className="flex-1 py-3 text-base bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    callback(
                      matcherId,
                      "",
                      "",
                      selectFieldReverseLabelMap[
                        currentSelectField as string
                      ] as string,
                      "",
                      true,
                      true,
                    );
                    setOpenRemoveMatcherModal(false);
                  }}
                >
                  <Icon iconName="delete_forever" size="m" className="mr-2" />
                  Yes, Erase It
                </Button>
              </div>
            </ModalFooter>
          </ModalContainer>
        </Modal>
      </div>
    </div>
  );
}

export default DatabaseReconciliationMatchResult;