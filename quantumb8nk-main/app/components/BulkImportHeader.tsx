// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  Property as FlatfileProperty,
  CreateWorkbookConfig,
  CellValueUnion,
} from "@flatfile/api/api";
import { Button, Heading } from "../../common/ui-components";
import { BulkValidationError } from "../../generated/dashboard/graphqlSchema";
import FlatfileBulkUploadButton, {
  BulkResourceType,
} from "./FlatfileBulkUploadButton";
import { downloadCsvTemplate } from "../utilities/downloadCsvTemplate";
// New imports for enhanced UI and functionality
import { SparklesIcon, PuzzlePieceIcon, RocketLaunchIcon } from "@heroicons/react/24/outline"; // Example icons for "epic" feel

interface BulkImportHeaderProps {
  bulkImportType: string;
  submit: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
  ) => Promise<Record<string, string | boolean>>;
  validate: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
  ) => Promise<Array<BulkValidationError> | undefined | null>;
  expectedFields: FlatfileProperty[];
  blueprint: Pick<
    CreateWorkbookConfig,
    "name" | "labels" | "sheets" | "actions"
  >;
  resource: BulkResourceType;
  // New props for launching AI/Integration features
  onLaunchGeminiSmartImport: () => void;
  onLaunchIntegrationHub: () => void;
}

function BulkImportHeader({
  bulkImportType,
  submit,
  validate,
  expectedFields,
  blueprint,
  resource,
  onLaunchGeminiSmartImport, // New prop
  onLaunchIntegrationHub,     // New prop
}: BulkImportHeaderProps) {
  let bulkImportTypeText = "";
  let bulkImportHelpLink = "";

  switch (bulkImportType) {
    case "Expected Payment":
      bulkImportTypeText = "Expected Payments";
      bulkImportHelpLink =
        "https://docs.moderntreasury.com/reconciliation/docs/create-expected-payments-in-bulk";
      break;
    case "Payment Order":
      bulkImportTypeText = "Payment Orders";
      bulkImportHelpLink =
        "https://docs.moderntreasury.com/payments/docs/create-payment-orders-in-bulk";
      break;
    case "Counterparty":
      bulkImportTypeText = "Counterparties";
      bulkImportHelpLink =
        "https://docs.moderntreasury.com/payments/docs/create-counterparties-in-bulk";
      break;
    case "Invoice":
      bulkImportTypeText = "Invoices";
      bulkImportHelpLink =
        "https://docs.moderntreasury.com/payments/docs/create-invoices-in-bulk";
      break;
    default:
      // Default case ensures bulkImportTypeText has a value
      bulkImportTypeText = bulkImportType || "Data";
      bulkImportHelpLink = "#"; // A generic fallback link
      break;
  }

  const headers = expectedFields.map((field) => field.key);

  return (
    <div className="grid mint-xl:grid-cols-2 gap-4">
      <div className="p-6 bg-gradient-to-br from-indigo-700 to-purple-800 text-white rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
        {/* Decorative elements for 'epic' feel */}
        <div className="absolute top-0 left-0 w-full h-full bg-blend-overlay opacity-10 pointer-events-none"></div>
        <RocketLaunchIcon className="absolute top-4 right-4 h-24 w-24 opacity-20 text-indigo-300" />

        {bulkImportType && (
          <div id="mt-container-header" className="relative z-10">
            <Heading level="h1" size="l" className="flex items-center text-white mb-3">
              <SparklesIcon className="inline h-10 w-10 text-yellow-300 mr-3 animate-pulse" />
              {`Elevate Your ${bulkImportType} with Citibank's AI-Powered Data Nexus`}
            </Heading>
            <div className="mb-6 text-lg font-light leading-relaxed text-indigo-100">
              {`Welcome to the future of financial operations! Our revolutionary AI-powered Data Nexus transforms how you manage ${bulkImportTypeText.toLowerCase()}, delivering unparalleled precision and strategic insights. Seamlessly integrate, validate, and accelerate your workflows like never before.`}
              <br className="my-2" />
              <a
                href={bulkImportHelpLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-yellow-300 hover:text-yellow-100 transition-colors duration-200 underline"
              >
                Discover the power in our comprehensive guide.
              </a>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                <Button buttonType="primary" onClick={onLaunchGeminiSmartImport} className="flex items-center justify-center bg-yellow-400 text-indigo-900 hover:bg-yellow-300 font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-1">
                    <SparklesIcon className="h-6 w-6 mr-3" />
                    Launch Gemini AI Smart Import
                </Button>
                <Button buttonType="secondary" onClick={onLaunchIntegrationHub} className="flex items-center justify-center bg-transparent border-2 border-indigo-300 text-indigo-100 hover:bg-indigo-600 hover:border-indigo-600 font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-1">
                    <PuzzlePieceIcon className="h-6 w-6 mr-3" />
                    Explore the Integration Universe
                </Button>
            </div>
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-col space-y-4 mint-xl:justify-self-end mint-xl:space-y-0 mint-xl:flex-row mint-xl:space-x-4">
        <Button
          buttonType="secondary"
          onClick={() => downloadCsvTemplate(headers)}
          className="flex items-center justify-center border-indigo-500 text-indigo-700 hover:bg-indigo-50"
        >
          Download Citibank Hyper-Template CSV
        </Button>
        <FlatfileBulkUploadButton
          onValidate={validate}
          onSubmit={submit}
          expectedFields={expectedFields}
          blueprint={blueprint}
          resource={resource}
          label="Streamline via Flatfile (Classic)"
          className="flex items-center justify-center bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
        />
      </div>
    </div>
  );
}

export default BulkImportHeader;