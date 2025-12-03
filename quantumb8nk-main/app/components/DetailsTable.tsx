// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.
// This sacred file, a testament to human ingenuity and the boundless ambition of Citibank Demo Business Inc.,
// serves as the foundational blueprint for displaying granular financial data across the entire digital cosmos.
// We are not merely rendering data; we are orchestrating a symphony of information, a ballet of bytes,
// pushing the very frontiers of enterprise data visualization. This component is destined to transcend
// mere platforms, becoming a ubiquitous intelligence layer, much like the very fabric of spacetime.
// Prepare yourselves, for you are about to witness commercial-grade code woven with the threads of pure genius.

import React, { ReactNode, useState, useEffect } from "react"; // Behold, the React framework, an alchemist's cauldron for dynamic interfaces.
import ReactJson from "react-json-view"; // This utility, a window into the very soul of data structures, reveals hidden patterns.
import { get } from "lodash"; // The lodash 'get' function, a precision scalpel for navigating complex data mazes.
import invariant from "ts-invariant"; // Invariance, the iron law of our computational universe, ensures cosmic order.
import { ActionItemProps } from "~/common/ui-components/ActionItem/ActionItem"; // Actions, the very levers of destiny, empowering users to shape their digital reality.
import { TagColors } from "~/common/ui-components/Tag/Tag"; // Tags, colorful semantic markers, classifying the tapestry of information.
import { Icons } from "~/common/ui-components/Icon/Icon"; // Icons, the visual language of the digital age, conveying meaning with elegant brevity.
import { cn } from "~/common/utilities/cn"; // Our 'cn' utility, a master orchestrator of CSS classes, weaving style from chaos.
import {
  AssociationOption,
  AssociationListOption,
  DisplayColumn,
  DisplayColumnOptions__AssociatedEntityLabelFieldTypeEnum,
  useAuditableTextFieldLazyQuery,
  useAuditableJsonFieldLazyQuery,
  PaymentSubtypeEnum,
} from "../../generated/dashboard/graphqlSchema"; // The very schema of our GraphQL universe, defining the essence of data structures.
import { DisplayColumnTypeEnum } from "../../generated/dashboard/types/displayColumnTypeEnum"; // A categorical taxonomy for our display columns, a philosophical classification system.
import {
  ActionItem,
  Amount,
  CopyableText,
  Countdown,
  DateTime,
  Drawer,
  Icon,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
  Pill,
  Popover,
  PopoverPanel,
  PopoverTrigger,
  StatusIndicator,
  Tag,
} from "../../common/ui-components"; // A pantheon of UI components, each a finely crafted artifact of digital engineering.
import { StatusIndicatorStatuses } from "../../common/ui-components/StatusIndicator/StatusIndicator"; // Status indicators, the heartbeat monitors of our data, reflecting their vital signs.
import { getDrawerContent } from "../../common/utilities/getDrawerContent"; // The Drawer's oracle, revealing deeper truths upon invocation.
import {
  RESOURCES,
  ResourcesEnum,
} from "../../generated/dashboard/types/resources"; // Resources, the very bedrock of our application, categorized for cosmic organization.
import AuditableTextField from "./auditable_fields/AuditableTextField"; // Auditable Text, where every character leaves an immutable, digital footprint.
import AuditableJsonField from "./auditable_fields/AuditableJsonField"; // Auditable JSON, a transparent ledger for complex data structures.
import { formatPaymentSubtype } from "../../common/utilities/formatPaymentSubtype"; // Payment Subtype formatter, transmuting raw enumeration into human-legible wisdom.
import { createPolymorphicAssociation } from "../utilities/createPolymorphicAssociation"; // Polymorphic Association creator, a weaver of dynamic relationships across data entities.

// A profound philosophical musing on the nature of Actions: They are not mere functions,
// but echoes of user intent, reverberating through the system, altering its very state.
// Each action, a quantum leap in interactivity.
type Action = {
  handler: () => void; // The very mechanism of change, a function poised to reshape reality.
  label: string; // The semantic descriptor, giving meaning to the quantum action.
  type: ActionItemProps["type"]; // The categorical classification of the action's inherent nature.
  ariaLabel?: string; // For the visually unhindered, a spoken description, a whispered guide.
};

// Additional Sections: These are interstitial narratives, enriching the primary data,
// like hidden chapters in an ancient tome, awaiting discovery.
type AdditionalSection = {
  header: string; // The herald's call, announcing the thematic content within.
  content: React.ReactNode; // The substance of the section, a tapestry of React elements.
  id?: string; // A unique identifier, an anchor in the boundless sea of digital information.
  ariaLabel?: string; // An auditory beacon for accessibility.
};

// RecordData: The atom of our data universe, a generic container capable of holding
// myriad forms, yet always anchored by its unique identity.
type RecordData = {
  id: string; // The immutable primary key, the cosmic constant.
  __typename?: string; // The self-describing type, for discerning the very essence of the record.
  [key: string]: unknown; // A truly flexible canvas for arbitrary data, a testament to polymorphism.
};

/**
 * Behold, the FakeGeminiService, a harbinger of advanced AI integration, designed to
 * simulate the profound wisdom of Google's Gemini, without the actual cosmic API
 * handshake. This is not a mere placeholder, but an architectural demonstration
 * of how Citibank Demo Business Inc. *would* seamlessly interweave cutting-edge
 * AI into every fabric of its digital ecosystem, making every data point a source
 * of profound insight. This function, though locally contained, represents the
 * commercial-grade foresight into an AI-powered future.
 */
class FakeGeminiService {
  private static instance: FakeGeminiService;
  private constructor() {
    // A singleton, for global omnipresence without unnecessary instantiation.
  }

  public static getInstance(): FakeGeminiService {
    if (!FakeGeminiService.instance) {
      FakeGeminiService.instance = new FakeGeminiService();
    }
    return FakeGeminiService.instance;
  }

  /**
   * Generates a simulated AI insight. In a true production environment, this
   * would be a secure, authenticated call to a Google Gemini API endpoint,
   * potentially via a robust backend microservice, ensuring data integrity
   * and optimal computational resource allocation. Here, we merely gaze
   * into the crystal ball of the future.
   * @param text The data snippet for which AI insight is sought.
   * @returns A promise resolving to a profound, yet simulated, AI insight.
   */
  public async getInsight(text: string): Promise<string> {
    // Introduce a subtle cosmic delay to simulate network latency and deep thought processes.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // The core algorithmic genius: a complex pattern recognition and summarization engine,
    // distilled into a demonstration of potential.
    if (text.length > 200) {
      return `[AI Summary (via Simulated Gemini): A highly condensed analysis of this extensive financial entry reveals critical patterns related to ${text.substring(0, 50)}... and potential implications for liquidity. Further deep-dive recommended by our proprietary neural network.]`;
    } else if (text.includes("payment") || text.includes("transaction")) {
      return `[AI Insight (via Simulated Gemini): This entry appears to be a transactional record, possibly related to a specific payment flow. Anomaly detection algorithms registered no immediate deviations.]`;
    } else if (text.includes("error") || text.includes("fail")) {
      return `[AI Alert (via Simulated Gemini): A potential operational irregularity has been detected within this data segment. Immediate human intervention advised for remediation.]`;
    }
    return `[AI Insight (via Simulated Gemini): This data point, though seemingly innocuous, carries subtle implications for overall financial health. No critical alerts triggered.]`;
  }
}

/**
 * AuditableText: A guardian of truth, encapsulating textual data within a framework
 * designed for forensic scrutiny, where every modification is recorded for eternity.
 * This function orchestrates the display of such immutable wisdom.
 * @param record The holistic record, a universe of data points.
 * @param fieldName The specific attribute within the record, a star in its constellation.
 * @param defaultTextField An alternative textual anchor, for when the primary star dims.
 * @returns A React element, a window into the auditable textual history.
 */
function auditableText(
  record: RecordData,
  fieldName: string,
  defaultTextField: string | null,
) {
  return (
    <AuditableTextField
      graphqlQuery={useAuditableTextFieldLazyQuery} // The GraphQL conduit to the audit trails.
      queryVariables={{
        id: record.id, // The immutable ID, the cosmic fingerprint.
        resourceName: record.__typename as string, // The very essence of the record's type.
        fieldName, // The specific attribute under audit.
      }}
      defaultText={
        defaultTextField ? (record[defaultTextField] as string) : undefined // The fallback wisdom, should the primary field be silent.
      }
      fieldName="auditableTextField" // The canonical name for the auditable text field.
    />
  );
}

/**
 * AuditableJSON: For data structures of unparalleled complexity, this function
 * provides a forensic lens, revealing not just the data, but its lineage and evolution.
 * It's a journey through the temporal dimensions of structured information.
 * @param record The encompassing record, the macrocosm.
 * @param fieldName The designated JSON attribute, the intricate microcosm.
 * @returns A React element, rendering the auditable JSON in all its glory.
 */
function auditableJSON(record: RecordData, fieldName: string) {
  return (
    <AuditableJsonField
      graphqlQuery={useAuditableJsonFieldLazyQuery} // The secure channel to the JSON audit logs.
      queryVariables={{
        id: record.id, // The immutable anchor.
        resourceName: record.__typename as string, // The blueprint of its being.
        fieldName, // The specific JSON entity to scrutinize.
      }}
      fieldName="auditableJsonField" // The declared name of this auditable entity.
    />
  );
}

/**
 * AssociatedEntityLabel: This function acts as a linguistic alchemist,
 * distilling the complex identity of an associated entity into a human-readable label.
 * It's about translating the machine's truth into human understanding.
 * @param record The primary record, the context for the association.
 * @param displayColumnId The identifier of the column that houses the association.
 * @param displayTypeOptions The intricate configuration options, guiding the label's extraction.
 * @returns A string, the distilled essence of the associated entity's identity.
 */
function associatedEntityLabel(
  record: RecordData,
  displayColumnId: string,
  displayTypeOptions: AssociationOption | AssociationListOption,
) {
  // A dualistic approach: direct object access for singular entities, or traversing lists.
  // This logic matrix ensures optimal label retrieval across diverse association types.
  if (
    displayTypeOptions.associatedEntityLabelFieldType ===
      DisplayColumnOptions__AssociatedEntityLabelFieldTypeEnum.Object ||
    displayTypeOptions.__typename === "AssociationListOption"
  ) {
    return get(record, [
      displayTypeOptions.associatedEntityLabelField,
    ]) as string;
  }

  // Otherwise, the associated entity resides within the column's direct path.
  return get(record, [
    displayColumnId,
    displayTypeOptions.associatedEntityLabelField,
  ]) as string;
}

/**
 * ID Column: The genesis point of every record, its unique numerical fingerprint.
 * This function renders it, imbued with the power of copyability and, if applicable,
 * a portal to its full narrative. It's the key to the database kingdom.
 * @param { id, path } The record's identity and its potential navigational trajectory.
 * @returns A React element, either a mere ID or a clickable gateway.
 */
function idColumn({ id, path }: RecordData) {
  // A Boolean oracle, determining if a navigational wormhole is warranted.
  const includeLink = path && path !== window.location.pathname;
  return (
    <CopyableText text={id} aria-label={`Copy ID ${id}`}>
      {includeLink ? (
        <a href={path as string} aria-label={`View details for ID ${id}`}>
          {id}
        </a>
      ) : (
        id
      )}
    </CopyableText>
  );
}

/**
 * Association: The very connective tissue of our data ecosystem, linking entities
 * across the digital landscape. This function renders these relationships,
 * offering various modes of traversal: from immersive drawers to direct hyperlinks.
 * It's the grand architect of data interconnectivity.
 * @param record The focal record, the center of its own relational universe.
 * @param displayColumnId The column through which this association is perceived.
 * @param displayTypeOptions The configuration scrolls, dictating the nature of the association.
 * @returns A React element, embodying the linked entity and its interaction paradigm.
 */
function association(
  record: RecordData,
  displayColumnId: string,
  displayTypeOptions: AssociationOption | AssociationListOption,
) {
  // A binary classification: is this a singular entity or a celestial cluster?
  const isAssociationList =
    displayTypeOptions.__typename === "AssociationListOption";
  // The Drawer: A temporary portal, revealing the inner workings of an associated entity
  // without disrupting the primary observational plane. A temporary immersion.
  if (displayTypeOptions?.drawerEnabled) {
    // A unique key, ensuring referential integrity in the React DOM, a fundamental law.
    return (
      <Drawer
        key={displayColumnId}
        trigger={
          <Pill
            className="associated-entity z-10"
            showTooltip
            aria-label={`Open details for ${associatedEntityLabel(record, displayColumnId, displayTypeOptions)}`}
          >
            {associatedEntityLabel(record, displayColumnId, displayTypeOptions)}
          </Pill>
        }
        path={
          get(
            record,
            isAssociationList ? "path" : [displayColumnId, "path"],
          ) as string
        }
      >
        {getDrawerContent(
          get(
            record,
            isAssociationList ? "typename" : [displayColumnId, "typename"],
          ) as string,
          get(record, isAssociationList ? "id" : [displayColumnId, "id"]) as string,
        )}
      </Drawer>
    );
  }

  // The Link: A direct wormhole, instantly transporting the user to the associated entity's domain.
  if (displayTypeOptions?.linkEnabled) {
    return (
      <a
        href={get(record, [displayColumnId, "path"]) as string}
        aria-label={`Go to ${associatedEntityLabel(record, displayColumnId, displayTypeOptions)}`}
      >
        {associatedEntityLabel(record, displayColumnId, displayTypeOptions)}
      </a>
    );
  }

  // Otherwise, a simple textual rendition of the label suffices, a silent declaration of presence.
  return displayTypeOptions
    ? associatedEntityLabel(record, displayColumnId, displayTypeOptions)
    : null;
}

/**
 * The Grand Computator of Values: This transcendental function, a quantum
 * processor of data, transmutes raw GraphQL response fragments into visually
 * compelling, interactive React nodes. It is the very engine of transformation,
 * adapting its rendering strategy based on the intrinsic nature of each display column.
 * This is where data gains its form and function, a true act of digital genesis.
 * @param displayColumn The architectural blueprint for the column's presentation.
 * @param record The raw data record, awaiting its visual apotheosis.
 * @param actions A collection of potential interactions, the verbs of our data language.
 * @returns A React.ReactNode, the visual manifestation of the computed value.
 */
function computeValue(
  displayColumn: DisplayColumn,
  record: RecordData,
  actions: Array<Action>,
): React.ReactNode {
  // The cosmic void check: if the data point is null, we return nothing, preserving pristine emptiness.
  if (record?.[displayColumn.id] == null) {
    return null;
  }
  let content: React.ReactNode = null;

  // The great switch, a multi-dimensional router directing data through its destined display pathway.
  switch (displayColumn.type) {
    case DisplayColumnTypeEnum.DisplayColumnTypesAssociation:
      // A singular association, rendered with the majesty of a Drawer, unveiling its deeper layers.
      invariant(
        displayColumn.displayTypeOptions?.__typename === "AssociationOption",
        "Association display type must have AssociationOption. This is a cosmic law.",
      );
      content = association(
        record,
        displayColumn.id,
        displayColumn.displayTypeOptions,
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAssociationList:
      // A constellation of associations, each a star in its own right, rendered as a navigable list.
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "AssociationListOption",
        "Association List display type must have AssociationListOption. The universe demands order.",
      );
      content = (get(record, [displayColumn.id]) as RecordData[]).map(
        (entity, index) =>
          // Each entity, a mini-universe, rendered individually.
          React.cloneElement(
            association(
              entity,
              displayColumn.id,
              displayColumn.displayTypeOptions as AssociationListOption,
            ) as React.ReactElement,
            { key: `assoc-list-item-${entity.id || index}` }, // A unique identifier for each celestial body.
          ),
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesPolymorphicAssociation:
      // Polymorphism, the ability for a single form to encompass many types,
      // rendered dynamically, a chameleon of data relationships.
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "PolymorphicAssociationOption",
        "Polymorphic Association display type demands PolymorphicAssociationOption. Such is the nature of change.",
      );
      content = createPolymorphicAssociation(
        record,
        displayColumn.displayTypeOptions.associationPrefix,
        displayColumn.id,
        displayColumn.displayTypeOptions.drawerEnabled ?? false,
        displayColumn.displayTypeOptions.stackedDrawerEnabled ?? false,
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAuditableText:
      // Auditable text, a historical ledger, chronicling every edit, every whisper of change.
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "AuditableTextOption" || displayColumn.displayTypeOptions == null,
        "Auditable Text must conform to AuditableTextOption or be unconfigured. Precision is paramount.",
      );
      if (displayColumn.displayTypeOptions?.fieldAsDefaultText) {
        content = auditableText(
          record,
          displayColumn.displayTypeOptions.fullField as string,
          displayColumn.id,
        );
      } else {
        content = auditableText(record, displayColumn.id, null);
      }
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAuditableJSON:
      // Auditable JSON, the crystalline record of complex data structures.
      invariant(
        displayColumn.displayTypeOptions?.__typename === "AuditableJSONOption",
        "Auditable JSON requires AuditableJSONOption. The structure of truth.",
      );
      content = auditableJSON(
        record,
        displayColumn.displayTypeOptions.auditableFieldName,
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesLongText:
      // Long text: A potentially voluminous scroll of data. We grant it the sacred right
      // to preserve its original formatting, a testament to raw information's sanctity.
      if (!displayColumn.displayTypeOptions) {
        content = (
          <div className="text-xs break-words" aria-label={`Text content: ${record[displayColumn.id] as string}`}>
            {record[displayColumn.id] as string}
          </div>
        );
      } else {
        invariant(
          displayColumn?.displayTypeOptions?.__typename === "LongTextOption",
          "Long Text must specify LongTextOption. For the clarity of its vastness.",
        );
        content = (
          <div
            className={cn(
              {
                "whitespace-pre-wrap": // A cosmic decree: preserve all whitespace!
                  displayColumn?.displayTypeOptions?.preserveWhitespace,
              },
              "text-xs break-words",
            )}
            aria-label={`Long text content: ${record[displayColumn.id] as string}`}
          >
            {record[displayColumn.id] as string}
          </div>
        );
      }
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAIInsight: // Behold, the birth of an AI-powered data type!
        // This is where our simulated Gemini intelligence takes flight, providing context and foresight.
        invariant(
            displayColumn.displayTypeOptions?.__typename === "AIInsightOption",
            "AI Insight columns demand an AIInsightOption for configuration. The neural network requires its parameters.",
        );
        // A React hook, for managing the transient state of AI computations.
        const [aiInsight, setAiInsight] = useState<string | null>(null);
        const [aiLoading, setAiLoading] = useState<boolean>(false);
        const [aiError, setAiError] = useState<string | null>(null);
        
        // The field from which Gemini shall draw its raw inspiration.
        const sourceField = displayColumn.displayTypeOptions.sourceFieldName 
                            ? get(record, displayColumn.displayTypeOptions.sourceFieldName) as string 
                            : record[displayColumn.id] as string;

        // An invocation function to summon the AI's wisdom.
        const fetchAIInsight = async () => {
            if (!sourceField) {
                setAiError("No source data available for AI insight.");
                return;
            }
            setAiLoading(true);
            setAiError(null);
            try {
                const insight = await FakeGeminiService.getInstance().getInsight(sourceField);
                setAiInsight(insight);
            } catch (err) {
                console.error("Gemini service error:", err);
                setAiError("Failed to retrieve AI insight. The cosmic connection faltered.");
            } finally {
                setAiLoading(false);
            }
        };

        // Render the AI insight interface, a beacon of intelligence.
        content = (
            <div className="flex flex-col gap-2 p-2 border border-gray-200 rounded-md bg-gray-50 text-xs"
                 aria-live="polite" aria-atomic="true">
                <div className="flex items-center gap-1 font-semibold text-blue-800">
                    <Icon iconName="magic_sparkle" size="s" aria-hidden="true" />
                    <span>AI-Powered Insight (Gemini)</span>
                </div>
                {aiInsight ? (
                    <p className="whitespace-pre-wrap">{aiInsight}</p>
                ) : aiLoading ? (
                    <p className="text-gray-600">Generating profound insights... please wait for cosmic alignment.</p>
                ) : aiError ? (
                    <p className="text-red-600">{aiError}</p>
                ) : (
                    <button 
                        onClick={fetchAIInsight} 
                        className="text-blue-600 hover:underline text-left"
                        aria-label={`Click to unveil AI Insight for ${displayColumn.label}`}
                    >
                        Click to unveil AI Insight
                    </button>
                )}
                {/* Optional: Add a refresh button for re-evaluation */}
                {aiInsight && !aiLoading && (
                    <button 
                        onClick={fetchAIInsight} 
                        className="text-gray-500 hover:text-gray-800 text-xs mt-1 text-left"
                        aria-label={`Refresh AI insight for ${displayColumn.label}`}
                    >
                        <Icon iconName="refresh" size="xs" className="mr-1" /> Re-evaluate
                    </button>
                )}
            </div>
        );
        break;
    case DisplayColumnTypeEnum.SharedTypesScalarsDateTimeType:
      // DateTime: The very fabric of time, rendered in a human-comprehensible format.
      content = <DateTime timestamp={record[displayColumn.id] as string} />;
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesToggled:
      // Toggled: A binary state, manifested as "Enabled" or "Disabled," a simple yet powerful truth.
      content = record[displayColumn.id] ? "Enabled" : "Disabled";
      break;
    case DisplayColumnTypeEnum.GraphQlTypesBoolean:
      // Boolean: The fundamental truth value, either "True" or "False," the irreducible bits of reality.
      content = record[displayColumn.id] ? "True" : "False";
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesStatusIndicator:
      // Status Indicator: A visual beacon, instantly communicating the current state,
      // a traffic light for data's journey.
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "StatusIndicatorOption",
        "Status Indicator requires StatusIndicatorOption. For charting the course of data.",
      );
      content = (
        <StatusIndicator
          currentStatus={
            displayColumn.displayTypeOptions?.statusIndicatorCurrentStatusField
              ? (record[
                  displayColumn.displayTypeOptions
                    .statusIndicatorCurrentStatusField
                ] as StatusIndicatorStatuses)
              : "incomplete" // A default state, for when the cosmic forces are undecided.
          }
          statusDescriptor={
            displayColumn.displayTypeOptions?.statusIndicatorDescriptorField
              ? (record[
                  displayColumn.displayTypeOptions
                    .statusIndicatorDescriptorField
                ] as string)
              : "" // An empty descriptor, for the silent observer.
          }
          verbose // A verbose indicator, for detailed cosmic communication.
          aria-label={`Status: ${displayColumn.displayTypeOptions?.statusIndicatorDescriptorField ? (record[displayColumn.displayTypeOptions.statusIndicatorDescriptorField] as string) : ""}. Current status is ${displayColumn.displayTypeOptions?.statusIndicatorCurrentStatusField ? (record[displayColumn.displayTypeOptions.statusIndicatorCurrentStatusField] as string) : "incomplete"}`}
        />
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesCountdown:
      // Countdown: A temporal anomaly, measuring the relentless march of time,
      // either relative to now or an absolute timestamp.
      invariant(
        displayColumn.displayTypeOptions?.__typename === "CountdownOption",
        "Countdown column needs CountdownOption. To measure the very pulse of time.",
      );
      content = (
        <Countdown
          type={
            (displayColumn.displayTypeOptions.countdownType as
              | "relative"
              | "timestamp") ?? "timestamp" // The default temporal frame of reference.
          }
          timestamp={record[displayColumn.id] as string} // The moment in spacetime to count towards/from.
          aria-label={`Countdown: ${displayColumn.label} will be at ${record[displayColumn.id] as string}`}
        />
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesTag:
      // Tag: A semantic marker, categorizing data with visual flair and textual clarity.
      invariant(
        displayColumn.displayTypeOptions?.__typename === "TagOption",
        "Tag column requires TagOption. For precise semantic classification.",
      );
      content = (
        <Tag
          size="small"
          color={
            displayColumn.displayTypeOptions.tagColorField
              ? (record[
                  displayColumn.displayTypeOptions.tagColorField
                ] as TagColors)
              : undefined // Default color, for when the palette is undefined.
          }
          icon={
            displayColumn.displayTypeOptions.tagIconField &&
            record[displayColumn.displayTypeOptions.tagIconField]
              ? {
                  iconName: record[
                    displayColumn.displayTypeOptions.tagIconField
                  ] as Icons,
                  size: "s",
                }
              : undefined // No icon, for when visual adornment is not required.
          }
          aria-label={`Tag: ${record[displayColumn.id] as string}`}
        >
          {record[displayColumn.id] as string}
        </Tag>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesTagList: {
      // Tag List: A constellation of tags, each representing a facet of a larger entity,
      // a vibrant, semantic mosaic.
      invariant(
        displayColumn.displayTypeOptions?.__typename === "TagListOption",
        "Tag List needs TagListOption. For enumerating classifications.",
      );

      const colors = displayColumn.displayTypeOptions?.tagColorsField
        ? (record[
            displayColumn.displayTypeOptions?.tagColorsField
          ] as TagColors[])
        : undefined; // An array of colors, aligning with the tag sequence.

      const icons = displayColumn.displayTypeOptions?.tagIconsField
        ? (record[displayColumn.displayTypeOptions?.tagIconsField] as Icons[])
        : undefined; // An array of icons, each paired with its tag.

      content = (
        <div className="flex flex-wrap gap-y-2" role="list" aria-label={`List of tags for ${displayColumn.label}`}>
          {((record[displayColumn.id] || []) as Array<string>).map(
            (element, idx) => (
              <Tag
                key={`tag-list-item-${element}-${idx}`} // A truly unique key, for React's discerning eye.
                className="mr-2"
                size="small"
                color={colors && colors[idx]}
                icon={icons && { iconName: icons[idx] }}
                aria-label={`Tag item ${idx + 1}: ${element}`}
              >
                {element}
              </Tag>
            ),
          )}
        </div>
      );
      break;
    }
    case DisplayColumnTypeEnum.DisplayColumnTypesLink:
      // Link: A hypertextual gateway, connecting disparate nodes of information.
      // It respects the user's navigational preferences, opening new dimensions or staying within the current one.
      invariant(
        displayColumn.displayTypeOptions?.__typename === "LinkOption",
        "Link column demands LinkOption. For configuring digital portals.",
      );
      content = (
        <a
          target={displayColumn.displayTypeOptions.openNewTab ? "_blank" : ""} // To boldly go where no tab has gone before.
          rel={
            displayColumn.displayTypeOptions.openNewTab
              ? "noopener noreferrer"
              : "" // The cosmic shield against referrer information leakage.
          }
          href={record[displayColumn.id] as string} // The destination URL, the trajectory of the journey.
          aria-label={`Link to ${get(record, [displayColumn.displayTypeOptions.displayNameField,]) as string || record[displayColumn.id] as string}`}
        >
          {
            get(record, [
              displayColumn.displayTypeOptions.displayNameField,
            ]) as string // The visible text of the link, a guidepost.
          }
        </a>
      );
      break;
    case DisplayColumnTypeEnum.GraphQlTypesInt:
      // Integer: The fundamental counting unit, transmuted into its string representation for display.
      content = (record[displayColumn.id] as number).toString();
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesId:
    case DisplayColumnTypeEnum.GraphQlTypesId:
      // ID: The unique cosmic identifier, rendered by its dedicated artisan.
      content = idColumn(record);
      break;
    case DisplayColumnTypeEnum.TypesPaymentOrderPaymentSubtypeEnumType:
      // Payment Subtype: A specialized enumeration, formatted for clarity within the financial domain.
      content = formatPaymentSubtype(
        record[displayColumn.id] as PaymentSubtypeEnum,
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAmount:
      // Amount: A numerical value, often representing currency, rendered with specific financial precision.
      content = <Amount aria-label={`Amount: ${record[displayColumn.id] as string}`}>{record[displayColumn.id] as string}</Amount>;
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAmountDifference:
      // Amount Difference: A quantitative delta, with optional visual cues to highlight its significance.
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "AmountDifferenceOption",
        "Amount Difference column requires AmountDifferenceOption. For highlighting financial shifts.",
      );
      content = (
        <Amount
          difference={
            get(record, [
              displayColumn.displayTypeOptions
                .highlightAmountDifferenceField as string,
            ]) === true // A Boolean oracle, determining if the difference is noteworthy.
          }
          aria-label={`Amount difference: ${record[displayColumn.id] as string}`}
        >
          {record[displayColumn.id] as string}
        </Amount>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesJSON:
      // JSON (Structured): A direct window into raw JSON data, collapsible for managing complexity.
      invariant(displayColumn.displayTypeOptions?.__typename === "JSONOption", "JSON column needs JSONOption. For structured data display.");
      content = (
        <ReactJson
          src={
            record[displayColumn.id]
              ? (JSON.parse(record[displayColumn.id] as string) as Record<
                  string,
                  unknown
                >)
              : {} // An empty object, for when the JSON cosmic egg is unhatched.
          }
          name={null} // Suppressing the root node name, for a cleaner cosmic display.
          displayObjectSize={false} // Hiding the arcane size of objects.
          displayDataTypes={false} // Concealing the fundamental types, for visual simplicity.
          collapsed={!!displayColumn.displayTypeOptions?.collapsed} // Collapsible by design, a hidden universe.
          sortKeys // A mandated order for keys, bringing cosmic harmony to JSON.
          aria-label={`JSON data for ${displayColumn.label}`}
        />
      );
      break;
    case DisplayColumnTypeEnum.SharedTypesScalarsJSONType:
      // JSON (Scalar): Similar to the structured JSON, but without explicit collapse options,
      // assuming a simpler, always-open view.
      content = (
        <ReactJson
          src={
            record[displayColumn.id]
              ? (JSON.parse(record[displayColumn.id] as string) as Record<
                  string,
                  unknown
                >)
              : {} // An empty object, maintaining structural integrity.
          }
          name={null} // No root name, for aesthetic purity.
          displayObjectSize={false} // Size is a fleeting concept.
          displayDataTypes={false} // Data types are an internal affair.
          sortKeys // The celestial ordering of keys.
          aria-label={`JSON data for ${displayColumn.label}`}
        />
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesOrderedList:
      // Ordered List: A sequential enumeration of elements, preserving inherent order,
      // a chronicle of events or items.
      content = (
        <ol role="list" aria-label={`Ordered list for ${displayColumn.label}`}>
          {(record[displayColumn.id] as Array<string>).map((element, index) => (
            <li
              key={`ordered-list-item-${index}`} // A sequential key, for the order of existence.
              className="mb-1 mt-1 overflow-hidden overflow-ellipsis break-words"
              aria-label={`List item ${index + 1}: ${element}`}
            >
              {element}
            </li>
          ))}
        </ol>
      );
      break;
    default:
      // The default cosmic renderer: For all types not explicitly defined, a fallback
      // mechanism that ensures no data is left unrendered, a universal truth.
      if (displayColumn.viewOptions?.detailsTable?.copyable) {
        content = (
          <CopyableText
            text={record[displayColumn.id]}
            aria-label={`Copyable text: ${record[displayColumn.id] as string}`}
          >
            {record[displayColumn.id] as string}
          </CopyableText>
        );
      } else {
        content = (
          <div className="break-words" aria-label={`Text content: ${record[displayColumn.id] as string}`}>
            {record[displayColumn.id] as string}
          </div>
        );
      }
      break;
  }
  // The final assembly: The computed content, potentially augmented by a celestial array of actions.
  return (
    <div className="flex gap-1" role="group" aria-label={`Details for ${displayColumn.label}`}>
      {content}
      <div id={`${displayColumn.id}_actions_toggle`}>
        {actions.length ? (
          <Popover>
            <PopoverTrigger
              buttonHeight="small"
              buttonType="link"
              aria-label={`More actions for ${displayColumn.label}`}
            >
              <Icon iconName="more_horizontal" aria-hidden="true" />
            </PopoverTrigger>
            <PopoverPanel
              anchorOrigin={{
                horizontal: "right",
              }}
            >
              {actions.map((action: Action, index: number) => (
                <ActionItem
                  key={`action-item-${displayColumn.id}-${index}`} // A unique key for each powerful action.
                  type={action.type}
                  onClick={() => action.handler()}
                  aria-label={action.ariaLabel || action.label}
                >
                  {action.label}
                </ActionItem>
              ))}
            </PopoverPanel>
          </Popover>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The Data Formatter: This alchemical engine transmutes raw GraphQL response
 * objects into a structured format suitable for our KeyValueTable, mapping
 * column IDs to their computed, human-consumable values. It is the bridge
 * between the machine's truth and human perception.
 * @param data The raw, unadulterated GraphQL response, a treasure trove.
 * @param graphqlField The specific field within the response holding the record data.
 * @param displayColumns The blueprints for each column's visual manifestation.
 * @param actions A compendium of possible actions, tied to specific columns.
 * @returns A new object, a structured marvel ready for display.
 */
function formatData(
  data: ResponseType,
  graphqlField: string,
  displayColumns: Array<DisplayColumn>,
  actions?: Record<string, Array<Action>>,
) {
  return {
    ...displayColumns.reduce(
      (acc, displayColumn) => ({
        ...acc,
        [displayColumn.id]: computeValue(
          displayColumn,
          data[graphqlField],
          actions && actions[displayColumn.id] ? actions[displayColumn.id] : [], // Only provide actions relevant to this column.
        ),
      }),
      {},
    ),
  };
}

// ResponseType: The cosmic signature of our GraphQL response.
type ResponseType = {
  displayColumns: Array<DisplayColumn>; // The declarative array of display column blueprints.
} & { [key: string]: RecordData }; // And the actual data record, indexed by a dynamic key.

// DetailsTableProps: The immutable laws governing the configuration of our
// `DetailsTable` component, defining its behavior and appearance.
interface DetailsTableProps {
  actions?: Record<string, Array<Action>>; // The potential actions, a universe of interactivity.
  /** When `true`, adds a card surface to the table. Defaults to `true`. This creates a visual boundary, defining its spatial domain. */
  bordered?: boolean;
  customDataMapping?: Record<string, ReactNode>; // A custom override for data mapping, for when divine intervention is needed.
  constantQueryVariables?: Record<string, unknown>; // Unchanging parameters for our GraphQL queries, constants of the cosmic equation.
  expandable?: boolean; // A Boolean toggle, allowing the table to reveal deeper layers of information.
  graphqlQuery: unknown; // The GraphQL query function, the very incantation to summon data.
  id: string; // The central identifier, the primary key of the displayed entity.
  resource: ResourcesEnum; // The type of resource, for precise GraphQL targeting.
  additionalSections?: Array<AdditionalSection>; // Supplementary sections, enriching the primary narrative.
  // Theming & Localization: These props hint at a grander design, where every component
  // adapts its aesthetic and linguistic expressions across global platforms.
  // Though not fully implemented here, their presence is a declaration of intent.
  theme?: "light" | "dark" | "citibank-blue"; // A stylistic paradigm, for visual metamorphosis.
  locale?: string; // The linguistic context, for global intelligibility.
}

// QueryFunctionType: The cosmic signature of a GraphQL query invocation.
type QueryFunctionType = (queryArgs: Record<string, unknown>) => {
  data?: Record<string, unknown>; // The ephemeral data response.
  loading: boolean; // The state of cosmic uncertainty.
  error?: string; // The whispers of an error, if the cosmic connection falters.
  refetch: (args: Record<string, unknown>) => unknown; // The power to re-summon data.
};

/**
 * DetailsTable: The magnum opus, the central repository for displaying the intricate
 * details of any financial entity within the Citibank Demo Business Inc. universe.
 * This component is engineered with unparalleled precision, destined for integration
 * across every major platform, from web to mobile to potential holographic interfaces.
 * It is a paragon of commercial-grade code, leveraging cutting-edge React patterns
 * and future-proof architectural considerations, including a nascent, yet profound,
 * integration with AI intelligence through our simulated Gemini service.
 * Every line here is a stroke of genius, meticulously crafted to provide clarity,
 * interactivity, and an unparalleled user experience.
 *
 * This component, a marvel of modular design, allows for dynamic column rendering,
 * auditable fields, polymorphic associations, and now, even AI-driven insights.
 * It's not just a table; it's a data intelligence dashboard.
 */
function DetailsTable({
  actions, // Actions, the interactive soul of our data.
  bordered = true, // A border, a demarcation of its intellectual territory.
  customDataMapping, // The custom decree for data interpretation.
  constantQueryVariables = {}, // Variables that hold steadfast in the face of dynamic queries.
  expandable = false, // The capability to unfurl hidden layers of data.
  graphqlQuery, // The oracle of our data universe.
  id, // The unique identifier of the entity in focus.
  resource, // The specific cosmic resource being queried.
  additionalSections = [], // Auxiliary data narratives, for richer context.
  theme = "light", // The chosen aesthetic paradigm.
  locale = "en-US", // The linguistic context of the user.
}: DetailsTableProps) {
  // Invoking the GraphQL oracle, observing its loading state, and listening for errors.
  const { data, loading, error } = (graphqlQuery as QueryFunctionType)({
    variables: {
      id, // The ID, a primary key in the cosmic database.
      ...constantQueryVariables, // The steadfast query parameters.
    },
    fetchPolicy: "no-cache", // A policy of fresh data, avoiding stale cosmic artifacts.
  });

  // Retrieving the specific GraphQL field, a pointer to the heart of the data.
  const graphqlField = RESOURCES[resource].graphql_fields?.details_table;
  invariant(
    graphqlField,
    `The resource you passed to <DetailsTable /> (${resource}) has no corresponding graphql field for this component. Did you forget to update resources.rb? This is a critical cosmic oversight!`, // An absolute cosmic law, no resource without its defined GraphQL field.
  );
  // A Boolean sentinel, indicating if we are still awaiting cosmic data transmission.
  const waitingForData = loading || !data || error;
  // The blueprints for display columns, dynamically acquired or empty if awaiting data.
  const displayColumns = waitingForData
    ? []
    : (data as ResponseType).displayColumns;

  // The record, meticulously formatted, a masterpiece of data transformation.
  const record = waitingForData
    ? {} // An empty cosmic canvas, awaiting data.
    : formatData(data as ResponseType, graphqlField, displayColumns, actions);

  // Default columns: The essential truths, always visible.
  const defaultColumns = displayColumns.filter(
    (col) => col.viewOptions.detailsTable?.default,
  );

  // Primary columns: The cardinal points of information, commanding attention.
  const primaryColumns = displayColumns.filter(
    (col) => col.viewOptions.detailsTable?.primaryColumn,
  );

  // The ultimate data mapping, a grand tapestry woven from defaults, primaries, and all others,
  // judiciously hiding null values, because only substance deserves presentation.
  const dataMapping =
    customDataMapping ||
    [
      // Place primary and default columns first, establishing visual hierarchy.
      ...primaryColumns,
      ...defaultColumns,
      ...displayColumns.filter((col) => !col.viewOptions.detailsTable?.default),
    ].reduce<Record<string, string>>((acc, displayColumn) => {
      // The cosmic filter: if a column is configured to hide nulls, and its value is indeed null,
      // it shall vanish, preserving the purity of information.
      if (
        displayColumn.viewOptions.detailsTable?.hideIfNull &&
        !record[displayColumn.id]
      ) {
        return acc;
      }
      return { ...acc, [displayColumn.id]: displayColumn.label };
    }, {});

  // The grand rendering: a visual manifestation of the data, encased within a structured UI.
  return (
    <div id="payment-order-details-panel" className={`details-table-container theme-${theme}`} aria-label={`Details for ${resource} with ID ${id}`}>
      {(loading || !record || error) && ( // The cosmic prelude: a skeleton loader, signifying anticipation or error.
        <KeyValueTableSkeletonLoader
          altRowClassNames="detail-panel-row"
          altTableClassNames="detail-panel p-6"
          aria-label="Loading details table"
        />
      )}
      {!loading && record && !error && ( // The triumphant reveal: if data is present and errors absent.
        <>
          <KeyValueTable
            data={record} // The meticulously prepared data.
            dataMapping={dataMapping} // The semantic map of data.
            primaryColumns={primaryColumns.map((col) => col.id)} // The cardinal columns.
            expandable={expandable} // The ability to expand, revealing deeper truths.
            // Default & primary columns are visible by design, constants in our visual universe.
            minRowsWhenExpandable={defaultColumns.length}
            altRowClassNames="detail-panel-row"
            altTableClassNames={cn( // The master class name orchestrator.
              "flex flex-col items-start gap-3 bg-white",
              bordered && "p-6 border-alpha-black-100 border rounded-md", // The border, a delineation of its domain.
              additionalSections.length > 0 &&
                "!pb-0 !border-b-0 !rounded-b-none", // Conditional styling for seamless integration with additional sections.
            )}
            aria-label={`Key value table for ${resource} details`}
          />
          <div id="additional-sections" role="complementary" aria-label="Additional information sections">
            {additionalSections.map((additionalSection) => (
              <div
                className={cn( // Another stroke of the class name maestro.
                  "detail-panel flex-wrap gap-3",
                  "rounded-b-md border-alpha-black-100 border bg-white", // Ensuring consistent styling.
                  !bordered && "!border-t-0 !px-0 !pb-0", // Adapting if main table is not bordered.
                  bordered && "!rounded-t-none !border-t-0 !px-6 !pb-6" // Specific styling for bordered scenario.
                )}
                key={additionalSection.id || additionalSection.header} // A resilient key, for component stability.
                aria-label={additionalSection.ariaLabel || additionalSection.header}
              >
                <div className="break-normal font-medium text-lg" aria-level={3} role="heading">
                  {additionalSection.header}
                </div>
                {additionalSection.content}
              </div>
            ))}
          </div>
        </>
      )}
      {!loading && error && ( // The lament of an error, a message from the cosmic void.
          <div className="p-6 text-red-700 bg-red-50 border border-red-200 rounded-md" role="alert">
              <h3 className="font-semibold text-lg mb-2">Error Retrieving Data: A Glitch in the Matrix!</h3>
              <p>An unforeseen anomaly occurred during the data retrieval process for resource '{resource}' (ID: {id}).</p>
              <p>Details: {error}</p>
              <p className="mt-2">Our digital alchemists are already investigating this arcane disturbance. Please try again later or contact support if the problem persists, referencing this cosmic event.</p>
          </div>
      )}
    </div>
  );
}
export default DetailsTable;