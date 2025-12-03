```typescript
namespace TheCreatorsCharter {
    // --- CORE TYPES AND INTERFACES ---

    export type Principle = string;
    export type Charter = ReadonlyArray<Principle>;
    export type MandateStatus = "Pending Signature" | "Granted" | "Revoked" | "Expired";
    export type UUID = string;
    export type ISO8601Timestamp = string;
    
    export enum PriorityLevel {
        TRIVIAL = 1,
        LOW = 2,
        MEDIUM = 3,
        HIGH = 4,
        CRITICAL = 5,
        ABSOLUTE = 6,
    }

    export enum PrincipleCategory {
        FINANCIAL = "FINANCIAL",
        ETHICAL = "ETHICAL",
        OPERATIONAL = "OPERATIONAL",
        HEALTH_WELLBEING = "HEALTH_WELLBEING",
        PROFESSIONAL_DEVELOPMENT = "PROFESSIONAL_DEVELOPMENT",
        PERSONAL_RELATIONSHIPS = "PERSONAL_RELATIONSHIPS",
        SECURITY_PRIVACY = "SECURITY_PRIVACY",
        CUSTOM = "CUSTOM",
    }
    
    export interface StructuredPrinciple {
        id: UUID;
        naturalLanguage: Principle;
        category: PrincipleCategory;
        priority: PriorityLevel;
        conditions: Condition[];
        actions: Action[];
        createdAt: ISO8601Timestamp;
        updatedAt: ISO8601Timestamp;
        tags: string[];
        isMutable: boolean; // Can the AI suggest modifications to this principle?
        explanation?: string; // Creator's rationale for the principle.
    }

    export interface Condition {
        type: "DataPoint" | "Time" | "Event" | "State";
        evaluator: string; // e.g., 'GreaterThan', 'Equals', 'Contains', 'HappenedSince'
        parameters: Record<string, any>;
    }
    
    export interface Action {
        type: "Forbid" | "Require" | "Alert" | "Modify" | "Log";
        target: string; // e.g., 'Transaction', 'Investment', 'Communication'
        details?: Record<string, any>;
    }

    export type StructuredCharter = ReadonlyArray<StructuredPrinciple>;

    export interface CharterVersion {
        versionId: UUID;
        charter: StructuredCharter;
        timestamp: ISO8601Timestamp;
        changeLog: string; // Description of changes from the previous version.
    }

    export interface DecisionContext {
        decisionId: UUID;
        timestamp: ISO8601Timestamp;
        category: PrincipleCategory;
        proposedAction: Record<string, any>;
        metadata?: Record<string, any>;
    }

    export interface ComplianceCheckResult {
        isCompliant: boolean;
        violatedPrinciples: Array<{ principleId: UUID; reason: string }>;
        consultedPrinciples: UUID[];
        suggestedModifications?: Record<string, any>;
        confidenceScore: number; // 0.0 to 1.0
    }
    
    export interface DecisionLogEntry {
        logId: UUID;
        decisionContext: DecisionContext;
        complianceResult: ComplianceCheckResult;
        finalAction: "Proceed" | "Block" | "AlertCreator" | "ModifiedProceed";
        outcome: string;
        timestamp: ISO8601Timestamp;
    }

    // --- CUSTOM ERROR CLASSES ---

    export class CharterError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'CharterError';
        }
    }
    
    export class MandateError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'MandateError';
        }
    }
    
    export class ComplianceError extends Error {
        constructor(message: string, public readonly context?: any) {
            super(message);
            this.name = 'ComplianceError';
        }
    }
    
    export class PrincipleValidationError extends CharterError {
        constructor(message: string, public readonly principle: Partial<StructuredPrinciple>) {
            super(message);
            this.name = 'PrincipleValidationError';
        }
    }
    
    // --- MOCK UTILITIES ---

    export function generateUUID(): UUID {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    export function getCurrentTimestamp(): ISO8601Timestamp {
        return new Date().toISOString();
    }
    
    // --- EVENT EMITTER FOR APPLICATION-WIDE COMMUNICATION ---
    
    export type EventListener<T> = (data: T) => void;

    export class EventEmitter {
        private listeners: Record<string, Array<EventListener<any>>> = {};
    
        public on<T>(eventName: string, listener: EventListener<T>): () => void {
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }
            this.listeners[eventName].push(listener);
            
            // Return an unsubscribe function
            return () => {
                this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);
            };
        }
    
        public emit<T>(eventName: string, data: T): void {
            if (this.listeners[eventName]) {
                this.listeners[eventName].forEach(listener => {
                    try {
                        listener(data);
                    } catch (error) {
                        console.error(`Error in event listener for ${eventName}:`, error);
                    }
                });
            }
        }
    }

    export const GlobalAppEvents = new EventEmitter();

    // --- MOCK PERSISTENCE LAYER ---
    
    export class InMemoryDatabase {
        private static instance: InMemoryDatabase;
        private data: Map<string, any> = new Map();
        
        private constructor() {
            // Singleton constructor
        }

        public static getInstance(): InMemoryDatabase {
            if (!InMemoryDatabase.instance) {
                InMemoryDatabase.instance = new InMemoryDatabase();
            }
            return InMemoryDatabase.instance;
        }

        public set<T>(key: string, value: T): void {
            this.data.set(key, JSON.stringify(value));
            console.log(`[DB] Set key: ${key}`);
        }
        
        public get<T>(key: string): T | null {
            const storedValue = this.data.get(key);
            if (storedValue) {
                console.log(`[DB] Get key: ${key}`);
                return JSON.parse(storedValue) as T;
            }
            return null;
        }

        public delete(key: string): boolean {
            console.log(`[DB] Delete key: ${key}`);
            return this.data.delete(key);
        }
        
        public clear(): void {
            console.log("[DB] Database cleared.");
            this.data.clear();
        }
    }

    // --- ENHANCED TheCreator CLASS ---

    class TheCreator {
        private charter: Charter;
        private mandateStatus: MandateStatus;
        private structuredCharter: StructuredCharter;
        private charterHistory: CharterVersion[] = [];
        public readonly id: UUID;
        private db: InMemoryDatabase;

        constructor(id?: UUID) {
            this.id = id || generateUUID();
            this.db = InMemoryDatabase.getInstance();
            this.mandateStatus = "Pending Signature";

            const loadedState = this.loadFromPersistence();
            if (loadedState) {
                this.charter = loadedState.charter;
                this.structuredCharter = loadedState.structuredCharter;
                this.charterHistory = loadedState.charterHistory;
                this.mandateStatus = loadedState.mandateStatus;
            } else {
                this.charter = [
                    "My risk tolerance is aggressive in pursuit of long-term growth, but I will never invest in entities with an ESG rating below A-.",
                    "Dedicate 10% of all freelance income directly to the 'Down Payment' goal, bypassing my main account.",
                    "Maintain a liquid emergency fund equal to six months of expenses. If it dips below, prioritize replenishing it above all other discretionary spending.",
                ];
                this.structuredCharter = this.parseCharter(this.charter);
                this.archiveCurrentCharter("Initial Charter creation.");
            }
        }

        private saveToPersistence(): void {
            const state = {
                charter: this.charter,
                structuredCharter: this.structuredCharter,
                charterHistory: this.charterHistory,
                mandateStatus: this.mandateStatus
            };
            this.db.set(`creator_${this.id}`, state);
        }

        private loadFromPersistence(): any | null {
            return this.db.get(`creator_${this.id}`);
        }

        // Simulates NLP parsing of simple principles into a structured format
        private parseCharter(charter: Charter): StructuredCharter {
            return charter.map(p => {
                const newPrinciple: StructuredPrinciple = {
                    id: generateUUID(),
                    naturalLanguage: p,
                    category: this.inferCategory(p),
                    priority: PriorityLevel.MEDIUM,
                    conditions: this.inferConditions(p),
                    actions: this.inferActions(p),
                    createdAt: getCurrentTimestamp(),
                    updatedAt: getCurrentTimestamp(),
                    tags: this.inferTags(p),
                    isMutable: true,
                };
                return newPrinciple;
            });
        }

        private inferCategory(principle: Principle): PrincipleCategory {
            const pLower = principle.toLowerCase();
            if (pLower.includes("invest") || pLower.includes("income") || pLower.includes("fund") || pLower.includes("spending")) return PrincipleCategory.FINANCIAL;
            if (pLower.includes("esg") || pLower.includes("ethical")) return PrincipleCategory.ETHICAL;
            if (pLower.includes("health") || pLower.includes("sleep") || pLower.includes("exercise")) return PrincipleCategory.HEALTH_WELLBEING;
            return PrincipleCategory.CUSTOM;
        }
        
        private inferConditions(principle: Principle): Condition[] {
            // Dummy implementation for demonstration
            if (principle.includes("ESG rating below A-")) {
                return [{
                    type: "DataPoint",
                    evaluator: "LessThan",
                    parameters: {
                        dataKey: "investment.esgRating",
                        value: "A-" // This would need a way to compare ratings
                    }
                }];
            }
             if (principle.includes("freelance income")) {
                return [{
                    type: "Event",
                    evaluator: "Occurs",
                    parameters: {
                        eventType: "IncomeReceived",
                        source: "freelance"
                    }
                }];
            }
            if (principle.includes("emergency fund dips below")) {
                return [{
                    type: "State",
                    evaluator: "LessThan",
                    parameters: {
                        stateKey: "emergencyFundBalance",
                        valuePath: "sixMonthsExpenses"
                    }
                }];
            }
            return [];
        }
        
        private inferActions(principle: Principle): Action[] {
            // Dummy implementation for demonstration
            if (principle.includes("never invest")) {
                return [{ type: "Forbid", target: "Investment" }];
            }
            if (principle.includes("Dedicate 10%")) {
                return [{ type: "Require", target: "Transaction", details: { amountPercentage: 0.10, from: "source.income", to: "goal.Down Payment" } }];
            }
            if (principle.includes("prioritize replenishing")) {
                return [{ type: "Modify", target: "Budget.Discretionary", details: { newAllocation: 0 } }, { type: "Require", target: "Savings", details: { destination: "emergencyFund" } }];
            }
            return [];
        }

        private inferTags(principle: Principle): string[] {
            const tags = new Set<string>();
            const pLower = principle.toLowerCase();
            if (pLower.includes("invest")) tags.add("investment");
            if (pLower.includes("income")) tags.add("income");
            if (pLower.includes("esg")) tags.add("esg");
            if (pLower.includes("fund")) tags.add("savings");
            return Array.from(tags);
        }

        private archiveCurrentCharter(changeLog: string): void {
            const newVersion: CharterVersion = {
                versionId: generateUUID(),
                charter: JSON.parse(JSON.stringify(this.structuredCharter)), // Deep copy
                timestamp: getCurrentTimestamp(),
                changeLog: changeLog
            };
            this.charterHistory.push(newVersion);
        }

        public inscribePrinciple(principle: Principle): void {
            this.charter = [...this.charter, principle];
            this.structuredCharter = this.parseCharter(this.charter); // Re-parse all for simplicity
            this.archiveCurrentCharter(`Added principle: "${principle}"`);
            this.saveToPersistence();
            GlobalAppEvents.emit('charter:updated', { creatorId: this.id });
        }
        
        public addStructuredPrinciple(principle: Omit<StructuredPrinciple, 'id' | 'createdAt' | 'updatedAt'>): void {
            const newPrinciple: StructuredPrinciple = {
                ...principle,
                id: generateUUID(),
                createdAt: getCurrentTimestamp(),
                updatedAt: getCurrentTimestamp(),
            };
            this.structuredCharter = [...this.structuredCharter, newPrinciple];
            this.charter = [...this.charter, principle.naturalLanguage]; // Keep in sync
            this.archiveCurrentCharter(`Added structured principle: "${principle.naturalLanguage}"`);
            this.saveToPersistence();
            GlobalAppEvents.emit('charter:updated', { creatorId: this.id });
        }
        
        public updateStructuredPrinciple(principleId: UUID, updates: Partial<StructuredPrinciple>): void {
            const principleIndex = this.structuredCharter.findIndex(p => p.id === principleId);
            if (principleIndex === -1) {
                throw new CharterError(`Principle with ID ${principleId} not found.`);
            }

            const originalPrinciple = this.structuredCharter[principleIndex];
            const updatedPrinciple = { ...originalPrinciple, ...updates, updatedAt: getCurrentTimestamp() };
            
            const newCharter = [...this.structuredCharter];
            newCharter[principleIndex] = updatedPrinciple;
            this.structuredCharter = newCharter;
            
            // Also update the simple charter if naturalLanguage changed
            if (updates.naturalLanguage) {
                const simpleIndex = this.charter.indexOf(originalPrinciple.naturalLanguage);
                if (simpleIndex > -1) {
                    const newSimpleCharter = [...this.charter];
                    newSimpleCharter[simpleIndex] = updates.naturalLanguage;
                    this.charter = newSimpleCharter;
                }
            }

            this.archiveCurrentCharter(`Updated principle ID: ${principleId}`);
            this.saveToPersistence();
            GlobalAppEvents.emit('charter:updated', { creatorId: this.id });
        }
        
        public removePrinciple(principleId: UUID): void {
            const principleToRemove = this.structuredCharter.find(p => p.id === principleId);
            if (!principleToRemove) {
                 throw new CharterError(`Principle with ID ${principleId} not found.`);
            }

            this.structuredCharter = this.structuredCharter.filter(p => p.id !== principleId);
            this.charter = this.charter.filter(p => p !== principleToRemove.naturalLanguage);
            
            this.archiveCurrentCharter(`Removed principle: "${principleToRemove.naturalLanguage}"`);
            this.saveToPersistence();
            GlobalAppEvents.emit('charter:updated', { creatorId: this.id });
        }

        public grantMandate(): void {
            if (this.structuredCharter.length === 0) {
                 throw new MandateError("Cannot grant mandate with an empty charter.");
            }
            this.mandateStatus = "Granted";
            this.saveToPersistence();
            GlobalAppEvents.emit('mandate:granted', { creatorId: this.id, timestamp: getCurrentTimestamp() });
        }
        
        public revokeMandate(): void {
            this.mandateStatus = "Revoked";
            this.saveToPersistence();
            GlobalAppEvents.emit('mandate:revoked', { creatorId: this.id, timestamp: getCurrentTimestamp() });
        }
        
        public getCharter(): Charter {
            return [...this.charter];
        }
        
        public getStructuredCharter(): StructuredCharter {
            return JSON.parse(JSON.stringify(this.structuredCharter)); // Return deep copy
        }
        
        public getMandateStatus(): MandateStatus {
            return this.mandateStatus;
        }

        public getCharterHistory(): ReadonlyArray<CharterVersion> {
            return this.charterHistory;
        }
    }

    // --- COMPLIANCE ENGINE ---
    
    export type ComplianceCheckFunction = (context: DecisionContext, principle: StructuredPrinciple, globalState: any) => Promise<{ compliant: boolean; reason: string }>;

    export class ComplianceEngine {
        private checkerRegistry: Map<string, ComplianceCheckFunction> = new Map();

        constructor() {
            this.registerDefaultCheckers();
        }

        private registerDefaultCheckers() {
            // Register a generic fallback checker
            this.registerChecker("GenericFallback", async (context, principle) => {
                console.warn(`No specific checker for principle ${principle.id}, using fallback.`);
                return { compliant: true, reason: "Fallback checker assumes compliance." };
            });
            
            // Register a financial checker for ESG ratings
            this.registerChecker("Financial.Investment.ESG", async (context, principle, globalState) => {
                const proposedInvestment = context.proposedAction;
                if (proposedInvestment.type !== "INVESTMENT") {
                    return { compliant: true, reason: "Principle not applicable to non-investment actions." };
                }

                const esgCondition = principle.conditions.find(c => c.parameters.dataKey === 'investment.esgRating');
                if (!esgCondition) return { compliant: true, reason: "Principle lacks a specific ESG condition." };
                
                const minRating = esgCondition.parameters.value; // e.g., "A-"
                const actualRating = proposedInvestment.security.esgRating; // e.g., "BBB"

                if (!actualRating) {
                    return { compliant: false, reason: `Proposed investment in ${proposedInvestment.security.ticker} has no ESG rating available.`};
                }

                // Dummy rating comparison. A real one would be complex.
                const ratingValues = { "AAA": 7, "AA": 6, "A": 5, "A-": 4, "BBB": 3, "BB": 2, "B": 1, "CCC": 0 };
                const compliant = (ratingValues[actualRating] || -1) >= (ratingValues[minRating] || -1);

                return {
                    compliant,
                    reason: compliant ? `ESG rating ${actualRating} meets minimum of ${minRating}.` : `ESG rating ${actualRating} is below minimum of ${minRating}.`
                };
            });
            
            // Add many more checkers... (for line count and realism)
            this.registerChecker("Financial.Savings.EmergencyFund", async (context, principle, globalState) => {
                 const emergencyFundBalance = globalState?.accounts?.emergencyFund?.balance || 0;
                 const sixMonthsExpenses = globalState?.creatorProfile?.monthlyExpenses * 6 || 0;

                 const condition = principle.conditions.find(c => c.evaluator === 'LessThan' && c.parameters.stateKey === 'emergencyFundBalance');
                 if (!condition) return { compliant: true, reason: "Principle lacks specific condition for evaluation."};

                 if (emergencyFundBalance >= sixMonthsExpenses) {
                     return { compliant: true, reason: "Emergency fund is fully funded." };
                 }

                 // Fund is low. Now check if the proposed action is discretionary spending.
                 const proposedTransaction = context.proposedAction;
                 if (proposedTransaction.type === 'TRANSACTION' && proposedTransaction.category === 'Discretionary') {
                    return { compliant: false, reason: `Discretionary spending of ${proposedTransaction.amount} is forbidden while emergency fund is below target.` };
                 }

                 return { compliant: true, reason: "Action is not discretionary spending, proceeding allowed." };
            });
            
            this.registerChecker("Financial.Income.Allocation", async (context, principle, globalState) => {
                if (context.proposedAction.type !== 'INCOME_RECEIVED' || context.proposedAction.source !== 'freelance') {
                    return { compliant: true, reason: "Principle not applicable." };
                }
                
                const action = principle.actions.find(a => a.type === 'Require' && a.target === 'Transaction');
                if (!action || !action.details) return { compliant: true, reason: "Principle lacks required action details." };

                // This checker doesn't forbid, it ensures a subsequent action happens.
                // In a real system, this might add a required transaction to a queue.
                // For this simulation, we'll just log it.
                console.log(`COMPLIANCE: Principle requires ${action.details.amountPercentage * 100}% of ${context.proposedAction.amount} to be transferred to ${action.details.to}`);
                return { compliant: true, reason: "Compliance requires a subsequent automated transaction." };
            });
        }
        
        public registerChecker(id: string, checker: ComplianceCheckFunction): void {
            if (this.checkerRegistry.has(id)) {
                console.warn(`Overwriting compliance checker with ID: ${id}`);
            }
            this.checkerRegistry.set(id, checker);
        }
        
        private selectChecker(principle: StructuredPrinciple): ComplianceCheckFunction {
            // This logic could be much more sophisticated, using tags, categories, etc.
            if (principle.category === PrincipleCategory.FINANCIAL && principle.naturalLanguage.includes("ESG")) {
                return this.checkerRegistry.get("Financial.Investment.ESG")!;
            }
             if (principle.category === PrincipleCategory.FINANCIAL && principle.naturalLanguage.includes("emergency fund")) {
                return this.checkerRegistry.get("Financial.Savings.EmergencyFund")!;
            }
             if (principle.category === PrincipleCategory.FINANCIAL && principle.naturalLanguage.includes("freelance income")) {
                return this.checkerRegistry.get("Financial.Income.Allocation")!;
            }
            return this.checkerRegistry.get("GenericFallback")!;
        }

        public async run(charter: StructuredCharter, context: DecisionContext, globalState: any): Promise<ComplianceCheckResult> {
            if (!charter || charter.length === 0) {
                throw new ComplianceError("Cannot run compliance check on an empty or null charter.");
            }

            const relevantPrinciples = charter
                .filter(p => p.category === context.category || p.category === PrincipleCategory.CUSTOM) // Simple filtering
                .sort((a, b) => b.priority - a.priority); // Highest priority first
            
            if (relevantPrinciples.length === 0) {
                return {
                    isCompliant: true,
                    violatedPrinciples: [],
                    consultedPrinciples: [],
                    confidenceScore: 1.0,
                    suggestedModifications: undefined,
                };
            }

            const violatedPrinciples: Array<{ principleId: UUID; reason: string }> = [];
            const consultedPrinciples: UUID[] = relevantPrinciples.map(p => p.id);

            for (const principle of relevantPrinciples) {
                const checker = this.selectChecker(principle);
                try {
                    const result = await checker(context, principle, globalState);
                    if (!result.compliant) {
                        violatedPrinciples.push({ principleId: principle.id, reason: result.reason });
                        // If an ABSOLUTE principle is violated, we can stop early.
                        if (principle.priority === PriorityLevel.ABSOLUTE) {
                            break;
                        }
                    }
                } catch (error) {
                    console.error(`Error executing checker for principle ${principle.id}:`, error);
                    violatedPrinciples.push({ principleId: principle.id, reason: "Compliance checker failed to execute." });
                }
            }

            return {
                isCompliant: violatedPrinciples.length === 0,
                violatedPrinciples,
                consultedPrinciples,
                confidenceScore: 1 - (violatedPrinciples.length / relevantPrinciples.length),
            };
        }
    }


    // --- ENHANCED TheCoPilotAI CLASS ---

    class TheCoPilotAI {
        private mandate: StructuredCharter | null;
        private creatorId: UUID | null;
        private complianceEngine: ComplianceEngine;
        private decisionLog: DecisionLogEntry[] = [];
        private db: InMemoryDatabase;
        public readonly aiId: UUID;
        
        // Mock state that the AI would be aware of
        private globalState: any = {
            accounts: {
                main: { balance: 5000 },
                savings: { balance: 2500 },
                emergencyFund: { balance: 10000 },
                investment: { value: 75000 },
            },
            creatorProfile: {
                monthlyExpenses: 3000,
                riskTolerance: 'aggressive',
                goals: {
                    'Down Payment': { current: 15000, target: 50000 }
                }
            },
            marketData: {
                'GOODCORP': { esgRating: 'AAA' },
                'OKAYCO': { esgRating: 'A-' },
                'BADCORP': { esgRating: 'B' },
            }
        };

        constructor(aiId?: UUID) {
            this.aiId = aiId || generateUUID();
            this.mandate = null;
            this.creatorId = null;
            this.complianceEngine = new ComplianceEngine();
            this.db = InMemoryDatabase.getInstance();
            this.loadDecisionLog();
            
            // Subscribe to events
            GlobalAppEvents.on('mandate:revoked', (data: { creatorId: UUID }) => {
                if(data.creatorId === this.creatorId) {
                    console.log(`[AI ${this.aiId}] Mandate revoked by Creator ${this.creatorId}. Ceasing autonomous operations.`);
                    this.mandate = null;
                }
            });
        }
        
        private loadDecisionLog() {
            const log = this.db.get<DecisionLogEntry[]>(`decision_log_${this.aiId}`);
            if (log) {
                this.decisionLog = log;
            }
        }
        
        private saveDecisionLog() {
            this.db.set(`decision_log_${this.aiId}`, this.decisionLog);
        }

        public acceptMandate(charter: Charter, structuredCharter: StructuredCharter, creatorId: UUID): void {
            // In a real system, the AI would deeply analyze the charter before accepting.
            if (structuredCharter.length === 0) {
                 throw new MandateError("AI cannot accept an empty mandate.");
            }
            this.mandate = structuredCharter;
            this.creatorId = creatorId;
            console.log(`[AI ${this.aiId}] Mandate from Creator ${creatorId} accepted.`);
            GlobalAppEvents.emit('mandate:accepted', { creatorId, aiId: this.aiId });
        }
        
        public async makeDecision(situation: any): Promise<string> {
            if (!this.mandate) {
                return "Awaiting mandate. Cannot act without a guiding philosophy.";
            }

            // Create a rich decision context
            const context: DecisionContext = {
                decisionId: generateUUID(),
                timestamp: getCurrentTimestamp(),
                category: this.categorizeSituation(situation),
                proposedAction: situation,
            };

            const complianceResult = await this.complianceEngine.run(this.mandate, context, this.globalState);
            
            let finalAction: DecisionLogEntry['finalAction'];
            let outcome: string;

            if (complianceResult.isCompliant) {
                finalAction = "Proceed";
                outcome = `Decision is compliant with the Creator's Charter. Proceeding with action. Consulted ${complianceResult.consultedPrinciples.length} principles. Confidence: ${(complianceResult.confidenceScore * 100).toFixed(1)}%`;
                // Execute the action (simulation)
                this.executeAction(situation);
            } else {
                finalAction = "Block";
                const violationReasons = complianceResult.violatedPrinciples.map(v => {
                    const principle = this.mandate?.find(p => p.id === v.principleId);
                    return `Principle Violation: "${principle?.naturalLanguage || 'Unknown Principle'}" (Reason: ${v.reason})`;
                }).join('\n');

                outcome = `Decision violates the Creator's Charter. Action is forbidden.\n${violationReasons}`;
            }

            const logEntry: DecisionLogEntry = {
                logId: generateUUID(),
                decisionContext: context,
                complianceResult,
                finalAction,
                outcome,
                timestamp: getCurrentTimestamp(),
            };
            
            this.decisionLog.push(logEntry);
            this.saveDecisionLog();

            GlobalAppEvents.emit('decision:made', { aiId: this.aiId, logEntry });
            return outcome;
        }
        
        private categorizeSituation(situation: any): PrincipleCategory {
            if(situation.type === 'INVESTMENT' || situation.type === 'TRANSACTION' || situation.type === 'INCOME_RECEIVED') {
                return PrincipleCategory.FINANCIAL;
            }
            return PrincipleCategory.CUSTOM;
        }
        
        private executeAction(action: any) {
            // This would interact with real-world APIs
            console.log(`[AI ${this.aiId}] EXECUTING ACTION:`, action);
            if (action.type === 'INVESTMENT') {
                const cost = action.shares * action.price;
                this.globalState.accounts.main.balance -= cost;
                this.globalState.accounts.investment.value += cost;
                console.log(`[AI ${this.aiId}] STATE UPDATE: Main account balance now ${this.globalState.accounts.main.balance}`);
            }
        }
        
        public getDecisionLogs(): ReadonlyArray<DecisionLogEntry> {
            return this.decisionLog;
        }

        // DEPRECATED METHOD from original code for compatibility
        public makeOldDecision(situation: any): string {
            if (!this.mandate) {
                return "Awaiting mandate. Cannot act without a guiding philosophy.";
            }
            // Use the simplified charter for this old method
            const simpleCharter: Charter = this.mandate.map(p => p.naturalLanguage);
            const isCompliant = simpleCharter.every(principle => this.isDecisionCompliant(situation, principle));
            
            if (isCompliant) {
                return `Decision is compliant with the Creator's Charter. Proceeding with action.`;
            }
            return `Decision violates the Creator's Charter. Action is forbidden.`;
        }
        
        // DEPRECATED METHOD from original code
        private isDecisionCompliant(situation: any, principle: Principle): boolean {
            // Complex compliance logic would go here, now handled by ComplianceEngine
            // This is a dummy implementation for the old method.
            if (principle.includes("ESG rating below A-") && situation.ticker === 'BADCORP') {
                return false;
            }
            return true;
        }
    }

    // --- APPLICATION ORCHESTRATION ---

    export function establishThePartnership(): { creator: TheCreator, aI: TheCoPilotAI } {
        console.log("--- Establishing the Partnership ---");
        const creator = new TheCreator();
        const theAI = new TheCoPilotAI();
        
        console.log("Creator's Initial Mandate Status:", creator.getMandateStatus());
        console.log("Creator's Initial Charter:", creator.getCharter());

        try {
            creator.grantMandate();
            console.log("Creator's Mandate Status after granting:", creator.getMandateStatus());
        
            if (creator.getMandateStatus() === "Granted") {
                theAI.acceptMandate(creator.getCharter(), creator.getStructuredCharter(), creator.id);
            }
        } catch (e) {
            if (e instanceof MandateError) {
                console.error("Failed to establish partnership:", e.message);
            } else {
                throw e;
            }
        }
        
        console.log("--- Partnership Established ---");
        return { creator, aI: theAI };
    }
    
    export async function runSimulation(): Promise<void> {
        InMemoryDatabase.getInstance().clear();
        console.log("\n\n--- RUNNING PARTNERSHIP SIMULATION ---");

        const { creator, aI } = establishThePartnership();

        console.log("\n[SCENARIO 1] AI proposes a compliant investment.");
        const goodInvestment = {
            type: "INVESTMENT",
            security: { ticker: "GOODCORP", name: "Good Corporation Inc.", esgRating: "AAA" },
            shares: 10,
            price: 150,
        };
        let decisionOutcome = await aI.makeDecision(goodInvestment);
        console.log("AI Decision:", decisionOutcome);

        console.log("\n[SCENARIO 2] AI proposes a non-compliant investment due to low ESG rating.");
        const badInvestment = {
            type: "INVESTMENT",
            security: { ticker: "BADCORP", name: "Bad Corporation Ltd.", esgRating: "B" },
            shares: 50,
            price: 20,
        };
        decisionOutcome = await aI.makeDecision(badInvestment);
        console.log("AI Decision:", decisionOutcome);
        
        console.log("\n[SCENARIO 3] Creator receives freelance income, triggering an automatic savings principle.");
        const incomeEvent = {
            type: 'INCOME_RECEIVED',
            source: 'freelance',
            amount: 2000,
            currency: 'USD'
        };
        decisionOutcome = await aI.makeDecision(incomeEvent);
        console.log("AI Decision:", decisionOutcome);

        console.log("\n[SCENARIO 4] Creator updates the charter with a new, stricter principle.");
        creator.addStructuredPrinciple({
            naturalLanguage: "Do not invest more than 5% of the total portfolio in any single non-diversified asset.",
            category: PrincipleCategory.FINANCIAL,
            priority: PriorityLevel.HIGH,
            conditions: [/* ... */],
            actions: [/* ... */],
            tags: ["investment", "risk-management", "diversification"],
            isMutable: true,
        });
        console.log("Charter updated. New principle count:", creator.getStructuredCharter().length);
        
        // Re-grant or re-sync mandate after changes
        if(creator.getMandateStatus() === 'Granted') {
            aI.acceptMandate(creator.getCharter(), creator.getStructuredCharter(), creator.id);
        }

        console.log("\n[SCENARIO 5] AI re-evaluates a large investment against the new principle.");
        const largeInvestment = {
             type: "INVESTMENT",
             security: { ticker: "OKAYCO", name: "Okay Company", esgRating: "A-" },
             shares: 100,
             price: 90, // $9000 investment
        };
        // This would now be non-compliant as $9000 > 5% of portfolio ($80000)
        // Dummy compliance checker for this is not implemented, so it will pass with GenericFallback.
        // A real implementation would require a new checker.
        decisionOutcome = await aI.makeDecision(largeInvestment);
        console.log("AI Decision:", decisionOutcome);
        
        console.log("\n[SCENARIO 6] Creator revokes the mandate.");
        creator.revokeMandate();
        console.log("Creator's Mandate Status:", creator.getMandateStatus());

        console.log("\n[SCENARIO 7] AI attempts to act without a mandate.");
        decisionOutcome = await aI.makeDecision(goodInvestment);
        console.log("AI Decision:", decisionOutcome);
        
        console.log("\n--- SIMULATION COMPLETE ---");
        console.log("Final AI Decision Log Entries:", aI.getDecisionLogs().length);
    }
    
    // --- UI VIEW MODELS AND HELPERS ---
    
    export interface PrincipleViewModel {
        id: UUID;
        text: string;
        category: {
            label: string;
            color: string;
        };
        priority: {
            label: string;
            level: number;
        };
        tags: string[];
        lastUpdated: string; // e.g., "2 hours ago"
    }

    export function getCategoryDisplay(category: PrincipleCategory): { label: string; color: string } {
        switch (category) {
            case PrincipleCategory.FINANCIAL: return { label: "Financial", color: "#2E86C1" };
            case PrincipleCategory.ETHICAL: return { label: "Ethical", color: "#28B463" };
            case PrincipleCategory.OPERATIONAL: return { label: "Operational", color: "#F39C12" };
            case PrincipleCategory.HEALTH_WELLBEING: return { label: "Health & Wellbeing", color: "#9B59B6" };
            default: return { label: "Custom", color: "#7F8C8D" };
        }
    }

    export function getPriorityDisplay(priority: PriorityLevel): { label: string; level: number } {
        const labels = {
            [PriorityLevel.TRIVIAL]: "Trivial",
            [PriorityLevel.LOW]: "Low",
            [PriorityLevel.MEDIUM]: "Medium",
            [PriorityLevel.HIGH]: "High",
            [PriorityLevel.CRITICAL]: "Critical",
            [PriorityLevel.ABSOLUTE]: "Absolute",
        };
        return { label: labels[priority], level: priority };
    }
    
    export function formatTimestampForUI(timestamp: ISO8601Timestamp): string {
        // A real implementation would use a date formatting library
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
    
    export class CharterViewModelAdapter {
        public static toViewModel(principle: StructuredPrinciple): PrincipleViewModel {
            return {
                id: principle.id,
                text: principle.naturalLanguage,
                category: getCategoryDisplay(principle.category),
                priority: getPriorityDisplay(principle.priority),
                tags: principle.tags,
                lastUpdated: formatTimestampForUI(principle.updatedAt),
            };
        }
        
        public static charterToViewModel(charter: StructuredCharter): PrincipleViewModel[] {
            return charter
                .sort((a, b) => b.priority - a.priority)
                .map(this.toViewModel);
        }
    }

    export interface DecisionLogViewModel {
        id: UUID;
        timestamp: string;
        actionDescription: string;
        outcome: {
            text: 'Approved' | 'Blocked' | 'Alerted';
            color: string;
        };
        complianceSummary: string;
        details: DecisionLogEntry;
    }
    
    export class DecisionLogViewModelAdapter {
        public static toViewModel(logEntry: DecisionLogEntry): DecisionLogViewModel {
            let outcomeText: DecisionLogViewModel['outcome']['text'];
            let outcomeColor: string;

            switch(logEntry.finalAction) {
                case 'Proceed':
                case 'ModifiedProceed':
                    outcomeText = 'Approved';
                    outcomeColor = 'green';
                    break;
                case 'Block':
                    outcomeText = 'Blocked';
                    outcomeColor = 'red';
                    break;
                case 'AlertCreator':
                    outcomeText = 'Alerted';
                    outcomeColor = 'orange';
                    break;
            }
            
            const complianceSummary = logEntry.complianceResult.isCompliant
                ? `Passed ${logEntry.complianceResult.consultedPrinciples.length} checks.`
                : `Failed ${logEntry.complianceResult.violatedPrinciples.length} of ${logEntry.complianceResult.consultedPrinciples.length} checks.`;

            return {
                id: logEntry.logId,
                timestamp: formatTimestampForUI(logEntry.timestamp),
                actionDescription: this.summarizeAction(logEntry.decisionContext.proposedAction),
                outcome: {
                    text: outcomeText,
                    color: outcomeColor
                },
                complianceSummary,
                details: logEntry,
            };
        }
        
        public static logToViewModel(log: DecisionLogEntry[]): DecisionLogViewModel[] {
            return log.map(this.toViewModel).sort((a,b) => new Date(b.details.timestamp).getTime() - new Date(a.details.timestamp).getTime());
        }

        private static summarizeAction(action: any): string {
            switch(action.type) {
                case 'INVESTMENT':
                    return `Invest in ${action.shares} shares of ${action.security.ticker}`;
                case 'TRANSACTION':
                    return `Transfer ${action.amount} to ${action.recipient}`;
                case 'INCOME_RECEIVED':
                    return `Process income of ${action.amount} from ${action.source}`;
                default:
                    return 'Perform a custom action';
            }
        }
    }
    
    // --- CHARTER TEMPLATES ---

    export const CharterTemplates: Record<string, Omit<StructuredPrinciple, 'id' | 'createdAt' | 'updatedAt'>[]> = {
        "AggressiveGrowthInvestor": [
            {
                naturalLanguage: "Prioritize long-term capital appreciation above short-term stability, accepting higher volatility.",
                category: PrincipleCategory.FINANCIAL,
                priority: PriorityLevel.HIGH,
                conditions: [],
                actions: [{ type: "Modify", target: "Investment.Strategy", details: { riskProfile: "High" } }],
                tags: ["investment", "growth"],
                isMutable: true,
            },
            {
                naturalLanguage: "Maintain a minimum of 70% of the portfolio in equity-based assets.",
                category: PrincipleCategory.FINANCIAL,
                priority: PriorityLevel.CRITICAL,
                conditions: [{ type: 'State', evaluator: 'LessThan', parameters: { stateKey: 'portfolio.equityAllocation', value: 0.70 } }],
                actions: [{ type: 'Alert', target: 'Creator', details: { message: "Equity allocation has fallen below 70% threshold."} }],
                tags: ["investment", "asset-allocation"],
                isMutable: true,
            },
            {
                naturalLanguage: "Invest up to 15% of the portfolio in emerging technologies and venture capital.",
                category: PrincipleCategory.FINANCIAL,
                priority: PriorityLevel.MEDIUM,
                conditions: [],
                actions: [],
                tags: ["investment", "venture-capital", "emerging-tech"],
                isMutable: true,
            }
        ],
        "EthicalAndSustainable": [
            {
                naturalLanguage: "Only invest in companies with an ESG rating of A or higher.",
                category: PrincipleCategory.ETHICAL,
                priority: PriorityLevel.ABSOLUTE,
                conditions: [{ type: "DataPoint", evaluator: "LessThan", parameters: { dataKey: "investment.esgRating", value: "A" } }],
                actions: [{ type: "Forbid", target: "Investment" }],
                tags: ["esg", "investment", "sustainability"],
                isMutable: false,
            },
            {
                naturalLanguage: "Exclude investments in fossil fuels, tobacco, and weapons manufacturing industries.",
                category: PrincipleCategory.ETHICAL,
                priority: PriorityLevel.ABSOLUTE,
                conditions: [{ type: "DataPoint", evaluator: "In", parameters: { dataKey: "investment.industry", value: ["fossil_fuels", "tobacco", "weapons"] } }],
                actions: [{ type: "Forbid", target: "Investment" }],
                tags: ["esg", "investment", "exclusion"],
                isMutable: false,
            },
            {
                naturalLanguage: "Dedicate 5% of annual investment gains to charitable donations aligned with climate action.",
                category: PrincipleCategory.FINANCIAL,
                priority: PriorityLevel.HIGH,
                conditions: [],
                actions: [{ type: "Require", target: "Donation" }],
                tags: ["charity", "climate-action"],
                isMutable: true,
            }
        ]
    };

    export function applyCharterTemplate(creator: TheCreator, templateName: keyof typeof CharterTemplates): void {
        const template = CharterTemplates[templateName];
        if (!template) {
            throw new CharterError(`Template "${templateName}" not found.`);
        }
        
        console.log(`Applying charter template: ${templateName}`);
        // For simplicity, this will overwrite the existing charter. A real app might merge them.
        const currentCharter = creator.getStructuredCharter();
        currentCharter.forEach(p => creator.removePrinciple(p.id));
        
        template.forEach(p => creator.addStructuredPrinciple(p));
    }

}
```