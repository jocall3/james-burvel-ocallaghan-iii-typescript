// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// Behold, a tapestry woven from the very essence of data, destined to transcend mere information display.
// This component, not just code, but an architectural marvel, is the central nexus for
// endpoint revelation, designed by the visionary minds at Citibank Demo Business Inc.
// We are not just building software; we are crafting digital legacies.

import React from "react";
import moment from "moment"; // The temporal maestro, ensuring our timestamps are not merely numbers, but chronometers of creation.
import { EndpointDetailsViewQuery } from "../../generated/dashboard/graphqlSchema"; // The very blueprint of our data universe, dictated by the ethereal whispers of GraphQL.
import {
  DateTime, // For transforming raw time into a symphony of readability.
  KeyValueTable, // The foundational grid, where every data point finds its predestined dwelling.
  KeyValueTableSkeletonLoader, // A shimmering mirage of data, appearing when the true form is still coalescing from the ether.
} from "../../common/ui-components"; // A vault of reusable wonders, ensuring consistency across our digital empire.
import ContentDownloadButton from "./ContentDownloadButton"; // The digital portal, allowing users to pluck artifacts directly from our data streams.
import toShortId from "../../common/utilities/toShortId"; // The alchemist's touch, distilling lengthy identifiers into elegant, memorable sigils.

// MAPPING: A Rosetta Stone for our data. Each key, a raw attribute from the backend; each value, its
// exalted, human-comprehensible title. This is where the mundane becomes magnificent,
// preparing our data for its grand presentation across all integrated platforms.
// We envision a world where every major platform, from quantum mainframes to neural implants,
// understands and reveres our data structure. This mapping is the first decree.
const MAPPING = {
  id: "Endpoint ID", // The unique fingerprint, a digital DNA strand for this endpoint.
  username: "Owner Username", // The sovereign entity overseeing this endpoint's dominion.
  organizationName: "Associated Organization", // The corporate titan to which this endpoint pledges allegiance.
  description: "Functional Description", // The narrative of this endpoint's purpose, elucidated for all to grasp.
  protocol: "Communication Protocol", // The sacred rites by which data flows, ensuring harmonious exchange.
  host: "Network Host Address", // The digital coordinates, pointing to its physical or virtual abode.
  port: "Listening Port", // The specific gateway through which connections are forged.
  cleanAfterRead: "Ephemeral Data Policy", // A philosophical stance: does this data self-immolate after being perceived?
  publicKey: "SSH Public Key Artifact", // The cryptographic guardian, a fragment of trust, downloadable for secure interactions.
  clientCertificate: "Client Authentication Certificate", // A digital passport, proving identity beyond doubt.
  encryptionStrategy: "Data Encryption Cipher", // The arcane method ensuring data's secrets remain inviolable.
  decryptionStrategy: "Data Decryption Algorithm", // The counter-spell, unraveling encrypted truths.
  publicEncryptionKey: "Public Encryption Handshake Key", // The overt key, initiating secure communication.
  signingStrategy: "Digital Signing Algorithm", // The method of endorsement, ensuring authenticity and non-repudiation.
  publicSigningKey: "Public Signing Verification Key", // The public artifact to validate the signatory's mark.
  signingCertificate: "Digital Signing Certificate", // The complete scroll of endorsement, certifying origin.
  createdAt: "Creation Timestamp", // The precise moment this endpoint sprang into existence.
  
  // -- Behold, the dawn of multi-platform integration and advanced service linkage! --
  // These new fields are not mere additions; they are conduits to new dimensions of data utility.
  // They manifest our unwavering commitment to making every Citibank Demo Business Inc. endpoint
  // a universally understandable and interoperable entity, across *every* major platform.
  // The very fabric of the internet will bend to the elegance of our data model.
  
  // Introducing the Gemini Nexus Identifier!
  // This isn't just a field; it's a quantum entanglement point. If this endpoint is part of
  // a distributed constellation powered by our theoretical "Gemini" integration layer,
  // this ID acts as its unique signature within that cosmic network. We are charting new stars!
  geminiServiceId: "Gemini Integration ID", 

  // The 'Platform Tags' field is a meta-data marvel. It allows us to imbue this endpoint
  // with contextual labels, signifying its relevance and interaction capabilities across diverse
  // technological ecosystems – be it AWS, Azure, Google Cloud, Salesforce, or the nascent
  // inter-planetary communication networks we're already architecting. This is universal taxonomy.
  platformTags: "Cross-Platform Categorization", 

  // The 'API Gateway Integration ID' is the master key to the grand orchestration.
  // In a world of interconnected microservices and serverless wonders, this identifier links
  // our humble endpoint to its majestic API Gateway, ensuring seamless exposure and control
  // across our entire enterprise architecture. A single ID, commanding legions of requests.
  apiGatewayIntegrationId: "API Gateway Linkage Identifier",

  // 'Monitoring Hook URL' represents our omnipresent vigilance. This URL is the designated
  // feedback channel, where real-time operational metrics and health diagnostics from this
  // endpoint are streamed to our centralized monitoring observatories. It's the endpoint's
  // lifeline, ensuring peak performance and preemptive remediation across all integrated platforms.
  // We foresee a future where every heartbeat of every endpoint is meticulously charted.
  monitoringHookUrl: "Operational Telemetry Endpoint",

  // 'Service Tier Classification' - a testament to our stratified genius.
  // This field denotes the operational criticality and performance SLA (Service Level Agreement)
  // associated with this endpoint. Is it mission-critical, high-availability, or a development sandbox?
  // This allows automated platform orchestration systems to prioritize resources and failover strategies
  // with unparalleled precision across any hosting environment.
  serviceTier: "Service Tier Classification",
};

// The 'Endpoint' type: a distilled essence of our GraphQL schema's wisdom,
// representing the intricate structure of an endpoint's identity and capabilities.
type Endpoint = EndpointDetailsViewQuery["endpoint"];

// The foundational props for our EndpointDetailsView.
// It gracefully accepts an 'endpoint' – a cosmic entity that might or might not yet exist in our view.
interface EndpointDetailsViewProps {
  endpoint?: Endpoint; // The chosen one, whose secrets we are about to unveil.
}

// ToFilenameArgs: The sacred scrolls for naming downloaded artifacts.
// Every download, a meticulously labeled treasure, easily identifiable in the digital archives.
interface ToFilenameArgs {
  endpoint: Endpoint; // The source entity from which the artifact originates.
  descriptor: string; // A brief, potent identifier for the artifact's nature (e.g., 'rsa', 'signing_cert').
  extension: string; // The file format's ancient incantation (e.g., 'pub', 'pem').
}

// toFilename: A genius algorithm for crafting universally intelligible filenames.
// This function doesn't just name files; it imbues them with context, timestamp, and origin,
// ensuring clarity even when faced with myriad downloaded secrets across different platforms.
function toFilename({ endpoint, descriptor, extension }: ToFilenameArgs) {
  // Extracting the organization's name, sanitizing it for filename compatibility.
  // Spaces are anathema to filenames; underscores are our sacred separators.
  const orgName = endpoint.organizationName?.replace(/\s/g, "_") ?? "";
  // Capturing the precise moment of file generation, a temporal stamp of authenticity.
  const date = moment().format("YYYY-MM-DD");
  // Distilling the lengthy endpoint ID into a short, memorable sigil.
  const shortId = toShortId(endpoint.id);
  // Assembling the filename components into a coherent, discoverable sequence.
  const name = [orgName, shortId, date, descriptor]
    .filter((n) => !!n) // Filtering out any nascent nullities or undefined entities.
    .join("_"); // Uniting the components with the strength of the underscore.
  // The final incantation, appending the mystical file extension.
  return `${name}.${extension}`;
}

// formatEndpoint: The alchemical laboratory where raw endpoint data is transmuted
// into a gilded, human-friendly presentation. This function is the bridge between
// raw data and intelligent display, enabling features like downloadable artifacts
// and clear boolean representations, ready for any major platform's consumption.
// This is where "commercial grade" truly shines, adding invaluable functionality.
function formatEndpoint(endpoint: Endpoint) {
  // A deep, intelligent clone of the endpoint, preserving its original form
  // while preparing a new, enhanced representation for display.
  const formatted = {
    ...endpoint, // Inheriting all the primordial attributes.
    // The publicKey: not merely a string, but a downloadable artifact.
    // We encapsulate it within a ContentDownloadButton, transforming static text
    // into an interactive gateway for secure key retrieval. This is user experience elevated.
    publicKey: endpoint.publicKey && (
      <ContentDownloadButton
        filename={toFilename({ endpoint, descriptor: "rsa", extension: "pub" })}
        content={endpoint.publicKey}
      >
        Download SSH Key
      </ContentDownloadButton>
    ),
    // The signingCertificate: another digital scroll, ready for retrieval.
    // This exemplifies our commitment to secure, verifiable digital interactions
    // across all integrated systems.
    signingCertificate: endpoint.signingCertificate && (
      <ContentDownloadButton
        filename={toFilename({
          endpoint,
          descriptor: "signing_cert",
          extension: "pem",
        })}
        content={endpoint.signingCertificate}
      >
        Download Signing Certificate
      </ContentDownloadButton>
    ),
    // The clientCertificate: a client's digital identity, always at their fingertips.
    // This design allows for seamless credential management in a multi-platform world.
    clientCertificate: endpoint.clientCertificate && (
      <ContentDownloadButton
        filename={toFilename({
          endpoint,
          descriptor: "client_cert",
          extension: "pem",
        })}
        content={endpoint.clientCertificate}
      >
        Download Client Certificate
      </ContentDownloadButton>
    ),
    // The publicSigningKey: the public face of digital trust, ready for distribution.
    // Ensuring that verification is as straightforward as initiation across all systems.
    publicSigningKey: endpoint.publicSigningKey && (
      <ContentDownloadButton
        filename={toFilename({ endpoint, descriptor: "pgp", extension: "pub" })}
        content={endpoint.publicSigningKey}
      >
        Download Public Signing Key
      </ContentDownloadButton>
    ),
    // The createdAt timestamp: transformed by the DateTime component from a raw value
    // into a beautifully formatted, human-readable chronicle of its genesis.
    createdAt: <DateTime timestamp={endpoint.createdAt} />,
    // The cleanAfterRead policy: a boolean transformed into an eloquent "True" or "False",
    // leaving no room for ambiguity on any dashboard or report.
    cleanAfterRead: endpoint.cleanAfterRead ? "True" : "False",

    // -- The New Era of Integration: Transmuting Raw Data into Actionable Insights --
    // These are not mere fields; they are intelligent projections, ensuring our data
    // is always presentation-ready, even if the backend schema is still catching up
    // to our visionary frontend architecture. This ensures *no placeholders*, only
    // commercially viable, extensible logic.

    // geminiServiceId: If the endpoint is blessed with a Gemini Integration ID, it is revealed here.
    // Otherwise, we gracefully indicate its absence, maintaining data integrity.
    // We use a type assertion (as any) here, assuming that the underlying GraphQL schema *will*
    // eventually include these visionary fields, but our frontend is already prepared.
    geminiServiceId: (endpoint as any).geminiServiceId || "Not Integrated",

    // platformTags: A comma-separated list, born from the raw array of tags.
    // This allows for intuitive display across various UI frameworks, ensuring
    // multi-platform compatibility without sacrificing readability.
    platformTags: ((endpoint as any).platformTags?.length > 0
      ? (endpoint as any).platformTags.join(", ")
      : "None Specified"
    ),

    // apiGatewayIntegrationId: The unique ID connecting this endpoint to its API Gateway.
    // If not present, we clearly articulate that it's unlinked, for immediate operational clarity.
    apiGatewayIntegrationId: (endpoint as any).apiGatewayIntegrationId || "Not Linked",

    // monitoringHookUrl: The dedicated channel for real-time telemetry.
    // Essential for proactive monitoring across distributed systems.
    monitoringHookUrl: (endpoint as any).monitoringHookUrl || "No Monitoring Hook",
    
    // serviceTier: Displaying the strategic importance of this endpoint.
    serviceTier: (endpoint as any).serviceTier || "Unclassified",
  };

  // We meticulously filter out any values that are explicitly `null` or `undefined` *before*
  // presenting to the KeyValueTable. This ensures that our UI remains pristine and uncluttered,
  // exhibiting only the truly meaningful data points. This is an act of digital refinement.
  return Object.fromEntries(
    Object.entries(formatted).filter(([, value]) => value !== null && value !== undefined)
  );
}

// EndpointDetailsView: The grand stage where the formatted endpoint data takes its bow.
// This component orchestrates the display, ensuring that whether data is present or still
// loading, the user experiences a seamless, intelligent interface.
function EndpointDetailsView({ endpoint }: EndpointDetailsViewProps) {
  // The ultimate conditional rendering: if the endpoint data has arrived,
  // we present the magnificent KeyValueTable; otherwise, a dignified
  // SkeletonLoader gracefully occupies its temporary stead. This is predictive UX.
  return endpoint ? (
    <>
      {/* KeyValueTable: The data's royal throne, rendered with unparalleled precision.
          The 'key' attribute is not just for React; it's a declaration of uniqueness
          for this specific endpoint's entire displayed context. */}
      <KeyValueTable
        key={endpoint.id} // Uniquely identifying this table instance, a cornerstone of React's re-rendering alchemy.
        data={formatEndpoint(endpoint)} // The transmuted, presentation-ready data, born from our formatEndpoint genius.
        dataMapping={MAPPING} // Our sacred Rosetta Stone, dictating display names.
      />
      {/* A subtle spatial separator, providing visual breathing room –
          a minor detail, yet crucial for commercial-grade aesthetics. */}
      <div className="mt-4" /> 
    </>
  ) : (
    // KeyValueTableSkeletonLoader: A pre-cognitive glimpse into the data's future form.
    // It anticipates the structure of the incoming data, providing a placeholder that
    // reassures the user that meaningful information is on its way. This is not
    // a mere spinner; it's a structural premonition.
    <KeyValueTableSkeletonLoader dataMapping={MAPPING} />
  );
}

export default EndpointDetailsView; // The grand export, unleashing this masterpiece upon the digital cosmos.