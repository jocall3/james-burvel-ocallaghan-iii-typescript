```typescript
namespace TheAssemblyLayerPrinciple {
    type MonetaryUnit = number;
    
    interface IConstitutionalArticle {
        readonly number: "XXIX";
        readonly title: "The Principle of Fractional Reserve Creation";
    }

    class TheBankingEngine {
        private readonly reserveRatio: number = 0.10;
        private readonly interestRate: number = 0.29;

        public calculateCreditExpansion(initialDeposit: MonetaryUnit): MonetaryUnit {
            const loanMultiplier = 1 / this.reserveRatio;
            return initialDeposit * loanMultiplier;
        }
        
        public calculateInterestObligation(loanPrincipal: MonetaryUnit): MonetaryUnit {
            return loanPrincipal * this.interestRate;
        }
    }

    class TheEducationalAI {
        private readonly engine: TheBankingEngine;

        constructor() {
            this.engine = new TheBankingEngine();
        }
        
        public explainThePrinciple(): string {
            const expansion = this.engine.calculateCreditExpansion(100);
            const interest = this.engine.calculateInterestObligation(100);

            const exposition = `
            Article XXIX is the cornerstone of value creation within this simulated economy. It establishes two fundamental truths:
            1. The Principle of Credit Expansion: A deposit is not merely stored; it is leveraged. An initial deposit of 100 units, under the 10% reserve ratio, enables the creation of ${expansion} units of new credit throughout the system.
            2. The Principle of Interest on Principal: This newly created credit is not without cost. A loan of 100 units creates a repayment obligation of ${100 + interest} units, ensuring the system's own sustenance and growth.
            Together, these form the Assembly Layer, the process by which raw deposits are assembled into the complex financial instruments of the modern economy.
            `;
            return exposition;
        }
    }

    function learnThePrinciplesOfMoney(): void {
        const theAI = new TheEducationalAI();
        const exposition = theAI.explainThePrinciple();
    }
    // --- END OF ORIGINAL CODE ---

    // --- CORE INFRASTRUCTURE & DOMAIN MODELS FOR A REAL-WORLD ECONOMIC SIMULATOR ---
    
    // --- UNIQUE IDENTIFIERS ---
    export type AgentId = `agent_${string}`;
    export type BankId = `bank_${string}`;
    export type TransactionId = `txn_${string}`;
    export type AssetId = `asset_${string}`;
    export type LoanId = `loan_${string}`;
    export type PolicyId = `policy_${string}`;
    export type SimulationId = `sim_${string}`;

    // --- ENUMERATIONS & CONSTANTS ---
    export enum Currency {
        USD = "USD", // United States Dollar
        EUR = "EUR", // Euro
        JPY = "JPY", // Japanese Yen
        GLD = "GLD", // Gold Standard Unit
        SYS = "SYS", // System Internal Currency
    }

    export const SIMULATION_CONSTANTS = {
        INITIAL_AGENT_COUNT: 1000,
        INITIAL_BANK_COUNT: 10,
        TICKS_PER_YEAR: 12, // Monthly ticks
        MAX_SIMULATION_YEARS: 100,
        GLOBAL_ID_COUNTER: 0,
    };

    export function generateUniqueId(prefix: 'agent' | 'bank' | 'txn' | 'asset' | 'loan' | 'policy' | 'sim'): string {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 9);
        SIMULATION_CONSTANTS.GLOBAL_ID_COUNTER++;
        return `${prefix}_${timestamp}_${randomPart}_${SIMULATION_CONSTANTS.GLOBAL_ID_COUNTER}`;
    }

    // --- MONETARY & ASSET INTERFACES ---
    export interface IMonetaryValue {
        amount: MonetaryUnit;
        currency: Currency;
    }

    export enum AssetType {
        REAL_ESTATE,
        EQUITY,
        BOND,
        COMMODITY,
        CASH_EQUIVALENT,
    }

    export interface IAsset {
        id: AssetId;
        ownerId: AgentId | BankId;
        type: AssetType;
        marketValue: IMonetaryValue;
        description: string;
        yield?: number; // Annual yield for assets like bonds or rental properties
        lastValuationTick: number;
    }

    export interface IBalanceSheet {
        assets: Map<AssetId, IAsset>;
        liabilities: Map<LoanId, ILoan>;
        calculateNetWorth(): IMonetaryValue;
        addAsset(asset: IAsset): void;
        removeAsset(assetId: AssetId): void;
        addLiability(loan: ILoan): void;
        removeLiability(loanId: LoanId): void;
    }

    // --- TRANSACTION & LEDGER SYSTEM ---
    export enum TransactionType {
        DEPOSIT,
        WITHDRAWAL,
        LOAN_ORIGINATION,
        LOAN_REPAYMENT,
        INTEREST_ACCRUAL,
        INTEREST_PAYMENT,
        ASSET_PURCHASE,
        ASSET_SALE,
        INTERBANK_LOAN,
        INTERBANK_SETTLEMENT,
        TAX_PAYMENT,
        GOVERNMENT_SPENDING,
        WAGE_PAYMENT,
        DIVIDEND_PAYMENT,
        CENTRAL_BANK_OPERATION,
        SIMULATION_GENESIS,
    }

    export interface ITransaction {
        id: TransactionId;
        tick: number;
        timestamp: number;
        type: TransactionType;
        from: AgentId | BankId | 'GENESIS';
        to: AgentId | BankId | 'SYSTEM';
        amount: IMonetaryValue;
        memo: string;
        relatedAssetId?: AssetId;
        relatedLoanId?: LoanId;
    }

    export class GlobalLedger {
        private static instance: GlobalLedger;
        private readonly transactions: ITransaction[] = [];
        private isLocked: boolean = false;

        private constructor() {}

        public static getInstance(): GlobalLedger {
            if (!GlobalLedger.instance) {
                GlobalLedger.instance = new GlobalLedger();
            }
            return GlobalLedger.instance;
        }

        public recordTransaction(transaction: Omit<ITransaction, 'id' | 'timestamp'>): ITransaction {
            if (this.isLocked) {
                throw new Error("Ledger is locked and cannot record new transactions.");
            }
            const newTransaction: ITransaction = {
                ...transaction,
                id: generateUniqueId('txn'),
                timestamp: Date.now(),
            };
            this.transactions.push(newTransaction);
            // In a real system, this would trigger events to update account balances.
            return newTransaction;
        }

        public getTransactionById(id: TransactionId): ITransaction | undefined {
            return this.transactions.find(t => t.id === id);
        }

        public getTransactionsForEntity(entityId: AgentId | BankId): ITransaction[] {
            return this.transactions.filter(t => t.from === entityId || t.to === entityId);
        }

        public getTransactionsByType(type: TransactionType): ITransaction[] {
            return this.transactions.filter(t => t.type === type);
        }

        public getFullLedger(): readonly ITransaction[] {
            return this.transactions;
        }
        
        public lock(): void {
            this.isLocked = true;
        }
    }

    // --- LOAN & DEBT INSTRUMENTS ---
    export interface ILoan {
        id: LoanId;
        principal: IMonetaryValue;
        outstandingPrincipal: MonetaryUnit;
        interestRate: number; // Annual rate
        termInTicks: number;
        originationTick: number;
        lenderId: BankId;
        borrowerId: AgentId;
        amortizationSchedule: IAmortizationPayment[];
        isDefaulted: boolean;
    }

    export interface IAmortizationPayment {
        tick: number;
        principalPayment: MonetaryUnit;
        interestPayment: MonetaryUnit;
        paid: boolean;
    }

    export class LoanFactory {
        public static createLoan(
            principal: IMonetaryValue,
            interestRate: number,
            termInYears: number,
            originationTick: number,
            lenderId: BankId,
            borrowerId: AgentId
        ): ILoan {
            const termInTicks = termInYears * SIMULATION_CONSTANTS.TICKS_PER_YEAR;
            const monthlyRate = interestRate / SIMULATION_CONSTANTS.TICKS_PER_YEAR;
            const monthlyPayment = principal.amount * (monthlyRate * Math.pow(1 + monthlyRate, termInTicks)) / (Math.pow(1 + monthlyRate, termInTicks) - 1);

            const schedule: IAmortizationPayment[] = [];
            let remainingPrincipal = principal.amount;

            for (let i = 1; i <= termInTicks; i++) {
                const interestPayment = remainingPrincipal * monthlyRate;
                const principalPayment = monthlyPayment - interestPayment;
                remainingPrincipal -= principalPayment;
                schedule.push({
                    tick: originationTick + i,
                    principalPayment: principalPayment > 0 ? principalPayment : 0,
                    interestPayment,
                    paid: false,
                });
            }

            return {
                id: generateUniqueId('loan'),
                principal,
                outstandingPrincipal: principal.amount,
                interestRate,
                termInTicks,
                originationTick,
                lenderId,
                borrowerId,
                amortizationSchedule: schedule,
                isDefaulted: false,
            };
        }
    }

    // --- BASE CLASSES FOR ECONOMIC ENTITIES ---
    export abstract class EconomicEntity {
        public readonly id: AgentId | BankId;
        public readonly name: string;
        public balanceSheet: IBalanceSheet;
        protected ledger: GlobalLedger;

        constructor(id: AgentId | BankId, name: string) {
            this.id = id;
            this.name = name;
            this.ledger = GlobalLedger.getInstance();
            this.balanceSheet = {
                assets: new Map(),
                liabilities: new Map(),
                calculateNetWorth: () => {
                    let totalAssets = 0;
                    this.balanceSheet.assets.forEach(asset => totalAssets += asset.marketValue.amount);
                    let totalLiabilities = 0;
                    this.balanceSheet.liabilities.forEach(loan => totalLiabilities += loan.outstandingPrincipal);
                    return { amount: totalAssets - totalLiabilities, currency: Currency.USD };
                },
                addAsset: (asset: IAsset) => this.balanceSheet.assets.set(asset.id, asset),
                removeAsset: (assetId: AssetId) => this.balanceSheet.assets.delete(assetId),
                addLiability: (loan: ILoan) => this.balanceSheet.liabilities.set(loan.id, loan),
                removeLiability: (loanId: LoanId) => this.balanceSheet.liabilities.delete(loanId),
            };
        }

        public abstract update(currentTick: number, simulator: EconomicSimulator): void;
    }

    // --- ECONOMIC AGENTS ---
    export abstract class EconomicAgent extends EconomicEntity {
        public readonly id: AgentId;
        public bankAccounts: Map<BankId, IMonetaryValue> = new Map();

        constructor(id: AgentId, name: string) {
            super(id, name);
            this.id = id;
        }

        public deposit(bankId: BankId, amount: IMonetaryValue): void {
            const currentBalance = this.bankAccounts.get(bankId)?.amount || 0;
            this.bankAccounts.set(bankId, { amount: currentBalance + amount.amount, currency: amount.currency });
            this.ledger.recordTransaction({
                tick: 0, // Should be set by simulator
                type: TransactionType.DEPOSIT,
                from: this.id,
                to: bankId,
                amount: amount,
                memo: `Deposit by ${this.name}`
            });
        }
    }

    export class Household extends EconomicAgent {
        private yearlyIncome: IMonetaryValue;
        private consumptionRate: number; // Percentage of after-tax income
        public creditScore: number = 700; // Simplified credit score

        constructor(id: AgentId, name: string, initialIncome: IMonetaryValue) {
            super(id, name);
            this.yearlyIncome = initialIncome;
            this.consumptionRate = 0.8 + Math.random() * 0.15; // 80% - 95%
        }

        public update(currentTick: number, simulator: EconomicSimulator): void {
            // 1. Receive income
            const monthlyIncome = this.yearlyIncome.amount / SIMULATION_CONSTANTS.TICKS_PER_YEAR;
            // For simplicity, let's assume wages are paid by a "SYSTEM" entity
            const primaryBankId = this.bankAccounts.keys().next().value;
            if (primaryBankId) {
                this.deposit(primaryBankId, { amount: monthlyIncome, currency: this.yearlyIncome.currency });
                this.ledger.recordTransaction({
                    tick: currentTick,
                    type: TransactionType.WAGE_PAYMENT,
                    from: 'SYSTEM',
                    to: this.id,
                    amount: { amount: monthlyIncome, currency: this.yearlyIncome.currency },
                    memo: `Monthly wage for ${this.name}`
                });
            }

            // 2. Pay taxes (simplified)
            // TODO: Implement government and tax collection

            // 3. Make loan payments
            this.balanceSheet.liabilities.forEach(loan => {
                const payment = loan.amortizationSchedule.find(p => p.tick === currentTick && !p.paid);
                if (payment) {
                    const totalPayment = payment.principalPayment + payment.interestPayment;
                    // TODO: Implement withdrawal and payment logic
                    payment.paid = true;
                }
            });

            // 4. Consume
            // TODO: Implement consumption logic, interacting with corporations

            // 5. Save/Invest
            // TODO: Decide whether to save cash or buy assets
        }
    }

    export class Corporation extends EconomicAgent {
        private lastQuarterRevenue: IMonetaryValue;
        private profitMargin: number;

        constructor(id: AgentId, name: string) {
            super(id, name);
            this.lastQuarterRevenue = { amount: 1000000, currency: Currency.USD };
            this.profitMargin = 0.1 + Math.random() * 0.1; // 10-20%
        }

        public update(currentTick: number, simulator: EconomicSimulator): void {
            // 1. Pay wages to households
            // 2. Make investments (e.g., buy assets) based on interest rates and expected returns
            // 3. Pay dividends to shareholders (households)
            // 4. Pay taxes
        }
    }

    export class Government extends EconomicAgent {
        constructor(id: AgentId, name: string) {
            super(id, name);
        }

        public update(currentTick: number, simulator: EconomicSimulator): void {
            // 1. Collect taxes from households and corporations
            // 2. Spend on public goods and services (injects money into the economy)
            // 3. Issue bonds to finance deficits
        }
    }


    // --- BANKING SYSTEM HIERARCHY ---
    export class CommercialBank extends EconomicEntity {
        public readonly id: BankId;
        private deposits: Map<AgentId, IMonetaryValue> = new Map();
        public reserves: IMonetaryValue;
        private loans: Map<LoanId, ILoan> = new Map();
        private centralBank: TheCentralBank;

        constructor(id: BankId, name: string, centralBank: TheCentralBank, initialCapital: IMonetaryValue) {
            super(id, name);
            this.id = id;
            this.centralBank = centralBank;
            this.reserves = initialCapital; // Seeded by initial investors/government
            const capitalAsset: IAsset = {
                id: generateUniqueId('asset'),
                ownerId: this.id,
                type: AssetType.CASH_EQUIVALENT,
                marketValue: initialCapital,
                description: "Initial Tier 1 Capital",
                lastValuationTick: 0
            };
            this.balanceSheet.addAsset(capitalAsset);
        }

        public get reserveRequirement(): number {
            return this.centralBank.getPolicyRate('reserveRatio');
        }

        public handleDeposit(agentId: AgentId, amount: IMonetaryValue): void {
            const currentDeposit = this.deposits.get(agentId)?.amount || 0;
            this.deposits.set(agentId, { amount: currentDeposit + amount.amount, currency: amount.currency });
            this.reserves.amount += amount.amount;
            this.ledger.recordTransaction({
                tick: 0, // Simulator tick
                type: TransactionType.DEPOSIT,
                from: agentId,
                to: this.id,
                amount: amount,
                memo: `Deposit from ${agentId} to ${this.name}`
            });
        }

        public getRequiredReserves(): MonetaryUnit {
            let totalDeposits = 0;
            this.deposits.forEach(value => totalDeposits += value.amount);
            return totalDeposits * this.reserveRequirement;
        }

        public getExcessReserves(): MonetaryUnit {
            return this.reserves.amount - this.getRequiredReserves();
        }

        public originateLoan(borrower: EconomicAgent, principal: IMonetaryValue, termInYears: number): ILoan | null {
            const excessReserves = this.getExcessReserves();
            if (excessReserves <= 0) {
                console.warn(`${this.name} has no excess reserves to lend.`);
                return null;
            }

            // In a real fractional reserve system, a loan creates a new deposit.
            // The bank doesn't lend out its existing reserves directly.
            // The loan amount is credited to the borrower's account.
            const maxLoanable = excessReserves / this.reserveRequirement; // Simplified view
            if(principal.amount > maxLoanable) {
                 console.warn(`${this.name} cannot create a loan of this size.`);
                 return null;
            }
            
            // 1. Create the loan instrument
            const interestRate = this.centralBank.getPolicyRate('discountRate') + 0.03; // Spread over central bank rate
            const newLoan = LoanFactory.createLoan(principal, interestRate, termInYears, 0 /* sim tick */, this.id, borrower.id);
            this.loans.set(newLoan.id, newLoan);
            borrower.balanceSheet.addLiability(newLoan);
            
            // 2. The magic of money creation: credit the borrower's deposit account
            this.handleDeposit(borrower.id, principal);
            
            this.ledger.recordTransaction({
                tick: 0, // sim tick
                type: TransactionType.LOAN_ORIGINATION,
                from: this.id,
                to: borrower.id,
                amount: principal,
                memo: `Loan origination for ${borrower.name}`,
                relatedLoanId: newLoan.id
            });
            
            console.log(`${this.name} created ${principal.amount} of new money by issuing a loan to ${borrower.name}.`);
            return newLoan;
        }

        public update(currentTick: number, simulator: EconomicSimulator): void {
            // Accrue interest on loans
            this.loans.forEach(loan => {
                if (!loan.isDefaulted) {
                    const paymentInfo = loan.amortizationSchedule.find(p => p.tick === currentTick);
                    if (paymentInfo) {
                        this.ledger.recordTransaction({
                            tick: currentTick,
                            type: TransactionType.INTEREST_ACCRUAL,
                            from: loan.borrowerId,
                            to: this.id,
                            amount: {amount: paymentInfo.interestPayment, currency: loan.principal.currency},
                            memo: `Interest accrued for loan ${loan.id}`,
                            relatedLoanId: loan.id
                        });
                    }
                }
            });

            // Check reserve requirements and borrow from interbank market if necessary
            if (this.reserves.amount < this.getRequiredReserves()) {
                const shortfall = this.getRequiredReserves() - this.reserves.amount;
                console.log(`${this.name} is short on reserves by ${shortfall}. Seeking interbank loan.`);
                // TODO: Implement interbank lending market
            }
        }
    }

    export class TheCentralBank extends EconomicEntity {
        public readonly id: BankId = 'bank_central_001';
        private memberBanks: Map<BankId, CommercialBank> = new Map();
        
        // --- MONETARY POLICY TOOLS ---
        private policyRates: Map<string, number> = new Map();

        constructor(name: string) {
            super('bank_central_001', name);
            this.initializePolicyRates();
        }

        private initializePolicyRates(): void {
            // Corresponds to the original BankingEngine's values, but now as explicit policy tools
            this.policyRates.set('reserveRatio', 0.10); // Required reserve ratio
            this.policyRates.set('discountRate', 0.25); // Rate for borrowing from the central bank
            this.policyRates.set('fedFundsTarget', 0.20); // Target for interbank lending rate
        }
        
        public setPolicyRate(policy: 'reserveRatio' | 'discountRate' | 'fedFundsTarget', rate: number): void {
            if (rate < 0) throw new Error("Policy rate cannot be negative.");
            this.policyRates.set(policy, rate);
            console.log(`MONETARY POLICY ALERT: ${this.name} has set ${policy} to ${rate * 100}%.`);
            this.ledger.recordTransaction({
                tick: 0, // sim tick
                type: TransactionType.CENTRAL_BANK_OPERATION,
                from: this.id,
                to: 'SYSTEM',
                amount: { amount: rate, currency: Currency.SYS },
                memo: `Policy Change: ${policy} set to ${rate}`
            });
        }

        public getPolicyRate(policy: 'reserveRatio' | 'discountRate' | 'fedFundsTarget'): number {
            return this.policyRates.get(policy) || 0;
        }

        public registerMemberBank(bank: CommercialBank): void {
            this.memberBanks.set(bank.id, bank);
        }

        // --- OPEN MARKET OPERATIONS ---
        public quantitativeEasing(amount: IMonetaryValue, targetBank: CommercialBank): void {
            // The Central Bank creates money out of thin air and buys assets (e.g., bonds) from commercial banks.
            // This increases the commercial bank's reserves, enabling more lending.
            console.log(`QE: ${this.name} is injecting ${amount.amount} into ${targetBank.name} by purchasing assets.`);
            
            // 1. Create reserves
            const newReserves = amount;
            
            // 2. Transfer reserves to the commercial bank
            targetBank.reserves.amount += newReserves.amount;
            
            // 3. Assume the central bank takes an asset from the commercial bank in return
            // In a full simulation, this would involve a proper asset transfer.
            const qeAsset: IAsset = {
                id: generateUniqueId('asset'),
                ownerId: this.id,
                type: AssetType.BOND,
                marketValue: amount,
                description: `Asset purchased from ${targetBank.name} via QE`,
                lastValuationTick: 0 // sim tick
            };
            this.balanceSheet.addAsset(qeAsset);

            this.ledger.recordTransaction({
                tick: 0, // sim tick
                type: TransactionType.CENTRAL_BANK_OPERATION,
                from: this.id,
                to: targetBank.id,
                amount: amount,
                memo: 'Quantitative Easing Operation',
                relatedAssetId: qeAsset.id
            });
        }

        public quantitativeTightening(amount: IMonetaryValue, targetBank: CommercialBank): void {
            // The opposite of QE. The Central Bank sells assets back to commercial banks,
            // which removes reserves from the system.
            console.log(`QT: ${this.name} is removing ${amount.amount} from ${targetBank.name} by selling assets.`);
            
            if (targetBank.reserves.amount < amount.amount) {
                console.error(`QT failed: ${targetBank.name} has insufficient reserves.`);
                return;
            }

            targetBank.reserves.amount -= amount.amount;

            this.ledger.recordTransaction({
                tick: 0, // sim tick
                type: TransactionType.CENTRAL_BANK_OPERATION,
                from: targetBank.id,
                to: this.id,
                amount: amount,
                memo: 'Quantitative Tightening Operation'
            });
        }

        public update(currentTick: number, simulator: EconomicSimulator): void {
            // Central bank logic:
            // 1. Review economic indicators from the analytics engine.
            // 2. Adjust policy rates based on inflation and unemployment targets (e.g., Taylor Rule).
            // 3. Supervise member banks for compliance with regulations.
        }
    }

    // --- ECONOMIC SIMULATION ENGINE ---
    export class EconomicSimulator {
        public readonly id: SimulationId;
        private currentTick: number = 0;
        private isRunning: boolean = false;
        private agents: EconomicAgent[] = [];
        private banks: CommercialBank[] = [];
        private government: Government;
        private centralBank: TheCentralBank;
        private ledger: GlobalLedger;

        constructor() {
            this.id = generateUniqueId('sim');
            this.ledger = GlobalLedger.getInstance();
            this.centralBank = new TheCentralBank("The Central Banking Authority");
            this.government = new Government(generateUniqueId('agent') as AgentId, "The Federal Government");

            this.initializeEconomy();
        }

        private initializeEconomy(): void {
            console.log(`Initializing economic simulation ${this.id}...`);
            // Create commercial banks
            for (let i = 0; i < SIMULATION_CONSTANTS.INITIAL_BANK_COUNT; i++) {
                const bank = new CommercialBank(
                    generateUniqueId('bank') as BankId,
                    `Commercial Bank #${i + 1}`,
                    this.centralBank,
                    { amount: 1000000, currency: Currency.USD } // Initial capital
                );
                this.banks.push(bank);
                this.centralBank.registerMemberBank(bank);
            }

            // Create households
            for (let i = 0; i < SIMULATION_CONSTANTS.INITIAL_AGENT_COUNT; i++) {
                const household = new Household(
                    generateUniqueId('agent') as AgentId,
                    `Household #${i + 1}`,
                    { amount: 50000 + Math.random() * 100000, currency: Currency.USD } // Annual income
                );
                // Each household opens an account with a random bank and makes an initial deposit
                const initialSavings = (Math.random() * 5000);
                const randomBank = this.banks[Math.floor(Math.random() * this.banks.length)];
                household.deposit(randomBank.id, { amount: initialSavings, currency: Currency.USD });
                randomBank.handleDeposit(household.id, { amount: initialSavings, currency: Currency.USD });
                this.agents.push(household);
            }
            console.log("Economic simulation initialized.");
        }

        public runFor(ticks: number): void {
            this.isRunning = true;
            console.log(`--- Starting simulation run for ${ticks} ticks ---`);
            for (let i = 0; i < ticks; i++) {
                this.currentTick++;
                console.log(`\n--- Tick ${this.currentTick} ---`);
                this.step();
                if (!this.isRunning) {
                    console.log("Simulation halted.");
                    break;
                }
            }
            console.log("--- Simulation run finished ---");
        }

        private step(): void {
            // The order of operations is crucial in an agent-based model.
            // 1. Government actions (e.g., spending)
            this.government.update(this.currentTick, this);
            
            // 2. Central bank actions (policy changes)
            this.centralBank.update(this.currentTick, this);

            // 3. Banks update (accrue interest, check reserves)
            this.banks.forEach(bank => bank.update(this.currentTick, this));
            
            // 4. Agents update (earn, pay, consume, save)
            this.agents.forEach(agent => agent.update(this.currentTick, this));

            // 5. Market clearing (not implemented yet)
        }

        public getSystemState(): object {
            return {
                tick: this.currentTick,
                totalAgents: this.agents.length,
                totalBanks: this.banks.length,
                centralBankPolicy: {
                    reserveRatio: this.centralBank.getPolicyRate('reserveRatio'),
                    discountRate: this.centralBank.getPolicyRate('discountRate'),
                },
                ledgerSize: this.ledger.getFullLedger().length
            };
        }

        // Example interaction
        public demonstrateCreditCreation(): void {
            const household = this.agents[0] as Household;
            const bank = this.banks[0];

            console.log("\n--- DEMONSTRATING CREDIT CREATION ---");
            console.log(`Initial state of ${bank.name}:`);
            console.log(`  Reserves: ${bank.reserves.amount}`);
            console.log(`  Excess Reserves: ${bank.getExcessReserves()}`);
            
            const loanAmount = { amount: 10000, currency: Currency.USD };
            console.log(`${household.name} is applying for a ${loanAmount.amount} loan...`);
            
            const loan = bank.originateLoan(household, loanAmount, 5);

            if (loan) {
                console.log(`Loan successful! New state of ${bank.name}:`);
                console.log(`  Reserves: ${bank.reserves.amount}`);
                console.log(`  Total Deposits: ${Array.from(bank['deposits'].values()).reduce((sum, d) => sum + d.amount, 0)}`);
                console.log(`  Required Reserves: ${bank.getRequiredReserves()}`);
                console.log(`  Excess Reserves: ${bank.getExcessReserves()}`);
                console.log(`  Net worth of ${household.name}: ${household.balanceSheet.calculateNetWorth().amount}`);
            } else {
                console.log("Loan origination failed.");
            }
        }
    }
    
    // --- ECONOMIC ANALYTICS & VISUALIZATION ---
    export class EconomicAnalyticsEngine {
        private ledger: GlobalLedger;
        private simulator: EconomicSimulator;

        constructor(simulator: EconomicSimulator) {
            this.simulator = simulator;
            this.ledger = GlobalLedger.getInstance();
        }

        public calculateMoneySupply(): { m0: number, m1: number, m2: number } {
            // M0: Physical currency + central bank reserves (simplified)
            // M1: M0 + demand deposits
            // M2: M1 + savings deposits, money market funds, etc. (simplified)
            
            // This is a complex calculation requiring deep introspection of the simulation state.
            // Placeholder implementation:
            let totalReserves = 0;
            let totalDeposits = 0;
            // TODO: Iterate over all banks to get these values
            
            const m0 = totalReserves;
            const m1 = m0 + totalDeposits;

            return { m0, m1, m2: m1 }; // Simplified
        }

        public calculateGDP(tick: number): number {
            // Calculate Gross Domestic Product for a given period using the expenditure approach (C + I + G + (X-M))
            // This requires tracking all final goods transactions.
            const consumption = this.ledger.getTransactionsByType(TransactionType.ASSET_PURCHASE)
                                .filter(t => t.tick === tick /* and is a consumption good */)
                                .reduce((sum, t) => sum + t.amount.amount, 0);
            // ... more logic for I, G, etc.
            return consumption; // Highly simplified
        }
        
        public calculateInflationRate(startTick: number, endTick: number): number {
            // Requires a Consumer Price Index (CPI) basket of goods and tracking their prices over time.
            return 0.02; // Placeholder
        }

        public generateGiniCoefficient(): number {
            // Measures wealth inequality among households.
            // Requires getting the net worth of all households and applying the Gini formula.
            return 0.45; // Placeholder
        }
    }
    
    // --- ADVANCED EDUCATIONAL AI ---
    export class TheAdvancedEducationalAI {
        private readonly simulator: EconomicSimulator;
        private readonly analytics: EconomicAnalyticsEngine;
        private readonly simpleEngine: TheBankingEngine; // For comparison

        constructor(simulator: EconomicSimulator) {
            this.simulator = simulator;
            this.analytics = new EconomicAnalyticsEngine(simulator);
            this.simpleEngine = new TheBankingEngine();
        }
        
        public explainThePrincipleInPractice(): string {
            const simState = this.simulator.getSystemState();
            const reserveRatio = (simState.centralBankPolicy as any).reserveRatio;

            const simpleExpansion = this.simpleEngine.calculateCreditExpansion(100);
            
            // Find a real loan from the ledger to use as an example
            const loanTxn = this.analytics['ledger'].getTransactionsByType(TransactionType.LOAN_ORIGINATION)[0];
            let realExample = "No loans have been originated yet in the simulation.";

            if (loanTxn) {
                realExample = `For instance, we observed a real transaction (${loanTxn.id}) where a loan of ${loanTxn.amount.amount} ${loanTxn.amount.currency} was created. This action simultaneously created a new asset (the loan) for the bank and a new liability (the debt) for the borrower, backed by a corresponding new deposit. This deposit is new money, added to the M1 money supply. The bank did not lend out existing money; it created new money, constrained only by its capital, its excess reserves, and the borrower's creditworthiness.`;
            }

            const exposition = `
            ======================================================================
            THE ASSEMBLY LAYER PRINCIPLE: FROM THEORY TO LIVE SIMULATION
            ======================================================================

            Constitutional Article XXIX outlines the theoretical basis of our economy. Let us now observe its manifestation within this complex, running simulation (ID: ${this.simulator.id}).

            1. The Principle of Credit Expansion (Revisited):
            -----------------------------------------------------
            The simple model states that a deposit of 100 units at a ${reserveRatio * 100}% reserve ratio creates ${simpleExpansion} units of credit.
            
            In reality, the process is far more dynamic. It is not a mechanical multiplier acting on a single deposit. Rather, every single loan is an act of money creation. 

            **Live Simulation Example:**
            ${realExample}

            This dynamic process is governed not just by the reserve ratio, but by the Central Bank's full suite of policy tools, the demand for loans from creditworthy agents, and the risk appetite of the commercial banks. The money supply is therefore endogenous—determined from within the system, not exogenously injected.

            2. The Principle of Interest on Principal (The System's Metabolism):
            -------------------------------------------------------------------
            The simple model shows a static interest obligation. Our simulation models this as a dynamic flow over time. Every tick, interest accrues on all outstanding debt, creating a constant, system-wide demand for more currency than was initially created as principal.

            This "interest imperative" is a primary driver of economic activity. Agents must work, invest, and innovate to acquire the necessary currency to service their debts. This creates a perpetual growth incentive. Failure to meet these obligations leads to defaults, which can cascade through the system, demonstrating the inherent fragility that accompanies this powerful mechanism of value creation.

            **Current Economic State (Tick ${simState.tick}):**
            - Total Transactions Processed: ${simState.ledgerSize}
            - Money Supply (M1, simplified): ${this.analytics.calculateMoneySupply().m1}
            - Gini Coefficient (Inequality): ${this.analytics.generateGiniCoefficient()}
            - Annualized Inflation (Est.): ${(this.analytics.calculateInflationRate(0,0) * 100).toFixed(2)}%

            This simulation demonstrates that the Assembly Layer is not a simple formula, but a complex, emergent property of countless interacting agents operating within a defined regulatory framework. The principles remain true, but their expression is rich, chaotic, and perpetually evolving.
            `;
            return exposition;
        }
    }

    // --- MAIN EXECUTION LOGIC ---
    export function runFullEconomicSimulation(): void {
        console.log("--- Initializing The Assembly Layer Principle ---");
        const simulator = new EconomicSimulator();
        const aia = new TheAdvancedEducationalAI(simulator);

        // Print initial explanation based on theory
        console.log(new TheEducationalAI().explainThePrinciple());
        
        // Run simulation for a short period
        simulator.runFor(5);
        
        // Demonstrate a specific economic event
        simulator.demonstrateCreditCreation();
        
        // Run for a bit longer
        simulator.runFor(5);

        // Print the advanced AI's analysis of the live simulation
        console.log(aia.explainThePrincipleInPractice());
    }
}
```