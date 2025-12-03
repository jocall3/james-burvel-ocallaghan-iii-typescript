import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import Card from '../../Card';

// #region --- [1] Interfaces and Types ---
// Define detailed interfaces for all data structures that a real application would handle.

/**
 * Represents a legal precedent (case law).
 */
export interface IPrecedent {
    id: string;
    caseName: string;
    citation: string;
    jurisdiction: string; // e.g., "Supreme Court of California", "U.S. District Court, S.D.N.Y."
    year: number;
    summary: string; // Factual summary
    holding: string; // Legal principle established
    reasoning: string; // Court's rationale
    keywords: string[];
    relevanceScore?: number; // For search results
    isPrimaryAuthority: boolean;
    courtLevel: 'trial' | 'appellate' | 'supreme';
    dateDecided: string; // ISO 8601 date string
    judges: string[];
    attorneysForPlaintiff?: string[];
    attorneysForDefendant?: string[];
    dissentingOpinions?: string;
    concurringOpinions?: string;
    relatedCases?: string[]; // IDs of related cases
    status: 'active' | 'overruled' | 'distinguished';
    tags?: string[];
}

/**
 * Represents a relevant statute or regulation.
 */
export interface IStatute {
    id: string;
    name: string;
    citation: string;
    jurisdiction: string; // e.g., "California Civil Code", "Federal Rules of Civil Procedure"
    section: string;
    fullText: string;
    effectiveDate: string; // ISO 8601 date string
    keywords: string[];
    amendmentsHistory?: { date: string, description: string }[];
    relatedRegulations?: string[]; // IDs of related regulations
    chapter?: string;
    part?: string;
    subsectionStructure?: { [key: string]: string }; // Map of subsection identifier to text
    isCriminal?: boolean;
    isProcedural?: boolean;
    enforcementBody?: string;
}

/**
 * Represents a legal jurisdiction and its specific rules.
 */
export interface IJurisdiction {
    id: string;
    name: string; // e.g., "California", "Federal"
    country: string;
    courtSystemDescription: string;
    primaryStatuteBooks: string[]; // e.g., "California Codes", "U.S. Code"
    rulesOfProcedureId: string; // Reference to a specific rule set
    rulesOfEvidenceId: string; // Reference to a specific rule set
    uniqueLegalConcepts?: string[]; // e.g., "California's Proposition 65"
    appellateCourts: string[];
    supremeCourtName: string;
    commonLawTradition: boolean;
}

/**
 * Represents the rules of procedure for a jurisdiction.
 */
export interface IRulesOfProcedure {
    id: string;
    name: string; // e.g., "California Rules of Court", "Federal Rules of Civil Procedure"
    jurisdictionId: string;
    effectiveDate: string;
    sections: {
        id: string;
        title: string;
        text: string;
        keywords: string[];
        relatedForms?: string[];
    }[];
    amendmentLog?: { date: string, description: string }[];
}

/**
 * Represents the rules of evidence for a jurisdiction.
 */
export interface IRulesOfEvidence {
    id: string;
    name: string; // e.g., "California Evidence Code", "Federal Rules of Evidence"
    jurisdictionId: string;
    effectiveDate: string;
    sections: {
        id: string;
        title: string;
        text: string;
        keywords: string[];
        admissibilityExamples?: string[];
    }[];
    amendmentLog?: { date: string, description: string }[];
}

/**
 * Represents a single factual assertion in a case.
 */
export interface ICaseFact {
    id: string;
    description: string;
    isDisputed: boolean;
    sourceDocumentRef?: string; // e.g., "Exhibit A, p.5"
    relevance: 'high' | 'medium' | 'low';
    relatedPartyId?: string; // If fact relates to a specific party
    dateOfOccurrence?: string;
    witnesses?: string[];
}

/**
 * Represents a party involved in the case.
 */
export interface ICaseParty {
    id: string;
    name: string;
    type: 'plaintiff' | 'defendant' | 'appellant' | 'appellee' | 'petitioner' | 'respondent' | 'other';
    representation?: string; // Attorney name or firm
    isIndividual: boolean;
    contactInfo?: string;
    roleDescription?: string;
}

/**
 * Represents the core data for a legal case that the AI will process.
 */
export interface ICaseData {
    id: string;
    caseName: string;
    caseSummary: string;
    parties: ICaseParty[];
    facts: ICaseFact[];
    desiredLegalPosition: string; // The goal or desired outcome
    jurisdictionId: string;
    relevantStatuteIds: string[];
    relevantPrecedentIds: string[];
    legalIssueStatement: string;
    reliefSought: string; // e.g., "Damages of $X", "Specific Performance", "Injunction"
    briefType: 'motion' | 'appellate' | 'trial' | 'memorandum' | 'complaint' | 'answer' | 'other';
    clientName?: string;
    dateCreated: string;
    lastModified: string;
    associatedDocuments?: { name: string, url: string, type: string }[];
    opposingCounselArguments?: string;
    strategicConsiderations?: string;
    specificInstructions?: string; // Any specific nuances the AI should consider
    stageOfLitigation?: 'pre-litigation' | 'discovery' | 'motion' | 'trial' | 'appeal';
    filingDeadline?: string;
}

/**
 * Represents a section within a legal brief.
 */
export interface ILegalBriefSection {
    id: string;
    title: string;
    content: string; // Markdown or rich text content
    citations: string[]; // List of unique citation strings (e.g., "Smith v. Jones, 123 F.2d 456 (1999)")
    sectionType: 'introduction' | 'statementOfFacts' | 'standardOfReview' | 'legalArgument' | 'conclusion' | 'prayerForRelief' | 'summaryOfArgument' | 'background' | 'issuePresented' | 'other';
    subSections?: ILegalBriefSection[];
}

/**
 * Represents a complete legal brief generated by the AI.
 */
export interface ILegalBrief {
    id: string;
    caseId: string;
    title: string;
    briefType: ICaseData['briefType'];
    generatedDate: string; // ISO 8601 date string
    sections: ILegalBriefSection[];
    fullTextRaw: string; // Complete text for easy export
    citationsList: string[]; // All unique citations used in the brief
    keywords: string[];
    generationMetadata: {
        aiModel: string;
        temperature: number;
        promptTokens: number;
        completionTokens: number;
        runtimeMs: number;
    };
    versionHistoryId: string; // Link to its version history
    analysisSummary?: string; // AI's own summary of the brief's strengths/weaknesses
    suggestedRevisions?: string[]; // AI's suggestions for improvement
    legalStrengthScore?: number; // 0-100 score
    readabilityScore?: number; // Flesch-Kincaid or similar
    toneAnalysis?: { primaryTone: string, score: number };
}

/**
 * Configuration options for the AI brief generation.
 */
export interface IAIConfig {
    id: string;
    name: string;
    tone: 'formal' | 'persuasive' | 'neutral' | 'aggressive';
    lengthPreference: 'short' | 'medium' | 'long' | 'very-long';
    citationStyle: 'bluebook' | 'localRules' | 'chicago';
    includeDetailedFacts: boolean;
    includeCounterArguments: boolean;
    focusOnStatutes: boolean;
    focusOnPrecedents: boolean;
    legalDoctrineEmphasis?: string; // e.g., "Strict Liability", "Contractual Intent"
    targetAudience: 'judge' | 'jury' | 'opposingCounsel' | 'client';
    levelOfDetail: 'general' | 'specific' | 'exhaustive';
    language: 'en-US' | 'en-UK' | 'es';
    strictComplianceWithRules: boolean; // Should AI strictly adhere to rules or be more creative?
}

/**
 * Represents a draft version of a legal brief.
 */
export interface IDraftVersion {
    versionId: string;
    briefId: string;
    generatedDate: string;
    briefContent: ILegalBrief;
    notes?: string;
    status: 'draft' | 'reviewed' | 'finalized';
    modifiedByUserId?: string;
}

/**
 * Represents user context or profile data.
 */
export interface IUserContext {
    userId: string;
    userName: string;
    firmName: string;
    defaultJurisdictionId: string;
    roles: ('attorney' | 'paralegal' | 'admin')[];
    preferences: {
        aiConfigId: string; // Default AI config
        briefTemplateId?: string;
        notificationSettings?: any;
    };
}

/**
 * Options for exporting a document.
 */
export interface IDocumentExportOptions {
    format: 'PDF' | 'DOCX' | 'HTML';
    includeTrackChanges: boolean;
    includeComments: boolean;
    addWatermark?: string;
    fileName: string;
    headerContent?: string;
    footerContent?: string;
}

/**
 * Represents a legal concept or doctrine.
 */
export interface ILegalConcept {
    id: string;
    name: string;
    description: string;
    relatedStatutes?: string[];
    relatedPrecedents?: string[];
    jurisdictions?: string[];
    keywords: string[];
}

/**
 * Represents an argument template for the AI.
 */
export interface IArgumentTemplate {
    id: string;
    name: string;
    type: 'claim' | 'defense' | 'motion' | 'appeal';
    structure: string; // Template using placeholders (e.g., "Under [STATUTE], a party must prove [ELEMENT1], [ELEMENT2]...")
    exampleUsage?: string;
    keywords: string[];
    jurisdictionScope?: string[];
}

/**
 * Represents a user-defined legal position strategy.
 */
export interface ILegalPositionStrategy {
    id: string;
    name: string;
    description: string;
    argumentOutline: string[]; // List of main points
    keyFactsToHighlight: string[]; // IDs of facts
    keyPrecedentsToUse: string[]; // IDs of precedents
    desiredTone: IAIConfig['tone'];
    appliesToBriefTypes: ICaseData['briefType'][];
    ownerUserId: string;
}

// #endregion

// #region --- [2] Mock Data Sets ---
// Generate extensive mock data to simulate a real database.

export const MOCK_USER_CONTEXT: IUserContext = {
    userId: 'user-gj-123',
    userName: 'A. Legalmind',
    firmName: 'JurisGen AI Associates',
    defaultJurisdictionId: 'CA-SCC', // California Superior Court
    roles: ['attorney'],
    preferences: {
        aiConfigId: 'default-persuasive-brief',
        notificationSettings: {
            email: true,
            sms: false,
            inApp: true,
        },
    },
};

export const MOCK_JURISDICTIONS: IJurisdiction[] = [
    {
        id: 'US-FED',
        name: 'Federal',
        country: 'USA',
        courtSystemDescription: 'Dual court system with federal and state courts. Federal courts handle cases involving federal law, the U.S. Constitution, or disputes between states/citizens of different states.',
        primaryStatuteBooks: ['U.S. Code', 'Code of Federal Regulations'],
        rulesOfProcedureId: 'FRCP',
        rulesOfEvidenceId: 'FRE',
        uniqueLegalConcepts: ['Federal Question Jurisdiction', 'Diversity Jurisdiction'],
        appellateCourts: ['Circuit Courts of Appeals'],
        supremeCourtName: 'Supreme Court of the United States',
        commonLawTradition: true,
    },
    {
        id: 'CA-STATE',
        name: 'California State',
        country: 'USA',
        courtSystemDescription: 'California operates a unified state court system, with trial courts (Superior Courts), Courts of Appeal, and the Supreme Court of California.',
        primaryStatuteBooks: ['California Codes', 'California Rules of Court'],
        rulesOfProcedureId: 'CRCP',
        rulesOfEvidenceId: 'CA-EVIDENCE',
        uniqueLegalConcepts: ['Proposition 65', 'Community Property'],
        appellateCourts: ['California Courts of Appeal'],
        supremeCourtName: 'Supreme Court of California',
        commonLawTradition: true,
    },
    {
        id: 'NY-STATE',
        name: 'New York State',
        country: 'USA',
        courtSystemDescription: 'New York has a complex court structure, including Supreme Courts (trial courts for major civil/criminal), County Courts, Family Courts, Surrogates’ Courts, and Court of Claims, Appellate Divisions, and the Court of Appeals.',
        primaryStatuteBooks: ['New York Consolidated Laws', 'New York Civil Practice Law and Rules'],
        rulesOfProcedureId: 'NY-CPLR',
        rulesOfEvidenceId: 'NY-EVIDENCE',
        uniqueLegalConcepts: ['New York Labor Law § 240'],
        appellateCourts: ['Appellate Divisions of the Supreme Court'],
        supremeCourtName: 'New York Court of Appeals',
        commonLawTradition: true,
    },
    {
        id: 'TX-STATE',
        name: 'Texas State',
        country: 'USA',
        courtSystemDescription: 'Texas has a complex court system with overlapping jurisdictions, including Justice Courts, Municipal Courts, Constitutional County Courts, County Courts at Law, District Courts, Courts of Appeals, and two supreme courts (Supreme Court of Texas for civil cases and Court of Criminal Appeals for criminal cases).',
        primaryStatuteBooks: ['Texas Codes', 'Texas Rules of Civil Procedure'],
        rulesOfProcedureId: 'TX-CRP',
        rulesOfEvidenceId: 'TX-EVIDENCE',
        uniqueLegalConcepts: ['Homestead Exemption', 'Deceptive Trade Practices Act'],
        appellateCourts: ['Courts of Appeals'],
        supremeCourtName: 'Supreme Court of Texas (Civil), Court of Criminal Appeals (Criminal)',
        commonLawTradition: true,
    },
    {
        id: 'FL-STATE',
        name: 'Florida State',
        country: 'USA',
        courtSystemDescription: 'Florida\'s judicial system includes County Courts, Circuit Courts, District Courts of Appeal, and the Supreme Court of Florida.',
        primaryStatuteBooks: ['Florida Statutes', 'Florida Rules of Civil Procedure'],
        rulesOfProcedureId: 'FL-RCP',
        rulesOfEvidenceId: 'FL-EVIDENCE',
        uniqueLegalConcepts: ['Stand Your Ground Law', 'Homestead Exemption'],
        appellateCourts: ['District Courts of Appeal'],
        supremeCourtName: 'Supreme Court of Florida',
        commonLawTradition: true,
    },
    // Add more jurisdictions as needed for depth
];

export const MOCK_RULES_OF_PROCEDURE: IRulesOfProcedure[] = [
    {
        id: 'FRCP',
        name: 'Federal Rules of Civil Procedure',
        jurisdictionId: 'US-FED',
        effectiveDate: '2023-12-01',
        sections: [
            {
                id: 'FRCP-1', title: 'Scope and Purpose', text: 'These rules govern the procedure in all civil actions and proceedings in the United States district courts, except as stated in Rule 81. They should be construed, administered, and employed by the court and the parties to secure the just, speedy, and inexpensive determination of every action and proceeding.', keywords: ['scope', 'purpose', 'civil actions']
            },
            {
                id: 'FRCP-8', title: 'General Rules of Pleading', text: '(a) Claim for Relief. A pleading that states a claim for relief must contain: (1) a short and plain statement of the grounds for the court\'s jurisdiction, unless the court already has jurisdiction and the claim needs no new jurisdictional support; (2) a short and plain statement of the claim showing that the pleader is entitled to relief; and (3) a demand for the relief sought, which may include relief in the alternative or different types of relief. (b) Defenses; Admissions and Denials. (1) In General. In responding to a pleading, a party must: (A) state in short and plain terms its defenses to each claim asserted against it; and (B) admit or deny the allegations made against it by an opposing party. (c) Affirmative Defenses.', keywords: ['pleading', 'claim for relief', 'defenses', 'admissions', 'denials']
            },
            {
                id: 'FRCP-11', title: 'Signing Pleadings, Motions, and Other Papers; Representations to the Court; Sanctions', text: '(a) Signature. Every pleading, written motion, and other paper must be signed by at least one attorney of record in the attorney’s name—or by a party personally if the party is unrepresented. (b) Representations to the Court. By presenting to the court a pleading, written motion, or other paper—whether by signing, filing, submitting, or later advocating it—an attorney or unrepresented party certifies that to the best of the person’s knowledge, information, and belief, formed after an inquiry reasonable under the circumstances: (1) it is not being presented for any improper purpose, such as to harass, cause unnecessary delay, or needlessly increase the cost of litigation; (2) the claims, defenses, and other legal contentions are warranted by existing law or by a nonfrivolous argument for extending, modifying, or reversing existing law or for establishing new law; (3) the factual contentions have evidentiary support or, if specifically so identified, will likely have evidentiary support after a reasonable opportunity for further investigation or discovery; and (4) the denials of factual contentions are warranted on the evidence or, if specifically so identified, are reasonably based on belief or a lack of information.', keywords: ['sanctions', 'pleading standards', 'good faith']
            },
            {
                id: 'FRCP-26', title: 'Duty to Disclose; General Provisions Governing Discovery', text: '(a) Required Disclosures. (1) Initial Disclosure. Except as exempted by Rule 26(a)(1)(B) or as otherwise stipulated or ordered by the court, a party must, without awaiting a discovery request, provide to the other parties: (A) the name and, if known, the address and telephone number of each individual likely to have discoverable information—along with the subjects of that information—that the disclosing party may use to support its claims or defenses, unless the use would be solely for impeachment; (B) a copy—or a description by category and location—of all documents, electronically stored information, and tangible things that the disclosing party has in its possession, custody, or control and may use to support its claims or defenses, unless the use would be solely for impeachment; (C) a computation of each category of damages claimed by the disclosing party—who must also make available for inspection and copying the documents or other evidentiary material, unless privileged or protected from disclosure, on which each computation is based, including materials bearing on the nature and extent of injuries suffered; and (D) for inspection and copying as under Rule 34, any insurance agreement under which an insurance business may be liable to satisfy all or part of a possible judgment in the action or to indemnify or reimburse for payments made to satisfy the judgment. (b) Scope of Discovery. Unless otherwise limited by court order, the scope of discovery is as follows: Parties may obtain discovery regarding any nonprivileged matter that is relevant to any party\'s claim or defense and proportional to the needs of the case, considering the importance of the issues at stake in the action, the amount in controversy, the parties’ relative access to relevant information, the parties’ resources, the importance of the discovery in resolving the issues, and whether the burden or expense of the proposed discovery outweighs its likely benefit. Information within this scope of discovery need not be admissible in evidence to be discoverable.', keywords: ['discovery', 'disclosure', 'scope of discovery', 'proportionality']
            },
            {
                id: 'FRCP-56', title: 'Summary Judgment', text: '(a) Motion for Summary Judgment or Partial Summary Judgment. A party may move for summary judgment, identifying each claim or defense—or the part of each claim or defense—on which summary judgment is sought. The court shall grant summary judgment if the movant shows that there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law. The court should state on the record the reasons for granting or denying the motion.', keywords: ['summary judgment', 'material fact', 'judgment as a matter of law']
            },
        ],
        amendmentLog: [
            { date: '2023-12-01', description: 'Various minor amendments to clarify language and procedure.' },
            { date: '2022-12-01', description: 'Amendments related to electronic discovery.' }
        ]
    },
    {
        id: 'CRCP',
        name: 'California Rules of Court',
        jurisdictionId: 'CA-STATE',
        effectiveDate: '2024-01-01',
        sections: [
            {
                id: 'CRC-2.100', title: 'Form of papers presented for filing', text: '(a) Application. The rules in this chapter apply to papers filed in the trial courts. (b) Paper size. Except for exhibits and as provided in rule 2.111, all papers must be on letter-size (8½- by 11-inch) paper.', keywords: ['form', 'filing', 'paper size']
            },
            {
                id: 'CRC-3.1110', title: 'General format and filing of motions; two-page limit on memoranda in support of or opposition to demurrer', text: '(a) Required papers. A party filing a motion, except for a motion made during trial, must serve and file: (1) A notice of hearing on the motion; (2) The motion itself; (3) A memorandum of points and authorities in support of the motion; and (4) Evidence in support of the motion.', keywords: ['motions', 'filing', 'memorandum', 'evidence']
            },
            {
                id: 'CRC-3.1340', title: 'Motion to compel further response to interrogatories, inspection demand, or to admissions', text: '(a) Contents of motion. A motion to compel further responses to interrogatories, inspection demands, or to requests for admission must: (1) Identify the interrogatories, demands, or requests by set and number or letter; (2) Quote each interrogatory, demand, or request, and the response to which objection is taken; and (3) State the factual and legal reasons for compelling further response.', keywords: ['discovery', 'motion to compel', 'interrogatories']
            },
        ],
        amendmentLog: [
            { date: '2024-01-01', description: 'Annual revisions and updates.' },
        ]
    }
];

export const MOCK_RULES_OF_EVIDENCE: IRulesOfEvidence[] = [
    {
        id: 'FRE',
        name: 'Federal Rules of Evidence',
        jurisdictionId: 'US-FED',
        effectiveDate: '2023-12-01',
        sections: [
            {
                id: 'FRE-401', title: 'Test for Relevant Evidence', text: 'Evidence is relevant if: (a) it has any tendency to make a fact more or less probable than it would be without the evidence; and (b) the fact is of consequence in determining the action.', keywords: ['relevance', 'admissibility']
            },
            {
                id: 'FRE-403', title: 'Excluding Relevant Evidence for Prejudice, Confusion, Waste of Time, or Other Reasons', text: 'The court may exclude relevant evidence if its probative value is substantially outweighed by a danger of one or more of the following: unfair prejudice, confusing the issues, misleading the jury, undue delay, wasting time, or needlessly presenting cumulative evidence.', keywords: ['exclusion of evidence', 'prejudice', 'probative value']
            },
            {
                id: 'FRE-802', title: 'The Rule Against Hearsay', text: 'Hearsay is not admissible unless any of the following provides otherwise: a federal statute; these rules; or other rules prescribed by the Supreme Court.', keywords: ['hearsay', 'admissibility']
            },
            {
                id: 'FRE-803', title: 'Exceptions to the Rule Against Hearsay—Regardless of Whether the Declarant Is Available as a Witness', text: 'The following are not excluded by the rule against hearsay, regardless of whether the declarant is available as a witness: (1) Present Sense Impression. (2) Excited Utterance. (3) Statement of Mental, Emotional, or Physical Condition. (4) Statement Made for Medical Diagnosis or Treatment. (5) Recorded Recollection. (6) Records of a Regularly Conducted Activity. (7) Absence of a Record of a Regularly Conducted Activity. (8) Public Records. (9) Public Records of Vital Statistics. (10) Absence of a Public Record. (11) Records of Religious Organizations Concerning Personal or Family History. (12) Certificates of Marriage, Baptism, and Similar Ceremonies. (13) Family Records. (14) Records of Documents That