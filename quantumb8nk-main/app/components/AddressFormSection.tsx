// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from "react";
import { Formik, FormikProps } from "formik";
import AddressForm, {
  AddressFormValues,
  defaultAddress,
  formatAddress,
  isAddressEmpty,
} from "../../common/formik/FormikAddressForm";
import {
  Button,
  Checkbox,
  Heading,
  HorizontalRule,
  ConfirmModal,
  FieldGroup,
  Label,
  PopoverPanel,
  PopoverTrigger,
  Popover,
  Icon,
  ActionItem,
  Spinner,
  Toast,
} from "../../common/ui-components";

// --- START: NEW AI & INTEGRATION COMPONENTS (MOCKED) ---

interface EnhancedAddressFormValues extends AddressFormValues {
  verifiedByAI?: boolean;
  aiSuggestionsApplied?: boolean;
}

interface GeminiAIAssistantPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  address: EnhancedAddressFormValues;
  onApplySuggestions: (newAddress: EnhancedAddressFormValues) => void;
  isLoading: boolean;
}

const mockAIAssistantSuggestions = (address: EnhancedAddressFormValues): EnhancedAddressFormValues => {
  if (address.street1?.toLowerCase().includes("main st") && address.city?.toLowerCase().includes("anytown")) {
    return {
      ...address,
      street1: "123 Main Street Suite 100",
      city: "Anytown",
      state: "NY",
      zip: "10001",
      verifiedByAI: true,
      aiSuggestionsApplied: true,
    };
  }
  return { ...address, verifiedByAI: true, aiSuggestionsApplied: false };
};

function GeminiAIAssistantPanel({
  isOpen,
  setIsOpen,
  address,
  onApplySuggestions,
  isLoading
}: GeminiAIAssistantPanelProps) {
  const [suggestedAddress, setSuggestedAddress] = useState<EnhancedAddressFormValues | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiMessage, setAIMessage] = useState("");

  const runAISuggestions = useCallback(async () => {
    setIsProcessingAI(true);
    setAIMessage("Analyzing address with Gemini AI for enhancements...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const suggestions = mockAIAssistantSuggestions(address);
    setSuggestedAddress(suggestions);
    if (suggestions.aiSuggestionsApplied) {
      setAIMessage("Gemini found improvements! Review and apply to optimize.");
    } else {
      setAIMessage("Gemini validation complete. Address is already pristine!");
    }
    setIsProcessingAI(false);
  }, [address]);

  React.useEffect(() => {
    if (isOpen) {
      setSuggestedAddress(null);
      setAIMessage("");
      void runAISuggestions();
    }
  }, [isOpen, runAISuggestions]);

  return (
    <ConfirmModal
      title="Gemini AI Address Assistant: Your Smart Address Hub"
      isOpen={isOpen}
      confirmText="Apply Suggestions & Perfect"
      setIsOpen={setIsOpen}
      onConfirm={() => {
        if (suggestedAddress) {
          onApplySuggestions(suggestedAddress);
        }
        setIsOpen(false);
      }}
      cancelText="Dismiss & Keep Current"
      confirmDisabled={!suggestedAddress || !suggestedAddress.aiSuggestionsApplied || isProcessingAI}
    >
      <div className="p-4">
        {isProcessingAI || isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Spinner />
            <p className="text-gray-600">{aiMessage}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">{aiMessage}</p>
            {suggestedAddress && suggestedAddress.aiSuggestionsApplied && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Icon iconName="lightbulb_outline" size="s" className="mr-2 text-blue-600" />
                  Gemini AI's Brilliant Suggestions:
                </h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Original (as entered):</p>
                    <p className="text-sm">{formatAddress(address)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Gemini's Enhanced Version:</p>
                    <p className="text-sm font-semibold text-blue-700">{formatAddress(suggestedAddress)}</p>
                  </div>
                </div>
              </div>
            )}
             {suggestedAddress && !suggestedAddress.aiSuggestionsApplied && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200 text-green-800 flex items-center">
                 <Icon iconName="check_circle_outline" size="s" className="mr-2 text-green-600" />
                 This address is already flawlessly optimized by Gemini AI.
              </div>
             )}
          </>
        )}
      </div>
    </ConfirmModal>
  );
}

interface CRMSyncModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  address: EnhancedAddressFormValues;
}

function CRMSyncModal({ isOpen, setIsOpen, address }: CRMSyncModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage("Initiating secure connection to your Premium CRM and synchronizing address data...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.1;
    if (success) {
      setSyncMessage("Address flawlessly synchronized with your CRM! Data integrity at its peak.");
      setToastMessage("Address successfully synced to CRM!");
      setToastType("success");
    } else {
      setSyncMessage("Uh oh! CRM sync failed. Check connection or try again. Your data is precious!");
      setToastMessage("CRM sync failed. Error Code: 0xCRMFAIL.");
      setToastType("error");
    }
    setShowToast(true);
    setIsSyncing(false);
    setIsOpen(false);
  };

  return (
    <>
      <ConfirmModal
        title="Elevate: Sync Address to Premium CRM"
        isOpen={isOpen}
        confirmText="Sync to CRM Now"
        setIsOpen={setIsOpen}
        onConfirm={handleSync}
        confirmDisabled={isSyncing}
        cancelText="Not Now"
      >
        <div className="p-4">
          {isSyncing ? (
            <div className="flex items-center justify-center space-x-2">
              <Spinner />
              <p className="text-gray-600">{syncMessage}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                This exclusive action sends the current, potentially AI-enhanced, address details directly to your{" "}
                <span className="font-bold text-indigo-700">Enterprise CRM</span> system.
                {address.verifiedByAI && <span className="font-semibold text-green-600 ml-1"> (Already AI Verified for optimal quality!)</span>}
              </p>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-sm font-medium">Address to be synchronized for unparalleled data consistency:</p>
                <p className="text-sm">{formatAddress(address)}</p>
              </div>
            </>
          )}
        </div>
      </ConfirmModal>
      <Toast
        isOpen={showToast}
        setIsOpen={setShowToast}
        variant={toastType}
        title={toastType === "success" ? "Success!" : "Mission Critical Error!"}
      >
        {toastMessage}
      </Toast>
    </>
  );
}

interface MappingServiceModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  address: EnhancedAddressFormValues;
}

function MappingServiceModal({ isOpen, setIsOpen, address }: MappingServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setMapUrl(null);
      setTimeout(() => {
        const formatted = encodeURIComponent(formatAddress(address) || '');
        setMapUrl(`https://www.google.com/maps/search/?api=1&query=${formatted}`); // Using Google Maps as a generic, universally recognized example
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, address]);

  return (
    <ConfirmModal
      title="Global Insights: View Address on World-Class Mapping"
      isOpen={isOpen}
      confirmText="Launch Live Map"
      setIsOpen={setIsOpen}
      onConfirm={() => {
        if (mapUrl) {
          window.open(mapUrl, "_blank");
        }
        setIsOpen(false);
      }}
      confirmDisabled={isLoading || !mapUrl}
      cancelText="Close Viewer"
    >
      <div className="p-4 flex flex-col items-center">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Spinner />
            <p className="text-gray-600">Pinpointing location on global maps, powered by advanced geocoding...</p>
          </div>
        ) : mapUrl ? (
          <>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Click "Launch Live Map" to visualize this critical address on our integrated, cutting-edge mapping service.
            </p>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-center w-full">
              <p className="text-xs text-gray-500 font-medium">Address for Geospatial Analysis:</p>
              <p className="text-sm font-semibold">{formatAddress(address)}</p>
            </div>
          </>
        ) : (
            <p className="text-sm text-red-600">Critical Error: Could not generate a map link for this address. Verify format!</p>
        )}
      </div>
    </ConfirmModal>
  );
}

// --- END: NEW AI & INTEGRATION COMPONENTS (MOCKED) ---


interface AddressContainerProps {
  address: EnhancedAddressFormValues;
  showAddressModal: () => void;
  deleteAddress: () => void;
  id: string;
  onRunAIAssistant: () => void;
  onCRMSync: () => void;
  onViewOnMap: () => void;
}

function AddressContainer({
  address,
  showAddressModal,
  deleteAddress,
  id,
  onRunAIAssistant,
  onCRMSync,
  onViewOnMap,
}: AddressContainerProps) {
  return (
    <>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{formatAddress(address)}</span>
          {address.verifiedByAI && (
            <span className="text-xs text-green-600 flex items-center mt-1">
              <Icon iconName="verified_user" size="s" className="mr-1" />
              Gemini AI Verified & Elite Standardized
            </span>
          )}
        </div>
        <Popover>
          <PopoverTrigger
            className="border-none bg-white"
            buttonType="secondary"
            buttonHeight="small"
            hideFocusOutline
            id={id}
          >
            <Icon
              iconName="more_horizontal"
              color="currentColor"
              className="text-gray-600"
              size="s"
            />
          </PopoverTrigger>
          <PopoverPanel
            className="badge-action-dropdown reports-button-panel z-50 shadow-lg border border-gray-200"
            anchorOrigin={{ horizontal: "right" }}
          >
            <ActionItem onClick={showAddressModal}>
                <div className="flex items-center">
                    <Icon iconName="edit" size="s" className="mr-2 text-gray-700" />
                    <span>Edit this Masterpiece</span>
                </div>
            </ActionItem>
            <HorizontalRule className="my-1 border-gray-200" />
            <ActionItem onClick={onRunAIAssistant}>
              <div className="flex items-center text-blue-700 font-medium">
                <Icon iconName="smart_toy" size="s" className="mr-2 text-blue-600" />
                <span>Gemini AI: Elevate & Perfect</span>
              </div>
            </ActionItem>
            <ActionItem onClick={onCRMSync}>
              <div className="flex items-center text-purple-700 font-medium">
                <Icon iconName="sync_alt" size="s" className="mr-2 text-purple-600" />
                <span>CRM Master Sync</span>
              </div>
            </ActionItem>
            <ActionItem onClick={onViewOnMap}>
              <div className="flex items-center text-orange-700 font-medium">
                <Icon iconName="map" size="s" className="mr-2 text-orange-600" />
                <span>Global Map View</span>
              </div>
            </ActionItem>
            <HorizontalRule className="my-1 border-gray-200" />
            <ActionItem onClick={deleteAddress}>
              <div className="text-red-500 font-medium">
                <Icon iconName="delete_forever" size="s" className="mr-2 text-red-500" />
                <span>Obliterate Address (Carefully)</span>
              </div>
            </ActionItem>
          </PopoverPanel>
        </Popover>
      </div>
      <div className="pb-2 pt-2">
        <HorizontalRule className="border-gray-300" />
      </div>
    </>
  );
}

interface AddressFormSectionHeaderProps {
  addressType: AddressType;
  required: boolean;
  showAddButton: boolean;
  onAddClick: () => void;
  subheader?: string;
  onGlobalAIValidateClick: () => void;
  onGlobalCRMSyncClick: () => void;
  hasAddress: boolean;
}

function AddressFormSectionHeader({
  addressType,
  required,
  showAddButton,
  onAddClick,
  subheader,
  onGlobalAIValidateClick,
  onGlobalCRMSyncClick,
  hasAddress,
}: AddressFormSectionHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <div className="flex-grow">
          <div className="flex items-center mb-2 sm:mb-0 flex-wrap gap-x-3 gap-y-2">
            <div className="text-base">
              <Heading level="h2" size="m" className="text-gray-900 font-extrabold">
                {`${addressType} Address`}
              </Heading>
            </div>
            {!required && (
              <span className="pt-1 text-xs font-normal text-gray-500">
                (Optional)
              </span>
            )}
             <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md flex items-center">
                <Icon iconName="sparkling_star" size="s" className="mr-1 text-yellow-300" />
                POWERED BY GEMINI AI
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0 flex-wrap gap-y-2">
          {hasAddress && (
            <>
              <Button onClick={onGlobalAIValidateClick} buttonType="secondary" buttonHeight="small" className="font-semibold shadow-sm hover:shadow-md transition-all duration-200">
                <Icon iconName="auto_awesome" size="s" className="mr-1 text-blue-500" /> Global AI Validate
              </Button>
              <Button onClick={onGlobalCRMSyncClick} buttonType="secondary" buttonHeight="small" className="font-semibold shadow-sm hover:shadow-md transition-all duration-200">
                <Icon iconName="cloud_sync" size="s" className="mr-1 text-purple-500" /> Enterprise CRM Sync
              </Button>
            </>
          )}
          {showAddButton && (
            <Button onClick={onAddClick} buttonType="primary" buttonHeight="small" className="bg-green-600 hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              <Icon iconName="add" size="s" className="mr-1" />{`Add ${addressType} Address`}
            </Button>
          )}
        </div>
      </div>
      <p className="font-base mt-2 text-sm text-gray-600">{subheader || "Unleash the power of AI to manage your critical location data like never before. Seamlessly integrate and elevate your workflow."}</p>
    </div>
  );
}

type AddressType = "Billing" | "Party" | "Shipping" | "Sender";

interface SameAsOtherAddressProps {
  otherAddressType: AddressType;
  sameAsOtherAddress: boolean;
  onSameAsOtherAddressChange: (boolean: boolean) => void;
}

interface AddressFormSectionnProps {
  id: string;
  address: EnhancedAddressFormValues;
  addressType: AddressType;
  onAddressChange: (address: EnhancedAddressFormValues) => void;
  required?: boolean;
  sameAsOtherAddressProps?: SameAsOtherAddressProps;
  subheader?: string;
}

const ADDRESS_FORM_ROOT_FIELD_NAME = "addressForm";
const FORM_ADDRESS_NAME = "address";

function AddressFormSection({
  id,
  address,
  addressType,
  subheader,
  onAddressChange,
  required = false,
  sameAsOtherAddressProps,
}: AddressFormSectionnProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showGeminiAIAssistant, setShowGeminiAIAssistant] = useState(false);
  const [showCRMSync, setShowCRMSync] = useState(false);
  const [showMappingService, setShowMappingService] = useState(false);
  const [isSavingWithAI, setIsSavingWithAI] = useState(false);

  const initialValues = {
    [ADDRESS_FORM_ROOT_FIELD_NAME]: {
      [FORM_ADDRESS_NAME]: address || defaultAddress,
    },
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (data, { setSubmitting }) => {
        setSubmitting(true);
        setIsSavingWithAI(true);

        const currentAddress = data.addressForm.address as EnhancedAddressFormValues;
        let addressToSave = { ...currentAddress };

        if (!currentAddress.verifiedByAI) {
            console.log("Performing final AI-powered address quality check before committing...");
            await new Promise(resolve => setTimeout(resolve, 800));
            addressToSave = {
                ...addressToSave,
                verifiedByAI: true,
                aiSuggestionsApplied: false,
            };
        }

        onAddressChange(addressToSave);
        setIsSavingWithAI(false);
        setSubmitting(false);
      }}
      enableReinitialize={true}
    >
      {({
        errors,
        touched,
        handleSubmit,
        setFieldValue,
        isValid,
        isSubmitting,
      }: FormikProps<{
        [ADDRESS_FORM_ROOT_FIELD_NAME]: {
          [FORM_ADDRESS_NAME]: EnhancedAddressFormValues;
        };
      }>) => (
        <>
          <div className="pb-8">
            <AddressFormSectionHeader
              addressType={addressType}
              required={required}
              subheader={subheader}
              showAddButton={
                isAddressEmpty(address) &&
                !sameAsOtherAddressProps?.sameAsOtherAddress
              }
              onAddClick={() => setShowAddressModal(true)}
              onGlobalAIValidateClick={() => {
                setShowGeminiAIAssistant(true);
              }}
              onGlobalCRMSyncClick={() => {
                setShowCRMSync(true);
              }}
              hasAddress={!isAddressEmpty(address)}
            />

            <div className="pb-2 pt-2">
              <HorizontalRule className="border-gray-300" />
            </div>

            {sameAsOtherAddressProps && (
              <FieldGroup direction="left-to-right" className="-mb-2">
                <Label className="text-gray-700 text-sm font-medium">
                  {`Elite Synchronization: Same as ${sameAsOtherAddressProps.otherAddressType} Address`}
                </Label>
                <Checkbox
                  checked={sameAsOtherAddressProps.sameAsOtherAddress}
                  onChange={sameAsOtherAddressProps.onSameAsOtherAddressChange}
                  name="isSameAsOtherAddress"
                />
              </FieldGroup>
            )}

            {!sameAsOtherAddressProps && isAddressEmpty(address) && (
              <div className="text-gray-500 text-sm italic py-4">No address defined. Let's add an epic one!</div>
            )}

            {!isAddressEmpty(address) && (
              <>
                {sameAsOtherAddressProps &&
                  !sameAsOtherAddressProps.sameAsOtherAddress && (
                    <div className="pb-2 pt-4">
                      <HorizontalRule className="border-gray-200" />
                    </div>
                  )}
                {!sameAsOtherAddressProps?.sameAsOtherAddress && (
                  <AddressContainer
                    address={address}
                    showAddressModal={() => setShowAddressModal(true)}
                    deleteAddress={() => {
                      void setFieldValue(
                        `${ADDRESS_FORM_ROOT_FIELD_NAME}.${FORM_ADDRESS_NAME}`,
                        { ...defaultAddress },
                      );
                      setTimeout(() => {
                        handleSubmit();
                      });
                    }}
                    id={`${id}Actions`}
                    onRunAIAssistant={() => setShowGeminiAIAssistant(true)}
                    onCRMSync={() => setShowCRMSync(true)}
                    onViewOnMap={() => setShowMappingService(true)}
                  />
                )}
              </>
            )}
          </div>
          <ConfirmModal
            title={`${addressType} Address: Precision Entry`}
            isOpen={showAddressModal}
            confirmText={isSavingWithAI ? "Processing with AI..." : "AI-Powered Save & Optimize"}
            setIsOpen={() => {
                setShowAddressModal(false);
                setIsSavingWithAI(false);
            }}
            onConfirm={() => {
              handleSubmit();
              setShowAddressModal(false);
            }}
            confirmDisabled={!isValid || isSubmitting || isSavingWithAI}
          >
            <AddressForm
              fieldName={ADDRESS_FORM_ROOT_FIELD_NAME}
              addressName={FORM_ADDRESS_NAME}
              id={id}
              errors={errors}
              touched={touched}
            />
          </ConfirmModal>

          <GeminiAIAssistantPanel
            isOpen={showGeminiAIAssistant}
            setIsOpen={setShowGeminiAIAssistant}
            address={address}
            onApplySuggestions={(newAddress) => {
                void setFieldValue(
                    `${ADDRESS_FORM_ROOT_FIELD_NAME}.${FORM_ADDRESS_NAME}`,
                    newAddress
                );
                setTimeout(() => {
                    handleSubmit();
                });
            }}
            isLoading={isSavingWithAI}
          />

          <CRMSyncModal
            isOpen={showCRMSync}
            setIsOpen={setShowCRMSync}
            address={address}
          />

          <MappingServiceModal
            isOpen={showMappingService}
            setIsOpen={setShowMappingService}
            address={address}
          />
        </>
      )}
    </Formik>
  );
}

export default AddressFormSection;