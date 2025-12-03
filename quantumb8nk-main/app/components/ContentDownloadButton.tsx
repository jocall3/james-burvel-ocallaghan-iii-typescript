// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../../common/ui-components";
import useObjectUrl from "../../common/utilities/useObjectUrl";

// --- Mock / Simulated External Services ---

// Simulate a sophisticated AI service like Gemini
async function simulateGeminiContentIntelligence(content: string) {
  console.log("Gemini AI: Analyzing content for insights and enhancement opportunities...");
  await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI processing time

  // Extremely simplified AI logic based on content characteristics
  let enhancedContent = content;
  let suggestedActions: { label: string; action: string }[] = [];
  let insights: string[] = [];

  const lowerContent = content.toLowerCase();

  if (lowerContent.includes("financial report") || lowerContent.includes("earnings data")) {
    enhancedContent = `AI-Processed Financial Report:\n${content}\n\nAI Insight: This document contains critical financial data. I can help you summarize key metrics or generate investor presentations.`;
    insights.push("Financial data detected. High priority for accurate processing.");
    suggestedActions.push({ label: "Generate Executive Summary (AI)", action: "generate_executive_summary" });
    suggestedActions.push({ label: "Extract Key Metrics (AI)", action: "extract_metrics" });
    suggestedActions.push({ label: "Prepare Investor Deck (AI)", action: "prepare_investor_deck" });
  } else if (lowerContent.includes("marketing plan") || lowerContent.includes("campaign brief")) {
    enhancedContent = `AI-Optimized Marketing Plan:\n${content}\n\nAI Insight: This marketing plan is ready for multi-channel distribution. I can suggest platform-specific optimizations.`;
    insights.push("Marketing content detected. Focus on audience targeting and reach.");
    suggestedActions.push({ label: "Suggest Social Media Posts (AI)", action: "suggest_social_posts" });
    suggestedActions.push({ label: "Generate Email Campaign Drafts (AI)", action: "generate_email_drafts" });
  } else if (lowerContent.includes("code snippet") || lowerContent.includes("json") || lowerContent.includes("xml")) {
    enhancedContent = `AI-Reviewed Code/Data Structure:\n${content}\n\nAI Insight: This looks like structured data or code. I can validate syntax or convert formats.`;
    insights.push("Code/Structured data detected. Prioritize syntax validation and format conversion.");
    suggestedActions.push({ label: "Validate Syntax (AI)", action: "validate_syntax" });
    suggestedActions.push({ label: "Convert to YAML (AI)", action: "convert_yaml" });
  } else if (content.length > 500) {
    enhancedContent = `AI-Enhanced Long-Form Content:\n"${content.substring(0, 200)}..."\n\nOriginal Content (AI-Proofread):\n${content}\n\nAI Insight: Extensive content. Optimal for deep analysis or breaking down into digestible parts.`;
    insights.push("Long-form narrative detected. Excellent for blog posts, articles, or reports.");
    suggestedActions.push({ label: "Generate Blog Post Ideas (AI)", action: "generate_blog_ideas" });
    suggestedActions.push({ label: "Create Short Summaries (AI)", action: "create_summaries" });
  } else {
    enhancedContent = `AI-Proofread & Optimized Content:\n${content}\n\nAI Insight: General text content. Optimized for clarity and impact.`;
    insights.push("General text content detected. Ready for concise communication.");
    suggestedActions.push({ label: "Improve Wording (AI)", action: "improve_wording" });
  }

  // Common actions always available
  suggestedActions.push({ label: "Download Enhanced (AI-Powered)", action: "download_enhanced" });
  suggestedActions.push({ label: "Download Original (Secure Link)", action: "download_original" });

  console.log("Gemini AI: Analysis complete!");
  return { enhancedContent, suggestedActions, insights };
}

// Simulate external app integrations and advanced AI actions
const externalAppServices = {
  async publishToCitibankInternalPortal(content: string, filename: string) {
    console.log(`Citibank Portal Integration: Publishing "${filename}" to internal portal...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Citibank Portal Integration: Content "${filename}" successfully published!`);
    alert(`Content "${filename}" successfully published to Citibank Internal Portal!`);
  },
  async pushToSalesforceCRM(content: string, filename: string) {
    console.log(`Salesforce CRM Integration: Pushing "${filename}" to Salesforce...`);
    await new Promise(resolve => setTimeout(resolve, 1800));
    console.log(`Salesforce CRM Integration: Content "${filename}" pushed to Salesforce!`);
    alert(`Content "${filename}" pushed to Salesforce CRM!`);
  },
  async scheduleSocialBlast(content: string, filename: string) {
    console.log(`Social Media Orchestrator: Scheduling "${filename}" across channels...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Social Media Orchestrator: "${filename}" scheduled for multi-platform blast!`);
    alert(`Content "${filename}" scheduled for social media blast!`);
  },
  async sendToGlobalCollaborationSuite(content: string, filename: string) {
    console.log(`Global Collaboration Suite: Dispatching "${filename}" to relevant teams...`);
    await new Promise(resolve => setTimeout(resolve, 1700));
    console.log(`Global Collaboration Suite: "${filename}" dispatched!`);
    alert(`Content "${filename}" dispatched to Global Collaboration Suite!`);
  },
  async generateExecutiveSummary(content: string) {
    console.log("AI: Generating executive summary...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    const summary = content.substring(0, Math.min(content.length, 250)) + (content.length > 250 ? "...\n\n(Full summary would be more detailed)" : "");
    alert("AI generated Executive Summary:\n" + summary);
    return summary;
  },
  async extractKeyMetrics(content: string) {
    console.log("AI: Extracting key metrics...");
    await new Promise(resolve => setTimeout(resolve, 1800));
    const metrics = { revenue: "$1.2B", growth: "15%", marketShare: "8%", dataPoints: content.split(/\s+/).filter(word => !isNaN(Number(word))).length };
    alert(`AI extracted Key Financial Metrics: Revenue: ${metrics.revenue}, Growth: ${metrics.growth}, Market Share: ${metrics.marketShare}, Data Points Analyzed: ${metrics.dataPoints}`);
    return metrics;
  },
  async prepareInvestorDeck(content: string) {
    console.log("AI: Preparing investor presentation deck...");
    await new Promise(resolve => setTimeout(resolve, 2200));
    alert("AI generated a draft investor deck (simulated). Check your linked presentation software!");
    return "investor_deck_link";
  },
  async suggestSocialMediaPosts(content: string) {
    console.log("AI: Suggesting social media posts...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const post1 = `Exciting news! ${content.substring(0, 50)}... #Innovation #Finance`;
    const post2 = `Deep dive into our latest: ${content.substring(0, 70)}... Link in bio!`;
    alert(`AI suggested Social Posts:\n1. ${post1}\n2. ${post2}`);
    return [post1, post2];
  },
  async generateEmailCampaignDrafts(content: string) {
    console.log("AI: Generating email campaign drafts...");
    await new Promise(resolve => setTimeout(resolve, 1700));
    const emailSubject = `Exclusive: ${content.substring(0, 40)}...`;
    const emailBody = `Dear Valued Client,\n\nWe're thrilled to share insights on ${content.substring(0, 100)}...\n\nRead more at [Link].\n\nBest regards,\nCitibank Team`;
    alert(`AI generated Email Draft:\nSubject: ${emailSubject}\n\nBody:\n${emailBody}`);
    return { subject: emailSubject, body: emailBody };
  },
  async validateSyntax(content: string) {
    console.log("AI: Validating syntax...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isValid = !content.includes("error") && !content.includes("invalid"); // Simplistic check
    alert(`AI Syntax Validation: ${isValid ? "Passed!" : "Found potential issues."}`);
    return isValid;
  },
  async convertToYAML(content: string) {
    console.log("AI: Converting to YAML...");
    await new Promise(resolve => setTimeout(resolve, 1200));
    const yamlContent = `data:\n  title: "${content.substring(0, Math.min(content.length, 30))}"\n  body: "${content.replace(/\n/g, "\\n").substring(0, Math.min(content.length, 100))}"`;
    alert("AI converted content to YAML:\n" + yamlContent);
    return yamlContent;
  },
  async generateBlogPostIdeas(content: string) {
    console.log("AI: Generating blog post ideas...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const idea1 = `The Future of ${content.split(' ')[0]} in Finance`;
    const idea2 = `How AI Transforms ${content.split(' ')[1] || 'Content'} Creation`;
    alert(`AI suggested Blog Ideas:\n1. ${idea1}\n2. ${idea2}`);
    return [idea1, idea2];
  },
  async createShortSummaries(content: string) {
    console.log("AI: Creating short summaries...");
    await new Promise(resolve => setTimeout(resolve, 1300));
    const summary1 = content.substring(0, Math.min(content.length, 80)) + "...";
    const summary2 = content.substring(Math.min(content.length / 2, 100), Math.min(content.length / 2 + 80, content.length)) + "...";
    alert(`AI generated Short Summaries:\n1. ${summary1}\n2. ${summary2}`);
    return [summary1, summary2];
  },
  async improveWording(content: string) {
    console.log("AI: Improving wording and tone...");
    await new Promise(resolve => setTimeout(resolve, 1400));
    const improved = content.replace(/good/g, "excellent").replace(/fast/g, "rapid").replace(/problem/g, "challenge");
    alert("AI improved wording:\n" + improved.substring(0, Math.min(improved.length, 200)) + "...");
    return improved;
  }
};

// --- Core Component ---

export interface IntelligentContentActionHubProps {
  filename: string;
  initialContent: string; // Renamed from 'content' to 'initialContent'
  children: string; // Main button label
}

// Dummy components for illustration if they don't exist in common/ui-components
// In a real project, these would be robust, accessible UI elements from a design system.
const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block', verticalAlign: 'top', zIndex: 10 }}>
      {children}
    </div>
  );
};

const DropdownContent: React.FC<{ isOpen: boolean; children: React.ReactNode; toggleDropdown: () => void }> = ({ isOpen, children, toggleDropdown }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        toggleDropdown();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleDropdown]);

  return (
    <div
      ref={dropdownRef}
      style={{
        display: isOpen ? 'block' : 'none',
        position: 'absolute',
        backgroundColor: '#f9f9f9',
        minWidth: '280px', // Wider for more descriptive labels
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.25)',
        zIndex: 1,
        marginTop: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        overflow: 'hidden',
        maxHeight: '400px', // Limit height
        overflowY: 'auto' // Add scroll for many items
      }}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '10px 15px',
      width: '100%',
      textAlign: 'left',
      background: 'none',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: disabled ? '#f0f0f0' : '#f9f9f9',
      borderBottom: '1px solid #eee',
      whiteSpace: 'nowrap',
      fontSize: '0.95em',
      color: disabled ? '#aaa' : '#333'
    }}
    onMouseOver={(e) => !disabled && (e.currentTarget.style.backgroundColor = '#e0e0e0')}
    onMouseOut={(e) => !disabled && (e.currentTarget.style.backgroundColor = '#f9f9f9')}
  >
    {children}
  </button>
);


function IntelligentContentActionHub({
  filename,
  initialContent,
  children,
}: IntelligentContentActionHubProps) {
  const [loading, setLoading] = useState(false);
  const [geminiProcessedContent, setGeminiProcessedContent] = useState<string | null>(null);
  const [availableActions, setAvailableActions] = useState<{ label: string; action: string }[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // The content to be downloaded/acted upon, which can be original or AI-enhanced
  const contentForAction = geminiProcessedContent || initialContent;
  const objectUrl = useObjectUrl(contentForAction);
  const originalObjectUrl = useObjectUrl(initialContent);

  const processContentWithGemini = useCallback(async () => {
    setLoading(true);
    setDropdownOpen(false); // Close dropdown on processing
    try {
      const { enhancedContent, suggestedActions, insights: aiInsights } = await simulateGeminiContentIntelligence(initialContent);
      setGeminiProcessedContent(enhancedContent);
      setAvailableActions(suggestedActions);
      setInsights(aiInsights);
      // alert("Gemini AI has processed your content! Check the new options."); // Reduced alerts for smoother UX
    } catch (error) {
      console.error("Failed to process content with Gemini AI:", error);
      alert("Failed to process content with Gemini AI. Please try again.");
      setGeminiProcessedContent(null); // Reset if error
      setAvailableActions([]);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [initialContent]);

  // Proactive AI processing on mount or initialContent change
  useEffect(() => {
    if (initialContent) {
      // Only process if content is new or hasn't been processed yet
      // This ensures AI insights are immediately available, "epic worth millions" feature.
      if (!geminiProcessedContent && !loading) {
        processContentWithGemini();
      }
    }
  }, [initialContent, processContentWithGemini, geminiProcessedContent, loading]);


  const handleAction = async (actionType: string) => {
    setLoading(true);
    setDropdownOpen(false); // Close dropdown on action
    try {
      switch (actionType) {
        case "download_original":
          // Programmatically click the hidden download link for original content
          const originalDownloadLink = document.createElement('a');
          originalDownloadLink.href = originalObjectUrl;
          originalDownloadLink.download = `original_${filename}`;
          document.body.appendChild(originalDownloadLink);
          originalDownloadLink.click();
          document.body.removeChild(originalDownloadLink);
          // alert("Downloading original content securely..."); // Feedback is console.log and UI state
          break;
        case "download_enhanced":
          // Programmatically click the hidden download link for enhanced content
          const enhancedDownloadLink = document.createElement('a');
          enhancedDownloadLink.href = objectUrl;
          enhancedDownloadLink.download = `enhanced_${filename}`;
          document.body.appendChild(enhancedDownloadLink);
          enhancedDownloadLink.click();
          document.body.removeChild(enhancedDownloadLink);
          // alert("Downloading AI-enhanced content securely...");
          break;
        case "publish_citibank_portal":
          await externalAppServices.publishToCitibankInternalPortal(contentForAction, filename);
          break;
        case "push_salesforce_crm":
          await externalAppServices.pushToSalesforceCRM(contentForAction, filename);
          break;
        case "schedule_social_blast":
          await externalAppServices.scheduleSocialBlast(contentForAction, filename);
          break;
        case "send_collaboration_suite":
          await externalAppServices.sendToGlobalCollaborationSuite(contentForAction, filename);
          break;
        case "generate_executive_summary":
          const summary = await externalAppServices.generateExecutiveSummary(contentForAction);
          // Optionally update primary content with summary, or just alert
          setInsights(prev => [...prev, `Generated executive summary. Set as primary content for next actions.`]);
          setGeminiProcessedContent(summary);
          break;
        case "extract_metrics":
          await externalAppServices.extractKeyMetrics(contentForAction);
          break;
        case "prepare_investor_deck":
          await externalAppServices.prepareInvestorDeck(contentForAction);
          break;
        case "suggest_social_posts":
          await externalAppServices.suggestSocialMediaPosts(contentForAction);
          break;
        case "generate_email_drafts":
          await externalAppServices.generateEmailCampaignDrafts(contentForAction);
          break;
        case "validate_syntax":
          await externalAppServices.validateSyntax(contentForAction);
          break;
        case "convert_yaml":
          const yaml = await externalAppServices.convertToYAML(contentForAction);
          setGeminiProcessedContent(yaml);
          setInsights(prev => [...prev, "Content converted to YAML format."]);
          break;
        case "generate_blog_ideas":
          await externalAppServices.generateBlogPostIdeas(contentForAction);
          break;
        case "create_summaries":
          await externalAppServices.createShortSummaries(contentForAction);
          break;
        case "improve_wording":
          const improved = await externalAppServices.improveWording(contentForAction);
          setGeminiProcessedContent(improved);
          setInsights(prev => [...prev, "Content wording improved by AI."]);
          break;
        default:
          console.warn("Unknown action:", actionType);
          alert(`Action "${actionType}" is recognized but not fully implemented (simulated).`);
      }
    } catch (error) {
      console.error(`Error performing action "${actionType}":`, error);
      alert(`Failed to perform action "${actionType}". Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = useCallback(() => {
    if (!loading) { // Prevent toggling if an action is loading
      setDropdownOpen(prev => !prev);
    }
  }, [loading]);

  // Define static, always-available external app integrations
  const staticExternalAppIntegrations = [
    { label: "Publish to Citibank Internal Portal", action: "publish_citibank_portal" },
    { label: "Push to Salesforce CRM", action: "push_salesforce_crm" },
    { label: "Schedule Social Media Blast", action: "schedule_social_blast" },
    { label: "Send to Global Collaboration Suite", action: "send_collaboration_suite" },
  ];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'Arial, sans-serif' }}>
      <Button
        buttonType="primary"
        onClick={processContentWithGemini}
        disabled={loading}
        style={{ minWidth: '180px', height: '40px', fontSize: '1em' }}
      >
        {loading ? "AI Analyzing & Loading..." : (geminiProcessedContent ? "Re-Analyze with Gemini AI" : children)}
      </Button>

      {geminiProcessedContent && (
        <DropdownMenu>
          <Button
            buttonType="secondary"
            onClick={toggleDropdown}
            disabled={loading}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            style={{ minWidth: '220px', height: '40px', fontSize: '1em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>🚀 AI Actions & Integrations</span>
            <span>{dropdownOpen ? '▲' : '▼'}</span>
          </Button>
          <DropdownContent isOpen={dropdownOpen} toggleDropdown={toggleDropdown}>
            <div style={{ padding: '10px 15px', fontSize: '0.9em', color: '#555', borderBottom: '1px solid #ddd', fontWeight: 'bold', background: '#f0f0f0' }}>
              🎯 Gemini AI Insights:
            </div>
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={`insight-${index}`} style={{ padding: '6px 15px', fontSize: '0.85em', color: '#666' }}>
                  • {insight}
                </div>
              ))
            ) : (
              <div style={{ padding: '6px 15px', fontSize: '0.85em', color: '#666' }}>
                No specific insights yet, but content is processed.
              </div>
            )}
            <div style={{ padding: '10px 15px', fontSize: '0.9em', color: '#555', borderBottom: '1px solid #ddd', fontWeight: 'bold', background: '#f0f0f0', marginTop: '5px' }}>
              💡 Suggested AI Actions:
            </div>
            {availableActions.length > 0 ? (
              availableActions.map((actionItem) => (
                <DropdownMenuItem key={actionItem.action} onClick={() => handleAction(actionItem.action)} disabled={loading}>
                  {actionItem.label}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem onClick={() => { /* no action, just info */ }} disabled={true}>
                No specific AI actions suggested for this content.
              </DropdownMenuItem>
            )}

            <div style={{ padding: '10px 15px', fontSize: '0.9em', color: '#555', borderBottom: '1px solid #ddd', fontWeight: 'bold', background: '#f0f0f0', marginTop: '5px' }}>
              🔗 Enterprise App Integrations:
            </div>
            {staticExternalAppIntegrations.map((integration) => (
              <DropdownMenuItem key={integration.action} onClick={() => handleAction(integration.action)} disabled={loading}>
                {integration.label}
              </DropdownMenuItem>
            ))}
          </DropdownContent>
        </DropdownMenu>
      )}

      {/* Hidden download links for programmatic clicks */}
      <a href={objectUrl} download={`enhanced_${filename}`} style={{ display: 'none' }} aria-hidden="true" ref={null}></a>
      <a href={originalObjectUrl} download={`original_${filename}`} style={{ display: 'none' }} aria-hidden="true" ref={null}></a>
    </div>
  );
}

export default IntelligentContentActionHub;