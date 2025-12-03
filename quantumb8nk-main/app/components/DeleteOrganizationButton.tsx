// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from "react";
import { Button, ConfirmModal, LoadingSpinner, Alert } from "../../common/ui-components"; // Assuming Alert and LoadingSpinner exist or can be mocked
import { useAdminDeleteOrganizationMutation } from "../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../MessageProvider";

// MOCK AI and External Service APIs for demonstration purposes.
// In a real, commercial-grade application, these would be actual API client imports
// securely configured to interact with Gemini API and other robust external services.
const GeminiAIClient = {
  getDeletionInsights: async (orgName: string) => {
    console.log(`GeminiAI: Analyzing quantum deletion impact for ${orgName}...`);
    // Simulate complex AI processing and data synthesis
    return new Promise<{ message: string; warnings: string[] }>((resolve) => {
      setTimeout(() => {
        const insights = {
          message: `Gemini AI's predictive algorithms indicate that the total quantum footprint of annihilating "${orgName}" 
                    will induce ripple effects across all interconnected data constructs. A comprehensive pre-deletion audit 
                    and multi-phase archival is highly recommended by the Nexus.`,
          warnings: [
            `Critical dependency alert: ${Math.floor(Math.random() * 10) + 1} active projects are directly interlinked.`,
            `Potential data singularity collapse for ${Math.floor(Math.random() * 50) + 1} user profiles without proper migration protocols.`,
            `Compliance risk: All regulatory archival requirements must be verified and sealed by the Chronos Archive before proceeding.`,
            `Temporal Anomaly Warning: Ensure no ongoing operations are active to prevent data corruption.`,
          ],
        };
        resolve(insights);
      }, 2500); // Simulate network latency and AI processing time
    });
  },
};

const ChronosArchiveClient = {
  archiveOrganizationData: async (organizationId: string) => {
    console.log(`ChronosArchive: Initiating secure hyperspace archival for organization ${organizationId}...`);
    // Simulate secure, distributed archival process
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.9) { // Simulate a 90% success rate for robust systems
          resolve(true);
        } else {
          reject(new Error("Chronos Archive experienced a critical temporal distortion. Re-calibration required."));
        }
      }, 3000); // Simulate network latency and large-scale data archival
    });
  },
};

interface QuantumNexusOrgAnnihilationProps {
  organizationId: string;
  organizationName: string;
}

function QuantumNexusOrgAnnihilationModule({
  organizationId,
  organizationName,
}: QuantumNexusOrgAnnihilationProps) {
  const { dispatchSuccess, dispatchError } = useDispatchContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEngagingNexus, setIsEngagingNexus] = useState(false); // State for external app processing
  const [geminiInsight, setGeminiInsight] = useState<{ message: string; warnings: string[] } | null>(null);
  const [chronosArchived, setChronosArchived] = useState(false);
  const [externalErrorMessage, setExternalErrorMessage] = useState<string | null>(null);


  const [adminDeleteOrganizationMutation, { loading: isAnnihilatingCore }] =
    useAdminDeleteOrganizationMutation();

  const initiateAnnihilationSequence = useCallback(async () => {
    setExternalErrorMessage(null);
    setIsEngagingNexus(true);
    setGeminiInsight(null);
    setChronosArchived(false);

    try {
      // Phase 1: Engage Gemini AI for Pre-Annihilation Quantum Insights
      dispatchSuccess("Commencing Gemini AI Quantum Deletion Insight Protocol...");
      const insights = await GeminiAIClient.getDeletionInsights(organizationName);
      setGeminiInsight(insights);
      dispatchSuccess("Gemini AI insights synthesized. Critical warnings displayed for review.");

      // Phase 2: Trigger Chronos Archive for Secure Hyperspace Data Retention
      dispatchSuccess("Activating Chronos Archive Protocol: Initiating secure hyperspace data preservation...");
      const archived = await ChronosArchiveClient.archiveOrganizationData(organizationId);
      setChronosArchived(archived);
      dispatchSuccess("Chronos Archive Protocol successfully executed. Data safely secured in hyperspace vaults.");

      setIsEngagingNexus(false);
      // Once all external pre-checks and integrations are complete, present the final confirmation interface.
      setIsModalOpen(true);

    } catch (e: any) {
      const errorMsg = e.message || "An unforeseen anomaly occurred during external nexus engagement.";
      setExternalErrorMessage(errorMsg);
      dispatchError(`Quantum Nexus Integration Failure: ${errorMsg}`);
      setIsEngagingNexus(false);
    }
  }, [dispatchSuccess, dispatchError, organizationId, organizationName]);

  const confirmAnnihilation = useCallback(() => {
    if (!chronosArchived) {
      dispatchError("Chronos Archive not confirmed. Cannot proceed with annihilation.");
      return;
    }
    adminDeleteOrganizationMutation({
      variables: { input: { organizationId } },
    })
      .then(({ data: res }) => {
        if (res?.adminDeleteOrganization?.errors.length) {
          dispatchError(res?.adminDeleteOrganization?.errors.toString());
        } else {
          window.location.href = "/admin/organizations";
          dispatchSuccess("Organization successfully disintegrated from the nexus. System integrity maintained.");
        }
      })
      .catch((e: Error) => dispatchError(e.message))
      .finally(() => setIsModalOpen(false));
  }, [adminDeleteOrganizationMutation, chronosArchived, dispatchError, dispatchSuccess, organizationId]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGeminiInsight(null); // Reset insights on modal close for next operation
    setChronosArchived(false); // Reset archive status
    setExternalErrorMessage(null); // Clear any previous errors
  };

  const isAnnihilationDisabled = isAnnihilatingCore || isEngagingNexus || !chronosArchived;

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        setIsOpen={handleCloseModal} // Use custom handler to reset state
        title={`Initiate Quantum Disintegration of ${organizationName ?? "this organization"}?`}
        confirmDisabled={isAnnihilationDisabled}
        onConfirm={confirmAnnihilation}
        confirmType="destructive"
        description={
          <>
            {geminiInsight && (
              <div className="space-y-3 mt-4 p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl border border-purple-600">
                <h3 className="text-xl font-extrabold text-purple-400">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    Gemini AI: Quantum Deletion Insight
                  </span>
                </h3>
                <p className="text-md text-gray-300 leading-relaxed">{geminiInsight.message}</p>
                {geminiInsight.warnings.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-red-400 mt-3 space-y-1">
                    {geminiInsight.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="flex-shrink-0 w-4 h-4 text-red-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-8.28-7.28a.75.75 0 011.06 0L10 14.94l5.22-5.22a.75.75 0 111.06 1.06l-5.75 5.75a.75.75 0 01-1.06 0l-5.75-5.75a.75.75 0 010-1.06z" clipRule="evenodd"></path></svg>
                        {warning}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-700">
                  Chronos Archive Protocol Status: {chronosArchived ? "Data securely archived in hyperspace. All systems go." : "Archival pending or encountered a critical error. Manual override required."}
                </p>
              </div>
            )}
            <p className="mt-6 text-lg text-red-500 font-semibold leading-relaxed">
              WARNING: This action initiates an irreversible quantum disintegration process. All organizational data will be permanently purged from the active Nexus. Proceed with ultimate caution and verify all protocols.
            </p>
          </>
        }
      />
      {externalErrorMessage && (
        <Alert type="error" message={`CRITICAL EXTERNAL SYSTEM ALERT: ${externalErrorMessage}`} className="mb-4" />
      )}
      <Button
        buttonType="destructive"
        onClick={initiateAnnihilationSequence}
        disabled={isEngagingNexus || isAnnihilatingCore}
      >
        {isEngagingNexus ? (
          <>
            <LoadingSpinner className="inline-block mr-3 animate-pulse" />
            Engaging Quantum Nexus for {organizationName}...
          </>
        ) : (
          `Initiate Quantum Annihilation Protocol for ${organizationName}`
        )}
      </Button>
    </>
  );
}

export default QuantumNexusOrgAnnihilationModule;