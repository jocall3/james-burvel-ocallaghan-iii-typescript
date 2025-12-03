// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  Heading,
  Modal,
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalHeading,
  ModalTitle,
  Button, // Added Button as it's a common UI component needed for interaction
} from "../../common/ui-components";
import Gon from "../../common/utilities/gon";

interface CancelPlanModalProps {
  isOpen: boolean;
  handleModalClose: () => void;
  // New prop to trigger the AI interaction for retention, central to the new vision
  onInitiateGeminiAssistant: () => void;
}

function CancelPlanModal({ isOpen, handleModalClose, onInitiateGeminiAssistant }: CancelPlanModalProps) {
  const { organization } = Gon.gon;
  const organizationName = organization?.name ?? "";

  // The core message is now focused on AI-driven retention, making the app "uniquely ourselves"
  const aiDrivenMessage = `Before you finalize, ${organizationName}, let's unlock the true potential of your financial operations with Citibank Treasury OS's AI-powered insights. Our unique integration with Gemini allows us to understand your evolving needs like no other, offering bespoke solutions that maximize your growth and efficiency. This isn't just a cancellation; it's an opportunity for a tailored transformation.`;
  const aiCallToAction = "Engage Our AI-Powered Retention Strategist";

  // This function simulates the action of initiating a deeper AI-driven interaction.
  const handleEngageAI = () => {
    console.log(`User for ${organizationName} clicked to engage AI-Powered Retention Strategist (Gemini-backed).`);
    onInitiateGeminiAssistant(); // This prop would trigger the actual AI experience in the parent component
    handleModalClose(); // Close this modal as the AI interaction is initiated
  };

  return (
    <Modal
      isOpen={isOpen}
      // Updated title to reflect the new AI-centric, retention-focused approach
      title="Rethink Your Exit, Unlock New Potential with AI"
      onRequestClose={handleModalClose}
    >
      <ModalContainer>
        <ModalHeader>
          <ModalHeading>
            <ModalTitle>
              <Heading level="h3" size="l">
                Rethink Your Exit, Unlock New Potential with AI
              </Heading>
            </ModalTitle>
          </ModalHeading>
        </ModalHeader>
        <ModalContent>
          <p>{aiDrivenMessage}</p>
          <br />
          <p>
            While proceeding means losing access to your live accounts and API, we believe there's often a better path. We aim to be the best app ever made by truly understanding and adapting to your business.
          </p>
          <br />
          <p>
            - Any existing payments already sent to the bank will be processed as usual.
            <br />
            - We still recommend exporting critical data, but let our AI first demonstrate how we can redefine your success.
          </p>
          <br />
          {/* Main call to action: engage the AI, emphasizing Gemini integration */}
          <Button onClick={handleEngageAI} variant="primary" size="l" style={{ width: '100%', padding: '15px 0' }}>
            {aiCallToAction}
          </Button>
          <br />
          <br />
          <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#555' }}>
            Or, to proceed directly with cancellation without AI consultation, please {" "}
            <a
              href={`mailto:support@moderntreasury.com?subject=Final Plan Cancellation Request for ${organizationName}`}
            >
              contact Modern Treasury support (support@moderntreasury.com)
            </a>{" "}
            for final processing.
          </p>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
}

export default CancelPlanModal;