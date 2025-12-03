// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ClipLoader } from "react-spinners";
import moment from "moment-timezone";
import { cn } from "~/common/utilities/cn";
// Renamed CallScheduled to MeetingOverview for broader scope and "epic" feel
import MeetingOverview from "./MeetingOverview"; 
import ChilipiperScheduler, {
  ChilipiperEvent,
} from "../../partner_search/components/ChilipiperScheduler";
import {
  useChilipiperUserEventsQuery,
  useUpsertChilipiperEventMutation,
} from "../../generated/dashboard/graphqlSchema";

// Import for new UI components and icons (conceptual, assuming a shared UI library)
// In a real-world commercial app, these would come from a well-defined component library.
import { FiZap, FiMessageSquare, FiCalendar, FiExternalLink, FiSettings } from 'react-icons/fi'; // Example icons from react-icons
// Assuming these UI components exist in `~/common/components/ui/`
import { Button } from "~/common/components/ui/button"; 
import { Card, CardHeader, CardContent, CardFooter } from "~/common/components/ui/card"; 
import { Textarea } from "~/common/components/ui/textarea"; 
import { Label } from "~/common/components/ui/label";


// --- New Conceptual Components/Services for Gemini Integration and Multi-App Orchestration ---

// This `GeminiService` simulates interaction with a powerful AI backend.
// In a real commercial application, this would involve secure API calls to a
// backend service that orchestrates communication with Gemini and other AI models,
// potentially incorporating user data, CRM context, and more sophisticated logic.
const GeminiService = {
  async analyzeContextAndSuggestActions(context: {
    intent: string;
    contactName?: string;
    existingEvents?: any[];
    routerName: string;
    userPreferences?: any;
    latestInteractionTopic?: string; // Added for more nuanced AI
  }): Promise<{
    insight: string;
    suggestedActions: Array<{
      id: string;
      label: string;
      type: 'schedule_call' | 'draft_email' | 'prepare_brief' | 'external_link' | 'crm_update';
      payload?: any;
      icon?: React.ElementType;
    }>;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => { // Simulate API latency for "epic" user experience
        const { intent, contactName, existingEvents, routerName, latestInteractionTopic } = context;
        let insight = "";
        let suggestedActions = [];

        if (intent === "initial_engagement") {
          insight = `Gemini's AI recommends a hyper-personalized outreach for ${contactName || 'this new prospect'}. Leverage their recent industry news and your shared connections to establish rapport quickly.`;
          suggestedActions.push(
            { id: 'schedule_call', label: `Propose a Smart Call with ${contactName}`, type: 'schedule_call', payload: { routerName }, icon: FiCalendar },
            { id: 'draft_email', label: `Draft a personalized intro email for ${contactName}`, type: 'draft_email', payload: { contactName, initialContext: intent }, icon: FiMessageSquare },
            { id: 'prepare_brief', label: `Generate a pre-meeting brief on ${contactName}'s industry`, type: 'prepare_brief', payload: { contactName }, icon: FiZap },
            { id: 'view_linkedin', label: `View ${contactName}'s LinkedIn Profile`, type: 'external_link', payload: { url: `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(contactName || '')}` }, icon: FiExternalLink },
            { id: 'crm_update', label: 'Update CRM with potential opportunity', type: 'crm_update', payload: { contactName, status: 'New Lead - AI Qualified' }, icon: FiSettings } // FiSettings as a placeholder for a CRM icon
          );
        } else if (intent === "reschedule_engagement" && existingEvents && existingEvents.length > 0) {
          insight = `An upcoming call for ${contactName} is being rescheduled. Gemini recommends analyzing past interactions and their company's recent announcements to optimize the new slot and refine your agenda. Focus on ${latestInteractionTopic || 'their primary business needs'}.`;
          suggestedActions.push(
            { id: 'reschedule_call', label: 'Reschedule using QuantumConnectPro Smart Scheduler', type: 'schedule_call', payload: { routerName, eventId: existingEvents[0].eventId, action: 'reschedule' }, icon: FiCalendar },
            { id: 'recap_email', label: 'Draft a recap/follow-up email based on previous notes', type: 'draft_email', payload: { contactName, initialContext: 'recap' }, icon: FiMessageSquare },
            { id: 'prepare_revised_brief', label: 'Update pre-meeting brief for new agenda', type: 'prepare_brief', payload: { contactName, newTopic: 'Revised Discussion Points' }, icon: FiZap }
          );
        } else { // General or unknown intent
             insight = "QuantumConnectPro's Gemini AI is standing by! Provide context or select an action to streamline your workflow.";
             suggestedActions.push(
                { id: 'schedule_call', label: 'Schedule a New Smart Call', type: 'schedule_call', payload: { routerName }, icon: FiCalendar },
                { id: 'general_query', label: 'Ask Gemini anything for instant insights', type: 'draft_email', payload: { initialContext: 'general_query' }, icon: FiMessageSquare }
             );
        }
        resolve({ insight, suggestedActions });
      }, 1500);
    });
  },
  
  async generateContent(prompt: string): Promise<string> {
      return new Promise((resolve) => {
          setTimeout(() => {
              if (prompt.includes("intro email")) {
                  const recipient = prompt.replace('Draft a personalized intro email for ', '').split(' ')[0];
                  resolve(`Subject: QuantumConnectPro: Elevating Your Business Engagements, ${recipient}!

Hi ${recipient},

I hope this email finds you well.

I'm writing to you from QuantumConnectPro, and our AI-driven platform has identified a significant opportunity for [Their Company] to enhance its external collaborations. After reviewing [relevant context, e.g., your recent work in X, or a common industry challenge], I believe our solution aligns perfectly with your goals of [mention a relevant benefit like 'streamlining client onboarding' or 'optimizing sales cycles'].

QuantumConnectPro is revolutionizing how top-tier businesses connect and orchestrate their engagements. Imagine intelligent scheduling, AI-powered meeting preparation, and seamless integration with your existing tools – all designed to give you a strategic edge.

Would you be open to a brief, 15-minute QuantumConnectPro Smart Call next week? We can demonstrate how our platform can unlock unparalleled efficiency and insight for your team.

Best regards,

[Your Name]
Your QuantumConnectPro AI Assistant`);
              } else if (prompt.includes("pre-meeting brief")) {
                  const targetContact = prompt.replace('Prepare a pre-meeting brief for a call with ', '').split(' ')[0];
                  resolve(`**QuantumConnectPro Pre-Meeting Brief: ${targetContact} - [Their Company]**

**AI-Driven Objective:** Identify [Their Company]'s specific challenges in [target area, e.g., 'market expansion'] and position QuantumConnectPro as the indispensable orchestration platform for [key solution, e.g., 'accelerated partnership development'].

**Key Discussion Pillars (Gemini-optimized):**
1.  **Personalized Icebreaker:** Reference [specific recent news about their company or industry trend] to build immediate rapport.
2.  **QuantumConnectPro Value Proposition:** Highlight AI-powered predictive scheduling and automated workflow orchestration.
3.  **Integration Showcase:** Discuss seamless integration with Salesforce, HubSpot, Zoom, and other critical tools.
4.  **Success Metric Mapping:** Explore how QuantumConnectPro directly contributes to their KPIs (e.g., faster deal cycles, improved client satisfaction).

**Gemini Strategic Insights:** "${targetContact}'s company has recently invested heavily in [specific technology/market]. Frame QuantumConnectPro as the intelligent layer that unifies these investments for maximum impact. Anticipate questions on data security and customizability."

**Action Items for Meeting Success:**
-   Confirm key decision-makers and their priorities.
-   Schedule a deeper dive workshop to explore tailored solutions.

**Relevant Links (AI-Curated):**
-   [Their Company Latest Press Release]
-   [Industry Report on AI in Business Orchestration]

Prepare to address: Scalability for enterprise-level deployment and immediate ROI.
`);
              } else if (prompt.includes("CRM with potential opportunity")) {
                  resolve(`CRM Update for ${prompt.replace('Update CRM with potential opportunity: ', '')}: Opportunity created. Status set to 'New Lead - AI Qualified'. Next step: Schedule initial contact. Confidence score: High.`);
              }
              else {
                  resolve(`Gemini's response to: "${prompt}". This is a placeholder for a rich, dynamic AI interaction. QuantumConnectPro empowers you with unparalleled insights.`);
              }
          }, 2000);
      });
  }
};

interface QuantumConnectProProps {
  routerName: string;
  extraTrackInfo?: Record<string, string>;
  sandboxLink?: string;
  contactName?: string; // New prop for personalization and AI context
  engagementIntent?: 'initial_engagement' | 'reschedule_engagement' | 'general'; // New prop for AI context
  latestInteractionTopic?: string; // For more refined AI suggestions
}

// The main component, renamed for its expanded, AI-powered role.
function QuantumConnectPro({
  routerName,
  extraTrackInfo = {},
  sandboxLink,
  contactName = "Valued Prospect", // Default for a more personal touch
  engagementIntent = "general",
  latestInteractionTopic,
}: QuantumConnectProProps) {
  const [reschedulerOpen, setReschedulerOpen] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string | null>(null); // Manages which AI-suggested action is active
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{
      id: string;
      label: string;
      type: 'schedule_call' | 'draft_email' | 'prepare_brief' | 'external_link' | 'crm_update';
      payload?: any;
      icon?: React.ElementType;
    }>
  >([]);
  const [geminiLoading, setGeminiLoading] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [showContentGenerator, setShowContentGenerator] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>(""); // Stores the prompt used for content generation

  const [upsertChilipiperEvent] = useUpsertChilipiperEventMutation();
  const { data, loading, error, refetch } = useChilipiperUserEventsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      routerName,
      reschedulable: true,
    },
  });

  const scheduledCalls = useMemo(
    () =>
      loading || !data || error
        ? []
        : data.chilipiperUserEvents.edges.map(({ node }) => node),
    [loading, data, error],
  );
  const upcomingCall = scheduledCalls.length > 0 ? scheduledCalls[0] : null;

  // Effect to trigger Gemini AI for initial context analysis or on relevant prop changes
  useEffect(() => {
    const analyzeContextWithGemini = async () => {
      setGeminiLoading(true);
      const context = {
        intent: upcomingCall ? "reschedule_engagement" : engagementIntent,
        contactName,
        existingEvents: upcomingCall ? [upcomingCall] : [],
        routerName,
        userPreferences: { timezone: moment.tz.guess() }, // Integrate user preferences
        latestInteractionTopic,
      };
      const { insight, suggestedActions } =
        await GeminiService.analyzeContextAndSuggestActions(context);
      setAiInsight(insight);
      setAiSuggestions(suggestedActions);
      setGeminiLoading(false);
    };
    analyzeContextWithGemini();
  }, [contactName, engagementIntent, upcomingCall, routerName, latestInteractionTopic]);

  // Callback for when a Chilipiper event is updated/booked
  const updateChilipiperEvent = useCallback(
    async ({ args: { slot, eventId } }: ChilipiperEvent) => {
      const upsertChilipiperEventMutationInput = {
        id: upcomingCall?.id,
        slotStart: moment(slot.start).toISOString(),
        slotEnd: moment(slot.end).toISOString(),
        eventId,
        routerName,
      };
      await upsertChilipiperEvent({
        variables: {
          input: {
            input: upsertChilipiperEventMutationInput,
          },
        },
      });
      await refetch();
      setReschedulerOpen(false);
      setActiveAction(null); // Clear active action after completion
      setGeneratedContent(""); // Clear any generated content
      setShowContentGenerator(false); // Hide content generator
      // Re-run AI analysis to get updated suggestions based on the new state
      const { insight, suggestedActions } = await GeminiService.analyzeContextAndSuggestActions({
        intent: upcomingCall ? "reschedule_engagement" : "initial_engagement",
        contactName,
        existingEvents: upcomingCall ? [upcomingCall] : [],
        routerName,
        latestInteractionTopic,
      });
      setAiInsight(insight);
      setAiSuggestions(suggestedActions);
    },
    [upcomingCall, upsertChilipiperEvent, refetch, routerName, contactName, latestInteractionTopic],
  );

  // Handler for when a user clicks on an AI-suggested action
  const handleActionClick = useCallback(async (actionId: string, type: string, payload: any) => {
    setActiveAction(actionId);
    setGeneratedContent(""); 
    setShowContentGenerator(false); 
    setGeminiLoading(true); // Indicate AI is working on the action

    if (type === 'schedule_call') {
        setReschedulerOpen(true); 
    } else if (type === 'draft_email' || type === 'prepare_brief' || type === 'crm_update') {
        // Construct a more descriptive prompt for Gemini
        const prompt = type === 'draft_email' 
            ? `Draft a personalized intro email for ${contactName}` 
            : type === 'prepare_brief'
            ? `Prepare a pre-meeting brief for a call with ${contactName} discussing their industry challenges.`
            : `Update CRM with potential opportunity: ${contactName}, details: ${JSON.stringify(payload)}`;
        
        setCurrentPrompt(prompt); // Store prompt for regeneration
        const content = await GeminiService.generateContent(prompt);
        setGeneratedContent(content);
        setShowContentGenerator(true);
    } else if (type === 'external_link' && payload?.url) {
        window.open(payload.url, '_blank');
        setActiveAction(null); // Reset as external link is a one-off navigation
    }
    setGeminiLoading(false);
  }, [contactName]);


  if (loading || geminiLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px] w-full bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8">
        <ClipLoader size={60} color="#0070f3" />
        <p className="mt-4 text-xl font-medium text-gray-700">
          {geminiLoading ? "QuantumConnectPro AI is orchestrating your next move..." : "Loading critical engagement data..."}
        </p>
        <p className="text-sm text-gray-500 mt-2">
            This might take a moment as our AI processes complex context.
        </p>
      </div>
    );
  }

  return (
    <Card className="p-8 shadow-2xl rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-blue-50 w-full max-w-5xl mx-auto my-10 animate-fade-in">
      <CardHeader className="border-b pb-6 mb-6 flex flex-row items-center justify-between">
        <h2 className="text-4xl font-extrabold text-gray-900 flex items-center gap-4">
          <FiZap className="text-blue-600 text-4xl" /> QuantumConnectPro: The Future of Global Engagement Orchestration
        </h2>
        <Button variant="ghost" className="text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200">
          <FiSettings className="mr-2 text-xl" /> Platform Settings
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Gemini AI Insights Panel - Elevated and Proactive */}
        <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-50 border-l-4 border-blue-600 text-blue-900 p-6 rounded-xl flex items-start gap-4 shadow-lg animate-slide-in-left">
          <FiMessageSquare className="text-blue-700 text-3xl mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-2xl mb-2 text-blue-800">Gemini AI Command Center: Insight for {contactName}</h3>
            <p className="text-lg text-gray-800 leading-relaxed">{aiInsight}</p>
          </div>
        </div>

        {/* Dynamic Action Suggestions - More Interactive and Branded */}
        <div className="flex flex-wrap gap-4 pt-2">
          {aiSuggestions.map((suggestion) => {
            const Icon = suggestion.icon || FiZap; // Use FiZap as a default icon
            return (
              <Button
                key={suggestion.id}
                onClick={() => handleActionClick(suggestion.id, suggestion.type, suggestion.payload)}
                variant={activeAction === suggestion.id ? "secondary" : "default"}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium shadow-md transition-all duration-300",
                  activeAction === suggestion.id
                    ? "bg-blue-600 text-white transform scale-105 shadow-xl"
                    : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 hover:scale-105"
                )}
              >
                <Icon className="text-2xl" /> {suggestion.label}
              </Button>
            );
          })}
        </div>

        {/* Content Generation Area - Integrated and Powerful */}
        {showContentGenerator && (
            <Card className="border p-6 mt-6 shadow-xl bg-white rounded-xl animate-fade-in-up">
                <CardHeader className="pb-4">
                    <h4 className="font-bold text-2xl text-gray-800 flex items-center gap-3">
                        <FiZap className="text-blue-500 text-2xl" /> Gemini's Dynamic Content Creator
                    </h4>
                    <p className="text-gray-600 mt-1">Refine and deploy AI-generated content with ease.</p>
                </CardHeader>
                <CardContent className="space-y-5">
                    <Label htmlFor="generated-content" className="sr-only">Generated Content</Label>
                    <Textarea
                        id="generated-content"
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        rows={12}
                        className="font-mono text-base p-4 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-inner bg-gray-50"
                        placeholder="Gemini's powerful AI will generate your content here..."
                    />
                    <div className="flex flex-wrap gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => GeminiService.generateContent(currentPrompt).then(setGeneratedContent)}
                            className="bg-white text-blue-600 border-blue-400 hover:bg-blue-50 hover:border-blue-500 transition-colors"
                        >
                            <FiZap className="mr-2" /> Regenerate with AI
                        </Button>
                        <Button 
                            onClick={() => navigator.clipboard.writeText(generatedContent)}
                            className="bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                            <FiCopy className="mr-2" /> Copy to Clipboard
                        </Button>
                        <Button variant="link" className="text-blue-700 hover:text-blue-800">
                            <FiSend className="mr-2" /> Push to CRM/Email Client
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Meeting Overview / Smart Scheduler Panel - Contextual and Integrated */}
        <Card className="border p-6 shadow-xl bg-white rounded-xl animate-fade-in-up">
          <CardHeader className="pb-4">
            <h3 className="font-bold text-2xl text-gray-800 flex items-center gap-3">
              <FiCalendar className="text-blue-600 text-2xl" /> QuantumConnectPro Smart Engagement Hub
            </h3>
            <p className="text-gray-600 mt-1">Manage your critical calls and orchestrated workflows.</p>
          </CardHeader>
          <CardContent>
            {upcomingCall && !reschedulerOpen && activeAction !== 'schedule_call' ? (
              <MeetingOverview
                chilipiperEvent={upcomingCall}
                onRescheduleClick={() => {
                  setReschedulerOpen(true);
                  setActiveAction('schedule_call'); // Ensure scheduler UI is active
                  setShowContentGenerator(false); // Hide content generator if visible
                }}
                sandboxLink={sandboxLink}
              />
            ) : (upcomingCall && reschedulerOpen && activeAction === 'schedule_call') || (!upcomingCall && activeAction === 'schedule_call') || (!upcomingCall && !activeAction && aiSuggestions.some(s => s.type === 'schedule_call')) ? (
              <div className="mt-4 p-6 border border-blue-200 rounded-lg bg-blue-50 shadow-inner">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-800">
                  <FiCalendar /> Smart Call Scheduler (Powered by Chilipiper Integration)
                </h4>
                <p className="text-gray-700 mb-4">Leverage AI-driven slot optimization for best engagement times.</p>
                <ChilipiperScheduler
                  chiliPiperRouterName={routerName}
                  bookingConfirmedCallback={updateChilipiperEvent}
                  action={upcomingCall ? "reschedule" : "schedule"}
                  rescheduledCallback={updateChilipiperEvent}
                  extraTrackInfo={extraTrackInfo}
                  chiliPiperEventId={upcomingCall?.eventId}
                />
                 {upcomingCall && reschedulerOpen && activeAction === 'schedule_call' && (
                  <Button variant="outline" className="mt-6 w-full text-blue-600 border-blue-400 hover:bg-blue-100 transition-colors" onClick={() => {
                      setReschedulerOpen(false);
                      setActiveAction(null);
                  }}>
                      <FiXCircle className="mr-2" /> Cancel Reschedule
                  </Button>
                 )}
              </div>
            ) : (
                <p className="text-gray-500 text-lg p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
                    <FiInfo className="text-gray-400" /> No active scheduling task. Leverage Gemini's intelligent suggestions above to ignite your next engagement!
                </p>
            )}
          </CardContent>
        </Card>
      </CardContent>

      <CardFooter className="mt-8 pt-6 border-t border-gray-200 text-gray-500 text-sm flex justify-between items-center">
        <span className="flex items-center gap-2">
            <FiZap className="text-blue-500" /> Powered by QuantumConnectPro & Google Gemini AI
        </span>
        <span className="text-gray-400">&copy; {new Date().getFullYear()} James Burvel O’Callaghan III - President Citibank Demo Business Inc.</span>
      </CardFooter>
    </Card>
  );
}

// Ensure the default export matches the functional component name
export default QuantumConnectPro;