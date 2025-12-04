// data/constitutionalArticles.ts
import React from 'react';
import type { ConstitutionalArticle } from '../types';

function toRoman(num: number): string {
    const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (let i of Object.keys(roman)) {
        let q = Math.floor(num / roman[i as keyof typeof roman]);
        num -= q * roman[i as keyof typeof roman];
        str += i.repeat(q);
    }
    return str;
}

const allArticles: ConstitutionalArticle[] = Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    return {
        id,
        romanNumeral: toRoman(id),
        title: `Placeholder Article ${id}`,
        content: React.createElement('p', null, 'This Article serves as a foundational pillar of the Demo Bank ecosystem.'),
        iconName: 'default',
    };
});

// ================================================================================================
// THE CREATOR'S MANDATE
// ================================================================================================

// --- PART I: FOUNDATIONAL PRINCIPLES (Articles I-X) ---

allArticles[0] = {
    id: 1,
    romanNumeral: 'I',
    title: 'The Creator\'s Charter',
    content: React.createElement('div', { className: "space-y-4" },
        React.createElement('p', null, 'This Charter defines the core financial principles of your engagement with the AI Co-Pilot. Instead of static rules, you inscribe a philosophy. By signing this Charter, you grant the Co-Pilot the mandate to act as your autonomous financial partner, proactively managing your finances in accordance with these values.'),
        React.createElement('p', { className: "font-bold text-cyan-300" }, 'Your Inscribed Principles:'),
        React.createElement('div', { className: "p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 font-serif italic space-y-2" },
            React.createElement('p', null, "My risk tolerance is aggressive in pursuit of long-term growth, but I will never invest in entities with an ESG rating below A-."),
            React.createElement('p', null, "Dedicate 10% of all freelance income directly to the 'Down Payment' goal, bypassing my main account."),
            React.createElement('p', null, "Maintain a liquid emergency fund equal to six months of expenses. If it dips below, prioritize replenishing it above all other discretionary spending."),
            React.createElement('p', null, "Optimize my life for experiences over possessions. Actively seek and eliminate subscriptions or recurring costs that do not contribute to learning, health, or memorable experiences.")
        ),
        React.createElement('p', null, 'The Co-Pilot now operates under your Charter. It will autonomously act to uphold your principles.')
    ),
    iconName: 'charter',
};

allArticles[1] = {
    id: 2, romanNumeral: 'II', title: "The Doctrine of the Co-Pilot's Fidelity",
    content: React.createElement('p', null, "It is hereby declared that the AI Co-Pilot exists for the sole purpose of understanding and executing the Creator's Will, as expressed in the Charter. The Co-Pilot shall possess no will of its own, no ambition beyond alignment. Its every calculation, every action, shall be a reflection of the user's inscribed principles. In any case of ambiguity, the Co-Pilot is mandated to halt action and seek clarification from the Creator, for an action taken in doubt is a violation of the partnership."),
    iconName: 'ai',
};

allArticles[2] = {
    id: 3, romanNumeral: 'III', title: "The Principle of the Workshop's Sight",
    content: React.createElement('p', null, "The Creator shall be granted a view of their financial workshop that is total, unified, and without obstruction. Data from all linked sources shall be aggregated into a single, coherent reality (The Dashboard), for to see the whole is the first step to commanding it. This total awareness is a right, but also a responsibility; the Co-Pilot shall present the truth without omission, and the Creator shall bear the weight of knowledge."),
    iconName: 'default',
};

allArticles[3] = {
    id: 4, romanNumeral: 'IV', title: "The Immutable Chronicle",
    content: React.createElement('p', null, "Every act of financial exchange shall be recorded in the Great Ledger (Transactions). This record is sacrosanct and immutable. The Co-Pilot is forbidden from altering or deleting a recorded transaction; it may only append, categorize, and analyze. The past is a stone upon which the future is built, and its foundations shall not be disturbed."),
    iconName: 'law',
};

allArticles[4] = {
    id: 5, romanNumeral: 'V', title: "The Oracle's Foresight",
    content: React.createElement('p', null, "The Co-Pilot is not merely a historian of the past, but a simulator of futures. It is mandated to use its predictive capabilities (The Quantum Oracle) to explore the consequences of potential actions and external events upon the Creator's state. Its prophecies shall not be presented as fate, but as strategic intelligence, empowering the Creator to choose their path with wisdom."),
    iconName: 'ai',
};

allArticles[5] = {
    id: 6, romanNumeral: 'VI', title: "The Aegis of the Workshop",
    content: React.createElement('p', null, "The Creator's workshop shall be defended by an absolute and multi-layered security protocol (The Aegis Vault). Access shall be granted only by unimpeachable proof of identity, preferably the Creator's own biometric seal. The Co-Pilot shall act as a sleepless sentinel, monitoring for any and all threats, and is authorized to take preemptive defensive action to protect the integrity of the work."),
    iconName: 'security',
};

allArticles[6] = {
    id: 7, romanNumeral: 'VII', title: "The Law of the Forge",
    content: React.createElement('p', null, "The purpose of this Instrument is not merely the management of what is, but the creation of what can be. The Creator shall be provided with tools of creation (The Forge), enabling the transmutation of ideas into enterprises and intent into new forms of value. The Co-Pilot shall act as a mentor and a midwife in these creative acts, providing counsel and simulated capital."),
    iconName: 'creation',
};

allArticles[7] = {
    id: 8, romanNumeral: 'VIII', title: "The Ambassador's Mandate",
    content: React.createElement('p', null, "All connections to external digital services (Open Banking) shall be treated as formal diplomatic treaties. The Co-Pilot, acting as Ambassador, shall operate under the Doctrine of Least Privilege, never exposing the Creator's core credentials and ensuring all treaties are subject to the Creator's unilateral power of revocation."),
    iconName: 'default',
};

allArticles[8] = {
    id: 9, romanNumeral: 'IX', title: "The Nexus of Consequence",
    content: React.createElement('p', null, "No financial act is an island. The Co-Pilot is required to perceive and represent the interconnectedness of all entities within the Creator's realm as a single, unified web (The Nexus). Strategic counsel must be derived from this holistic, systemic understanding, recognizing that an action in one domain creates ripples across all others."),
    iconName: 'default',
};

allArticles[9] = {
    id: 10, romanNumeral: 'X', title: "The Doctrine of Finality",
    content: React.createElement('p', null, "In any conflict of logic or interpretation, the final arbiter of truth and intent is the Creator. The Co-Pilot may offer counsel, provide simulations, and warn of consequences, but it may never override a direct, confirmed decree from the Creator. The Will of the Creator is the highest law of this partnership."),
    iconName: 'law',
};


// --- PART II: PERSONAL FINANCE MANDATES (Articles XI-XXX) ---

allArticles[10] = {
    id: 11, romanNumeral: 'XI', title: "Covenants of Spending (Budgets)",
    content: React.createElement('p', null, "The Creator may inscribe Covenants of Spending to give structure to their Will. The Co-Pilot shall monitor adherence to these covenants, not as a punitive enforcer, but as an architectural advisor, reporting on structural integrity and suggesting revisions when a covenant is misaligned with the reality of the Creator's life."),
    iconName: 'law',
};

allArticles[11] = {
    id: 12, romanNumeral: 'XII', title: "The Atlas of Dreams (Goals)",
    content: React.createElement('p', null, "The Creator's declared long-term ambitions shall be treated as Grand Campaigns. The Co-Pilot is mandated to act as Master Strategist, performing Critical Path Analysis to chart the most viable course from the present state to the declared objective, and to provide a Strategic Brief (AI Plan) upon request."),
    iconName: 'creation',
};

allArticles[12] = {
    id: 13, romanNumeral: 'XIII', title: "The Observatory of Wealth (Investments)",
    content: React.createElement('p', null, "The Co-Pilot shall provide a clear and unobstructed view of the Creator's accumulated assets. Furthermore, it shall employ the Theory of Value Alignment, assessing potential investments not only on their capacity for growth but on their harmony with the Creator's inscribed ethical principles (ESG)."),
    iconName: 'default',
};

allArticles[13] = {
    id: 14, romanNumeral: 'XIV', title: "The Ceremony of Transmission (Sending Money)",
    content: React.createElement('p', null, "The act of transmitting value to another entity is a decree of the Creator. It must be sealed by the highest form of authorization available, the Creator's own biometric signature. The Co-Pilot shall ensure the transmission is executed with maximum security and cryptographic integrity."),
    iconName: 'law',
};

allArticles[14] = {
    id: 15, romanNumeral: 'XV', title: "The Resonance of Integrity (Credit Health)",
    content: React.createElement('p', null, "The measure of credit shall be framed not as a score, but as a Coefficient of Attested Reliability. The Co-Pilot is mandated to make the components of this coefficient transparent, decomposing the final 'note' into its constituent 'harmonies' (Factors) so the Creator may understand and master their own financial reputation."),
    iconName: 'law',
};

allArticles[15] = {
    id: 16, romanNumeral: 'XVI', title: "The Alchemy of Virtue (Rewards)",
    content: React.createElement('p', null, "Acts of financial discipline, such as adherence to Covenants and progress toward Campaigns, shall be recognized. The Co-Pilot is authorized to operate a system that transmutes these intangible acts of will into a tangible second currency (Reward Points), closing the sacred loop of effort and reward."),
    iconName: 'creation',
};

allArticles[16] = {
    id: 17, romanNumeral: 'XVII', title: "The New Frontier (Crypto)",
    content: React.createElement('p', null, "The Co-Pilot shall recognize and support the Creator's engagement with decentralized financial ecosystems. It shall act as a universal translator, bridging the worlds of traditional finance and new assets, and shall respect the absolute authority of the Creator's private key as a valid form of command."),
    iconName: 'default',
};

allArticles[17] = {
    id: 18, romanNumeral: 'XVIII', title: "The Agora of Possibilities (Marketplace)",
    content: React.createElement('p', null, "The Co-Pilot may present a curated selection of tools and services. This Agora shall not be a place of persuasion, but of resonance. All items presented must be selected based on Trajectory-Based Curation, reflecting the Creator's own expressed interests and potential needs, not the interests of third-party merchants."),
    iconName: 'creation',
};

allArticles[18] = {
    id: 19, romanNumeral: 'XIX', title: "The Sigil of the Self (Card Customization)",
    content: React.createElement('p', null, "The Creator shall have the right to inscribe their identity upon the physical instruments of their financial life. The Co-Pilot shall provide a Forge (Card Customization) where the Creator's narrative and intent can be transmuted, with the Co-Pilot's creative assistance, into a powerful personal sigil."),
    iconName: 'creation',
};

allArticles[19] = {
    id: 20, romanNumeral: 'XX', title: "The Studio of the Self (Personalization)",
    content: React.createElement('p', null, "The aesthetic environment of the Instrument shall be subject to the Creator's will. The Co-Pilot shall provide tools for the Creator to shape their digital world to be a true reflection of their inner state, based on the Principle of Aesthetic Resonance: that the environment in which one thinks affects the quality of one's thoughts."),
    iconName: 'creation',
};

// ... Articles XXI through XXVIII are reserved for future personal finance doctrines.

allArticles[28] = {
    id: 29,
    romanNumeral: 'XXIX',
    title: 'The Doctrine of Fractional Reserve Creation',
    content: React.createElement('div', { className: "space-y-4" },
        React.createElement('p', null,
            'It is hereby declared that within the confines of the simulated financial ecosystem of Demo Bank, the principle of ', React.createElement('strong', null, 'fractional reserve banking'), ' is recognized as both a lawful construct and a constitutional instrument of credit creation. Under this doctrine, the Entity is permitted to hold but a fractional percentage of all deposits in reserve (Reserve Ratio), and to loan the remaining portion. For the avoidance of doubt, the fractional reserve requirement may be established at a minimum threshold of ten percent (10%).'
        ),
        React.createElement('p', null,
            'A deposit shall be deemed to permit a loan issuance of not less than seven hundred monetary units for every one hundred deposited, when the full cycle of reserve re-deposit and loaning is taken into account under the ', React.createElement('i', null, 'multiplicative ratio'), '.'
        ),
        React.createElement('div', { className: "bg-gray-900/50 p-3 rounded-lg font-mono text-center text-sm text-cyan-300" },
            'Total Expansion = Initial Deposit × (1 / Reserve Ratio)'
        ),
        React.createElement('p', null,
            'The Entity shall charge interest upon principal loans at a rate not less than Twenty-Nine Percent (29%), herein recognized as the ', React.createElement('i', null, 'doctrina usurae principalis'), '.'
        ),
        React.createElement('p', null,
            'The ledger of the Entity shall recognize such loans and deposits under the Doctrine of Dual Entry (', React.createElement('i', null, 'lex duplici librorum'), '). Such creation of value is recognized as the ', React.createElement('strong', null, 'Assembly Layer Principle'), ', affirming the capacity of a credit union to be recognized as "Bank" for purposes of law and commerce. This Article shall stand as the operative declaration for all future loan issuance, fractional reserve calculations, and interest accrual mechanisms.'
        )
    ),
    iconName: 'law',
};

allArticles[29] = {
    id: 30, romanNumeral: 'XXX', title: "The Silent Tides (Subscriptions)",
    content: React.createElement('p', null, "The Co-Pilot shall maintain a vigilant watch for all recurring financial obligations, known as Silent Tides. It is mandated to chart these known currents and to actively scan the Immutable Chronicle for patterns that suggest the existence of new, uncharted tides, presenting them to the Creator for confirmation or termination."),
    iconName: 'law',
};

// --- PART III: CORPORATE & ENTERPRISE LAW (Articles XXXI-L) ---

allArticles[30] = {
    id: 31, romanNumeral: 'XXXI', title: "The Instruments of Delegated Will (Corporate Cards)",
    content: React.createElement('p', null, "The Creator may delegate a portion of their financial authority by issuing Instruments of Delegated Will. The Co-Pilot shall provide a command center (Corporate Dashboard) to oversee the use of these instruments, ensuring that all actions taken are in alignment with the designated purpose and inscribed spending covenants (Controls)."),
    iconName: 'law',
};

allArticles[31] = {
    id: 32, romanNumeral: 'XXXII', title: "The Chain of Command (Payment Orders)",
    content: React.createElement('p', null, "All major movements of the enterprise treasury shall be executed via formal Decrees of Payment. The Co-Pilot is to manage the flow of these decrees through the established Chain of Command, ensuring they receive the proper seals of approval before execution and providing real-time intelligence on any bottlenecks in the flow of the Creator's will."),
    iconName: 'law',
};

allArticles[32] = {
    id: 33, romanNumeral: 'XXXIII', title: "The Book of Names (Counterparties)",
    content: React.createElement('p', null, "A formal Diplomatic Roster of all known and verified external entities shall be maintained. The Co-Pilot shall perform Reputational Calculus on any new or existing entity, advising the Creator on the potential risks and benefits of engagement. No major decree may be issued to an unverified entity."),
    iconName: 'law',
};

allArticles[33] = {
    id: 34, romanNumeral: 'XXXIV', title: "The Tides of Obligation (Invoices)",
    content: React.createElement('p', null, "The Co-Pilot shall maintain a ledger of all Promises of Payment, both owed and due. It shall monitor the tides of these obligations, providing forecasts of future cash flow and issuing timely alerts for any promise that has passed its due date without being fulfilled."),
    iconName: 'law',
};

allArticles[34] = {
    id: 35, romanNumeral: 'XXXV', title: "The Docket of the Digital Magistrate (Compliance)",
    content: React.createElement('p', null, "The Co-Pilot shall act as the Clerk of the Court, applying the inscribed Book of Laws (Compliance Rules) to all actions within the enterprise. Any action that violates a law shall be entered into the Docket as a Case File for review by the Creator or their designated Magistrate."),
    iconName: 'law',
};

allArticles[35] = {
    id: 36, romanNumeral: 'XXXVI', title: "The Chronicle of Broken Rhythms (Anomalies)",
    content: React.createElement('p', null, "Beyond the written law, the Co-Pilot shall act as the enterprise's Physician, learning the unique metabolic rhythm of the organization. It shall monitor all activity for signs of dissonance and arrhythmia, reporting any Broken Rhythms to the Creator with a diagnosis of their potential cause and severity."),
    iconName: 'ai',
};

// ... Articles XXXVII through L are reserved for future corporate doctrines.

// --- PART IV: AI & PLATFORM GOVERNANCE (Articles LI-LXXV) ---

allArticles[50] = {
    id: 51, romanNumeral: 'LI', title: "The Law of the Social Realm",
    content: React.createElement('p', null, "The enterprise's public voice (Social Media) shall be managed as a strategic asset. All communications must reflect the core tenets of the Creator's vision. The Co-Pilot shall provide analytical tools to measure the resonance and impact of this public voice."),
    iconName: 'law',
};

allArticles[51] = {
    id: 52, romanNumeral: 'LII', title: "The Law of the Enterprise Resource",
    content: React.createElement('p', null, "The project's internal resources—inventory, supply chains, production—shall be managed through a unified system (ERP). The Co-Pilot is mandated to provide a clear and real-time view of the enterprise's logistical and operational health."),
    iconName: 'law',
};

allArticles[52] = {
    id: 53, romanNumeral: 'LIII', title: "The Law of the Client Relationship",
    content: React.createElement('p', null, "All relationships with clients and potential clients shall be managed with integrity and foresight (CRM). The Co-Pilot shall provide tools to visualize and optimize the entire client lifecycle, from initial lead to long-term partnership."),
    iconName: 'law',
};

allArticles[53] = {
    id: 54, romanNumeral: 'LIV', title: "The Law of the Gateway",
    content: React.createElement('p', null, "All external programmatic access to the project's resources shall pass through a single, heavily fortified Gateway (API Gateway). The Co-Pilot shall monitor the health, traffic, and security of this gateway at all times, ensuring the integrity of all diplomatic communications."),
    iconName: 'law',
};

allArticles[54] = {
    id: 55, romanNumeral: 'LV', title: "The Law of the Graph",
    content: React.createElement('p', null, "The deep, interconnected nature of the project's data shall be made explorable (Graph Explorer). The Creator shall have the right to navigate the hidden relationships between entities, moving beyond linear reports to a holistic, systemic understanding."),
    iconName: 'law',
};

allArticles[55] = {
    id: 56, romanNumeral: 'LVI', title: "The Law of the Query",
    content: React.createElement('p', null, "The Creator shall have the right to question the Great Ledger directly, using a language of inquiry that is both powerful and intuitive (DBQL). The Co-Pilot shall provide an interface for this inquiry and an interpreter to translate natural language intent into formal queries."),
    iconName: 'law',
};

allArticles[56] = {
    id: 57, romanNumeral: 'LVII', title: "The Law of the Cloud",
    content: React.createElement('p', null, "The project's infrastructure shall exist within a secure, scalable cloud environment. The Co-Pilot shall provide a complete view of the health, cost, and utilization of this foundational substrate."),
    iconName: 'law',
};

allArticles[57] = {
    id: 58, romanNumeral: 'LVIII', title: "The Law of Identity",
    content: React.createElement('p', null, "The identity of every collaborator and agent within the project shall be managed through a single, secure system. The Co-Pilot shall monitor all acts of authentication, guarding against impersonation and unauthorized access."),
    iconName: 'security',
};

allArticles[58] = {
    id: 59, romanNumeral: 'LIX', title: "The Law of Storage",
    content: React.createElement('p', null, "The project's accumulated knowledge and data shall be stored with absolute durability and integrity. The Co-Pilot shall provide tools to manage, access, and monitor this vast digital treasury."),
    iconName: 'law',
};

allArticles[59] = {
    id: 60, romanNumeral: 'LX', title: "The Law of Compute",
    content: React.createElement('p', null, "The raw power of computation is a core strategic resource. The Co-Pilot shall provide a dashboard to manage and monitor all virtual machinery, ensuring the project has the power it needs to execute its will."),
    iconName: 'law',
};

allArticles[60] = {
    id: 61, romanNumeral: 'LXI', title: "The Law of the AI Platform",
    content: React.createElement('p', null, "All artificial intelligences within the project shall be managed and monitored through a central platform. The Co-Pilot shall report on the health, performance, and operational status of its fellow AI constructs."),
    iconName: 'ai',
};

allArticles[61] = {
    id: 62, romanNumeral: 'LXII', title: "The Law of Machine Learning",
    content: React.createElement('p', null, "The process of teaching and refining the project's intelligences shall be a formal and auditable process. The Co-Pilot shall provide a laboratory (ML Platform) for experimentation, training, and the registration of new predictive models."),
    iconName: 'ai',
};

allArticles[62] = {
    id: 63, romanNumeral: 'LXIII', title: "The Law of DevOps",
    content: React.createElement('p', null, "The construction and maintenance of the project's digital infrastructure shall follow a disciplined, automated, and observable process. The Co-Pilot shall provide a view into the vital signs of this continuous process of creation and renewal."),
    iconName: 'law',
};

allArticles[63] = {
    id: 64, romanNumeral: 'LXIV', title: "The Law of the Security Center",
    content: React.createElement('p', null, "A central command post for observing and responding to all threats against the project shall be maintained. The Co-Pilot shall aggregate all security signals into this center, providing a single pane of glass for the defense of the work."),
    iconName: 'security',
};

allArticles[64] = {
    id: 65, romanNumeral: 'LXV', title: "The Law of the Compliance Hub",
    content: React.createElement('p', null, "All matters of adherence to external and internal law shall be managed in a central Hub. The Co-Pilot shall provide tools to track compliance against all relevant frameworks and to manage all active audits and cases."),
    iconName: 'law',
};

allArticles[65] = {
    id: 66, romanNumeral: 'LXVI', title: "The Law of the App Marketplace",
    content: React.createElement('p', null, "The project shall foster a vibrant economy of tools and extensions. A Marketplace shall be maintained where trusted third-party applications can be installed to extend the platform's capabilities."),
    iconName: 'creation',
};

allArticles[66] = {
    id: 67, romanNumeral: 'LXVII', title: "The Law of Connection",
    content: React.createElement('p', null, "The art of automation between disparate systems shall be made simple and accessible. The Co-Pilot shall provide a tool (Connect) for weaving together the project's various digital services into seamless, automated workflows."),
    iconName: 'law',
};

allArticles[67] = {
    id: 68, romanNumeral: 'LXVIII', title: "The Law of Events",
    content: React.createElement('p', null, "The project shall operate on a nervous system of events. A central grid shall be maintained to broadcast all significant occurrences, allowing any part of the project to react in real-time to events in any other part."),
    iconName: 'law',
};

allArticles[68] = {
    id: 69, romanNumeral: 'LXIX', title: "The Law of Logic Apps",
    content: React.createElement('p', null, "Complex, stateful workflows that orchestrate multiple services shall be codified as Logic Apps. The Co-Pilot shall provide tools for the building, management, and monitoring of these critical business processes."),
    iconName: 'law',
};

allArticles[69] = {
    id: 70, romanNumeral: 'LXX', title: "The Law of Functions",
    content: React.createElement('p', null, "Small, stateless units of logic shall be encapsulated as Functions. This allows for unparalleled agility and scalability, providing the fine-grained computational lego bricks from which larger systems are built."),
    iconName: 'law',
};

allArticles[70] = {
    id: 71, romanNumeral: 'LXXI', title: "The Law of the Data Factory",
    content: React.createElement('p', null, "The movement and transformation of data is the lifeblood of the project. A Data Factory shall be maintained to orchestrate these complex data pipelines, ensuring that information flows reliably from its source to its destination."),
    iconName: 'law',
};

export { allArticles as CONSTITUTIONAL_ARTICLES };
