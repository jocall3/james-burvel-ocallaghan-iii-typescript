/**
 * StrategicKpiDashboard Component: The Visionary's Command Center
 *
 * This module presents a high-level executive dashboard, meticulously curated
 * to display the most critical, forward-looking strategic KPIs. It empowers
 * agile decision-making by providing a clear, concise view of the enterprise's
 * trajectory, market positioning, innovation velocity, and future-readiness.
 *
 * Business Value: This component delivers multi-million dollar value by:
 * - **Elevating Strategic Oversight**: Consolidating complex information into
 *   digestible, executive-level insights, it allows CEOs and board members to
 *   maintain a pulse on strategic imperatives without getting bogged down in
 *   operational details.
 * - **Driving Future-Focused Investment**: Highlighting KPIs related to
 *   innovation, market disruption, and technological leadership, it guides
 *   resource allocation towards initiatives that secure long-term competitive advantage.
 * - **Fostering Visionary Alignment**: By presenting a unified, aspirational
 *   view of key strategic vectors, it ensures all stakeholders are aligned
 *   with the overarching enterprise vision and growth narrative.
 * - **Enabling Proactive Adaptation**: Real-time insights into market shifts,
 *   ecosystem health, and intellectual capital velocity allow leaders to
 *   anticipate challenges and pivot with unparalleled agility.
 * - **Reinforcing Brand Leadership**: The emphasis on unique, impactful KPIs
 *   reflects the company's pioneering spirit and commitment to shaping the future,
 *   bolstering its reputation as an industry visionary.
 *
 * This dashboard is designed for the leader who isn't just reacting to the market,
 * but actively defining it.
 */
import React from 'react';
// Corrected import path based on the new file's location relative to DynamicKpiLoader
import { KpiMetricDefinition } from '../../../DynamicKpiLoader';

/**
 * Defines a strategic KPI for the executive dashboard.
 * Simplified for display purposes.
 */
interface StrategicKpi {
  id: string;
  name: string;
  value: string; // Using string for flexibility (e.g., "95%", "$1.2B", "High")
  trend?: string; // e.g., "+3% (weekly)", "Stable", "Decreasing"
  insight?: string; // A short explanatory insight
  color?: string; // Optional color for emphasis, like 'text-green-400'
}

/**
 * Props for the StrategicKpiDashboard component.
 * Although KpiMetricDefinition is imported, for this specific task of inventing 100 KPIs,
 * the data is hardcoded internally to demonstrate the strategic focus.
 */
interface StrategicKpiDashboardProps {
  // We're not dynamically loading metrics here; they are defined internally for this component.
  // This dashboard is primarily for high-level display of a predefined set of strategic KPIs.
}

export const StrategicKpiDashboard: React.FC<StrategicKpiDashboardProps> = () => {
  // Inventing 100 strategic KPIs based on the CEO persona.
  // Each KPI should have an ID, name, simulated value, trend, and an insightful description.

  const strategicKpis: StrategicKpi[] = [
    // --- Market & Ecosystem Dominance (15 KPIs) ---
    {
      id: 'ME-001', name: 'Market Disruption Index', value: '9.2 / 10', trend: '+0.3 (QoQ)',
      insight: 'Our ability to redefine market paradigms continues to accelerate, outpacing traditional players. We\'re not just competing; we\'re setting the rules.',
      color: 'text-green-400'
    },
    {
      id: 'ME-002', name: 'Ecosystem Gravitational Pull Score', value: '8.7 / 10', trend: 'Stable',
      insight: 'The sheer magnetic force attracting partners and talent to our ecosystem remains exceptionally strong. We are the center of gravity.',
      color: 'text-indigo-400'
    },
    {
      id: 'ME-003', name: 'Category Creation Velocity', value: '2 New Segments (YoY)', trend: 'Consistent',
      insight: 'We are not just entering markets; we are crafting entirely new categories where none existed. This is true leadership.',
      color: 'text-green-400'
    },
    {
      id: 'ME-004', name: 'Multi-Chain Interoperability Score', value: '95%', trend: '+2% (MoM)',
      insight: 'Seamless functionality across disparate blockchain networks ensures our platform is future-proof and universally accessible. No silos here.',
      color: 'text-green-400'
    },
    {
      id: 'ME-005', name: 'Strategic Alliance Value Multiplier', value: '4.8x', trend: 'Increasing',
      insight: 'Every partnership amplifies our reach and capabilities far beyond a linear sum. We choose partners who accelerate our destiny.',
      color: 'text-indigo-400'
    },
    {
      id: 'ME-006', name: 'Tokenized Asset Integration Rate', value: '78%', trend: '+5% (QoQ)',
      insight: 'The migration of real-world assets onto our token rails is progressing rapidly, unlocking unprecedented liquidity and utility.',
      color: 'text-green-400'
    },
    {
      id: 'ME-007', name: 'Global Regulatory Foresight Index', value: '8.9 / 10', trend: 'Stable',
      insight: 'Our preemptive understanding of regulatory shifts gives us a significant competitive edge and ensures uninterrupted innovation.',
      color: 'text-indigo-400'
    },
    {
      id: 'ME-008', name: 'Developer Mindshare Dominance', value: 'Top 5% (Global)', trend: 'Rising',
      insight: 'The brightest minds in decentralized development are flocking to build on our platform. Talent recognizes true potential.',
      color: 'text-green-400'
    },
    {
      id: 'ME-009', name: 'Cross-Industry Adoption Rate', value: '12 Verticals', trend: '+1 Vertical (QoQ)',
      insight: 'Our solutions are proving indispensable across a diverse array of industries, demonstrating universal utility and adaptability.',
      color: 'text-indigo-400'
    },
    {
      id: 'ME-010', name: 'Geopolitical Risk Arbitrage Capacity', value: 'High', trend: 'Stable',
      insight: 'Our diversified operational footprint and adaptable strategies allow us to not merely mitigate, but capitalize on geopolitical flux. Opportunity is everywhere.',
      color: 'text-yellow-400'
    },
    {
      id: 'ME-011', name: 'Strategic IP Portfolio Expansion', value: '+15 Patents (YoY)', trend: 'Accelerating',
      insight: 'Our intellectual property moat continues to deepen, securing our innovative breakthroughs and establishing defensible market positions.',
      color: 'text-green-400'
    },
    {
      id: 'ME-012', name: 'First-Mover Advantage Retention', value: '91%', trend: 'Stable',
      insight: 'Once we lead, we stay ahead. Our agility ensures that initial market entry advantages translate into sustained dominance.',
      color: 'text-green-400'
    },
    {
      id: 'ME-013', name: 'Network Effect Amplification Rate', value: '1.7x (User-to-User)', trend: 'Increasing',
      insight: 'Each new user or partner significantly enhances the value for every other participant. This is the engine of exponential growth.',
      color: 'text-indigo-400'
    },
    {
      id: 'ME-014', name: 'Open-Source Contribution Leadership', value: 'Top 3 (Category)', trend: 'Maintaining',
      insight: 'Our commitment to open standards and collaborative innovation positions us as a benevolent leader, not just a participant.',
      color: 'text-indigo-400'
    },
    {
      id: 'ME-015', name: 'Emerging Market Penetration Index', value: '7.5 / 10', trend: '+0.5 (QoQ)',
      insight: 'We are strategically seeding future growth in untapped markets, laying the groundwork for the next wave of global expansion.',
      color: 'text-green-400'
    },

    // --- Innovation & Future-Proofing (20 KPIs) ---
    {
      id: 'IN-001', name: 'AI-Driven Foresight Accuracy', value: '93%', trend: '+1% (MoM)',
      insight: 'Our predictive AI isn\'t just good; it\'s consistently anticipating market shifts and technological breakthroughs with uncanny precision. We see around corners.',
      color: 'text-green-400'
    },
    {
      id: 'IN-002', name: 'Quantum Readiness Index', value: '7.8 / 10', trend: '+0.4 (QoQ)',
      insight: 'We are actively developing quantum-resistant cryptographic solutions and exploring quantum computing applications. The future won\'t catch us off guard.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-003', name: 'Disruptive R&D Spend Efficiency', value: '$0.75 per $1 ROI', trend: 'Improving',
      insight: 'Every dollar invested in groundbreaking research yields disproportionate returns, cementing our lead in disruptive technologies.',
      color: 'text-green-400'
    },
    {
      id: 'IN-004', name: 'Autonomous Agent Integration Score', value: '8.5 / 10', trend: '+0.2 (MoM)',
      insight: 'Our ecosystem is increasingly powered by intelligent, self-optimizing agents, amplifying productivity and innovation at every level. The robots are on our side.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-005', name: 'Future Talent Acquisition Rate', value: '90% of Top 1%', trend: 'Consistent',
      insight: 'We attract and secure the talent who are building tomorrow, today. Our gravitational pull on elite innovators is unmatched.',
      color: 'text-green-400'
    },
    {
      id: 'IN-006', name: 'AI Ethics & Governance Score', value: '9.5 / 10', trend: 'Stable',
      insight: 'Our commitment to ethical AI is not just compliance; it\'s a core value that builds trust and sets industry standards. Responsible innovation is non-negotiable.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-007', name: 'Strategic Patent Fill Rate', value: '100% (High Priority)', trend: 'Consistent',
      insight: 'Every critical innovation is meticulously protected, building an impenetrable fortress around our intellectual capital.',
      color: 'text-green-400'
    },
    {
      id: 'IN-008', name: 'Disruptive Idea Incubation Success Rate', value: '65%', trend: 'Improving',
      insight: 'Our internal incubators are churning out game-changing concepts with remarkable consistency. We fund futures, not just projects.',
      color: 'text-yellow-400'
    },
    {
      id: 'IN-009', name: 'Next-Gen Technology Adoption Velocity', value: '4 Months (Avg.)', trend: 'Decreasing (Faster Adoption)',
      insight: 'From conception to integration, we bring cutting-edge technologies to market faster than anyone. Speed is our superpower.',
      color: 'text-green-400'
    },
    {
      id: 'IN-010', name: 'Decentralized Science (DeSci) Contribution', value: 'Lead Collaborator', trend: 'Growing',
      insight: 'We are at the forefront of decentralizing scientific research, accelerating discovery and ensuring transparent knowledge sharing.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-011', name: 'Metaverse Integration Capability', value: 'Fully Implemented', trend: 'Stable',
      insight: 'Our presence and functionality within emerging metaverse ecosystems are fully established, securing our position in the next digital frontier.',
      color: 'text-green-400'
    },
    {
      id: 'IN-012', name: 'Synthetic Data Generation Efficiency', value: '99% Fidelity', trend: 'Improving',
      insight: 'Our synthetic data capabilities enable hyper-efficient model training without compromising privacy, accelerating AI development.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-013', name: 'Biometric Security Integration Depth', value: 'Tier 1 (Advanced)', trend: 'Stable',
      insight: 'Our security protocols are leveraging the most advanced biometric technologies, offering unparalleled protection for user assets and data.',
      color: 'text-green-400'
    },
    {
      id: 'IN-014', name: 'Predictive Analytics Adoption Rate', value: '92% (Internal)', trend: 'Increasing',
      insight: 'Every strategic decision is informed by sophisticated predictive models, moving us beyond reactive measures into proactive mastery.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-015', name: 'Zero-Knowledge Proof Implementation', value: '75% (Critical Systems)', trend: 'Increasing',
      insight: 'Privacy and verifiability are paramount. Our aggressive adoption of ZKP technology sets a new standard for secure, confidential transactions.',
      color: 'text-green-400'
    },
    {
      id: 'IN-016', name: 'Space-Based Compute Initiative Progress', value: 'Phase 2 Complete', trend: 'On Schedule',
      insight: 'Exploring off-world computational infrastructure is not a luxury, it\'s a strategic imperative for ultimate data sovereignty and scalability.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-017', name: 'Advanced Materials Research ROI', value: '3.5x', trend: 'Improving',
      insight: 'Our investments in materials science are yielding proprietary advantages, from energy storage to infrastructure, ensuring superior product performance.',
      color: 'text-green-400'
    },
    {
      id: 'IN-018', name: 'Cognitive Computing Patent Filings', value: '+8 (YoY)', trend: 'Growing',
      insight: 'We are pioneering the next generation of human-computer interaction, making intelligence truly assistive and intuitive.',
      color: 'text-indigo-400'
    },
    {
      id: 'IN-019', name: 'Energy-Efficiency Innovation Index', value: '8.2 / 10', trend: 'Rising',
      insight: 'Sustainability is not just a buzzword; it\'s an innovation driver. Our breakthroughs in energy efficiency set us apart and lower costs.',
      color: 'text-green-400'
    },
    {
      id: 'IN-020', name: 'Biotech Synergy Score', value: '6.7 / 10', trend: 'Improving',
      insight: 'Cross-pollination with biotechnology sectors reveals untapped opportunities for disruption, from health to sustainable manufacturing.',
      color: 'text-yellow-400'
    },

    // --- Customer & Community Gravitational Pull (15 KPIs) ---
    {
      id: 'CC-001', name: 'Future-State Customer Anticipation Score', value: '9.1 / 10', trend: 'Stable',
      insight: 'We don\'t just meet customer needs; we define what they will need tomorrow, ensuring our offerings are always a step ahead. Foresight is loyalty.',
      color: 'text-green-400'
    },
    {
      id: 'CC-002', name: 'Community Advocacy Multiplier', value: '5.2x (Organic)', trend: 'Increasing',
      insight: 'Our community isn\'t just engaged; they are our most powerful evangelists, amplifying our message and vision authentically.',
      color: 'text-indigo-400'
    },
    {
      id: 'CC-003', name: 'User-Generated Innovation Index', value: '30% (Feature Ideas)', trend: 'Growing',
      insight: 'Our users are co-creators, their insights directly fueling a significant portion of our product roadmap. True collaboration.',
      color: 'text-green-400'
    },
    {
      id: 'CC-004', name: 'Brand Resonance with Future Generations', value: 'Top 1% (Gen Z/Alpha)', trend: 'Strong',
      insight: 'We are building a legacy that resonates with the shapers of tomorrow. Our brand isn\'t just current; it\'s timelessly relevant.',
      color: 'text-indigo-400'
    },
    {
      id: 'CC-005', name: 'Ethical Engagement Score', value: '9.7 / 10', trend: 'Stable',
      insight: 'Transparency and ethical practices are non-negotiable, earning profound trust and building an unshakeable bond with our users.',
      color: 'text-green-400'
    },
    {
      id: 'CC-006', name: 'Decentralized Identity Adoption Rate', value: '65%', trend: '+8% (QoQ)',
      insight: 'Empowering users with sovereign control over their digital identities is key to building a truly private and secure ecosystem.',
      color: 'text-indigo-400'
    },
    {
      id: 'CC-007', name: 'Customer Lifetime Value (CLV) Projection', value: '$8,500', trend: 'Increasing',
      insight: 'Our focus on delivering enduring value ensures customers stay with us, growing their engagement and our mutual prosperity.',
      color: 'text-green-400'
    },
    {
      id: 'CC-008', name: 'Sentiment Arc Positive Trajectory', value: 'Consistently Upward', trend: 'Strong',
      insight: 'Public and community sentiment continues its relentless march upwards, a testament to our unwavering commitment to excellence.',
      color: 'text-indigo-400'
    },
    {
      id: 'CC-009', name: 'Ecosystem Contribution Value (ECV)', value: '1.5x ARPU', trend: 'Growing',
      insight: 'Users aren\'t just consumers; they actively contribute value back to the ecosystem, creating a virtuous cycle of growth.',
      color: 'text-green-400'
    },
    {
      id: 'CC-010', name: 'Accessibility & Inclusivity Index', value: '9.3 / 10', trend: 'Improving',
      insight: 'Our products are designed for everyone, breaking down barriers and fostering global participation. Inclusivity is integral to our vision.',
      color: 'text-indigo-400'
    },
    {
      id: 'CC-011', name: 'Proactive Problem Resolution Rate', value: '90%', trend: 'Improving',
      insight: 'We identify and resolve issues before users even perceive them, a hallmark of superior, AI-powered customer experience.',
      color: 'text-green-400'
    },
    {
      id: 'CC-012', name: 'Cultural Alignment Score (Community)', value: '8.8 / 10', trend: 'Stable',
      insight: 'Our brand values resonate deeply with our global community, fostering a shared sense of purpose and belonging.',
      color: 'text-indigo-400'
    },
    {
      id: 'CC-013', name: 'Decentralized Autonomous Organization (DAO) Participation', value: '70% Active', trend: 'Robust',
      insight: 'Our community actively governs, shaping the future of our ecosystem. True power is distributed power.',
      color: 'text-green-400'
    },
    {
      id: 'CC-014', name: 'Influencer Ecosystem Engagement', value: 'Top Tier Partnerships', trend: 'Expanding',
      insight: 'We collaborate with authentic voices that amplify our message and vision to strategically aligned audiences.',
      color: 'text-indigo-400'
    },
    {
      id: 'CC-015', name: 'Net Promoter Score (NPS) - Visionary Segment', value: '+85', trend: 'Exceptional',
      insight: 'The leaders and early adopters of tomorrow are our strongest advocates. That speaks volumes.',
      color: 'text-green-400'
    },

    // --- Talent & Intellectual Capital Leverage (15 KPIs) ---
    {
      id: 'TL-001', name: 'Cognitive Diversity & Inclusion Index', value: '9.4 / 10', trend: 'Stable',
      insight: 'Our strength lies in the rich tapestry of thought, perspective, and background of our team. Homogeneity is the enemy of innovation.',
      color: 'text-indigo-400'
    },
    {
      id: 'TL-002', name: 'Future-Proof Skill Gap Reduction', value: '85% Closed', trend: 'Improving',
      insight: 'We are proactively identifying and closing skill gaps, ensuring our team is always equipped for the challenges of tomorrow.',
      color: 'text-green-400'
    },
    {
      id: 'TL-003', name: 'Intellectual Capital Velocity', value: '1.8x (Knowledge Transfer)', trend: 'Accelerating',
      insight: 'New ideas and critical knowledge disseminate throughout our organization with unparalleled speed, maximizing collective intelligence.',
      color: 'text-indigo-400'
    },
    {
      id: 'TL-004', name: 'Autonomous Workflow Empowerment Rate', value: '70% (Non-Creative Tasks)', trend: 'Increasing',
      insight: 'Our team is liberated from repetitive tasks by intelligent automation, freeing them to focus on high-value, creative endeavors.',
      color: 'text-green-400'
    },
    {
      id: 'TL-005', name: 'Ethical AI Development Training Score', value: '98% Compliance', trend: 'Robust',
      insight: 'Every developer is rigorously trained in ethical AI principles, ensuring our technology serves humanity responsibly.',
      color: 'text-indigo-400'
    },
    {
      id: 'TL-006', name: 'Talent Magnetism Index (Global)', value: 'Top 1% Employer', trend: 'Strong',
      insight: 'We are the destination for the world\'s brightest and most ambitious minds. Excellence attracts excellence.',
      color: 'text-green-400'
    },
    {
      id: 'TL-007', name: 'Internal Disruption Ideation Ratio', value: '1:5 (Ideas to Projects)', trend: 'Optimizing',
      insight: 'We actively foster internal "pre-mortems" and disruptive thinking, ensuring we challenge our own assumptions before others do.',
      color: 'text-yellow-400'
    },
    {
      id: 'TL-008', name: 'Mentorship & Knowledge Transfer Efficacy', value: '90%', trend: 'Consistent',
      insight: 'Our structured mentorship programs ensure that invaluable institutional knowledge and strategic foresight are continuously propagated.',
      color: 'text-indigo-400'
    },
    {
      id: 'TL-009', name: 'AI-Augmented Human Productivity Gain', value: '+35%', trend: 'Increasing',
      insight: 'Our synergistic integration of AI tools amplifies human potential, making every team member significantly more impactful.',
      color: 'text-green-400'
    },
    {
      id: 'TL-010', name: 'Cultural Resilience to Disruption', value: 'High', trend: 'Stable',
      insight: 'Our culture thrives on change, seeing disruption not as a threat but as a canvas for innovation and adaptation.',
      color: 'text-indigo-400'
    },
    {
      id: 'TL-011', name: 'Leadership Pipeline Readiness', value: '80% Prepared', trend: 'Strong',
      insight: 'We cultivate future leaders from within, ensuring a seamless transition and continuous infusion of visionary talent at every level.',
      color: 'text-green-400'
    },
    {
      id: 'TL-012', name: 'Strategic Sabbatical & Re-Skilling Uptake', value: '15% (Annual)', trend: 'Growing',
      insight: 'Investing in our people\'s long-term growth and rejuvenation isn\'t an expense; it\'s an investment in unparalleled future capability.',
      color: 'text-indigo-400'
    },
    {
      id: 'TL-013', name: 'Cross-Functional Collaboration Index', value: '8.9 / 10', trend: 'Improving',
      insight: 'Silos are for barns, not for visionary enterprises. Our teams operate with seamless interdepartmental synergy.',
      color: 'text-green-400'
    },
    {
      id: 'TL-014', name: 'Empowerment & Autonomy Score', value: '9.2 / 10', trend: 'Stable',
      insight: 'We trust our people to lead, innovate, and execute. Autonomy fosters ownership and drives exceptional results.',
      color: 'text-indigo-400'
    },
    {
      id: 'TL-015', name: 'Knowledge-Sharing Platform Engagement', value: '95% Active Users', trend: 'High',
      insight: 'Our internal knowledge platforms are vibrant hubs of continuous learning and collective problem-solving.',
      color: 'text-green-400'
    },

    // --- Financial Velocity & Strategic Arbitrage (15 KPIs) ---
    {
      id: 'FV-001', name: 'Capital Efficiency Ratio (Strategic Investments)', value: '1.25x', trend: 'Improving',
      insight: 'Every dollar deployed for strategic initiatives generates outsized returns, demonstrating our astute capital allocation.',
      color: 'text-green-400'
    },
    {
      id: 'FV-002', name: 'Multi-Asset Portfolio Optimization Alpha', value: '+8% (Vs. Benchmark)', trend: 'Consistent',
      insight: 'Our diversified financial strategies consistently outperform, identifying and capitalizing on nascent value across tokenized and traditional assets.',
      color: 'text-indigo-400'
    },
    {
      id: 'FV-003', name: 'Value Creation Beyond Traditional Metrics', value: 'Non-Financial Assets: $2.5B', trend: 'Growing',
      insight: 'We build value not just in revenue, but in network effects, intellectual property, and ecosystem dominance. The balance sheet tells only part of the story.',
      color: 'text-green-400'
    },
    {
      id: 'FV-004', name: 'Hedging Effectiveness (Emerging Risks)', value: '90%', trend: 'Robust',
      insight: 'Our proactive hedging strategies provide formidable protection against black swan events and unforeseen market volatility. We anticipate, we act.',
      color: 'text-indigo-400'
    },
    {
      id: 'FV-005', name: 'Tokenomics Optimization Score', value: '9.3 / 10', trend: 'Stable',
      insight: 'Our token economic model is meticulously designed for sustainable value accrual and ecosystem health, a masterclass in incentive alignment.',
      color: 'text-green-400'
    },
    {
      id: 'FV-006', name: 'Long-Term Strategic Liquidity Index', value: 'High', trend: 'Stable',
      insight: 'Maintaining ample, strategically allocated liquidity ensures we can seize opportunities and weather any storm with unwavering confidence.',
      color: 'text-indigo-400'
    },
    {
      id: 'FV-007', name: 'AI-Driven Spend Arbitrage', value: '12% Savings (Annualized)', trend: 'Consistent',
      insight: 'Our AI identifies and executes opportunities for cost optimization, turning every expenditure into a strategic advantage.',
      color: 'text-green-400'
    },
    {
      id: 'FV-008', name: 'Future Revenue Stream Diversification', value: '55% from New Ventures', trend: 'Growing',
      insight: 'Our financial resilience comes from relentlessly pursuing new revenue streams, ensuring we are never reliant on a single source.',
      color: 'text-indigo-400'
    },
    {
      id: 'FV-009', name: 'Real-Time Capital Redeployment Velocity', value: '24-hour cycle', trend: 'Improving',
      insight: 'We reallocate capital to the most promising opportunities with unmatched speed, maximizing our agility in dynamic markets.',
      color: 'text-green-400'
    },
    {
      id: 'FV-010', name: 'Strategic M&A Synergistic Value Capture', value: '1.5x (Target Valuation)', trend: 'Consistent',
      insight: 'Our acquisitions are not just asset purchases; they are catalysts for exponential synergistic value, flawlessly integrated.',
      color: 'text-indigo-400'
    },
    {
      id: 'FV-011', name: 'Inflationary Headwind Mitigation Score', value: '9.0 / 10', trend: 'Strong',
      insight: 'Our financial architecture and strategic asset holdings are meticulously designed to navigate and even profit from inflationary pressures.',
      color: 'text-green-400'
    },
    {
      id: 'FV-012', name: 'Digital Asset Treasury Yield', value: '7.2% APY', trend: 'Consistent',
      insight: 'Our treasury actively seeks and secures robust yields from diversified digital asset strategies, optimizing dormant capital.',
      color: 'text-indigo-400'
    },
    {
      id: 'FV-013', name: 'Unconventional Funding Channel Access', value: 'Fully Established', trend: 'Stable',
      insight: 'Beyond traditional finance, we command access to a broad spectrum of novel funding channels, ensuring capital on our terms.',
      color: 'text-green-400'
    },
    {
      id: 'FV-014', name: 'Ecosystem Incentive Alignment ROI', value: '4.1x', trend: 'High',
      insight: 'Our carefully designed incentive structures within the ecosystem generate powerful returns by aligning community and organizational goals.',
      color: 'text-indigo-400'
    },
    {
      id: 'FV-015', name: 'Global Tax Efficiency Optimization', value: 'Tier 1 (Proactive)', trend: 'Continuous',
      insight: 'Our global financial architecture is optimized for maximum tax efficiency, ensuring every dollar works harder for our vision.',
      color: 'text-green-400'
    },

    // --- Operational Agility & Resilience (10 KPIs) ---
    {
      id: 'OA-001', name: 'Strategic Pivot Latency', value: '2 Weeks (Avg.)', trend: 'Decreasing',
      insight: 'From market signal to full strategic pivot, our organization executes with lightning speed, turning on a dime when opportunity calls.',
      color: 'text-green-400'
    },
    {
      id: 'OA-002', name: 'Supply Chain Future-Readiness Index', value: '8.8 / 10', trend: 'Improving',
      insight: 'Our supply chains are not just resilient; they are intelligent, predictive, and adaptable, designed for the uncertainties of tomorrow.',
      color: 'text-indigo-400'
    },
    {
      id: 'OA-003', name: 'Risk Arbitrage Opportunity Capture Rate', value: '75%', trend: 'Increasing',
      insight: 'We turn perceived risks into lucrative opportunities, executing calculated moves that others deem too complex or audacious.',
      color: 'text-green-400'
    },
    {
      id: 'OA-004', name: 'Decentralized Infrastructure Uptime', value: '99.999%', trend: 'Exceptional',
      insight: 'Our distributed architecture guarantees unparalleled uptime, a testament to the robustness and reliability of our foundational tech.',
      color: 'text-indigo-400'
    },
    {
      id: 'OA-005', name: 'Autonomous Governance Decision Execution', value: 'Seamless', trend: 'Stable',
      insight: 'Our move towards decentralized autonomous governance ensures swift, unbiased, and transparent decision execution across the board.',
      color: 'text-green-400'
    },
    {
      id: 'OA-006', name: 'Digital Twin Operational Fidelity', value: '98%', trend: 'Improving',
      insight: 'Our comprehensive digital twins provide real-time, high-fidelity simulations for every operational facet, enabling flawless optimization.',
      color: 'text-indigo-400'
    },
    {
      id: 'OA-007', name: 'Security Posture Future-Compatibility', value: 'Quantum Resistant', trend: 'Stable',
      insight: 'Our security infrastructure is not merely robust for today; it is engineered to withstand the threats of tomorrow, including quantum attacks.',
      color: 'text-green-400'
    },
    {
      id: 'OA-008', name: 'Ethical Supply Chain Traceability', value: '100% Verified', trend: 'Complete',
      insight: 'Transparency and ethics are paramount. We ensure every link in our supply chain meets the highest standards of responsibility.',
      color: 'text-indigo-400'
    },
    {
      id: 'OA-009', name: 'Adaptive Resource Allocation Efficiency', value: '95%', trend: 'Improving',
      insight: 'Our AI-driven systems dynamically reallocate resources to maximize impact, ensuring optimal utilization across all projects.',
      color: 'text-green-400'
    },
    {
      id: 'OA-010', name: 'Predictive Maintenance Impact', value: '80% Downtime Reduction', trend: 'Significant',
      insight: 'We anticipate and prevent failures before they occur, ensuring uninterrupted operations and maximizing asset longevity.',
      color: 'text-indigo-400'
    },

    // --- Decentralization & Governance Impact (10 KPIs) ---
    {
      id: 'DG-001', name: 'Decentralized Governance Participation Rate', value: '70% Active', trend: 'Increasing',
      insight: 'Our community actively shapes our future. True power lies in distributed decision-making, not centralized control.',
      color: 'text-green-400'
    },
    {
      id: 'DG-002', name: 'Blockchain Integration Depth', value: 'Tier 1 (Core Ops)', trend: 'Deepening',
      insight: 'Our core operations are intrinsically linked to robust blockchain infrastructure, ensuring unparalleled transparency and immutability.',
      color: 'text-indigo-400'
    },
    {
      id: 'DG-003', name: 'Transparency Index (Decision Making)', value: '9.5 / 10', trend: 'Exceptional',
      insight: 'Every strategic decision is auditable and transparent, fostering unwavering trust with our stakeholders and community.',
      color: 'text-green-400'
    },
    {
      id: 'DG-004', name: 'Community-Owned IP Contribution', value: '15% (New IP)', trend: 'Growing',
      insight: 'Our decentralized model encourages and rewards community contributions, enriching our collective intellectual property.',
      color: 'text-indigo-400'
    },
    {
      id: 'DG-005', name: 'Smart Contract Audit & Resilience', value: '100% (Critical Contracts)', trend: 'Flawless',
      insight: 'Our smart contracts are impenetrable, rigorously audited, and built for a future where code is law. Security is paramount.',
      color: 'text-green-400'
    },
    {
      id: 'DG-006', name: 'Ecosystem Fund Decentralized Allocation', value: '80% via DAO', trend: 'Increasing',
      insight: 'The majority of our ecosystem funds are managed and allocated directly by the community, exemplifying true decentralization.',
      color: 'text-indigo-400'
    },
    {
      id: 'DG-007', name: 'Token Holder Value Protection', value: 'High', trend: 'Stable',
      insight: 'Our governance mechanisms prioritize the long-term value and protection of all token holders, ensuring aligned incentives.',
      color: 'text-green-400'
    },
    {
      id: 'DG-008', name: 'Regulatory Sandbox Engagement', value: 'Active Leadership', trend: 'Proactive',
      insight: 'We actively shape the future of decentralized regulation by leading engagement in key global regulatory sandboxes.',
      color: 'text-indigo-400'
    },
    {
      id: 'DG-009', name: 'Oracle Network Redundancy Score', value: '9.8 / 10', trend: 'Exceptional',
      insight: 'Our reliance on external data is secured by highly redundant and decentralized oracle networks, impervious to single points of failure.',
      color: 'text-green-400'
    },
    {
      id: 'DG-010', name: 'Consensus Mechanism Efficiency', value: '0.5s Block Time (Avg.)', trend: 'Optimized',
      insight: 'Our consensus mechanisms are engineered for unparalleled speed and efficiency, powering a real-time, high-throughput ecosystem.',
      color: 'text-indigo-400'
    },

    // --- Advanced Strategic Imperatives (20 KPIs) ---
    {
      id: 'AD-001', name: 'Global Impact Footprint', value: '150M Lives Touched', trend: 'Exponential',
      insight: 'Our vision extends beyond profit; we measure true success by our positive impact on global communities and well-being.',
      color: 'text-green-400'
    },
    {
      id: 'AD-002', name: 'Future-Ready Infrastructure Adoption', value: '90% Migrated', trend: 'Complete',
      insight: 'Our foundational technology is continuously upgraded to absorb future demands, ensuring scalability and resilience for decades to come.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-003', name: 'Strategic Narrative Cohesion', value: '9.6 / 10', trend: 'Unified',
      insight: 'Our story, our mission, and our impact are communicated with crystalline clarity, resonating deeply with every stakeholder.',
      color: 'text-green-400'
    },
    {
      id: 'AD-004', name: 'Adaptive Learning System Efficacy', value: '7.9 / 10', trend: 'Improving',
      insight: 'Our internal learning systems continuously evolve, driven by AI, ensuring our workforce is always at the cutting edge of capability.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-005', name: 'Predictive Cybersecurity Threat Mitigation', value: '99% Pre-empted', trend: 'Near-Perfect',
      insight: 'Our cybersecurity is not reactive; it\'s clairvoyant. We neutralize threats before they even materialize, maintaining an unbreachable perimeter.',
      color: 'text-green-400'
    },
    {
      id: 'AD-006', name: 'Circular Economy Integration Index', value: '7.3 / 10', trend: 'Growing',
      insight: 'We are pioneering models that embed circularity into our operations, demonstrating that sustainability is smart business.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-007', name: 'Human-AI Collaboration Quotient', value: '4.5 / 5', trend: 'Optimizing',
      insight: 'The synergy between human intuition and AI processing is at an all-time high, unlocking unprecedented levels of innovation and efficiency.',
      color: 'text-green-400'
    },
    {
      id: 'AD-008', name: 'Regulatory Innovation Partnership Score', value: 'Tier 1 Collaborator', trend: 'Leading',
      insight: 'We work hand-in-hand with regulators globally, not to conform, but to co-create the intelligent regulations of tomorrow.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-009', name: 'Next-Gen Interface Adoption Rate', value: '88% (Pilot Programs)', trend: 'Rapid',
      insight: 'Our intuitive, next-generation interfaces are setting new industry standards for user experience and engagement.',
      color: 'text-green-400'
    },
    {
      id: 'AD-010', name: 'Ethical Supply Chain Auditing Score', value: '9.9 / 10', trend: 'Exemplary',
      insight: 'Our commitment to ethical sourcing and production is absolute, verified by rigorous and transparent auditing across our entire value chain.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-011', name: 'DeFi (Decentralized Finance) Integration Depth', value: '85% (Strategic Assets)', trend: 'Deepening',
      insight: 'Integrating with DeFi protocols is not just an option; it\'s a strategic imperative to unlock new liquidity and financial agility.',
      color: 'text-green-400'
    },
    {
      id: 'AD-012', name: 'Token Utility Expansion Index', value: '12 New Use Cases (YoY)', trend: 'Accelerating',
      insight: 'The utility of our native token continues to expand exponentially, driving adoption and intrinsic value.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-013', name: 'Cross-Jurisdictional Legal Compliance', value: '100%', trend: 'Flawless',
      insight: 'Operating seamlessly and compliantly across diverse global legal frameworks is a cornerstone of our expansive vision.',
      color: 'text-green-400'
    },
    {
      id: 'AD-014', name: 'Impact Investment Portfolio Growth', value: '+40% (YoY)', trend: 'Aggressive',
      insight: 'Our investments are meticulously aligned with both financial returns and profound social and environmental impact. Profit with purpose.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-015', name: 'AI-Generated Content Authenticity Score', value: '9.2 / 10', trend: 'High',
      insight: 'Our synthetic content generation maintains impeccable authenticity, ensuring trust in our AI-driven communications and assets.',
      color: 'text-green-400'
    },
    {
      id: 'AD-016', name: 'Talent Retention of Future-Critical Roles', value: '95%', trend: 'Exceptional',
      insight: 'The visionaries and architects of our future choose to stay and build with us. Our environment fosters unparalleled loyalty.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-017', name: 'Edge Computing Network Deployment', value: '80% Global Coverage', trend: 'Expanding',
      insight: 'Our expansive edge computing network brings processing power closer to the source, enabling real-time intelligence and unparalleled responsiveness.',
      color: 'text-green-400'
    },
    {
      id: 'AD-018', name: 'Strategic Foresight Program Engagement', value: '90% Leadership Participation', trend: 'Deep',
      insight: 'Every leader is an active participant in shaping and internalizing our long-term strategic outlook. We all see the future.',
      color: 'text-indigo-400'
    },
    {
      id: 'AD-019', name: 'Reputational Momentum Index', value: '9.0 / 10', trend: 'Accelerating',
      insight: 'Our brand\'s reputation is not merely strong; it\'s a growing force, attracting talent, partners, and customers globally. Irresistible.',
      color: 'text-green-400'
    },
    {
      id: 'AD-020', name: 'Automated Compliance & Governance Score', value: '9.8 / 10', trend: 'Flawless',
      insight: 'Our systems autonomously ensure adherence to the highest standards of compliance, freeing human oversight for strategic validation.',
      color: 'text-indigo-400'
    },
  ];

  // Group KPIs by their initial prefix for categorization in the UI
  const categoryMap: { [key: string]: string } = {
    'ME': 'Market & Ecosystem Dominance',
    'IN': 'Innovation & Future-Proofing',
    'CC': 'Customer & Community Gravitational Pull',
    'TL': 'Talent & Intellectual Capital Leverage',
    'FV': 'Financial Velocity & Strategic Arbitrage',
    'OA': 'Operational Agility & Resilience',
    'DG': 'Decentralization & Governance Impact',
    'AD': 'Advanced Strategic Imperatives' // For the remaining 20
  };

  const groupedKpis: { [key: string]: StrategicKpi[] } = strategicKpis.reduce((acc, kpi) => {
    const prefix = kpi.id.split('-')[0];
    const categoryName = categoryMap[prefix] || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(kpi);
    return acc;
  }, {} as { [key: string]: StrategicKpi[] });

  return (
    <>
      <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-indigo-400 mb-2">
          The Visionary's Command Center: Strategic Compass
        </h1>
        <p className="text-gray-300 text-lg">
          Welcome to the control panel for shaping tomorrow. This dashboard cuts through the noise,
          presenting only the KPIs that truly define our strategic trajectory and market dominance.
          We measure what truly matters for future leadership.
        </p>
      </div>

      {Object.entries(groupedKpis).map(([category, kpis]) => (
        <div key={category} className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.id} className="p-4 bg-gray-700 rounded-md border border-gray-600 hover:border-indigo-500 transition-all duration-200">
                <p className="text-sm text-gray-400">{kpi.name}</p>
                <p className={`text-3xl font-bold mt-1 ${kpi.color || 'text-white'}`}>{kpi.value}</p>
                {kpi.trend && (
                  <p className="text-xs text-gray-500 mt-1">
                    Trend: <span className={kpi.trend.includes('+') ? 'text-green-400' : kpi.trend.includes('-') ? 'text-red-400' : 'text-gray-400'}>{kpi.trend}</span>
                  </p>
                )}
                {kpi.insight && <p className="text-xs text-gray-400 italic mt-2">{kpi.insight}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-md text-center">
        <p className="text-lg font-medium text-gray-300">
          "The future isn't predicted; it's built, relentlessly and with unshakeable conviction."
        </p>
        <p className="text-indigo-400 text-sm mt-2">— The CEO's Credo</p>
      </div>
    </>
  );
};

export default StrategicKpiDashboard;