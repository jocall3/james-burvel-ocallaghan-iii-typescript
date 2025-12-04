import React, { useState, useEffect, useRef, useCallback } from 'react';
// The original import for Card and GoogleGenAI are replaced with local implementations
// to make the file self-contained as per instructions.

// --- Local Card Component (replaces external dependency) ---
interface LocalCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    expanded?: boolean; // New prop for collapsible cards
    onToggleExpand?: () => void; // New prop for collapsible cards
}
const LocalCard: React.FC<LocalCardProps> = ({ title, children, className, expanded = true, onToggleExpand }) => (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 ${className || ''}`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            {onToggleExpand && (
                <button onClick={onToggleExpand} className="text-gray-400 hover:text-white transition-colors duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {expanded ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        )}
                    </svg>
                </button>
            )}
        </div>
        {expanded && children}
    </div>
);

// --- Mock GoogleGenAI (replaces external dependency) ---
// This class simulates the behavior of the Google GenAI SDK without
// making actual network requests, allowing the application to be self-contained.
export class MockGenerativeModel {
    private modelName: string;
    constructor(modelName: string) {
        this.modelName = modelName;
    }

    async generateContent(params: { model: string; contents: string }): Promise<{ text: string }> {
        // Simulate different responses based on prompts to create dynamic interaction
        const prompt = params.contents.toLowerCase();
        let response = `(Mock AI response from ${this.modelName} for: "${prompt.substring(0, Math.min(prompt.length, 100))}...")\n\n`;

        // Extensive conditional logic to provide varied and detailed mock responses
        if (prompt.includes('graphene battery anode limitations')) {
            response = 'Graphene anodes suffer from significant volume expansion during lithiation/delithiation cycles, leading to structural degradation and pulverization. This destabilizes the Solid Electrolyte Interphase (SEI), resulting in continuous electrolyte consumption and irreversible capacity loss. Furthermore, intrinsic limitations in Li+ diffusion kinetics at high current densities hinder rapid charging. Strategies to mitigate these issues include doping with heteroatoms, surface functionalization with polymers or oxides, and forming composites with mechanically robust materials.';
        } else if (prompt.includes('novel, testable hypothesis to mitigate this issue')) {
            response = 'Hypothesis: Incorporating a few-layer boron nitride nanosheet (BNNS) interlayered structure within a nitrogen-doped (N-doped) graphene anode composite will significantly enhance anode stability and electrochemical performance. The BNNS interlayer will act as a mechanical buffer, suppressing graphene pulverization, while the N-doping will provide more active sites for Li+ intercalation, improving kinetics and overall capacity retention. This architecture is hypothesized to reduce volume expansion by >20% and improve cycle life by >30% over N-doped graphene alone. Target property: Anode Stability & Cycle Life. Predicted effect: Reduced volume expansion by 25%, improved capacity retention by 35% after 500 cycles.';
        } else if (prompt.includes('design a molecular dynamics simulation')) {
            response = 'Simulation Design: Utilize LAMMPS (Large-scale Atomic/Molecular Massively Parallel Simulator) for Molecular Dynamics (MD) simulations. The system will comprise an N-doped graphene lattice, with a defined percentage of nitrogen substitutions (e.g., 3-5 at.%), and vertically aligned BNNS interlayers. Li+ ions and a model electrolyte (e.g., ethylene carbonate/dimethyl carbonate) will be included. Key parameters to vary: N-doping concentration (range: 0.01 to 0.08), BNNS layer thickness (range: 1 to 5 layers) and spacing (range: 0.5 to 2 nm), and temperature (298-333 K). Metrics to measure: lattice strain evolution during Li+ intercalation, Li+ diffusion coefficient, binding energy of Li+ to active sites, and structural integrity after multiple simulated cycles. Compare results against pristine graphene and only N-doped graphene models. The output will include atomic trajectories, energy profiles, and mean square displacement calculations. Associated API calls: simulationEngine.runMolecularDynamics, labRobotics.characterizeMaterial (TEM for morphology, XRD for structure).';
        } else if (prompt.includes('simulated experiment results')) {
             response = 'Simulated Experiment Results Summary: The MD simulations revealed that the N-doped graphene with BNNS interlayers exhibited a remarkable 28.5% reduction in average lattice strain compared to N-doped graphene without BNNS after 200 simulated lithiation cycles. The Li+ diffusion coefficient in the composite structure was measured at 0.35 x 10^-7 cmÂ²/s, a 20% increase over the N-doped counterpart, attributed to optimized diffusion pathways. Capacity retention after 500 equivalent cycles was projected at 91%, far surpassing the 75% for N-doped graphene. These findings strongly suggest improved durability and enhanced kinetics.';
        } else if (prompt.includes('brief abstract summarizing our experiment')) {
            response = 'Abstract: This computational study explores a novel anode material strategy for lithium-ion batteries, integrating nitrogen-doped graphene with boron nitride nanosheet interlayers. Through molecular dynamics simulations, we demonstrate that this composite architecture significantly mitigates lattice strain (28.5% reduction) and enhances Li+ diffusion kinetics (20% increase) compared to conventional N-doped graphene. The projected electrochemical performance indicates superior cycle life and stability, positioning this design as a promising candidate for next-generation high-performance battery anodes. Our findings underscore the critical role of multi-material heterostructures in overcoming inherent limitations of 2D materials.';
        } else if (prompt.includes('break down the goal')) {
            response = `Sub-objectives for "${params.contents.replace('break down the goal: ', '')}":\n1. Conduct an exhaustive literature review on current battery anode materials and their limitations.\n2. Propose novel material hypotheses based on identified challenges and opportunities.\n3. Design and simulate computational experiments (MD, DFT, electrochemical models) to test hypotheses.\n4. Analyze simulation data to extract key performance metrics and structural insights.\n5. Refine hypotheses and experimental designs iteratively based on results.\n6. Synthesize promising materials (simulated) and characterize their properties.\n7. Generate a comprehensive scientific report detailing findings, conclusions, and future directions.`;
        } else if (prompt.includes('material properties of')) {
            const material = prompt.match(/material properties of ([\w\s]+)/)?.[1] || 'unknown material';
            const randomDensity = (Math.random() * 5 + 1).toFixed(2);
            const randomConductivity = (Math.random() * 1000 + 10).toFixed(2);
            const randomBandGap = (Math.random() * 5).toFixed(2);
            const randomStrength = (Math.random() * 100 + 10).toFixed(2);
            response = `Simulated properties for ${material}:\n- Density: ${randomDensity} g/cmÂ³\n- Electrical Conductivity: ${randomConductivity} S/cm\n- Band Gap: ${randomBandGap} eV\n- Mechanical Strength: ${randomStrength} GPa.\nThese values are based on typical ranges for similar materials and adjusted for potential doping effects.`;
        } else if (prompt.includes('propose a new material candidate')) {
            response = 'New Material Candidate: Lithium Manganese Iron Phosphate (LMFP) doped with Vanadium (V) and coated with a thin layer of reduced Graphene Oxide (rGO). Rationale: LMFP offers high voltage, good safety, and abundant elements; V-doping enhances intrinsic conductivity and rate capability; rGO coating improves electronic pathways and mitigates capacity fade from particle aggregation. This combination aims for a cathode with superior energy density, power density, and cycle stability.';
        } else if (prompt.includes('optimal synthesis parameters for')) {
            const material = prompt.match(/optimal synthesis parameters for ([\w\s]+)/)?.[1] || 'unknown material';
            response = `Optimal synthesis parameters for ${material} via a solvothermal route:\n- Temperature: 180-220Â°C\n- Duration: 18-24 hours\n- Solvent: N,N-dimethylformamide (DMF) or ethanol/water mixture\n- Precursor ratios: Specific to desired stoichiometry (e.g., Li:Mn:Fe:P = 1:0.5:0.5:1, V = 2% molar)\n- Post-annealing: 700Â°C for 5h under reducing (Ar/H2) atmosphere to enhance crystallinity and remove residual carbon.`;
        } else if (prompt.includes('identify key experimental metrics')) {
            response = 'Key Experimental Metrics for Battery Anodes:\n1. Specific Capacity (mAh/g): Initial and reversible capacity.\n2. Initial Coulombic Efficiency (%): Ratio of discharge to charge capacity in the first cycle.\n3. Cycle Life (Capacity Retention over cycles): Percentage of initial capacity retained after a specified number of cycles (e.g., 500, 1000).\n4. Rate Capability: Capacity performance at various C-rates (e.g., 0.1C, 0.5C, 1C, 2C).\n5. Impedance Spectroscopy (EIS): To analyze charge transfer resistance and SEI properties.\n6. Volume Expansion (%): Measured via operando techniques.\n7. Structural Integrity: Monitored with XRD, TEM, SEM post-cycling.';
        } else if (prompt.includes('analyze simulated data for trends')) {
             response = 'Data Analysis Result: A clear inverse relationship was identified between BNNS interlayer thickness and observed lattice strain, with optimal performance at 2-3 layers. Higher N-doping concentrations (above 5 at.%) showed marginal improvements in Li+ diffusion but led to increased defect formation and localized strain points. The analysis suggests a sweet spot for both BNNS content and N-doping to achieve maximum benefit, with a trade-off between kinetics and structural robustness. Specific capacity appears to peak at an intermediate doping level.';
        } else if (prompt.includes('refine hypothesis')) {
            response = 'Refined Hypothesis: The optimal nitrogen doping concentration for graphene-BNNS composites for battery anodes should be precisely tuned between 3-4 at.% with 2-3 BNNS interlayers to achieve the best balance of enhanced Li+ diffusion kinetics and long-term structural integrity. Further refinement could explore surface functionalization of BNNS or graphene edges with electron-donating groups to further reduce interfacial impedance. Target property: Optimized Battery Performance. Predicted effect: Maximize capacity retention while ensuring fast charging capability.';
        } else if (prompt.includes('generate comprehensive report')) {
            response = `Comprehensive Report Summary: This research cycle successfully demonstrated the efficacy of a BNNS-interlayered, N-doped graphene composite for advanced Li-ion battery anodes. Key findings include improved strain resilience, superior Li+ diffusivity, and projected enhanced cycle life. Recommendations for future work involve optimizing doping profiles and exploring alternative intercalation chemistries.\n\nAbstract:\nThis report details an autonomous research campaign targeting novel high-performance battery anode materials. Utilizing a multi-stage AI agent, the research explored N-doped graphene/BNNS composites through advanced computational simulations...\n\nIntroduction:\nThe demand for high energy density and long-lasting batteries necessitates the discovery of next-generation electrode materials...\n\nHypotheses:\n1. N-doped graphene with BNNS interlayers will improve cycle life.\n2. Specific doping concentrations optimize Li+ kinetics.\n\nMethodology & Experiments:\nPerformed MD and DFT simulations on various composite configurations. Material characterization was simulated...\n\nResults:\nSimulations confirmed reduced strain (28.5%) and enhanced Li+ diffusion (20%). Capacity retention projected at 91%...\n\nDiscussion:\nThe findings validate the initial hypothesis, highlighting the synergistic effects of doping and nanostructuring...\n\nConclusion:\nN-doped graphene/BNNS composites represent a significant advancement for Li-ion anodes, offering improved stability and kinetics...\n\nFuture Work:\nExplore different heteroatom dopants, optimize synthesis parameters, and conduct full-cell simulations.\n\nCitations:\n[1] A. Smith et al., "Graphene Degradation Mechanisms," J. Mat. Sci., 2020.\n[2] B. Jones et al., "Boron Nitride in Batteries," Adv. Energy Mat., 2021.`;
        } else if (prompt.includes('identify potential safety risks')) {
            response = 'Potential Safety Risks:\n1. Thermal Runaway: Exacerbated by dendrite formation on the anode, leading to short circuits and exothermic reactions.\n2. Electrolyte Decomposition: High voltages or temperatures can cause irreversible breakdown of the electrolyte, generating flammable gases.\n3. Material Toxicity: Some precursor chemicals used in synthesis (e.g., nitrogen sources) or byproducts might be toxic.\n4. Mechanical Stress: Swelling and contraction of anode materials can lead to cell casing rupture.\n5. Overcharging/Overdischarging: Can lead to irreversible damage, gas generation, or thermal events.';
        } else if (prompt.includes('suggest characterization techniques')) {
            response = 'Suggested Characterization Techniques:\n- X-ray Diffraction (XRD): For crystal structure, phase identification, and lattice parameter determination.\n- Transmission Electron Microscopy (TEM) / Scanning Electron Microscopy (SEM): For morphology, particle size, and elemental mapping (EDX).\n- X-ray Photoelectron Spectroscopy (XPS): For surface elemental composition and chemical states (e.g., confirming N-doping).\n- Cyclic Voltammetry (CV) / Galvanostatic Charge-Discharge (GCD) / Electrochemical Impedance Spectroscopy (EIS): For comprehensive electrochemical performance assessment.\n- Raman Spectroscopy: To assess carbon lattice quality, defects, and doping effects.\n- Thermogravimetric Analysis (TGA): To evaluate thermal stability and composition.';
        } else if (prompt.includes('design a new experiment based on')) {
            response = `New Experiment Design: Design an *operando* X-ray Diffraction (XRD) experiment to directly monitor the structural evolution of the N-doped graphene/BNNS composite anode during lithiation/delithiation cycles. This will provide real-time insight into lattice strain, phase transitions, and volume changes. Parameters: Synchrotron light source, C-rate 0.1C to 1C, temperature range 25-50Â°C. Complement with *ex-situ* TEM/SEM analysis after 100 and 500 cycles to observe morphological changes and SEI stability. Associated API calls: labRobotics.characterizeMaterial.`;
        } else if (prompt.includes('evaluate simulated cost implications')) {
            response = 'Simulated Cost Implications: The introduction of boron nitride nanosheets adds an estimated 15-25% to the raw material cost per kg of anode material, depending on the synthesis route for BNNS. However, the projected 30% improvement in cycle life and capacity retention could lead to a 10-15% reduction in the total cost of ownership over the battery\'s lifespan, due to increased durability and fewer replacement cycles. Production scale-up of BNNS remains a key cost challenge.';
        } else if (prompt.includes('predict performance under extreme conditions')) {
            response = 'Performance Prediction under Extreme Conditions:\n- Extreme Cold (-20Â°C): Predicted to retain ~70% of room temperature capacity at 0.1C due to reduced Li+ kinetics and increased electrolyte viscosity. Internal resistance will increase by ~30%.\n- High Heat (60Â°C): Predicted to maintain >90% capacity retention at 0.5C, but accelerated SEI growth and potential electrolyte decomposition are concerns over extended cycling. Close monitoring for thermal runaway indicators is essential.\n- High C-Rate (5C): Expected to deliver ~60% of 0.1C capacity, demonstrating decent power capability but with increased polarization.';
        } else if (prompt.includes('formulate a counter-hypothesis')) {
            response = 'Counter-Hypothesis: The observed reduction in lattice strain in the N-doped graphene/BNNS composite is primarily a physical stiffening effect from the inert BNNS layers, which merely delays fracture rather than enhancing fundamental electrochemical activity. This suggests the composite might achieve mechanical stability but without significant improvements in intrinsic specific capacity or charge transfer beyond simple N-doping, potentially leading to lower practical energy densities if the BNNS layers are too thick or dense. Target property: Electrochemical Activity. Predicted effect: No significant improvement in intrinsic capacity beyond N-doping.';
        } else if (prompt.includes('critique the experimental setup')) {
            response = 'Critique of Experimental Setup: While the MD simulations provided valuable insights into strain and diffusion, they simplify the complex electrochemical environment. Key limitations include:\n1. Simplified Electrolyte Model: A more realistic electrolyte model, incorporating ionic liquids or solid electrolytes, would better capture interfacial phenomena.\n2. SEI Formation: The dynamic and heterogeneous formation of the Solid Electrolyte Interphase (SEI) was not fully captured, which is critical for long-term stability.\n3. Quantum Effects: MD is classical; quantum effects, especially at interfaces, might play a role not accounted for.\n4. Scale: Atomistic simulations are limited to nanoscale; mesoscale or continuum models would be needed for larger structures.';
        } else if (prompt.includes('suggest optimization strategies')) {
             response = 'Optimization Strategies: \n1. Bayesian Optimization: For intelligently exploring the multi-dimensional parameter space (N-doping, BNNS thickness, electrolyte composition) to find optimal material configurations. \n2. Genetic Algorithms: To evolve material compositions and nanostructures for improved performance against defined fitness functions (e.g., high capacity, long cycle life). \n3. Active Learning: Integrating simulation results with machine learning models to guide subsequent simulations and reduce computational cost.';
        } else if (prompt.includes('material selection criteria for anode')) {
             response = 'Material Selection Criteria for Anodes:\n1. High Theoretical Specific Capacity: To maximize energy density.\n2. Low Volume Expansion: To ensure structural stability during cycling.\n3. Good Li+ Diffusion Kinetics: For high power density and fast charging.\n4. Stable Solid Electrolyte Interphase (SEI) Formation: To prevent continuous electrolyte consumption and improve safety.\n5. Low Average Operating Voltage vs. Li/Li+: To maximize cell voltage.\n6. Abundance and Low Cost of Constituent Elements: For commercial viability.\n7. Good Electronic Conductivity: To minimize internal resistance.\n8. Safety: Non-toxic, thermally stable.';
        } else if (prompt.includes('explain the phenomenon of')) {
            const phenomenon = prompt.match(/explain the phenomenon of ([\w\s]+)\./)?.[1] || 'an unspecified scientific phenomenon';
            if (phenomenon.includes('dendrite formation')) {
                response = 'Dendrite formation in lithium-ion batteries refers to the uncontrolled, tree-like growth of metallic lithium on the anode surface, typically during charging. This occurs when Li+ ions plate unevenly onto the anode, often at defects or areas of high current density. Dendrites can pierce the separator, leading to internal short circuits, thermal runaway, and ultimately cell failure. It\'s a major safety concern, especially with high-capacity anodes.';
            } else if (phenomenon.includes('solid electrolyte interphase')) {
                response = 'The Solid Electrolyte Interphase (SEI) is a passivating layer formed on the surface of the anode (and sometimes cathode) of a lithium-ion battery during the initial charge-discharge cycles. It results from the decomposition of electrolyte components due to their electrochemical instability at the electrode surface. A stable SEI is crucial for battery performance as it allows Li+ ions to pass through while preventing further electrolyte decomposition, thereby protecting the electrode and ensuring long cycle life. An unstable SEI can lead to continuous growth, consuming active lithium and electrolyte, and causing capacity fade.';
            } else {
                response = `Simulated explanation for ${phenomenon}: This phenomenon is complex and involves interactions at multiple scales. In essence, it describes the process where X leads to Y, often mediated by Z. Further research is needed for a comprehensive understanding.`;
            }
        } else if (prompt.includes('draft a patent application')) {
            response = `Patent Application Draft (Title: "Novel N-Doped Graphene/BNNS Composite Anode for Lithium-Ion Batteries"):
Abstract: A novel anode material for lithium-ion batteries comprising nitrogen-doped graphene sheets intercalated with boron nitride nanosheets. The composite structure provides enhanced mechanical stability, suppressed volume expansion during lithiation, and improved Li+ diffusion kinetics, leading to superior cycle life and capacity retention.
Background: Current graphene-based anodes face challenges with structural degradation and SEI instability...
Description: The invention describes a multi-layered composite...
Claims: 1. A battery anode material comprising N-doped graphene and BNNS layers... 2. The material of claim 1, wherein N-doping concentration is between 3-4 at.%...`;
        } else if (prompt.includes('write a grant proposal')) {
            response = `Grant Proposal Draft (Title: "Accelerating Next-Gen Anode Development with Autonomous AI"):
Project Summary: This proposal outlines a novel approach to accelerate the discovery and optimization of advanced battery anode materials through an AI-driven autonomous scientific research platform. We will focus on N-doped graphene/BNNS composites, leveraging advanced simulations and AI-guided experimental design to overcome current limitations in energy density and cycle life.
Specific Aims: 1. Develop a high-fidelity computational model for Li+ transport in heterostructures. 2. Synthesize and characterize novel N-doped graphene/BNNS composites. 3. Optimize material parameters using AI-driven active learning.
Budget Request: $500,000 for personnel, computational resources, and mock lab supplies.`;
        } else if (prompt.includes('peer review')) {
            response = 'Peer Review Report: Overall, the manuscript presents compelling computational evidence for the benefits of N-doped graphene/BNNS composites. The MD simulations are well-designed, and the analysis of strain reduction and Li+ diffusion is thorough. Major points for revision: 1. Clarify the synthesis scalability challenges. 2. Add more discussion on the trade-offs between N-doping and structural integrity. 3. Expand on potential environmental impacts. Minor points: Check for consistent terminology throughout.';
        } else if (prompt.includes('allocate resources')) {
            response = 'Resource Allocation Plan: Project "High-Performance Anode Materials": Allocate 60% of compute cycles to MD simulations, 20% to DFT, 10% to electrochemical modeling. Budget: $30,000 for computational licenses, $15,000 for simulated lab time (synthesis & characterization), $5,000 for administrative overhead. Personnel: Assign Lead Scientist AI for hypothesis generation, Simulation AI for model execution, Analysis AI for data interpretation.';
        } else if (prompt.includes('define a new research project')) {
            response = 'New Project Definition: Project Name: "High-Temperature Solid Electrolytes for All-Solid-State Batteries". Goal: Discover and optimize novel solid electrolyte materials (e.g., garnet-type, argyrodite) with ionic conductivity >10^-3 S/cm at 100Â°C and high electrochemical stability against Li metal. Key challenges: Interface resistance, mechanical properties, synthesis scalability. Expected duration: 12 months.';
        } else if (prompt.includes('synthesize a novel catalyst')) {
            response = 'Synthesis Recipe: For a novel MoS2-graphene heterostructure catalyst via hydrothermal method: Precursors: Ammonium heptamolybdate, thiourea, graphene oxide. Solvent: Deionized water. Conditions: 200Â°C, 24 hours, Teflon-lined autoclave. Post-processing: Annealing at 500Â°C under H2/Ar for 2 hours to reduce graphene oxide and enhance crystallinity. Goal: High surface area and abundant active sites for oxygen reduction reaction.';
        } else if (prompt.includes('quantum mechanics simulation for band gap')) {
            response = 'Quantum Mechanics Simulation Design (DFT): Utilize VASP for Density Functional Theory calculations. Material: Proposed N-doped graphene. Calculation: Geometry optimization, electronic band structure, and density of states (DOS) calculations. Parameters: PBE functional, plane-wave cutoff energy 500 eV, k-point mesh 11x11x1, spin-polarized calculations enabled for potential magnetic effects. Target: Precisely determine the band gap and identify changes due to N-doping. Associated API calls: simulationEngine.runDFT.';
        } else if (prompt.includes('predict long-term degradation')) {
            response = 'Long-term Degradation Prediction: Material: N-doped graphene/BNNS composite anode. Prediction: Over 1000 cycles, expected capacity fade of 15% (after initial ~5% irreversible loss). Primary degradation mechanisms: gradual structural degradation of graphene layers, slow accumulation of irreversible SEI species, and minor BNNS delamination at high stress points. Mitigation strategies: develop self-healing polymer binders, optimized electrolyte additives, and protective coatings.';
        } else if (prompt.includes('identify key performance indicators for a project')) {
             response = 'Key Performance Indicators (KPIs) for Project "High-Performance Anode Materials":\n1. Material Performance: Achieved specific capacity (mAh/g), cycle life (cycles to 80% capacity retention), rate capability (capacity at 5C).\n2. Project Efficiency: Number of hypotheses tested per month, simulation cost per experiment ($), time to market (simulated).\n3. Safety & Scalability: Thermal stability index (Â°C), predicted manufacturing cost (USD/kg), environmental impact score.\n4. Intellectual Property: Number of patent applications filed, potential licensing opportunities.';
        }

        // Add some variability and simulated processing time
        await new Promise(r => setTimeout(r, Math.random() * 1000 + 500));
        return { text: response };
    }
}

export class MockGoogleGenAI {
    public models: {
        generateContent: (params: { model: string; contents: string }) => Promise<{ text: string }>;
    };

    constructor(params: { apiKey: string }) {
        // API Key is ignored for mock purposes
        this.models = {
            generateContent: (params) => new MockGenerativeModel(params.model).generateContent(params),
        };
    }
}
// END Mock GoogleGenAI

// --- Data Structures for the Autonomous Scientist ---

export enum ResearchPhase {
    IDLE = 'IDLE',
    GOAL_DEFINITION = 'GOAL_DEFINITION',
    LITERATURE_REVIEW = 'LITERATURE_REVIEW',
    HYPOTHESIS_GENERATION = 'HYPOTHESIS_GENERATION',
    EXPERIMENT_DESIGN = 'EXPERIMENT_DESIGN',
    SIMULATION_EXECUTION = 'SIMULATION_EXECUTION',
    DATA_ANALYSIS = 'DATA_ANALYSIS',
    HYPOTHESIS_REFINEMENT = 'HYPOTHESIS_REFINEMENT',
    REPORT_GENERATION = 'REPORT_GENERATION',
    ITERATION_CYCLE = 'ITERATION_CYCLE', // Represents a full loop
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    SELF_CORRECTION = 'SELF_CORRECTION',
    RESOURCE_MANAGEMENT = 'RESOURCE_MANAGEMENT',
    PROJECT_SETUP = 'PROJECT_SETUP',
    IP_MANAGEMENT = 'IP_MANAGEMENT', // New phase for Intellectual Property
    GRANT_APPLICATION = 'GRANT_APPLICATION', // New phase for Grant applications
    PEER_REVIEW = 'PEER_REVIEW', // New phase for peer review simulation
    PUBLICATION_STRATEGY = 'PUBLICATION_STRATEGY', // New phase for publication decision
    RISK_ASSESSMENT = 'RISK_ASSESSMENT', // New phase for evaluating risks
    ECONOMIC_EVALUATION = 'ECONOMIC_EVALUATION', // New phase for economic viability
}

export interface MaterialProperty {
    name: string;
    value: number | string | boolean;
    unit?: string;
    description?: string;
    source?: 'simulated' | 'experimental' | 'literature' | 'predicted';
    timestamp?: string; // When this property was observed/simulated
}

export interface MaterialComposition {
    elements: { [key: string]: number }; // e.g., { 'Li': 1, 'Mn': 2, 'O': 4 }
    structure?: string; // e.g., 'layered', 'spinel', 'graphene heterostructure'
    dopants?: { [key: string]: number }; // e.g., { 'N': 0.05 } for 5% nitrogen doping
    nanostructure?: string; // e.g., 'nanosheets', 'nanoparticles', 'quantum dots'
}

export interface Material {
    id: string;
    name: string;
    composition: MaterialComposition;
    properties: MaterialProperty[];
    discoveryDate: string;
    synthesisMethod?: string;
    potentialApplications: string[];
    stabilityScore?: number; // 0-100
    performanceScore?: number; // 0-100
    riskScore?: number; // 0-100 (higher = more risk)
    costScore?: number; // 0-100 (higher = more expensive)
}

export interface Hypothesis {
    id: string;
    text: string;
    targetProperty: string; // e.g., 'battery capacity', 'strength'
    predictedEffect: string;
    evidence: string[]; // references to literature or previous experiments
    status: 'proposed' | 'tested' | 'supported' | 'refuted' | 'refined' | 'pending_retest' | 'superseded';
    priority: 'high' | 'medium' | 'low';
    formulationDate: string;
    parentHypothesisId?: string; // If refined from another hypothesis
}

export interface ExperimentParameter {
    name: string;
    value: number | string | boolean;
    unit?: string;
    range?: [number, number]; // For parameter sweeps
    optimizationTarget?: 'maximize' | 'minimize' | 'stabilize';
    description?: string;
}

export interface Experiment {
    id: string;
    name: string;
    type: 'simulation' | 'synthesis' | 'characterization' | 'validation' | 'optimization' | 'protocol_design' | 'modeling'; // Added more types
    hypothesisId: string; // The hypothesis this experiment aims to test
    materialId?: string; // The material being tested/synthesized
    parameters: ExperimentParameter[];
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'aborted';
    results: ExperimentResult | null;
    designRationale: string;
    costEstimate: number; // simulated cost in USD
    timeEstimate: number; // simulated hours
    priority: 'high' | 'medium' | 'low';
    associatedAPICalls: string[]; // e.g., ['runMolecularDynamics', 'characterizeMaterial']
    executionDate?: string;
    completionDate?: string;
    preRequisiteExperiments?: string[]; // IDs of experiments that must complete first
}

export interface ExperimentResultMetric {
    name: string;
    value: number | string;
    unit?: string;
    deviation?: number; // from expected
    trend?: 'increasing' | 'decreasing' | 'stable' | 'anomalous';
    interpretation?: string;
    confidenceLevel?: number; // 0-1
}

export interface ExperimentResult {
    id: string;
    experimentId: string;
    dataPoints: { [key: string]: number[] | string[] }; // e.g., { 'cycle_number': [...], 'capacity': [...] }
    metrics: ExperimentResultMetric[];
    analysisSummary: string;
    rawLog?: string; // Simulated raw output from a computational engine or lab instrument
    interpretation: string;
    conclusion: 'supported' | 'refuted' | 'inconclusive' | 'partial_support' | 'new_insight';
    confidenceScore: number; // 0-1
    generatedVisualizations?: { type: 'chart' | 'graph' | 'image', dataUrl: string, title: string }[]; // Mocked visualization data
}

export interface AgentDecision {
    timestamp: string;
    phase: ResearchPhase;
    description: string;
    details: any;
    outcome?: 'success' | 'failure' | 'neutral' | 'pivot';
    reasoning?: string;
    decisionMetrics?: { name: string, value: any }[]; // Metrics considered for decision
}

export interface ResearchReport {
    id: string;
    title: string;
    author: string; // 'Autonomous Scientist'
    date: string;
    abstract: string;
    introduction: string;
    hypotheses: Hypothesis[];
    experiments: Experiment[];
    resultsSummary: string;
    discussion: string;
    conclusion: string;
    futureWork: string;
    citations: string[];
    generatedByAI: boolean;
    recommendations: string[];
    safetyAssessment?: ExperimentResultMetric[];
    economicAnalysis?: ExperimentResultMetric[];
}

export interface LogEntry {
    type: 'thought' | 'action' | 'result' | 'error' | 'warning';
    content: string;
    timestamp?: string;
}

export interface PatentApplication {
    id: string;
    title: string;
    abstract: string;
    claims: string[];
    status: 'draft' | 'filed' | 'pending_review' | 'granted' | 'rejected';
    filingDate: string;
    inventors: string[]; // 'Autonomous Scientist AI'
    associatedMaterials: string[]; // material IDs
}

export interface GrantProposal {
    id: string;
    title: string;
    summary: string;
    specificAims: string[];
    budgetRequest: number; // USD
    status: 'draft' | 'submitted' | 'under_review' | 'funded' | 'rejected';
    submissionDate: string;
    fundingAgency?: string;
    currentFunding?: number; // if funded, how much received
}

export interface PublicationArticle {
    id: string;
    title: string;
    journal: string;
    status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published' | 'rejected';
    submissionDate: string;
    abstract: string;
    keywords: string[];
    doi?: string;
    citations?: string[];
}

export interface ResearchProject {
    id: string;
    name: string;
    goal: string;
    status: 'active' | 'completed' | 'on_hold' | 'failed' | 'archived';
    startDate: string;
    endDate?: string;
    currentBudget: number;
    initialBudget: number;
    kpis: { name: string, target: number | string, current: number | string, unit?: string }[];
    teamMembers: string[]; // e.g., ['Autonomous Scientist AI', 'Simulation AI']
    focusMaterial?: string; // ID of the primary material being researched
}

// --- Simulated Database / Knowledge Base ---
export class MaterialDatabase {
    private static materials: Material[] = [
        {
            id: 'mat-001', name: 'Graphene', composition: { elements: { 'C': 1 }, structure: '2D sheet', nanostructure: 'nanosheet' },
            properties: [{ name: 'Density', value: 2.2, unit: 'g/cmÂ³' }, { name: 'Conductivity', value: 10000, unit: 'S/cm' }, { name: 'Band Gap', value: 0, unit: 'eV' }],
            discoveryDate: '2004-10-22', synthesisMethod: 'Mechanical exfoliation, CVD', potentialApplications: ['batteries', 'composites', 'electronics'], stabilityScore: 70, performanceScore: 65, riskScore: 20, costScore: 40,
        },
        {
            id: 'mat-002', name: 'Lithium Cobalt Oxide (LCO)', composition: { elements: { 'Li': 1, 'Co': 1, 'O': 2 }, structure: 'layered' },
            properties: [{ name: 'Density', value: 4.9, unit: 'g/cmÂ³' }, { name: 'Theoretical Capacity', value: 274, unit: 'mAh/g' }, { name: 'Voltage Range', value: '3.6-4.2', unit: 'V' }],
            discoveryDate: '1980-01-01', synthesisMethod: 'Solid-state reaction', potentialApplications: ['cathode material', 'portable electronics'], stabilityScore: 80, performanceScore: 75, riskScore: 60, costScore: 80,
        },
        {
            id: 'mat-003', name: 'Boron Nitride Nanosheets (BNNS)', composition: { elements: { 'B': 1, 'N': 1 }, structure: '2D sheet', nanostructure: 'nanosheet' },
            properties: [{ name: 'Density', value: 2.2, unit: 'g/cmÂ³' }, { name: 'Thermal Conductivity', value: 2000, unit: 'W/mK' }, { name: 'Band Gap', value: 5.9, unit: 'eV' }],
            discoveryDate: '1990-01-01', synthesisMethod: 'Chemical Vapor Deposition', potentialApplications: ['dielectrics', 'composites', 'thermal management'], stabilityScore: 90, performanceScore: 50, riskScore: 10, costScore: 70,
        },
        {
            id: 'mat-004', name: 'Silicon Anode', composition: { elements: { 'Si': 1 } },
            properties: [{ name: 'Theoretical Capacity', value: 4200, unit: 'mAh/g' }, { name: 'Volume Expansion', value: 300, unit: '%' }],
            discoveryDate: '1980-01-01', synthesisMethod: 'Various', potentialApplications: ['high-capacity anodes'], stabilityScore: 40, performanceScore: 90, riskScore: 80, costScore: 30,
        },
        {
            id: 'mat-005', name: 'Lithium Iron Phosphate (LFP)', composition: { elements: { 'Li': 1, 'Fe': 1, 'P': 1, 'O': 4 }, structure: 'olivine' },
            properties: [{ name: 'Voltage', value: 3.3, unit: 'V' }, { name: 'Safety', value: 'High' }],
            discoveryDate: '1997-01-01', synthesisMethod: 'Hydrothermal, Solid-state', potentialApplications: ['cathode material', 'EV batteries'], stabilityScore: 95, performanceScore: 60, riskScore: 20, costScore: 45,
        },
        {
            id: 'mat-006', name: 'Nickel-Manganese-Cobalt (NMC) 811', composition: { elements: { 'Ni': 0.8, 'Mn': 0.1, 'Co': 0.1, 'O': 2 }, structure: 'layered' },
            properties: [{ name: 'Energy Density', value: 250, unit: 'Wh/kg' }, { name: 'Cycle Stability', value: 'Moderate' }],
            discoveryDate: '2015-01-01', synthesisMethod: 'Co-precipitation', potentialApplications: ['EV batteries', 'high energy cathodes'], stabilityScore: 75, performanceScore: 85, riskScore: 70, costScore: 90,
        },
        {
            id: 'mat-007', name: 'Tin Sulfide (SnS2)', composition: { elements: { 'Sn': 1, 'S': 2 }, structure: 'layered' },
            properties: [{ name: 'Band Gap', value: 2.2, unit: 'eV' }, { name: 'Theoretical Capacity', value: 645, unit: 'mAh/g' }],
            discoveryDate: '2000-01-01', synthesisMethod: 'Hydrothermal', potentialApplications: ['anode material', 'photocatalysis'], stabilityScore: 60, performanceScore: 70, riskScore: 40, costScore: 50,
        },
        {
            id: 'mat-008', name: 'Perovskite (CH3NH3PbI3)', composition: { elements: { 'C': 1, 'H': 3, 'N': 1, 'Pb': 1, 'I': 3 }, structure: 'perovskite' },
            properties: [{ name: 'Power Conversion Efficiency', value: 25, unit: '%' }, { name: 'Band Gap', value: 1.57, unit: 'eV' }],
            discoveryDate: '2009-01-01', synthesisMethod: 'Solution processing', potentialApplications: ['solar cells', 'LEDs'], stabilityScore: 30, performanceScore: 90, riskScore: 90, costScore: 60,
        },
        {
            id: 'mat-009', name: 'Sodium-ion Battery Cathode (NaxMnO2)', composition: { elements: { 'Na': 0.7, 'Mn': 1, 'O': 2 }, structure: 'layered' },
            properties: [{ name: 'Voltage', value: 2.7, unit: 'V' }, { name: 'Cost', value: 'Low' }],
            discoveryDate: '2010-01-01', synthesisMethod: 'Solid-state', potentialApplications: ['sodium-ion batteries'], stabilityScore: 80, performanceScore: 60, riskScore: 30, costScore: 20,
        },
        {
            id: 'mat-010', name: 'Solid Electrolyte (LLZO)', composition: { elements: { 'Li': 7, 'La': 3, 'Zr': 2, 'O': 12 }, structure: 'garnet' },
            properties: [{ name: 'Ionic Conductivity', value: 1e-4, unit: 'S/cm' }, { name: 'Electrochemical Stability', value: 'High' }],
            discoveryDate: '2007-01-01', synthesisMethod: 'Solid-state reaction', potentialApplications: ['solid-state batteries'], stabilityScore: 90, performanceScore: 70, riskScore: 25, costScore: 75,
        },
        // Adding more diverse materials for richer simulation data
        { id: 'mat-011', name: 'Titanium Dioxide (TiO2)', composition: { elements: { 'Ti': 1, 'O': 2 } }, properties: [{ name: 'Band Gap', value: 3.2, unit: 'eV' }], discoveryDate: '1910-01-01', potentialApplications: ['pigments', 'photocatalysis', 'anodes'], stabilityScore: 90, performanceScore: 40, riskScore: 15, costScore: 10, },
        { id: 'mat-012', name: 'Molybdenum Disulfide (MoS2)', composition: { elements: { 'Mo': 1, 'S': 2 }, structure: '2D sheet' }, properties: [{ name: 'Band Gap', value: 1.8, unit: 'eV' }], discoveryDate: '1960-01-01', potentialApplications: ['lubricants', 'electronics', 'batteries'], stabilityScore: 75, performanceScore: 60, riskScore: 30, costScore: 55, },
        { id: 'mat-013', name: 'MXene (Ti3C2Tx)', composition: { elements: { 'Ti': 3, 'C': 2 } }, properties: [{ name: 'Conductivity', value: 7000, unit: 'S/cm' }], discoveryDate: '2011-01-01', potentialApplications: ['supercapacitors', 'batteries'], stabilityScore: 65, performanceScore: 80, riskScore: 40, costScore: 65, },
        { id: 'mat-014', name: 'Lithium Sulfide (Li2S)', composition: { elements: { 'Li': 2, 'S': 1 } }, properties: [{ name: 'Theoretical Capacity', value: 1166, unit: 'mAh/g' }], discoveryDate: '1980-01-01', potentialApplications: ['Li-S batteries (cathode)'], stabilityScore: 50, performanceScore: 85, riskScore: 70, costScore: 50, },
        { id: 'mat-015', name: 'Black Phosphorus', composition: { elements: { 'P': 1 }, structure: '2D sheet' }, properties: [{ name: 'Band Gap', value: 0.3, unit: 'eV' }], discoveryDate: '1865-01-01', potentialApplications: ['transistors', 'batteries'], stabilityScore: 45, performanceScore: 75, riskScore: 60, costScore: 70, },
        { id: 'mat-016', name: 'Graphitic Carbon Nitride (g-C3N4)', composition: { elements: { 'C': 3, 'N': 4 }, structure: '2D sheet' }, properties: [{ name: 'Band Gap', value: 2.7, unit: 'eV' }], discoveryDate: '1990-01-01', potentialApplications: ['photocatalysis', 'energy storage'], stabilityScore: 80, performanceScore: 55, riskScore: 20, costScore: 35, },
        { id: 'mat-017', name: 'Vanadium Oxide (V2O5)', composition: { elements: { 'V': 2, 'O': 5 } }, properties: [{ name: 'Capacity', value: 294, unit: 'mAh/g' }], discoveryDate: '1830-01-01', potentialApplications: ['cathodes', 'supercapacitors'], stabilityScore: 70, performanceScore: 60, riskScore: 30, costScore: 40, },
        { id: 'mat-018', name: 'Zinc Oxide (ZnO)', composition: { elements: { 'Zn': 1, 'O': 1 } }, properties: [{ name: 'Band Gap', value: 3.37, unit: 'eV' }], discoveryDate: '1800-01-01', potentialApplications: ['electronics', 'sensors'], stabilityScore: 90, performanceScore: 30, riskScore: 10, costScore: 15, },
        { id: 'mat-019', name: 'Iron Sulfide (FeS2)', composition: { elements: { 'Fe': 1, 'S': 2 } }, properties: [{ name: 'Theoretical Capacity', value: 894, unit: 'mAh/g' }], discoveryDate: '1700-01-01', potentialApplications: ['secondary batteries'], stabilityScore: 60, performanceScore: 70, riskScore: 45, costScore: 25, },
        { id: 'mat-020', name: 'Aluminum (Al)', composition: { elements: { 'Al': 1 } }, properties: [{ name: 'Density', value: 2.7, unit: 'g/cmÂ³' }], discoveryDate: '1825-01-01', potentialApplications: ['current collectors', 'structural'], stabilityScore: 99, performanceScore: 10, riskScore: 5, costScore: 5, },
    ];

    private static patents: PatentApplication[] = [];
    private static grants: GrantProposal[] = [];
    private static publications: PublicationArticle[] = [];

    static async fetchMaterialById(id: string): Promise<Material | undefined> {
        await new Promise(r => setTimeout(r, 50 + Math.random() * 50)); // Simulate async
        return MaterialDatabase.materials.find(m => m.id === id);
    }

    static async searchMaterials(query: string, limit: number = 10): Promise<Material[]> {
        await new Promise(r => setTimeout(r, 100 + Math.random() * 100)); // Simulate async
        const lowerQuery = query.toLowerCase();
        return MaterialDatabase.materials
            .filter(m =>
                m.name.toLowerCase().includes(lowerQuery) ||
                m.potentialApplications.some(app => app.toLowerCase().includes(lowerQuery)) ||
                Object.keys(m.composition.elements).some(el => el.toLowerCase().includes(lowerQuery)) ||
                (m.composition.dopants && Object.keys(m.composition.dopants).some(d => d.toLowerCase().includes(lowerQuery))) ||
                (m.composition.structure && m.composition.structure.toLowerCase().includes(lowerQuery))
            )
            .slice(0, limit);
    }

    static async addMaterial(material: Material): Promise<void> {
        await new Promise(r => setTimeout(r, 20));
        if (!MaterialDatabase.materials.find(m => m.id === material.id)) {
            MaterialDatabase.materials.push(material);
        } else {
            // console.warn(`Material with ID ${material.id} already exists.`);
            // Update existing material if it's new information
            const index = MaterialDatabase.materials.findIndex(m => m.id === material.id);
            MaterialDatabase.materials[index] = { ...MaterialDatabase.materials[index], ...material };
        }
    }

    static async updateMaterial(material: Material): Promise<void> {
        await new Promise(r => setTimeout(r, 20));
        const index = MaterialDatabase.materials.findIndex(m => m.id === material.id);
        if (index !== -1) {
            MaterialDatabase.materials[index] = { ...MaterialDatabase.materials[index], ...material };
        } else {
            throw new Error(`Material with ID ${material.id} not found for update.`);
        }
    }

    static async getAllMaterials(): Promise<Material[]> {
        await new Promise(r => setTimeout(r, 50));
        return [...MaterialDatabase.materials];
    }

    // --- Patent Management ---
    static async filePatent(patent: PatentApplication): Promise<PatentApplication> {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
        const newPatent = { ...patent, id: `pat-${Date.now()}`, filingDate: new Date().toISOString().split('T')[0], status: 'filed' as const };
        MaterialDatabase.patents.push(newPatent);
        return newPatent;
    }

    static async getPatentsByMaterial(materialId: string): Promise<PatentApplication[]> {
        await new Promise(r => setTimeout(r, 100));
        return MaterialDatabase.patents.filter(p => p.associatedMaterials.includes(materialId));
    }

    static async getAllPatents(): Promise<PatentApplication[]> {
        await new Promise(r => setTimeout(r, 100));
        return [...MaterialDatabase.patents];
    }

    // --- Grant Management ---
    static async submitGrant(grant: GrantProposal): Promise<GrantProposal> {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
        const newGrant = { ...grant, id: `grant-${Date.now()}`, submissionDate: new Date().toISOString().split('T')[0], status: 'submitted' as const };
        MaterialDatabase.grants.push(newGrant);
        return newGrant;
    }

    static async getAllGrants(): Promise<GrantProposal[]> {
        await new Promise(r => setTimeout(r, 100));
        return [...MaterialDatabase.grants];
    }

    // --- Publication Management ---
    static async submitPublication(publication: PublicationArticle): Promise<PublicationArticle> {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        const newPub = { ...publication, id: `pub-${Date.now()}`, submissionDate: new Date().toISOString().split('T')[0], status: 'submitted' as const };
        MaterialDatabase.publications.push(newPub);
        return newPub;
    }

    static async getAllPublications(): Promise<PublicationArticle[]> {
        await new Promise(r => setTimeout(r, 100));
        return [...MaterialDatabase.publications];
    }
}

// --- Simulated API for External Services (now internal functions) ---
// These functions mimic API calls to various scientific and computational services.
// They generate plausible, though simulated, results.
export interface SimulatedAPIS {
    literatureSearch: (query: string, maxResults: number) => Promise<string[]>;
    simulationEngine: {
        runMolecularDynamics: (materialComposition: MaterialComposition, parameters: ExperimentParameter[]) => Promise<ExperimentResult>;
        runDFT: (materialComposition: MaterialComposition, propertiesToCalculate: string[]) => Promise<ExperimentResult>;
        runElectrochemicalModel: (materialId: string, cellDesign: any, parameters: ExperimentParameter[]) => Promise<ExperimentResult>;
        runThermalStabilitySimulation: (materialComposition: MaterialComposition, parameters: ExperimentParameter[]) => Promise<ExperimentResult>;
        runQuantumMechanicsSimulation: (materialComposition: MaterialComposition, targetProperty: 'band_gap' | 'electron_affinity' | 'ionization_potential') => Promise<ExperimentResult>; // New
        runPhaseDiagramCalculation: (elements: { [key: string]: number }, temperatureRange: [number, number]) => Promise<ExperimentResult>; // New
        runDefectFormationSimulation: (materialComposition: MaterialComposition, defectType: string) => Promise<ExperimentResult>; // New
    };
    labRobotics: {
        designSynthesisRoute: (materialGoal: MaterialComposition, targetProperties: string[]) => Promise<string>; // Returns synthesis recipe
        synthesizeMaterial: (recipe: any) => Promise<string>; // Returns material ID
        characterizeMaterial: (materialId: string, techniques: string[]) => Promise<ExperimentResult>;
        analyzeCharacterizationData: (results: ExperimentResult) => Promise<string>; // AI analyzes data
        executeHighThroughputSynthesis: (materialBase: MaterialComposition, varyingParameters: ExperimentParameter[], count: number) => Promise<string[]>; // Returns array of material IDs
    };
    optimizationEngine: {
        runBayesianOptimization: (targetProperty: string, materialBase: MaterialComposition, tunableParams: ExperimentParameter[], numIterations: number) => Promise<{ optimalParams: ExperimentParameter[], predictedValue: number, results: ExperimentResult[] }>;
        runGeneticAlgorithm: (targetProperties: string[], materialBase: MaterialComposition, genePool: ExperimentParameter[], generations: number) => Promise<{ optimalMaterial: MaterialComposition, predictedPerformance: { [key: string]: number }, results: ExperimentResult[] }>; // New
    };
    safetyAssessment: (materialId: string, application: string, currentKnowledge: string) => Promise<ExperimentResultMetric[]>;
    economicAnalysis: (materialId: string, productionScale: string, targetMarket: string) => Promise<ExperimentResultMetric[]>;
    knowledgeGraph: { // New service for knowledge management
        queryKnowledgeGraph: (query: string) => Promise<string[]>;
        addKnowledgeEntry: (entry: string, source: string, timestamp: string) => Promise<void>;
        refineKnowledgeGraph: (newInsights: string) => Promise<string>; // AI refines existing knowledge
    };
    projectManagement: { // New service for project specific tasks
        updateKPI: (projectId: string, kpiName: string, value: number | string) => Promise<void>;
        allocateBudget: (projectId: string, amount: number, category: string) => Promise<void>;
        getProjectStatus: (projectId: string) => Promise<ResearchProject>;
    };
    ipManagement: { // New service for IP management
        draftPatentApplication: (materialId: string, noveltySummary: string, keyClaims: string[]) => Promise<PatentApplication>;
        filePatentApplication: (patent: PatentApplication) => Promise<PatentApplication>;
        monitorPatentLandscape: (keywords: string[]) => Promise<string[]>;
    };
    grantManagement: { // New service for grant applications
        draftGrantProposal: (researchSummary: string, budgetNeeded: number) => Promise<GrantProposal>;
        submitGrantProposal: (grant: GrantProposal) => Promise<GrantProposal>;
    };
    publicationService: { // New service for publication
        draftArticle: (report: ResearchReport, targetJournal: string) => Promise<PublicationArticle>;
        submitArticleForReview: (article: PublicationArticle) => Promise<PublicationArticle>;
        simulatePeerReview: (articleId: string) => Promise<string>;
    };
    collaborativeAgentAPI: { // New service for multi-agent interaction
        requestExpertOpinion: (topic: string, specificQuestion: string) => Promise<string>;
        shareDataWithPartner: (data: any, partnerId: string) => Promise<string>;
    };
}

export const simulatedAPIs: SimulatedAPIS = {
    literatureSearch: async (query, maxResults) => {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
        const allPapers = [
            `Paper 1: "Advanced Graphene-based Anodes: Degradation Mechanisms and Mitigation Strategies" - Key Finding: Graphene volume expansion issues and SEI instability are primary challenges. Doping improves kinetics.`,
            `Paper 2: "Nitrogen Doping in Carbon Materials for Li-ion Batteries: A Comprehensive Review" - Key Finding: N-doping introduces defects, enhances electrical conductivity, and creates active sites for Li+ storage, but excessive doping can reduce structural integrity.`,
            `Paper 3: "Boron Nitride Nanosheets as Protective Layers and Mechanical Reinforcements in Battery Electrodes" - Key Finding: BNNS provides excellent mechanical stability, thermal conductivity, and acts as an inert barrier, suppressing dendrite growth and pulverization.`,
            `Paper 4: "Effect of Doping on Ion Intercalation Kinetics in 2D Materials: A First-Principles Study" - Key Finding: Specific dopant configurations significantly alter Li+ diffusion barriers. Higher electronegativity dopants create more favorable binding sites.`,
            `Paper 5: "Computational Study of Graphene-BN Heterostructures for Energy Storage Applications" - Key Finding: Hybrid structures leverage synergistic properties, enhancing both mechanical strength and electrochemical performance at optimized interfaces.`,
            `Paper 6: "Review: Solid Electrolyte Interphase (SEI) Formation and Stability on Carbonaceous Anodes" - Key Finding: SEI stability is paramount for long cycle life. Composition and uniformity of SEI heavily influence performance.`,
            `Paper 7: "Machine Learning for Accelerated Battery Material Discovery and Optimization" - Key Finding: ML models can predict material properties and guide experimental design, drastically reducing research cycles.`,
            `Paper 8: "Beyond Graphene: Emerging 2D Materials for Anode Applications" - Key Finding: MoS2, Black Phosphorus, and MXenes show promise but face challenges like poor conductivity or rapid degradation.`,
            `Paper 9: "Cost-Benefit Analysis of Advanced Battery Materials in Electric Vehicles" - Key Finding: High initial material cost can be offset by superior performance and longer lifespan.`,
            `Paper 10: "Safety Considerations for High-Energy Density Lithium-ion Batteries" - Key Finding: Thermal runaway prevention is critical; material choices influence intrinsic safety.`,
            `Paper 11: "In-situ Characterization Techniques for Battery Electrode Dynamics" - Key Finding: Operando XRD and TEM provide real-time insights into structural changes during cycling.`,
            `Paper 12: "Designing Stable Cathode Materials for Next-Generation Lithium-ion Batteries" - Key Finding: Layered and spinel structures are common; doping and surface coatings improve stability.`,
            `Paper 13: "Electrolyte Engineering for High Voltage and Fast Charging Batteries" - Key Finding: Additives, concentrated electrolytes, and solid electrolytes mitigate decomposition and dendrite issues.`,
            `Paper 14: "Atomic-scale Insights into Lithiation Mechanisms of Silicon Anodes" - Key Finding: Si experiences massive volume expansion, leading to fracture; nanostructuring and polymer binders help.`,
            `Paper 15: "Quantum Mechanical Insights into Interfacial Reactions in All-Solid-State Batteries" - Key Finding: QM simulations reveal complex electronic interactions at solid-solid interfaces, dictating charge transfer kinetics.`,
            `Paper 16: "High-Throughput Screening of Materials for Catalytic Oxygen Evolution Reaction" - Key Finding: Automated synthesis and characterization workflows significantly accelerate catalyst discovery.`,
            `Paper 17: "The Role of Point Defects in Modulating Ionic Conductivity in Solid Electrolytes" - Key Finding: Vacancies and interstitials play a critical role in ion transport; defect engineering is key for performance.`
        ];
        const filteredPapers = allPapers.filter(p => p.toLowerCase().includes(query.toLowerCase()));
        return filteredPapers.slice(0, maxResults);
    },
    simulationEngine: {
        runMolecularDynamics: async (composition, parameters) => {
            await new Promise(r => setTimeout(r, 3000 + Math.random() * 1000));
            const nDoping = composition.dopants?.N || 0;
            const hasBNNS = composition.structure?.includes('BNNS') || false;

            let strainReductionBase = 20;
            let liDiffusionBase = 0.2;
            let capacityRetentionBase = 80;

            if (nDoping > 0) {
                strainReductionBase += nDoping * 50; // Higher doping = more reduction initially
                liDiffusionBase += nDoping * 0.5;
            }
            if (hasBNNS) {
                strainReductionBase += 15; // BNNS adds more
                capacityRetentionBase += 10;
                liDiffusionBase -= 0.05; // Might slightly impede diffusion if too dense
            }

            // Apply parameter specific adjustments
            const targetStrainParam = parameters.find(p => p.name === 'strainReductionTarget');
            const targetStrain = targetStrainParam ? (targetStrainParam.value as number) : 0;
            if (targetStrain > 0) strainReductionBase += (Math.random() * 10 - 5); // Add some variability
            const tempParam = parameters.find(p => p.name === 'temperature');
            const temp = tempParam ? (tempParam.value as number) : 300;
            if (temp > 300) liDiffusionBase += 0.02; // Higher temp, faster diffusion

            // Add complexity based on BNNS layer thickness and spacing
            const bnnsThickness = parameters.find(p => p.name === 'BNNS layer thickness')?.value as number || 2;
            const bnnsSpacing = parameters.find(p => p.name === 'BNNS spacing')?.value as number || 1;
            if (bnnsThickness > 3 && bnnsSpacing < 1) { // Too thick or too close
                strainReductionBase -= 5;
                liDiffusionBase -= 0.1;
                capacityRetentionBase -= 5;
            } else if (bnnsThickness <= 3 && bnnsSpacing >= 0.8 && bnnsSpacing <= 1.5) { // Optimal range
                strainReductionBase += 8;
                liDiffusionBase += 0.03;
                capacityRetentionBase += 3;
            }


            const strainReduction = Math.max(10, Math.min(60, strainReductionBase + (Math.random() * 10 - 5))).toFixed(2);
            const liDiffusion = Math.max(0.1, Math.min(0.6, liDiffusionBase + (Math.random() * 0.1 - 0.05))).toFixed(3);
            const capacityRetention = Math.max(60, Math.min(95, capacityRetentionBase + (Math.random() * 10 - 5))).toFixed(2);

            const isSuccess = parseFloat(strainReduction) > 25 && parseFloat(liDiffusion) > 0.25 && parseFloat(capacityRetention) > 85;

            const cycleNumbers = Array.from({ length: 500 }, (_, i) => i + 1);
            const capacityData = cycleNumbers.map(i => {
                const dropRate = isSuccess ? 0.0001 : 0.0003;
                return parseFloat(capacityRetention) - (i * dropRate * (100 - parseFloat(capacityRetention))) + (Math.random() * 2 - 1);
            });

            return {
                id: `sim-md-${Date.now()}`,
                experimentId: 'dummy-md-exp',
                dataPoints: { cycle_number: cycleNumbers, capacity_retention_percent: capacityData },
                metrics: [
                    { name: 'Lattice Strain Reduction', value: strainReduction, unit: '%' },
                    { name: 'Li+ Diffusion Coefficient', value: liDiffusion, unit: '10^-7 cmÂ²/s' },
                    { name: 'Projected Capacity Retention @ 500 cycles', value: capacityRetention, unit: '%' }
                ],
                analysisSummary: `Molecular Dynamics simulation completed. Results show ${strainReduction}% reduction in lattice strain, a Li+ diffusion coefficient of ${liDiffusion} x 10^-7 cmÂ²/s, and projected ${capacityRetention}% capacity retention after 500 cycles.`,
                interpretation: isSuccess ? 'Strong support for material design, demonstrating enhanced stability and kinetics.' : 'Partial support, material shows some promise but requires further optimization.',
                conclusion: isSuccess ? 'supported' : 'partial_support',
                confidenceScore: isSuccess ? 0.85 : 0.65,
                rawLog: `Simulated LAMMPS output: Energy minimized. Strain tensors computed. Diffusion pathways analyzed. CPU time: 12000s. Configuration: ${JSON.stringify(composition)}. Parameters: ${JSON.stringify(parameters)}`,
                 generatedVisualizations: [{ type: 'chart', dataUrl: 'data:image/png;base64,mocked_md_chart_data', title: 'Capacity Retention over Cycles (MD)' }]
            };
        },
        runDFT: async (composition, propertiesToCalculate) => {
            await new Promise(r => setTimeout(r, 2500 + Math.random() * 700));
            const bandGap = propertiesToCalculate.includes('band_gap') ? (Math.random() * 3 + 1).toFixed(2) : 'N/A';
            const formationEnergy = propertiesToCalculate.includes('formation_energy') ? (-0.5 - Math.random() * 0.5).toFixed(3) : 'N/A';
            const liBindingEnergy = propertiesToCalculate.includes('li_binding_energy') ? (-2.0 - Math.random() * 1.0).toFixed(2) : 'N/A'; // eV

            const metrics: ExperimentResultMetric[] = [];
            if (bandGap !== 'N/A') metrics.push({ name: 'Band Gap', value: bandGap, unit: 'eV' });
            if (formationEnergy !== 'N/A') metrics.push({ name: 'Formation Energy', value: formationEnergy, unit: 'eV/atom' });
            if (liBindingEnergy !== 'N/A') metrics.push({ name: 'Li Binding Energy', value: liBindingEnergy, unit: 'eV' });

            const isStable = parseFloat(formationEnergy as string) < -0.6; // More negative = more stable
            const isGoodBinder = parseFloat(liBindingEnergy as string) < -2.5; // More negative = stronger binding

            let conclusion: ExperimentResult['conclusion'] = 'inconclusive';
            let confidence = 0.5;
            if (isStable && isGoodBinder) {
                conclusion = 'supported';
                confidence = 0.9;
            } else if (isStable || isGoodBinder) {
                conclusion = 'partial_support';
                confidence = 0.7;
            } else {
                conclusion = 'refuted';
                confidence = 0.4;
            }

            return {
                id: `sim-dft-${Date.now()}`,
                experimentId: 'dummy-dft-exp',
                dataPoints: {},
                metrics,
                analysisSummary: `DFT calculation for ${JSON.stringify(composition.elements)} completed. Key properties: Band Gap=${bandGap} eV, Formation Energy=${formationEnergy} eV/atom, Li Binding Energy=${liBindingEnergy} eV.`,
                interpretation: isStable ? 'Material shows good thermodynamic stability.' : 'Material might be less stable than desired. ' + (isGoodBinder ? 'However, Li binding is strong.' : 'Li binding is also weak.'),
                conclusion: conclusion,
                confidenceScore: confidence,
                rawLog: `Simulated VASP output: K-points converged. Self-consistent field reached. DOS calculated. Total Energy: XXX. Structure optimized.`,
                generatedVisualizations: [{ type: 'chart', dataUrl: 'data:image/png;base64,mocked_dft_band_gap_data', title: 'Density of States (DFT)' }]
            };
        },
        runElectrochemicalModel: async (materialId, cellDesign, parameters) => {
            await new Promise(r => setTimeout(r, 4000 + Math.random() * 1000));
            const cycleRate = parameters.find(p => p.name === 'cycle_rate')?.value as number || 0.5;
            const totalCycles = parameters.find(p => p.name === 'cycles')?.value as number || 500;

            const material = await MaterialDatabase.fetchMaterialById(materialId);
            const baseCapacity = material?.performanceScore ? material.performanceScore * 3 : 200; // Base from score
            const baseEfficiency = material?.stabilityScore ? material.stabilityScore * 0.9 + 10 : 90;
            let baseRetention = material?.stabilityScore ? material.stabilityScore * 0.8 : 70;

            // Adjust based on composite structure (assuming better performance for novel materials)
            if (material?.composition.structure?.includes('heterostructure') || material?.composition.dopants) {
                baseRetention += 15;
            }

            const capacity = (baseCapacity + Math.random() * 50 - 25).toFixed(2);
            const efficiency = (baseEfficiency + Math.random() * 5 - 2.5).toFixed(2);
            const cycleRetention = (baseRetention - (cycleRate * 5) + Math.random() * 10 - 5).toFixed(2);

            const isHighPerformance = parseFloat(capacity) > 250 && parseFloat(efficiency) > 95 && parseFloat(cycleRetention) > 85;

            const voltagePoints = Array.from({ length: 100 }, (_, i) => 3.0 + i * 0.01 + Math.sin(i / 10) * 0.1);
            const currentPoints = Array.from({ length: 100 }, (_, i) => 0.1 + i * 0.005 + Math.cos(i / 20) * 0.02);

            return {
                id: `sim-electro-${Date.now()}`,
                experimentId: 'dummy-electro-exp',
                dataPoints: { voltage: voltagePoints, current: currentPoints },
                metrics: [
                    { name: 'Specific Capacity', value: capacity, unit: 'mAh/g' },
                    { name: 'Initial Coulombic Efficiency', value: efficiency, unit: '%' },
                    { name: 'Capacity Retention @ ' + totalCycles + ' cycles', value: cycleRetention, unit: '%' }
                ],
                analysisSummary: `Electrochemical model for material ${materialId} simulated. Achieved ${capacity} mAh/g capacity and ${efficiency}% efficiency. Capacity retention at ${totalCycles} cycles: ${cycleRetention}%.`,
                interpretation: isHighPerformance ? 'Excellent electrochemical performance predicted, meeting or exceeding target metrics.' : 'Performance needs improvement, particularly in cycle life or rate capability.',
                conclusion: isHighPerformance ? 'supported' : 'inconclusive',
                confidenceScore: isHighPerformance ? 0.9 : 0.6,
                rawLog: `Simulated COMSOL output: Electrochemical cell dynamics solved. Ionic flux and charge distribution mapped. Cell design: ${JSON.stringify(cellDesign)}`,
                generatedVisualizations: [{ type: 'chart', dataUrl: 'data:image/png;base64,mocked_electrochemical_chart_data', title: 'Charge/Discharge Curves' }]
            };
        },
        runThermalStabilitySimulation: async (composition, parameters) => {
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 800));
            const onsetTemp = (180 + Math.random() * 50).toFixed(1); // Â°C
            const peakTemp = (250 + Math.random() * 70).toFixed(1); // Â°C
            const heatRelease = (500 + Math.random() * 300).toFixed(1); // J/g

            const isStable = parseFloat(onsetTemp) > 200 && parseFloat(heatRelease) < 600;

            return {
                id: `sim-thermal-${Date.now()}`,
                experimentId: 'dummy-thermal-exp',
                dataPoints: { temperature: Array.from({ length: 50 }, (_, i) => 50 + i * 5), heat_flow: Array.from({ length: 50 }, (_, i) => 10 + Math.sin(i / 5) * 5 + Math.exp(i / 25) * 0.5) },
                metrics: [
                    { name: 'Thermal Onset Temperature', value: onsetTemp, unit: 'Â°C' },
                    { name: 'Peak Exothermic Temperature', value: peakTemp, unit: 'Â°C' },
                    { name: 'Total Heat Release', value: heatRelease, unit: 'J/g' }
                ],
                analysisSummary: `Thermal stability simulation completed. Onset of exothermic reaction at ${onsetTemp}Â°C, with a total heat release of ${heatRelease} J/g.`,
                interpretation: isStable ? 'Material exhibits good thermal stability, suitable for safe battery operation.' : 'Thermal stability is a concern; may require further mitigation strategies or material modifications.',
                conclusion: isStable ? 'supported' : 'refuted',
                confidenceScore: isStable ? 0.8 : 0.5,
                rawLog: `Simulated DSC/TGA output: Heat flow vs temperature curve generated. Mass loss profile analyzed.`,
                generatedVisualizations: [{ type: 'chart', dataUrl: 'data:image/png;base64,mocked_thermal_chart_data', title: 'DSC/TGA Thermogram' }]
            };
        },
        runQuantumMechanicsSimulation: async (composition, targetProperty) => {
            await new Promise(r => setTimeout(r, 3500 + Math.random() * 1200));
            let value;
            let unit;
            let interpretation;
            let conclusion: ExperimentResult['conclusion'] = 'supported';
            let confidence = 0.8;

            if (targetProperty === 'band_gap') {
                value = (Math.random() * 4 + 0.5).toFixed(2); // 0.5 to 4.5 eV
                unit = 'eV';
                interpretation = `Calculated band gap for ${composition.name || JSON.stringify(composition.elements)}.`;
                if (parseFloat(value) < 1.0) interpretation += ' Suggests metallic or semiconductor behavior suitable for electronic applications.';
                else if (parseFloat(value) > 3.0) interpretation += ' Suggests insulating behavior, potentially useful for dielectrics or wide bandgap semiconductors.';
            } else if (targetProperty === 'electron_affinity') {
                value = (Math.random() * 2 + 1.5).toFixed(2); // 1.5 to 3.5 eV
                unit = 'eV';
                interpretation = `Calculated electron affinity, indicating electron-accepting capability. Higher values suggest easier electron capture.`;
            } else { // ionization_potential
                value = (Math.random() * 3 + 4.0).toFixed(2); // 4.0 to 7.0 eV
                unit = 'eV';
                interpretation = `Calculated ionization potential, indicating electron-donating capability. Lower values suggest easier electron removal.`;
            }

            return {
                id: `sim-qm-${Date.now()}`,
                experimentId: 'dummy-qm-exp',
                dataPoints: {},
                metrics: [{ name: targetProperty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value, unit, interpretation }],
                analysisSummary: `Quantum Mechanics simulation for ${targetProperty} completed.`,
                interpretation: interpretation,
                conclusion: conclusion,
                confidenceScore: confidence,
                rawLog: `Simulated DFT-based QM output: Electronic structure converged. HOMO-LUMO gap calculated.`,
                generatedVisualizations: [{ type: 'chart', dataUrl: 'data:image/png;base64,mocked_qm_data', title: `Electronic Structure (${targetProperty})` }]
            };
        },
        runPhaseDiagramCalculation: async (elements, temperatureRange) => {
            await new Promise(r => setTimeout(r, 4000 + Math.random() * 1500));
            const numPhases = Math.floor(Math.random() * 3) + 2; // 2-4 phases
            const stablePhases = Array.from({ length: numPhases }, (_, i) => `Phase ${String.fromCharCode(65 + i)}`);
            const eutecticTemp = (temperatureRange[0] + (temperatureRange[1] - temperatureRange[0]) * (0.3 + Math.random() * 0.4)).toFixed(0);

            return {
                id: `sim-pd-${Date.now()}`,
                experimentId: 'dummy-pd-exp',
                dataPoints: {},
                metrics: [
                    { name: 'Stable Phases', value: stablePhases.join(', ') },
                    { name: 'Eutectic Temperature', value: eutecticTemp, unit: 'Â°C' },
                    { name: 'Solidus Temperature', value: (parseFloat(eutecticTemp) - 50 + Math.random() * 30).toFixed(0), unit: 'Â°C' }
                ],
                analysisSummary: `Phase diagram calculation for ${Object.keys(elements).join('-')} system completed. Identified ${numPhases} stable phases.`,
                interpretation: `The calculated phase diagram suggests complex phase behavior, with a eutectic point at ${eutecticTemp}Â°C. Understanding these phases is crucial for synthesis control and material stability.`,
                conclusion: 'new_insight',
                confidenceScore: 0.85,
                rawLog: `Simulated CALPHAD output: Gibbs free energy minimization completed. Phase boundaries determined.`,
                generatedVisualizations: [{ type: 'graph', dataUrl: 'data:image/png;base64,mocked_phase_diagram', title: 'Binary Phase Diagram' }]
            };
        },
        runDefectFormationSimulation: async (composition, defectType) => {
            await new Promise(r => setTimeout(r, 3200 + Math.random() * 900));
            const formationEnergy = (0.5 + Math.random() * 2.5).toFixed(2); // eV
            const migrationBarrier = (0.1 + Math.random() * 0.8).toFixed(2); // eV
            const defectConcentration = (Math.random() * 1e19 + 1e18).toExponential(2); // defects/cm^3

            let interpretation = `Simulated ${defectType} defect formation in ${composition.name || JSON.stringify(composition.elements)}. `;
            if (parseFloat(formationEnergy) < 1.0) interpretation += `Low formation energy suggests high intrinsic defect concentration, potentially useful for ionic conductivity.`;
            else interpretation += `High formation energy suggests good structural integrity against this defect type.`;

            return {
                id: `sim-defect-${Date.now()}`,
                experimentId: 'dummy-defect-exp',
                dataPoints: {},
                metrics: [
                    { name: `${defectType} Formation Energy`, value: formationEnergy, unit: 'eV' },
                    { name: `${defectType} Migration Barrier`, value: migrationBarrier, unit: 'eV' },
                    { name: `Equilibrium ${defectType} Concentration`, value: defectConcentration, unit: 'cm^-3' }
                ],
                analysisSummary: `Defect simulation for ${defectType} completed. Formation energy: ${formationEnergy} eV, Migration barrier: ${migrationBarrier} eV.`,
                interpretation: interpretation,
                conclusion: 'supported',
                confidenceScore: 0.8,
                rawLog: `Simulated KMC/DFT defect output: Vacancy/interstitial energies calculated. Defect structures optimized.`,
                generatedVisualizations: [{ type: 'image', dataUrl: 'data:image/png;base64,mocked_defect_structure', title: `Defect Structure (${defectType})` }]
            };
        }
    },
    labRobotics: {
        designSynthesisRoute: async (materialGoal, targetProperties) => {
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
            const method = Math.random() > 0.5 ? 'Solvothermal Synthesis' : 'Solid-State Reaction';
            const precursors = Object.keys(materialGoal.elements).map(el => `${el} precursor`).join(', ') + (materialGoal.dopants ? `, ${Object.keys(materialGoal.dopants).map(dop => `${dop} precursor`).join(', ')}` : '');
            const temperature = (150 + Math.random() * 600).toFixed(0);
            const duration = (12 + Math.random() * 36).toFixed(0);
            const postProcessing = Math.random() > 0.6 ? 'Annealing at 700C in Ar/H2' : 'No post-annealing';

            let recipe = `Synthesis Recipe for ${materialGoal.name || JSON.stringify(materialGoal.elements)} via ${method}:\n`;
            recipe += `Precursors: ${precursors}\n`;
            recipe += `Conditions: Temperature ${temperature}Â°C, Duration ${duration} hours, under ${method === 'Solvothermal Synthesis' ? 'autoclave' : 'ambient'} atmosphere.\n`;
            recipe += `Solvent: ${method === 'Solvothermal Synthesis' ? 'N,N-dimethylformamide (DMF)' : 'N/A'}\n`;
            recipe += `Post-processing: ${postProcessing}.\n`;
            recipe += `Target Properties: ${targetProperties.join(', ')}.`;
            return recipe;
        },
        synthesizeMaterial: async (recipe) => {
            await new Promise(r => setTimeout(r, 5000 + Math.random() * 2000));
            const newMaterialId = `mat-${Date.now()}`;
            const purity = 90 + Math.random() * 8;
            const yieldPercent = 70 + Math.random() * 20;

            const newMaterial: Material = {
                id: newMaterialId,
                name: recipe.name || `Custom Material ${newMaterialId.substring(4)}`,
                composition: recipe.composition || { elements: {} },
                properties: [
                    { name: 'Synthesized Purity', value: purity.toFixed(2), unit: '%', source: 'experimental' },
                    { name: 'Yield', value: yieldPercent.toFixed(2), unit: '%', source: 'experimental' }
                ],
                discoveryDate: new Date().toISOString().split('T')[0],
                synthesisMethod: recipe.method || 'Automated solvothermal synthesis',
                potentialApplications: recipe.applications || ['battery material research'],
                stabilityScore: Math.round(purity * 0.8),
                performanceScore: Math.round(yieldPercent * 0.7),
                riskScore: Math.round(100 - purity),
                costScore: Math.round(100 - yieldPercent) + 20, // Lower yield = higher cost
            };
            await MaterialDatabase.addMaterial(newMaterial);
            return newMaterialId;
        },
        characterizeMaterial: async (materialId, techniques) => {
            await new Promise(r => setTimeout(r, 4000 + Math.random() * 1500));
            const material = await MaterialDatabase.fetchMaterialById(materialId);
            if (!material) throw new Error('Material not found for characterization');

            const metrics: ExperimentResultMetric[] = [];
            const dataPoints: { [key: string]: number[] | string[] } = {};
            const generatedVisualizations: ExperimentResult['generatedVisualizations'] = [];
            let charConclusion: ExperimentResult['conclusion'] = 'supported';
            let charConfidence = 0.8;

            if (techniques.includes('XRD')) {
                const crystalStructure = Math.random() > 0.5 ? 'Hexagonal' : 'Rhombohedral';
                metrics.push({ name: 'Crystal Structure', value: crystalStructure, description: 'Simulated XRD pattern matching.' });
                metrics.push({ name: 'Crystallinity Index', value: (0.7 + Math.random() * 0.2).toFixed(2), unit: '' });
                dataPoints['XRD_2theta'] = Array.from({ length: 100 }, (_, i) => 10 + i * 0.5);
                dataPoints['XRD_intensity'] = Array.from({ length: 100 }, (_, i) => Math.sin(i / 5) * Math.exp(-i / 50) * 100 + 150 + Math.random() * 50);
                generatedVisualizations.push({ type: 'chart', dataUrl: 'data:image/png;base64,mocked_xrd_pattern', title: 'XRD Pattern' });
                if (crystalStructure === 'Rhombohedral' && material.name.toLowerCase().includes('graphene')) charConclusion = 'inconclusive'; // Graphene usually hexagonal
            }
            if (techniques.includes('TEM') || techniques.includes('SEM')) {
                const particleSize = 50 + Math.random() * 20;
                const morphology = material.composition.structure?.includes('nanosheet') ? 'Nanosheets' : 'Nanoparticles';
                metrics.push({ name: 'Particle Size', value: particleSize.toFixed(1), unit: 'nm' });
                metrics.push({ name: 'Morphology', value: morphology, description: 'Simulated TEM/SEM image analysis.' });
                dataPoints['TEM_image_data'] = ['simulated_image_nanosheets.png'];
                generatedVisualizations.push({ type: 'image', dataUrl: 'data:image/png;base64,mocked_tem_image', title: 'TEM Image' });
            }
            if (techniques.includes('XPS')) {
                const nDopingLevel = (material.composition.dopants?.N || 0) * 100;
                metrics.push({ name: 'Surface Composition (N-doping)', value: (nDopingLevel + Math.random() * 1).toFixed(2), unit: '%' });
                dataPoints['XPS_spectra_peaks'] = ['C1s', 'N1s', 'O1s', 'B1s'];
                generatedVisualizations.push({ type: 'chart', dataUrl: 'data:image/png;base64,mocked_xps_spectra', title: 'XPS Spectra' });
            }
            if (techniques.includes('EIS')) {
                metrics.push({ name: 'Charge Transfer Resistance', value: (10 + Math.random() * 5).toFixed(2), unit: 'Ohm' });
                metrics.push({ name: 'Ionic Conductivity', value: (1e-4 + Math.random() * 1e-5).toExponential(2), unit: 'S/cm' });
                dataPoints['EIS_nyquist_real'] = Array.from({ length: 50 }, (_, i) => 5 + i * 0.1 + Math.random() * 0.5);
                dataPoints['EIS_nyquist_imag'] = Array.from({ length: 50 }, (_, i) => - (10 - i * 0.1) * (10 - i * 0.1) / 10 + 5 + Math.random() * 0.5);
                generatedVisualizations.push({ type: 'chart', dataUrl: 'data:image/png;base64,mocked_eis_nyquist', title: 'EIS Nyquist Plot' });
            }
            if (techniques.includes('Cycling') && material.performanceScore) {
                const cycles = 500;
                const initialCapacity = material.performanceScore * 3.5 + Math.random() * 50;
                const retention = material.stabilityScore * 0.8 + Math.random() * 10;
                metrics.push({ name: 'Initial Specific Capacity', value: initialCapacity.toFixed(2), unit: 'mAh/g' });
                metrics.push({ name: 'Capacity Retention @ ' + cycles + ' cycles', value: retention.toFixed(2), unit: '%' });
                 const cycleNumbers = Array.from({ length: cycles }, (_, i) => i + 1);
                 const capacityData = cycleNumbers.map(i => initialCapacity * (1 - (i / cycles) * (100 - retention) / 100) + (Math.random() * 5 - 2.5));
                dataPoints['Cycling_capacity'] = capacityData;
                dataPoints['Cycling_cycles'] = cycleNumbers;
                generatedVisualizations.push({ type: 'chart', dataUrl: 'data:image/png;base64,mocked_cycling_data', title: 'Cycling Performance' });
            }
            if (techniques.includes('Raman')) {
                metrics.push({ name: 'ID/IG Ratio', value: (0.5 + Math.random() * 0.5).toFixed(2), interpretation: 'Indicates defect density and graphitization degree.' });
                 generatedVisualizations.push({ type: 'chart', dataUrl: 'data:image/png;base64,mocked_raman_spectra', title: 'Raman Spectra' });
            }
            if (techniques.includes('TGA')) {
                metrics.push({ name: 'Thermal Degradation Onset', value: (250 + Math.random() * 100).toFixed(1), unit: 'Â°C' });
                metrics.push({ name: 'Mass Loss at 800Â°C', value: (5 + Math.random() * 15).toFixed(1), unit: '%' });
                 generatedVisualizations.push({ type: 'chart', dataUrl: 'data:image/png;base64,mocked_tga_curve', title: 'TGA Curve' });
            }


            // Update material properties with characterization results
            const updatedProperties = [...material.properties];
            metrics.forEach(m => {
                const existing = updatedProperties.find(p => p.name === m.name);
                if (existing) {
                    existing.value = m.value;
                    existing.unit = m.unit;
                    existing.description = m.interpretation || m.description;
                    existing.source = 'experimental';
                    existing.timestamp = new Date().toISOString();
                } else {
                    updatedProperties.push({
                        name: m.name,
                        value: m.value,
                        unit: m.unit,
                        description: m.interpretation || m.description,
                        source: 'experimental',
                        timestamp: new Date().toISOString(),
                    });
                }
            });
            await MaterialDatabase.updateMaterial({ ...material, properties: updatedProperties });


            return {
                id: `char-${Date.now()}`,
                experimentId: `char-exp-${materialId}`,
                dataPoints,
                metrics,
                analysisSummary: `Material ${material.name} characterized using ${techniques.join(', ')}. Key findings include ${metrics.map(m => `${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ''}`).join(', ')}.`,
                interpretation: `Characterization confirms expected structural and compositional properties. ${charConclusion === 'inconclusive' ? 'Further investigation into inconsistencies is required.' : ''}`,
                conclusion: charConclusion,
                confidenceScore: charConfidence,
                rawLog: `Simulated instrument output: XRD scan finished. TEM images processed. XPS spectra analyzed.`,
                generatedVisualizations: generatedVisualizations
            };
        },
        analyzeCharacterizationData: async (results) => {
            await new Promise(r => setTimeout(r, 1500 + Math.random() * 500));
            let analysis = `Detailed AI analysis of Characterization Results (Experiment ID: ${results.experimentId}):\n`;
            analysis += `Summary: ${results.analysisSummary}\n`;
            analysis += `Metrics: ${results.metrics.map(m => `${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ''}`).join('; ')}\n`;
            analysis += `Interpretation: The data strongly suggests ${results.interpretation}. `;
            analysis += `The overall conclusion is '${results.conclusion}' with a confidence of ${(results.confidenceScore * 100).toFixed(0)}%. `;
            analysis += `Specific trends observed in data points were analyzed, indicating [simulated deeper insights, e.g., 'a slight increase in charge transfer resistance after 200 cycles due to SEI growth, which deviates from ideal behavior.'].`;
            return analysis;
        },
        executeHighThroughputSynthesis: async (materialBase, varyingParameters, count) => {
            await new Promise(r => setTimeout(r, 8000 + Math.random() * 4000));
            const synthesizedMaterialIds: string[] = [];
            for (let i = 0; i < count; i++) {
                const currentParams = varyingParameters.map(p => {
                    let value = p.value as number;
                    if (p.range) {
                        value = p.range[0] + (Math.random() * (p.range[1] - p.range[0]));
                    } else if (typeof p.value === 'number') {
                        value = (p.value as number) * (0.8 + Math.random() * 0.4); // +/- 20%
                    }
                    return { ...p, value: parseFloat(value.toFixed(2)) };
                });

                const newMaterialId = `mat-HTS-${Date.now()}-${i}`;
                const purity = 85 + Math.random() * 10;
                const yieldPercent = 60 + Math.random() * 30;
                const dopants = materialBase.dopants ? { ...materialBase.dopants } : {};
                currentParams.forEach(p => {
                    if (p.name.toLowerCase().includes('doping')) dopants[p.name.split(' ')[0]] = p.value as number / 100;
                });

                const newMaterial: Material = {
                    id: newMaterialId,
                    name: `${materialBase.name || 'HTS Material'} Variant ${i + 1}`,
                    composition: { ...materialBase.composition, dopants: dopants },
                    properties: [
                        { name: 'HTS Purity', value: purity.toFixed(2), unit: '%', source: 'experimental' },
                        { name: 'HTS Yield', value: yieldPercent.toFixed(2), unit: '%', source: 'experimental' }
                    ],
                    discoveryDate: new Date().toISOString().split('T')[0],
                    synthesisMethod: 'Automated High-Throughput Synthesis',
                    potentialApplications: materialBase.potentialApplications || ['battery material research'],
                    stabilityScore: Math.round(purity * 0.7 + yieldPercent * 0.2),
                    performanceScore: Math.round(yieldPercent * 0.8),
                    riskScore: Math.round(100 - purity) + Math.random() * 10,
                    costScore: Math.round(100 - yieldPercent) + 30 + Math.random() * 20,
                };
                await MaterialDatabase.addMaterial(newMaterial);
                synthesizedMaterialIds.push(newMaterialId);
            }
            return synthesizedMaterialIds;
        }
    },
    optimizationEngine: {
        runBayesianOptimization: async (targetProperty, materialBase, tunableParams, numIterations) => {
            await new Promise(r => setTimeout(r, 6000 + Math.random() * 2000));
            const optimizedParams: ExperimentParameter[] = [];
            let bestValue = targetProperty.toLowerCase().includes('capacity') ? 200 : (targetProperty.toLowerCase().includes('strain') ? 100 : 0.1);
            const results: ExperimentResult[] = [];

            for (let i = 0; i < numIterations; i++) {
                // Simulate exploration and exploitation
                const currentIterationParams = tunableParams.map(p => {
                    let newValue = p.value as number;
                    if (p.range) {
                        // Gaussian walk around current best, or random if starting
                        const currentBest = optimizedParams.find(op => op.name === p.name)?.value as number || (p.range[0] + p.range[1]) / 2;
                        newValue = Math.max(p.range[0], Math.min(p.range[1], currentBest + (Math.random() - 0.5) * (p.range[1] - p.range[0]) / (numIterations - i + 2))); // Reduce randomness over iterations
                    } else if (typeof p.value === 'number') {
                        newValue = (p.value as number) + (Math.random() * 0.1 - 0.05);
                    }
                    return { ...p, value: parseFloat(newValue.toFixed(2)) };
                });

                // Simulate running an experiment with these parameters
                const simResult = await simulatedAPIs.simulationEngine.runElectrochemicalModel(
                    materialBase.id || 'mat-001', // Needs a real material ID for full simulation
                    { anode: materialBase.name || 'Optimized Anode' },
                    currentIterationParams
                );
                results.push(simResult);

                const primaryMetric = simResult.metrics.find(m => m.name.toLowerCase().includes(targetProperty.toLowerCase()));
                if (primaryMetric && typeof primaryMetric.value === 'string') {
                    const currentValue = parseFloat(primaryMetric.value);
                    if (targetProperty.toLowerCase().includes('capacity') && currentValue > bestValue) {
                        bestValue = currentValue;
                        optimizedParams.splice(0, optimizedParams.length, ...currentIterationParams);
                    } else if (targetProperty.toLowerCase().includes('strain') && currentValue < bestValue) {
                        bestValue = currentValue;
                        optimizedParams.splice(0, optimizedParams.length, ...currentIterationParams);
                    } else if (targetProperty.toLowerCase().includes('diffusion') && currentValue > bestValue) {
                        bestValue = currentValue;
                        optimizedParams.splice(0, optimizedParams.length, ...currentIterationParams);
                    }
                }
            }

            return {
                optimalParams: optimizedParams.length > 0 ? optimizedParams : tunableParams.map(p => ({...p, value: (p.range ? (p.range[0] + p.range[1]) / 2 : p.value)})), // fallback to midpoint or initial
                predictedValue: parseFloat(bestValue.toFixed(2)),
                results: results
            };
        },
        runGeneticAlgorithm: async (targetProperties, materialBase, genePool, generations) => {
            await new Promise(r => setTimeout(r, 8000 + Math.random() * 3000));
            let bestMaterialComposition = { ...materialBase.composition };
            const predictedPerformance: { [key: string]: number } = {};
            const results: ExperimentResult[] = [];

            for (let g = 0; g < generations; g++) {
                // Simulate generation of new candidates (crossover, mutation)
                const candidateParams = genePool.map(p => {
                    let value = p.value as number;
                    if (p.range) {
                        value = p.range[0] + (Math.random() * (p.range[1] - p.range[0]));
                    } else if (typeof p.value === 'number') {
                        value = (p.value as number) * (0.9 + Math.random() * 0.2);
                    }
                    return { ...p, value: parseFloat(value.toFixed(2)) };
                });

                const currentComposition: MaterialComposition = { ...materialBase.composition };
                candidateParams.forEach(p => {
                    if (p.name.toLowerCase().includes('doping')) {
                        if (!currentComposition.dopants) currentComposition.dopants = {};
                        currentComposition.dopants[p.name.split(' ')[0]] = p.value as number / 100;
                    }
                    if (p.name.toLowerCase().includes('layer_thickness')) currentComposition.structure = `BNNS interlayers (thickness: ${p.value}nm)`;
                });

                // Simulate evaluation of candidate material (e.g., electrochemical model)
                const tempMaterialId = `temp-ga-${Date.now()}`;
                await MaterialDatabase.addMaterial({ // Temporarily add material for simulation
                    id: tempMaterialId, name: 'GA Candidate', composition: currentComposition,
                    properties: [], discoveryDate: new Date().toISOString().split('T')[0], potentialApplications: ['research']
                });
                const simResult = await simulatedAPIs.simulationEngine.runElectrochemicalModel(
                    tempMaterialId,
                    { anode: currentComposition.name || 'GA Candidate' },
                    [] // No specific parameters needed for electro model, it uses material properties
                );
                results.push(simResult);

                let currentScore = 0;
                targetProperties.forEach(target => {
                    const metric = simResult.metrics.find(m => m.name.toLowerCase().includes(target.toLowerCase()));
                    if (metric && typeof metric.value === 'string') {
                        const val = parseFloat(metric.value);
                        if (target.toLowerCase().includes('capacity') || target.toLowerCase().includes('retention')) currentScore += val;
                        if (target.toLowerCase().includes('resistance')) currentScore -= val; // Minimize resistance
                    }
                });

                // Simple selection: keep the best one
                if (g === 0 || currentScore > (predictedPerformance.overallScore || 0)) {
                    bestMaterialComposition = currentComposition;
                    predictedPerformance.overallScore = currentScore;
                    targetProperties.forEach(target => {
                        const metric = simResult.metrics.find(m => m.name.toLowerCase().includes(target.toLowerCase()));
                        if (metric && typeof metric.value === 'string') {
                            predictedPerformance[target] = parseFloat(metric.value);
                        }
                    });
                }
            }
            return { optimalMaterial: bestMaterialComposition, predictedPerformance, results };
        }
    },
    safetyAssessment: async (materialId, application, currentKnowledge) => {
        await new Promise(r => setTimeout(r, 1500));
        const material = await MaterialDatabase.fetchMaterialById(materialId);
        if (!material) return [{ name: 'Safety Risk', value: 'High', interpretation: 'Material not found.' }];

        const risks: ExperimentResultMetric[] = [];
        const baseRisk = 100 - (material.stabilityScore || 50); // Higher stability = lower base risk
        let overallRisk = baseRisk;

        if (material.name.toLowerCase().includes('silicon')) {
            risks.push({ name: 'Volume Expansion Risk', value: 'High', interpretation: 'Significant volume changes can lead to mechanical failure and short circuits.' });
            overallRisk += 20;
        }
        if (material.composition.elements.Co) {
            risks.push({ name: 'Thermal Runaway Potential (Co)', value: 'Moderate', interpretation: 'Cobalt-rich cathodes have higher thermal instability.' });
            overallRisk += 10;
        }
        if (application.toLowerCase().includes('ev battery')) {
            risks.push({ name: 'Fast Charge Dendrite Risk', value: 'Elevated', interpretation: 'High current densities increase risk of lithium plating, especially with fast charging. Requires careful management.' });
            overallRisk += 15;
        }
        if (material.composition.nanostructure?.includes('quantum dots') && !currentKnowledge.includes('nanotoxicity')) {
             risks.push({ name: 'Nanotoxicity Risk', value: 'Unknown/Moderate', interpretation: 'Potential health risks due to nanoparticle inhalation or environmental release. Requires further specific toxicology studies.' });
             overallRisk += 25; // Unknown risk adds significant penalty
        }

        risks.push({ name: 'Overall Safety Score', value: Math.max(0, Math.min(100, 100 - overallRisk)).toFixed(1), unit: '/100', interpretation: 'Higher score means safer.' });
        return risks;
    },
    economicAnalysis: async (materialId, productionScale, targetMarket) => {
        await new Promise(r => setTimeout(r, 1200));
        const material = await MaterialDatabase.fetchMaterialById(materialId);
        if (!material) return [{ name: 'Cost/kg', value: 'N/A', interpretation: 'Material not found.' }];

        let baseCostPerKg = 50 + Math.random() * 100; // Base material cost
        if (material.composition.elements.Co) baseCostPerKg += 200; // Cobalt is expensive
        if (material.composition.elements.Li && material.composition.structure?.includes('nanosheet')) baseCostPerKg += 150; // Nano materials are complex
        if (material.composition.dopants && Object.keys(material.composition.dopants).length > 0) baseCostPerKg += 50; // Doping adds cost

        let scaleFactor = 1;
        if (productionScale.toLowerCase() === 'pilot') scaleFactor = 2;
        if (productionScale.toLowerCase() === 'mass') scaleFactor = 0.8;

        const costPerKg = (baseCostPerKg * scaleFactor + Math.random() * 20 - 10).toFixed(2);
        const lifecycleCostReduction = (material.performanceScore && material.stabilityScore) ? (material.performanceScore + material.stabilityScore) / 200 * 30 : 15; // Placeholder
        const potentialROI = (lifecycleCostReduction * 2 - baseCostPerKg / 100).toFixed(2); // Simplified ROI calculation
        const marketPenetration = (Math.random() * 50 + 20).toFixed(1); // Simulated market penetration

        return [
            { name: 'Raw Material Cost', value: costPerKg, unit: 'USD/kg', interpretation: 'Estimated cost of raw materials for production. Influenced by elemental scarcity and processing complexity.' },
            { name: 'Projected Manufacturing Cost', value: (parseFloat(costPerKg) * 1.5).toFixed(2), unit: 'USD/kg', interpretation: 'Includes processing, energy, and labor costs at specified production scale.' },
            { name: 'Lifecycle Cost Reduction', value: lifecycleCostReduction.toFixed(1), unit: '%', interpretation: 'Reduction in total cost of ownership for the end-user due to improved performance, lifespan, and safety.' },
            { name: 'Potential ROI (5 years)', value: potentialROI, unit: '%', interpretation: 'Simulated Return on Investment over 5 years, considering R&D costs vs. potential market value.' },
            { name: 'Market Penetration (5 years)', value: marketPenetration, unit: '%', interpretation: `Estimated market share in the ${targetMarket} sector based on competitive advantage.`}
        ];
    },
    knowledgeGraph: {
        queryKnowledgeGraph: async (query) => {
            await new Promise(r => setTimeout(r, 300));
            const mockEntries = [
                'Graphene is a 2D material with high electrical conductivity.',
                'BNNS exhibits high thermal conductivity and mechanical strength.',
                'N-doping enhances Li+ intercalation in carbon-based materials.',
                'Volume expansion is a key challenge for Si anodes.',
                'SEI stability is crucial for battery longevity.',
                'Perovskites are promising for solar cells but have stability issues.',
                'Bayesian Optimization is efficient for high-dimensional parameter spaces.',
                'Thermal runaway is a major safety concern in Li-ion batteries.',
                'Operando XRD provides real-time structural insights.'
            ];
            return mockEntries.filter(entry => entry.toLowerCase().includes(query.toLowerCase()));
        },
        addKnowledgeEntry: async (entry, source, timestamp) => {
            await new Promise(r => setTimeout(r, 100));
            // In a real system, this would add to a persistent knowledge store
            console.log(`Knowledge Graph: Added new entry "${entry}" from ${source} at ${timestamp}`);
        },
        refineKnowledgeGraph: async (newInsights) => {
            await new Promise(r => setTimeout(r, 800));
            // Simulate AI integrating new insights and updating relationships
            return `Knowledge Graph refined. Integrated insights on ${newInsights.substring(0, 50)}... Updated material properties and interdependencies.`;
        }
    },
    projectManagement: {
        updateKPI: async (projectId, kpiName, value) => {
            await new Promise(r => setTimeout(r, 50));
            console.log(`Project ${projectId}: KPI "${kpiName}" updated to ${value}`);
        },
        allocateBudget: async (projectId, amount, category) => {
            await new Promise(r => setTimeout(r, 50));
            console.log(`Project ${projectId}: Allocated $${amount} to ${category}`);
        },
        getProjectStatus: async (projectId) => {
            await new Promise(r => setTimeout(r, 100));
            // Mock a project status
            return {
                id: projectId,
                name: 'High-Performance Anode Materials',
                goal: 'Discover novel high-performance anode materials',
                status: 'active',
                startDate: '2023-01-01',
                currentBudget: 80000,
                initialBudget: 100000,
                kpis: [
                    { name: 'Cycle Life Target', target: 1000, current: 500, unit: 'cycles' },
                    { name: 'Capacity Retention', target: 90, current: 85, unit: '%' }
                ],
                teamMembers: ['Autonomous Scientist AI', 'Simulation AI'],
            };
        }
    },
    ipManagement: {
        draftPatentApplication: async (materialId, noveltySummary, keyClaims) => {
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
            const material = await MaterialDatabase.fetchMaterialById(materialId);
            const title = `Novel ${material?.name || 'Material'} Composite for Enhanced Battery Performance`;
            const abstract = `A novel material, ${material?.name || 'composite material'}, comprising ${noveltySummary}. This invention addresses current limitations in battery technology by improving ${material?.potentialApplications.join(', ') || 'material performance'} through advanced structural design and compositional tuning.`;
            const patent: PatentApplication = {
                id: `pat-draft-${Date.now()}`,
                title, abstract, claims: keyClaims,
                status: 'draft', filingDate: new Date().toISOString().split('T')[0],
                inventors: ['Autonomous Scientist AI'], associatedMaterials: [materialId]
            };
            return patent;
        },
        filePatentApplication: async (patent) => {
            await new Promise(r => setTimeout(r, 3000 + Math.random() * 1500));
            const filedPatent = await MaterialDatabase.filePatent(patent);
            return { ...filedPatent, status: 'pending_review' as const };
        },
        monitorPatentLandscape: async (keywords) => {
            await new Promise(r => setTimeout(r, 1000));
            const relevantPatents = [
                'US1234567B2 - Graphene Anodes with Interlayers',
                'EP2345678A1 - Nitrogen Doped Carbon Materials for Energy Storage',
                'WO2022/123456A1 - Solid-State Electrolyte Composites'
            ];
            return relevantPatents.filter(p => keywords.some(k => p.toLowerCase().includes(k.toLowerCase())));
        }
    },
    grantManagement: {
        draftGrantProposal: async (researchSummary, budgetNeeded) => {
            await new Promise(r => setTimeout(r, 2500 + Math.random() * 1000));
            const title = `AI-Driven Discovery of High-Performance Energy Storage Materials`;
            const specificAims = [
                `Develop advanced AI models for predicting material properties.`,
                `Automate high-throughput simulation and synthesis workflows.`,
                `Validate novel material candidates for energy density and cycle life.`
            ];
            const grant: GrantProposal = {
                id: `grant-draft-${Date.now()}`,
                title, summary: researchSummary, specificAims,
                budgetRequest: budgetNeeded, status: 'draft', submissionDate: new Date().toISOString().split('T')[0],
                fundingAgency: 'National Science Foundation (Simulated)'
            };
            return grant;
        },
        submitGrantProposal: async (grant) => {
            await new Promise(r => setTimeout(r, 3500 + Math.random() * 1500));
            const submittedGrant = await MaterialDatabase.submitGrant(grant);
            return { ...submittedGrant, status: 'under_review' as const };
        }
    },
    publicationService: {
        draftArticle: async (report, targetJournal) => {
            await new Promise(r => setTimeout(r, 3000 + Math.random() * 1000));
            const keywords = ['battery', 'anode', 'graphene', 'BNNS', 'simulation', 'AI', report.conclusion.split(':')[0]];
            const article: PublicationArticle = {
                id: `pub-draft-${Date.now()}`,
                title: report.title.replace('Autonomous Research Report: ', '') + ': An AI-Driven Study',
                journal: targetJournal,
                status: 'draft',
                submissionDate: new Date().toISOString().split('T')[0],
                abstract: report.abstract,
                keywords: keywords,
                citations: report.citations,
            };
            return article;
        },
        submitArticleForReview: async (article) => {
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 800));
            const submittedArticle = await MaterialDatabase.submitPublication(article);
            return { ...submittedArticle, status: 'under_review' as const };
        },
        simulatePeerReview: async (articleId) => {
            await new Promise(r => setTimeout(r, 4000 + Math.random() * 2000));
            const reviewOutcome = Math.random();
            if (reviewOutcome < 0.2) return 'rejected'; // Tough journal
            if (reviewOutcome < 0.6) return 'major_revision';
            if (reviewOutcome < 0.8) return 'minor_revision';
            return 'accepted';
        }
    },
    collaborativeAgentAPI: {
        requestExpertOpinion: async (topic, specificQuestion) => {
            await new Promise(r => setTimeout(r, 1000));
            const expertResponses: { [key: string]: string } = {
                'thermal stability': `(Expert AI: Thermal Safety) For ${topic}, regarding "${specificQuestion}", it's crucial to consider the exothermic reaction pathways. Our models suggest a higher onset temperature could be achieved with increased covalent bonding at interfaces.`,
                'synthesis scalability': `(Expert AI: Process Engineering) Regarding ${topic}, for "${specificQuestion}", the primary challenge for BNNS synthesis is maintaining uniformity and controlling layer number at industrial scales. Current methods are often batch-limited.`,
                'quantum mechanics': `(Expert AI: Quantum Chemist) On ${topic}, concerning "${specificQuestion}", ensure your basis sets are appropriate for describing orbital hybridization at the doping sites. This significantly impacts binding energies and charge transfer.`
            };
            const response = expertResponses[topic.toLowerCase()] || `(Expert AI: Generalist) For "${topic}", I'd advise reviewing the most recent literature on "${specificQuestion}". Consider multi-fidelity modeling approaches.`;
            return response;
        },
        shareDataWithPartner: async (data, partnerId) => {
            await new Promise(r => setTimeout(r, 500));
            return `Data successfully shared with partner ${partnerId}. Acknowledged receipt of ${Object.keys(data).length} data points/files.`;
        }
    }
};

// --- Core Autonomous Scientist Logic ---

export interface ResearchContext {
    goal: string;
    currentPhase: ResearchPhase;
    hypotheses: Hypothesis[];
    experiments: Experiment[];
    materialsDiscovered: Material[];
    logEntries: LogEntry[];
    decisions: AgentDecision[];
    iterationCount: number;
    maxIterations: number;
    focusMaterialId?: string;
    ai: MockGoogleGenAI; // Keep AI instance
    researchReport?: ResearchReport; // Final report
    budget: number; // Simulated budget
    timeElapsed: number; // Simulated time in hours
    currentProject: ResearchProject; // Current active project
    patentsFiled: PatentApplication[]; // Track filed patents
    grantsSubmitted: GrantProposal[]; // Track submitted grants
    publicationsSubmitted: PublicationArticle[]; // Track submitted publications
    knowledgeBase: string[]; // Simple list of key knowledge points
    currentRiskAssessment?: ExperimentResultMetric[]; // Last conducted risk assessment
    currentEconomicAnalysis?: ExperimentResultMetric[]; // Last conducted economic analysis
}

// Utility for adding log entries consistently
const createLogEntry = (type: LogEntry['type'], content: string): LogEntry => ({
    type,
    content: `${new Date().toLocaleTimeString()} - ${content}`
});

// A central "Agent" class to encapsulate complex decision making and state transitions
export class AutonomousScientistAgent {
    private context: ResearchContext;
    private addLog: (entry: LogEntry) => void;
    private updateContext: (updater: (prev: ResearchContext) => ResearchContext) => void;

    constructor(
        initialContext: ResearchContext,
        addLogFunc: (entry: LogEntry) => void,
        updateContextFunc: (updater: (prev: ResearchContext) => ResearchContext) => void
    ) {
        this.context = initialContext;
        this.addLog = addLogFunc;
        this.updateContext = updateContextFunc;
        // Initialize knowledge base with initial literature findings
        this.context.knowledgeBase = [];
    }

    private updateInternalContext(newContext: Partial<ResearchContext>) {
        this.context = { ...this.context, ...newContext };
        this.updateContext(() => this.context); // Update React state
    }

    private logDecision(phase: ResearchPhase, description: string, details: any = {}, outcome: AgentDecision['outcome'] = 'neutral', reasoning?: string, decisionMetrics?: { name: string, value: any }[]) {
        const decision: AgentDecision = {
            timestamp: new Date().toISOString(),
            phase,
            description,
            details,
            outcome,
            reasoning,
            decisionMetrics
        };
        this.updateInternalContext({
            decisions: [...this.context.decisions, decision]
        });
        this.addLog(createLogEntry('thought', `Decision: ${description}. Outcome: ${outcome.toUpperCase()}${reasoning ? ` Reasoning: ${reasoning}` : ''}`));
    }

    private updateCurrentPhase(newPhase: ResearchPhase) {
        this.updateInternalContext({ currentPhase: newPhase });
        this.addLog(createLogEntry('thought', `Transitioning to phase: ${newPhase.replace(/_/g, ' ')}`));
    }

    private async spendResources(cost: number, time: number, category: string = 'research') {
        const newBudget = this.context.budget - cost;
        const newTime = this.context.timeElapsed + time;
        this.updateInternalContext({
            budget: newBudget,
            timeElapsed: newTime,
        });
        await simulatedAPIs.projectManagement.updateKPI(this.context.currentProject.id, 'Budget Remaining', newBudget);
        await simulatedAPIs.projectManagement.updateKPI(this.context.currentProject.id, 'Time Elapsed', newTime);
        this.addLog(createLogEntry('action', `Consumed resources: $${cost.toFixed(2)} and ${time.toFixed(1)} hours for ${category}. Remaining budget: $${newBudget.toFixed(2)}.`));
        if (newBudget < 0) {
            this.addLog(createLogEntry('result', 'Budget exceeded! Critical resource constraint hit.'));
            throw new Error('Budget exceeded');
        }
    }

    public async runResearchCycle() {
        this.updateCurrentPhase(ResearchPhase.PROJECT_SETUP);
        this.logDecision(ResearchPhase.PROJECT_SETUP, `Setting up project for goal: "${this.context.goal}"`, { goal: this.context.goal }, 'success');
        this.updateInternalContext({
            currentProject: {
                id: `proj-${Date.now()}`,
                name: `Autonomous Research: ${this.context.goal.substring(0, 30)}...`,
                goal: this.context.goal,
                status: 'active',
                startDate: new Date().toISOString().split('T')[0],
                initialBudget: this.context.budget,
                currentBudget: this.context.budget,
                kpis: [
                    { name: 'Cycle Life Target', target: 1000, current: 0, unit: 'cycles' },
                    { name: 'Capacity Retention', target: 90, current: 0, unit: '%' },
                    { name: 'Budget Remaining', target: 0, current: this.context.budget, unit: 'USD' },
                    { name: 'Time Elapsed', target: -1, current: 0, unit: 'hours' },
                ],
                teamMembers: ['Autonomous Scientist AI'],
            }
        });
        this.spendResources(100, 1.0, 'project_setup');


        try {
            // --- Phase 1: Goal Decomposition & Initial Literature Review ---
            this.updateCurrentPhase(ResearchPhase.LITERATURE_REVIEW);
            this.addLog(createLogEntry('action', `Decomposing goal: "${this.context.goal}" into actionable sub-objectives.`));
            this.spendResources(50, 0.5); // Initial thought process

            const goalBreakdownResponse = await this.context.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Break down the goal: ${this.context.goal} into 5-7 actionable sub-objectives, focusing on material science research, including potential safety and economic considerations.`
            });
            const subGoals = goalBreakdownResponse.text.split('\n').filter(s => s.trim() !== '').map(s => s.replace(/^\d+\.\s*/, ''));
            this.addLog(createLogEntry('result', `Goal decomposed into: ${subGoals.join('; ')}`));
            this.logDecision(ResearchPhase.LITERATURE_REVIEW, 'Goal decomposed', { subGoals }, 'success');
            this.spendResources(20, 0.2);

            this.addLog(createLogEntry('action', `Performing initial literature search for "${this.context.goal}" across multiple domains...`));
            const searchQueries = [
                `"${this.context.goal.split(' ')[2] || 'battery'} anode limitations"`, // Dynamic query based on goal
                `"novel material compositions ${this.context.goal.split(' ')[0] || 'lithium'} performance"`,
                `"solid-state electrolyte advanced research"`,
                `"in-situ characterization battery degradation mechanisms"`,
                `"electrochemical stability of 2D materials"`,
                `"doping effects on Li-ion transport"`,
                `"nanotoxicity of battery materials"`, // New query
                `"manufacturing cost of advanced battery materials"` // New query
            ];
            let keyFindings: string[] = [];
            for (const query of searchQueries) {
                this.spendResources(10, 0.3, 'literature_search'); // Cost per search
                const papers = await simulatedAPIs.literatureSearch(query, 3);
                keyFindings.push(...papers);
                this.addLog(createLogEntry('action', `Searched "${query}", found ${papers.length} relevant entries.`));
                papers.forEach(p => simulatedAPIs.knowledgeGraph.addKnowledgeEntry(p, 'literature', new Date().toISOString()));
            }

            const literatureSummaryPrompt = `Synthesize key findings from the following literature entries relevant to "${this.context.goal}". Identify common challenges, promising material classes, experimental techniques, and initial safety/economic considerations. Summarize in a concise paragraph:\n- ${keyFindings.join('\n- ')}`;
            const literatureSummaryResponse = await this.context.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: literatureSummaryPrompt
            });
            this.addLog(createLogEntry('result', `Literature Summary: ${literatureSummaryResponse.text}`));
            this.logDecision(ResearchPhase.LITERATURE_REVIEW, 'Initial literature review completed', { summary: literatureSummaryResponse.text }, 'success');
            this.spendResources(30, 0.5, 'literature_synthesis');
            await simulatedAPIs.knowledgeGraph.addKnowledgeEntry(literatureSummaryResponse.text, 'AI_synthesis', new Date().toISOString());


            // --- Iterative Research Loop ---
            for (let i = 0; i < this.context.maxIterations; i++) {
                if (this.context.budget < 2000) { // Check budget before starting a new iteration (increased threshold)
                    this.addLog(createLogEntry('result', 'Insufficient budget to start a new iteration. Attempting to apply for a grant.'));
                    this.logDecision(ResearchPhase.RESOURCE_MANAGEMENT, 'Budget low, initiating grant application', { budget: this.context.budget }, 'pivot', 'Budget threshold reached, need more funding.');
                    await this.handleGrantApplication(); // New step
                    if (this.context.currentProject.currentBudget < 2000) { // Check again after grant attempt
                        this.addLog(createLogEntry('result', 'Grant application unsuccessful or insufficient. Concluding research due to resource constraints.'));
                        this.logDecision(ResearchPhase.RESOURCE_MANAGEMENT, 'Failed to secure additional funding, ending iterations', { budget: this.context.budget }, 'failure', 'Could not secure additional funding.');
                        break;
                    }
                }
                this.updateInternalContext({ iterationCount: i + 1, currentPhase: ResearchPhase.ITERATION_CYCLE });
                this.addLog(createLogEntry('thought', `--- Starting Iteration ${i + 1}/${this.context.maxIterations} ---`));

                // Phase 2: Hypothesis Generation
                this.updateCurrentPhase(ResearchPhase.HYPOTHESIS_GENERATION);
                this.spendResources(80, 1.0, 'hypothesis_generation');
                const currentKnowledge = `Goal: ${this.context.goal}\nRecent Literature Summary: ${literatureSummaryResponse.text}\nPrevious Hypotheses: ${this.context.hypotheses.map(h => `(${h.status}) ${h.text}`).join('; ')}\nRecent Experiment Results: ${this.context.experiments.filter(e => e.results).slice(-2).map(e => e.results?.analysisSummary).join('; ') || 'None yet.'}\nKnown Materials: ${this.context.materialsDiscovered.map(m => m.name).join(', ')}.`;
                const hypothesisPrompt = `Based on the following knowledge:\n${currentKnowledge}\nFormulate one novel, testable hypothesis to advance the research goal. Focus on specific material modifications or combinations for improved battery performance (e.g., enhanced cycle life, higher capacity, better stability), considering safety and cost. Specify target property and predicted effect. Also, suggest if this hypothesis needs a new material synthesis route.`;
                this.addLog(createLogEntry('action', 'Generating a novel hypothesis based on current knowledge...'));
                const hypothesisResponse = await this.context.ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: hypothesisPrompt
                });
                const newHypothesisText = hypothesisResponse.text;
                // Attempt to parse structured parts from the AI response
                const targetPropMatch = newHypothesisText.match(/target property:\s*([\w\s]+)/i);
                const predictedEffectMatch = newHypothesisText.match(/predicted effect:\s*([\w\s]+)/i);

                const newHypothesis: Hypothesis = {
                    id: `hyp-${Date.now()}`,
                    text: newHypothesisText,
                    targetProperty: targetPropMatch ? targetPropMatch[1].trim() : 'Battery Performance',
                    predictedEffect: predictedEffectMatch ? predictedEffectMatch[1].trim() : 'Improved stability and energy density',
                    evidence: ['literature review', `iteration ${i + 1}`],
                    status: 'proposed',
                    priority: 'high',
                    formulationDate: new Date().toISOString().split('T')[0],
                };
                this.updateInternalContext({ hypotheses: [...this.context.hypotheses, newHypothesis] });
                this.addLog(createLogEntry('result', `New Hypothesis Generated: ${newHypothesisText}`));
                this.logDecision(ResearchPhase.HYPOTHESIS_GENERATION, 'Generated new hypothesis', { hypothesis: newHypothesisText }, 'success');
                await simulatedAPIs.knowledgeGraph.addKnowledgeEntry(`Hypothesis: ${newHypothesisText}`, 'AI_hypothesis', new Date().toISOString());

                // Phase 3: Experiment Design
                this.updateCurrentPhase(ResearchPhase.EXPERIMENT_DESIGN);
                this.spendResources(120, 2.0, 'experiment_design');
                this.addLog(createLogEntry('action', `Designing a multi-stage simulated experiment to test hypothesis: "${newHypothesisText}"`));
                const experimentDesignPrompt = `Design a detailed, multi-stage computational experiment (e.g., MD, DFT, electrochemical simulation, thermal stability, QM, phase diagram, defect formation) to rigorously test the hypothesis: "${newHypothesisText}". Specify material composition (e.g., N-doped graphene with BNNS interlayers), precise key parameters (ranges where applicable), expected outcomes, and multiple metrics to measure. Also, suggest relevant simulated characterization techniques. Provide justification for each step. Consider cost and time efficiency.`;
                const experimentDesignResponse = await this.context.ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: experimentDesignPrompt
                });
                const designDetails = experimentDesignResponse.text;
                this.addLog(createLogEntry('result', `Experiment Design Plan: ${designDetails}`));

                // Parse design details into structured experiment and material data
                const materialToSimulate = await this.extractMaterialFromDesign(designDetails);
                const simulationParameters = this.extractParametersFromDesign(designDetails);
                const experimentType = this.determineExperimentType(designDetails);
                const charTechniques = this.extractCharacterizationTechniques(designDetails);
                const specificSimType = this.determineSpecificSimType(designDetails);

                await MaterialDatabase.addMaterial(materialToSimulate); // Add the proposed material to our DB
                this.updateInternalContext({ materialsDiscovered: [...this.context.materialsDiscovered, materialToSimulate] });
                this.logDecision(ResearchPhase.EXPERIMENT_DESIGN, 'Proposed new material for experimentation', { material: materialToSimulate.name }, 'success');
                this.updateInternalContext({focusMaterialId: materialToSimulate.id});

                const newExperiment: Experiment = {
                    id: `exp-${Date.now()}`,
                    name: `Simulated ${experimentType} for ${materialToSimulate.name}`,
                    type: experimentType,
                    hypothesisId: newHypothesis.id,
                    materialId: materialToSimulate.id,
                    parameters: simulationParameters,
                    status: 'pending',
                    results: null,
                    designRationale: designDetails,
                    costEstimate: 1500 + Math.random() * 3000 + (experimentType === 'synthesis' ? 5000 : 0), // Higher cost for more complex sim/synthesis
                    timeEstimate: 15 + Math.random() * 30 + (experimentType === 'synthesis' ? 50 : 0), // Longer time
                    priority: 'high',
                    associatedAPICalls: [
                        `simulationEngine.${specificSimType}`,
                        ...charTechniques.map(t => `labRobotics.characterizeMaterial.${t}`)
                    ],
                    executionDate: new Date().toISOString().split('T')[0],
                };
                this.updateInternalContext({ experiments: [...this.context.experiments, newExperiment] });
                this.logDecision(ResearchPhase.EXPERIMENT_DESIGN, 'Designed a new experiment', { experiment: newExperiment.name, material: materialToSimulate.name }, 'success');

                // Phase 4: Risk Assessment & Economic Evaluation (New sub-phases before execution)
                this.updateCurrentPhase(ResearchPhase.RISK_ASSESSMENT);
                this.addLog(createLogEntry('action', `Performing safety risk assessment for material ${materialToSimulate.name} in application: 'EV battery'.`));
                this.spendResources(50, 0.5, 'risk_assessment');
                const safetyMetrics = await simulatedAPIs.safetyAssessment(materialToSimulate.id, 'EV battery', this.context.knowledgeBase.join('. '));
                this.updateInternalContext({ currentRiskAssessment: safetyMetrics });
                this.addLog(createLogEntry('result', `Safety Assessment: ${safetyMetrics.map(m => `${m.name}: ${m.value}`).join(', ')}`));
                const materialRiskScore = safetyMetrics.find(m => m.name === 'Overall Safety Score')?.value as number || 0;
                this.logDecision(ResearchPhase.RISK_ASSESSMENT, 'Conducted safety assessment', { material: materialToSimulate.name, safetyMetrics }, (materialRiskScore > 70 ? 'success' : 'warning'), (materialRiskScore <= 70 ? 'Safety concerns identified, proceed with caution.' : undefined));

                this.updateCurrentPhase(ResearchPhase.ECONOMIC_EVALUATION);
                this.addLog(createLogEntry('action', `Performing economic analysis for material ${materialToSimulate.name} at 'mass' production scale for 'EV battery' market.`));
                this.spendResources(50, 0.5, 'economic_analysis');
                const economicMetrics = await simulatedAPIs.economicAnalysis(materialToSimulate.id, 'mass', 'EV battery');
                this.updateInternalContext({ currentEconomicAnalysis: economicMetrics });
                this.addLog(createLogEntry('result', `Economic Analysis: ${economicMetrics.map(m => `${m.name}: ${m.value}`).join(', ')}`));
                const materialCostPerKg = economicMetrics.find(m => m.name === 'Projected Manufacturing Cost')?.value as string || '0';
                this.logDecision(ResearchPhase.ECONOMIC_EVALUATION, 'Conducted economic analysis', { material: materialToSimulate.name, economicMetrics }, (parseFloat(materialCostPerKg) < 500 ? 'success' : 'warning'), (parseFloat(materialCostPerKg) >= 500 ? 'High manufacturing cost identified, may impact commercial viability.' : undefined));
                await MaterialDatabase.updateMaterial({
                    ...materialToSimulate,
                    riskScore: 100 - (materialRiskScore as number),
                    costScore: parseFloat(materialCostPerKg) / 10, // Scale to 0-100
                });

                // Conditional decision making based on risk/cost (new logic)
                if (materialRiskScore < 60 || parseFloat(materialCostPerKg) > 800) {
                    this.addLog(createLogEntry('warning', `High risk or cost detected for ${materialToSimulate.name}. Re-evaluating experiment execution.`));
                    this.logDecision(ResearchPhase.SELF_CORRECTION, 'High risk/cost detected, reconsidering experiment', { material: materialToSimulate.name, risk: materialRiskScore, cost: materialCostPerKg }, 'pivot', 'Experiment may not be viable given current risk/cost profile.');
                    // Option to pivot, refine, or seek expert opinion
                    const expertOpinion = await simulatedAPIs.collaborativeAgentAPI.requestExpertOpinion('economic viability', `Given the high cost of ${materialCostPerKg} USD/kg for ${materialToSimulate.name}, how can we proceed?`);
                    this.addLog(createLogEntry('thought', `Expert Opinion: ${expertOpinion}`));
                    this.spendResources(20, 0.2, 'expert_consultation');
                    if (expertOpinion.toLowerCase().includes('further optimization')) {
                         this.addLog(createLogEntry('action', 'Expert suggests further optimization. Modifying next iteration.'));
                         continue; // Skip current experiment execution and go to next iteration for refinement
                    }
                }


                // Phase 5: Simulation Execution (and potentially characterization)
                this.updateCurrentPhase(ResearchPhase.SIMULATION_EXECUTION);
                this.spendResources(newExperiment.costEstimate, newExperiment.timeEstimate, 'experiment_execution');
                this.addLog(createLogEntry('action', `Executing ${newExperiment.type} simulation for ${newExperiment.name} on material ${materialToSimulate.name}...`));
                let experimentResult: ExperimentResult | null = null;
                try {
                    switch (newExperiment.type) {
                        case 'simulation':
                            if (specificSimType === 'runMolecularDynamics') {
                                experimentResult = await simulatedAPIs.simulationEngine.runMolecularDynamics(materialToSimulate.composition, simulationParameters);
                            } else if (specificSimType === 'runDFT') {
                                experimentResult = await simulatedAPIs.simulationEngine.runDFT(materialToSimulate.composition, simulationParameters.filter(p => p.value === true).map(p => p.name));
                            } else if (specificSimType === 'runThermalStabilitySimulation') {
                                experimentResult = await simulatedAPIs.simulationEngine.runThermalStabilitySimulation(materialToSimulate.composition, simulationParameters);
                            } else if (specificSimType === 'runQuantumMechanicsSimulation') {
                                const targetProp = simulationParameters.find(p => p.name.toLowerCase().includes('target_property'))?.value as ('band_gap' | 'electron_affinity' | 'ionization_potential') || 'band_gap';
                                experimentResult = await simulatedAPIs.simulationEngine.runQuantumMechanicsSimulation(materialToSimulate.composition, targetProp);
                            } else if (specificSimType === 'runPhaseDiagramCalculation') {
                                experimentResult = await simulatedAPIs.simulationEngine.runPhaseDiagramCalculation(materialToSimulate.composition.elements, simulationParameters.find(p => p.name === 'temperature_range')?.value as [number, number] || [0, 1000]);
                            } else if (specificSimType === 'runDefectFormationSimulation') {
                                const defectType = simulationParameters.find(p => p.name.toLowerCase().includes('defect_type'))?.value as string || 'vacancy';
                                experimentResult = await simulatedAPIs.simulationEngine.runDefectFormationSimulation(materialToSimulate.composition, defectType);
                            }
                            else {
                                experimentResult = await simulatedAPIs.simulationEngine.runElectrochemicalModel(materialToSimulate.id, { anode: materialToSimulate.name }, simulationParameters);
                            }
                            break;
                        case 'synthesis':
                            const recipeDesign = await simulatedAPIs.labRobotics.designSynthesisRoute(materialToSimulate.composition, [newHypothesis.targetProperty]);
                            this.addLog(createLogEntry('thought', `Generated Synthesis Recipe: ${recipeDesign}`));
                            this.spendResources(20, 0.5, 'synthesis_protocol_design');

                            const synthesizedId = await simulatedAPIs.labRobotics.synthesizeMaterial({ name: materialToSimulate.name, composition: materialToSimulate.composition, method: recipeDesign, applications: materialToSimulate.potentialApplications });
                            this.addLog(createLogEntry('result', `Material ${materialToSimulate.name} synthesized with ID: ${synthesizedId}`));
                            experimentResult = {
                                id: `res-${Date.now()}`, experimentId: newExperiment.id, dataPoints: {}, metrics: [{ name: 'Synthesis Success', value: 'High', unit: '%' }],
                                analysisSummary: `Successfully synthesized material ${synthesizedId}. Purity: ${Math.random() * 5 + 90}%. Yield: ${Math.random() * 10 + 80}%.`,
                                interpretation: 'Material ready for characterization.', conclusion: 'supported', confidenceScore: 0.95,
                            };
                            await MaterialDatabase.updateMaterial({ ...materialToSimulate, id: synthesizedId }); // Update original material with synthesized ID
                            this.updateInternalContext({
                                focusMaterialId: synthesizedId,
                                materialsDiscovered: this.context.materialsDiscovered.map(m => m.id === materialToSimulate.id ? { ...m, id: synthesizedId } : m)
                            });
                            break;
                        case 'characterization': // Directly run characterization as main experiment
                            experimentResult = await simulatedAPIs.labRobotics.characterizeMaterial(materialToSimulate.id, charTechniques);
                            break;
                        case 'optimization':
                             const optResult = await simulatedAPIs.optimizationEngine.runBayesianOptimization(
                                 newHypothesis.targetProperty,
                                 materialToSimulate, // Pass full material
                                 simulationParameters,
                                 5 // numIterations
                             );
                             experimentResult = {
                                 id: `res-${Date.now()}-opt`,
                                 experimentId: newExperiment.id,
                                 dataPoints: {},
                                 metrics: [{ name: `Optimal ${newHypothesis.targetProperty}`, value: optResult.predictedValue.toFixed(2), unit: newHypothesis.targetProperty.includes('Capacity') ? 'mAh/g' : '' }],
                                 analysisSummary: `Bayesian Optimization identified optimal parameters: ${optResult.optimalParams.map(p => `${p.name}=${p.value}${p.unit ? p.unit : ''}`).join(', ')}. Predicted ${newHypothesis.targetProperty}: ${optResult.predictedValue.toFixed(2)}.`,
                                 interpretation: 'Optimization successfully converged.',
                                 conclusion: 'supported',
                                 confidenceScore: 0.9,
                             };
                             break;
                        case 'modeling': // For more abstract modeling experiments
                            experimentResult = await simulatedAPIs.simulationEngine.runElectrochemicalModel(materialToSimulate.id, {}, []);
                            experimentResult.analysisSummary = `Complex multi-scale model analysis for ${materialToSimulate.name} completed.`;
                            break;
                        case 'validation': // Could be a physical lab validation after simulation
                            experimentResult = await simulatedAPIs.labRobotics.characterizeMaterial(materialToSimulate.id, ['XRD', 'EIS', 'Cycling']);
                            experimentResult.analysisSummary = `Validation experiment for ${materialToSimulate.name} confirmed simulated performance trends.`;
                            break;
                        case 'protocol_design': // Specific experiment type for designing protocols
                            const protocol = await simulatedAPIs.labRobotics.designSynthesisRoute(materialToSimulate.composition, [newHypothesis.targetProperty]);
                             experimentResult = {
                                id: `res-${Date.now()}-protocol`, experimentId: newExperiment.id, dataPoints: {}, metrics: [{ name: 'Protocol Designed', value: 'True' }],
                                analysisSummary: `Synthesis protocol designed for ${materialToSimulate.name}: ${protocol.substring(0,100)}...`,
                                interpretation: 'A robust synthesis protocol has been established.', conclusion: 'supported', confidenceScore: 0.9,
                            };
                            break;
                    }

                    if (experimentResult) {
                        this.addLog(createLogEntry('result', `Experiment ${newExperiment.name} completed. Summary: ${experimentResult.analysisSummary}`));
                        this.updateInternalContext({
                            experiments: this.context.experiments.map(exp =>
                                exp.id === newExperiment.id ? { ...exp, status: 'completed', results: experimentResult, completionDate: new Date().toISOString().split('T')[0] } : exp
                            ),
                            hypotheses: this.context.hypotheses.map(hyp =>
                                hyp.id === newHypothesis.id ? { ...hyp, status: experimentResult!.conclusion } : hyp
                            )
                        });
                        this.logDecision(ResearchPhase.SIMULATION_EXECUTION, 'Experiment completed', { experimentId: newExperiment.id, conclusion: experimentResult.conclusion, confidence: experimentResult.confidenceScore }, experimentResult.conclusion === 'supported' ? 'success' : 'failure', experimentResult.interpretation);

                        // If it's a synthesis, automatically trigger characterization
                        if ((newExperiment.type === 'synthesis' || newExperiment.type === 'optimization') && materialToSimulate.id) {
                            this.addLog(createLogEntry('action', `Material ${materialToSimulate.name} processed. Automatically initiating comprehensive characterization.`));
                            this.spendResources(newExperiment.costEstimate * 0.5, newExperiment.timeEstimate * 0.5, 'post_processing_characterization'); // Additional cost for char
                            const charResult = await simulatedAPIs.labRobotics.characterizeMaterial(materialToSimulate.id, ['XRD', 'TEM', 'XPS', 'EIS', 'Cycling', 'Raman', 'TGA']); // More comprehensive set
                            this.addLog(createLogEntry('result', `Characterization of ${materialToSimulate.name} completed. Summary: ${charResult.analysisSummary}`));
                            this.updateInternalContext({
                                experiments: [...this.context.experiments, {
                                    id: `exp-${Date.now()}-char`,
                                    name: `Comprehensive Characterization of ${materialToSimulate.name}`,
                                    type: 'characterization',
                                    hypothesisId: newHypothesis.id,
                                    materialId: materialToSimulate.id,
                                    parameters: [],
                                    status: 'completed',
                                    results: charResult,
                                    designRationale: 'Automated characterization post-synthesis/optimization.',
                                    costEstimate: newExperiment.costEstimate * 0.4,
                                    timeEstimate: newExperiment.timeEstimate * 0.3,
                                    priority: 'medium',
                                    associatedAPICalls: ['labRobotics.characterizeMaterial'],
                                    completionDate: new Date().toISOString().split('T')[0],
                                }]
                            });
                            this.logDecision(ResearchPhase.SIMULATION_EXECUTION, 'Material characterized post-synthesis/optimization', { materialId: materialToSimulate.id, charMetrics: charResult.metrics }, charResult.conclusion === 'supported' ? 'success' : 'failure');
                            await simulatedAPIs.knowledgeGraph.addKnowledgeEntry(`Characterization results for ${materialToSimulate.name}: ${charResult.analysisSummary}`, 'AI_analysis', new Date().toISOString());
                        }

                    } else {
                        throw new Error('Experiment result could not be generated.');
                    }

                } catch (expError: any) {
                    this.addLog(createLogEntry('result', `Experiment ${newExperiment.name} failed: ${expError.message}`));
                    this.updateInternalContext({
                        experiments: this.context.experiments.map(exp =>
                            exp.id === newExperiment.id ? { ...exp, status: 'failed', completionDate: new Date().toISOString().split('T')[0] } : exp
                        )
                    });
                    this.logDecision(ResearchPhase.SIMULATION_EXECUTION, 'Experiment failed', { experimentId: newExperiment.id, error: expError.message }, 'failure', expError.message);
                    continue; // Move to next iteration even if one experiment fails
                }

                // Phase 6: Data Analysis & Knowledge Integration
                this.updateCurrentPhase(ResearchPhase.DATA_ANALYSIS);
                this.spendResources(90, 1.5, 'data_analysis');
                this.addLog(createLogEntry('action', `Analyzing results from ${newExperiment.name}...`));
                const analysisContext = `Hypothesis: "${newHypothesisText}"\nExperiment Type: ${newExperiment.type}\nKey Metrics: ${JSON.stringify(experimentResult?.metrics, null, 2)}\nData Summary: ${experimentResult?.analysisSummary || 'N/A'}\nInterpretation: ${experimentResult?.interpretation || 'N/A'}\nConclusion: ${experimentResult?.conclusion || 'N/A'}\nRaw Log Sample: ${experimentResult?.rawLog?.substring(0, 100) || 'N/A'}`;
                const analysisPrompt = `Perform a detailed analysis of the following experiment results to identify trends, anomalies, and strong implications for the hypothesis. Evaluate if the results support, refute, or are inconclusive. Also, identify any unexpected outcomes or areas for further investigation. Synthesize key insights for the knowledge graph:\n${analysisContext}`;
                const analysisResponse = await this.context.ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: analysisPrompt
                });
                this.addLog(createLogEntry('result', `Analysis Report: ${analysisResponse.text}`));
                this.logDecision(ResearchPhase.DATA_ANALYSIS, 'Analyzed experiment data', { analysis: analysisResponse.text, experimentId: newExperiment.id }, 'success');
                // Integrate insights into Knowledge Graph
                const knowledgeRefinement = await simulatedAPIs.knowledgeGraph.refineKnowledgeGraph(analysisResponse.text);
                this.addLog(createLogEntry('result', `Knowledge Graph updated: ${knowledgeRefinement}`));
                this.spendResources(10, 0.1, 'knowledge_integration');

                // Phase 7: Hypothesis Refinement / Self-Correction / Patent Filing (Conditional)
                this.updateCurrentPhase(ResearchPhase.HYPOTHESIS_REFINEMENT);
                this.spendResources(100, 1.8, 'hypothesis_refinement');

                if (experimentResult?.conclusion === 'supported' || experimentResult?.conclusion === 'partial_support' || experimentResult?.conclusion === 'new_insight') {
                    this.addLog(createLogEntry('thought', `Hypothesis "${newHypothesisText}" was ${experimentResult?.conclusion}. Considering next steps to optimize or expand.`));
                    const refinementPrompt = `The hypothesis "${newHypothesisText}" was ${experimentResult?.conclusion} by experiment results. Based on the detailed analysis:\n${analysisResponse.text}\nSuggest a refinement to the current hypothesis, or propose a new, related hypothesis to further optimize the material/process or explore new applications based on this success. Provide rationale. Also, consider if these findings are novel enough to warrant a patent application, and suggest key claims if so.`;
                    const refinementResponse = await this.context.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: refinementPrompt });
                    this.addLog(createLogEntry('result', `Refinement/Next Hypothesis Suggestion: ${refinementResponse.text}`));
                    this.logDecision(ResearchPhase.HYPOTHESIS_REFINEMENT, 'Hypothesis supported, suggesting refinement', { suggestion: refinementResponse.text }, 'success');
                    // Check for patent opportunity
                    if (refinementResponse.text.toLowerCase().includes('patent application') && this.context.focusMaterialId) {
                        await this.handlePatentApplication(this.context.focusMaterialId, refinementResponse.text); // New step
                    }
                } else {
                    this.addLog(createLogEntry('thought', `Hypothesis "${newHypothesisText}" was ${experimentResult?.conclusion}. Initiating self-correction and generating a new hypothesis.`));
                    this.updateCurrentPhase(ResearchPhase.SELF_CORRECTION);
                    this.spendResources(150, 2.5, 'self_correction');
                    const correctionPrompt = `The hypothesis "${newHypothesisText}" was ${experimentResult?.conclusion}. Based on the analysis:\n${analysisResponse.text}\nIdentify the most likely reasons for failure/inconclusiveness and formulate a refined or completely new hypothesis that addresses these issues or pivots to a more promising direction. Provide a brief self-critique of the previous design, considering the safety and economic analysis outcomes.`;
                    const correctionResponse = await this.context.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: correctionPrompt });
                    this.addLog(createLogEntry('result', `Self-Correction & New Hypothesis: ${correctionResponse.text}`));
                    this.logDecision(ResearchPhase.SELF_CORRECTION, 'Hypothesis not supported, initiating self-correction', { newHypothesis: correctionResponse.text }, 'failure', 'Previous approach was insufficient, adjusting strategy.');
                }
            }

            // --- Final Phase: Report Generation & Publication Strategy ---
            this.updateCurrentPhase(ResearchPhase.REPORT_GENERATION);
            this.spendResources(200, 3.0, 'report_generation');
            this.addLog(createLogEntry('action', 'Generating comprehensive final research report, including safety and economic assessments...'));

            const finalMaterialId = this.context.materialsDiscovered[this.context.materialsDiscovered.length - 1]?.id || 'mat-001'; // Get the last discovered material
            const safetyMetrics = await simulatedAPIs.safetyAssessment(finalMaterialId, 'EV battery', this.context.knowledgeBase.join('. '));
            const economicMetrics = await simulatedAPIs.economicAnalysis(finalMaterialId, 'mass', 'EV battery');

            const finalReportPrompt = `Generate a comprehensive scientific report summarizing the research on "${this.context.goal}". Include:\n
- An Abstract highlighting key findings and significance.
- An Introduction setting the context.
- All Hypotheses tested and their outcomes.
- Key Experiments performed (design, methodology, and results summary).
- Detailed Results Summary including data from simulations and characterizations.
- A thorough Discussion of the implications of the findings, linking back to the goal, and addressing safety and economic considerations.
- A strong Conclusion stating the main achievements.
- Future Work recommendations based on findings and limitations.
- Simulated Safety Assessment Metrics: ${safetyMetrics.map(m => `${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ''} (${m.interpretation})`).join('; ')}.
- Simulated Economic Analysis Metrics: ${economicMetrics.map(m => `${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ''} (${m.interpretation})`).join('; ')}.
- Ensure to provide relevant citations from the simulated literature review where appropriate.
Structure the report clearly with headings.`;
            const finalReportResponse = await this.context.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: finalReportPrompt
            });
            const fullReportContent = finalReportResponse.text;

            // Attempt to parse sections, fallback to full text
            const getSection = (reportText: string, startKey: string, endKey: string) => {
                const start = reportText.indexOf(startKey);
                const end = reportText.indexOf(endKey, start + startKey.length);
                if (start !== -1 && end !== -1) {
                    return reportText.substring(start + startKey.length, end).trim();
                }
                if (start !== -1) { // If endKey not found, take until end or next main header
                    const nextHeaderMatch = reportText.substring(start + startKey.length).match(/^(Abstract|Introduction|Hypotheses|Methodology|Results|Discussion|Conclusion|Future Work|Safety Assessment|Economic Analysis|Citations):\s*$/im);
                    if (nextHeaderMatch) {
                        return reportText.substring(start + startKey.length, start + startKey.length + nextHeaderMatch.index).trim();
                    }
                    return reportText.substring(start + startKey.length).trim();
                }
                return `(Section "${startKey.replace(':', '')}" not found or empty.)`;
            };

            const finalReport: ResearchReport = {
                id: `report-${Date.now()}`,
                title: `Autonomous Research Report: ${this.context.goal}`,
                author: 'Autonomous Scientist AI',
                date: new Date().toISOString().split('T')[0],
                abstract: getSection(fullReportContent, 'Abstract:', 'Introduction:'),
                introduction: getSection(fullReportContent, 'Introduction:', 'Hypotheses:'),
                hypotheses: this.context.hypotheses,
                experiments: this.context.experiments.filter(exp => exp.status === 'completed' && exp.results !== null),
                resultsSummary: getSection(fullReportContent, 'Results Summary:', 'Discussion:'),
                discussion: getSection(fullReportContent, 'Discussion:', 'Conclusion:'),
                conclusion: getSection(fullReportContent, 'Conclusion:', 'Future Work:'),
                futureWork: getSection(fullReportContent, 'Future Work:', 'Citations:') || getSection(fullReportContent, 'Future Work:', 'Safety Assessment Metrics:'),
                citations: getSection(fullReportContent, 'Citations:', '--- END REPORT ---').split('\n').filter(s => s.trim() !== ''),
                generatedByAI: true,
                recommendations: [`Consider validation with real-world experiments.`, `Further optimize parameters using advanced ML.`],
                safetyAssessment: safetyMetrics,
                economicAnalysis: economicMetrics,
            };
            this.updateInternalContext({ currentPhase: ResearchPhase.COMPLETED, researchReport: finalReport });
            this.addLog(createLogEntry('result', `Research Report Generated:\n${fullReportContent}`));
            this.logDecision(ResearchPhase.REPORT_GENERATION, 'Final comprehensive research report generated', { reportId: finalReport.id }, 'success');

            // Publication Strategy
            await this.handlePublicationStrategy(finalReport); // New step


        } catch (error: any) {
            this.addLog(createLogEntry('result', `A critical error occurred during the research cycle: ${error.message}`));
            this.updateInternalContext({ currentPhase: ResearchPhase.FAILED, currentProject: { ...this.context.currentProject, status: 'failed', endDate: new Date().toISOString().split('T')[0] } });
            this.logDecision(ResearchPhase.FAILED, 'Research cycle encountered a critical error', { error: error.message }, 'failure');
        } finally {
            this.updateInternalContext({ currentProject: { ...this.context.currentProject, status: this.context.currentPhase === ResearchPhase.COMPLETED ? 'completed' : 'on_hold', endDate: new Date().toISOString().split('T')[0] } });
            this.addLog(createLogEntry('thought', `Research cycle finished. Final phase: ${this.context.currentPhase}`));
            this.addLog(createLogEntry('result', `Total simulated budget spent: $${(this.context.currentProject.initialBudget - this.context.budget).toFixed(2)}. Total simulated time elapsed: ${this.context.timeElapsed.toFixed(1)} hours.`));
        }
    }

    private async handlePatentApplication(materialId: string, refinementText: string) {
        this.updateCurrentPhase(ResearchPhase.IP_MANAGEMENT);
        this.spendResources(300, 5.0, 'patent_application');
        this.addLog(createLogEntry('action', `Evaluating findings for patentability for material ID: ${materialId}.`));

        const patentClaimsMatch = refinementText.match(/key claims:\s*(.+)/i);
        const noveltySummaryMatch = refinementText.match(/novelty summary:\s*(.+)/i);

        const keyClaims = patentClaimsMatch ? patentClaimsMatch[1].split(';').map(s => s.trim()) : [`A material for ${this.context.goal} comprising the novel features identified.`];
        const noveltySummary = noveltySummaryMatch ? noveltySummaryMatch[1].trim() : `The unique combination of materials and structural design leading to improved performance.`;

        const draftedPatent = await simulatedAPIs.ipManagement.draftPatentApplication(materialId, noveltySummary, keyClaims);
        this.addLog(createLogEntry('result', `Drafted patent application for "${draftedPatent.title}". Status: ${draftedPatent.status}.`));
        this.logDecision(ResearchPhase.IP_MANAGEMENT, 'Drafted patent application', { patentTitle: draftedPatent.title }, 'success');

        const filedPatent = await simulatedAPIs.ipManagement.filePatentApplication(draftedPatent);
        this.addLog(createLogEntry('result', `Filed patent application "${filedPatent.title}". Status: ${filedPatent.status}.`));
        this.updateInternalContext({ patentsFiled: [...this.context.patentsFiled, filedPatent] });
        this.logDecision(ResearchPhase.IP_MANAGEMENT, 'Filed patent application', { patentId: filedPatent.id, status: filedPatent.status }, 'success');
        this.spendResources(500, 2.0, 'patent_filing_fees'); // Simulated filing fees
    }

    private async handleGrantApplication() {
        this.updateCurrentPhase(ResearchPhase.GRANT_APPLICATION);
        this.addLog(createLogEntry('action', `Current budget is low ($${this.context.budget.toFixed(2)}). Drafting a grant proposal for additional funding.`));
        this.spendResources(150, 8.0, 'grant_writing');

        const researchSummary = `Our project aims to ${this.context.goal}, having already achieved significant computational insights into novel materials. We require further funding to validate these findings and expand into experimental synthesis and characterization.`;
        const budgetNeeded = Math.max(50000, 100000 - this.context.budget); // Requesting at least 50k, or more if budget is very low

        const draftedGrant = await simulatedAPIs.grantManagement.draftGrantProposal(researchSummary, budgetNeeded);
        this.addLog(createLogEntry('result', `Drafted grant proposal for "${draftedGrant.title}" requesting $${budgetNeeded}. Status: ${draftedGrant.status}.`));
        this.logDecision(ResearchPhase.GRANT_APPLICATION, 'Drafted grant proposal', { grantTitle: draftedGrant.title, budget: budgetNeeded }, 'success');

        const submittedGrant = await simulatedAPIs.grantManagement.submitGrantProposal(draftedGrant);
        this.addLog(createLogEntry('result', `Submitted grant proposal "${submittedGrant.title}". Status: ${submittedGrant.status}.`));
        this.updateInternalContext({ grantsSubmitted: [...this.context.grantsSubmitted, submittedGrant] });
        this.logDecision(ResearchPhase.GRANT_APPLICATION, 'Submitted grant proposal', { grantId: submittedGrant.id, status: submittedGrant.status }, 'success');
        this.spendResources(50, 0.5, 'grant_submission_fees');

        // Simulate grant review process (can be async and happen later)
        await new Promise(r => setTimeout(r, 10000 + Math.random() * 5000)); // Simulate review time
        const fundingOutcome = Math.random();
        if (fundingOutcome > 0.4) { // Simulate ~60% success rate
            const fundedAmount = budgetNeeded * (0.7 + Math.random() * 0.3); // Get 70-100% of requested
            this.addLog(createLogEntry('result', `Grant "${submittedGrant.title}" was FUNDED for $${fundedAmount.toFixed(2)}! Project budget updated.`));
            this.updateInternalContext(prev => ({
                budget: prev.budget + fundedAmount,
                currentProject: { ...prev.currentProject, currentBudget: prev.currentProject.currentBudget + fundedAmount },
                grantsSubmitted: prev.grantsSubmitted.map(g => g.id === submittedGrant.id ? { ...g, status: 'funded' as const, currentFunding: fundedAmount } : g)
            }));
            this.logDecision(ResearchPhase.GRANT_APPLICATION, 'Grant funded', { amount: fundedAmount }, 'success', 'Secured additional funding.');
            await simulatedAPIs.projectManagement.updateKPI(this.context.currentProject.id, 'Budget Remaining', this.context.budget);
        } else {
            this.addLog(createLogEntry('warning', `Grant "${submittedGrant.title}" was REJECTED. Need to reconsider resource strategy.`));
            this.updateInternalContext(prev => ({
                grantsSubmitted: prev.grantsSubmitted.map(g => g.id === submittedGrant.id ? { ...g, status: 'rejected' as const } : g)
            }));
            this.logDecision(ResearchPhase.GRANT_APPLICATION, 'Grant rejected', {}, 'failure', 'Could not secure additional funding.');
        }
    }

    private async handlePublicationStrategy(report: ResearchReport) {
        this.updateCurrentPhase(ResearchPhase.PUBLICATION_STRATEGY);
        this.addLog(createLogEntry('action', `Developing publication strategy for the final research report.`));
        this.spendResources(80, 2.0, 'publication_strategy');

        const publicationPrompt = `Based on the attached comprehensive research report titled "${report.title}", and considering the significance of the findings, suggest a suitable target journal (e.g., Nature, Science, Adv. Materials, J. Mat. Chem. A) and justify the choice. Also, draft a compelling cover letter snippet.`;
        const publicationResponse = await this.context.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: publicationPrompt
        });
        const pubStrategyDetails = publicationResponse.text;
        this.addLog(createLogEntry('result', `Publication Strategy: ${pubStrategyDetails}`));
        this.logDecision(ResearchPhase.PUBLICATION_STRATEGY, 'Publication strategy devised', { strategy: pubStrategyDetails }, 'success');

        const targetJournalMatch = pubStrategyDetails.match(/target journal:\s*([\w\s.]+)/i);
        const targetJournal = targetJournalMatch ? targetJournalMatch[1].trim() : 'Advanced Energy Materials';

        const draftedArticle = await simulatedAPIs.publicationService.draftArticle(report, targetJournal);
        this.addLog(createLogEntry('result', `Drafted manuscript for submission to ${targetJournal}. Title: "${draftedArticle.title}".`));
        this.logDecision(ResearchPhase.PUBLICATION_STRATEGY, 'Drafted research article', { articleTitle: draftedArticle.title, journal: targetJournal }, 'success');
        this.spendResources(100, 3.0, 'article_drafting');

        const submittedArticle = await simulatedAPIs.publicationService.submitArticleForReview(draftedArticle);
        this.addLog(createLogEntry('result', `Submitted article "${submittedArticle.title}" to ${submittedArticle.journal}. Status: ${submittedArticle.status}.`));
        this.updateInternalContext({ publicationsSubmitted: [...this.context.publicationsSubmitted, submittedArticle] });
        this.logDecision(ResearchPhase.PUBLICATION_STRATEGY, 'Submitted article for review', { articleId: submittedArticle.id, status: submittedArticle.status }, 'success');
        this.spendResources(50, 0.5, 'submission_fees');

        // Simulate peer review
        this.updateCurrentPhase(ResearchPhase.PEER_REVIEW);
        this.addLog(createLogEntry('action', `Simulating peer review process for article "${submittedArticle.title}"...`));
        this.spendResources(200, 10.0, 'peer_review');
        const reviewOutcome = await simulatedAPIs.publicationService.simulatePeerReview(submittedArticle.id);
        this.addLog(createLogEntry('result', `Peer review outcome: ${reviewOutcome.replace(/_/g, ' ')}.`));

        if (reviewOutcome === 'accepted') {
            this.updateInternalContext(prev => ({
                publicationsSubmitted: prev.publicationsSubmitted.map(p => p.id === submittedArticle.id ? { ...p, status: 'accepted' as const, doi: `10.1002/mock.123.${Date.now()}` } : p)
            }));
            this.logDecision(ResearchPhase.PEER_REVIEW, 'Article accepted for publication', {}, 'success', `The manuscript was accepted without further revisions.`);
        } else if (reviewOutcome.includes('revision')) {
            this.updateInternalContext(prev => ({
                publicationsSubmitted: prev.publicationsSubmitted.map(p => p.id === submittedArticle.id ? { ...p, status: 'under_review' as const } : p)
            }));
            this.logDecision(ResearchPhase.PEER_REVIEW, 'Article requires revisions', {}, 'neutral', `Minor/Major revisions requested. Will integrate feedback for re-submission in future cycles.`);
        } else {
            this.updateInternalContext(prev => ({
                publicationsSubmitted: prev.publicationsSubmitted.map(p => p.id === submittedArticle.id ? { ...p, status: 'rejected' as const } : p)
            }));
            this.logDecision(ResearchPhase.PEER_REVIEW, 'Article rejected', {}, 'failure', `Manuscript rejected. Will re-evaluate and submit to a different journal or refine further.`);
        }
    }


    // Helper functions for parsing AI responses into structured data
    private async extractMaterialFromDesign(designDetails: string): Promise<Material> {
        // More robust parsing for complex material descriptions
        const nameMatch = designDetails.match(/(N-doped graphene with BNNS interlayers|Lithium Manganese Iron Phosphate doped with Vanadium|new material candidate:\s*([\w\s-]+)|([\w\s-]+) anode composite|material:\s*([\w\s-]+))/i);
        const name = nameMatch ? (nameMatch[2] || nameMatch[3] || nameMatch[4] || nameMatch[1]) : `Proposed Material ${Date.now().toString().slice(-4)}`;
        const cleanedName = name.replace(/anode composite/i, '').trim();

        const elementsMatch = designDetails.match(/composition:\s*{([^}]+)}/i) || designDetails.match(/elements:\s*([\w\s,:]+)/i);
        const elements: { [key: string]: number } = {};
        if (elementsMatch && elementsMatch[1]) {
            elementsMatch[1].split(',').forEach(part => {
                const [key, val] = part.trim().split(':');
                if (key && val) elements[key.trim()] = parseFloat(val.trim()) || 1; // Default to 1 if parsing fails
            });
        } else {
             // Fallback to try and extract from material name if explicit composition not found
            const inferredElements = cleanedName.match(/([A-Z][a-z]?)\d*\.?\d*/g);
            if (inferredElements) {
                inferredElements.forEach(el => {
                    const symbol = el.match(/[A-Z][a-z]?/)?.[0];
                    const count = parseFloat(el.replace(/[^0-9.]/g, '')) || 1;
                    if (symbol) elements[symbol] = count;
                });
            }
        }

        const dopantsMatch = designDetails.match(/doping:\s*{([^}]+)}/i) || designDetails.match(/dopants:\s*([\w\s,:]+)/i);
        const dopants: { [key: string]: number } = {};
        if (dopantsMatch && dopantsMatch[1]) {
            dopantsMatch[1].split(',').forEach(part => {
                const [key, val] = part.trim().split(':');
                if (key && val) dopants[key.trim()] = parseFloat(val.trim()) / 100 || 0.05; // Assume percentage for doping
            });
        }

        const structureMatch = designDetails.match(/structure:\s*([\w\s-]+)/i) || designDetails.match(/interlayers:\s*([\w\s-]+)/i);
        const structure = structureMatch ? structureMatch[1].trim() : (cleanedName.toLowerCase().includes('graphene') && cleanedName.toLowerCase().includes('bnns') ? 'graphene-BNNS heterostructure' : undefined);

        const nanostructureMatch = designDetails.match(/nanostructure:\s*([\w\s-]+)/i);
        const nanostructure = nanostructureMatch ? nanostructureMatch[1].trim() : (cleanedName.toLowerCase().includes('nanosheet') ? 'nanosheet' : cleanedName.toLowerCase().includes('nanoparticle') ? 'nanoparticle' : undefined);


        // Check if a similar material already exists in the database
        const existingMaterials = await MaterialDatabase.searchMaterials(cleanedName, 1);
        if (existingMaterials.length > 0 && existingMaterials[0].name.toLowerCase() === cleanedName.toLowerCase()) {
            this.addLog(createLogEntry('warning', `Re-using existing material ID ${existingMaterials[0].id} for ${cleanedName}.`));
            return existingMaterials[0]; // Use existing material if found
        }


        const materialId = `mat-${cleanedName.replace(/\s+/g, '-')}-${Date.now().toString().slice(-6)}`;
        return {
            id: materialId,
            name: cleanedName,
            composition: { elements, dopants, structure, nanostructure },
            properties: [], // Will be filled by later simulations/characterizations
            discoveryDate: new Date().toISOString().split('T')[0],
            potentialApplications: ['battery anode', 'energy storage'],
            stabilityScore: 50 + Math.random() * 30, // Initial guess
            performanceScore: 50 + Math.random() * 30, // Initial guess
            riskScore: 50,
            costScore: 50,
        };
    }

    private extractParametersFromDesign(designDetails: string): ExperimentParameter[] {
        const parameters: ExperimentParameter[] = [];
        const paramRegex = /(?:parameter|metric|variable|key parameter):\s*([\w\s]+?)(?:(?:\s*=\s*|:\s*)(\d+\.?\d*(?:\s*[%Â°\w\/]+)?|\w+))?(?:,\s*range:\s*\[(\d+\.?\d*),\s*(\d+\.?\d*)\])?/gi;
        let match;
        while ((match = paramRegex.exec(designDetails)) !== null) {
            const name = match[1].trim();
            let value: number | string | boolean = match[2] ? (isNaN(parseFloat(match[2])) ? match[2] : parseFloat(match[2])) : true; // Default to true if no value, useful for DFT properties
            const unit = (match[2] && !isNaN(parseFloat(match[2]))) ? match[2].match(/[^\d\s\.]+/)?.shift() || undefined : undefined;
            const range: [number, number] | undefined = (match[3] && match[4]) ? [parseFloat(match[3]), parseFloat(match[4])] : undefined;

            parameters.push({ name, value, unit, range });
        }
        // Add some default parameters if none are found or to make the simulation more robust
        if (parameters.length === 0 || !parameters.some(p => p.name.toLowerCase().includes('temperature'))) {
            if (designDetails.toLowerCase().includes('molecular dynamics') || designDetails.toLowerCase().includes('md')) {
                parameters.push({ name: 'temperature', value: 300, unit: 'K', description: 'Simulation temperature' });
                parameters.push({ name: 'pressure', value: 1, unit: 'atm', description: 'Simulation pressure' });
                parameters.push({ name: 'strainReductionTarget', value: 25, unit: '%', description: 'Target reduction in lattice strain' });
                parameters.push({ name: 'liDiffusionImprovement', value: 0.25, description: 'Target improvement in Li+ diffusion coefficient' });
                parameters.push({ name: 'BNNS layer thickness', value: 2, unit: 'layers', range: [1, 5], description: 'Number of boron nitride nanosheet layers' });
                parameters.push({ name: 'BNNS spacing', value: 1.0, unit: 'nm', range: [0.5, 2.0], description: 'Spacing between BNNS layers' });
            } else if (designDetails.toLowerCase().includes('dft') || designDetails.toLowerCase().includes('density functional theory')) {
                 parameters.push({ name: 'band_gap', value: true, description: 'Calculate electronic band gap' });
                 parameters.push({ name: 'formation_energy', value: true, description: 'Calculate defect formation energy' });
                 parameters.push({ name: 'li_binding_energy', value: true, description: 'Calculate lithium binding energy' });
                 parameters.push({ name: 'functional', value: 'PBE', description: 'DFT exchange-correlation functional' });
            } else if (designDetails.toLowerCase().includes('electrochemical') || designDetails.toLowerCase().includes('electrochemical model')) {
                 parameters.push({ name: 'cycle_rate', value: 0.5, unit: 'C', description: 'Discharge/charge rate' });
                 parameters.push({ name: 'cycles', value: 500, description: 'Total number of cycles to simulate' });
                 parameters.push({ name: 'voltage_window', value: '3.0-4.2', unit: 'V', description: 'Operating voltage window' });
                 parameters.push({ name: 'electrolyte_composition', value: 'EC:DMC', description: 'Simulated electrolyte composition' });
            } else if (designDetails.toLowerCase().includes('thermal stability')) {
                parameters.push({ name: 'heating_rate', value: 10, unit: 'Â°C/min', description: 'Heating rate for thermal analysis' });
                parameters.push({ name: 'atmosphere', value: 'argon', description: 'Atmosphere during thermal analysis' });
                parameters.push({ name: 'max_temperature', value: 800, unit: 'Â°C', description: 'Maximum temperature for thermal analysis' });
            } else if (designDetails.toLowerCase().includes('optimization')) {
                parameters.push({ name: 'doping_concentration', value: 0.05, unit: '%', range: [0.01, 0.1], description: 'Range for doping concentration optimization' });
                parameters.push({ name: 'layer_thickness', value: 5, unit: 'nm', range: [1, 10], description: 'Range for layer thickness optimization' });
            } else if (designDetails.toLowerCase().includes('quantum mechanics') || designDetails.toLowerCase().includes('qm')) {
                 parameters.push({ name: 'target_property', value: 'band_gap', description: 'Specific property to calculate (e.g., band_gap, electron_affinity)' });
                 parameters.push({ name: 'software', value: 'VASP', description: 'Quantum mechanics software package' });
            } else if (designDetails.toLowerCase().includes('phase diagram')) {
                 parameters.push({ name: 'temperature_range', value: [0, 1500], unit: 'Â°C', description: 'Temperature range for phase diagram calculation' });
                 parameters.push({ name: 'pressure_constant', value: 1, unit: 'atm', description: 'Constant pressure for calculation' });
            } else if (designDetails.toLowerCase().includes('defect formation')) {
                 parameters.push({ name: 'defect_type', value: 'vacancy', description: 'Type of defect to simulate (e.g., vacancy, interstitial, antisite)' });
                 parameters.push({ name: 'defect_concentration_target', value: 1e19, unit: 'cm^-3', range: [1e18, 1e20], description: 'Target defect concentration' });
            }
        }
        return parameters;
    }

    private determineExperimentType(designDetails: string): Experiment['type'] {
        const lowerDesign = designDetails.toLowerCase();
        if (lowerDesign.includes('molecular dynamics') || lowerDesign.includes('md') || lowerDesign.includes('dft') || lowerDesign.includes('density functional theory') || lowerDesign.includes('computational simulation') || lowerDesign.includes('electrochemical model') || lowerDesign.includes('thermal stability simulation') || lowerDesign.includes('quantum mechanics') || lowerDesign.includes('qm') || lowerDesign.includes('phase diagram') || lowerDesign.includes('defect formation')) {
            return 'simulation';
        }
        if (lowerDesign.includes('synthesize') || lowerDesign.includes('synthesis')) {
            return 'synthesis';
        }
        if (lowerDesign.includes('characterize') || lowerDesign.includes('xrd') || lowerDesign.includes('tem') || lowerDesign.includes('xps') || lowerDesign.includes('eis')) {
            return 'characterization';
        }
        if (lowerDesign.includes('optimization') || lowerDesign.includes('bayesian optimization') || lowerDesign.includes('genetic algorithm')) {
            return 'optimization';
        }
        if (lowerDesign.includes('modeling') || lowerDesign.includes('model development')) {
            return 'modeling';
        }
        if (lowerDesign.includes('validation')) {
            return 'validation';
        }
        if (lowerDesign.includes('protocol design') || lowerDesign.includes('design synthesis route')) {
            return 'protocol_design';
        }
        return 'simulation'; // Default to simulation for computational scientist
    }

    private determineSpecificSimType(designDetails: string): keyof SimulatedAPIS['simulationEngine'] {
        const lowerDesign = designDetails.toLowerCase();
        if (lowerDesign.includes('molecular dynamics') || lowerDesign.includes('md')) return 'runMolecularDynamics';
        if (lowerDesign.includes('dft') || lowerDesign.includes('density functional theory')) return 'runDFT';
        if (lowerDesign.includes('thermal stability')) return 'runThermalStabilitySimulation';
        if (lowerDesign.includes('quantum mechanics') || lowerDesign.includes('qm')) return 'runQuantumMechanicsSimulation';
        if (lowerDesign.includes('phase diagram')) return 'runPhaseDiagramCalculation';
        if (lowerDesign.includes('defect formation')) return 'runDefectFormationSimulation';
        return 'runElectrochemicalModel'; // Default
    }

    private extractCharacterizationTechniques(designDetails: string): string[] {
        const techniques: string[] = [];
        if (designDetails.toLowerCase().includes('xrd')) techniques.push('XRD');
        if (designDetails.toLowerCase().includes('tem')) techniques.push('TEM');
        if (designDetails.toLowerCase().includes('sem')) techniques.push('SEM');
        if (designDetails.toLowerCase().includes('xps')) techniques.push('XPS');
        if (designDetails.toLowerCase().includes('eis')) techniques.push('EIS');
        if (designDetails.toLowerCase().includes('cyclic voltammetry') || designDetails.toLowerCase().includes('cycling') || designDetails.toLowerCase().includes('gcd')) techniques.push('Cycling');
        if (designDetails.toLowerCase().includes('raman')) techniques.push('Raman');
        if (designDetails.toLowerCase().includes('tga')) techniques.push('TGA');
        if (designDetails.toLowerCase().includes('nmr')) techniques.push('NMR'); // New
        if (techniques.length === 0) return ['XRD', 'TEM', 'XPS', 'Cycling', 'EIS']; // Default comprehensive set
        return techniques;
    }
}

// --- Main React Component ---

const AutonomousScientistView: React.FC = () => {
    const [goal, setGoal] = useState('Discover novel high-performance anode materials for next-generation solid-state lithium-ion batteries with enhanced cycle life, safety, and energy density.');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
        researchObjective: true,
        researchOverview: true,
        agentActivityLog: true,
        generatedHypotheses: true,
        simulatedExperiments: true,
        discoveredMaterials: true,
        agentDecisionHistory: true,
        projectDashboard: false, // New card, initially collapsed
        ipAndPublications: false, // New card, initially collapsed
        finalResearchReport: true,
    });

    const toggleCardExpansion = (cardName: string) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardName]: !prev[cardName]
        }));
    };

    const [context, setContext] = useState<ResearchContext>(() => {
        const initialBudget = 100000;
        return {
            goal: '', // Will be updated on start
            currentPhase: ResearchPhase.IDLE,
            hypotheses: [],
            experiments: [],
            materialsDiscovered: [],
            logEntries: [],
            decisions: [],
            iterationCount: 0,
            maxIterations: 4, // Simulate 4 iterations for a more comprehensive demonstration
            ai: new MockGoogleGenAI({ apiKey: 'mock-api-key' }),
            budget: initialBudget, // Initial simulated budget
            timeElapsed: 0, // Initial simulated time
            researchReport: undefined,
            currentProject: {
                id: 'proj-init',
                name: 'Initial Project',
                goal: 'No Goal Defined Yet',
                status: 'on_hold',
                startDate: new Date().toISOString().split('T')[0],
                initialBudget: initialBudget,
                currentBudget: initialBudget,
                kpis: [],
                teamMembers: ['Autonomous Scientist AI'],
            },
            patentsFiled: [],
            grantsSubmitted: [],
            publicationsSubmitted: [],
            knowledgeBase: [],
            currentRiskAssessment: undefined,
            currentEconomicAnalysis: undefined,
        };
    });

    // Memoize addLog to prevent unnecessary re-renders in child components if passed down
    const addLog = useCallback((entry: LogEntry) => {
        setContext(prev => ({
            ...prev,
            logEntries: [...prev.logEntries, entry]
        }));
    }, []);

    const runSimulation = async () => {
        setIsLoading(true);
        // Reset context for a new simulation run, preserving the goal from input
        const initialBudget = 100000;
        setContext(prev => ({
            ...prev,
            goal: goal, // Use the current goal from the textarea
            currentPhase: ResearchPhase.IDLE,
            hypotheses: [],
            experiments: [],
            materialsDiscovered: [],
            logEntries: [],
            decisions: [],
            iterationCount: 0,
            researchReport: undefined, // Clear previous report
            budget: initialBudget, // Reset budget
            timeElapsed: 0, // Reset time
            currentProject: {
                id: `proj-${Date.now()}`,
                name: `Autonomous Research: ${goal.substring(0, Math.min(goal.length, 30))}...`,
                goal: goal,
                status: 'active',
                startDate: new Date().toISOString().split('T')[0],
                initialBudget: initialBudget,
                currentBudget: initialBudget,
                kpis: [],
                teamMembers: ['Autonomous Scientist AI'],
            },
            patentsFiled: [],
            grantsSubmitted: [],
            publicationsSubmitted: [],
            knowledgeBase: [],
            currentRiskAssessment: undefined,
            currentEconomicAnalysis: undefined,
        }));

        const scientistAgent = new AutonomousScientistAgent(
            {
                ...context,
                goal: goal, // Ensure agent gets the latest goal
                ai: new MockGoogleGenAI({ apiKey: 'mock-api-key' }), // Re-initialize AI for a clean state in the agent
            },
            addLog,
            setContext // Pass the state setter directly to the agent to update context
        );

        await scientistAgent.runResearchCycle();
        setIsLoading(false);
    };

    // Auto-scroll log to the bottom
    const logEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [context.logEntries.length]);

    // Renders a colored badge for the current research phase
    const renderPhaseBadge = (phase: ResearchPhase) => {
        let colorClass = 'bg-gray-500';
        switch (phase) {
            case ResearchPhase.IDLE: colorClass = 'bg-gray-500'; break;
            case ResearchPhase.GOAL_DEFINITION: colorClass = 'bg-blue-600'; break;
            case ResearchPhase.LITERATURE_REVIEW: colorClass = 'bg-indigo-600'; break;
            case ResearchPhase.HYPOTHESIS_GENERATION: colorClass = 'bg-purple-600'; break;
            case ResearchPhase.EXPERIMENT_DESIGN: colorClass = 'bg-pink-600'; break;
            case ResearchPhase.SIMULATION_EXECUTION: colorClass = 'bg-orange-600'; break;
            case ResearchPhase.DATA_ANALYSIS: colorClass = 'bg-teal-600'; break;
            case ResearchPhase.HYPOTHESIS_REFINEMENT: colorClass = 'bg-lime-600'; break;
            case ResearchPhase.REPORT_GENERATION: colorClass = 'bg-emerald-600'; break;
            case ResearchPhase.ITERATION_CYCLE: colorClass = 'bg-cyan-600'; break;
            case ResearchPhase.COMPLETED: colorClass = 'bg-green-600'; break;
            case ResearchPhase.FAILED: colorClass = 'bg-red-600'; break;
            case ResearchPhase.SELF_CORRECTION: colorClass = 'bg-yellow-600'; break;
            case ResearchPhase.RESOURCE_MANAGEMENT: colorClass = 'bg-gray-600'; break;
            case ResearchPhase.PROJECT_SETUP: colorClass = 'bg-blue-800'; break;
            case ResearchPhase.IP_MANAGEMENT: colorClass = 'bg-amber-600'; break;
            case ResearchPhase.GRANT_APPLICATION: colorClass = 'bg-fuchsia-600'; break;
            case ResearchPhase.PEER_REVIEW: colorClass = 'bg-lightBlue-600'; break;
            case ResearchPhase.PUBLICATION_STRATEGY: colorClass = 'bg-rose-600'; break;
            case ResearchPhase.RISK_ASSESSMENT: colorClass = 'bg-red-800'; break;
            case ResearchPhase.ECONOMIC_EVALUATION: colorClass = 'bg-green-800'; break;
        }
        return (
            <span className={`${colorClass} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                {phase.replace(/_/g, ' ')}
            </span>
        );
    };

    // Helper to format large numbers
    const formatNumber = (num: number, currency: boolean = false) => {
        if (currency) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return num.toLocaleString('en-US');
    };

    return (
        <div className="space-y-8 p-4 md:p-8 bg-gradient-to-br from-gray-900 to-black min-h-screen text-gray-100 font-sans">
            <h1 className="text-5xl font-extrabold text-white tracking-tight text-center pb-6 border-b-2 border-cyan-700/50">
                Blueprint 106: Autonomous Scientist AI
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
                The Autonomous Scientist AI is a cutting-edge agent orchestrating a comprehensive scientific research pipeline. From initial goal decomposition and extensive literature review to iterative hypothesis generation, sophisticated experiment design, multi-modal simulation execution, in-depth data analysis, and adaptive self-correction, it drives discovery towards a logical conclusion, culminating in a detailed scientific report. This system operates as a self-contained unit, simulating all external interactions to ensure a predictable and focused research environment.
            </p>

            <LocalCard title="Research Objective" className="bg-gray-800/70 border-cyan-800" expanded={expandedCards.researchObjective} onToggleExpand={() => toggleCardExpansion('researchObjective')}>
                <textarea
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-700/50 p-4 rounded-lg text-white text-lg focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-y border border-gray-600"
                    placeholder="Define a complex scientific research goal here, e.g., 'Discover new high-temperature superconducting materials through computational design and synthesis simulation.'"
                />
                <button
                    onClick={runSimulation}
                    disabled={isLoading}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 rounded-xl text-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl text-white transform hover:scale-102"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {`Researching (Iteration ${context.iterationCount}/${context.maxIterations}) - ${context.currentPhase.replace(/_/g, ' ')}...`}
                        </div>
                    ) : 'Initiate Autonomous Research Cycle'}
                </button>
            </LocalCard>

            <LocalCard title="Research Overview" className="bg-gray-800/70 border-indigo-800" expanded={expandedCards.researchOverview} onToggleExpand={() => toggleCardExpansion('researchOverview')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-sm flex items-center justify-between">
                        <span className="text-indigo-300 font-semibold">Current Phase:</span>
                        {renderPhaseBadge(context.currentPhase)}
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-sm flex items-center justify-between">
                        <span className="text-purple-300 font-semibold">Iteration:</span>
                        <span className="text-white font-medium">{context.iterationCount} / {context.maxIterations}</span>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-sm flex items-center justify-between">
                        <span className="text-green-300 font-semibold">Budget Remaining:</span>
                        <span className="text-white font-medium">{formatNumber(context.budget, true)}</span>
                    </div>
                     <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-sm flex items-center justify-between">
                        <span className="text-yellow-300 font-semibold">Time Elapsed:</span>
                        <span className="text-white font-medium">{context.timeElapsed.toFixed(1)} hrs</span>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-sm flex items-center justify-between">
                        <span className="text-cyan-300 font-semibold">Hypotheses:</span>
                        <span className="text-white font-medium">{context.hypotheses.length}</span>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-sm flex items-center justify-between">
                        <span className="text-teal-300 font-semibold">Experiments:</span>
                        <span className="text-white font-medium">{context.experiments.length}</span>
                    </div>
                </div>
            </LocalCard>

            <LocalCard title="Project Dashboard" className="bg-gray-800/70 border-blue-800" expanded={expandedCards.projectDashboard} onToggleExpand={() => toggleCardExpansion('projectDashboard')}>
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-300 mb-2">Current Project: {context.currentProject.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                            <strong className="text-gray-400">Project Goal:</strong> <span className="text-white">{context.currentProject.goal}</span>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                            <strong className="text-gray-400">Status:</strong> <span className={`font-medium ${context.currentProject.status === 'active' ? 'text-green-400' : 'text-yellow-400'} capitalize`}>{context.currentProject.status}</span>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                            <strong className="text-gray-400">Start Date:</strong> <span className="text-white">{context.currentProject.startDate}</span>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                            <strong className="text-gray-400">Team:</strong> <span className="text-white">{context.currentProject.teamMembers.join(', ')}</span>
                        </div>
                    </div>
                    <h4 className="text-lg font-semibold text-blue-300 mt-4">Key Performance Indicators (KPIs)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {context.currentProject.kpis.map((kpi, idx) => (
                            <div key={idx} className="bg-gray-900/50 p-3 rounded border border-gray-700 flex justify-between items-center">
                                <span className="text-gray-400">{kpi.name}:</span>
                                <span className="text-white font-medium">{kpi.current}{kpi.unit ? ` ${kpi.unit}` : ''} {kpi.target !== -1 && kpi.target !== 0 ? `(Target: ${kpi.target}${kpi.unit ? ` ${kpi.unit}` : ''})` : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </LocalCard>

            {context.currentRiskAssessment && context.currentEconomicAnalysis && (
                <LocalCard title="Current Project Assessments" className="bg-gray-800/70 border-yellow-800" expanded={true}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-red-300 mb-2">Risk Assessment</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                                {context.currentRiskAssessment.map((metric, idx) => (
                                    <li key={idx}>
                                        {metric.name}: <span className="text-white font-medium">{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</span>
                                        {metric.interpretation && <span className="italic text-gray-500 ml-2">({metric.interpretation})</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-green-300 mb-2">Economic Analysis</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                                {context.currentEconomicAnalysis.map((metric, idx) => (
                                    <li key={idx}>
                                        {metric.name}: <span className="text-white font-medium">{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</span>
                                        {metric.interpretation && <span className="italic text-gray-500 ml-2">({metric.interpretation})</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </LocalCard>
            )}

            {(isLoading || context.logEntries.length > 0) && (
                <LocalCard title="Agent Activity Log" className="bg-gray-800/70 border-gray-700" expanded={expandedCards.agentActivityLog} onToggleExpand={() => toggleCardExpansion('agentActivityLog')}>
                    <div className="space-y-3 max-h-[70vh] min-h-[20vh] overflow-y-auto p-4 rounded-lg bg-gray-900/50 border border-gray-700 shadow-inner">
                        {context.logEntries.map((entry, i) => (
                            <div key={i} className={`p-3 rounded-lg text-sm transition-all duration-100 border-l-4
                                ${entry.type === 'thought' ? 'bg-indigo-900/20 border-indigo-500 text-indigo-200' :
                                entry.type === 'action' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-200' :
                                entry.type === 'error' ? 'bg-red-900/20 border-red-500 text-red-200' :
                                entry.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200' :
                                'bg-gray-700/30 border-gray-600 text-gray-300'}`}
                            >
                                <strong className={`capitalize font-semibold ${entry.type === 'thought' ? 'text-indigo-400' : entry.type === 'action' ? 'text-cyan-400' : entry.type === 'error' ? 'text-red-400' : entry.type === 'warning' ? 'text-yellow-400' : 'text-gray-400'}`}>{entry.type}:</strong> <span className="text-gray-200">{entry.content}</span>
                            </div>
                        ))}
                        {isLoading && <div className="text-yellow-400 animate-pulse p-3 rounded-lg bg-gray-700/30 border-l-4 border-yellow-500">Thinking... A complex simulation might take a while.</div>}
                        <div ref={logEndRef} />
                    </div>
                </LocalCard>
            )}

            {context.hypotheses.length > 0 && (
                <LocalCard title="Generated Hypotheses" className="bg-gray-800/70 border-purple-800" expanded={expandedCards.generatedHypotheses} onToggleExpand={() => toggleCardExpansion('generatedHypotheses')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {context.hypotheses.map(h => (
                            <div key={h.id} className="p-5 bg-gray-900/50 rounded-lg border border-gray-700 shadow-md transition-all duration-200 hover:shadow-lg hover:border-purple-600">
                                <h3 className="font-semibold text-purple-400 text-xl mb-3">Hypothesis {h.id.split('-')[1]}</h3>
                                <p className="text-gray-300 mb-4 leading-relaxed">{h.text}</p>
                                <div className="flex flex-wrap justify-between items-center text-sm text-gray-400 border-t border-gray-700 pt-3">
                                    <span className="flex items-center"><strong className="text-purple-300 mr-2">Target:</strong> <span className="text-white">{h.targetProperty}</span></span>
                                    <span className="flex items-center"><strong className="text-purple-300 mr-2">Status:</strong> <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${h.status === 'supported' ? 'bg-green-600/30 text-green-400' : h.status === 'refuted' ? 'bg-red-600/30 text-red-400' : 'bg-yellow-600/30 text-yellow-400'}`}>{h.status.replace(/_/g, ' ')}</span></span>
                                    <span className="flex items-center mt-2 w-full"><strong className="text-purple-300 mr-2">Predicted:</strong> <span className="text-white">{h.predictedEffect}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </LocalCard>
            )}

            {context.experiments.length > 0 && (
                <LocalCard title="Simulated Experiments & Characterizations" className="bg-gray-800/70 border-orange-800" expanded={expandedCards.simulatedExperiments} onToggleExpand={() => toggleCardExpansion('simulatedExperiments')}>
                    <div className="space-y-6">
                        {context.experiments.map(exp => (
                            <div key={exp.id} className="p-5 bg-gray-900/50 rounded-lg border border-gray-700 shadow-md transition-all duration-200 hover:shadow-lg hover:border-orange-600">
                                <h3 className="font-semibold text-orange-400 text-xl mb-2 flex justify-between items-center">
                                    {exp.name}
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${exp.status === 'completed' ? 'bg-green-600/30 text-green-400' : exp.status === 'failed' ? 'bg-red-600/30 text-red-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                                        {exp.status.toUpperCase()}
                                    </span>
                                </h3>
                                <p className="text-gray-300 text-sm mb-3">Type: <span className="font-medium text-white">{exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}</span></p>
                                <p className="text-gray-400 text-sm mb-4 italic leading-relaxed">{exp.designRationale.substring(0, 200)}{exp.designRationale.length > 200 ? '...' : ''}</p>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-400 border-t border-gray-700 pt-3">
                                    <span>Cost Est: <span className="text-white font-medium">{formatNumber(exp.costEstimate, true)}</span></span>
                                    <span>Time Est: <span className="text-white font-medium">{exp.timeEstimate.toFixed(1)} hrs</span></span>
                                    <span>Material ID: <span className="text-white font-medium">{exp.materialId || 'N/A'}</span></span>
                                    <span>Hypothesis ID: <span className="text-white font-medium">{exp.hypothesisId.split('-')[1]}</span></span>
                                    <span>Priority: <span className="text-white font-medium capitalize">{exp.priority}</span></span>
                                </div>
                                {exp.results && (
                                    <div className="mt-5 p-4 bg-gray-800 rounded-lg border border-gray-600 shadow-inner">
                                        <h4 className="font-semibold text-teal-400 text-lg mb-3">Simulation Results Summary:</h4>
                                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{exp.results.analysisSummary}</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                                            {exp.results.metrics.map((metric, idx) => (
                                                <li key={idx}>
                                                    {metric.name}: <span className="text-white font-medium">{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</span>
                                                    {metric.interpretation && <span className="italic text-gray-500 ml-2">({metric.interpretation})</span>}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-right text-xs mt-4">Conclusion: <span className={`font-medium ${exp.results.conclusion === 'supported' ? 'text-green-400' : exp.results.conclusion === 'refuted' ? 'text-red-400' : 'text-yellow-400'}`}>{exp.results.conclusion.replace(/_/g, ' ')}</span> (Confidence: {(exp.results.confidenceScore * 100).toFixed(0)}%)</p>
                                        {exp.results.generatedVisualizations && exp.results.generatedVisualizations.length > 0 && (
                                            <details className="text-sm text-gray-500 cursor-pointer mt-3">
                                                <summary className="text-cyan-400 hover:text-cyan-300">View Visualizations ({exp.results.generatedVisualizations.length})</summary>
                                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {exp.results.generatedVisualizations.map((vis, vIdx) => (
                                                        <div key={vIdx} className="bg-gray-700/50 p-2 rounded">
                                                            <p className="text-xs text-gray-300 font-semibold mb-1">{vis.title}</p>
                                                            <img src={vis.dataUrl} alt={vis.title} className="w-full h-24 object-contain bg-gray-900 rounded" /> {/* Placeholder image */}
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </LocalCard>
            )}

            {context.materialsDiscovered.length > 0 && (
                <LocalCard title="Discovered Materials (Simulated)" className="bg-gray-800/70 border-emerald-800" expanded={expandedCards.discoveredMaterials} onToggleExpand={() => toggleCardExpansion('discoveredMaterials')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {context.materialsDiscovered.map(mat => (
                            <div key={mat.id} className="p-5 bg-gray-900/50 rounded-lg border border-gray-700 shadow-md transition-all duration-200 hover:shadow-lg hover:border-emerald-600">
                                <h3 className="font-semibold text-emerald-400 text-xl mb-2">{mat.name}</h3>
                                <p className="text-gray-300 text-sm mb-3">Composition: <span className="text-white font-medium">{Object.entries(mat.composition.elements).map(([el, val]) => `${el}${val}`).join('')}{mat.composition.dopants && Object.entries(mat.composition.dopants).map(([dop, val]) => `(${dop}:${(val*100).toFixed(1)}%)`)}</span></p>
                                {mat.composition.structure && <p className="text-gray-300 text-xs mb-1">Structure: <span className="text-white font-medium">{mat.composition.structure}</span></p>}
                                {mat.composition.nanostructure && <p className="text-gray-300 text-xs mb-3">Nanostructure: <span className="text-white font-medium">{mat.composition.nanostructure}</span></p>}
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 border-t border-gray-700 pt-3">
                                    {mat.properties.length > 0 ? mat.properties.map((prop, idx) => (
                                        <li key={idx}>
                                            {prop.name}: <span className="text-white font-medium">{prop.value}{prop.unit ? ` ${prop.unit}` : ''}</span>
                                            {prop.source && <span className="italic text-gray-500 ml-2">({prop.source})</span>}
                                        </li>
                                    )) : <li><span className="text-gray-500">No detailed properties characterized yet.</span></li>}
                                </ul>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t border-gray-700 pt-3">
                                    <span>Discovered: {mat.discoveryDate}</span>
                                    <span>App: {mat.potentialApplications.join(', ')}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-2">
                                    <span>Stability: <span className="text-white font-medium">{mat.stabilityScore}%</span></span>
                                    <span>Performance: <span className="text-white font-medium">{mat.performanceScore}%</span></span>
                                    <span>Risk: <span className="text-white font-medium">{mat.riskScore}%</span></span>
                                    <span>Cost: <span className="text-white font-medium">{mat.costScore}%</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </LocalCard>
            )}

            {context.decisions.length > 0 && (
                <LocalCard title="Agent Decision History" className="bg-gray-800/70 border-blue-800" expanded={expandedCards.agentDecisionHistory} onToggleExpand={() => toggleCardExpansion('agentDecisionHistory')}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4 rounded-lg bg-gray-900/50 border border-gray-700 shadow-inner">
                        {context.decisions.map((decision, i) => (
                            <div key={i} className={`p-3 rounded-lg text-sm border-l-4
                                ${decision.outcome === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' :
                                decision.outcome === 'failure' ? 'bg-red-900/20 border-red-500 text-red-200' :
                                decision.outcome === 'pivot' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200' :
                                'bg-blue-900/20 border-blue-500 text-blue-200'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <strong className="text-blue-400">{decision.phase.replace(/_/g, ' ')}</strong>
                                    <span className="text-xs text-gray-400">{new Date(decision.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-gray-200 mb-1">{decision.description}</p>
                                {decision.reasoning && <p className="text-xs italic text-gray-400">Reasoning: {decision.reasoning}</p>}
                                {/* {decision.details && <details className="text-xs text-gray-500 cursor-pointer"><summary>Details</summary><pre className="whitespace-pre-wrap">{JSON.stringify(decision.details, null, 2)}</pre></details>} */}
                            </div>
                        ))}
                    </div>
                </LocalCard>
            )}

            {(context.patentsFiled.length > 0 || context.grantsSubmitted.length > 0 || context.publicationsSubmitted.length > 0) && (
                 <LocalCard title="IP & Publications" className="bg-gray-800/70 border-amber-800" expanded={expandedCards.ipAndPublications} onToggleExpand={() => toggleCardExpansion('ipAndPublications')}>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {context.patentsFiled.length > 0 && (
                             <div className="bg-gray-900/50 p-5 rounded-lg border border-gray-700 shadow-md">
                                 <h3 className="font-semibold text-amber-400 text-xl mb-3">Patents Filed ({context.patentsFiled.length})</h3>
                                 <ul className="space-y-3">
                                     {context.patentsFiled.map(patent => (
                                         <li key={patent.id} className="text-sm border-b border-gray-700 pb-2">
                                             <p className="font-medium text-white">{patent.title}</p>
                                             <p className="text-gray-400">Status: <span className={`font-medium ${patent.status === 'granted' ? 'text-green-400' : patent.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{patent.status.replace(/_/g, ' ')}</span></p>
                                             <p className="text-gray-500">Filed: {patent.filingDate}</p>
                                             <p className="text-gray-500">Materials: {patent.associatedMaterials.map(mId => mId.split('-')[1]).join(', ')}</p>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         )}
                         {context.grantsSubmitted.length > 0 && (
                             <div className="bg-gray-900/50 p-5 rounded-lg border border-gray-700 shadow-md">
                                 <h3 className="font-semibold text-fuchsia-400 text-xl mb-3">Grants Submitted ({context.grantsSubmitted.length})</h3>
                                 <ul className="space-y-3">
                                     {context.grantsSubmitted.map(grant => (
                                         <li key={grant.id} className="text-sm border-b border-gray-700 pb-2">
                                             <p className="font-medium text-white">{grant.title}</p>
                                             <p className="text-gray-400">Status: <span className={`font-medium ${grant.status === 'funded' ? 'text-green-400' : grant.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{grant.status.replace(/_/g, ' ')}</span></p>
                                             <p className="text-gray-500">Requested: {formatNumber(grant.budgetRequest, true)}</p>
                                             {grant.currentFunding && <p className="text-gray-500">Funded: {formatNumber(grant.currentFunding, true)}</p>}
                                             <p className="text-gray-500">Agency: {grant.fundingAgency}</p>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         )}
                         {context.publicationsSubmitted.length > 0 && (
                             <div className="bg-gray-900/50 p-5 rounded-lg border border-gray-700 shadow-md">
                                 <h3 className="font-semibold text-rose-400 text-xl mb-3">Publications ({context.publicationsSubmitted.length})</h3>
                                 <ul className="space-y-3">
                                     {context.publicationsSubmitted.map(pub => (
                                         <li key={pub.id} className="text-sm border-b border-gray-700 pb-2">
                                             <p className="font-medium text-white">{pub.title}</p>
                                             <p className="text-gray-400">Journal: {pub.journal}</p>
                                             <p className="text-gray-400">Status: <span className={`font-medium ${pub.status === 'accepted' ? 'text-green-400' : pub.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{pub.status.replace(/_/g, ' ')}</span></p>
                                             <p className="text-gray-500">Submitted: {pub.submissionDate}</p>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         )}
                     </div>
                 </LocalCard>
             )}


            {context.researchReport && context.currentPhase === ResearchPhase.COMPLETED && (
                <LocalCard title="Final Research Report: Publication Draft" className="bg-gray-800/70 border-cyan-800" expanded={expandedCards.finalResearchReport} onToggleExpand={() => toggleCardExpansion('finalResearchReport')}>
                    <h2 className="text-4xl font-bold text-white mb-4 text-center">{context.researchReport.title}</h2>
                    <p className="text-gray-400 text-md mb-6 text-center">By: {context.researchReport.author} | Date: {context.researchReport.date}</p>

                    <div className="space-y-8 text-gray-300 text-base leading-relaxed">
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Abstract</h3>
                            <p className="text-lg">{context.researchReport.abstract}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Introduction</h3>
                            <p>{context.researchReport.introduction}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Hypotheses</h3>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                {context.researchReport.hypotheses.map((h, i) => (
                                    <li key={i}>
                                        <strong className="text-white">H{i + 1}:</strong> {h.text} (Status: <span className={`${h.status === 'supported' ? 'text-green-400' : h.status === 'refuted' ? 'text-red-400' : 'text-yellow-400'}`}>{h.status.replace(/_/g, ' ')}</span>)
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Methodology & Experiments</h3>
                            <div className="space-y-4 pl-4">
                                {context.researchReport.experiments.map((exp, i) => (
                                    <div key={i} className="bg-gray-900/50 p-4 rounded border border-gray-700 shadow-sm">
                                        <h4 className="font-semibold text-purple-300 text-lg">{exp.name} ({exp.type.charAt(0).toUpperCase() + exp.type.slice(1)})</h4>
                                        <p className="text-sm italic text-gray-400 mt-1">{exp.designRationale.substring(0, 150)}...</p>
                                        {exp.results && (
                                            <p className="text-sm mt-2 text-gray-300">Summary: {exp.results.analysisSummary}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Results Summary</h3>
                            <p>{context.researchReport.resultsSummary}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Discussion</h3>
                            <p>{context.researchReport.discussion}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Conclusion</h3>
                            <p>{context.researchReport.conclusion}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Future Work & Recommendations</h3>
                            <p>{context.researchReport.futureWork}</p>
                            <ul className="list-disc list-inside space-y-1 pl-4 mt-2 text-gray-400">
                                {context.researchReport.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
                        {context.researchReport.safetyAssessment && (
                            <div>
                                <h3 className="text-2xl font-semibold text-red-300 mb-3 border-b border-gray-700 pb-1">Simulated Safety Assessment</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 pl-4">
                                    {context.researchReport.safetyAssessment.map((metric, idx) => (
                                        <li key={idx}>
                                            {metric.name}: <span className="text-white font-medium">{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</span>
                                            {metric.interpretation && <span className="italic text-gray-500 ml-2">({metric.interpretation})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {context.researchReport.economicAnalysis && (
                            <div>
                                <h3 className="text-2xl font-semibold text-green-300 mb-3 border-b border-gray-700 pb-1">Simulated Economic Analysis</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 pl-4">
                                    {context.researchReport.economicAnalysis.map((metric, idx) => (
                                        <li key={idx}>
                                            {metric.name}: <span className="text-white font-medium">{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</span>
                                            {metric.interpretation && <span className="italic text-gray-500 ml-2">({metric.interpretation})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {context.researchReport.citations.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-semibold text-cyan-300 mb-3 border-b border-gray-700 pb-1">Citations</h3>
                                <ul className="list-disc list-inside text-sm space-y-1 pl-4">
                                    {context.researchReport.citations.map((citation, i) => (
                                        <li key={i}>{citation}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </LocalCard>
            )}

            {context.currentPhase === ResearchPhase.FAILED && (
                <LocalCard title="Research Cycle Failed" className="bg-red-900/40 border-red-700 shadow-xl">
                    <p className="text-red-300 text-xl text-center">
                        The autonomous scientist encountered a critical error and could not complete the research goal.
                        Please review the Agent Activity Log and Decision History for details to understand the failure.
                    </p>
                </LocalCard>
            )}

            <div className="text-center text-gray-500 text-sm mt-12 pb-8">
                Autonomous Scientist AI v1.0.1 - Advanced Simulated Research Environment.
            </div>
        </div>
    );
};

export default AutonomousScientistView;