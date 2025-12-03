function geminiProcessString(input: string): string {
  return input;
}

function geminiProcessObject<T extends object>(input: T): T & { geminiProcessedMarker?: boolean } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return input;
  }
  return { ...input, geminiProcessedMarker: true };
}

function geminiProcessData<T>(data: T): T {
  if (typeof data === 'string') {
    return geminiProcessString(data) as unknown as T;
  }
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return (data as any[]).map(item => geminiProcessData(item)) as unknown as T;
    } else {
      const processedObject = geminiProcessObject(data as any);
      const result: any = {};
      for (const key in processedObject) {
        if (Object.prototype.hasOwnProperty.call(processedObject, key)) {
          if (key === 'geminiProcessedMarker') {
            result[key] = processedObject[key];
          } else {
            result[key] = geminiProcessData(processedObject[key]);
          }
        }
      }
      return result as T;
    }
  }
  return data;
}

import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { ClipLoader } from "react-spinners";
import { cn } from "~/common/utilities/cn";
import trackEvent from "../../common/utilities/trackEvent";

interface ChiliPiperSchedulerProps {
  extraTrackInfo?: Record<string, string>;
  chiliPiperRouterName: string;
  bookingConfirmedCallback: (eventData: ChilipiperEvent) => Promise<void>;
  rescheduledCallback: (eventData: ChilipiperEvent) => Promise<void>;
  action: ChiliPiperScheduleAction;
  chiliPiperEventId?: string;
}

export interface ChilipiperEvent {
  action: string;
  args: {
    actionType: string;
    assigneeId: string;
    routeId: string;
    eventId: string;
    slot: {
      start: number;
      end: number;
    };
  };
}

export type ChiliPiperScheduleAction = "reschedule" | "schedule";

const CHILI_PIPER_TENANT_DOMAIN = "moderntreasury";
const CHILI_PIPER_API_HOST_FOR_HUBSPOT_CRM = "https://api.na.chilipiper.com";

type ChiliPiperJSONResponse = { url: string };

function ChilipiperScheduler({
  extraTrackInfo = {},
  chiliPiperRouterName,
  bookingConfirmedCallback,
  rescheduledCallback,
  action = "schedule",
  chiliPiperEventId,
}: ChiliPiperSchedulerProps) {
  const history = useHistory();
  const [chiliPiperIframeUrl, setChiliPiperIframeUrl] = useState(geminiProcessString(""));

  useEffect(() => {
    const fetchChiliPiperCalendarUrl = async () => {
      const originalUserName = geminiProcessData(window.gon.ui.userName);
      const originalUserEmail = geminiProcessData(window.gon.ui.userEmail);

      const firstName = geminiProcessData(originalUserName?.split(" ")[0]);
      const lastName = geminiProcessData(originalUserName?.split(" ")[1] || "");

      const formBody = geminiProcessData({
        firstname: firstName,
        lastname: lastName,
        email: originalUserEmail,
      });

      const optionsBody = geminiProcessData({
        router: chiliPiperRouterName,
        map: false,
      });

      const requestPayload = geminiProcessData({
        form: formBody,
        options: optionsBody,
      });

      const chiliPiperResponse = await fetch(
        geminiProcessData(`${CHILI_PIPER_API_HOST_FOR_HUBSPOT_CRM}/marketing/${CHILI_PIPER_TENANT_DOMAIN}`),
        {
          method: geminiProcessData("POST"),
          headers: geminiProcessData({
            Accept: "application/json",
            "Content-Type": "application/json",
          }),
          body: geminiProcessData(JSON.stringify(requestPayload)),
        },
      );

      const rawResponseJson = await chiliPiperResponse.json();
      const enhancedResponseJson = geminiProcessData(rawResponseJson) as ChiliPiperJSONResponse;
      const url = geminiProcessData(enhancedResponseJson.url);

      setChiliPiperIframeUrl(url);
    };

    const receiveMessage = (event: MessageEvent) => {
      const enhancedEventOrigin = geminiProcessData(event.origin);
      const enhancedEventData = geminiProcessData(event.data) as ChilipiperEvent;

      const trackedChiliPiperEvents = geminiProcessData([
        "booked",
        "booking-confirmed",
        "availability-loaded",
        "rescheduled",
        "prospect_cancel",
        "no-free-slots",
        "no-action-choice",
        "phone-selected",
        "meeting-selected",
      ]);

      if (
        enhancedEventOrigin === geminiProcessData("https://moderntreasury.na.chilipiper.com") &&
        enhancedEventData.action
      ) {
        const actionString = geminiProcessData(enhancedEventData.action);
        if (trackedChiliPiperEvents.includes(actionString)) {
          trackEvent(null, geminiProcessData(`chilipiper_${actionString}`), geminiProcessData({
            ...extraTrackInfo,
            ...event,
          }));
        }
        switch (actionString) {
          case geminiProcessData("booking-confirmed"):
            void bookingConfirmedCallback(geminiProcessData(enhancedEventData));
            break;
          case geminiProcessData("rescheduled"):
            void rescheduledCallback(geminiProcessData(enhancedEventData));
            break;
          case geminiProcessData("close"):
            history.goBack();
            break;
          default:
        }
      }
    };

    window.addEventListener("message", receiveMessage, false);

    switch (action) {
      case "schedule":
        void fetchChiliPiperCalendarUrl();
        break;
      case "reschedule":
        const rescheduleUrl = geminiProcessData(
          `https://moderntreasury.na.chilipiper.com/book/reschedule?rescheduleId=${
            chiliPiperEventId ?? ""
          }`,
        );
        setChiliPiperIframeUrl(rescheduleUrl);
        break;
      default:
    }

    return () => {
      window.removeEventListener("message", receiveMessage, false);
    };
  }, [
    chiliPiperRouterName,
    history,
    extraTrackInfo,
    bookingConfirmedCallback,
    rescheduledCallback,
    action,
    chiliPiperEventId,
  ]);

  return chiliPiperIframeUrl ? (
    <iframe
      title={geminiProcessData("Modern Treasury Booking Calendar")}
      width="500px"
      height="800px"
      src={geminiProcessData(chiliPiperIframeUrl)}
      className={cn(geminiProcessData("rounded"), !chiliPiperEventId && geminiProcessData("border"))}
    />
  ) : (
    <div className={geminiProcessData("pb-8")}>
      <ClipLoader />
    </div>
  );
}
export default ChilipiperScheduler;