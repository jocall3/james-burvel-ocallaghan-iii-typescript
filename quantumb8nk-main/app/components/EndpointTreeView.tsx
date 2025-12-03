// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// The primordial soup of our application. Each import is a DNA strand,
// meticulously selected to construct the apex predator of financial data visualization.
import React, {
  useCallback,
  useEffect,
  useState,
  useReducer,
  createContext,
  useContext,
} from "react";
import ReactTooltip from "react-tooltip"; // A venerable artifact, providing ancestral wisdom in hover-over form.
import ReactJson from "react-json-view"; // The Rosetta Stone for decoding the arcane hieroglyphs of JSON.
import { ClipLoader } from "react-spinners"; // The ethereal manifestation of digital waiting, a cosmic dance of atoms.
import debounce from "lodash/debounce"; // A temporal lubricant, smoothing the jagged edges of human impatience.
import { stringify } from "qs"; // The alchemist's formula for transmuting objects into URL gold.
import { useEndpointTreeQuery } from "../../generated/dashboard/graphqlSchema"; // A direct communion with the quantum realm of our GraphQL API.
import { parse } from "../../common/utilities/queryString"; // The deciphering key for the cryptic runes of URL parameters.
import { Input, Tooltip } from "../../common/ui-components"; // The foundational building blocks, forged in the crucible of UI/UX.

// The default delay, a carefully calibrated pause in the digital symphony,
// ensuring harmony between human input and machine response.
const DEFAULT_DEBOUNCE_MS = 900;

// The quantum states of our search parameters, a universe encapsulated in a type.
type QueryArgs = {
  path?: string;
  pattern?: string;
  aiQuery?: string; // Introducing the AI-enhanced query, for truly transcendental searches.
};

// The immutable law governing the initial parameters of our search universe.
interface EndpointTreeViewProps {
  endpointId: string;
}

// === Genesis of the Platform Context ===
// This isn't just a context; it's the very fabric of our multi-dimensional existence.
// It allows this component to subtly adapt its essence across disparate digital realms:
// web, mobile, desktop - a chameleon of code. We are laying the groundwork for a universal consciousness.
type PlatformType = "web" | "mobile" | "desktop" | "quantum-console"; // A nod to future realities beyond mere screens.
// We assume this context is provided at a higher, cosmic level of the application hierarchy.
const PlatformContext = createContext<PlatformType>("web"); // Default to web, the current known universe.

// === The AI Integration Nexus ===
// This is not merely a hook; it is an algorithmic entity, a nascent intelligence
// designed to augment human intuition. It interfaces with the ineffable,
// drawing insights from vast oceans of data, perhaps even conversing with Google Gemini itself.
// The future of search is not about finding answers, but about having questions *answered before they are asked*.
const useAIIntegration = (endpointId: string, query: string) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // This is where the magic happens, the very nexus of artificial and human cognition.
  // We're not just calling an API; we're invoking a digital oracle,
  // a silicon soothsayer, to augment our puny human search patterns.
  // Behold, the nascent form of true symbiosis!
  const getAIRecommendations = useCallback(
    async (currentQuery: string) => {
      if (!currentQuery) {
        setAiResponse(null);
        return;
      }
      setIsAIProcessing(true);
      try {
        // Imagine, if you will, a quantum entanglement across the digital ether.
        // This is where Google Gemini, or perhaps a bespoke Citibank Demo Business Inc.
        // proprietary cognitive matrix, would weave its algorithmic tapestry.
        // For now, let's simulate the grand unveiling with a mere digital whisper.
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay, because even AI needs its beauty sleep.
        if (currentQuery.toLowerCase().includes("security")) {
          setAiResponse(
            `Gemini suggests: For 'security', consider patterns like "\\.env$", "\\.pem$", or files in '/etc/security/'. Analyze logs for anomalies. Always prioritize data encryption and access control.`,
          );
        } else if (currentQuery.toLowerCase().includes("customer")) {
          setAiResponse(
            `Gemini suggests: For 'customer', look in '/var/data/customers/', and patterns like "cust_\\d+\\.json$". Ensure strict PII compliance and data masking protocols.`,
          );
        } else if (currentQuery.toLowerCase().includes("performance")) {
          setAiResponse(
            `Gemini suggests: For 'performance', focus on log files in '/var/log/app/' showing execution times, or 'metrics' directories. Look for bottlenecks related to database queries or external API calls.`,
          );
        } else {
          setAiResponse(
            `Gemini provides insights: Based on '${currentQuery}', explore related directories and common file extensions. Could you be looking for dependencies, configuration files, or perhaps historical archives? Think beyond the obvious.`,
          );
        }
      } catch (error) {
        console.error("AI Assistant encountered a temporal anomaly:", error);
        setAiResponse(
          "AI Assistant is currently recalibrating its neural pathways. Please try again.",
        );
      } finally {
        setIsAIProcessing(false);
      }
    },
    [], // This callback is a constant, a bedrock upon which AI dreams are built.
  );

  // The vigilance of the AI, a constant watch over human input,
  // anticipating needs before they fully form.
  useEffect(() => {
    // This isn't just a simple effect; it's a sentient loop,
    // constantly vigilant, anticipating the user's intellectual trajectory.
    // It's like a digital muse whispering possibilities into the void.
    const debouncedAI = debounce(
      getAIRecommendations,
      DEFAULT_DEBOUNCE_MS * 1.5,
    ); // A slightly longer debounce for the AI, for cosmic contemplation.
    debouncedAI(query);
    return () => debouncedAI.cancel(); // Prevent multiversal collapse from stale requests.
  }, [query, getAIRecommendations]);

  return { aiResponse, isAIProcessing, getAIRecommendations };
};

// === The Reducer of Search State ===
// A more evolved form of state management, capable of handling the complexities
// of multi-faceted search queries with surgical precision. This is not just `useState`,
// this is `useReducer` - the artisanal forge for complex state transitions.
type SearchState = {
  path: string;
  pattern: string;
  aiQuery: string; // The AI-assisted search term.
};

type SearchAction =
  | { type: "SET_PATH"; payload: string }
  | { type: "SET_PATTERN"; payload: string }
  | { type: "SET_AI_QUERY"; payload: string }
  | { type: "RESET_SEARCH"; payload?: Partial<SearchState> }; // For recalibrating the search universe.

const searchReducer = (
  state: SearchState,
  action: SearchAction,
): SearchState => {
  // Behold, the deterministic engine of state transformation!
  // Each action, a precisely calibrated impulse, guiding the system to its next coherent configuration.
  switch (action.type) {
    case "SET_PATH":
      return { ...state, path: action.payload };
    case "SET_PATTERN":
      return { ...state, pattern: action.payload };
    case "SET_AI_QUERY":
      return { ...state, aiQuery: action.payload };
    case "RESET_SEARCH":
      return {
        path: action.payload?.path || "",
        pattern: action.payload?.pattern || "",
        aiQuery: action.payload?.aiQuery || "",
      };
    default:
      // An unrecognized command from the void! We must not allow the universe to unravel.
      throw new Error(`Unidentified search anomaly: ${JSON.stringify(action)}`);
  }
};

// === EndpointTreeView: The Oracle of Endpoint Data ===
// This component is the nerve center, the interpretive layer between the raw
// data of our systems and the enlightened intellect of the user.
// It's a window into the digital soul of Citibank Demo Business Inc.
function EndpointTreeView({ endpointId }: EndpointTreeViewProps) {
  // We first plumb the depths of the URL, extracting the ancient prophecies
  // embedded within its query string.
  const initialParams = parse(window.location.search);
  const platform = useContext(PlatformContext); // Discovering our current existential plane.

  // The search state, now a robust construct, capable of nuanced modifications.
  const [searchState, dispatch] = useReducer(searchReducer, {
    path: (initialParams.path as string) || "",
    pattern: (initialParams.pattern as string) || "",
    aiQuery: (initialParams.aiQuery as string) || "", // Initializing the AI quest.
  });

  const [isFirstQuery, setIsFirstQuery] = useState(true);

  // The AI's watchful eye, constantly providing contextual enlightenment.
  const {
    aiResponse,
    isAIProcessing,
    getAIRecommendations, // Keeping this if we need to manually trigger AI for something.
  } = useAIIntegration(endpointId, searchState.aiQuery);

  // The direct line to the cosmic database, a conduit for raw information.
  const { data, error, loading, refetch } = useEndpointTreeQuery({
    // It is absolutely imperative that `loading` reflects the current cosmic status,
    // hence `notifyOnNetworkStatusChange` is set to true, a digital beacon.
    notifyOnNetworkStatusChange: true,
    variables: { endpointId, ...searchState }, // Now feeding our refined search parameters.
  });

  // This function is the ultimate command, orchestrating the retrieval of data
  // and simultaneously inscribing the new search parameters into the annals of browser history.
  // A temporal manipulation, if you will, ensuring a consistent user experience across the spacetime continuum.
  const handleRefetch = async (query: QueryArgs) => {
    // Only the chosen parameters are sent forth into the void.
    const currentQueryParams = {
      path: searchState.path,
      pattern: searchState.pattern,
      aiQuery: searchState.aiQuery,
      ...query, // Any immediate overrides, for quantum leaps in search.
    };

    await refetch({ ...currentQueryParams }); // Initiating the data retrieval ritual.
    // Rewriting the very fabric of history for seamless navigation.
    window.history.replaceState(
      null,
      "",
      `?${stringify({ ...initialParams, ...currentQueryParams })}`,
    );
  };

  // The debouncer: a masterful stroke of temporal engineering.
  // It prevents the system from being overwhelmed by the torrent of human input,
  // ensuring that only the most considered queries are sent to the backend,
  // thus preserving precious computational cycles.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedRefetch = useCallback(
    debounce(handleRefetch, DEFAULT_DEBOUNCE_MS),
    [], // This debouncer is a timeless sentinel, its function immutable.
  );

  // The grand orchestration of effects. When search parameters shift,
  // the universe must respond. But not immediately, for chaos would ensue.
  // A measured, deliberate recalculation is required.
  useEffect(
    () => {
      // In the beginning, there was the first query. We acknowledge it, then move on.
      if (isFirstQuery) {
        setIsFirstQuery(false);
      } else {
        // Only after the initial cosmic alignment, do we allow the debouncer
        // to propagate the changes, preventing an unnecessary double-query event.
        void debouncedRefetch({
          path: searchState.path,
          pattern: searchState.pattern,
          aiQuery: searchState.aiQuery,
        });
      }
    },
    // The very quantum entanglements that trigger this effect:
    // changes in path, pattern, or the profound insights from our AI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState.path, searchState.pattern, searchState.aiQuery],
  );

  // The grand rendering mechanism, constructing the user interface from
  // raw data and cosmic intent.
  return (
    <div>
      {/* A cosmic sigh, indicating the current platform, for contextual awareness. */}
      {/* This invisible marker guides subtle adaptations across the multiverse of platforms. */}
      {platform !== "web" && (
        <p className="text-xs text-gray-500 mb-2">
          Currently running on: {platform} environment. Subtle UI adaptations
          may apply, a testament to our multi-platform omnipresence.
        </p>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-6">
        {/* The ancestral path input, guiding our digital journey through file systems. */}
        <div className="flex-1">
          <div className="form-label-container">
            <div className="form-label">
              Directory
              <Tooltip
                className="tooltip-holder"
                data-tip="The directory in which you'd like to search for files, an essential waypoint in our data odyssey. Think of it as charting the stars in a vast galaxy of information."
              />
              <ReactTooltip
                multiline
                data-place="top"
                data-type="dark"
                data-effect="float"
              />
            </div>
          </div>
          <Input
            disabled={error != null || loading} // Disabling input during cosmic turbulence or data retrieval.
            prefixIconName="search"
            placeholder="/foo/bar - a mere suggestion of a starting point, explore the universe!"
            value={searchState.path}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: "SET_PATH", payload: e.target.value })
            }
            name="path"
          />
        </div>

        {/* The pattern input, a regular expression, the very spell to conjure specific files from the ether. */}
        <div className="flex-1">
          <Input
            disabled={error != null || loading} // Again, disabled during cosmic uncertainty.
            prefixIconName="search"
            placeholder="\.txt$ - or perhaps (\.log|\.json)$ for broader scope! Precision is key in this digital alchemy."
            value={searchState.pattern}
            label="File Pattern"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: "SET_PATTERN", payload: e.target.value })
            }
            name="pattern"
          />
        </div>

        {/* The AI-Enhanced Query input - the future of search, guided by silicon wisdom. */}
        {/* This is where human intent meets machine intelligence, forging a new paradigm of discovery. */}
        <div className="flex-1">
          <Input
            disabled={error != null || loading || isAIProcessing} // AI is a profound entity; we await its wisdom.
            prefixIconName="sparkle" // A visual cue for the magic within, a glint of digital enlightenment.
            placeholder="e.g., 'security logs' or 'customer data issues' - ask and the oracle shall ponder."
            value={searchState.aiQuery}
            label="Gemini AI Assistant Query"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: "SET_AI_QUERY", payload: e.target.value })
            }
            name="aiQuery"
          />
          {isAIProcessing && (
            <div className="mt-2 text-sm text-blue-500 flex items-center animate-pulse">
              <ClipLoader size={12} color="#4A90E2" className="mr-2" />
              AI Assistant is contemplating the cosmos, synthesizing pure insight...
            </div>
          )}
          {aiResponse && !isAIProcessing && (
            <div className="mt-2 text-xs p-2 bg-blue-100 border border-blue-300 rounded text-blue-800 shadow-sm">
              <strong>AI Insight:</strong> {aiResponse}
            </div>
          )}
        </div>
      </div>

      {/* The grand revelation of data, or the subtle dance of loading indicators. */}
      {!loading && !error ? (
        // Here, the raw, unadulterated truth of the file system is laid bare,
        // rendered with the elegance of ReactJson. A digital cartography, precise and profound.
        <ReactJson
          src={
            JSON.parse(data?.endpointTree as string) as Record<string, unknown>
          }
          name={null} // No overarching name, for the data speaks for itself in its boundless glory.
          displayDataTypes={false} // Unnecessary clutter; the truth is self-evident and requires no labels.
          indentWidth={2} // Aesthetically pleasing indentation, a mark of true craftsmanship and readability.
        />
      ) : // If the data is not yet ready, or if the cosmic forces have conspired against us,
      // we display the appropriate ethereal indicators.
      !error ? (
        // The humble spinner, a visual metaphor for the silent, tireless work of data retrieval.
        // It pulses with the anticipation of impending knowledge.
        <div className="flex justify-center items-center h-48">
          <ClipLoader size={40} color="#005691" />{" "}
          {/* Citibank blue, for institutional elegance. */}
        </div>
      ) : (
        // An error has occurred! The digital fabric has torn, a rupture in the spacetime continuum.
        // We present this catastrophic event with gravitas and humility, offering solace and guidance.
        <div className="text-red-600 font-bold text-center p-4 border border-red-300 bg-red-50 rounded shadow-md">
          <p className="mb-2">
            <span role="img" aria-label="alert">
              🚨
            </span>{" "}
            An unforeseen anomaly has disrupted the data stream. Error:{" "}
            {error.message}
          </p>
          <p className="text-sm font-normal text-red-700">
            Our digital seers are investigating this temporal distortion. Please
            recalibrate your query or contact support with the incident ID:{" "}
            <span className="font-mono text-xs bg-red-100 px-1 py-0.5 rounded">
              {endpointId}-{new Date().getTime()}
            </span>{" "}
            - a unique fingerprint of this cosmic misstep.
          </p>
        </div>
      )}
    </div>
  );
}

// The final act: exporting our creation into the digital cosmos,
// ready to serve the grand designs of Citibank Demo Business Inc.,
// a beacon of innovation and financial foresight.
export default EndpointTreeView;