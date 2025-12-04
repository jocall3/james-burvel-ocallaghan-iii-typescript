// components/views/platform/FractionalReserveView.tsx
import React, { useState, useMemo, useReducer, useEffect, useCallback } from 'react';
import Card from '../../Card';

// --- Enhanced Types and Interfaces for a Real-World Application ---

/**
 * @enum ETransactionType
 * @description Defines the types of transactions that can occur within the simulation.
 */
export enum ETransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    LOAN_ISSUANCE = 'LOAN_ISSUANCE',
    LOAN_REPAYMENT = 'LOAN_REPAYMENT',
    INTEREST_ACCRUAL = 'INTEREST_ACCRUAL',
    RESERVE_TRANSFER = 'RESERVE_TRANSFER',
    CENTRAL_BANK_INJECTION = 'CENTRAL_BANK_INJECTION',
    LOAN_DEFAULT = 'LOAN_DEFAULT',
}

/**
 * @interface ITransaction
 * @description Represents a single financial transaction in the ledger.
 */
export interface ITransaction {
    id: string;
    timestamp: number;
    type: ETransactionType;
    amount: number;
    fromBankId?: string;
    toBankId?: string;
    description: string;
    relatedLoanId?: string;
    relatedDepositId?: string;
}

/**
 * @enum ELoanStatus
 * @description Represents the current status of a loan.
 */
export enum ELoanStatus {
    ACTIVE = 'ACTIVE',
    PAID_OFF = 'PAID_OFF',
    DEFAULTED = 'DEFAULTED',
}

/**
 * @interface ILoan
 * @description Represents a loan issued by a bank.
 */
export interface ILoan {
    id: string;
    bankId: string;
    principal: number;
    interestRate: number;
    interestAccrued: number;
    totalOwed: number;
    status: ELoanStatus;
    issueDate: number;
    termMonths: number;
}

/**
 * @interface IDeposit
 * @description Represents a customer deposit at a bank.
 */
export interface IDeposit {
    id: string;
    bankId: string;
    amount: number;
    depositorId: string;
    depositDate: number;
}

/**
 * @interface IBank
 * @description Represents a single bank within the simulated financial system.
 */
export interface IBank {
    id: string;
    name: string;
    reserves: number; // Cash on hand
    deposits: IDeposit[];
    loans: ILoan[];
    capital: number; // Bank's own equity
}

/**
 * @interface IEconomicIndicators
 * @description Key macroeconomic indicators for the simulation.
 */
export interface IEconomicIndicators {
    moneySupplyM1: number;
    totalCredit: number;
    inflationRate: number; // Annualized
    gdpGrowth: number; // Annualized
    defaultRate: number; // Percentage of loans defaulting
    velocityOfMoney: number;
}

/**

 * @interface ISimulationParameters
 * @description Configurable parameters for the financial simulation.
 */
export interface ISimulationParameters {
    reserveRatio: number;
    centralBankInterestRate: number; // aka discount rate
    loanInterestRate: number;
    simulationSpeed: number; // in ms per tick
    loanDefaultProbability: number;
    economicGrowthFactor: number;
    inflationFactor: number;
}

/**
 * @interface ISimulationState
 * @description The complete state of the financial simulation.
 */
export interface ISimulationState {
    isRunning: boolean;
    tick: number;
    banks: IBank[];
    transactions: ITransaction[];
    parameters: ISimulationParameters;
    indicators: IEconomicIndicators;
    log: string[];
}

// --- Action Types for State Management ---
export type SimulationAction =
    | { type: 'TOGGLE_SIMULATION' }
    | { type: 'RESET_SIMULATION' }
    | { type: 'SIMULATION_TICK' }
    | { type: 'ADD_BANK'; payload: { name: string } }
    | { type: 'ADD_INITIAL_DEPOSIT'; payload: { bankId: string; amount: number } }
    | { type: 'UPDATE_PARAMETER'; payload: { key: keyof ISimulationParameters; value: number } }
    | { type: 'APPLY_STRESS_TEST'; payload: IStressTestScenario };

// --- Utility Functions ---

/**
 * @function generateId
 * @description Generates a simple unique identifier.
 * @returns {string} A unique ID string.
 */
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

/**
 * @function createNewBank
 * @description Factory function to create a new bank object.
 * @param {string} name - The name of the new bank.
 * @returns {IBank} A new bank object.
 */
export const createNewBank = (name: string): IBank => ({
    id: generateId(),
    name,
    reserves: 0,
    deposits: [],
    loans: [],
    capital: 10000, // Initial seed capital
});

const initialParameters: ISimulationParameters = {
    reserveRatio: 0.10,
    centralBankInterestRate: 0.05,
    loanInterestRate: 0.29,
    simulationSpeed: 2000,
    loanDefaultProbability: 0.02,
    economicGrowthFactor: 0.001,
    inflationFactor: 0.0005,
};

const calculateInitialIndicators = (banks: IBank[]): IEconomicIndicators => {
    const totalDeposits = banks.reduce((sum, bank) => sum + bank.deposits.reduce((dSum, d) => dSum + d.amount, 0), 0);
    const totalReserves = banks.reduce((sum, bank) => sum + bank.reserves, 0);
    const totalCredit = banks.reduce((sum, bank) => sum + bank.loans.reduce((lSum, l) => lSum + l.principal, 0), 0);

    return {
        moneySupplyM1: totalReserves + totalDeposits,
        totalCredit: totalCredit,
        inflationRate: 0.0,
        gdpGrowth: 0.0,
        defaultRate: 0.0,
        velocityOfMoney: 1.0,
    };
};


export const initialSimulationState: ISimulationState = {
    isRunning: false,
    tick: 0,
    banks: [
        createNewBank('Demo Bank Alpha'),
        createNewBank('Quantum Credit Union'),
        createNewBank('Nexus Financial'),
    ],
    transactions: [],
    parameters: initialParameters,
    indicators: calculateInitialIndicators([
        createNewBank('Demo Bank Alpha'),
        createNewBank('Quantum Credit Union'),
        createNewBank('Nexus Financial'),
    ]),
    log: ['Simulation initialized.'],
};


// --- The Core Simulation Reducer ---

/**
 * @function simulationReducer
 * @description Manages the state transitions of the financial simulation.
 * @param {ISimulationState} state - The current state.
 * @param {SimulationAction} action - The action to perform.
 * @returns {ISimulationState} The new state.
 */
export const simulationReducer = (state: ISimulationState, action: SimulationAction): ISimulationState => {
    switch (action.type) {
        case 'TOGGLE_SIMULATION':
            return {
                ...state,
                isRunning: !state.isRunning,
                log: [...state.log, `Simulation ${!state.isRunning ? 'started' : 'paused'}.`],
            };
        case 'RESET_SIMULATION':
            const newBanks = [
                createNewBank('Demo Bank Alpha'),
                createNewBank('Quantum Credit Union'),
                createNewBank('Nexus Financial'),
            ];
            return {
                ...initialSimulationState,
                banks: newBanks,
                indicators: calculateInitialIndicators(newBanks),
                log: ['Simulation reset to initial state.'],
            };
        case 'UPDATE_PARAMETER':
            return {
                ...state,
                parameters: {
                    ...state.parameters,
                    [action.payload.key]: action.payload.value,
                },
                 log: [...state.log, `Parameter '${action.payload.key}' updated to ${action.payload.value}.`],
            };
        case 'ADD_INITIAL_DEPOSIT': {
            const {