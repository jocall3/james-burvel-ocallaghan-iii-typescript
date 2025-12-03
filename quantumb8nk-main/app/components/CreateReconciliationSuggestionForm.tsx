// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { ApolloQueryResult } from "@apollo/client";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import {
  StrategiesQuery,
  useCreateReconciliationSuggestionMutation,
  BatchTypeEnum,
} from "../../generated/dashboard/graphqlSchema";
import useErrorBanner from "../../common/utilities/useErrorBanner";
import {
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
} from "../../common/formik";
import { Button, FieldGroup, Label } from "../../common/ui-components";
import FileTransferBatchTotalsView from "./FileTransferBatchTotalsView";

export interface Props {
  transactionId: string;
  refetchStrategies: () => Promise<ApolloQueryResult<StrategiesQuery>>;
}

const validate = Yup.object({
  transactableId: Yup.string().required("Transactable ID is required"),
  transactableType: Yup.string().required("Transactable type is required"),
});

const TRANSACTABLE_OPTIONS = [
  { label: "Payment Order", value: "PaymentOrder" },
  { label: "Incoming Payment Detail", value: "IncomingPaymentDetail" },
  { label: "Return", value: "Return" },
  { label: "Reversal", value: "Reversal" },
  { label: "Paper Item", value: "PaperItem" },
  { label: "Payment Order Batch", value: "PaymentOrderBatch" },
];

interface GeminiSuggestedReconciliation {
  transactableType: string;
  transactableId: string;
}

export default function CreateReconciliationSuggestionForm({
  transactionId,
  refetchStrategies,
}: Props) {
  const [createReconciliationSuggestion] =
    useCreateReconciliationSuggestionMutation({
      refetchQueries: ["ReconciliationSuggestionsView"],
    });

  const flashError = useErrorBanner();

  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiSuggestion, setGeminiSuggestion] =
    useState<GeminiSuggestedReconciliation | null>(null);

  const batchTypeFromTransactableType = (
    transactableType: string | undefined,
  ): BatchTypeEnum | undefined => {
    if (transactableType != null) {
      switch (transactableType) {
        case "PaymentOrderBatch":
          return BatchTypeEnum.PaymentOrderBatch;
        case "ReturnReport":
          return BatchTypeEnum.ReturnReport;
        case "ReversalBatch":
          return BatchTypeEnum.ReversalBatch;
        default:
          return undefined;
      }
    }

    return undefined;
  };

  const showBatchSummary = (
    transactableId: string,
    transactableType: string,
  ) => {
    const batchType = batchTypeFromTransactableType(transactableType);
    if (batchType === undefined) {
      return null;
    }

    return (
      <div>
        <Label id="batchPreview">Batch Summary</Label>
        <FileTransferBatchTotalsView
          batchId={transactableId}
          batchType={batchType}
        />
      </div>
    );
  };

  const fetchGeminiSuggestion = async (currentTransactionId: string) => {
    setIsGeminiLoading(true);
    setGeminiSuggestion(null);

    try {
      // Simulate an API call to a Gemini-powered backend service
      // In a real application, this would involve a robust AI model
      // analyzing the transaction and proposing a reconciliation.
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate network & AI processing delay

      // Mock AI-generated suggestions based on a simplified logic
      let suggestedType: string;
      let suggestedId: string;

      if (currentTransactionId.includes("batch")) {
        suggestedType = "PaymentOrderBatch";
        suggestedId = `GEMINI-BATCH-${Math.floor(Math.random() * 1000000)}`;
      } else if (currentTransactionId.includes("return")) {
        suggestedType = "Return";
        suggestedId = `GEMINI-RET-${Math.floor(Math.random() * 1000000)}`;
      } else {
        suggestedType = "PaymentOrder";
        suggestedId = `GEMINI-PO-${Math.floor(Math.random() * 1000000)}`;
      }

      setGeminiSuggestion({
        transactableType: suggestedType,
        transactableId: suggestedId,
      });
    } catch (error) {
      flashError(
        "Gemini AI encountered an issue: " + (error as Error).message,
      );
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const onSubmit = (transactableId: string, transactableType: string) => {
    createReconciliationSuggestion({
      variables: {
        input: {
          transactionId,
          transactableType,
          transactableId,
        },
      },
    })
      .then((result) => {
        if (result.errors) {
          flashError(
            "Reconciliation failed due to a system error. Please try again.",
          );
        } else if (
          result.data?.createReconciliationSuggestion?.errors?.length
        ) {
          flashError(result.data.createReconciliationSuggestion.errors[0]);
        } else {
          void refetchStrategies();
          setGeminiSuggestion(null); // Clear AI suggestion upon successful submission
        }
      })
      .catch((err: Error) => {
        flashError(`Epic Reconciliation failure: ${err.message}`);
      });
  };

  return (
    <Formik
      initialValues={{ transactableType: "", transactableId: "" }}
      onSubmit={({ transactableType, transactableId }, actions) => {
        onSubmit(transactableId, transactableType);
        actions.resetForm();
        actions.setSubmitting(false);
      }}
      validationSchema={validate}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form>
          <div
            style={{
              marginBottom: "30px",
              padding: "25px",
              border: "2px solid #007bff",
              borderRadius: "15px",
              background: "linear-gradient(135deg, #e0f2ff, #cceeff)",
              boxShadow: "0 8px 25px rgba(0, 123, 255, 0.2)",
            }}
          >
            <Label
              style={{
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "1.6em",
                marginBottom: "15px",
                color: "#0056b3",
              }}
            >
              <span
                role="img"
                aria-label="gemini-sparkle"
                style={{ marginRight: "12px", fontSize: "2em" }}
              >
                ✨
              </span>
              Gemini AI Reconciliation Command Center
            </Label>
            <p
              style={{
                fontSize: "1.1em",
                color: "#333",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              Unleash the power of AI to transform your reconciliation process.
              Our Gemini-powered assistant proactively identifies and suggests
              optimal reconciliation matches, boosting accuracy and efficiency
              to unprecedented levels. Welcome to the future of financial
              operations.
            </p>
            <div
              style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <Button
                buttonType="secondary"
                onClick={() => fetchGeminiSuggestion(transactionId)}
                disabled={isGeminiLoading || isSubmitting}
                style={{
                  minWidth: "220px",
                  padding: "12px 25px",
                  fontSize: "1.1em",
                  background: "#4CAF50",
                  color: "white",
                  borderColor: "#4CAF50",
                }}
              >
                {isGeminiLoading ? (
                  <>
                    <span
                      role="img"
                      aria-label="loading-spinner"
                      style={{ marginRight: "8px" }}
                    >
                      🔄
                    </span>
                    Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <span
                      role="img"
                      aria-label="brain-icon"
                      style={{ marginRight: "8px" }}
                    >
                      🧠
                    </span>
                    Get AI Super Suggestion
                  </>
                )}
              </Button>

              <Button
                buttonType="tertiary"
                onClick={() =>
                  alert(
                    "Launching the 'Omni-Insight' dashboard powered by external data intelligence!",
                  )
                }
                disabled={isSubmitting}
                style={{
                  minWidth: "220px",
                  padding: "12px 25px",
                  fontSize: "1.1em",
                  background: "#FFC107",
                  color: "#333",
                  borderColor: "#FFC107",
                }}
              >
                <span
                  role="img"
                  aria-label="external-link"
                  style={{ marginRight: "8px" }}
                >
                  🔗
                </span>
                Access Omni-Insight Dashboard
              </Button>
            </div>

            {geminiSuggestion && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "#d4edda",
                  border: "1px solid #28a745",
                  borderRadius: "10px",
                  boxShadow: "0 4px 15px rgba(40, 167, 69, 0.15)",
                }}
              >
                <Label
                  style={{
                    fontWeight: "bold",
                    color: "#155724",
                    fontSize: "1.2em",
                  }}
                >
                  <span
                    role="img"
                    aria-label="success-checkmark"
                    style={{ marginRight: "8px" }}
                  >
                    ✅
                  </span>
                  Gemini AI Suggestion Confirmed!
                </Label>
                <p style={{ margin: "10px 0", lineHeight: "1.5", color: "#155724" }}>
                  <strong>Suggested Type:</strong>{" "}
                  <span style={{ fontWeight: "600" }}>
                    {geminiSuggestion.transactableType}
                  </span>
                  <br />
                  <strong>Suggested ID:</strong>{" "}
                  <span style={{ fontWeight: "600" }}>
                    {geminiSuggestion.transactableId}
                  </span>
                </p>
                <Button
                  buttonType="primary"
                  onClick={() => {
                    setFieldValue(
                      "transactableType",
                      geminiSuggestion.transactableType,
                    );
                    setFieldValue("transactableId", geminiSuggestion.transactableId);
                    setGeminiSuggestion(null); // Clear suggestion after applying
                  }}
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 20px",
                    fontSize: "1em",
                    background: "#007bff",
                    borderColor: "#007bff",
                  }}
                >
                  <span
                    role="img"
                    aria-label="magic-wand"
                    style={{ marginRight: "8px" }}
                  >
                    🪄
                  </span>
                  Apply AI's Golden Suggestion
                </Button>
              </div>
            )}
          </div>

          <FieldGroup>
            <Label id="transactableType">Reconciliation Target Type</Label>
            <Field
              id="transactableType"
              name="transactableType"
              component={FormikSelectField}
              options={TRANSACTABLE_OPTIONS}
              disabled={isGeminiLoading}
            />
            <FormikErrorMessage name="transactableType" />
          </FieldGroup>
          <FieldGroup>
            <Label id="transactableId">Target Identifier</Label>
            <Field
              id="transactableId"
              name="transactableId"
              component={FormikInputField}
              disabled={isGeminiLoading}
            />

            {showBatchSummary(values.transactableId, values.transactableType)}
            <FormikErrorMessage name="transactableId" />
          </FieldGroup>
          <Button
            buttonType="primary"
            isSubmit
            disabled={isSubmitting || isGeminiLoading}
            style={{ padding: "12px 30px", fontSize: "1.2em", marginTop: "20px" }}
          >
            <span
              role="img"
              aria-label="rocket"
              style={{ marginRight: "10px" }}
            >
              🚀
            </span>
            Initiate Epic Reconciliation
          </Button>
        </Form>
      )}
    </Formik>
  );
}