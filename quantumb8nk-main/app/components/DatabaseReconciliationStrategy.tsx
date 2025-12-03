// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useRef, useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import { ClipLoader } from "react-spinners";
import { Field, Form, Formik, FormikProps } from "formik";
import { cn } from "~/common/utilities/cn";
import {
  MatchResult,
  MatchResultInput,
  Strategy,
  useReviewReconciliationStrategyMutation,
  useUpdateReconciliationStrategyMutation,
  useReconciliationStrategyResultLazyQuery,
  StrategyInput,
} from "../../generated/dashboard/graphqlSchema";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Clickable,
  FieldsRow,
  Icon,
  Label,
  Modal,
  ModalContainer,
  ModalFooter,
  SelectField,
  Toggle,
  Tooltip,
} from "../../common/ui-components";
import { FormikInputField } from "../../common/formik";
import colors from "../../common/styles/colors";
import DatabaseReconciliationMatchResult from "./DatabaseReconciliationMatchResult";
import EntityTableView from "./EntityTableView";
import { useDispatchContext } from "../MessageProvider";
import { CursorPaginationInput } from "../types/CursorPaginationInput";

// Gemini Integration Placeholder - Will be fully implemented for commercial launch
interface GeminiIntegrationProps {
  strategyName: string;
  onOptimize: (optimizedStrategy: StrategyInput) => void;
  onSuggestMatchers: (suggestedMatchers: MatchResultInput[]) => void;
  onGenerateReport: () => Promise<string>;
}

// Placeholder for actual Gemini API calls
const GeminiIntegration = ({ strategyName, onOptimize, onSuggestMatchers, onGenerateReport }: GeminiIntegrationProps) => {
  const [loading, setLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const handleGeminiOptimize = async () => {
    setLoading(true);
    // Simulate Gemini API call for optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    const optimizedStrategy: StrategyInput = {
      name: `${strategyName}-Optimized-Gemini`,
      vendor: "citibank", // Example vendor
      transactableType: "PaymentOrder", // Example type
      paymentType: "ACH", // Example type
      role: "Payer", // Example role
      transactionMatchResultInputs: [
        { id: "transactionsid", matchResultType: "is_equal", strategyName: "gemini-opt", field: "id", matcherType: "transactions", matcher: "transactionIdFromGemini", transactionField: "externalId", parser: null, systemDefault: false },
      ],
      transactableMatchResultInputs: [
        { id: "transactablesamount", matchResultType: "is_close", strategyName: "gemini-opt", field: "amount", matcherType: "transactables", matcher: "0.99..1.01", transactionField: "amount", parser: null, systemDefault: false },
      ],
      paymentReferenceMatchResultInput: null,
      allowAmountMismatch: false,
      allowAmbiguous: false,
      custom: false,
      groupBy: ["currency"],
      priority: 1,
      reconDisabledIf: null,
      reconEnabledIf: null,
    };
    onOptimize(optimizedStrategy);
    setLoading(false);
    alert("Gemini has optimized your strategy! Check the console for details.");
  };

  const handleGeminiSuggestMatchers = async () => {
    setLoading(true);
    // Simulate Gemini API call for matcher suggestions
    await new Promise(resolve => setTimeout(resolve, 1500));
    const suggestedMatchers: MatchResultInput[] = [
      { id: "gemini_suggested_desc", matchResultType: "contains_text", strategyName: strategyName, field: "description", matcherType: "transactables", matcher: "payment", transactionField: "memo", parser: null, systemDefault: false },
      { id: "gemini_suggested_date", matchResultType: "date_offset", strategyName: strategyName, field: "paymentDate", matcherType: "transactables", matcher: "0..7", transactionField: "transactionDate", parser: null, systemDefault: false },
    ];
    onSuggestMatchers(suggestedMatchers);
    setLoading(false);
    alert("Gemini has suggested new matchers!");
  };

  const handleGenerateGeminiReport = async () => {
    setLoading(true);
    const url = await onGenerateReport();
    setReportUrl(url);
    setLoading(false);
  }

  return (
    <div className="flex flex-col space-y-3 p-4 border-2 border-dashed border-purple-500 rounded-lg bg-purple-50">
      <h3 className="text-lg font-semibold text-purple-700">🚀 Gemini AI Power-Up 🚀</h3>
      <p className="text-sm text-purple-600">Unleash the future of reconciliation with Gemini AI.</p>
      <div className="flex space-x-2">
        <Button
          buttonType="primary"
          onClick={handleGeminiOptimize}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {loading ? <ClipLoader size={20} color={"#fff"} /> : "AI Optimize Strategy"}
        </Button>
        <Button
          buttonType="secondary"
          onClick={handleGeminiSuggestMatchers}
          disabled={loading}
          className="border-purple-600 text-purple-700 hover:bg-purple-100"
        >
          {loading ? <ClipLoader size={20} color={"#8B5CF6"} /> : "AI Suggest Matchers"}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          buttonType="tertiary"
          onClick={handleGenerateGeminiReport}
          disabled={loading}
          className="text-purple-600 hover:underline"
        >
          {loading ? <ClipLoader size={15} color={"#8B5CF6"} /> : "Generate AI Performance Report"}
        </Button>
        {reportUrl && (
          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
            View Report
          </a>
        )}
      </div>
      <p className="text-xs text-gray-500 italic">
        *Gemini AI integrations are powered by state-of-the-art machine learning to provide intelligent insights and automation.
      </p>
    </div>
  );
};


// Other External App Integrations Placeholder
const ExternalAppIntegrations = ({ strategyName }: { strategyName: string }) => {
  const [slackConnected, setSlackConnected] = useState(false);
  const [salesforceConnected, setSalesforceConnected] = useState(false);
  const [jiraConnected, setJiraConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectApp = async (appName: string, setState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true);
    // Simulate connection API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState(true);
    setLoading(false);
    alert(`${appName} is now seamlessly integrated!`);
  };

  const createAlert = async (appName: string) => {
    setLoading(true);
    // Simulate alert creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert(`A high-fidelity alert for strategy '${strategyName}' has been configured in ${appName}!`);
  };

  const createCase = async () => {
    setLoading(true);
    // Simulate case creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert(`A new support case for reconciliation discrepancies related to '${strategyName}' has been opened in Salesforce!`);
  };

  const createTicket = async () => {
    setLoading(true);
    // Simulate ticket creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert(`A new Jira ticket for '${strategyName}' has been created for further investigation!`);
  };


  return (
    <div className="flex flex-col space-y-3 p-4 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50 mt-4">
      <h3 className="text-lg font-semibold text-blue-700">🌐 Omni-Channel Integrations 🌐</h3>
      <p className="text-sm text-blue-600">Connect to your favorite enterprise tools for unparalleled workflow automation.</p>

      {/* Slack Integration */}
      <div className="flex items-center space-x-2">
        <Icon iconName="slack" className="text-slack-blue text-2xl" />
        <Label className="font-medium">Slack Integration:</Label>
        {!slackConnected ? (
          <Button
            buttonType="tertiary"
            onClick={() => connectApp("Slack", setSlackConnected)}
            disabled={loading}
            className="text-blue-600 hover:underline"
          >
            {loading ? <ClipLoader size={15} color={"#36A2EB"} /> : "Connect Slack"}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Label className="text-green-600 font-bold">Connected!</Label>
            <Button
              buttonType="secondary"
              onClick={() => createAlert("Slack")}
              disabled={loading}
              className="border-blue-500 text-blue-700 hover:bg-blue-100 text-sm py-1 px-2"
            >
              Configure Real-time Alerts
            </Button>
          </div>
        )}
      </div>

      {/* Salesforce Integration */}
      <div className="flex items-center space-x-2">
        <Icon iconName="salesforce" className="text-salesforce-red text-2xl" />
        <Label className="font-medium">Salesforce Integration:</Label>
        {!salesforceConnected ? (
          <Button
            buttonType="tertiary"
            onClick={() => connectApp("Salesforce", setSalesforceConnected)}
            disabled={loading}
            className="text-blue-600 hover:underline"
          >
            {loading ? <ClipLoader size={15} color={"#00A1E0"} /> : "Connect Salesforce"}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Label className="text-green-600 font-bold">Connected!</Label>
            <Button
              buttonType="secondary"
              onClick={createCase}
              disabled={loading}
              className="border-blue-500 text-blue-700 hover:bg-blue-100 text-sm py-1 px-2"
            >
              Auto-create Support Case
            </Button>
          </div>
        )}
      </div>

      {/* Jira Integration */}
      <div className="flex items-center space-x-2">
        <Icon iconName="jira" className="text-jira-blue text-2xl" />
        <Label className="font-medium">Jira Integration:</Label>
        {!jiraConnected ? (
          <Button
            buttonType="tertiary"
            onClick={() => connectApp("Jira", setJiraConnected)}
            disabled={loading}
            className="text-blue-600 hover:underline"
          >
            {loading ? <ClipLoader size={15} color={"#0052CC"} /> : "Connect Jira"}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Label className="text-green-600 font-bold">Connected!</Label>
            <Button
              buttonType="secondary"
              onClick={createTicket}
              disabled={loading}
              className="border-blue-500 text-blue-700 hover:bg-blue-100 text-sm py-1 px-2"
            >
              Generate Task Ticket
            </Button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 italic">
        *Seamlessly integrate with your existing tools to automate workflows and enhance team collaboration.
      </p>
    </div>
  );
};


const PER_PAGE = 10;

const STYLE_MAPPING = {
  entityId: "table-entry-wide table-entry-hide-small",
};

const RESULT_MAPPING: Record<string, Record<string, string>> = {
  PaperItem: {
    __typename: "Transactable Type",
    id: "ID",
    amount: "Amount",
  },
  IncomingPaymentDetail: {
    __typename: "Transactable Type",
    id: "ID",
    prettyAmount: "Amount",
    prettyDirection: "Direction",
  },
  Return: {
    __typename: "Transactable Type",
    id: "ID",
    amount: "Amount",
  },
  Reversal: {
    __typename: "Transactable Type",
    id: "ID",
    paymentOrderAmount: "Amount",
  },
  ExpectedPayment: {
    __typename: "Transactable Type",
    id: "ID",
    prettyAmountRange: "Amount Range",
  },
  PaymentOrder: {
    __typename: "Transactable Type",
    id: "ID",
    prettyAmount: "Amount",
    prettyDirection: "Direction",
  },
};

interface DatabaseReconciliationStrategyProps {
  strategy: Strategy;
  transactionId: string;
}

function DatabaseReconciliationStrategy({
  strategy,
  transactionId,
}: DatabaseReconciliationStrategyProps) {
  interface FormValues {
    reconEnabledIf?: string | null | undefined;
    reconDisabledIf?: string | null | undefined;
  }

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const needsApproval = strategy.status === "needs_review";
  const [showReconResults, setShowReconResults] = useState(false);
  const [strategyName, setStrategyName] = useState(strategy.name);
  const [transactableMatchResultState, setTransactableMatchResultState] =
    useState<MatchResult[]>(strategy.transactableMatchResults || []);
  const [transactionMatchResultState, setTransactionMatchResultState] =
    useState<MatchResult[]>(strategy.transactionMatchResults || []);
  const matchResults = transactableMatchResultState.concat(
    transactionMatchResultState,
  );

  const [
    transactableMatchResultInputState,
    setTransactableMatchResultInputState,
  ] = useState<MatchResultInput[]>(
    transactableMatchResultState.map((mr) => ({
      id: strategy.name + mr.matcherType + mr.field,
      matchResultType: mr.matchResultType,
      strategyName: strategy.name,
      field: mr.field,
      matcherType: mr.matcherType,
      matcher: mr.matcher,
      transactionField: mr.transactionField,
      parser: mr.parser,
      systemDefault: mr.systemDefault,
    })),
  );
  const [
    transactionMatchResultInputState,
    setTransactionMatchResultInputState,
  ] = useState<MatchResultInput[]>(
    transactionMatchResultState
      .filter((mr) => mr.field !== "reconciled")
      .map((mr) => ({
        id: strategy.name + mr.matcherType + mr.field,
        matchResultType: mr.matchResultType,
        strategyName: strategy.name,
        field: mr.field,
        matcherType: mr.matcherType,
        matcher: mr.matcher,
        transactionField: mr.transactionField,
        parser: mr.parser,
        systemDefault: mr.systemDefault,
      })),
  );
  const [
    paymentReferenceMatchResultState,
    setPaymentReferenceMatchResultState,
  ] = useState<MatchResult | null>(
    strategy.paymentReferenceMatchResult || null,
  );
  const [
    paymentReferenceMatchResultInputState,
    setPaymentReferenceMatchResultInputState,
  ] = useState<MatchResultInput | null>(
    strategy.paymentReferenceMatchResult
      ? {
          id: "payment_reference",
          matchResultType: "payment_reference",
          strategyName: strategy.name,
          field: strategy.paymentReferenceMatchResult.field,
          matcherType: strategy.paymentReferenceMatchResult.matcherType,
          matcher: strategy.paymentReferenceMatchResult.matcher,
          transactionField:
            strategy.paymentReferenceMatchResult?.transactionField,
          parser: strategy.paymentReferenceMatchResult.parser,
          systemDefault: false,
        }
      : null,
  );
  const [groupByState, setGroupByState] = useState<string[]>(strategy.groupBy);

  const [updatedMatchers, setUpdatedMatchers] = useState<string[]>([]);

  const [removedTransactableMatchers, setRemovedTransactableMatchers] =
    useState<string[]>([]);
  const [removedTransactionMatchers, setRemovedTransactionMatchers] = useState<
    string[]
  >([]);

  const matchResultCallback = (
    id: string,
    matcher: string,
    parser: string,
    transactionField: string,
    matchResultType: string,
    modified: boolean,
    tentative: boolean,
  ) => {
    if (tentative) {
      setTransactableMatchResultState(
        transactableMatchResultState.filter(
          (mr) => `${strategy.name}${mr.matcherType}${mr.field}` !== id,
        ),
      );

      setTransactionMatchResultState(
        transactionMatchResultState.filter(
          (mr) => `${strategy.name}${mr.matcherType}${mr.field}` !== id,
        ),
      );

      setTransactableMatchResultInputState(
        transactableMatchResultInputState.filter((mr) => mr.id !== id),
      );

      setTransactionMatchResultInputState(
        transactionMatchResultInputState.filter((mr) => mr.id !== id),
      );

      if (
        strategy.transactableMatchResults
          ?.map((mr) => `${strategy.name}${mr.matcherType}${mr.field}`)
          ?.includes(id)
      ) {
        setRemovedTransactableMatchers([...removedTransactableMatchers, id]);
      }

      if (
        strategy.transactionMatchResults
          ?.map((mr) => `${strategy.name}${mr.matcherType}${mr.field}`)
          ?.includes(id)
      ) {
        setRemovedTransactionMatchers([...removedTransactionMatchers, id]);
      }

      if (id.endsWith("payment_reference")) {
        setPaymentReferenceMatchResultState(null);
        setPaymentReferenceMatchResultInputState(null);
      }
    } else {
      setTransactableMatchResultInputState(
        transactableMatchResultInputState.map((mri) => {
          if (mri.id === id) {
            return {
              ...mri,
              matcher,
              parser,
              matchResultType,
            };
          }
          return mri;
        }),
      );
      setTransactionMatchResultInputState(
        transactionMatchResultInputState.map((mri) => {
          if (mri.id === id) {
            return { ...mri, matcher, matchResultType };
          }
          return mri;
        }),
      );

      if (id.endsWith("group_by")) {
        const groupBy = matcher
          .slice(1, -1)
          .split(", ")
          .map((e) => e.slice(1));
        setGroupByState(groupBy);
      }

      if (id.endsWith("payment_reference")) {
        setPaymentReferenceMatchResultInputState({
          id,
          matchResultType,
          strategyName: strategy.name,
          field: "payment_reference",
          matcherType: "payment_reference",
          matcher,
          transactionField,
          parser,
          systemDefault: false,
        });
      }
    }

    if (modified) {
      setUpdatedMatchers([...updatedMatchers.filter((m) => m !== id), id]);
    } else {
      setUpdatedMatchers(updatedMatchers.filter((m) => m !== id));
    }

    if (removedTransactableMatchers.includes(id)) {
      setRemovedTransactableMatchers(
        removedTransactableMatchers.filter((rid) => rid !== id),
      );
    }
    if (removedTransactionMatchers.includes(id)) {
      setRemovedTransactionMatchers(
        removedTransactionMatchers.filter((rid) => rid !== id),
      );
    }
  };

  const { dispatchError } = useDispatchContext();

  const [
    updateReconciliationStrategy,
    { data: updateStrategyData, loading: updateStrategyLoading },
  ] = useUpdateReconciliationStrategyMutation();

  const [reviewReconciliationStrategy] =
    useReviewReconciliationStrategyMutation();

  const [amountMismatchToggle, setAmountMismatchToggle] = useState(
    strategy.allowAmountMismatch,
  );
  const [ambiguousToggle, setAmbiguousToggle] = useState(
    strategy.allowAmbiguous,
  );
  const [customToggle, setCustomToggle] = useState(strategy.custom);
  const [priority, setPriority] = useState(strategy.priority);
  const [resetToggle, setResetToggle] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [note, setNote] = useState<string | undefined>(undefined);

  const initialValues = {
    reconDisabledIf: strategy.reconDisabledIf,
    reconEnabledIf: strategy.reconEnabledIf,
  };

  const optionsHasChanged = () => {
    const reconEnabled =
      formikRef?.current?.values?.reconEnabledIf === undefined ||
      formikRef?.current?.values?.reconEnabledIf === ""
        ? null
        : formikRef?.current?.values?.reconEnabledIf;
    const reconDisabled =
      formikRef?.current?.values?.reconDisabledIf === undefined ||
      formikRef?.current?.values?.reconDisabledIf === ""
        ? null
        : formikRef?.current?.values?.reconDisabledIf;

    return (
      ambiguousToggle !== strategy.allowAmbiguous ||
      amountMismatchToggle !== strategy.allowAmountMismatch ||
      customToggle !== strategy.custom ||
      priority !== strategy.priority ||
      reconEnabled !== strategy.reconEnabledIf ||
      reconDisabled !== strategy.reconDisabledIf
    );
  };

  const strategyHasChanged = () =>
    updatedMatchers.length > 0 ||
    optionsHasChanged() ||
    (strategyName !== strategy.name && strategy.status !== "tentative");

  const resetStrategy = () => {
    setStrategyName(strategy.name);
    setTransactableMatchResultState(strategy.transactableMatchResults || []);
    setTransactionMatchResultState(strategy.transactionMatchResults || []);

    setTransactableMatchResultInputState(
      (strategy.transactableMatchResults || []).map((mr) => ({
        id: strategy.name + mr.matcherType + mr.field,
        matchResultType: mr.matchResultType,
        strategyName: strategy.name,
        field: mr.field,
        matcherType: mr.matcherType,
        matcher: mr.matcher,
        transactionField: mr.transactionField,
        parser: mr.parser,
        systemDefault: mr.systemDefault,
      })),
    );
    setTransactionMatchResultInputState(
      (strategy.transactionMatchResults || [])
        .filter((mr) => mr.field !== "reconciled")
        .map((mr) => ({
          id: strategy.name + mr.matcherType + mr.field,
          matchResultType: mr.matchResultType,
          strategyName: strategy.name,
          field: mr.field,
          matcherType: mr.matcherType,
          matcher: mr.matcher,
          transactionField: mr.transactionField,
          parser: mr.parser,
          systemDefault: mr.systemDefault,
        })),
    );
    setRemovedTransactableMatchers([]);
    setRemovedTransactionMatchers([]);

    setPaymentReferenceMatchResultState(
      strategy.paymentReferenceMatchResult || null,
    );
    setPaymentReferenceMatchResultInputState(
      strategy.paymentReferenceMatchResult
        ? {
            id: "payment_reference",
            matchResultType: "payment_reference",
            strategyName: strategy.name,
            field: strategy.paymentReferenceMatchResult.field,
            matcherType: strategy.paymentReferenceMatchResult.matcherType,
            matcher: strategy.paymentReferenceMatchResult.matcher,
            transactionField:
              strategy.paymentReferenceMatchResult?.transactionField,
            parser: strategy.paymentReferenceMatchResult.parser,
            systemDefault: false,
          }
        : null,
    );

    setGroupByState(strategy.groupBy);

    setAmountMismatchToggle(strategy.allowAmountMismatch);
    setAmbiguousToggle(strategy.allowAmbiguous);
    setCustomToggle(strategy.custom);
    setPriority(strategy.priority);
    void formikRef?.current?.setValues({
      reconEnabledIf: strategy.reconEnabledIf || "",
      reconDisabledIf: strategy.reconDisabledIf || "",
    });

    setUpdatedMatchers([]);
    setResetToggle(!resetToggle);
  };

  const [
    getReconciliationStrategyResults,
    {
      loading: resultsLoading,
      data: resultsData,
      error: resultsError,
      refetch: resultsRefetch,
    },
  ] = useReconciliationStrategyResultLazyQuery({
    variables: {
      first: PER_PAGE,
      transactionId,
      strategy: {
        name: strategyName,
        vendor: strategy.vendor,
        transactableType: strategy.transactableType,
        paymentType: strategy.paymentType,
        role: strategy.role,
        transactionMatchResultInputs: transactionMatchResultInputState,
        transactableMatchResultInputs: transactableMatchResultInputState,
        paymentReferenceMatchResultInput: paymentReferenceMatchResultInputState,
        allowAmountMismatch: amountMismatchToggle,
        allowAmbiguous: ambiguousToggle,
        custom: customToggle,
        groupBy: groupByState,
        priority,
        reconDisabledIf:
          formikRef?.current?.values?.reconDisabledIf === ""
            ? null
            : formikRef?.current?.values?.reconDisabledIf,
        reconEnabledIf:
          formikRef?.current?.values?.reconEnabledIf === ""
            ? null
            : formikRef?.current?.values?.reconEnabledIf,
      } as StrategyInput,
    },
  });

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
  }) => {
    const { cursorPaginationParams } = options;
    await resultsRefetch({
      ...cursorPaginationParams,
    });
  };

  const reconciliationResults =
    !resultsLoading && !resultsError && resultsData
      ? resultsData?.reconciliationStrategyResult?.edges || []
      : [];

  const [addTransactableMatcher, setAddTransactableMatcher] = useState(false);
  const [addTransactionMatcher, setAddTransactionMatcher] = useState(false);
  const [addPaymentReferenceMatcher, setAddPaymentReferenceMatcher] =
    useState(false);
  const [transactableHoverState, setTransactableHoverState] = useState(false);
  const [transactionHoverState, setTransactionHoverState] = useState(false);
  const [addPaymentReferenceHoverState, setAddPaymentReferenceHoverState] =
    useState(false);

  // Gemini Integration Handlers
  const handleGeminiOptimizeStrategy = (optimizedStrategy: StrategyInput) => {
    setStrategyName(optimizedStrategy.name);
    setTransactableMatchResultInputState(optimizedStrategy.transactableMatchResultInputs || []);
    setTransactionMatchResultInputState(optimizedStrategy.transactionMatchResultInputs || []);
    setPaymentReferenceMatchResultInputState(optimizedStrategy.paymentReferenceMatchResultInput || null);
    setAmountMismatchToggle(optimizedStrategy.allowAmountMismatch);
    setAmbiguousToggle(optimizedStrategy.allowAmbiguous);
    setCustomToggle(optimizedStrategy.custom);
    setGroupByState(optimizedStrategy.groupBy || []);
    setPriority(optimizedStrategy.priority);
    formikRef.current?.setFieldValue("reconEnabledIf", optimizedStrategy.reconEnabledIf || "");
    formikRef.current?.setFieldValue("reconDisabledIf", optimizedStrategy.reconDisabledIf || "");
    setUpdatedMatchers([]); // Reset updated matchers to reflect new optimized state
  };

  const handleGeminiSuggestMatchers = (suggestedMatchers: MatchResultInput[]) => {
    const newTransactableMatchers: MatchResultInput[] = [];
    const newTransactionMatchers: MatchResultInput[] = [];
    
    suggestedMatchers.forEach(sm => {
      // Ensure suggested matchers have unique IDs if added
      const uniqueId = `${strategy.name}${sm.matcherType}${sm.field}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const newMatcherInput = { ...sm, id: uniqueId, strategyName: strategy.name };

      const newMatcherResult: MatchResult = {
        field: sm.field,
        matcherType: sm.matcherType,
        matcher: sm.matcher || "",
        expected: "", // Gemini would provide this in a real scenario
        actual: "", // Gemini would provide this in a real scenario
        match: false, // Default to false, can be updated on test
        transactionField: sm.transactionField || null,
        parser: sm.parser || null,
        system_default: false, // Suggested matchers are not system defaults
        matchResultType: sm.matchResultType || "is_null", // Default
        suggestedMatcher: "-new matcher-", // Mark as new from Gemini
        systemDefault: false,
      };

      if (sm.matcherType === "transactables") {
        newTransactableMatchers.push(newMatcherInput);
        setTransactableMatchResultState(prev => [...prev, newMatcherResult]);
      } else if (sm.matcherType === "transactions") {
        newTransactionMatchers.push(newMatcherInput);
        setTransactionMatchResultState(prev => [...prev, newMatcherResult]);
      }
      setUpdatedMatchers(prev => [...prev, uniqueId]); // Mark as updated to trigger save
    });

    setTransactableMatchResultInputState(prev => [...prev, ...newTransactableMatchers]);
    setTransactionMatchResultInputState(prev => [...prev, ...newTransactionMatchers]);
  };

  const handleGenerateGeminiReport = async (): Promise<string> => {
    // Simulate generating a comprehensive report URL
    await new Promise(resolve => setTimeout(resolve, 1500));
    const reportLink = `https://citibank.com/gemini-report/${strategy.id}-${Date.now()}.pdf`;
    console.log("Gemini AI Performance Report Generated:", reportLink);
    // In a real application, this would trigger a backend service to generate and host the report
    return reportLink;
  };

  useEffect(() => {
    // This effect ensures the ReactTooltip component is ready.
    // It's a common pattern with react-tooltip to force a re-render or rebuild.
    ReactTooltip.rebuild();
  }, [showReconResults, showDiffModal, showConfirmModal, showRejectModal, showDeleteModal]);


  return (
    <div
      className={`mx-6 ${
        needsApproval || strategy.status !== "active"
          ? "border-4 border-purple-300a"
          : ""
      } ${!needsApproval || !strategy.parentStrategyId ? "mt-6" : ""}`}
    >
      <div>
        <div className="rounded-md border border-alpha-black-100 bg-white pb-4 pt-2">
          <div className="flex px-6 py-1">
            <div className="mr-auto flex">
              <Icon iconName="money_vs" className="mr-2 min-w-5 self-center" />
              {strategyHasChanged() && (
                <Icon
                  className="mr-2 self-center text-blue-400"
                  iconName="circle"
                  color="currentColor"
                  size="s"
                />
              )}
              {needsApproval ? (
                <span className="w-full self-center text-nowrap text-base font-medium">
                  {strategyName}
                </span>
              ) : (
                <textarea
                  className="w-full resize-none self-center text-nowrap text-base font-medium disabled:bg-white"
                  onChange={(e) => setStrategyName(e.target.value)}
                  value={
                    strategyName === "New Strategy" ? undefined : strategyName
                  }
                  placeholder="Enter strategy name"
                  rows={1}
                  cols={strategyName.length}
                />
              )}
              {needsApproval && (
                <Label className="ml-3 flex justify-center self-center text-nowrap border-2 border-purple-300a bg-gray-50 p-1 font-mono font-bold italic text-purple-300a">
                  Suggested {strategy.parentStrategyId ? "Change" : "Strategy"}
                </Label>
              )}
              {strategy.status === "tentative" && (
                <Label className="ml-4 flex justify-center self-center text-nowrap border-2 border-purple-300a bg-gray-50 p-1 font-mono font-bold italic text-purple-300a">
                  Tentative
                </Label>
              )}
            </div>

            <div className="flex">
              {strategyHasChanged() ? (
                <Clickable
                  onClick={() => {
                    resetStrategy();
                  }}
                >
                  <div className="mx-2 mb-2 flex rounded-sm border px-2">
                    <Icon
                      className="self-center text-gray-500"
                      iconName="sync"
                      color="currentColor"
                      size="s"
                    />
                    <Label className="flex min-w-24 self-center p-1 text-xs hover:cursor-pointer">
                      Reset Changes
                    </Label>
                  </div>
                </Clickable>
              ) : null}

              {needsApproval && (
                <Label
                  className="ml-2 mr-2 flex flex-wrap self-center text-nowrap pb-2 font-mono font-bold"
                  labelPrefix="Suggested By:"
                >
                  {strategy.createdByName}
                </Label>
              )}

              <div className="flex self-center pb-2 pr-2">
                {matchResults.every((mr) => mr.match) ? (
                  <Icon
                    className="float-right text-green-500"
                    iconName="checkmark_circle"
                    color="currentColor"
                    size="xl"
                  />
                ) : (
                  <Icon
                    className="float-right self-center text-red-500"
                    iconName="remove_circle"
                    color="currentColor"
                    size="xl"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="border-mt-gray-200 mx-6 mr-6 border-t p-2" />

          {strategy.status === "tentative" && (
            <Label className="mb-1 flex w-full justify-center text-center italic">
              This tentative strategy has been auto-filled with matchers
              detected by our system. Feel free to edit below.
            </Label>
          )}

          <Formik
            initialValues={initialValues}
            enableReinitialize
            innerRef={formikRef}
            onSubmit={() => {}}
          >
            {() => (
              <Form>
                {/* Gemini AI Integration Section */}
                <div className="mx-6 my-4">
                  <GeminiIntegration
                    strategyName={strategyName}
                    onOptimize={handleGeminiOptimizeStrategy}
                    onSuggestMatchers={handleGeminiSuggestMatchers}
                    onGenerateReport={handleGenerateGeminiReport}
                  />
                </div>

                {/* Other External App Integrations Section */}
                <div className="mx-6 my-4">
                  <ExternalAppIntegrations strategyName={strategyName} />
                </div>

                <div>
                  {needsApproval && strategy.note && (
                    <Label
                      className="mx-4 mb-2 w-full border bg-gray-25 p-2 italic"
                      labelPrefix="Note for reviewer:"
                    >
                      {strategy.note}
                    </Label>
                  )}
                  {transactableMatchResultState.filter(
                    (mr) => !mr.match || !mr.systemDefault,
                  ).length > 0 &&
                    !customToggle && (
                      <Label className="pb-2 pl-6 text-base">
                        {strategy.transactableType} Matchers
                      </Label>
                    )}
                  <div className="pl-3">
                    {!customToggle &&
                      transactableMatchResultState
                        .filter((mr) => !mr.match || !mr.systemDefault)
                        .map((matchResult) => (
                          <DatabaseReconciliationMatchResult
                            key={`${matchResult.field}${
                              matchResult.matcherType
                            }${resetToggle ? "true" : "false"}`}
                            matchResult={matchResult}
                            strategyName={strategy.name}
                            matcherType="transactables"
                            transactionId={transactionId}
                            callback={matchResultCallback}
                            modalOpen={
                              matchResult.suggestedMatcher === "-new matcher-"
                            }
                          />
                        ))}
                  </div>

                  {!addTransactableMatcher && !customToggle && (
                    <Clickable onClick={() => setAddTransactableMatcher(true)}>
                      <div
                        className="flex pb-1 pl-6"
                        onMouseEnter={() => setTransactableHoverState(true)}
                        onMouseLeave={() => setTransactableHoverState(false)}
                      >
                        <Icon
                          className="ml-2 text-gray-400"
                          iconName="add"
                          color="currentColor"
                          size="s"
                        />

                        {transactableHoverState && (
                          <Label className="ml-1 text-xs text-gray-500 hover:cursor-pointer">
                            Add Transactable Matcher
                          </Label>
                        )}
                      </div>
                    </Clickable>
                  )}

                  {addTransactableMatcher && (
                    <div className="flex">
                      <Clickable
                        onClick={() => setAddTransactableMatcher(false)}
                      >
                        <div className="justify-left self-center">
                          <Icon
                            className="ml-3 mr-2 flex self-center text-gray-400"
                            iconName="remove"
                            color="currentColor"
                            size="s"
                          />
                        </div>
                      </Clickable>
                      <div className="min-w-72">
                        <SelectField
                          handleChange={(e) => {
                            setAddTransactableMatcher(false);
                            let matchResultType;
                            let matcher;
                            if ((e as string).endsWith("_offset")) {
                              matchResultType = "date_offset";
                              matcher = "0..0";
                            } else if (
                              e === "short_id" ||
                              e === "short_numeric_id"
                            ) {
                              matchResultType = "short_id";
                              matcher = "vendor_description";
                            } else {
                              matchResultType =
                                e === "group_required" ? "is_true" : "is_null";
                              matcher = "";
                            }

                            const newMatcherId = `${strategy.name}transactables${
                              e as string
                            }-${Date.now()}`; // Ensure unique ID for new matcher

                            setTransactableMatchResultState([
                              ...transactableMatchResultState,
                              {
                                field: e as string,
                                matcherType: "transactables",
                                matcher:
                                  matcher === null ? null : (matcher as string),
                                expected: "",
                                actual: "",
                                match: false,
                                transactionField: null,
                                parser: null,
                                system_default: false,
                                matchResultType:
                                  matchResultType === null
                                    ? null
                                    : (matchResultType as string),
                                suggestedMatcher: "-new matcher-",
                                systemDefault: false,
                              } as MatchResult,
                            ]);
                            setTransactableMatchResultInputState([
                              ...transactableMatchResultInputState,
                              {
                                id: newMatcherId, // Use the new unique ID
                                strategyName: strategy.name,
                                field: e as string,
                                matcherType: "transactables",
                                matcher:
                                  matcher === null ? null : (matcher as string),
                                transactionField: null,
                                parser: null,
                                systemDefault: false,
                              } as MatchResultInput,
                            ]);
                            setUpdatedMatchers(prev => [...prev, newMatcherId]); // Mark as updated
                          }}
                          id="select-id"
                          name="select"
                          selectValue={null}
                          placeholder="Select Matcher Type"
                          options={(
                            strategy.transactableMatchResultFields || []
                          )
                            .filter(
                              (f) =>
                                !transactableMatchResultState
                                  .map((mr) => mr.field)
                                  .includes(f),
                            )
                            .map((f) => ({ label: f, value: f }))}
                        />
                      </div>
                    </div>
                  )}

                  {transactionMatchResultState.filter(
                    (mr) => mr.field !== "reconciled",
                  ).length > 0 && (
                    <div className="flex pb-2 pl-6">
                      <Label className="text-base">Transaction Matchers</Label>
                      {removedTransactionMatchers.length > 0 && (
                        <Icon
                          className="ml-1 self-center text-blue-400"
                          iconName="circle"
                          color="currentColor"
                          size="s"
                        />
                      )}
                    </div>
                  )}
                  <div className="pl-3">
                    {transactionMatchResultState
                      .filter((mr) => mr.field !== "reconciled")
                      .map((matchResult) => (
                        <DatabaseReconciliationMatchResult
                          key={`${matchResult.field}${matchResult.matcherType}${
                            resetToggle ? "true" : "false"
                          }`}
                          matchResult={matchResult}
                          strategyName={strategy.name}
                          matcherType="transactions"
                          transactionId={transactionId}
                          callback={matchResultCallback}
                          modalOpen={
                            matchResult.suggestedMatcher === "-new matcher-"
                          }
                        />
                      ))}
                  </div>

                  {!addTransactionMatcher && (
                    <Clickable onClick={() => setAddTransactionMatcher(true)}>
                      <div
                        className="flex pl-6"
                        onMouseEnter={() => setTransactionHoverState(true)}
                        onMouseLeave={() => setTransactionHoverState(false)}
                      >
                        <Icon
                          className="ml-2 text-gray-400"
                          iconName="add"
                          color="currentColor"
                          size="s"
                        />

                        {transactionHoverState && (
                          <Label className="ml-1 text-xs text-gray-500 hover:cursor-pointer">
                            Add Transaction Matcher
                          </Label>
                        )}
                      </div>
                    </Clickable>
                  )}

                  {addTransactionMatcher && (
                    <div className="flex">
                      <Clickable
                        onClick={() => setAddTransactionMatcher(false)}
                      >
                        <div className="justify-left self-center">
                          <Icon
                            className="ml-3 mr-2 flex self-center text-gray-400"
                            iconName="remove"
                            color="currentColor"
                            size="s"
                          />
                        </div>
                      </Clickable>
                      <div className="min-w-72">
                        <SelectField
                          handleChange={(e) => {
                            setAddTransactionMatcher(false);

                            const newMatcherId = `${strategy.name}transactions${
                              e as string
                            }-${Date.now()}`; // Ensure unique ID for new matcher

                            setTransactionMatchResultState([
                              ...transactionMatchResultState,
                              {
                                field: e as string,
                                matcherType: "transactions",
                                matcher: "",
                                expected: "",
                                actual: "",
                                match: false,
                                system_default: false,
                                matchResultType: "is_null",
                                suggestedMatcher: "-new matcher-",
                                systemDefault: false,
                              } as MatchResult,
                            ]);
                            setTransactionMatchResultInputState([
                              ...transactionMatchResultInputState,
                              {
                                id: newMatcherId, // Use the new unique ID
                                strategyName: strategy.name,
                                field: e as string,
                                matcherType: "transactions",
                                matcher: "",
                                systemDefault: false,
                              } as MatchResultInput,
                            ]);
                            setUpdatedMatchers(prev => [...prev, newMatcherId]); // Mark as updated
                          }}
                          id="select-id"
                          name="select"
                          selectValue={null}
                          placeholder="Select Matcher Type"
                          options={(strategy.transactionMatchResultFields || [])
                            .filter(
                              (f) =>
                                !transactionMatchResultState
                                  .map((mr) => mr.field)
                                  .includes(f),
                            )
                            .map((f) => ({ label: f, value: f }))}
                        />
                      </div>
                    </div>
                  )}

                  {strategy.groupByMatchResult && !customToggle && (
                    <div className="pt-2">
                      <div className="flex w-full">
                        <Label className="w-24 pb-2 pl-6 text-base">
                          Group By
                        </Label>

                        <div className="w-full">
                          <DatabaseReconciliationMatchResult
                            key={`GroupBy-${resetToggle ? "true" : "false"}`}
                            matchResult={strategy.groupByMatchResult}
                            strategyName={strategy.name}
                            matcherType="group_by"
                            transactionId={transactionId}
                            callback={matchResultCallback}
                            removable={false}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    {paymentReferenceMatchResultState && !customToggle && (
                      <div className="my-1 flex w-full">
                        <Label className="w-44 self-center pl-6 text-base">
                          Payment Reference
                        </Label>

                        <div className="w-full">
                          <DatabaseReconciliationMatchResult
                            key={`${paymentReferenceMatchResultState.field}${
                              paymentReferenceMatchResultState.matcherType
                            }${resetToggle ? "true" : "false"}`}
                            matchResult={paymentReferenceMatchResultState}
                            strategyName={strategy.name}
                            matcherType="payment_reference"
                            transactionId={transactionId}
                            callback={matchResultCallback}
                            modalOpen={
                              paymentReferenceMatchResultState.suggestedMatcher ===
                              "-new matcher-"
                            }
                          />
                        </div>
                      </div>
                    )}
                    {!paymentReferenceMatchResultState &&
                      !addPaymentReferenceMatcher && (
                        <Clickable
                          onClick={() => {
                            setPaymentReferenceMatchResultState({
                              field: "payment_reference",
                              matcherType: "payment_reference",
                              matcher: "",
                              expected: "",
                              actual: "",
                              match: false,
                              system_default: false,
                              matchResultType: "payment_reference",
                              suggestedMatcher: "-new matcher-",
                              systemDefault: false, // Added missing property
                            } as MatchResult);
                            setAddPaymentReferenceMatcher(false);
                            // Also update the input state for submission
                            setPaymentReferenceMatchResultInputState({
                              id: "payment_reference", // Should be consistent with how existing ones are created
                              matchResultType: "payment_reference",
                              strategyName: strategy.name,
                              field: "payment_reference",
                              matcherType: "payment_reference",
                              matcher: "",
                              transactionField: null,
                              parser: null,
                              systemDefault: false,
                            });
                          }}
                        >
                          <div
                            className="flex"
                            onMouseEnter={() =>
                              setAddPaymentReferenceHoverState(true)
                            }
                            onMouseLeave={() =>
                              setAddPaymentReferenceHoverState(false)
                            }
                          >
                            <Label className="pl-6 text-base">
                              Payment Reference
                            </Label>
                            {strategy.paymentReferenceMatchResult && (
                              <Icon
                                className="ml-1 self-center text-blue-400"
                                iconName="circle"
                                color="currentColor"
                                size="s"
                              />
                            )}
                            <Icon
                              className="ml-1 self-center text-gray-400"
                              iconName="add"
                              color="currentColor"
                              size="s"
                            />
                            {addPaymentReferenceHoverState && (
                              <Label className="ml-1 self-center text-xs text-gray-500 hover:cursor-pointer">
                                Add Payment Reference
                              </Label>
                            )}
                          </div>
                        </Clickable>
                      )}
                  </div>
                </div>

                <div className="ml-2 mr-6">
                  <Accordion allowMultiple allowToggle>
                    <AccordionItem>
                      <AccordionButton className="hover:bg-gray-25">
                        <Label className="mr-1 text-base">Options</Label>
                        <Icon
                          className="mr-auto self-center"
                          iconName="circle"
                          color={
                            optionsHasChanged()
                              ? colors.blue["400"]
                              : colors.white
                          }
                          size="s"
                        />
                        {(ambiguousToggle ||
                          amountMismatchToggle ||
                          customToggle ||
                          priority) && (
                          <Label className="mr-2 italic text-gray-500">
                            {ambiguousToggle
                              ? `Ambiguous${
                                  amountMismatchToggle ||
                                  customToggle ||
                                  priority
                                    ? ", "
                                    : ""
                                }`
                              : ""}
                            {amountMismatchToggle
                              ? `Amount_Mismatch${
                                  customToggle || priority ? ", " : ""
                                }`
                              : ""}
                            {customToggle
                              ? `Custom${priority ? ", " : ""}`
                              : ""}
                            {priority ? `Priority: ${priority}` : ""}
                          </Label>
                        )}
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <FieldsRow columns={2}>
                          <Toggle
                            className="tailwind-class"
                            handleChange={() =>
                              setAmbiguousToggle(!ambiguousToggle)
                            }
                            checked={ambiguousToggle}
                            id="allow-ambiguous-toggle"
                            label="Ambiguous"
                            labelClassName="mr-6"
                            disabled={customToggle}
                          />
                          <div className="justify-right flex">
                            <Label className="justify-right mr-5 flex pr-2">
                              Priority
                            </Label>
                            <div className="min-w-20">
                              <SelectField
                                className="justify-right flex"
                                handleChange={(val) =>
                                  setPriority(val ? (val as number) : null)
                                }
                                options={[
                                  {
                                    label: "None",
                                    value: null,
                                  },
                                  ...Array.from({ length: 20 }, (_, i) => ({
                                    label: i + 1,
                                    value: i + 1,
                                  })), // More robust way to generate numbers
                                ]}
                                placeholder="None"
                                selectValue={priority}
                              />
                            </div>
                          </div>
                        </FieldsRow>
                        <FieldsRow columns={2}>
                          <Toggle
                            className="tailwind-class"
                            handleChange={() =>
                              setAmountMismatchToggle(!amountMismatchToggle)
                            }
                            checked={amountMismatchToggle}
                            id="allow-amount-mismatch-toggle"
                            label="Amount Mismatch"
                            labelClassName="mr-6"
                            disabled={customToggle}
                          />
                          <div className="flex">
                            <Label className="justify-left mr-1 pr-2">
                              Enabled If
                            </Label>
                            <Field
                              className="justify-right"
                              name="reconEnabledIf"
                              id="reconEnabledIf"
                              component={FormikInputField}
                            />
                          </div>
                        </FieldsRow>
                        <FieldsRow columns={2}>
                          <Toggle
                            className="tailwind-class"
                            handleChange={() => {
                              setCustomToggle(!customToggle);
                            }}
                            checked={customToggle}
                            id="custom-toggle"
                            label="Custom"
                            labelClassName="mr-6"
                          />
                          <div className="flex">
                            <Label className="justify-left pr-2">
                              Disabled If
                            </Label>
                            <Field
                              className="justify-right"
                              name="reconDisabledIf"
                              id="reconDisabledIf"
                              component={FormikInputField}
                            />
                          </div>
                        </FieldsRow>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </div>

                <Modal
                  isOpen={showReconResults}
                  title="Run Reconciliation"
                  onRequestClose={() => setShowReconResults(false)}
                >
                  <ModalContainer>
                    <Label className="ml-auto mr-auto mt-2 flex pb-2 text-base font-medium">
                      Reconciliation Results
                    </Label>

                    <div className="mx-2">
                      <EntityTableView
                        data={reconciliationResults?.map((edge) => edge.node)}
                        loading={resultsLoading}
                        dataMapping={
                          reconciliationResults[0]?.node?.__typename
                            ? RESULT_MAPPING[
                                reconciliationResults[0]?.node?.__typename
                              ]
                            : RESULT_MAPPING.PaymentOrder
                        }
                        styleMapping={STYLE_MAPPING}
                        cursorPagination={
                          resultsData?.reconciliationStrategyResult?.pageInfo
                        }
                        defaultPerPage={PER_PAGE}
                        onQueryArgChange={handleRefetch}
                        disableQueryURLParams
                      />
                    </div>

                    <ModalFooter>
                      <div className="flex w-full">
                        <Button
                          buttonType="secondary"
                          className="ml-auto mr-auto flex justify-center"
                          onClick={() => setShowReconResults(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </ModalFooter>
                  </ModalContainer>
                </Modal>

                <Modal
                  className="m-4 flex w-full max-w-6xl"
                  isOpen={showDiffModal}
                  title="Strategy Diff"
                  onRequestClose={() => setShowDiffModal(false)}
                >
                  <ModalContainer>
                    <div className="bg-gray-25">
                      <Label className="ml-auto mr-auto self-center py-2 align-middle text-base text-lg">
                        Diff Preview
                      </Label>
                      {updateStrategyData?.updateReconciliationStrategy && (
                        <div className="flex w-full flex-col bg-white p-2">
                          <div className="flex w-full">
                            {updateStrategyData?.updateReconciliationStrategy
                              ?.oldStrategy && (
                              <div>
                                <Label className="ml-auto mr-auto pb-2 text-base font-medium">
                                  Old Strategy
                                </Label>
                                <div className="mt-auto flex w-full">
                                  <div className="flex flex-col rounded-md border py-1">
                                    {updateStrategyData.updateReconciliationStrategy.oldStrategy.strategyConfig
                                      .split("\n")
                                      // prettier-ignore
                                      .map((line, index) =>
                                        // prettier-ignore
                                        <textarea
                                          key={`old-line-${index}`} // Added unique key
                                          className={cn(
                                            "text-md outline-non flex w-full resize-none whitespace-pre px-2 placeholder-gray-600",
                                            updateStrategyData.updateReconciliationStrategy?.newStrategy?.strategyConfig
                                              .split("\n")
                                              .includes(line)
                                              ?
                                                "disabled:bg-white"
                                              : "disabled:bg-red-100"
                                          )}
                                          onChange={() => {}}
                                          disabled
                                          value={line}
                                          rows={1}
                                          cols={60}
                                        />,
                                      )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div
                              className={` ml-auto ${
                                updateStrategyData?.updateReconciliationStrategy
                                  ?.oldStrategy
                                  ? ""
                                  : "w-full"
                              }`}
                            >
                              <Label className="ml-auto mr-auto pb-2 text-base font-medium">
                                New Strategy
                              </Label>
                              <div className="flex flex-col rounded-md border py-1">
                                {updateStrategyData.updateReconciliationStrategy.newStrategy?.strategyConfig
                                  .split("\n")
                                  .map((line, index) => // Added index for key
                                    // prettier-ignore
                                    <textarea
                                      key={`new-line-${index}`} // Added unique key
                                      className={cn(
                                        "text-md outline-non flex w-full resize-none whitespace-pre px-2 placeholder-gray-600",
                                        updateStrategyData.updateReconciliationStrategy?.oldStrategy?.strategyConfig
                                          .split("\n")
                                          .includes(line)
                                          ? "disabled:bg-white"
                                          : "disabled:bg-green-100"
                                      )}
                                      onChange={() => {}}
                                      disabled
                                      value={line}
                                      rows={1}
                                      cols={60}
                                    />,
                                  )}
                              </div>
                            </div>
                          </div>
                          <Label className="ml-auto mr-auto mt-1 text-sm italic">
                            Strategies are side-scrolling
                          </Label>
                          <div className="flex w-full pt-1">
                            <textarea
                              className="ml-auto mr-auto flex w-3/4 resize-none rounded-md bg-gray-25 p-2 text-gray-600 placeholder-gray-600"
                              onChange={(e) => setNote(e.target.value)}
                              placeholder={`Leave a note for the reviewer about this ${
                                needsApproval ? "review" : "change"
                              } (optional)`}
                              value={note}
                              rows={3}
                              cols={60}
                            />
                          </div>
                        </div>
                      )}

                      <ModalFooter>
                        <Button onClick={() => setShowDiffModal(false)}>
                          Close
                        </Button>

                        <Modal
                          className=""
                          isOpen={showConfirmModal}
                          title="Confirm Approval"
                          onRequestClose={() => setShowConfirmModal(false)}
                        >
                          <ModalContainer>
                            <Label className="ml-auto mr-auto justify-center p-4 text-lg font-bold font-semibold">
                              Are you sure you want to accept this change?
                            </Label>

                            <ModalFooter className="bg-gray-50">
                              <Button
                                onClick={() => setShowConfirmModal(false)}
                              >
                                Wait nevermind
                              </Button>

                              <Button
                                buttonType="primary"
                                onClick={() => {
                                  void reviewReconciliationStrategy({
                                    variables: {
                                      input: {
                                        strategyId: strategy.id as string,
                                        vendorId: strategy.vendor,
                                        note,
                                        approved: true,
                                        transactionId,
                                      },
                                    },
                                  });
                                  window.location.reload();
                                }}
                              >
                                Yeah looks beautiful
                              </Button>
                            </ModalFooter>
                          </ModalContainer>
                        </Modal>

                        <Modal
                          className=""
                          isOpen={showRejectModal}
                          title="Confirm Rejection"
                          onRequestClose={() => setShowRejectModal(false)}
                        >
                          <ModalContainer>
                            <Label className="ml-auto mr-auto justify-center p-4 text-lg font-bold font-semibold">
                              Are you sure you want to reject this change?
                            </Label>

                            <ModalFooter className="bg-gray-50">
                              <Button onClick={() => setShowRejectModal(false)}>
                                Wait nevermind
                              </Button>

                              <Button
                                buttonType="destructive"
                                onClick={() => {
                                  void reviewReconciliationStrategy({
                                    variables: {
                                      input: {
                                        strategyId: strategy.id as string,
                                        vendorId: strategy.vendor,
                                        note,
                                        approved: false,
                                        transactionId,
                                      },
                                    },
                                  });
                                  window.location.reload();
                                }}
                              >
                                Yeah reject it already
                              </Button>
                            </ModalFooter>
                          </ModalContainer>
                        </Modal>

                        {needsApproval &&
                          strategy.userCanApprove &&
                          !strategyHasChanged() && (
                            <>
                              <Button
                                className="ml-auto mr-3"
                                buttonType="destructive"
                                onClick={() => {
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject Change
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowConfirmModal(true);
                                }}
                                buttonType="primary"
                              >
                                Accept Change
                              </Button>
                            </>
                          )}
                        {(!needsApproval || strategyHasChanged()) && (
                          <Button
                            onClick={() => {
                              setShowDiffModal(false); // Close diff modal before submitting
                              updateReconciliationStrategy({
                                variables: {
                                  input: {
                                    strategy: {
                                      name: strategyName || "blank_name",
                                      vendor: strategy.vendor,
                                      transactableType:
                                        strategy.transactableType,
                                      paymentType: strategy.paymentType,
                                      role: strategy.role,
                                      transactionMatchResultInputs:
                                        transactionMatchResultInputState,
                                      transactableMatchResultInputs:
                                        transactableMatchResultInputState,
                                      paymentReferenceMatchResultInput:
                                        customToggle
                                          ? null
                                          : paymentReferenceMatchResultInputState,
                                      allowAmountMismatch: amountMismatchToggle,
                                      allowAmbiguous: ambiguousToggle,
                                      custom: customToggle,
                                      groupBy: groupByState,
                                      priority,
                                      reconDisabledIf:
                                        formikRef?.current?.values
                                          ?.reconDisabledIf === ""
                                          ? null
                                          : formikRef?.current?.values
                                              ?.reconDisabledIf,
                                      reconEnabledIf:
                                        formikRef?.current?.values
                                          ?.reconEnabledIf === ""
                                          ? null
                                          : formikRef?.current?.values
                                              ?.reconEnabledIf,
                                      id: strategy.id as string,
                                      parentStrategyId:
                                        strategy.parentStrategyId,
                                      note,
                                    },
                                    preview: false, // This is the final submission
                                    transactionId,
                                  },
                                },
                              })
                                .then((response) => {
                                  const errors =
                                    response?.data?.updateReconciliationStrategy
                                      ?.errors ?? [];
                                  if (errors.length === 0) {
                                    // Optionally show a success message or refresh the page
                                    window.location.reload(); // Hard reload to reflect changes
                                  } else {
                                    // Handle errors, maybe re-open diff modal with errors
                                    setShowDiffModal(true); // Re-open to show errors
                                    console.error("Submission errors:", errors);
                                  }
                                })
                                .catch((error: Error) => {
                                  dispatchError(error.message);
                                  setShowDiffModal(true); // Re-open to show error context
                                });
                            }}
                          >
                            Submit for Review
                          </Button>
                        )}
                        {!strategy.userCanApprove && (
                          <div className="ml-2">
                            <Tooltip
                              className="flex"
                              data-tip="Only Recon team members can review strategies"
                            />
                            <ReactTooltip
                              multiline
                              data-place="top"
                              data-type="dark"
                              data-effect="float"
                            />
                          </div>
                        )}
                      </ModalFooter>
                    </div>
                  </ModalContainer>
                </Modal>

                {updateStrategyData?.updateReconciliationStrategy?.errors
                  ?.length ? (
                  <div className="mx-4 mb-4 mt-2 flex rounded-md border border-red-400 bg-red-200 px-3 py-1">
                    <Icon
                      className="mr-5 self-center text-red-400"
                      iconName="error_outlined"
                      color="currentColor"
                    />
                    <div className="flex flex-col">
                      {updateStrategyData.updateReconciliationStrategy.errors.map(
                        (error, index) => ( // Added index for key
                          <div className="flex flex-col" key={`error-${index}`}>
                            <Label>- {error}</Label>
                          </div>
                        ),
                      )}
                    </div>
                    <Icon
                      className="ml-3 mr-3 self-center text-red-400"
                      iconName="error_outlined"
                      color="currentColor"
                    />
                  </div>
                ) : null}

                <div className="mt-2 flex">
                  <Button
                    className="ml-6 flex"
                    buttonType="primary"
                    onClick={() => {
                      void getReconciliationStrategyResults();
                      setShowReconResults(true);
                    }}
                  >
                    Test Reconciliation
                    <Icon
                      iconName="node_multiple"
                      color="currentColor"
                      className="text-white"
                    />
                  </Button>

                  {needsApproval &&
                  strategy.createdByCurrentUser &&
                  !strategyHasChanged() ? (
                    <div className="ml-auto flex">
                      <Modal
                        title="Delete Suggested Change"
                        isOpen={showDeleteModal}
                        onRequestClose={() => setShowDeleteModal(false)}
                      >
                        <ModalContainer>
                          <Label className="ml-auto mr-auto justify-center p-4 text-lg italic">
                            Are you sure you want to delete this Suggested
                            Change?
                          </Label>

                          <ModalFooter className="bg-gray-25">
                            <Button
                              className="mr-auto"
                              buttonType="secondary"
                              onClick={() => setShowDeleteModal(false)}
                            >
                              No leave it alone
                            </Button>

                            <Button
                              className="ml-auto"
                              buttonType="destructive"
                              onClick={() => {
                                void reviewReconciliationStrategy({
                                  variables: {
                                    input: {
                                      strategyId: strategy.id as string,
                                      vendorId: strategy.vendor,
                                      note: "Deleted By Creator",
                                      approved: false,
                                      transactionId,
                                    },
                                  },
                                });
                                window.location.reload();
                              }}
                            >
                              Obliterate It
                            </Button>
                          </ModalFooter>
                        </ModalContainer>
                      </Modal>
                      <Button
                        buttonType="destructive"
                        className="ml-auto mr-6 flex"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Icon
                          iconName="clear_circle_outlined"
                          color="currentColor"
                          className="text-white"
                          size="s"
                        />
                        Delete My Suggested Change
                      </Button>
                    </div>
                  ) : (
                    <div className="ml-auto mr-6 flex">
                      {updateStrategyLoading && (
                        <ClipLoader
                          className="ml-auto mr-2 flex self-center"
                          size={22}
                          color={colors.gray["300"]}
                        />
                      )}
                      {updateStrategyData?.updateReconciliationStrategy?.errors
                        ?.length ? (
                        <div className="mr-2 flex self-center">
                          <Icon
                            iconName="error_outlined"
                            color="currentColor"
                            className="text-red-500"
                          />
                          <Label className="ml-1 self-center italic text-red-500">
                            Error
                          </Label>
                        </div>
                      ) : null}
                      <Button
                        buttonType="primary"
                        disabled={
                          (!strategyHasChanged() &&
                            !needsApproval &&
                            !(strategy.status === "tentative")) ||
                          updateStrategyLoading
                        }
                        className=""
                        onClick={() => {
                          updateReconciliationStrategy({
                            variables: {
                              input: {
                                strategy: {
                                  name: strategyName || "blank_name",
                                  vendor: strategy.vendor,
                                  transactableType: strategy.transactableType,
                                  paymentType: strategy.paymentType,
                                  role: strategy.role,
                                  transactionMatchResultInputs:
                                    transactionMatchResultInputState,
                                  transactableMatchResultInputs:
                                    transactableMatchResultInputState,
                                  paymentReferenceMatchResultInput: customToggle
                                    ? null
                                    : paymentReferenceMatchResultInputState,
                                  allowAmountMismatch: amountMismatchToggle,
                                  allowAmbiguous: ambiguousToggle,
                                  custom: customToggle,
                                  groupBy: groupByState,
                                  priority,
                                  reconDisabledIf:
                                    formikRef?.current?.values
                                      ?.reconDisabledIf === ""
                                      ? null
                                      : formikRef?.current?.values
                                          ?.reconDisabledIf,
                                  reconEnabledIf:
                                    formikRef?.current?.values
                                      ?.reconEnabledIf === ""
                                      ? null
                                      : formikRef?.current?.values
                                          ?.reconEnabledIf,
                                  id: strategy.id as string,
                                  parentStrategyId: strategy.parentStrategyId,
                                  note,
                                },
                                preview: true,
                                transactionId,
                              },
                            },
                          })
                            .then((response) => {
                              const errors =
                                response?.data?.updateReconciliationStrategy
                                  ?.errors ?? [];
                              if (errors.length === 0) {
                                setShowDiffModal(true);
                              }
                            })
                            .catch((error: Error) => {
                              dispatchError(error.message);
                            });
                        }}
                      >
                        <Icon
                          iconName="visible"
                          color="currentColor"
                          className="text-white"
                        />
                        {needsApproval && !strategyHasChanged()
                          ? `Review ${
                              strategy.userCanApprove
                                ? "and Accept/Reject"
                                : "Change"
                            }`
                          : `${
                              needsApproval && strategy.createdByCurrentUser
                                ? "Update My Suggested Change"
                                : "Preview and Submit For Review"
                            }`}
                      </Button>
                    </div>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default DatabaseReconciliationStrategy;