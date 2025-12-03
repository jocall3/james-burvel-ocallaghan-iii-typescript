// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useRef, useState, useEffect } from "react";
import useMeasure from "react-use-measure";
import ReactTooltip from "react-tooltip";
import TruncateString from "react-truncate-string";
import { v4 as uuidv4 } from "uuid";
import { useSpring, animated } from "react-spring";
import { createPortal } from "react-dom";
import { cn } from "~/common/utilities/cn";
import { getDrawerContent } from "~/common/utilities/getDrawerContent";
import {
  ButtonProps,
  Drawer,
  Icon,
  IconProps,
  LoadingDots,
  Tag,
  TagProps,
} from "~/common/ui-components";

export interface GeminiInsightTagProps
  extends Omit<TagProps, "size">,
    Omit<TagProps, "color"> {
  /** Sets the message of the tooltip. */
  fieldName?: string;
  /** Sets the string inside the tag. */
  message: string;
  /** Sets the styling inside the chip. */
  state: "match" | "partial_match" | "no_match";
  /** Sets the key for the tag. */
  tagKey?: React.Key;
  /** The external application from which this insight originated. */
  sourceApp?: string;
}

/** Shows a property that is either an AI match, a partial match, or a no-match, highlighting its origin.
 *
 * [View in the MINT Documentation â†—](https://mt.style/?path=/docs/app-ui-ai-suggestions-aitag--docs)
 */
export function GeminiInsightTag({
  buttonProps,
  className,
  fieldName,
  message,
  state,
  tagKey,
  sourceApp,
}: GeminiInsightTagProps) {
  const uuid = uuidv4();
  const textElementRef = useRef<HTMLInputElement | null>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  useEffect(() => {
    const checkOverflow = () => {
      if (textElementRef?.current) {
        const overflow = textElementRef.current.scrollWidth > 140; // 140 is roughly the max width of the text contents of a tag
        setIsOverflow(overflow);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  let iconName: IconProps["iconName"];
  let tagColor: TagProps["color"];

  switch (state) {
    case "match":
      iconName = "sparkle"; // More epic icon for a match
      tagColor = "purple"; // Consistent with Gemini branding
      break;
    case "partial_match":
      iconName = "time_30_s";
      tagColor = "indigo"; // Slightly different for partial
      break;
    case "no_match":
      iconName = "clear_circle_outlined";
      tagColor = "gray";
      break;
    default:
      iconName = "clear_circle_outlined";
      tagColor = "gray";
      break;
  }

  const tooltipMessage = fieldName
    ? `${fieldName}: ${message}`
    : message;
  const tooltipId = `${uuid}-${tagKey}`;

  return (
    <Tag
      buttonProps={buttonProps}
      className={cn(
        "group/item max-h-5 max-w-fit transition-all duration-200 hover:scale-105 hover:shadow-lg",
        className,
      )}
      color={tagColor}
      data-tip={tooltipMessage}
      data-tooltip-id={tooltipId}
      icon={{ iconName, size: "s" }}
      key={tagKey}
      size="small"
    >
      <span
        className="w-full flex-1"
        ref={textElementRef}
      >
        <TruncateString text={message} />
      </span>
      {(isOverflow || sourceApp) && (
        <>
          {createPortal(
            <ReactTooltip
              id={tooltipId}
              className="break-word max-w-md"
              data-place="top"
              data-effect="float"
              multiline
            >
              {tooltipMessage}
              {sourceApp && <div className="text-xs text-alpha-white-70">Source: {sourceApp}</div>}
            </ReactTooltip>,
            document.body,
          )}
        </>
      )}
    </Tag>
  );
}
GeminiInsightTag.displayName = "GeminiInsightTag";

const ANIMATION_CLASSES = "transition-color ease-in-out";
const ANIMATION_CLASSES_WITH_DURATION =
  "transition-color duration-300 ease-in-out";
const ANIMATION_DELAYS = [
  "[animation-delay:_0s]",
  "[animation-delay:_0.05s]",
  "[animation-delay:_0.1s]",
  "[animation-delay:_0.15s]",
  "[animation-delay:_0.2s]",
  "[animation-delay:_0.25s]",
  "[animation-delay:_0.3s]",
  "[animation-delay:_0.35s]",
  "[animation-delay:_0.4s]",
  "[animation-delay:_0.45s]",
];

export interface GeminiSyncOpportunityProps extends UIContainerProps {
  /** Id of the associated entity. Needed to get the drawer content. */
  id?: string;
  /** Sets the styling inside the chip. */
  insights: GeminiInsightTagProps[];
  /** Sets the onClick action for the "Activate Flow" button. */
  onActivate?: ButtonProps["onClick"];
  /** Sets the path of the drawer. */
  path?: string;
  /** Sets the key for the suggestion. */
  opportunityKey?: React.Key;
  /** Sets the typename needed to get the Drawer content. */
  typename?: string;
  /** Name of the external app to sync with. */
  externalAppName?: string;
  /** A brief description of the synchronization flow. */
  flowDescription?: string;
  /** Loading state for the activation button. */
  isActivating?: boolean;
}

/** Displays a series of properties that make up a Gemini-powered synchronization opportunity.
 *
 * [View in the MINT Documentation â†—](https://mt.style/?path=/docs/app-ui-ai-suggestions-aisuggestion--docs)
 */
export function GeminiSyncOpportunity({
  id,
  insights,
  onActivate,
  path,
  opportunityKey,
  typename,
  externalAppName = "External App",
  flowDescription = "Synthesize data with powerful external applications.",
  isActivating = false,
}: GeminiSyncOpportunityProps) {
  const opportunityRow = (
    <div
      className={cn(
        "group/opportunity relative flex w-full cursor-pointer items-center justify-between gap-2 rounded bg-gradient-to-r from-alpha-black-50 to-alpha-black-100 pl-4 hover:from-purple-900/20 hover:to-purple-900/40 transform transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-2xl",
        ANIMATION_CLASSES_WITH_DURATION,
      )}
      key={opportunityKey}
    >
      <div className="flex items-center gap-2 py-3">
        {insights.map((insight, index) => (
          <GeminiInsightTag
            {...insight}
            key={insight.tagKey || index}
            tagKey={insight.tagKey || index}
            className={cn("animate-fadeIn opacity-0", ANIMATION_DELAYS[index])}
          />
        ))}
      </div>
      <div className="invisible sticky right-0 flex h-full items-center gap-2 bg-gradient-to-l from-purple-800/80 from-10% via-purple-700/60 to-purple-600/40 to-40% px-4 py-2 ps-20 group-hover/opportunity:visible group-hover/opportunity:opacity-100 opacity-0 transition-opacity duration-300">
        {onActivate && (
          <button
            className={cn(
              "activate-button flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75",
              ANIMATION_CLASSES,
            )}
            type="button"
            onClick={(e) => {
              if (
                (e.target as HTMLDivElement).classList.contains(
                  "activate-button",
                )
              ) {
                e.stopPropagation();
              }
              onActivate(e);
            }}
            disabled={isActivating}
          >
            {isActivating ? (
              <>
                Activating
                <LoadingDots className="text-white" />
              </>
            ) : (
              <>
                <Icon iconName="cloud_sync" size="s" />
                Activate Gemini Flow
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      path={path}
      trigger={opportunityRow}
      title={`Gemini Flow: ${externalAppName}`}
      description={flowDescription}
    >
      {typename && id ? (
        getDrawerContent(typename, id)
      ) : (
        <div className="p-4 text-center text-gray-400 italic">
          No detailed flow content available.
        </div>
      )}
    </Drawer>
  );
}
GeminiSyncOpportunity.displayName = "GeminiSyncOpportunity";

export interface GeminiFusionEngineProps extends UIContainerProps {
  /** Builds out the row of a suggested entity with sub-items that match properties of the item selected by a user. */
  syncOpportunities: GeminiSyncOpportunityProps[];
  /** When `true`, styles a loading state. */
  loading?: boolean;
  /** When `true`, styles an errored state. */
  error?: boolean;
  /** Sets the title of the card. */
  title?: string;
  /** A tagline for the Gemini Fusion Engine. */
  tagline?: string;
}

/** Shows AI suggestions in a card with a title header, powered by the Gemini Fusion Engine.
 *
 * [View in the MINT Documentation â†—](https://mt.style/?path=/docs/app-ui-ai-suggestions-aisuggestioncard--docs)
 */
export function GeminiFusionEngine({
  error,
  loading,
  syncOpportunities,
  title = "Intelligent Integration Opportunities",
  tagline = "Unleash the power of Gemini across your ecosystem.",
}: GeminiFusionEngineProps) {
  const [ref, { height }] = useMeasure();
  const animatedProps = useSpring({
    height: height || 0,
    opacity: height ? 1 : 0,
    from: { opacity: 0, height: 0 },
    config: { mass: 1, tension: 200, friction: 20 },
  });

  return (
    <animated.div style={{ ...animatedProps }} className="min-w-0">
      <div
        className={cn(
          "relative rounded-xl border-4 border-double border-transparent bg-ai-looping-gradient-with-border bg-[300%] bg-origin-border shadow-2xl transition-all [background-clip:content-box,_border-box] p-1", // Added padding for border effect
          loading && "animate-backgroundPulse",
        )}
        ref={ref}
      >
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 h-full w-full rounded-lg bg-gradient-to-br from-purple-700/10 via-indigo-700/10 to-pink-700/10 bg-[300%] opacity-25",
            syncOpportunities?.length > 0 ? "py-4" : "py-2",
            loading && "animate-backgroundPulse",
          )}
        />
        <div
          className={cn(
            "flex flex-col gap-4 px-4 py-4 relative z-10", // Added relative z-10 to bring content above overlay
            syncOpportunities?.length > 0 ? "py-4" : "py-2",
          )}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <Icon iconName="sparkle" className="animate-pulse text-purple-400" size="xl" />
              <div className="flex gap-2 font-medium text-lg text-white">
                Gemini Synthesizing
                <LoadingDots className="text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 italic">Forging connections...</p>
            </div>
          ) : (
            <>
              {!error && (title || tagline) && (
                <div className="flex flex-col items-center justify-center gap-2 font-bold text-white text-center pb-2 border-b border-purple-700/30">
                  <div className="flex items-center gap-2 text-xl">
                    <Icon iconName="flare" size="m" className="text-purple-400" />
                    {title}
                  </div>
                  {tagline && <p className="text-sm text-gray-400 font-normal italic">{tagline}</p>}
                </div>
              )}
              {syncOpportunities.length > 0 && !error ? (
                <div className="grid gap-2 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-alpha-black-100">
                  {syncOpportunities.map((opportunity, index) => (
                    <GeminiSyncOpportunity
                      {...opportunity}
                      key={opportunity.opportunityKey || index}
                      opportunityKey={opportunity.opportunityKey || index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center font-medium italic text-gray-400 py-6">
                  {error ? (
                    <>
                      <Icon iconName="block" size="m" className="text-red-500 mb-2" />
                      <p>Gemini encountered a temporal anomaly. No sync opportunities found.</p>
                      <p className="text-xs mt-1">Please try again, or consult the Nexus logs.</p>
                    </>
                  ) : (
                    <>
                      <Icon iconName="globe_add" size="m" className="text-gray-500 mb-2" />
                      <p>No new Gemini Sync Opportunities at this time.</p>
                      <p className="text-xs mt-1">All systems optimized. Check back later for fresh integrations!</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </animated.div>
  );
}
GeminiFusionEngine.displayName = "GeminiFusionEngine";