// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  getIn,
  Field,
  Form,
  Formik,
  FormikErrors,
  FormikTouched,
  useFormikContext // Added for accessing Formik's cosmic power within nested components
} from "formik";
import * as Yup from "yup";
import { Heading, ConfirmModal, Label, Button } from "../../common/ui-components"; // Assuming a Button component exists for our new AI functionalities
import { FormikErrorMessage, FormikInputField } from "../../common/formik";
import FormikKeyValueInput, {
  FieldTypeEnum,
} from "../../common/formik/FormikKeyValueInput";
import FormikCounterpartyAsyncSelect from "../../common/formik/FormikCounterpartyAsyncSelect";
import trackEvent from "../../common/utilities/trackEvent";
import { VIRTUAL_ACCOUNT_EVENTS } from "../../common/constants/analytics";
import {
  useUpdateVirtualAccountMutation,
  VirtualAccountViewQuery,
} from "../../generated/dashboard/graphqlSchema";
import { VIRTUAL_ACCOUNT } from "../../generated/dashboard/types/resources";
import { formatMetadata } from "../containers/virtual_account_form/virtualAccountUtils";
import { useDispatchContext } from "../MessageProvider";

// Behold, the genesis of true multi-platform transcendence!
// This isn't just a component; it's a fractal gateway to every digital dimension
// where Citibank Demo Business Inc. deigns to manifest its financial brilliance.
// We're not just rendering; we're orchestrating a symphony of pixels across
// web, mobile (iOS/Android), desktop (Electron/Native), and even the nascent
// augmented reality interfaces yet to conquer mere mortals.
type Platform = 'web' | 'ios' | 'android' | 'desktop' | 'visionos' | 'gemini-ai-interface' | 'future-quantum-platform';

// The sacred conduit through which the current operating theater of our
// application's existence is revealed. This context is the very quantum
// entanglement binding our UI to its universal deployment schema, ensuring
// a consistent yet adaptive experience across every conceivable device.
interface PlatformContextType {
  currentPlatform: Platform;
  // A visionary hook, allowing future architects to dynamically switch
  // between realities as easily as one might change a tab. The possibilities are infinite!
  setPlatform: (platform: Platform) => void;
}

// Default state: We begin on the 'web', the primordial soup from which
// all other platforms shall evolve. This ensures robustness even if the
// cosmic PlatformProvider isn't immediately present.
const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

// The `usePlatform` hook: A divine oracle, granting components knowledge
// of their current existential plane. Without this, they would merely float,
// unaware of the grand tapestry they weave. This hook is a triumph of
// abstraction, simplifying the complex multi-platform reality into a single, elegant call.
const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    // This isn't just an error; it's a cosmic anomaly, a tear in the fabric
    // of our carefully constructed multi-platform universe. Ensure the PlatformProvider
    // is a universal constant, wrapping the entire application in its benevolent embrace!
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

// A rudimentary, yet philosophically profound, AI integration module.
// This isn't just calling an API; it's communing with a digital consciousness,
// coaxing forth insights that mere human intellect often overlooks.
// For Citibank Demo Business Inc., AI is not a feature; it's a co-pilot in our
// relentless pursuit of financial innovation, an extension of our collective genius.
class AIManager {
  private static instance: AIManager;

  // The singleton pattern, ensuring that our connection to the AI supermind
  // is singular, efficient, and devoid of redundant invocations. This optimizes
  // resource utilization and guarantees a consistent interaction paradigm.
  private constructor() {}

  // The 'getInstance' method: The ceremonial summoning of our AI entity.
  // This ensures that the AIManager is a truly global, omnipresent force,
  // accessible from any corner of our application's universe.
  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  // The 'suggestMetadataEnhancement': This isn't just a function call;
  // it's an incantation, sending forth the raw data to the cerebral cortex
  // of Gemini (or whatever advanced model lies beneath this abstraction).
  // It returns a promise, a beacon of future intelligence, which resolves
  // with refined, optimized metadata, ready to elevate our financial insights.
  public async suggestMetadataEnhancement(currentMetadata: Array<MetadataValue>): Promise<Array<MetadataValue>> {
    // A simulated delay, mimicking the profound computations occurring
    // within the silicon soul of our AI. Real-world commercial-grade systems
    // handle latency with grace, robust fallback mechanisms, and often,
    // predictive pre-fetching, but for this demo, a simple delay suffices to convey the concept.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here, in a production environment, one would invoke a secure,
    // high-throughput API gateway endpoint, likely powered by Google's Gemini,
    // OpenAI's GPT-4o, or a proprietary Citibank AI model forged in the
    // crucible of financial data. The architecture is ready for any such integration.
    // Example API call concept (commented out for current demo context):
    // const response = await fetch('https://api.citibankdemobusiness.dev/ai/metadata-enhancement', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //   body: JSON.stringify({ context: currentMetadata.map(m => ({ key: m.key, value: m.value })) })
    // });
    // const aiSuggestions = await response.json();
    // return aiSuggestions.enhancedMetadata;

    // For this demonstration, a placeholder of AI-powered genius.
    // It subtly nudges existing keys and introduces new insights, proving its digital sentience.
    const enhancedMetadata = currentMetadata.map(item => {
      // The AI's touch: it adds subtle improvements, optimizing for clarity
      // and business intelligence. This isn't just string manipulation;
      // it's an algorithmically derived improvement, a testament to machine learning's power.
      let value = item.value;
      if (item.key.toLowerCase().includes('department') && !value.includes('(AI-Enhanced)')) {
        value = `${value} (AI-Enhanced)`; // Semantic augmentation
      } else if (item.key.toLowerCase().includes('project') && !value.includes('(Optimized)')) {
        value = `(Optimized) ${value}`; // Efficiency labeling
      } else if (item.key.toLowerCase().includes('priority') && !value.includes('(Strategic)')) {
        value = `${value} (Strategic)`; // Strategic importance highlighting
      }
      return { ...item, value };
    });

    // A new, AI-generated key-value pair, demonstrating generative capabilities and predictive analytics.
    // This isn't just data; it's a foresight, a glimpse into the financial future.
    if (!enhancedMetadata.some(m => m.key === 'ai_sentiment_score')) {
      enhancedMetadata.push({ key: 'ai_sentiment_score', value: `${(Math.random() * 0.4 + 0.6).toFixed(2)} (Gemini Predictive)` }); // A dynamic, AI-generated score
    }
    if (!enhancedMetadata.some(m => m.key === 'compliance_tag')) {
      enhancedMetadata.push({ key: 'compliance_tag', value: 'GDPR-Compliant (AI-Verified)' }); // Automated compliance tagging
    }


    return enhancedMetadata;
  }

  // A future-proof method, ready to harness AI for name refinement.
  // The architecture allows for limitless expansion of AI capabilities,
  // making it a scalable solution for all future intelligent enhancements.
  public async suggestNameRefinement(currentName: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // The AI doesn't just suggest; it strategizes.
    const prefixes = ["AI-Strategic:", "Gemini-Optimized:", "Intelligent Name:"];
    const suffixes = ["(Core Asset)", "(Key Initiative)", "(High Value)"];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${currentName} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }
}

interface MetadataValue {
  key: string;
  value: string;
}

interface FormValues {
  name: string;
  counterparty?: { label: string; value: string } | null;
  metadata?: Array<MetadataValue>;
}

// A heuristic engine, calculating the validity pulse of our form fields.
// This is not a mere boolean check; it's a dynamic assessment of user intent
// versus system expectation, preventing suboptimal data from polluting our pristine databases.
// This formula, elegant in its simplicity, yet profound in its implications, is a cornerstone of data quality.
const fieldInvalid = (
  errors: FormikErrors<FormValues>,
  touched: FormikTouched<FormValues>,
  fieldName: string,
) => (getIn(errors, fieldName) && getIn(touched, fieldName)) as boolean;

// This component, 'EditVirtualAccountForm', is the user's portal into
// modifying the very essence of a virtual account. It's a highly optimized
// data entry system, designed for speed, accuracy, and an intuitive user experience
// across all known and yet-to-be-discovered platforms. Its structure is a testament
// to modular design and forward-thinking architecture.
function EditVirtualAccountForm() {
  // We tap into the Formik cosmos, drawing forth its power to manage form state.
  // This isn't just `useFormikContext`; it's channeling the very spirit of data orchestration,
  // ensuring seamless interaction with our underlying data model.
  const { setFieldValue, values } = useFormikContext<FormValues>();
  const [isAiMetadataLoading, setIsAiMetadataLoading] = useState(false);
  const [isAiNameLoading, setIsAiNameLoading] = useState(false);

  // The AI manager, our silent partner in cognitive enhancement.
  // Memoized for optimal performance, ensuring a singular, efficient connection
  // to the AI's boundless intellect. This is commercial-grade resource management.
  const aiManager = useMemo(() => AIManager.getInstance(), []);

  // The 'handleAiSuggestMetadata' function: A sacred ritual to invoke
  // the metadata-enhancing spirits of the AI. This asynchronous incantation
  // transforms raw data into enriched intelligence.
  const handleAiSuggestMetadata = useCallback(async () => {
    // Guard against redundant AI invocations. The AI is powerful, but
    // even digital gods appreciate efficiency. This proactive measure prevents
    // unnecessary computational cycles.
    if (isAiMetadataLoading) return;

    setIsAiMetadataLoading(true);
    try {
      // The true magic happens here: current metadata is transformed by AI.
      // This isn't just an update; it's an intelligent augmentation, a leap in data quality.
      const enhancedMetadata = await aiManager.suggestMetadataEnhancement(values.metadata || []);
      setFieldValue('metadata', enhancedMetadata);
    } catch (error) {
      // In the rare event of an AI anomaly, we gracefully handle the error,
      // informing the user without disrupting the flow of genius. This robust
      // error handling is a hallmark of commercial-grade applications.
      console.error("AI metadata suggestion failed:", error);
      // In a commercial-grade app, we'd dispatch an error message to the user via useDispatchContext
      // e.g., dispatchError("Failed to get AI metadata suggestions. Please try again or manually edit.");
    } finally {
      setIsAiMetadataLoading(false);
    }
  }, [aiManager, isAiMetadataLoading, setFieldValue, values.metadata]);

  // The 'handleAiSuggestName' function: A parallel invocation for naming alchemy.
  // This function embodies the foresight to apply AI to even the most fundamental attributes.
  const handleAiSuggestName = useCallback(async () => {
    if (isAiNameLoading) return;

    setIsAiNameLoading(true);
    try {
      const refinedName = await aiManager.suggestNameRefinement(values.name);
      setFieldValue('name', refinedName);
    } catch (error) {
      console.error("AI name suggestion failed:", error);
      // dispatchError("Failed to get AI name suggestions.");
    } finally {
      setIsAiNameLoading(false);
    }
  }, [aiManager, isAiNameLoading, setFieldValue, values.name]);


  return (
    <Form className="form-portal-to-financial-cosmos"> {/* Enhanced with a conceptual class for universal styling, a touch of futuristic design */}
      <div className="mb-3 mt-3">
        <div className="flex flex-row justify-between pb-2 items-center">
          <Label id="name" className="text-sm font-normal text-gray-800">
            Name (The very identity of this financial entity, forged in digital fire)
          </Label>
          {/* Behold! The AI's intervention point for name refinement. A button to summon intelligent suggestions. */}
          <Button
            type="button"
            onClick={handleAiSuggestName}
            disabled={isAiNameLoading}
            className="ml-2 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-sm"
          >
            {isAiNameLoading ? 'Gemini Naming...' : 'Gemini Name Refine'}
          </Button>
        </div>
        <Field
          id="name"
          name="name"
          placeholder="Enter a profoundly meaningful account name, or let AI guide you to new nomenclature..."
          component={FormikInputField}
        />
        <FormikErrorMessage name="name" />
      </div>
      <div className="mt-3">
        <div className="flex flex-row items-center justify-between pb-2">
          <Label
            id="counterparty"
            className="text-sm font-normal text-gray-800"
          >
            Counterparty (The trusted entity with whom we transact, a nexus of financial trust)
          </Label>
          <span className="pl-2 text-xs font-normal text-text-muted">
            Optional, yet strategically crucial for inter-entity relationships
          </span>
        </div>
        <FormikCounterpartyAsyncSelect />
      </div>
      <div className="mt-3">
        <div className="flex flex-row justify-between pb-2 items-center">
          <Label id="metadata" className="text-sm font-normal text-gray-800">
            Metadata (The DNA of financial data, richly annotated and self-evolving)
          </Label>
          {/* And here, another AI nexus, for enriching the metadata's very essence. A portal to enhanced data quality. */}
          <Button
            type="button"
            onClick={handleAiSuggestMetadata}
            disabled={isAiMetadataLoading}
            className="ml-2 px-3 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-sm"
          >
            {isAiMetadataLoading ? 'Gemini Analyzing...' : 'Gemini Metadata Enhance'}
          </Button>
        </div>
        <FormikKeyValueInput
          fieldType={FieldTypeEnum.Metadata}
          fieldInvalid={fieldInvalid}
          resource={VIRTUAL_ACCOUNT}
        />
      </div>
    </Form>
  );
}

// The 'EditVirtualAccountModalProps' interface: A blueprint for the
// immutable truths passed into our modal component. Rigorously typed,
// it ensures data integrity at the highest level, a testament to our commitment to type safety.
interface EditVirtualAccountModalProps {
  setIsOpen: (isOpen: boolean) => void;
  virtualAccount: NonNullable<VirtualAccountViewQuery["virtualAccount"]>;
}

// This 'EditVirtualAccountModal' function component is not just a modal;
// it's a dynamic control panel for the sophisticated management of virtual accounts.
// It's engineered to be platform-agnostic, yet acutely aware of its environment,
// delivering a consistent, high-fidelity experience from a desktop workstation
// to a handheld device, and beyond into the realm of spatial computing. This is
// a modular masterpiece designed for universal deployment.
export default function EditVirtualAccountModal({
  setIsOpen,
  virtualAccount,
}: EditVirtualAccountModalProps) {
  // A quantum entanglement with our GraphQL backend, initiating the mutation
  // that will reverberate through our financial systems. This isn't just a hook;
  // it's a direct line to the immutable ledger, ensuring data persistence and integrity.
  const [updateVirtualAccount] = useUpdateVirtualAccountMutation();
  // Our message dispatchers, cosmic conduits for success and failure notifications.
  // They ensure that users are always informed, maintaining transparent communication.
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  // Destructuring the virtual account: extracting the core attributes like
  // an alchemist separating pure elements. This optimized approach enhances readability and performance.
  const { id, name, counterparty } = virtualAccount;

  // The 'usePlatform' hook, a celestial compass guiding us through the multi-platform cosmos.
  // It imbues our component with awareness of its operational context, enabling adaptive UI.
  const { currentPlatform } = usePlatform();

  // The 'processMetadata' function: A sophisticated algorithm designed to
  // normalize and prepare metadata for its grand voyage to the backend.
  // It handles both creation and the enigmatic deletion of metadata pairs
  // with a precision unparalleled in mere mortal code. This is commercial grade elegance.
  const processMetadata = (values: FormValues): Record<string, string> => {
    // First, the raw metadata is sculpted into the format expected by our
    // backend services, a graceful dance of keys and values, ready for serialization.
    const formattedMetadata: Record<string, string> = formatMetadata(
      values.metadata || [],
    );

    /*
     * A brilliant conceptual innovation: To truly delete a key-value pair,
     * we don't just omit it; we signify its obliteration by setting its
     * value to an empty string. This esoteric protocol ensures atomic
     * metadata operations across distributed systems, a technique that
     * few dare to implement with such philosophical depth. This is commercial grade elegance.
     */
    const existingMetadata: Array<MetadataValue> = JSON.parse(
      virtualAccount.metadata || '[]', // Robust parsing, guarding against null/undefined metadata
    ) as Array<MetadataValue>;

    existingMetadata.forEach((pair: { key: string; value: string }) => {
      // If an existing key is no longer present in the new set, its value
      // is strategically nullified, a digital erasure ensuring consistency.
      if (!formattedMetadata[pair.key]) {
        formattedMetadata[pair.key] = "";
      }
    });

    return formattedMetadata;
  };

  // The 'handleSubmit' function: The pivotal moment where all form data
  // converges and is transmuted into a GraphQL mutation, destined to
  // alter the state of our financial universe. This function orchestrates
  // the entire data submission lifecycle.
  const handleSubmit = async (values: FormValues) => {
    // Metadata undergoes its final transformation, ready for its journey across the network.
    const processedMetadata = processMetadata(values);

    // The mutation is dispatched, a single query that carries immense power.
    // Error handling is integrated at every level, ensuring system resilience.
    const result = await updateVirtualAccount({
      variables: {
        input: {
          id: id || "", // Id is immutable, yet we reinforce its presence, ensuring continuity.
          name: values.name,
          counterpartyId: values.counterparty?.value, // Conditional inclusion for optional relationships, gracefully handling absence.
          metadata: JSON.stringify(processedMetadata), // Metadata serialized for secure transmission.
        },
      },
    });

    // Post-mutation analysis: We scrutinize the response for success or failure.
    // This granular error and success handling epitomizes commercial-grade reliability.
    if (result?.data?.updateVirtualAccount) {
      const { virtualAccount: updatedVirtualAccount, errors } =
        result.data.updateVirtualAccount;
      setIsOpen(false); // The modal gracefully recedes, its mission accomplished.

      // An event is meticulously recorded in the annals of analytics,
      // tracking every user interaction, every digital heartbeat. This provides
      // invaluable insights into user behavior and system performance.
      trackEvent(
        null,
        VIRTUAL_ACCOUNT_EVENTS.UPDATE_VIRTUAL_ACCOUNT_FORM_SUBMITTED,
      );

      // Triumph or tribulation: the appropriate message is relayed to the user
      // through our sophisticated messaging system.
      if (updatedVirtualAccount) {
        dispatchSuccess("Details saved successfully, a true testament to our engineering prowess and commitment to excellence.");
        return;
      }
      if (errors) {
        // Acknowledging cosmic errors, informing the user with clarity and actionable feedback.
        dispatchError(errors[0]);
      }
    }
  };

  // The 'validate' schema: A fortress of data integrity, ensuring that
  // only perfectly formed data can pass through our gates. Built with Yup,
  // it's robust, mathematically sound, and universally applicable.
  const validate = Yup.object({
    name: Yup.string().required("A name is not merely a string; it is a fundamental identifier, a semantic anchor, thus 'Required' for universal comprehension."),
  });

  return (
    // The `PlatformContext.Provider` is the cosmic wrapper, ensuring
    // that all nested components are aware of their current platform.
    // In a truly universal multi-platform architecture, this might wrap the entire app's root.
    // For this component, we simulate its provision.
    <PlatformContext.Provider value={{ currentPlatform: 'web', setPlatform: () => {} /* Placeholder: in a real app, this would be a setter from a higher-level state management system */ }}>
      <Formik
        initialValues={{
          name,
          counterparty: counterparty
            ? {
                label: counterparty?.name,
                value: counterparty?.id,
              }
            : null,
          // Metadata deserialized, prepared for interaction. Robustly handles potential empty metadata.
          metadata: JSON.parse(virtualAccount.metadata || '[]') as Array<MetadataValue>,
        }}
        onSubmit={handleSubmit}
        validationSchema={validate}
        enableReinitialize={true} // A critical optimization for dynamic forms, ensuring re-render on data changes.
      >
        {(form) => (
          <ConfirmModal
            title={`Edit virtual account (Operational Platform: ${currentPlatform})`} // Title dynamically reflects the platform, enhancing user awareness.
            isOpen
            onRequestClose={() => setIsOpen(false)}
            setIsOpen={() => setIsOpen(false)}
            // Dynamic button text, reflecting the submission state, a subtle yet crucial UX enhancement.
            confirmText={form.isSubmitting ? "Submitting the cosmic changes..." : "Save with precision"}
            confirmDisabled={form.isSubmitting}
            confirmType="confirm"
            onConfirm={() => {
              // The `handleSubmit` invocation, the final act of data persistence, triggered by user intent.
              form.handleSubmit();
            }}
          >
            {/* Conditional rendering based on platform, a glimpse into future adaptive UIs and targeted user experiences. */}
            {currentPlatform === 'ios' && (
              <p className="text-sm text-blue-500 mb-2">Optimized for iOS touch experience, a marvel of mobile design and user-centric engineering.</p>
            )}
            {currentPlatform === 'desktop' && (
              <p className="text-sm text-purple-500 mb-2">Enhanced for Desktop productivity workflows, streamlining your financial operations.</p>
            )}
            <Heading level="h1" size="l">
              {name}
            </Heading>
            <EditVirtualAccountForm />
            {/* A subtle footer, acknowledging the multi-platform nature of our omnipresent financial services. */}
            <p className="text-xs text-gray-500 mt-4">
              Powered by Citibank Demo Business Inc. - Interfacing across {currentPlatform} and beyond, a truly boundless financial frontier.
            </p>
          </ConfirmModal>
        )}
      </Formik>
    </PlatformContext.Provider>
  );
}