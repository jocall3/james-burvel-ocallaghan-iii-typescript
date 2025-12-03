// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback } from "react";
import requestApi from "../../common/utilities/requestApi";
import CardAcceptanceFields from "../../auth/components/sign_up/CardAcceptanceFields";
import { ConfirmModal } from "../../common/ui-components";
import { DispatchMessageFnType, useDispatchContext } from "../MessageProvider";
import Gon from "../../common/utilities/gon";
import { Spinner } from "../../common/ui-components/Spinner"; // Assuming a Spinner component exists

interface OmniPayIntegrationModalProps {
  isOpen: boolean;
  handleModalClose: () => void;
}

type PaymentOption = "credit_card" | "apple_pay" | "google_pay" | "crypto_wallet" | null;

// Mock AI assistant response for "Gemini" integration
const getGeminiSmartSuggestion = async (userId: string, currentStep: string): Promise<string> => {
  // In a real scenario, this would call a backend API that integrates with Gemini
  // to provide personalized suggestions based on user history, location, etc.
  console.log(`Gemini AI analyzing user ${userId} at step ${currentStep} for personalized suggestions...`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay

  switch (currentStep) {
    case "select_method":
      return `Hey ${userId.split('@')[0]}! We noticed you often use Apple Pay. Would you like to set it as your default for seamless checkouts?`;
    case "card_details":
      return "For enhanced security, consider enabling biometric authentication for future transactions. Gemini AI can help optimize your payment flow!";
    case "review_integration":
      return "Excellent choice! This integration unlocks exclusive rewards. Gemini AI predicts a smooth experience for you.";
    default:
      return "Welcome to the future of finance! Gemini AI is here to make your payment integrations magical.";
  }
};

const processOmniIntegration = async (
  userId: string,
  selectedOption: PaymentOption,
  cardToken: string | null,
  expiry: string | null,
  dispatchSuccess: DispatchMessageFnType["dispatchSuccess"],
  dispatchError: DispatchMessageFnType["dispatchError"], // Added dispatchError
) => {
  const payload: any = {
    user_id: userId,
    integration_type: selectedOption,
  };

  if (selectedOption === "credit_card") {
    payload.card_token = cardToken;
    payload.expiry = expiry;
  }
  // For other options, specific payloads would be constructed
  if (selectedOption === "apple_pay") {
    payload.apple_pay_token = "mock_apple_token_123"; // In reality, client-side Apple Pay SDK would generate this
  }
  if (selectedOption === "google_pay") {
    payload.google_pay_token = "mock_google_token_456"; // In reality, client-side Google Pay SDK would generate this
  }
  if (selectedOption === "crypto_wallet") {
    payload.wallet_address = "0xMockCryptoAddress789"; // In reality, a wallet connect flow would provide this
  }

  try {
    const response = await requestApi("/integrations/omni_pay_connect", null, "POST", payload).res();
    window.location.href = "/settings/integrations"; // A more generic redirect
    dispatchSuccess("🎉 Your Omni-Pay Integration is Live! Powered by Gemini AI.");
    return response;
  } catch (error: any) {
    console.error("Omni-Pay Integration Failed:", error);
    dispatchError(`Integration failed: ${error.message || "Please try again."}`);
    throw error;
  }
};

function OmniPayIntegrationModal({ isOpen, handleModalClose }: OmniPayIntegrationModalProps) {
  const { dispatchSuccess, dispatchError } = useDispatchContext();
  const [currentStep, setCurrentStep] = useState<"select_method" | "card_details" | "review_integration">("select_method");
  const [selectedOption, setSelectedOption] = useState<PaymentOption>(null);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [cardToken, setCardToken] = useState("");
  const [expiry, setExpiry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geminiSuggestion, setGeminiSuggestion] = useState("");

  const {
    ui: { cardconnectEnvironment },
    user: { id: userId }, // Assuming user ID is available from Gon
  } = Gon.gon;

  useEffect(() => {
    if (isOpen && userId) {
      // Fetch initial Gemini suggestion when modal opens
      getGeminiSmartSuggestion(userId, currentStep).then(setGeminiSuggestion);
    }
  }, [isOpen, userId, currentStep]);

  const handleCardTokenizationSuccess = useCallback((
    newCardToken: string,
    newCardExpiry: string,
  ) => {
    setCardToken(newCardToken);
    setExpiry(newCardExpiry);
    setDisableSubmit(false);
    setCurrentStep("review_integration"); // Advance step on successful tokenization
  }, []);

  const handleOptionSelect = useCallback((option: PaymentOption) => {
    setSelectedOption(option);
    if (option === "credit_card") {
      setCurrentStep("card_details");
      setDisableSubmit(true); // Disable until card is tokenized
    } else {
      setDisableSubmit(false); // Other options might not require further input immediately
      setCurrentStep("review_integration");
    }
    // Fetch new Gemini suggestion based on selected option
    getGeminiSmartSuggestion(userId, option === "credit_card" ? "card_details" : "review_integration").then(setGeminiSuggestion);
  }, [userId]);


  const handleSubmitIntegration = async () => {
    setIsLoading(true);
    try {
      await processOmniIntegration(
        userId,
        selectedOption,
        cardToken,
        expiry,
        dispatchSuccess,
        dispatchError,
      );
      handleModalClose(); // Close on success
    } catch (error) {
      // Error handled by dispatchError in processOmniIntegration
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case "select_method":
        return (
          <div className="form-section flex flex-col gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Your Integration Path</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Empower your experience with seamless connections. Gemini AI guides your journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  selectedOption === "credit_card" ? "border-indigo-600 bg-indigo-50 shadow-lg" : "border-gray-300 bg-white hover:border-indigo-400"
                }`}
                onClick={() => handleOptionSelect("credit_card")}
              >
                <i className="fas fa-credit-card text-4xl text-indigo-500 mb-2"></i>
                <span className="font-semibold text-lg text-gray-800">Credit/Debit Card</span>
                <span className="text-sm text-gray-500 text-center">Standard & Secure</span>
              </button>
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  selectedOption === "apple_pay" ? "border-indigo-600 bg-indigo-50 shadow-lg" : "border-gray-300 bg-white hover:border-indigo-400"
                }`}
                onClick={() => handleOptionSelect("apple_pay")}
              >
                <i className="fab fa-apple-pay text-4xl text-gray-800 mb-2"></i>
                <span className="font-semibold text-lg text-gray-800">Apple Pay</span>
                <span className="text-sm text-gray-500 text-center">One-tap Integration</span>
              </button>
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  selectedOption === "google_pay" ? "border-indigo-600 bg-indigo-50 shadow-lg" : "border-gray-300 bg-white hover:border-indigo-400"
                }`}
                onClick={() => handleOptionSelect("google_pay")}
              >
                <i className="fab fa-google-pay text-4xl text-blue-600 mb-2"></i>
                <span className="font-semibold text-lg text-gray-800">Google Pay</span>
                <span className="text-sm text-gray-500 text-center">Fast & Convenient</span>
              </button>
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  selectedOption === "crypto_wallet" ? "border-indigo-600 bg-indigo-50 shadow-lg" : "border-gray-300 bg-white hover:border-indigo-400"
                }`}
                onClick={() => handleOptionSelect("crypto_wallet")}
              >
                <i className="fas fa-wallet text-4xl text-yellow-500 mb-2"></i>
                <span className="font-semibold text-lg text-gray-800">Crypto Wallet</span>
                <span className="text-sm text-gray-500 text-center">Decentralized Power</span>
              </button>
            </div>
            {geminiSuggestion && (
              <div className="mt-6 p-4 bg-white border border-dashed border-purple-300 rounded-lg text-center text-purple-700 text-sm italic shadow-sm flex items-center justify-center">
                <i className="fas fa-sparkles text-purple-500 mr-2 animate-pulse"></i>
                <span className="font-medium">Gemini AI Suggestion:</span> {geminiSuggestion}
              </div>
            )}
          </div>
        );
      case "card_details":
        return (
          <div className="form-section p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Secure Card Details</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter your card information. All transactions are encrypted and secured.
            </p>
            <CardAcceptanceFields
              isModal
              cardconnectEnvironment={cardconnectEnvironment}
              onCardTokenization={handleCardTokenizationSuccess}
            />
            {geminiSuggestion && (
              <div className="mt-6 p-4 bg-white border border-dashed border-purple-300 rounded-lg text-center text-purple-700 text-sm italic shadow-sm flex items-center justify-center">
                <i className="fas fa-brain text-purple-500 mr-2 animate-pulse"></i>
                <span className="font-medium">Gemini AI Insight:</span> {geminiSuggestion}
              </div>
            )}
            <button type="button" onClick={() => setCurrentStep("select_method")} className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> Back to options
            </button>
          </div>
        );
      case "review_integration":
        return (
          <div className="form-section p-4 text-center bg-green-50 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Launch!</h3>
            <p className="text-lg text-gray-700 mb-6">
              You are about to integrate with <span className="font-semibold text-indigo-700 capitalize">{selectedOption?.replace(/_/g, ' ')}</span>.
            </p>
            {selectedOption === "credit_card" && (
              <p className="text-sm text-gray-600 mb-4">
                Card ending in **** {cardToken.slice(-4)} (expires {expiry})
              </p>
            )}
            {selectedOption !== "credit_card" && (
              <p className="text-sm text-gray-600 mb-4">
                This will enable seamless payments via {selectedOption?.replace(/_/g, ' ')}.
              </p>
            )}
            {geminiSuggestion && (
              <div className="mt-6 p-4 bg-white border border-dashed border-green-300 rounded-lg text-center text-green-700 text-sm italic shadow-sm flex items-center justify-center">
                <i className="fas fa-rocket text-green-500 mr-2 animate-pulse"></i>
                <span className="font-medium">Gemini AI Says:</span> {geminiSuggestion}
              </div>
            )}
            <button type="button" onClick={() => {
                 if (selectedOption === "credit_card") setCurrentStep("card_details");
                 else setCurrentStep("select_method");
              }} className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm flex items-center justify-center mx-auto">
              <i className="fas fa-arrow-left mr-2"></i> Review previous step
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case "select_method": return "Unlock Omni-Pay: Your Integration Hub";
      case "card_details": return "Securely Add Card Details";
      case "review_integration": return "Confirm Your Epic Integration";
      default: return "Omni-Pay Integration";
    }
  };

  const getConfirmText = () => {
    if (isLoading) return <Spinner />;
    switch (currentStep) {
      case "select_method": return "Next";
      case "card_details": return "Tokenize Card";
      case "review_integration": return `Activate ${selectedOption?.replace(/_/g, ' ') || 'Integration'}`;
      default: return "Continue";
    }
  };

  const isConfirmDisabled = () => {
    if (isLoading) return true;
    switch (currentStep) {
      case "select_method": return !selectedOption;
      case "card_details": return disableSubmit; // From CardAcceptanceFields
      case "review_integration": return false; // Always enabled to confirm
      default: return true;
    }
  };

  const handleConfirmAction = () => {
    switch (currentStep) {
      case "select_method":
        if (selectedOption === "credit_card") {
          setCurrentStep("card_details");
        } else if (selectedOption) {
          setCurrentStep("review_integration");
          setDisableSubmit(false); // Enable submit for other options
        }
        break;
      case "card_details":
        // CardAcceptanceFields handles tokenization, which calls handleCardTokenizationSuccess
        // That function then sets currentStep to "review_integration" and disableSubmit to false.
        // So, the confirm button's action for 'card_details' step is essentially handled by the CardAcceptanceFields component internally.
        // We'll leave this empty, as the button will be disabled until tokenization is complete by CardAcceptanceFields.
        break;
      case "review_integration":
        handleSubmitIntegration();
        break;
      default:
        break;
    }
  };


  return (
    <ConfirmModal
      isOpen={isOpen}
      title={getModalTitle()}
      onRequestClose={handleModalClose}
      confirmText={getConfirmText()}
      onConfirm={handleConfirmAction}
      confirmDisabled={isConfirmDisabled()}
      cancelText="Cancel"
      setIsOpen={handleModalClose}
      className="max-w-3xl w-full" // Make modal wider to accommodate new content
    >
      <form className="form-create">
        {renderContent()}
      </form>
    </ConfirmModal>
  );
}

export default OmniPayIntegrationModal;