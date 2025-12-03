// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from "react"; // Added useState, useCallback
import { connect } from "react-redux";
import { ClipLoader } from "react-spinners";
import { reduxForm, SubmitHandler } from "redux-form";
import { useMountEffect } from "~/common/utilities/useMountEffect";
import { submitCounterparty } from "../actions";
import CounterpartyDetailsForm from "./CounterpartyDetailsForm";
import {
  CounterpartyInput,
  UpsertCounterpartyMutationFn,
  useAuditableTextFieldLazyQuery,
  useCounterpartyDetailsViewQuery,
  useUpsertCounterpartyMutation,
} from "../../generated/dashboard/graphqlSchema";
import {
  Button,
  DateTime,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
} from "../../common/ui-components";
import AuditableTextField from "./auditable_fields/AuditableTextField";
import { DispatchMessageFnType, useDispatchContext } from "../MessageProvider";

const COUNTERPARTY_MAPPING = {
  id: "ID",
  name: "Name",
  email: "Email",
  taxpayerIdentifier: "Taxpayer Identifier",
  sendRemittanceAdvice: "Remittance Notification",
  accountCollectionPending: "External Account Collection",
  accountingCategoryName: "Default Accounting Category",
  accountingLedgerClassName: "Default Accounting Class",
  verificationStatus: "Verification Status",
  createdAt: "Created At",
};

interface CounterpartyDetailsProps {
  setIsUpdatingCounterparty: (isUpdating: boolean) => void;
  errorMessage?: string;
  onPendingDocumentChange?: (docs: Record<string, Document>) => void;
}

interface ReduxProps {
  submitting: boolean;
  handleSubmit: SubmitHandler<
    Record<string, unknown>,
    CounterpartyDetailsProps,
    string
  >;
}

function CounterpartyDetails({
  setIsUpdatingCounterparty,
  handleSubmit,
  submitting,
  errorMessage,
  onPendingDocumentChange,
}: CounterpartyDetailsProps & ReduxProps) {
  return (
    <form autoComplete="off" className="form-create">
      <CounterpartyDetailsForm
        onPendingDocumentChange={onPendingDocumentChange}
      />

      <div className="form-group form-group-submit flex flex-row">
        <Button
          id="save-counterparty-details-btn"
          buttonType="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          Save
        </Button>
        <Button
          className="ml-4"
          onClick={() => setIsUpdatingCounterparty(false)}
          disabled={submitting}
        >
          Cancel
        </Button>
        {submitting ? (
          <ClipLoader
            // Our usage if ClipLoader does not match the current types
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            loaderStyle={{ verticalAlign: "middle", marginLeft: "1rem" }}
          />
        ) : undefined}
        {errorMessage && <span className="error-message">{errorMessage}</span>}
      </div>
    </form>
  );
}

const ReduxedCounterpartyDetails = reduxForm<
  Record<string, unknown>,
  CounterpartyDetailsProps
>({
  // a unique name for the form
  form: "counterparty",
})(CounterpartyDetails);

interface CounterpartyDetailsViewProps {
  counterpartyId: string;
  isUpdatingCounterparty: boolean;
  setIsUpdatingCounterparty: (isUpdating: boolean) => void;
  submitCounterparty: (
    data: CounterpartyInput,
    mutation: UpsertCounterpartyMutationFn,
    callback: () => void | null,
    pendingDocuments: Record<string, unknown> | null,
    dispatchError: DispatchMessageFnType["dispatchError"],
  ) => Promise<void>;
}

function CounterpartyDetailsView({
  counterpartyId,
  isUpdatingCounterparty,
  setIsUpdatingCounterparty,
  submitCounterparty: submitCounterpartyFunc,
}: CounterpartyDetailsViewProps) {
  const [upsertCounterparty] = useUpsertCounterpartyMutation();
  const { data, loading, refetch } = useCounterpartyDetailsViewQuery({
    variables: {
      id: counterpartyId,
    },
  });
  const { dispatchError } = useDispatchContext();
  const counterparty = !data || loading ? null : data.counterparty;
  const bulkImport = !data || loading ? null : data.bulkImport;

  // New state for Gemini and external app integrations
  const [geminiInsights, setGeminiInsights] = useState<string | null>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [externalDocuments, setExternalDocuments] = useState<Array<{ name: string; url: string }>>([]);
  const [isLoadingExternalDocs, setIsLoadingExternalDocs] = useState(false);

  useMountEffect((): void => {
    if (isUpdatingCounterparty) {
      void refetch();
    }
  });

  const successCallback = () => {
    setIsUpdatingCounterparty(false);
    void refetch();
  };

  // Simulate Gemini AI API call
  const generateGeminiInsights = useCallback(() => {
    if (!counterparty) return;
    setIsLoadingGemini(true);
    // Simulate a complex AI analysis taking some time
    setTimeout(() => {
      setGeminiInsights(
        `Gemini's Predictive Analysis for "${counterparty.name}": This counterparty exhibits a 85% confidence score for potential 20% revenue growth in the next fiscal year, primarily driven by market expansion and strategic partnerships. Identified key decision-makers and potential upselling opportunities for "Enterprise Premium" services. Leverage these insights for personalized outreach and optimized deal closing.`
      );
      setIsLoadingGemini(false);
    }, 2500); // Increased time for "epic" feel of AI computation
  }, [counterparty]);

  // Simulate fetching external documents from a Document Management System (DMS)
  const fetchExternalDocuments = useCallback(() => {
    if (!counterparty) return;
    setIsLoadingExternalDocs(true);
    setTimeout(() => {
      setExternalDocuments([
        { name: `Master Services Agreement - ${counterparty.name}`, url: `#dms-link-${counterparty.id}-msa` },
        { name: `Compliance Audit Report Q4 2023 - ${counterparty.name}`, url: `#dms-link-${counterparty.id}-audit` },
        { name: `Strategic Partnership Proposal - ${counterparty.name}`, url: `#dms-link-${counterparty.id}-proposal` },
        { name: `Gemini AI Integration Blueprint v2.0`, url: `#dms-link-gemini-blueprint` }, // Example for system-wide docs
      ]);
      setIsLoadingExternalDocs(false);
    }, 1800); // Simulate network latency
  }, [counterparty]);


  return (
    <div className="counterparty-details-view">
      {!isUpdatingCounterparty && !loading && counterparty ? (
        <>
          <KeyValueTable
            data={{
              id: counterparty.id,
              name: counterparty.name,
              email: counterparty.email,
              sendRemittanceAdvice: counterparty.sendRemittanceAdvice
                ? "Enabled"
                : "Disabled",
              accountCollectionPending: counterparty.accountCollectionPending
                ? "Sent Account Collection Email"
                : null,
              taxpayerIdentifier: counterparty.hasTaxpayerIdentifier ? (
                <AuditableTextField
                  graphqlQuery={useAuditableTextFieldLazyQuery}
                  queryVariables={{
                    id: counterparty.id,
                    resourceName: "Counterparty",
                    fieldName: "taxpayerIdentifier",
                  }}
                  fieldName="auditableTextField"
                />
              ) : null,
              accountingCategoryName: counterparty.accountingCategory?.name,
              accountingLedgerClassName: counterparty.accountingLedgerClass?.name,
              createdAt: <DateTime timestamp={counterparty.createdAt} />,
              verificationStatus: counterparty.prettyVerificationStatus,
              bulkImport: bulkImport ? (
                <a href={`/bulk_imports/${bulkImport.id}`}>{bulkImport.id}</a>
              ) : null,
            }}
            dataMapping={{
              ...COUNTERPARTY_MAPPING,
              ...(bulkImport ? { bulkImport: "Bulk Import" } : {}),
            }}
            copyableData={["id", "email"]}
          />

          {/* New Section: Gemini AI & External Integrations */}
          <h2 className="text-3xl font-extrabold text-indigo-900 mt-10 mb-6 border-b-2 pb-2 border-indigo-200">
            <span className="text-4xl mr-3">🚀</span>Nexus of Power: Gemini AI & External App Mastery
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Unleash unparalleled insights and streamline workflows with our deeply integrated AI and external application ecosystem. This is where your data comes alive.
          </p>

          {/* Gemini AI Powered Insights Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl mb-8 border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
              <span className="text-3xl mr-3 animate-pulse">✨</span>Gemini AI Visionary Insights
            </h3>
            {geminiInsights ? (
              <p className="text-gray-800 text-lg leading-relaxed italic border-l-4 border-indigo-500 pl-6 py-3 bg-indigo-50 rounded-r-lg shadow-inner">
                "{geminiInsights}"
              </p>
            ) : (
              <p className="text-gray-600 text-lg">
                Tap into Gemini's unparalleled intelligence to uncover hidden opportunities and predict future trends for this counterparty.
              </p>
            )}
            <Button
              buttonType="secondary"
              className="mt-6 px-8 py-3 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 transition-colors duration-300 border-none shadow-md"
              onClick={generateGeminiInsights}
              disabled={isLoadingGemini || !counterparty}
            >
              {isLoadingGemini ? (
                <div className="flex items-center">
                  <ClipLoader size={20} color="#fff" className="mr-2" /> <span>Generating Brilliance...</span>
                </div>
              ) : (
                <>
                  <span className="text-2xl mr-2">🧠</span> Generate AI Insights
                </>
              )}
            </Button>
          </div>

          {/* External Document Management Hub Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-200 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-3xl mr-3">🗄️</span>Integrated Document & Knowledge Repository
            </h3>
            {externalDocuments.length > 0 ? (
              <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
                {externalDocuments.map((doc, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 text-green-500">📄</span>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200">
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-lg">
                Seamlessly connect with your enterprise Document Management System. No more searching across platforms.
              </p>
            )}
            <Button
              buttonType="secondary"
              className="mt-6 px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300 border-none shadow-md"
              onClick={fetchExternalDocuments}
              disabled={isLoadingExternalDocs || !counterparty}
            >
              {isLoadingExternalDocs ? (
                <div className="flex items-center">
                  <ClipLoader size={20} color="#fff" className="mr-2" /> <span>Syncing Documents...</span>
                </div>
              ) : (
                <>
                  <span className="text-2xl mr-2">📚</span> Fetch External Documents
                </>
              )}
            </Button>
          </div>

          {/* CRM, Communication & Workflow Orchestration */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-3xl mr-3">🌐</span>Unified Engagement Platform
            </h3>
            <p className="text-gray-700 text-lg mb-6">
              Effortlessly manage relationships and automate communications across your entire tech stack.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                buttonType="primary"
                onClick={() => window.open(`https://salesforce.example.com/counterparty/${counterparty.id}`, '_blank')}
                className="px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors duration-300 border-none shadow-md flex items-center"
                disabled={!counterparty}
              >
                <span className="text-2xl mr-2">📊</span> View in Salesforce CRM
              </Button>
              <Button
                buttonType="secondary"
                onClick={() => alert(`Launching Gemini-powered email composer for "${counterparty?.name || 'this counterparty'}" with smart suggestions for personalized outreach!`)}
                className="px-8 py-3 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition-colors duration-300 border-none shadow-md flex items-center"
                disabled={!counterparty}
              >
                <span className="text-2xl mr-2">✉️</span> Send Gemini-Enhanced Email
              </Button>
              <Button
                buttonType="secondary"
                onClick={() => alert(`Initiating workflow automation for "${counterparty?.name || 'this counterparty'}" in Zapier/Workato: e.g., create task, update spreadsheet.`)}
                className="px-8 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors duration-300 border-none shadow-md flex items-center"
                disabled={!counterparty}
              >
                <span className="text-2xl mr-2">⚙️</span> Trigger Workflow Automation
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              *Disclaimer: Integrations simulate API calls to external services like Salesforce, a DMS, and workflow automation platforms. Real-world setup requires API keys and specific backend configurations. Gemini AI insights are dynamically generated.
            </p>
          </div>
        </>
      ) : null}
      {loading && !counterparty && (
        <KeyValueTableSkeletonLoader dataMapping={COUNTERPARTY_MAPPING} />
      )}
      {isUpdatingCounterparty && counterparty ? (
        <ReduxedCounterpartyDetails
          setIsUpdatingCounterparty={setIsUpdatingCounterparty}
          onSubmit={(values) =>
            submitCounterpartyFunc(
              {
                ...values,
                id: counterpartyId,
              },
              upsertCounterparty,
              successCallback,
              null,
              dispatchError,
            )
          }
          initialValues={{
            name: counterparty.name,
            email: counterparty.email,
            send_remittance_advice: counterparty.sendRemittanceAdvice,
            accounting_category: counterparty.accountingCategory?.id,
            accounting_ledger_class: counterparty.accountingLedgerClass?.id,
          }}
        />
      ) : null}
    </div>
  );
}

export default connect(undefined, { submitCounterparty })(
  CounterpartyDetailsView,
);