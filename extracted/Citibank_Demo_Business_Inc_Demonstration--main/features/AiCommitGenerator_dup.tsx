// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { generateCommitMessageStream } from '../../services/index.ts';
import { GitBranchIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

// --- Aethelgard Global Context and Utilities (Simulated and Local) ---
// To simulate 'up to a million lines' and 'million external services' without altering imports,
// we will create a rich, self-contained ecosystem within this file.
// This includes defining all necessary data structures, helper functions, and
// 'mock' API interactions locally.

/**
 * @typedef {Object} CommitMessageOptions
 * @property {'concise' | 'detailed' | 'conventional'} format - The desired format for the commit message.
 * @property {'formal' | 'informal' | 'technical'} tone - The desired tone of the commit message.
 * @property {number} maxWords - Maximum number of words for the commit message. If 0, no limit.
 * @property {string[]} keywords - Keywords to emphasize in the message, influencing Lumina Core's semantic focus.
 * @property {boolean} includeEmojis - Whether to include Conventional Commit emojis (e.g., ✨ feat:).
 * @property {boolean} includeTicketRef - Whether to automatically detect and include ticket references (e.g., JIRA-123).
 * @property {Object} [sections] - Configuration for Conventional Commit message sections.
 * @property {boolean} [sections.type] - Whether to include the commit type (e.g., feat, fix).
 * @property {boolean} [sections.scope] - Whether to include the commit scope (e.g., (auth), (ui)).
 * @property {boolean} sections.description - Whether to include the short description (subject line).
 * @property {boolean} sections.body - Whether to include the longer commit body.
 * @property {boolean} [sections.footer] - Whether to include the footer (e.g., BREAKING CHANGE, Closes #123).
 */
export interface CommitMessageOptions {
  format: 'concise' | 'detailed' | 'conventional';
  tone: 'formal' | 'informal' | 'technical';
  maxWords: number;
  keywords: string[];
  includeEmojis: boolean;
  includeTicketRef: boolean;
  sections?: {
    type?: boolean;
    scope?: boolean;
    description: boolean;
    body: boolean;
    footer?: boolean;
  };
}

/**
 * @typedef {Object} DiffCategory
 * @property {'feature' | 'bugfix' | 'refactor' | 'chore' | 'docs' | 'style' | 'perf' | 'test' | 'ci' | 'build' | 'security' | 'deps' | 'unknown'} type - The type of change, aligning with Conventional Commit types.
 * @property {string} description - A brief, human-readable description of the category.
 * @property {number} confidence - Confidence score (0-1) from Lumina Core's probabilistic inference engines regarding the categorization.
 */
export interface DiffCategory {
  type: 'feature' | 'bugfix' | 'refactor' | 'chore' | 'docs' | 'style' | 'perf' | 'test' | 'ci' | 'build' | 'security' | 'deps' | 'unknown';
  description: string;
  confidence: number;
}

/**
 * @typedef {Object} DiffImpact
 * @property {'critical' | 'high' | 'medium' | 'low' | 'negligible'} level - The estimated impact level, as determined by Chronos Engine's causal chain mapping and predictive synthesis.
 * @property {string[]} areas - Specific functional or architectural areas impacted (e.g., 'User Authentication', 'Database Schema', 'Frontend Performance').
 * @property {string[]} potentialRisks - Identified potential risks (e.g., 'performance degradation', 'security vulnerability', 'breaking API changes').
 * @property {string[]} recommendedActions - Actions to mitigate risks or ensure quality, often linked to Aethelgard's Ethos Layer for compliance.
 */
export interface DiffImpact {
  level: 'critical' | 'high' | 'medium' | 'low' | 'negligible';
  areas: string[];
  potentialRisks: string[];
  recommendedActions: string[];
}

/**
 * @typedef {Object} CodeInsight
 * @property {'code_smell' | 'security_vulnerability' | 'performance_bottleneck' | 'architectural_drift' | 'best_practice_violation' | 'accessibility_issue' | 'maintainability_debt'} type - Type of insight derived from Agora Network's specialized oracles.
 * @property {string} message - Detailed message about the insight.
 * @property {string[]} relevantFiles - Files associated with the insight, enabling focused review.
 * @property {'critical' | 'high' | 'medium' | 'low'} severity - Severity of the insight, guiding prioritization.
 * @property {string} suggestion - A concrete, actionable suggestion for improvement, often informed by best practices from Lumina Core's knowledge graph.
 */
export interface CodeInsight {
  type: 'code_smell' | 'security_vulnerability' | 'performance_bottleneck' | 'architectural_drift' | 'best_practice_violation' | 'accessibility_issue' | 'maintainability_debt';
  message: string;
  relevantFiles: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestion: string;
}

/**
 * @typedef {Object} TicketReference
 * @property {string} id - The ticket ID (e.g., 'JIRA-123', 'GH-456').
 * @property {string} title - The title or summary of the linked ticket.
 * @property {string} url - URL to the ticket in an integrated project management system.
 * @property {string} status - Current status of the ticket (e.g., 'To Do', 'In Progress', 'Done', 'Closed').
 * @property {boolean} isDirectReference - True if directly found in diff, false if suggested by Aethelgard.
 */
export interface TicketReference {
  id: string;
  title: string;
  url: string;
  status: string;
  isDirectReference?: boolean;
}

/**
 * @typedef {Object} ProjectGoal
 * @property {string} id - Unique ID for the goal.
 * @property {string} name - Name of the goal (e.g., 'Improve System Performance', 'Achieve GDPR Compliance').
 * @property {string} description - Detailed description of the project goal.
 * @property {number} alignmentScore - How well the current change aligns (0-1), indicating contribution to the goal (Ethos Layer).
 * @property {string[]} tags - Associated tags or keywords for the goal.
 */
export interface ProjectGoal {
  id: string;
  name: string;
  description: string;
  alignmentScore: number;
  tags: string[];
}

/**
 * @typedef {Object} SemanticAnalysisResult
 * @property {DiffCategory[]} categories - Detected categories of changes by Lumina Core.
 * @property {DiffImpact} impact - Estimated impact of the changes via Chronos Engine.
 * @property {CodeInsight[]} insights - Identified code insights (smells, vulnerabilities, etc.) by Agora Network oracles.
 * @property {TicketReference[]} ticketRefs - Detected or suggested ticket references.
 * @property {ProjectGoal[]} goalAlignment - Analysis of how the diff aligns with broader project goals (Ethos Layer).
 * @property {string[]} suggestedReviewers - List of suggested reviewers based on file ownership/expertise (Agora Network, collaborative learning).
 * @property {string} summary - A general, high-level summary of the diff's content.
 * @property {number} estimatedReviewTimeMinutes - Predictive estimate for review duration.
 */
export interface SemanticAnalysisResult {
  categories: DiffCategory[];
  impact: DiffImpact;
  insights: CodeInsight[];
  ticketRefs: TicketReference[];
  goalAlignment: ProjectGoal[];
  suggestedReviewers: string[];
  summary: string;
  estimatedReviewTimeMinutes: number;
}

/**
 * Represents a historical commit, used in CommitHistoryExplorer.
 * @typedef {Object} HistoricalCommit
 * @property {string} hash - The commit hash.
 * @property {string} author - The author's name.
 * @property {string} date - The commit date (ISO string).
 * @property {string} message - The original commit message.
 * @property {string[]} changedFiles - Files changed in this commit.
 * @property {DiffCategory[]} categories - Categories determined by Aethelgard's Lumina Core.
 * @property {DiffImpact} impact - Impact assessed by Chronos Engine for this commit.
 * @property {CodeInsight[]} insights - Code insights flagged in this commit by Agora Network.
 */
export interface HistoricalCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  changedFiles: string[];
  categories: DiffCategory[];
  impact: DiffImpact;
  insights: CodeInsight[];
}

/**
 * Represents a segment of the codebase identified by Aethelgard's Lumina Core for analysis.
 * @typedef {Object} CodebaseSegment
 * @property {string} id - Unique identifier for the segment (e.g., module name, folder path).
 * @property {string} name - Display name of the segment.
 * @property {string} path - File path or logical path.
 * @property {number} complexityScore - Cyclomatic complexity or similar metric.
 * @property {number} churnRate - How frequently this segment changes (Chronos Engine).
 * @property {string[]} dependencies - Other segments it depends on (Lumina Core's relational graph).
 * @property {string[]} dependentSegments - Other segments that depend on it.
 * @property {CodeInsight[]} associatedInsights - Persistent code insights for this segment.
 */
export interface CodebaseSegment {
  id: string;
  name: string;
  path: string;
  complexityScore: number;
  churnRate: number;
  dependencies: string[];
  dependentSegments: string[];
  associatedInsights: CodeInsight[];
}

/**
 * The full codebase architecture and health report.
 * @typedef {Object} CodebaseAnalysisReport
 * @property {number} overallHealthScore - A aggregate score (0-100) reflecting code quality, maintainability, and architectural soundness.
 * @property {string} technicalDebtEstimate - An estimated effort (e.g., man-hours) to address identified tech debt.
 * @property {Object[]} topCodeSmells - List of most prevalent code smells.
 * @property {string} topCodeSmells.name - Name of the smell.
 * @property {number} topCodeSmells.count - Number of occurrences.
 * @property {'High' | 'Medium' | 'Low'} topCodeSmells.impact - Impact severity.
 * @property {Object} architecturalCompliance - Adherence to defined architectural principles.
 * @property {string} architecturalCompliance.microservicesAdherence - Score for microservices principles.
 * @property {string} architecturalCompliance.dependencyInversion - Score for SOLID D.
 * @property {string} architecturalCompliance.layeredArchitecture - Score for layered architecture.
 * @property {Object[]} hotspots - Areas in the codebase with high churn and/or complexity, often needing attention.
 * @property {string} hotspots.file - File path.
 * @property {string} hotspots.churn - 'High', 'Medium', 'Low'.
 * @property {string} hotspots.complexity - 'High', 'Medium', 'Low'.
 * @property {number} hotspots.recentBugs - Number of bugs recently associated.
 * @property {Object[]} crossDomainDependencies - Significant dependencies between logical domains.
 * @property {string} crossDomainDependencies.from - Originating domain/module.
 * @property {string} crossDomainDependencies.to - Dependent domain/module.
 * @property {string} crossDomainDependencies.type - Type of dependency (e.g., 'API Call', 'Shared Library').
 * @property {number} ethicalComplianceScore - Score (0-100) on adherence to ethical guidelines (Ethos Layer).
 * @property {string[]} privacyConcerns - Identified areas of potential privacy violation.
 * @property {string[]} securityVulnerabilitiesFound - List of identified system-wide security flaws.
 * @property {string[]} suggestions - High-level recommendations from Aethelgard.
 * @property {CodebaseSegment[]} codebaseGraphNodes - A simplified representation of the codebase's knowledge graph.
 */
export interface CodebaseAnalysisReport {
  overallHealthScore: number;
  technicalDebtEstimate: string;
  topCodeSmells: { name: string; count: number; impact: 'High' | 'Medium' | 'Low' }[];
  architecturalCompliance: {
    microservicesAdherence: string;
    dependencyInversion: string;
    layeredArchitecture: string;
  };
  hotspots: { file: string; churn: string; complexity: string; recentBugs: number }[];
  crossDomainDependencies: { from: string; to: string; type: string }[];
  ethicalComplianceScore: number;
  privacyConcerns: string[];
  securityVulnerabilitiesFound: string[];
  suggestions: string[];
  codebaseGraphNodes: CodebaseSegment[];
}

// --- Local Mock Aethelgard API Service (to simulate external services without new imports) ---
// This section simulates the 'million external services' by providing local functions
// that mimic API calls and generate rich data, leveraging the existing `generateCommitMessageStream`
// conceptually as a generalized entry point, or just providing detailed local mocks.

const mockAethelgardDataGenerator = {
  /**
   * Simulates generating advanced semantic analysis results from a diff.
   * This is a local stand-in for a complex 'Lumina Core' and 'Agora Network' interaction.
   * @param {string} diff - The git diff to analyze.
   * @param {AethelgardConfig} config - The global Aethelgard configuration for contextual analysis.
   * @returns {Promise<SemanticAnalysisResult>} A promise resolving to the analysis result.
   */
  async analyzeDiffSemantically(diff: string, config: AethelgardConfig): Promise<SemanticAnalysisResult> {
    // Simulate network delay and intensive computation
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

    // Basic heuristic-based analysis for demonstration
    const lowerDiff = diff.toLowerCase();
    const categories: DiffCategory[] = [];
    const insights: CodeInsight[] = [];
    const ticketRefs: TicketReference[] = [];
    let summary = 'General code changes detected by Lumina Core.';
    let estimatedReviewTimeMinutes = Math.floor(Math.random() * 30) + 10; // 10-40 min

    if (lowerDiff.includes('fix') || lowerDiff.includes('bug')) {
      categories.push({ type: 'bugfix', description: 'Addressing a reported issue.', confidence: 0.95 });
      summary = 'Bug fix and minor adjustments identified.';
      estimatedReviewTimeMinutes -= 5; // Simpler to review
    }
    if (lowerDiff.includes('feat') || lowerDiff.includes('add new feature')) {
      categories.push({ type: 'feature', description: 'Introducing new functionality.', confidence: 0.90 });
      summary = 'New feature implementation and related changes detected.';
      estimatedReviewTimeMinutes += 10; // More complex to review
    }
    if (lowerDiff.includes('refactor') || lowerDiff.includes('cleanup')) {
      categories.push({ type: 'refactor', description: 'Improving code structure without changing behavior.', confidence: 0.85 });
      summary = 'Code refactoring for better readability and maintainability.';
    }
    if (lowerDiff.includes('test') || lowerDiff.includes('spec')) {
      categories.push({ type: 'test', description: 'Adding or updating tests.', confidence: 0.80 });
      summary = 'Test suite enhancements.';
    }
    if (lowerDiff.includes('docs') || lowerDiff.includes('documentation')) {
      categories.push({ type: 'docs', description: 'Updating documentation.', confidence: 0.75 });
      summary = 'Documentation updates.';
    }
    if (lowerDiff.includes('chore') || lowerDiff.includes('build')) {
      categories.push({ type: 'chore', description: 'Routine maintenance or build process changes.', confidence: 0.70 });
      summary = 'Project maintenance and build configuration updates.';
    }
    if (lowerDiff.includes('security')) {
      categories.push({ type: 'security', description: 'Addressing security vulnerabilities.', confidence: 0.98 });
      insights.push({
        type: 'security_vulnerability',
        message: 'Potential security vulnerability related to input sanitization identified in `AuthService.ts`. Detected by Ethos Layer.',
        relevantFiles: ['src/services/AuthService.ts', 'src/utils/security.ts'],
        severity: 'critical',
        suggestion: 'Ensure all user inputs are properly sanitized and validated to prevent XSS/SQL injection attacks. Consult Aethelgard\'s security policy for guidelines.'
      });
      summary = 'Security enhancements and vulnerability patches identified by Agora Network\'s security oracle.';
      estimatedReviewTimeMinutes += 20; // Critical review
    }
    if (lowerDiff.includes('perf') || lowerDiff.includes('optimize')) {
      categories.push({ type: 'perf', description: 'Performance optimizations.', confidence: 0.92 });
      insights.push({
        type: 'performance_bottleneck',
        message: 'Potential for a new N+1 query in `ProductService.ts` due to new data fetching pattern. Detected by Chronos Engine\'s predictive model.',
        relevantFiles: ['src/services/ProductService.ts', 'src/api/products.ts'],
        severity: 'high',
        suggestion: 'Review data fetching strategy to avoid excessive database calls. Consider batching or pre-fetching.'
      });
      summary = 'Performance optimizations applied, with potential new bottlenecks flagged by Chronos Engine.';
      estimatedReviewTimeMinutes += 15;
    }

    const impactLevel = categories.some(c => c.type === 'security' || c.type === 'feature') ? 'high' :
                        categories.some(c => c.type === 'bugfix' || c.type === 'refactor') ? 'medium' : 'low';

    const impact: DiffImpact = {
      level: impactLevel,
      areas: ['Frontend UI', 'Core Logic'], // More sophisticated parsing would determine this from Lumina Core's context
      potentialRisks: impactLevel === 'high' ? ['Regression risk', 'Performance impact', 'Integration failure risk'] : [],
      recommendedActions: impactLevel === 'high' ? ['Thorough QA testing', 'Peer review by security expert', 'Automated integration tests'] : ['Standard review process', 'Unit test verification']
    };

    // Simulate ticket reference detection
    const ticketMatch = diff.match(/([A-Z]+-\d+)/g);
    if (ticketMatch) {
      ticketMatch.forEach(id => {
        if (!ticketRefs.some(ref => ref.id === id)) {
          ticketRefs.push({
            id: id,
            title: `Implement ${id} feature`, // Mock title - in real Aethelgard, this would query a PM system
            url: `https://jira.example.com/browse/${id}`,
            status: Math.random() > 0.5 ? 'In Progress' : 'Done',
            isDirectReference: true
          });
        }
      });
    }

    // Simulate project goals alignment (Ethos Layer)
    const mockGoals: ProjectGoal[] = [
      { id: 'perf-001', name: 'Improve System Performance', description: 'Reduce load times and improve responsiveness.', alignmentScore: Math.random() * 0.4 + (lowerDiff.includes('optimize') || lowerDiff.includes('perf') ? 0.5 : 0), tags: ['performance'] },
      { id: 'sec-002', name: 'Enhance Security Posture', description: 'Mitigate vulnerabilities and adhere to security standards.', alignmentScore: Math.random() * 0.4 + (lowerDiff.includes('security') ? 0.5 : 0), tags: ['security', 'compliance'] },
      { id: 'ux-003', name: 'Improve User Experience', description: 'Streamline workflows and enhance UI aesthetics.', alignmentScore: Math.random() * 0.4 + (lowerDiff.includes('ui') || lowerDiff.includes('ux') ? 0.5 : 0), tags: ['ui', 'ux'] },
      { id: 'doc-004', name: 'Comprehensive Documentation', description: 'Ensure all new features are well-documented for future maintenance.', alignmentScore: Math.random() * 0.4 + (lowerDiff.includes('docs') || lowerDiff.includes('documentation') ? 0.5 : 0), tags: ['documentation', 'maintainability'] },
    ];

    // Simulate reviewer suggestions from Agora Network's collaborative learning
    const suggestedReviewers = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve']
      .filter((_, idx) => (idx % 2 === 0 && lowerDiff.includes('ui')) || (idx % 2 === 1 && lowerDiff.includes('backend')))
      .sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
    if (suggestedReviewers.length === 0) suggestedReviewers.push('Global Reviewer'); // Always suggest at least one

    return {
      categories: categories.length > 0 ? categories : [{ type: 'unknown', description: 'General changes, no specific category identified.', confidence: 0.6 }],
      impact,
      insights,
      ticketRefs,
      goalAlignment: mockGoals,
      suggestedReviewers,
      summary,
      estimatedReviewTimeMinutes
    };
  },

  /**
   * Simulates retrieving historical commit data from a repository.
   * This is a local stand-in for 'Chronos Engine' functionality, providing temporal reasoning.
   * @param {string} repoId - Identifier for the repository.
   * @param {number} limit - Number of commits to retrieve.
   * @returns {Promise<HistoricalCommit[]>} A promise resolving to an array of historical commits.
   */
  async getHistoricalCommits(repoId: string, limit: number = 10): Promise<HistoricalCommit[]> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const mockCommits: HistoricalCommit[] = [];
    const authors = ['Alice (FE Lead)', 'Bob (BE Engineer)', 'Charlie (QA)', 'David (DevOps)', 'Eve (Architect)'];
    const messages = [
      'feat: Add user profile page with editable fields',
      'fix: Resolve critical bug in authentication flow',
      'refactor(navbar): Improve responsiveness and accessibility',
      'chore(deps): Update dependencies to latest versions',
      'docs: Add README for new data service',
      'perf: Optimize image loading on homepage',
      'test: Cover all edge cases for payment gateway integration',
      'feat(api): Implement new endpoint for product recommendations',
      'fix(styles): Adjust button padding on mobile devices',
      'ci: Configure automatic deployment for main branch',
      'feat: implement dark mode toggle',
      'fix: correct typo in error message',
      'refactor: extract user validation logic to a helper function',
      'security: Upgrade vulnerable crypto library version',
      'build: Update webpack configuration for faster builds',
      'deps: Remove unused library X',
    ];
    const files = [
      ['src/components/UserAvatar.tsx', 'src/pages/UserProfile.tsx'],
      ['src/services/AuthService.ts', 'src/api/auth.ts', 'src/utils/token.ts'],
      ['src/components/Navbar.tsx', 'src/styles/components/navbar.css', 'src/assets/logo.svg'],
      ['package.json', 'package-lock.json', '.github/workflows/ci.yml'],
      ['README.md', 'docs/data-service.md', 'docs/api-spec.md'],
      ['src/utils/imageOptimizer.ts', 'src/components/ImageGallery.tsx'],
      ['tests/payment.spec.ts', 'src/services/PaymentGateway.ts'],
    ];

    for (let i = 0; i < limit; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const message = messages[i % messages.length];
      const categoryType = message.split(':')[0].split('(')[0];
      const categories: DiffCategory[] = [];
      const insights: CodeInsight[] = [];
      let impact: DiffImpact = { level: 'low', areas: [], potentialRisks: [], recommendedActions: [] };

      switch (categoryType) {
        case 'feat':
          categories.push({ type: 'feature', description: 'New feature', confidence: 1 });
          impact.level = 'medium';
          impact.areas.push('New Functionality');
          break;
        case 'fix':
          categories.push({ type: 'bugfix', description: 'Bug fix', confidence: 1 });
          impact.level = 'medium';
          impact.potentialRisks.push('Regression');
          break;
        case 'refactor':
          categories.push({ type: 'refactor', description: 'Refactoring', confidence: 1 });
          insights.push({ type: 'code_smell', message: 'Improved readability.', relevantFiles: [], severity: 'low', suggestion: '' });
          break;
        case 'chore':
          categories.push({ type: 'chore', description: 'Maintenance', confidence: 1 });
          break;
        case 'docs':
          categories.push({ type: 'docs', description: 'Documentation', confidence: 1 });
          break;
        case 'perf':
          categories.push({ type: 'perf', description: 'Performance', confidence: 1 });
          insights.push({ type: 'performance_bottleneck', message: 'Optimized query.', relevantFiles: [], severity: 'low', suggestion: '' });
          break;
        case 'test':
          categories.push({ type: 'test', description: 'Tests', confidence: 1 });
          break;
        case 'security':
            categories.push({ type: 'security', description: 'Security Update', confidence: 1 });
            insights.push({ type: 'security_vulnerability', message: 'Patched XSS vulnerability.', relevantFiles: [], severity: 'high', suggestion: '' });
            impact.level = 'high';
            impact.areas.push('Security');
            impact.potentialRisks.push('New vulnerability introduction');
            break;
        case 'build':
            categories.push({ type: 'build', description: 'Build Process', confidence: 1 });
            break;
        case 'deps':
            categories.push({ type: 'deps', description: 'Dependencies', confidence: 1 });
            break;
        default:
          categories.push({ type: 'unknown', description: 'General', confidence: 1 });
          break;
      }

      mockCommits.push({
        hash: `abc123${i}def${Math.random().toString(36).substring(7)}`,
        author: authors[i % authors.length],
        date: date.toISOString().split('T')[0],
        message: message,
        changedFiles: files[i % files.length],
        categories: categories,
        impact: impact,
        insights: insights,
      });
    }
    return mockCommits;
  },

  /**
   * Simulates refining a commit message based on user feedback or additional options.
   * This would conceptually interact with Lumina Core's generative synthesis.
   * @param {string} originalMessage - The message to refine.
   * @param {string} diff - The original diff.
   * @param {string} refinementPrompt - User's instruction for refinement.
   * @returns {AsyncIterable<string>} A stream of refined message chunks.
   */
  async *refineCommitMessageStream(originalMessage: string, diff: string, refinementPrompt: string): AsyncIterable<string> {
    const refinedPrefix = `Aethelgard Refinement (${new Date().toLocaleTimeString()}): \n`;
    yield refinedPrefix;
    // Simulate more sophisticated refinement based on prompt, integrating Lumina Core's context and user intent.
    const baseMessage = originalMessage.length > 100 ? originalMessage.substring(0, 97) + '...' : originalMessage;
    const chunks = `Based on your directive "${refinementPrompt}", Aethelgard's Lumina Core has re-evaluated the semantic context of the diff. The original message "${baseMessage}" has been augmented to reflect new insights, prioritizing clarity and impact. This adaptive reasoning ensures the commit message is optimally aligned with collaborative understanding.`.split(' ');
    for (const chunk of chunks) {
      yield chunk + ' ';
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20)); // Simulate streaming
    }
    yield `\n\n[Refinement complete. Generated by Aethelgard's Meta-Cognitive Reflexivity. Confidence: ${Math.round(Math.random() * 100)}%]`;
  },

  /**
   * Simulates a deep, comprehensive codebase analysis report generation.
   * This is a major operation involving Lumina Core's data weaving, Agora Network's federated intelligence,
   * Chronos Engine's temporal reasoning, and the Ethos Layer's compliance checks.
   * @param {string} repoId - The identifier for the repository.
   * @returns {Promise<CodebaseAnalysisReport>} A promise resolving to the detailed analysis report.
   */
  async getCodebaseAnalysisReport(repoId: string): Promise<CodebaseAnalysisReport> {
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000)); // Simulate long running process

    const mockReport: CodebaseAnalysisReport = {
      overallHealthScore: (Math.random() * 20) + 75, // 75-95
      technicalDebtEstimate: `${Math.round(Math.random() * 700 + 200)} man-hours`,
      topCodeSmells: [
        { name: 'Long methods', count: Math.floor(Math.random() * 20) + 10, impact: 'High' },
        { name: 'Duplicate code blocks', count: Math.floor(Math.random() * 30) + 15, impact: 'Medium' },
        { name: 'Feature envy (cross-cutting concerns)', count: Math.floor(Math.random() * 10) + 5, impact: 'Medium' },
        { name: 'Unused imports/variables', count: Math.floor(Math.random() * 50) + 20, impact: 'Low' },
        { name: 'God object/class', count: Math.floor(Math.random() * 3), impact: 'High' },
      ],
      architecturalCompliance: {
        microservicesAdherence: Math.random() > 0.6 ? 'Good' : 'Needs Improvement',
        dependencyInversion: Math.random() > 0.7 ? 'Excellent' : 'Moderate',
        layeredArchitecture: Math.random() > 0.5 ? 'Fair' : 'Strong',
      },
      hotspots: [
        { file: 'src/services/UserService.ts', churn: 'High', complexity: 'High', recentBugs: Math.floor(Math.random() * 7) },
        { file: 'src/components/PaymentForm.tsx', churn: 'Medium', complexity: 'High', recentBugs: Math.floor(Math.random() * 4) },
        { file: 'src/data/schemas/ProductSchema.ts', churn: 'Low', complexity: 'Low', recentBugs: 0 },
        { file: 'src/utils/authHelpers.ts', churn: 'High', complexity: 'Medium', recentBugs: Math.floor(Math.random() * 5) },
      ],
      crossDomainDependencies: [
        { from: 'Frontend UI', to: 'Authentication Service', type: 'API Call' },
        { from: 'Backend Analytics', to: 'User Data Store', type: 'Direct Access (ORM)' },
        { from: 'Order Processing', to: 'Inventory Management', type: 'Message Queue' },
        { from: 'Recommendation Engine', to: 'Product Catalog', type: 'Data Stream' },
      ],
      ethicalComplianceScore: (Math.random() * 10) + 90, // 90-100 (Ethos Layer)
      privacyConcerns: Math.random() > 0.7 ? ['Direct PII logging in `AnalyticsService.ts` without anonymization.', 'Third-party cookie usage requires explicit consent banner update.'] : [],
      securityVulnerabilitiesFound: Math.random() > 0.8 ? ['Outdated JWT library identified.', 'Potential for SSRF in webhook handler.'] : [],
      suggestions: [
        'Consider breaking down monolith components into more granular microservices or bounded contexts.',
        'Implement stricter linting rules for method length and code duplication in CI.',
        'Conduct a comprehensive review of all direct database access layers for security and performance.',
        'Update privacy policy documentation and user consent flows in accordance with latest regulations, guided by Ethos Layer.',
        'Investigate and refactor high-churn, high-complexity hotspots for improved maintainability.',
      ],
      codebaseGraphNodes: [
        { id: 'auth-service', name: 'Authentication Service', path: 'src/services/auth', complexityScore: 75, churnRate: 0.8, dependencies: ['db-adapter'], dependentSegments: ['frontend-app', 'api-gateway'], associatedInsights: [] },
        { id: 'user-profile-ui', name: 'User Profile UI', path: 'src/components/user', complexityScore: 40, churnRate: 0.6, dependencies: ['auth-service', 'api-gateway'], dependentSegments: [], associatedInsights: [{ type: 'accessibility_issue', message: 'Missing ARIA labels on form inputs.', relevantFiles: [], severity: 'medium', suggestion: 'Add `aria-label` attributes to all interactive elements.' }] },
        { id: 'product-catalog-api', name: 'Product Catalog API', path: 'src/api/products', complexityScore: 60, churnRate: 0.7, dependencies: ['db-adapter'], dependentSegments: ['frontend-app', 'recommendation-engine'], associatedInsights: [] },
        { id: 'db-adapter', name: 'Database Adapter', path: 'src/data/db', complexityScore: 90, churnRate: 0.9, dependencies: [], dependentSegments: ['auth-service', 'product-catalog-api', 'backend-analytics'], associatedInsights: [{ type: 'architectural_drift', message: 'Direct SQL queries bypassing ORM detected.', relevantFiles: [], severity: 'high', suggestion: 'Refactor direct SQL queries to use the ORM or a dedicated data access layer.' }] },
      ]
    };
    return mockReport;
  },
};

// --- Custom Hooks for Aethelgard Feature Orchestration ---

/**
 * @typedef {Object} UseAethelgardApiResult
 * @property {boolean} isAnalyzing - Whether semantic analysis is in progress.
 * @property {SemanticAnalysisResult | null} analysisResult - The result of the semantic analysis.
 * @property {string | null} analysisError - Error message from semantic analysis.
 * @property {(diff: string, config: AethelgardConfig) => Promise<void>} triggerSemanticAnalysis - Function to start semantic analysis.
 * @property {boolean} isRefining - Whether message refinement is in progress.
 * @property {string} refinedMessage - The currently streamed refined message.
 * @property {string | null} refinementError - Error message from refinement.
 * @property {(originalMessage: string, diff: string, prompt: string) => Promise<void>} triggerRefinement - Function to start message refinement.
 * @property {boolean} isFetchingHistory - Whether commit history is being fetched.
 * @property {HistoricalCommit[]} historicalCommits - The fetched historical commits.
 * @property {string | null} historyError - Error message from history fetch.
 * @property {(repoId: string, limit?: number) => Promise<void>} fetchHistoricalCommits - Function to fetch commit history.
 * @property {boolean} isAnalyzingCodebase - Whether codebase analysis is in progress.
 * @property {CodebaseAnalysisReport | null} codebaseAnalysisReport - The codebase analysis report.
 * @property {string | null} codebaseAnalysisError - Error message from codebase analysis.
 * @property {(repoId: string) => Promise<void>} triggerCodebaseAnalysis - Function to trigger codebase analysis.
 */
export interface UseAethelgardApiResult {
  isAnalyzing: boolean;
  analysisResult: SemanticAnalysisResult | null;
  analysisError: string | null;
  triggerSemanticAnalysis: (diff: string, config: AethelgardConfig) => Promise<void>;

  isRefining: boolean;
  refinedMessage: string;
  refinementError: string | null;
  triggerRefinement: (originalMessage: string, diff: string, prompt: string) => Promise<void>;

  isFetchingHistory: boolean;
  historicalCommits: HistoricalCommit[];
  historyError: string | null;
  fetchHistoricalCommits: (repoId: string, limit?: number) => Promise<void>;

  isAnalyzingCodebase: boolean;
  codebaseAnalysisReport: CodebaseAnalysisReport | null;
  codebaseAnalysisError: string | null;
  triggerCodebaseAnalysis: (repoId: string) => Promise<void>;
}

/**
 * A custom hook to interact with the simulated Aethelgard API services.
 * This encapsulates complex logic for analysis, generation, and refinement,
 * embodying the Aethelgard Nexus and Lumina Core principles.
 * @returns {UseAethelgardApiResult} An object containing state and functions for Aethelgard API interactions.
 */
export const useAethelgardApi = (): UseAethelgardApiResult => {
  // Diff Semantic Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SemanticAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Message Refinement
  const [isRefining, setIsRefining] = useState(false);
  const [refinedMessage, setRefinedMessage] = useState('');
  const [refinementError, setRefinementError] = useState<string | null>(null);

  // Commit History
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [historicalCommits, setHistoricalCommits] = useState<HistoricalCommit[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Codebase Analysis
  const [isAnalyzingCodebase, setIsAnalyzingCodebase] = useState(false);
  const [codebaseAnalysisReport, setCodebaseAnalysisReport] = useState<CodebaseAnalysisReport | null>(null);
  const [codebaseAnalysisError, setCodebaseAnalysisError] = useState<string | null>(null);

  const triggerSemanticAnalysis = useCallback(async (diff: string, config: AethelgardConfig) => {
    if (!config.enabledFeatures.diffAnalysis) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null); // Clear previous results
    try {
      const result = await mockAethelgardDataGenerator.analyzeDiffSemantically(diff, config);
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to perform semantic analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const triggerRefinement = useCallback(async (originalMessage: string, diff: string, prompt: string) => {
    setIsRefining(true);
    setRefinementError(null);
    setRefinedMessage(''); // Clear previous refined message for new stream
    try {
      const stream = mockAethelgardDataGenerator.refineCommitMessageStream(originalMessage, diff, prompt);
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setRefinedMessage(fullResponse);
      }
    } catch (err) {
      setRefinementError(err instanceof Error ? err.message : 'Failed to refine commit message.');
    } finally {
      setIsRefining(false);
    }
  }, []);

  const fetchHistoricalCommits = useCallback(async (repoId: string, limit: number = 20) => {
    setIsFetchingHistory(true);
    setHistoryError(null);
    try {
      const commits = await mockAethelgardDataGenerator.getHistoricalCommits(repoId, limit);
      setHistoricalCommits(commits);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to fetch commit history.');
    } finally {
      setIsFetchingHistory(false);
    }
  }, []);

  const triggerCodebaseAnalysis = useCallback(async (repoId: string) => {
    setIsAnalyzingCodebase(true);
    setCodebaseAnalysisError(null);
    setCodebaseAnalysisReport(null);
    try {
      const report = await mockAethelgardDataGenerator.getCodebaseAnalysisReport(repoId);
      setCodebaseAnalysisReport(report);
    } catch (err) {
      setCodebaseAnalysisError(err instanceof Error ? err.message : 'Failed to perform codebase analysis.');
    } finally {
      setIsAnalyzingCodebase(false);
    }
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    analysisError,
    triggerSemanticAnalysis,
    isRefining,
    refinedMessage,
    refinementError,
    triggerRefinement,
    isFetchingHistory,
    historicalCommits,
    historyError,
    fetchHistoricalCommits,
    isAnalyzingCodebase,
    codebaseAnalysisReport,
    codebaseAnalysisError,
    triggerCodebaseAnalysis,
  };
};

/**
 * Custom hook to manage the state and logic for generating commit messages,
 * integrating with the base `generateCommitMessageStream` and advanced options.
 * This embodies Aethelgard's Generative Synthesis capabilities.
 * @param {string} initialDiff - The initial diff string.
 * @param {CommitMessageOptions} initialOptions - Initial generation options.
 * @returns {Object} State and handler functions for commit message generation.
 */
export const useCommitMessageGeneration = (
  initialDiff: string,
  initialOptions: CommitMessageOptions
) => {
  const [diff, setDiff] = useState<string>(initialDiff);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [options, setOptions] = useState<CommitMessageOptions>(initialOptions);

  const handleGenerate = useCallback(async (diffToAnalyze: string, currentOptions: CommitMessageOptions) => {
    if (!diffToAnalyze.trim()) {
      setError('Please paste a diff to generate a message.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      // Conceptually, `generateCommitMessageStream` is now much smarter and takes options.
      // In a real Aethelgard, this would be a sophisticated call to the Lumina Core's generative module.
      // The `generateCommitMessageStream` in '../../services/index.ts' would have been enhanced
      // to accept these options and route them to the appropriate Aethelgard backend service.
      const stream = generateCommitMessageStream(diffToAnalyze, currentOptions); // Extending existing service conceptually
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessage(fullResponse);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate message: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only auto-generate on initial load if initialDiff is provided and no message/error already exists
    if (initialDiff && !isLoading && !message && !error) {
      setDiff(initialDiff); // Ensure diff state is set
      handleGenerate(initialDiff, options);
    }
  }, [initialDiff, handleGenerate, options, isLoading, message, error]); // Add options to dependencies

  return {
    diff,
    setDiff,
    message,
    setMessage,
    isLoading,
    error,
    options,
    setOptions,
    handleGenerate,
  };
};

/**
 * Global Aethelgard context provider, simulating a persistent state
 * and configuration for the entire intelligent system.
 * This would represent the overarching Aethelgard framework.
 * @typedef {Object} AethelgardConfig
 * @property {string} repoId - The identifier of the current repository being worked on.
 * @property {string} [commitGuidelinesUrl] - URL to internal commit message guidelines.
 * @property {string} [securityPolicyUrl] - URL to the organization's security policy.
 * @property {Object} enabledFeatures - Flags to enable/disable Aethelgard features for the current context.
 * @property {boolean} enabledFeatures.diffAnalysis - Enable/disable detailed diff semantic analysis.
 * @property {boolean} enabledFeatures.commitRefinement - Enable/disable AI-guided commit message refinement.
 * @property {boolean} enabledFeatures.historyAnalysis - Enable/disable commit history exploration.
 * @property {boolean} enabledFeatures.goalAlignment - Enable/disable alignment checking with project goals.
 * @property {boolean} enabledFeatures.ethicalCompliance - Enable/disable ethical and privacy compliance checks.
 */
export interface AethelgardConfig {
  repoId: string;
  commitGuidelinesUrl?: string;
  securityPolicyUrl?: string;
  enabledFeatures: {
    diffAnalysis: boolean;
    commitRefinement: boolean;
    historyAnalysis: boolean;
    goalAlignment: boolean;
    ethicalCompliance: boolean;
  };
  // Many more configuration parameters for a full Aethelgard system...
}

export const AethelgardContext = createContext<AethelgardConfig | undefined>(undefined);

/**
 * Provides the Aethelgard configuration to all child components.
 * @param {React.PropsWithChildren<{ config: AethelgardConfig }>} props - Component props, including children and Aethelgard configuration.
 */
export const AethelgardProvider: React.FC<React.PropsWithChildren<{ config: AethelgardConfig }>> = ({ children, config }) => {
  return (
    <AethelgardContext.Provider value={config}>
      {children}
    </AethelgardContext.Provider>
  );
};

/**
 * A hook to access the current Aethelgard configuration from the context.
 * @returns {AethelgardConfig} The Aethelgard configuration.
 * @throws {Error} If used outside of an AethelgardProvider.
 */
export const useAethelgardConfig = (): AethelgardConfig => {
  const context = useContext(AethelgardContext);
  if (context === undefined) {
    throw new Error('useAethelgardConfig must be used within an AethelgardProvider');
  }
  return context;
};

// --- Helper Components for Styling (minimal, to avoid new imports) ---
const CustomScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: var(--bg-surface); /* Assuming CSS variables or context for themes */
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--color-primary-light); /* Or a specific gray */
    border-radius: 10px;
    border: 2px solid var(--bg-surface);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-primary);
  }
  .resize-vertical {
    resize: vertical;
  }
`;

/**
 * Inline style component for custom scrollbar, required due to import restrictions.
 */
const GlobalStyles: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: CustomScrollbarStyles }} />
);


// --- UI Components for Enhanced Features (within this file due to import constraint) ---

/**
 * Component for selecting commit message generation options (format, tone, etc.).
 * Embodies a user-centric interaction layer for Aethelgard's generative capabilities.
 * @param {Object} props
 * @param {CommitMessageOptions} props.options - Current options state.
 * @param {(options: CommitMessageOptions) => void} props.setOptions - Function to update options.
 */
export const CommitMessageOptionsPanel: React.FC<{
  options: CommitMessageOptions;
  setOptions: (options: CommitMessageOptions) => void;
}> = ({ options, setOptions }) => {
  const handleChange = (field: keyof CommitMessageOptions, value: any) => {
    setOptions({ ...options, [field]: value });
  };

  const handleSectionChange = (sectionField: keyof NonNullable<CommitMessageOptions['sections']>, checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      sections: {
        ...(prev.sections || { description: true, body: true }), // Default sections if not set
        [sectionField]: checked,
      },
    }));
  };

  return (
    <div className="bg-surface p-4 rounded-md shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-3 text-text-primary">Generation Options (Lumina Core Directives)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-text-secondary">Format</label>
          <select
            id="format"
            value={options.format}
            onChange={(e) => handleChange('format', e.target.value as CommitMessageOptions['format'])}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-background text-text-primary"
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
            <option value="conventional">Conventional Commits</option>
          </select>
        </div>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-text-secondary">Tone</label>
          <select
            id="tone"
            value={options.tone}
            onChange={(e) => handleChange('tone', e.target.value as CommitMessageOptions['tone'])}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-background text-text-primary"
          >
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
            <option value="technical">Technical</option>
          </select>
        </div>
        <div>
          <label htmlFor="maxWords" className="block text-sm font-medium text-text-secondary">Max Words (0 for unlimited)</label>
          <input
            type="number"
            id="maxWords"
            value={options.maxWords}
            onChange={(e) => handleChange('maxWords', parseInt(e.target.value) || 0)}
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-background text-text-primary"
            min="0"
          />
        </div>
        <div className="flex items-center">
          <input
            id="includeEmojis"
            type="checkbox"
            checked={options.includeEmojis}
            onChange={(e) => handleChange('includeEmojis', e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            disabled={options.format !== 'conventional'}
          />
          <label htmlFor="includeEmojis" className="ml-2 block text-sm text-text-secondary">Include Emojis (Conventional)</label>
        </div>
        <div className="flex items-center">
          <input
            id="includeTicketRef"
            type="checkbox"
            checked={options.includeTicketRef}
            onChange={(e) => handleChange('includeTicketRef', e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
          />
          <label htmlFor="includeTicketRef" className="ml-2 block text-sm text-text-secondary">Auto-include Ticket Refs</label>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border-light">
        <h4 className="text-md font-medium mb-2 text-text-primary">Conventional Commit Sections (Agora Network Consensus)</h4>
        <div className="grid grid-cols-2 gap-2">
          {options.format === 'conventional' && (
            <>
              <div className="flex items-center">
                <input id="section-type" type="checkbox" checked={options.sections?.type || false} onChange={(e) => handleSectionChange('type', e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
                <label htmlFor="section-type" className="ml-2 block text-sm text-text-secondary">Type (feat, fix, chore)</label>
              </div>
              <div className="flex items-center">
                <input id="section-scope" type="checkbox" checked={options.sections?.scope || false} onChange={(e) => handleSectionChange('scope', e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
                <label htmlFor="section-scope" className="ml-2 block text-sm text-text-secondary">Scope (optional)</label>
              </div>
            </>
          )}
          <div className="flex items-center">
            <input id="section-description" type="checkbox" checked={options.sections?.description || false} onChange={(e) => handleSectionChange('description', e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
            <label htmlFor="section-description" className="ml-2 block text-sm text-text-secondary">Description</label>
          </div>
          <div className="flex items-center">
            <input id="section-body" type="checkbox" checked={options.sections?.body || false} onChange={(e) => handleSectionChange('body', e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
            <label htmlFor="section-body" className="ml-2 block text-sm text-text-secondary">Body</label>
          </div>
          <div className="flex items-center">
            <input id="section-footer" type="checkbox" checked={options.sections?.footer || false} onChange={(e) => handleSectionChange('footer', e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
            <label htmlFor="section-footer" className="ml-2 block text-sm text-text-secondary">Footer (BREAKING CHANGE, Refs)</label>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border-light">
        <label htmlFor="keywords" className="block text-sm font-medium text-text-secondary">Keywords to Emphasize (comma-separated)</label>
        <input
          type="text"
          id="keywords"
          value={options.keywords.join(', ')}
          onChange={(e) => handleChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
          placeholder="e.g., performance, security, UX"
          className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-background text-text-primary"
        />
      </div>
    </div>
  );
};

/**
 * Component to display detailed semantic analysis of the diff.
 * This directly visualizes the output of the Lumina Core and Agora Network.
 * @param {Object} props
 * @param {SemanticAnalysisResult | null} props.analysisResult - The result object.
 * @param {boolean} props.isLoading - Whether analysis is in progress.
 * @param {string | null} props.error - Any error message.
 * @param {AethelgardConfig} props.config - Aethelgard configuration.
 */
export const DiffInsightsDisplay: React.FC<{
  analysisResult: SemanticAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  config: AethelgardConfig;
}> = ({ analysisResult, isLoading, error, config }) => {
  if (isLoading) {
    return (
      <div className="bg-background p-4 rounded-md shadow-sm h-full flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2 text-text-secondary">Analyzing diff semantically via Lumina Core...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background p-4 rounded-md shadow-sm h-full text-danger">
        Error: {error}
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="bg-background p-4 rounded-md shadow-sm h-full text-text-secondary flex items-center justify-center">
        Semantic analysis will appear here after generation.
      </div>
    );
  }

  const getSeverityClass = (severity: CodeInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'text-danger-dark bg-danger-light border border-danger';
      case 'high': return 'text-warning-dark bg-warning-light border border-warning';
      case 'medium': return 'text-info-dark bg-info-light border border-info';
      case 'low': return 'text-success-dark bg-success-light border border-success';
      default: return 'text-text-secondary bg-surface-hover border border-border';
    }
  };

  const getImpactLevelClass = (level: DiffImpact['level']) => {
    switch (level) {
      case 'critical': return 'text-danger font-bold';
      case 'high': return 'text-warning font-bold';
      case 'medium': return 'text-info';
      case 'low': return 'text-success';
      case 'negligible': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-background p-4 rounded-md shadow-sm h-full overflow-y-auto custom-scrollbar">
      <h3 className="text-xl font-semibold mb-3 text-text-primary">Diff Semantic Analysis (Aethelgard Lumina Core)</h3>

      <div className="mb-4 p-3 bg-surface rounded-md">
        <h4 className="font-medium text-text-secondary mb-1">Summary of Changes:</h4>
        <p className="text-text-primary">{analysisResult.summary}</p>
        <p className="text-xs text-text-tertiary mt-1">Estimated Review Time: {analysisResult.estimatedReviewTimeMinutes} minutes (Chronos Engine Prediction)</p>
      </div>

      <div className="mb-4 p-3 bg-surface rounded-md">
        <h4 className="font-medium text-text-secondary mb-1">Categories (Lumina Core):</h4>
        <div className="flex flex-wrap gap-2">
          {analysisResult.categories.map((cat, i) => (
            <span key={i} className="px-3 py-1 bg-primary-light text-primary-dark rounded-full text-xs font-medium">
              {cat.type} ({Math.round(cat.confidence * 100)}%)
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4 p-3 bg-surface rounded-md">
        <h4 className="font-medium text-text-secondary mb-1">Impact Assessment (Chronos Engine):</h4>
        <p className={`text-text-primary ${getImpactLevelClass(analysisResult.impact.level)}`}>Level: {analysisResult.impact.level}</p>
        {analysisResult.impact.areas.length > 0 && (
          <p className="text-sm text-text-secondary">Areas Impacted: {analysisResult.impact.areas.join(', ')}</p>
        )}
        {analysisResult.impact.potentialRisks.length > 0 && (
          <p className="text-sm text-warning-dark">Potential Risks: {analysisResult.impact.potentialRisks.join(', ')}</p>
        )}
        {analysisResult.impact.recommendedActions.length > 0 && (
          <p className="text-sm text-info-dark">Recommended Actions: {analysisResult.impact.recommendedActions.join(', ')}</p>
        )}
      </div>

      {analysisResult.insights.length > 0 && (
        <div className="mb-4 p-3 bg-surface rounded-md">
          <h4 className="font-medium text-text-secondary mb-1">Code Insights (Agora Network Oracles):</h4>
          {analysisResult.insights.map((insight, i) => (
            <div key={i} className={`p-3 rounded-md mb-2 ${getSeverityClass(insight.severity)}`}>
              <strong className="block text-sm">{insight.type.replace(/_/g, ' ').toUpperCase()} ({insight.severity})</strong>
              <p className="text-sm">{insight.message}</p>
              {insight.suggestion && <p className="text-xs italic mt-1">Suggestion: {insight.suggestion}</p>}
              {insight.relevantFiles.length > 0 && <p className="text-xs mt-1">Files: {insight.relevantFiles.join(', ')}</p>}
            </div>
          ))}
        </div>
      )}

      {analysisResult.ticketRefs.length > 0 && (
        <div className="mb-4 p-3 bg-surface rounded-md">
          <h4 className="font-medium text-text-secondary mb-1">Ticket References (Integrated PM Systems):</h4>
          <ul className="list-disc pl-5 text-text-primary text-sm">
            {analysisResult.ticketRefs.map((ticket, i) => (
              <li key={i}>
                <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {ticket.id}
                </a>: {ticket.title} ({ticket.status}) {ticket.isDirectReference ? '' : ' (Suggested by Aethelgard)'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {config.enabledFeatures.goalAlignment && analysisResult.goalAlignment.length > 0 && (
        <div className="mb-4 p-3 bg-surface rounded-md">
          <h4 className="font-medium text-text-secondary mb-1">Project Goal Alignment (Ethos Layer):</h4>
          {analysisResult.goalAlignment.map((goal, i) => (
            <div key={i} className="mb-2 p-2 bg-background rounded-md border border-border-light">
              <p className="text-text-primary font-medium">{goal.name}</p>
              <p className="text-sm text-text-secondary">Alignment: {Math.round(goal.alignmentScore * 100)}%</p>
              <p className="text-xs italic text-text-tertiary">{goal.description}</p>
            </div>
          ))}
        </div>
      )}

      {analysisResult.suggestedReviewers.length > 0 && (
        <div className="mb-4 p-3 bg-surface rounded-md">
          <h4 className="font-medium text-text-secondary mb-1">Suggested Reviewers (Agora Network Intelligence):</h4>
          <p className="text-text-primary">{analysisResult.suggestedReviewers.join(', ')}</p>
        </div>
      )}

      {config.enabledFeatures.ethicalCompliance && (
        <div className="mt-4 pt-4 border-t border-border-light text-xs text-text-tertiary italic">
            Aethelgard's Ethos Layer continuously monitors for ethical and compliance considerations.
            Consult your organization's <a href={config.securityPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">security policy</a> for full details.
        </div>
      )}
    </div>
  );
};


/**
 * Component allowing users to provide feedback or refinement prompts for the generated message.
 * Directly integrates with Aethelgard's Human-Centric Feedback Loops for adaptive learning.
 * @param {Object} props
 * @param {string} props.generatedMessage - The AI-generated message to refine.
 * @param {string} props.currentDiff - The diff used for generation.
 * @param {(original: string, diff: string, prompt: string) => Promise<void>} props.onRefine - Callback to trigger refinement.
 * @param {boolean} props.isRefining - Whether a refinement operation is in progress.
 * @param {string} props.refinedMessage - The streaming refined message.
 */
export const CommitMessageRefinement: React.FC<{
  generatedMessage: string;
  currentDiff: string;
  onRefine: (original: string, diff: string, prompt: string) => Promise<void>;
  isRefining: boolean;
  refinedMessage: string;
}> = ({ generatedMessage, currentDiff, onRefine, isRefining, refinedMessage }) => {
  const [refinementInput, setRefinementInput] = useState('');
  const [showRefinementHistory, setShowRefinementHistory] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState<string[]>([]);

  const handleRefineClick = () => {
    if (refinementInput.trim() && generatedMessage) {
      onRefine(generatedMessage, currentDiff, refinementInput);
      setRefinementHistory(prev => [...prev, refinementInput]);
      setRefinementInput('');
    }
  };

  const quickRefinementPrompts = [
    'Make it shorter',
    'Add more technical details',
    'Focus on the user benefit',
    'Highlight potential breaking changes',
    'Suggest alternative wording',
    'Emphasize the security fix aspect',
    'Rephrase for a less formal tone',
    'Include a call to action for reviewers',
  ];

  return (
    <div className="bg-surface p-4 rounded-md shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-3 text-text-primary">Refine & Feedback (Human-AI Symbiosis)</h3>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {quickRefinementPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setRefinementInput(prompt)}
            className="px-3 py-1 bg-background border border-border rounded-md text-xs text-text-secondary hover:bg-surface-hover transition-colors"
            disabled={isRefining}
          >
            {prompt}
          </button>
        ))}
      </div>

      <textarea
        value={refinementInput}
        onChange={(e) => setRefinementInput(e.target.value)}
        placeholder="e.g., 'Make it more concise' or 'Add a reference to issue #123' (Lumina Core will adapt)"
        className="w-full p-3 bg-background border border-border rounded-md resize-vertical font-sans text-sm text-text-secondary focus:ring-2 focus:ring-primary focus:outline-none custom-scrollbar"
        rows={2}
        disabled={isRefining}
      />
      <button
        onClick={handleRefineClick}
        disabled={isRefining || !generatedMessage || !refinementInput.trim()}
        className="btn-secondary mt-3 w-full flex items-center justify-center px-6 py-3"
      >
        {isRefining ? <LoadingSpinner /> : 'Refine Message with Aethelgard'}
      </button>

      {refinementHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <button onClick={() => setShowRefinementHistory(!showRefinementHistory)} className="text-sm text-primary hover:underline">
            {showRefinementHistory ? 'Hide' : 'Show'} Refinement History ({refinementHistory.length})
          </button>
          {showRefinementHistory && (
            <ul className="list-disc pl-5 mt-2 text-text-secondary text-sm">
              {refinementHistory.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )}
        </div>
      )}

      {isRefining && refinedMessage && (
        <div className="mt-4 p-3 bg-background border border-border-dashed rounded-md text-text-primary">
          <h4 className="font-medium mb-1 text-primary-dark">Live Refinement Stream:</h4>
          <pre className="whitespace-pre-wrap font-sans text-sm">{refinedMessage}</pre>
        </div>
      )}
    </div>
  );
};


/**
 * A feature component for exploring historical commits and their Aethelgard-generated insights.
 * This directly implements aspects of the Chronos Engine and Lumina Core's understanding.
 * This would be a sibling component within the Aethelgard ecosystem.
 * @param {Object} props
 * @param {string} props.repoId - The ID of the repository to analyze.
 * @param {(repoId: string, limit?: number) => Promise<void>} props.fetchHistory - Function to fetch commit history.
 * @param {boolean} props.isLoading - Whether history is being loaded.
 * @param {HistoricalCommit[]} props.commits - Array of historical commits.
 * @param {string | null} props.error - Error message if history fetch fails.
 */
export const CommitHistoryExplorer: React.FC<{
  repoId: string;
  fetchHistory: (repoId: string, limit?: number) => Promise<void>;
  isLoading: boolean;
  commits: HistoricalCommit[];
  error: string | null;
}> = ({ repoId, fetchHistory, isLoading, commits, error }) => {
  const [selectedCommit, setSelectedCommit] = useState<HistoricalCommit | null>(null);

  useEffect(() => {
    // Re-fetch if repoId changes
    fetchHistory(repoId);
  }, [repoId, fetchHistory]);

  if (isLoading) {
    return (
      <div className="bg-surface p-6 rounded-md shadow-lg flex items-center justify-center h-full">
        <LoadingSpinner />
        <span className="ml-3 text-text-secondary text-lg">Loading commit history via Chronos Engine...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface p-6 rounded-md shadow-lg h-full text-danger text-lg">
        Error loading history: {error}
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-md shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">
        <GitBranchIcon className="inline-block mr-2" />
        Commit History Explorer ({repoId})
      </h2>
      <p className="text-text-secondary mb-4">
        Visualize project evolution and insights powered by Aethelgard's Chronos Engine.
        This feature provides a multi-scale temporal analysis of your repository's development,
        identifying trends and historical context.
      </p>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="col-span-1 flex flex-col border-r border-border-light pr-4 h-full">
          <h3 className="text-lg font-semibold mb-3 text-text-primary">Recent Commits (Lumina Chronos Snapshot)</h3>
          <ul className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {commits.length === 0 ? (
                <li className="text-text-secondary text-center py-4">No commits found for this repository.</li>
            ) : (
                commits.map((commit) => (
                <li
                    key={commit.hash}
                    className={`p-3 mb-2 rounded-md border border-border cursor-pointer hover:bg-surface-hover transition-colors ${selectedCommit?.hash === commit.hash ? 'bg-primary-light border-primary' : 'bg-background'}`}
                    onClick={() => setSelectedCommit(commit)}
                >
                    <p className="text-sm font-medium text-text-primary truncate">{commit.message.split('\n')[0]}</p>
                    <p className="text-xs text-text-secondary">{commit.author} on {commit.date}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                    {commit.categories.map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary-light text-primary-dark rounded-full text-xs font-medium">
                        {cat.type}
                        </span>
                    ))}
                    </div>
                </li>
                ))
            )}
          </ul>
        </div>

        <div className="col-span-2 flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-semibold mb-3 text-text-primary">Commit Details & Temporal Impact</h3>
          {selectedCommit ? (
            <div className="bg-background p-4 rounded-md border border-border h-full overflow-y-auto custom-scrollbar">
              <h4 className="text-xl font-bold mb-2 text-text-primary">{selectedCommit.message.split('\n')[0]}</h4>
              <p className="text-sm text-text-secondary mb-2">
                <span className="font-medium">Hash:</span> {selectedCommit.hash.substring(0, 7)}... |
                <span className="font-medium ml-2">Author:</span> {selectedCommit.author} |
                <span className="font-medium ml-2">Date:</span> {selectedCommit.date}
              </p>
              <pre className="whitespace-pre-wrap text-text-primary text-sm mb-4">{selectedCommit.message}</pre>

              <div className="mt-4 pt-4 border-t border-border-light">
                <h5 className="font-medium text-text-secondary mb-2">Aethelgard Deep Insights (Lumina Core & Chronos Engine):</h5>
                <div className="mb-3">
                  <h6 className="text-sm font-medium text-text-primary">Detected Categories:</h6>
                  <div className="flex flex-wrap gap-1">
                    {selectedCommit.categories.map((cat, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary-light text-primary-dark rounded-full text-xs font-medium">
                        {cat.type} ({Math.round(cat.confidence * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-sm font-medium text-text-primary">Changed Files:</h6>
                  <ul className="list-disc list-inside text-text-secondary text-xs">
                    {selectedCommit.changedFiles.map((file, i) => <li key={i}>{file}</li>)}
                  </ul>
                </div>

                <div className="mt-3 mb-3 p-3 bg-surface rounded-md border border-border-light">
                  <h6 className="text-sm font-medium text-text-primary">Temporal Impact Summary (Chronos Engine):</h6>
                  <p className="text-xs text-text-secondary italic">
                    This commit introduced changes to {selectedCommit.changedFiles.length} files.
                    The Lumina Core's analysis indicates these files have had an average churn rate of {'~' + (Math.random() * 5 + 1).toFixed(1)} commits/month.
                    Chronos Engine predicts a {selectedCommit.impact.level} probability of regression
                    if subsequent changes are not carefully reviewed, especially in `{selectedCommit.changedFiles[0] || 'core logic'}`.
                    Historical context suggests {selectedCommit.author} is a key contributor to this module.
                  </p>
                </div>
                {selectedCommit.insights.length > 0 && (
                  <div className="mt-3 mb-3 p-3 bg-surface rounded-md border border-border-light">
                    <h6 className="text-sm font-medium text-text-primary">Historical Code Insights:</h6>
                    {selectedCommit.insights.map((insight, i) => (
                        <div key={i} className={`p-2 rounded-md mb-1 ${
                            insight.severity === 'high' ? 'bg-warning-light text-warning-dark' :
                            insight.severity === 'critical' ? 'bg-danger-light text-danger-dark' :
                            'bg-info-light text-info-dark'
                        }`}>
                            <strong className="block text-xs">{insight.type.replace(/_/g, ' ').toUpperCase()} ({insight.severity})</strong>
                            <p className="text-xs">{insight.message}</p>
                        </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 mb-3 p-3 bg-surface rounded-md border border-border-light">
                  <h6 className="text-sm font-medium text-text-primary">Codebase Evolution Trace (Agora Network Synthesis):</h6>
                  <p className="text-xs text-text-secondary italic">
                    The introduction of this {selectedCommit.categories[0]?.type || 'change'} aligns with the project's Q3 "Scalability Initiative".
                    Aethelgard's relational graphing shows this commit modified the '{selectedCommit.changedFiles[0]?.split('/')[1] || 'undefined'}' module,
                    which has been a focus area for 'performance optimization' over the last 6 months.
                    The Agora Network's distributed intelligence has cross-referenced this with known architectural patterns,
                    noting adherence to the 'Hexagonal Architecture' for this component.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-background p-4 rounded-md border border-border h-full flex items-center justify-center text-text-secondary">
              Select a commit from the left to see detailed Aethelgard analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/**
 * A comprehensive feature component that allows for high-level codebase semantic analysis
 * and architecture exploration, embodying Aethelgard's Lumina Core and Agora Network.
 * This would offer insights beyond single diffs, into the entire project's structure and health.
 * @param {Object} props
 * @param {string} props.repoId - The ID of the repository to analyze.
 * @param {(repoId: string) => Promise<void>} props.triggerAnalysis - Function to trigger codebase analysis.
 * @param {boolean} props.isLoading - Whether codebase analysis is in progress.
 * @param {CodebaseAnalysisReport | null} props.report - The codebase analysis report.
 * @param {string | null} props.error - Error message if analysis fails.
 * @param {AethelgardConfig} props.config - Aethelgard global configuration.
 */
export const CodebaseSemanticAnalyzer: React.FC<{
  repoId: string;
  triggerAnalysis: (repoId: string) => Promise<void>;
  isLoading: boolean;
  report: CodebaseAnalysisReport | null;
  error: string | null;
  config: AethelgardConfig;
}> = ({ repoId, triggerAnalysis, isLoading, report, error, config }) => {

  if (isLoading) {
    return (
      <div className="bg-surface p-6 rounded-md shadow-lg flex items-center justify-center h-full">
        <LoadingSpinner />
        <span className="ml-3 text-text-secondary text-lg">Performing deep codebase semantic analysis via Lumina Core...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface p-6 rounded-md shadow-lg h-full text-danger text-lg">
        Error in Codebase Analysis: {error}
      </div>
    );
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-dark';
    if (score >= 70) return 'text-info-dark';
    if (score >= 50) return 'text-warning-dark';
    return 'text-danger-dark';
  };

  return (
    <div className="bg-surface p-6 rounded-md shadow-lg h-full flex flex-col overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">
        <span className="ml-3">Codebase Architecting Assistant ({repoId})</span>
      </h2>
      <p className="text-text-secondary mb-4">
        Aethelgard's Lumina Core and Agora Network provide a comprehensive, contextual understanding of your codebase,
        identifying architectural patterns, potential issues, and alignment with project goals.
        Chronos Engine predicts evolution, while Ethos Layer ensures ethical alignment.
      </p>

      {!report ? (
        <div className="flex-grow flex items-center justify-center">
          <button onClick={() => triggerAnalysis(repoId)} className="btn-primary px-8 py-4 text-lg">
            Start Aethelgard Codebase Analysis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-text-primary">
          <div className="bg-background p-4 rounded-md border border-border">
            <h3 className="font-semibold text-xl mb-3">Overall Health & Debt (Lumina Core Metrics)</h3>
            <p className="mb-2"><strong>Health Score:</strong> <span className={getHealthScoreColor(report.overallHealthScore)}>{report.overallHealthScore.toFixed(1)}/100</span></p>
            <p className="mb-2"><strong>Estimated Technical Debt:</strong> {report.technicalDebtEstimate}</p>
            {config.enabledFeatures.ethicalCompliance && report.ethicalComplianceScore && (
                <p className="mb-2"><strong>Ethical Compliance Score (Ethos Layer):</strong> <span className={getHealthScoreColor(report.ethicalComplianceScore)}>{report.ethicalComplianceScore.toFixed(1)}/100</span></p>
            )}
             {report.privacyConcerns && report.privacyConcerns.length > 0 && (
                <div className="mt-3 p-2 bg-danger-light border border-danger rounded text-danger-dark text-sm">
                    <strong>Privacy Concerns Detected:</strong>
                    <ul className="list-disc pl-5 mt-1">
                        {report.privacyConcerns.map((concern: string, i: number) => <li key={i}>{concern}</li>)}
                    </ul>
                </div>
            )}
            {report.securityVulnerabilitiesFound && report.securityVulnerabilitiesFound.length > 0 && (
                <div className="mt-3 p-2 bg-danger-light border border-danger rounded text-danger-dark text-sm">
                    <strong>Security Vulnerabilities:</strong>
                    <ul className="list-disc pl-5 mt-1">
                        {report.securityVulnerabilitiesFound.map((vuln: string, i: number) => <li key={i}>{vuln}</li>)}
                    </ul>
                </div>
            )}
          </div>

          <div className="bg-background p-4 rounded-md border border-border">
            <h3 className="font-semibold text-xl mb-3">Top Code Smells (Agora Network Detection)</h3>
            <ul className="list-disc pl-5">
              {report.topCodeSmells.map((smell: any, i: number) => (
                <li key={i} className="mb-1">
                  {smell.name} (<span className="font-medium">{smell.count}</span> occurrences) - Impact: <span className={smell.impact === 'High' ? 'text-warning-dark' : ''}>{smell.impact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background p-4 rounded-md border border-border">
            <h3 className="font-semibold text-xl mb-3">Architectural Compliance (Lumina Core Mapping)</h3>
            <p className="mb-2"><strong>Microservices Adherence:</strong> {report.architecturalCompliance.microservicesAdherence}</p>
            <p className="mb-2"><strong>Dependency Inversion:</strong> {report.architecturalCompliance.dependencyInversion}</p>
            <p className="mb-2"><strong>Layered Architecture:</strong> {report.architecturalCompliance.layeredArchitecture}</p>
          </div>

          <div className="bg-background p-4 rounded-md border border-border">
            <h3 className="font-semibold text-xl mb-3">Code Hotspots (Chronos Engine Prediction)</h3>
            <ul className="list-disc pl-5">
              {report.hotspots.map((hotspot: any, i: number) => (
                <li key={i} className="mb-1">
                  <span className="font-medium">{hotspot.file}</span> - Churn: {hotspot.churn}, Complexity: {hotspot.complexity}, Recent Bugs: {hotspot.recentBugs}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background p-4 rounded-md col-span-full border border-border">
            <h3 className="font-semibold text-xl mb-3">Cross-Domain Dependencies (Aethelgard Nexus Graph)</h3>
            <ul className="list-disc pl-5">
              {report.crossDomainDependencies.map((dep: any, i: number) => (
                <li key={i} className="mb-1">
                  <span className="font-medium">{dep.from}</span> &rarr; <span className="font-medium">{dep.to}</span> (Type: {dep.type})
                </li>
              ))}
            </ul>
          </div>

          {report.suggestions && report.suggestions.length > 0 && (
            <div className="bg-background p-4 rounded-md col-span-full border border-border">
              <h3 className="font-semibold text-xl mb-3 text-info-dark">Aethelgard Recommendations (Adaptive Reasoning)</h3>
              <ul className="list-disc pl-5 text-text-primary">
                {report.suggestions.map((sug: string, i: number) => <li key={i}>{sug}</li>)}
              </ul>
            </div>
          )}

          {report.codebaseGraphNodes && report.codebaseGraphNodes.length > 0 && (
            <div className="bg-background p-4 rounded-md col-span-full border border-border">
                <h3 className="font-semibold text-xl mb-3">Codebase Semantic Graph Nodes (Lumina Core)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.codebaseGraphNodes.map((node, i) => (
                        <div key={i} className="p-3 bg-surface rounded-md border border-border-light">
                            <h4 className="font-medium text-text-primary">{node.name}</h4>
                            <p className="text-xs text-text-secondary">Path: {node.path}</p>
                            <p className="text-xs text-text-tertiary">Complexity: {node.complexityScore}, Churn: {node.churnRate.toFixed(2)}</p>
                            {node.dependencies.length > 0 && <p className="text-xs text-text-tertiary">Depends on: {node.dependencies.join(', ')}</p>}
                            {node.dependentSegments.length > 0 && <p className="text-xs text-text-tertiary">Dependents: {node.dependentSegments.join(', ')}</p>}
                            {node.associatedInsights.length > 0 && (
                                <div className="mt-2 text-xs">
                                    <strong className="text-warning-dark">Insights:</strong>
                                    <ul className="list-disc pl-3">
                                        {node.associatedInsights.map((insight, idx) => <li key={idx}>{insight.type}: {insight.message}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-text-tertiary italic mt-4">
                    This graph represents a living repository of understanding, constantly refining its internal models of the world.
                    Nodes are individual codebase segments, and edges (dependencies/dependents) represent connections in the semantic fabric.
                </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// --- Main AiCommitGenerator Component (Expanded) ---

const exampleDiff = `diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1b2c3d4..5e6f7g8 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,7 +1,7 @@
 import React from 'react';
 
 interface ButtonProps {
-  text: string;
+  label: string; // Refactored 'text' prop to 'label' for better semantic clarity and consistency with design system tokens.
   onClick: () => void;
 }
 
 const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
   return (
-    <button onClick={onClick}>{text}</button>
+    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={onClick}>{label}</button>
   );
 };
 
 export default Button;

diff --git a/src/pages/HomePage.tsx b/src/pages/HomePage.tsx
index 9a8b7c6..8d7e6f5 100644
--- a/src/pages/HomePage.tsx
+++ b/src/pages/HomePage.tsx
@@ -1,5 +1,5 @@
 import React from 'react';
-import Button from '../components/Button';
+import Button from '../components/Button'; // Importing the refactored Button component

 const HomePage: React.FC = () => {
   return (
-    <div>
-      <h1>Welcome</h1>
-      <Button text="Click Me" onClick={() => alert('Hello!')} />
+    <div className="container mx-auto p-4">
+      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Aethelgard Demo</h1>
+      <p className="text-gray-600 mb-6">Explore the capabilities of collaborative intelligence.</p>
+      <Button label="Discover Features" onClick={() => console.log('Features discovered!')} />
     </div>
   );
 };
 
 export default HomePage;
`;

/**
 * The main AI Commit Generator component, now serving as a hub for multiple Aethelgard features.
 * It integrates sophisticated diff analysis, customizable message generation, user refinement,
 * and contextual codebase insights, all aligned with the Aethelgard vision.
 * @param {Object} props
 * @param {string} [props.diff] - Initial git diff string.
 */
export const AiCommitGenerator: React.FC<{ diff?: string }> = ({ diff: initialDiff }) => {
  const aethelgardConfig = useAethelgardConfig(); // Access global Aethelgard configuration

  const defaultCommitOptions: CommitMessageOptions = {
    format: 'conventional',
    tone: 'technical',
    maxWords: 0,
    keywords: [],
    includeEmojis: true,
    includeTicketRef: true,
    sections: { type: true, scope: true, description: true, body: true, footer: true }
  };

  const {
    diff,
    setDiff,
    message,
    setMessage,
    isLoading,
    error,
    options,
    setOptions,
    handleGenerate,
  } = useCommitMessageGeneration(initialDiff || exampleDiff, defaultCommitOptions);

  const {
    isAnalyzing,
    analysisResult,
    analysisError,
    triggerSemanticAnalysis,
    isRefining,
    refinedMessage,
    refinementError,
    triggerRefinement,
    isFetchingHistory,
    historicalCommits,
    historyError,
    fetchHistoricalCommits,
    isAnalyzingCodebase,
    codebaseAnalysisReport,
    codebaseAnalysisError,
    triggerCodebaseAnalysis,
  } = useAethelgardApi();

  const [activeTab, setActiveTab] = useState<'generator' | 'insights' | 'history' | 'codebase'>('generator');

  // Effect to trigger semantic analysis when diff changes
  useEffect(() => {
    if (diff.trim() && aethelgardConfig.enabledFeatures.diffAnalysis) {
      triggerSemanticAnalysis(diff, aethelgardConfig);
    } else if (!diff.trim()) {
        // Optionally clear analysis results if diff becomes empty
        // This functionality needs to be added to useAethelgardApi if desired:
        // setAnalysisResult(null); setAnalysisError(null);
    }
  }, [diff, triggerSemanticAnalysis, aethelgardConfig]);


  const handleCopy = useCallback(() => {
    // Prioritize refined message if available and active
    const textToCopy = refinedMessage || message;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
    }
  }, [message, refinedMessage]);

  const handleDiffChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDiff(e.target.value);
    setMessage(''); // Clear generated message on diff change
    // Also clear refinement related states conceptually (true clearing would be in useAethelgardApi)
    // setRefinedMessage(''); // This would be part of a proper reset in useAethelgardApi
  }, [setDiff, setMessage]);

  const displayedMessage = refinedMessage || message;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background-light">
      <GlobalStyles /> {/* Inject custom scrollbar styles */}
      <header className="mb-6 pb-4 border-b border-border">
        <h1 className="text-4xl font-extrabold flex items-center text-primary-dark">
          <GitBranchIcon className="w-10 h-10" />
          <span className="ml-4">Aethelgard: Collaborative Commit Intelligence</span>
        </h1>
        <p className="text-text-secondary mt-2 text-lg">
          Unlocking Tomorrow's Horizon: Leverage Aethelgard's Lumina Core for intelligent commit generation,
          deep diff insights, and holistic codebase understanding.
        </p>
      </header>

      {/* Feature Navigation Tabs */}
      <nav className="mb-6 border-b border-border-light">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'generator' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-hover'}`}
              onClick={() => setActiveTab('generator')}
              role="tab"
              aria-controls="generator-panel"
              aria-selected={activeTab === 'generator'}
            >
              Commit Generator
            </button>
          </li>
          {aethelgardConfig.enabledFeatures.diffAnalysis && (
            <li className="mr-2" role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'insights' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-hover'}`}
                onClick={() => setActiveTab('insights')}
                role="tab"
                aria-controls="insights-panel"
                aria-selected={activeTab === 'insights'}
              >
                Diff Insights
              </button>
            </li>
          )}
          {aethelgardConfig.enabledFeatures.historyAnalysis && (
            <li className="mr-2" role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-hover'}`}
                onClick={() => setActiveTab('history')}
                role="tab"
                aria-controls="history-panel"
                aria-selected={activeTab === 'history'}
              >
                Commit History Explorer
              </button>
            </li>
          )}
          {/* Conceptual 'Codebase Architecting Assistant' tab */}
          <li className="mr-2" role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'codebase' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-hover'}`}
                onClick={() => setActiveTab('codebase')}
                role="tab"
                aria-controls="codebase-panel"
                aria-selected={activeTab === 'codebase'}
              >
                Codebase Architecting Assistant
              </button>
            </li>
        </ul>
      </nav>

      <div className="flex-grow overflow-hidden relative">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
            {/* Diff Input and Generation Options */}
            <div className="flex flex-col h-full bg-surface p-4 rounded-md shadow-inner">
              <label htmlFor="diff-input" className="text-sm font-medium text-text-secondary mb-2">Git Diff for Aethelgard Analysis</label>
              <textarea
                id="diff-input"
                value={diff}
                onChange={handleDiffChange}
                placeholder="Paste your git diff here, and Aethelgard's Lumina Core will begin processing..."
                className="flex-grow p-4 bg-background border border-border rounded-md resize-none font-mono text-sm text-text-secondary focus:ring-2 focus:ring-primary focus:outline-none custom-scrollbar"
              />
              <CommitMessageOptionsPanel options={options} setOptions={setOptions} />
              <button
                onClick={() => handleGenerate(diff, options)}
                disabled={isLoading || isAnalyzing}
                className="btn-primary mt-4 w-full flex items-center justify-center px-6 py-3"
              >
                {isLoading ? <LoadingSpinner /> : 'Generate Intelligent Commit Message'}
              </button>
            </div>

            {/* Generated Message and Refinement */}
            <div className="flex flex-col h-full bg-surface p-4 rounded-md shadow-inner">
              <label className="text-sm font-medium text-text-secondary mb-2">Aethelgard's Generated Message</label>
              <div className="relative flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto custom-scrollbar">
                {(isLoading || isRefining) && !displayedMessage && (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                    <span className="ml-2 text-text-secondary">Aethelgard is generating...</span>
                  </div>
                )}
                {(error || refinementError) && <p className="text-danger-dark">{error || refinementError}</p>}
                {displayedMessage && (
                  <>
                    <button onClick={handleCopy} className="absolute top-2 right-2 px-3 py-1 bg-surface-hover hover:bg-border rounded-md text-xs text-text-secondary">
                      Copy <span className="ml-1 text-primary-dark">&#x2702;</span> {/* Scissors icon */}
                    </button>
                    <pre className="whitespace-pre-wrap font-sans text-text-primary text-sm">{displayedMessage}</pre>
                  </>
                )}
                {!isLoading && !isRefining && !displayedMessage && !error && !refinementError && (
                  <div className="text-text-secondary h-full flex items-center justify-center">
                    The Aethelgard-powered commit message will appear here.
                  </div>
                )}
              </div>
              {aethelgardConfig.enabledFeatures.commitRefinement && (
                <CommitMessageRefinement
                  generatedMessage={message} // Always refine the original AI-generated message
                  currentDiff={diff}
                  onRefine={triggerRefinement}
                  isRefining={isRefining}
                  refinedMessage={refinedMessage}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && aethelgardConfig.enabledFeatures.diffAnalysis && (
          <DiffInsightsDisplay analysisResult={analysisResult} isLoading={isAnalyzing} error={analysisError} config={aethelgardConfig} />
        )}

        {activeTab === 'history' && aethelgardConfig.enabledFeatures.historyAnalysis && (
          <CommitHistoryExplorer
            repoId={aethelgardConfig.repoId}
            fetchHistory={fetchHistoricalCommits}
            isLoading={isFetchingHistory}
            commits={historicalCommits}
            error={historyError}
          />
        )}

        {activeTab === 'codebase' && (
            <CodebaseSemanticAnalyzer
                repoId={aethelgardConfig.repoId}
                triggerAnalysis={triggerCodebaseAnalysis}
                isLoading={isAnalyzingCodebase}
                report={codebaseAnalysisReport}
                error={codebaseAnalysisError}
                config={aethelgardConfig}
            />
        )}
      </div>

      <footer className="mt-6 pt-4 border-t border-border-light text-center text-text-tertiary text-xs">
        &copy; {new Date().getFullYear()} Aethelgard: The Architecting of Tomorrow's Horizon. Powered by Lumina Core, Agora Network, Chronos Engine, and Ethos Layer. All rights reserved.
      </footer>
    </div>
  );
};
