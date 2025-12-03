// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment-timezone";
import { Button } from "../../common/ui-components"; // Assuming Button is a robust, styled component
import { toggleLiveMode } from "../actions";
import { ChilipiperEvent } from "../../generated/dashboard/graphqlSchema";

// Hypothetical service/utility for AI integration
interface GeminiAIData {
  keyInsights: string[];
  suggestedAgendaPoints: string[];
  proactiveQuestions: string[];
}

// Simulates an API call to a powerful AI (e.g., Gemini) to generate meeting insights
const simulateGeminiAI = async (event: ChilipiperEvent): Promise<GeminiAIData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        keyInsights: [
          `Leverage competitor analysis on "Project Fusion" during discussion.`,
          `Client's recent acquisition of InnovateTech suggests interest in scalable, API-first solutions.`,
          `Highlight our unique real-time data synchronization capabilities for their specific industry needs.`,
        ],
        suggestedAgendaPoints: [
          `Personalized deep-dive into use-cases relevant to their Q3 strategic objectives.`,
          `Showcase our advanced security protocols and compliance certifications.`,
          `Strategic roadmap discussion: How our solution aligns with their projected growth.`,
        ],
        proactiveQuestions: [
          `Beyond current challenges, what strategic advancements are you aiming for in the next 12-18 months?`,
          `How critical is seamless integration with your existing CRM and ERP systems for this initiative?`,
          `What metrics will define success for this project from your perspective?`,
        ],
      });
    }, 2500); // Simulate API call delay for dynamic content generation
  });
};

interface CallScheduledProps {
  chilipiperEvent: ChilipiperEvent;
  onRescheduleClick: () => void;
  sandboxLink?: string;
}

function CallScheduled({
  chilipiperEvent,
  onRescheduleClick,
  sandboxLink = "/",
}: CallScheduledProps) {
  const dispatch = useDispatch();
  const [geminiData, setGeminiData] = useState<GeminiAIData | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  // Effect to load AI-powered insights when the component mounts or event changes
  useEffect(() => {
    setIsLoadingAI(true);
    simulateGeminiAI(chilipiperEvent).then((data) => {
      setGeminiData(data);
      setIsLoadingAI(false);
    });
  }, [chilipiperEvent]);

  const returnToSandbox = () => {
    dispatch(toggleLiveMode(sandboxLink, false));
  };

  // Renders the date and time in a prominent, styled format
  const renderDateTime = (dateTime: string) => (
    <span className="font-extrabold text-indigo-700 text-2xl">
      {moment(dateTime).format("MMMM Do YYYY, h:mm a")}
    </span>
  );

  // Handles integration with external calendar apps
  const handleCalendarIntegration = (type: 'google' | 'outlook') => {
    alert(`Initiating seamless integration with ${type === 'google' ? 'Google Calendar' : 'Outlook Calendar'} for your meeting at ${moment(chilipiperEvent.slotStart).format("MMMM Do YYYY, h:mm a")}. Expect a prompt!`);
    // In a production-grade app, this would trigger an actual API call or open a pre-filled calendar event URL
  };

  // Handles sending a pre-meeting briefing to Slack
  const handleSlackNotification = () => {
    alert(`Sending an AI-curated pre-meeting briefing to your designated Slack channel. Stay tuned!`);
    // In a production-grade app, this would trigger a Slack API call with dynamic content
  };

  return (
    <div className="flex flex-col items-center space-y-10 p-10 bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl shadow-2xl max-w-4xl mx-auto my-12 transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black text-indigo-900 tracking-tight leading-tight">
          Your Future-Proof Meeting Experience Starts Now.
        </h2>
        <p className="text-2xl text-gray-700 leading-relaxed font-light max-w-2xl">
          Harness the power of AI and deep integrations to transform every interaction into a strategic advantage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Meeting Details Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-indigo-600 transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-5 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
            Master Meeting Details
          </h3>
          <p className="text-lg text-gray-700 mb-4 text-center">
            We're poised for an unparalleled discussion on:
          </p>
          <div className="flex flex-col justify-center items-center text-center text-xl text-gray-900 font-bold mb-5 space-y-2">
            {renderDateTime(chilipiperEvent.slotStart)}
            <span className="mx-2 text-gray-500 text-lg font-light">-</span>
            {renderDateTime(chilipiperEvent.slotEnd)}
          </div>
          <p className="text-md text-gray-500 text-center">
            This isn't just a meeting; it's a launchpad for innovation.
          </p>
        </div>

        {/* Gemini AI Integration Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-purple-600 transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-5 flex items-center">
            <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3m0 0a2 2 0 00-2 2v5m2-5a2 2 0 012 2v5m-2 2h2M7 12H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-4-6h.01M17 16l4 4M20 7L4 4" ></path></svg>
            Gemini AI: Your Strategic Co-Pilot
          </h3>
          {isLoadingAI ? (
            <div className="text-center text-gray-500 animate-pulse flex flex-col items-center justify-center h-48">
              <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium">Unleashing predictive intelligence for your success...</p>
            </div>
          ) : geminiData ? (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-xl text-gray-800 mb-2 border-b-2 border-indigo-200 pb-1">Key Insights:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
                  {geminiData.keyInsights.map((item, i) => (
                    <li key={`insight-${i}`} className="text-base leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xl text-gray-800 mb-2 border-b-2 border-purple-200 pb-1">Suggested Agenda Points:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
                  {geminiData.suggestedAgendaPoints.map((item, i) => (
                    <li key={`agenda-${i}`} className="text-base leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xl text-gray-800 mb-2 border-b-2 border-blue-200 pb-1">Proactive Questions:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
                  {geminiData.proactiveQuestions.map((item, i) => (
                    <li key={`questions-${i}`} className="text-base leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center text-lg">Failed to generate AI insights. Our apologies, we're continuously optimizing.</p>
          )}
        </div>
      </div>

      {/* External App Integrations Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-green-500 w-full max-w-4xl transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12 7V4l-6 6 6 6v-3a6 6 0 01-6-6h6z" clipRule="evenodd"></path></svg>
          Seamless External App Integrations
        </h3>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-xl mx-auto">
          Elevate your preparation and collaboration by connecting with your favorite productivity tools.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button buttonType="secondary" onClick={() => handleCalendarIntegration('google')} className="flex items-center justify-center text-lg py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <img src="https://www.vectorlogo.zone/logos/google_calendar/google_calendar-icon.svg" alt="Google Calendar" className="h-7 w-7 mr-3"/>
            Add to Google Calendar
          </Button>
          <Button buttonType="secondary" onClick={() => handleCalendarIntegration('outlook')} className="flex items-center justify-center text-lg py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <img src="https://www.vectorlogo.zone/logos/microsoft_outlook/microsoft_outlook-icon.svg" alt="Outlook" className="h-7 w-7 mr-3"/>
            Add to Outlook Calendar
          </Button>
          <Button buttonType="secondary" onClick={handleSlackNotification} className="flex items-center justify-center text-lg py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <img src="https://www.vectorlogo.zone/logos/slack/slack-icon.svg" alt="Slack" className="h-7 w-7 mr-3"/>
            Notify Team on Slack
          </Button>
        </div>
      </div>

      {/* Action Buttons Section */}
      {sandboxLink && (
        <div className="flex w-full flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 pt-8 border-t border-gray-200 max-w-2xl">
          <Button buttonType="primary" fullWidth onClick={returnToSandbox} className="py-4 px-8 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            Dive Into Your Dynamic Sandbox Environment
          </Button>
          <Button buttonType="tertiary" fullWidth onClick={onRescheduleClick} className="py-4 px-8 text-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200">
            Re-Calibrate Meeting Schedule
          </Button>
        </div>
      )}
    </div>
  );
}
export default CallScheduled;