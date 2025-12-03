import { JamesBurvelOCallaghanIiiApiTheQuantumCorePublisherEdition as QuantumCoreClient } from "../src"; // Adjust the import path as needed

// --- Configuration ---
// In a real application, you would get this from a secure source like environment variables.
const AUTH_TOKEN = process.env.QUANTUM_CORE_AUTH_TOKEN || "your-oauth2-access-token";
const API_KEY = process.env.QUANTUM_CORE_API_KEY || "your-api-key";

// Initialize the Quantum Core API Client
const quantumCore = new QuantumCoreClient({
    security: {
        oAuth2Auth: `Bearer ${AUTH_TOKEN}`,
        apiKeyAuth: API_KEY,
    },
});

/**
 * Main function to demonstrate the AI services of the Quantum Core API.
 */
async function showcaseAIServices() {
    console.log("🚀 Starting AI Services Showcase for the Quantum Core API 🚀");
    console.log("==========================================================");

    try {
        // 1. Engage with the Quantum AI Advisor
        await demonstrateAIAdvisor();

        // 2. Run a predictive simulation with the Quantum Oracle
        await demonstrateQuantumOracle();

        // 3. Submit a business plan to the Quantum Weaver incubator
        await demonstrateQuantumWeaver();

    } catch (error) {
        console.error("\n❌ An error occurred during the AI services showcase:");
        if (error instanceof Error) {
            console.error(error.message);
            // Log more detailed error info if available (e.g., from an API error object)
            const apiError = error as any;
            if (apiError.body) {
                console.error("API Response Body:", JSON.stringify(apiError.body, null, 2));
            }
        } else {
            console.error(error);
        }
    } finally {
        console.log("\n==========================================================");
        console.log("✅ AI Services Showcase Concluded ✅");
    }
}

/**
 * Demonstrates a conversation with the Quantum AI Advisor.
 */
async function demonstrateAIAdvisor() {
    console.log("\n--- 1. Engaging with Quantum AI Advisor ---");
    const sessionId = `session-${Date.now()}`;
    console.log(`Starting a new chat session: ${sessionId}`);

    const response = await quantumCore.aiAdvisorQuantum.chatWithQuantumAdvanced({
        message: "Analyze my spending for last month. Where is the biggest opportunity to save money without impacting my 'Health & Fitness' budget?",
        sessionId: sessionId,
    });

    if (response.statusCode === 200 && response.object) {
        console.log("🤖 Quantum Advisor's Response:");
        console.log(`   Text: "${response.object.text}"`);
        if (response.object.proactiveInsights && response.object.proactiveInsights.length > 0) {
            console.log("   Proactive Insights Found:");
            response.object.proactiveInsights.forEach(insight => {
                console.log(`     - [${insight.severity?.toUpperCase()}] ${insight.title}: ${insight.description}`);
            });
        }
    } else {
        console.error("Failed to get a response from the AI Advisor.", response);
    }
}

/**
 * Demonstrates running a 'what-if' scenario with the Quantum Oracle.
 */
async function demonstrateQuantumOracle() {
    console.log("\n--- 2. Consulting the Quantum Oracle for a Predictive Simulation ---");
    console.log("Simulating the impact of increasing retirement contributions...");

    const simulationResponse = await quantumCore.quantumOraclePredictiveSimulation.simulateWithQuantumOracle({
        prompt: "What is the long-term impact on my retirement goal if I increase my monthly investment contributions by $500 for the next 10 years, assuming a moderate risk profile?",
        parameters: {
            durationYears: 10,
            monthlyInvestmentAmount: 500,
            riskTolerance: "moderate",
        },
    });

    if (simulationResponse.statusCode === 200 && simulationResponse.simulationResponse) {
        const result = simulationResponse.simulationResponse;
        console.log("🔮 Quantum Oracle Simulation Results:");
        console.log(`   Simulation ID: ${result.simulationId}`);
        console.log(`   Narrative Summary: ${result.narrativeSummary}`);
        console.log("   Key Impacts:");
        result.keyImpacts.forEach(impact => {
            console.log(`     - Metric: ${impact.metric}`);
            console.log(`       Value: ${impact.value}`);
            console.log(`       Severity: ${impact.severity}`);
        });
        if (result.recommendations && result.recommendations.length > 0) {
            console.log("   Actionable Recommendations:");
            result.recommendations.forEach(rec => {
                console.log(`     - ${rec.title}: ${rec.description}`);
            });
        }
    } else {
        console.error("Failed to run the simulation with the Quantum Oracle.", simulationResponse);
    }
}

/**
 * Demonstrates submitting a business plan to the Quantum Weaver incubator.
 */
async function demonstrateQuantumWeaver() {
    console.log("\n--- 3. Submitting a Business Plan to the Quantum Weaver Incubator ---");
    console.log("Pitching 'SynergyChain AI' for seed funding...");

    const pitchResponse = await quantumCore.quantumWeaverBusinessIncubation.pitchToQuantumWeaver({
        businessPlan: "Our venture, 'SynergyChain AI,' aims to revolutionize global supply chain transparency and efficiency using a decentralized AI ledger. We leverage quantum-inspired algorithms to predict disruptions and optimize logistics, targeting multinational corporations.",
        foundingTeam: [
            {
                name: "Dr. Eleanor Vance",
                role: "CEO & Lead AI Scientist",
                experience: "15+ years in AI/ML, PhD in Quantum Computing, ex-Google Brain"
            },
            {
                name: "Marcus Thorne",
                role: "COO & Finance Expert",
                experience: "20+ years in Fintech, ex-Goldman Sachs"
            }
        ],
        marketOpportunity: "The global supply chain market faces $1.5T in annual losses due to inefficiencies. SynergyChain AI offers a 30% reduction in lead times and a 15% cut in operational costs, capturing a significant portion of this serviceable market.",
        financialProjections: {
            seedRoundAmount: 2500000,
            valuationPreMoney: 10000000,
            projectionYears: 3,
            revenueForecast: [500000, 2000000, 6000000],
            profitabilityEstimate: "Achieve profitability within 18 months."
        }
    });

    if (pitchResponse.statusCode === 202 && pitchResponse.quantumWeaverState) {
        const result = pitchResponse.quantumWeaverState;
        console.log("📈 Quantum Weaver Pitch Submission Status:");
        console.log(`   Pitch ID: ${result.pitchId}`);
        console.log(`   Current Stage: ${result.stage}`);
        console.log(`   Status Message: "${result.statusMessage}"`);
        console.log(`   Next Steps: "${result.nextSteps}"`);
    } else {
        console.error("Failed to submit the pitch to Quantum Weaver.", pitchResponse);
    }
}

// Run the showcase if the script is executed directly
if (require.main === module) {
    showcaseAIServices();
}