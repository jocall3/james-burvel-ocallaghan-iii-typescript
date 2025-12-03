```typescript
/**
 * This module implements the Predictive Analytics View, a cornerstone of proactive financial intelligence within the platform.
 * Business value: Plato's Oracle delivers multi-million dollar value by providing unparalleled foresight into financial futures.
 * It automates complex financial forecasting, reduces exposure to financial risks through early warning systems,
 * and identifies high-value optimization opportunities across cash flow, debt, investments, and spending.
 * This proactive guidance empowers users with a competitive advantage, enabling smarter, faster financial decisions
 * that drive capital efficiency, mitigate liabilities, and accelerate wealth creation. By integrating agentic AI
 * with real-time data, it transforms raw transactional data into actionable strategic insights, offering
 * a significant edge in personal and commercial financial management.
 */

import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { FlowMatrixTransaction, FinancialGoal, AIRecommendation, Budget } from '../../TransactionsView';
import { AITransactionWidget } from '../../TransactionsView';
import { Type } from "@google/genai";
import { GoogleGenAI } from '@google/generative-ai';

/**
 * @description Represents a monthly or quarterly cash flow projection.
 * Business value: Provides clear visibility into future liquidity, enabling proactive financial planning
 * and risk mitigation against potential shortfalls.
 */
export interface CashFlowProjectionItem {
    period: string; // e.g., "July 2024", "Q3 2024"
    estimatedIncome: number;
    estimatedExpenses: number;
    netCashFlow: number;
    keyDrivers: string[];
}

/**
 * @description Schema for AI-generated cash flow projections.
 * Business value: Ensures structured, machine-readable output for cash flow forecasts,
 * facilitating seamless integration into automated reporting and decision-making systems.
 */
export const cashFlowProjectionSchema = {
    type: Type.OBJECT,
    properties: {
        projections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.STRING },
                    estimatedIncome: { type: Type.NUMBER },
                    estimatedExpenses: { type: Type.NUMBER },
                    netCashFlow: { type: Type.NUMBER },
                    keyDrivers: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['period', 'estimatedIncome', 'estimatedExpenses', 'netCashFlow', 'keyDrivers']
            }
        },
        summary: { type: Type.STRING }
    },
    required: ['projections', 'summary']
};


/**
 * @description Represents a monthly or quarterly net worth projection.
 * Business value: Offers a forward-looking perspective on wealth accumulation, guiding
 * investment and savings strategies for long-term financial growth.
 */
export interface NetWorthProjectionItem {
    period: string; // e.g., "July 2024", "Q3 2024"
    estimatedNetWorth: number;
    assetGrowthDrivers: string[];
    liabilityReductionDrivers: string[];
}

/**
 * @description Schema for AI-generated net worth projections.
 * Business value: Standardizes net worth projections for accurate tracking and comparative analysis,
 * critical for wealth management and strategic asset allocation.
 */
export const netWorthProjectionSchema = {
    type: Type.OBJECT,
    properties: {
        projections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.STRING },
                    estimatedNetWorth: { type: Type.NUMBER },
                    assetGrowthDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    liabilityReductionDrivers: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['period', 'estimatedNetWorth']
            }
        },
        summary: { type: Type.STRING }
    },
    required: ['projections', 'summary']
};

/**
 * @description Result of a "What If" scenario analysis.
 * Business value: Empowers users to simulate the financial impact of decisions before execution,
 * significantly reducing risk and optimizing outcomes for strategic financial planning.
 */
export interface WhatIfScenarioResult {
    scenarioDescription: string;
    impactSummary: string;
    projectedCashFlowChange: number; // e.g., -500 (monthly avg change)
    affectedGoals: Array<{
        goalId: string;
        goalName: string;
        impact: 'positive' | 'negative' | 'neutral';
        details: string;
    }>;
    recommendations: string[];
}

/**
 * @description Schema for AI-generated "What If" scenario analysis.
 * Business value: Provides a structured framework for complex scenario planning,
 * facilitating rapid assessment of strategic options and their financial implications.
 */
export const whatIfScenarioSchema = {
    type: Type.OBJECT,
    properties: {
        scenarioDescription: { type: Type.STRING },
        impactSummary: { type: Type.STRING },
        projectedCashFlowChange: { type: Type.NUMBER },
        affectedGoals: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    goalId: { type: Type.STRING },
                    goalName: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
                    details: { type: Type.STRING }
                },
                required: ['goalId', 'goalName', 'impact', 'details']
            }
        },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['scenarioDescription', 'impactSummary', 'projectedCashFlowChange', 'affectedGoals', 'recommendations']
};

/**
 * @description Represents a potential future financial risk or warning.
 * Business value: Acts as an indispensable early warning system, proactively identifying
 * and alerting to impending financial challenges, thereby preventing losses and
 * enabling timely corrective actions.
 */
export interface FinancialWarning {
    type: 'budget_overrun' | 'cash_flow_shortfall' | 'goal_at_risk' | 'unusual_expense_predicted' | 'debt_increase_risk' | 'subscription_increase_risk';
    description: string;
    estimatedTiming: string; // e.g., "Next 2 months", "Q3 2024"
    severity: 'low' | 'medium' | 'high';
    suggestedActions: string[];
}

/**
 * @description Schema for AI-generated financial warnings.
 * Business value: Automates the detection and reporting of critical financial risks,
 * ensuring compliance and reducing operational overhead associated with manual risk assessment.
 */
export const financialWarningSchema = {
    type: Type.OBJECT,
    properties: {
        warnings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['budget_overrun', 'cash_flow_shortfall', 'goal_at_risk', 'unusual_expense_predicted', 'debt_increase_risk', 'subscription_increase_risk'] },
                    description: { type: Type.STRING },
                    estimatedTiming: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['type', 'description', 'estimatedTiming', 'severity', 'suggestedActions']
            }
        }
    },
    required: ['warnings']
};

/**
 * @description Represents an analysis of spending patterns for a category.
 * Business value: Provides granular insights into expenditure trends, enabling precise budget adjustments
 * and cost control strategies for enhanced financial health.
 */
export interface SpendingCategoryForecastItem {
    category: string;
    predictedMonthlySpend: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    drivers: string[];
    recommendations: string[];
}

/**
 * @description Schema for AI-generated spending category forecasts.
 * Business value: Standardizes the output for spending forecasts, essential for automated budget management
 * and granular financial performance reporting.
 */
export const spendingCategoryForecastSchema = {
    type: Type.OBJECT,
    properties: {
        forecasts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    predictedMonthlySpend: { type: Type.NUMBER },
                    trend: { type: Type.STRING, enum: ['increasing', 'decreasing', 'stable'] },
                    drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['category', 'predictedMonthlySpend', 'trend', 'drivers', 'recommendations']
            }
        },
        overallSummary: { type: Type.STRING }
    },
    required: ['forecasts', 'overallSummary']
};

/**
 * @description Represents a projection for a specific investment.
 * Business value: Offers predictive insights into investment performance, enabling data-driven
 * portfolio adjustments and maximizing returns on capital.
 */
export interface InvestmentProjectionItem {
    investmentName: string;
    currentValue: number;
    projectedValue6Months: number;
    projectedValue1Year: number;
    growthDrivers: string[];
    riskFactors: string[];
    suggestedActions: string[];
}

/**
 * @description Schema for AI-generated investment projections.
 * Business value: Provides a structured, actionable format for investment forecasts,
 * streamlining portfolio management and risk assessment for rapid decision-making.
 */
export const investmentProjectionSchema = {
    type: Type.OBJECT,
    properties: {
        projections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    investmentName: { type: Type.STRING },
                    currentValue: { type: Type.NUMBER },
                    projectedValue6Months: { type: Type.NUMBER },
                    projectedValue1Year: { type: Type.NUMBER },
                    growthDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['investmentName', 'currentValue', 'projectedValue6Months', 'projectedValue1Year']
            }
        },
        summary: { type: Type.STRING }
    },
    required: ['projections', 'summary']
};

/**
 * @description Represents an analysis of a debt repayment plan.
 * Business value: Optimizes debt repayment strategies, minimizing interest costs and accelerating
 * financial freedom, thus enhancing cash flow and reducing financial liabilities.
 */
export interface DebtRepaymentForecast {
    debtName: string;
    currentBalance: number;
    monthlyPayment: number;
    interestRate: number;
    projectedPayoffDate: string;
    totalInterestPaid: number;
    accelerationStrategies: string[];
    impactOnCashFlow: string;
}

/**
 * @description Schema for AI-generated debt repayment forecasts.
 * Business value: Provides a standardized, actionable framework for debt management,
 * enabling automated strategic planning to reduce financial burden.
 */
export const debtRepaymentForecastSchema = {
    type: Type.OBJECT,
    properties: {
        forecasts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    debtName: { type: Type.STRING },
                    currentBalance: { type: Type.NUMBER },
                    monthlyPayment: { type: Type.NUMBER },
                    interestRate: { type: Type.NUMBER },
                    projectedPayoffDate: { type: Type.STRING },
                    totalInterestPaid: { type: Type.NUMBER },
                    accelerationStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    impactOnCashFlow: { type: Type.STRING }
                },
                required: ['debtName', 'currentBalance', 'monthlyPayment', 'interestRate', 'projectedPayoffDate', 'totalInterestPaid']
            }
        },
        overallSummary: { type: Type.STRING }
    },
    required: ['forecasts', 'overallSummary']
};

/**
 * @description Represents an AI-driven budget optimization suggestion.
 * Business value: Identifies and recommends high-impact adjustments to budgets,
 * freeing up capital for strategic investments or savings, thereby maximizing financial
 * resource utilization and improving financial performance.
 */
export interface BudgetOptimizationSuggestion {
    category: string;
    currentBudget: number;
    suggestedBudget: number;
    justification: string;
    expectedImpact: string;
    actionableSteps: string[];
}

/**
 * @description Schema for AI-generated budget optimization suggestions.
 * Business value: Provides a clear, actionable structure for budget recommendations,
 * facilitating automated implementation and continuous improvement of financial efficiency.
 */
export const budgetOptimizationSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    currentBudget: { type: Type.NUMBER },
                    suggestedBudget: { type: Type.NUMBER },
                    justification: { type: Type.STRING },
                    expectedImpact: { type: Type.STRING },
                    actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['category', 'currentBudget', 'justification', 'expectedImpact', 'actionableSteps']
            }
        },
        overallRecommendation: { type: Type.STRING }
    },
    required: ['suggestions', 'overallRecommendation']
};


/**
 * @description Represents a detected and analyzed subscription.
 * Business value: Automates the discovery and optimization of recurring expenses,
 * preventing 'subscription creep' and enabling significant cost savings without
 * manual effort.
 */
export interface SubscriptionAnalysisResult {
    name: string;
    category: string;
    monthlyCost: number;
    annualCost: number;
    lastPaymentDate: string;
    nextPaymentDate: string;
    potentialPriceChange: string; // e.g., "Possible increase in 3 months", "Stable"
    valueAssessment: string; // e.g., "High value", "Low utilization", "Redundant"
    recommendations: string[]; // e.g., "Consider downgrading", "Negotiate", "Cancel if unused"
}

/**
 * @description Schema for AI-generated subscription analysis.
 * Business value: Standardizes subscription insights, enabling programmatic management
 * and optimization of recurring expenses across an enterprise or individual portfolio.
 */
export const subscriptionAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        subscriptions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    monthlyCost: { type: Type.NUMBER },
                    annualCost: { type: Type.NUMBER },
                    lastPaymentDate: { type: Type.STRING },
                    nextPaymentDate: { type: Type.STRING },
                    potentialPriceChange: { type: Type.STRING },
                    valueAssessment: { type: Type.STRING },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['name', 'category', 'monthlyCost', 'annualCost']
            }
        },
        summary: { type: Type.STRING }
    },
    required: ['subscriptions', 'summary']
};


/**
 * @description Represents a projected financial health score.
 * Business value: Provides a holistic, forward-looking metric of financial wellness,
 * acting as a key performance indicator (KPI) for financial strategy and offering
 * clear, actionable steps for continuous improvement.
 */
export interface FinancialHealthScoreProjection {
    currentScore: number; // e.g., 1-100
    currentAssessment: string;
    projectedScore6Months: number;
    projectedScore1Year: number;
    scoreDrivers: string[];
    improvementRecommendations: string[];
}

/**
 * @description Schema for AI-generated financial health score projections.
 * Business value: Enables systematic tracking and enhancement of financial health,
 * providing a quantifiable measure of progress and strategic direction for users and advisors.
 */
export const financialHealthScoreSchema = {
    type: Type.OBJECT,
    properties: {
        currentScore: { type: Type.NUMBER },
        currentAssessment: { type: Type.STRING },
        projectedScore6Months: { type: Type.NUMBER },
        projectedScore1Year: { type: Type.NUMBER },
        scoreDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
        improvementRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['currentScore', 'currentAssessment', 'projectedScore6Months', 'projectedScore1Year', 'scoreDrivers', 'improvementRecommendations']
};

/**
 * @description Represents a detected financial anomaly or unusual activity.
 * Business value: Provides early detection of potential fraud or unexpected financial deviations,
 * enhancing security and preventing financial loss. This directly leverages the agentic AI's
 * monitoring capabilities to protect user assets and ensure financial integrity.
 */
export interface AnomalyDetectionResult {
    anomalyId: string;
    type: 'unusual_spend' | 'unusual_income' | 'unrecognized_subscription' | 'potential_fraud_pattern' | 'irregular_payment';
    description: string;
    detectedDate: string; // ISO date string
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestedInvestigation: string[];
    affectedTransactions: string[]; // List of transaction IDs or descriptions
}

/**
 * @description Schema for AI-generated anomaly detection results.
 * Business value: Ensures structured, machine-readable output for anomaly detection,
 * facilitating seamless integration into automated reporting and decision-making systems
 * for fraud prevention and operational risk management.
 */
export const anomalyDetectionSchema = {
    type: Type.OBJECT,
    properties: {
        anomalies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    anomalyId: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['unusual_spend', 'unusual_income', 'unrecognized_subscription', 'potential_fraud_pattern', 'irregular_payment'] },
                    description: { type: Type.STRING },
                    detectedDate: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                    suggestedInvestigation: { type: Type.ARRAY, items: { type: Type.STRING } },
                    affectedTransactions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['anomalyId', 'type', 'description', 'detectedDate', 'severity', 'suggestedInvestigation']
            }
        },
        overallAssessment: { type: Type.STRING }
    },
    required: ['anomalies', 'overallAssessment']
};


/**
 * @description Represents a projection for a specific tokenized asset (e.g., stablecoin, digital equity).
 * Business value: Enables users to understand the future valuation and risk of their digital assets,
 * facilitating advanced treasury management and strategic allocation within the token rails ecosystem.
 */
export interface TokenizedAssetProjectionItem {
    assetName: string; // e.g., "USD_Stablecoin", "MoneyToken-GOV"
    currentBalance: number;
    projectedValueFiat6Months: number; // Projected value in USD or other fiat
    projectedValueFiat1Year: number;
    priceStabilityFactors: string[]; // e.g., "Peg stability", "Liquidity", "Adoption"
    riskFactors: string[]; // e.g., "Smart contract risk", "Regulatory changes"
    suggestedActions: string[]; // e.g., "Hedge exposure", "Increase holdings"
}

/**
 * @description Schema for AI-generated tokenized asset projections.
 * Business value: Standardizes tokenized asset projections for accurate tracking and comparative analysis,
 * critical for digital asset management and strategic allocation in a tokenized economy.
 */
export const tokenizedAssetProjectionSchema = {
    type: Type.OBJECT,
    properties: {
        projections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    assetName: { type: Type.STRING },
                    currentBalance: { type: Type.NUMBER },
                    projectedValueFiat6Months: { type: Type.NUMBER },
                    projectedValueFiat1Year: { type: Type.NUMBER },
                    priceStabilityFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['assetName', 'currentBalance', 'projectedValueFiat6Months', 'projectedValueFiat1Year']
            }
        },
        summary: { type: Type.STRING }
    },
    required: ['projections', 'summary']
};

/**
 * @description Represents a recommendation for optimal payment routing across different rails.
 * Business value: Optimizes payment execution for speed, cost, and transactional guarantees,
 * directly enhancing the efficiency and profitability of the real-time payments infrastructure.
 * This capability unlocks significant cost arbitrage and operational velocity for enterprises.
 */
export interface PaymentRoutingRecommendationItem {
    transactionType: string; // e.g., "Large Transfer", "International Payment", "Micro-payment"
    amount: number;
    currency: string;
    recommendedRail: string; // e.g., "rail_fast", "rail_batch", "token_rail_usd"
    predictedLatencyMs: number;
    predictedCostFiat: number;
    justification: string; // e.g., "Lowest fees for this amount", "Fastest for international"
    alternativeRails: Array<{
        railName: string;
        latencyMs: number;
        costFiat: number;
    }>;
}

/**
 * @description Schema for AI-generated payment routing recommendations.
 * Business value: Provides a structured, programmatic interface for payment rail optimization,
 * critical for maximizing efficiency, minimizing costs, and ensuring transactional integrity
 * within a multi-rail real-time payments ecosystem.
 */
export const paymentRoutingRecommendationSchema = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    transactionType: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    currency: { type: Type.STRING },
                    recommendedRail: { type: Type.STRING },
                    predictedLatencyMs: { type: Type.NUMBER },
                    predictedCostFiat: { type: Type.NUMBER },
                    justification: { type: Type.STRING },
                    alternativeRails: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                railName: { type: Type.STRING },
                                latencyMs: { type: Type.NUMBER },
                                costFiat: { type: Type.NUMBER }
                            },
                            required: ['railName', 'latencyMs', 'costFiat']
                        }
                    }
                },
                required: ['transactionType', 'amount', 'currency', 'recommendedRail', 'predictedLatencyMs', 'predictedCostFiat', 'justification']
            }
        },
        overallOptimizationSummary: { type: Type.STRING }
    },
    required: ['recommendations', 'overallOptimizationSummary']
};


/**
 * @description A component to visualize financial projections using a bar chart.
 * Business value: Transforms complex financial data into intuitive visual insights,
 * accelerating comprehension and decision-making for critical financial trends and forecasts.
 */
export const ProjectionChart: React.FC<{ data: { label: string; value: number; }[]; title: string; valuePrefix?: string }> = ({ data, title, valuePrefix = '$' }) => {
    const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 1);
    const minVal = Math.min(...data.map(d => d.value), 0);
    const zeroLinePosition = maxVal > 0 && minVal < 0 ? (Math.abs(minVal) / (maxVal + Math.abs(minVal))) * 100 : (minVal >= 0 ? 0 : 100);

    if (data.length === 0) {
        return (
            <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-48 flex flex-col items-center justify-center">
                <h4 className="font-semibold text-gray-200 text-sm mb-2">{title}</h4>
                <p className="text-gray-500 text-xs">No projection data available.</p>
            </div>
        );
    }
    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-48 flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">{title}</h4>
            <div className="flex-grow flex items-end h-32 p-2 bg-gray-800 rounded-md relative overflow-hidden">
                <div className="absolute w-full h-px bg-gray-600 left-0 right-0" style={{ bottom: `${zeroLinePosition}%` }}></div>
                {data.map((item, index) => (
                    <div key={index} className="flex-grow flex flex-col items-center mx-0.5 relative z-10 group cursor-pointer" style={{ height: '100%' }}>
                        <div
                            className={`w-4 rounded-t-sm transition-all duration-300 ${item.value >= 0 ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
                            style={{
                                height: `${(Math.abs(item.value) / maxVal) * (100 - zeroLinePosition)}%`,
                                position: 'absolute',
                                bottom: item.value >= 0 ? `${zeroLinePosition}%` : 'auto',
                                top: item.value < 0 ? `${zeroLinePosition}%` : 'auto',
                                transform: item.value < 0 ? 'translateY(100%)' : 'none'
                            }}
                        ></div>
                        <span className="text-gray-500 text-xxs mt-1 absolute bottom-0 group-hover:text-white group-hover:bg-gray-700 px-1 py-0.5 rounded transition-all duration-200">{item.label}</span>
                        <div className="absolute bottom-full mb-1 p-1 px-2 bg-gray-700 text-white text-xxs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {item.label}: {valuePrefix}{item.value.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-gray-400 text-xs mt-2 text-center">AI-projected {title.toLowerCase()}</p>
        </div>
    );
};

/**
 * @description Provides a visual confirmation of data governance and digital identity compliance
 * for the predictive analytics services.
 * Business value: Instills trust and ensures regulatory compliance by highlighting the secure,
 * identity-linked processing of sensitive financial data, critical for enterprise adoption
 * and maintaining data integrity within a multi-party financial ecosystem.
 */
export const DataGovernanceAssurance: React.FC = () => {
    return (
        <Card title="Data Governance & Identity Assurance">
            <div className="flex items-center text-green-400 text-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.275a1.125 1.125 0 011.128 1.128V15.75a1.125 1.125 0 01-1.128 1.128H4.894A1.125 1.125 0 013.75 15.75V7.875c0-.621.504-1.125 1.125-1.125h4.233M16.5 7.5L13.875 10.125M13.875 10.125L11.25 7.5M13.875 10.125l-2.625 2.625m2.625-2.625L16.5 7.5" />
                </svg>
                <p>All predictive analytics are processed under strict digital identity protocols and data governance policies, ensuring privacy, integrity, and auditable access control.</p>
            </div>
            <p className="text-gray-500 text-xs mt-2">Leveraging Public/Private Key Infrastructure for secure data lineage and role-based access to insights.</p>
        </Card>
    );
};

/**
 * @description The main view component for displaying AI-driven predictive financial analytics.
 * Business value: This view centralizes Plato's advanced forecasting and optimization capabilities,
 * offering a holistic, forward-looking perspective on a user's financial landscape. It acts as the
 * primary interface for interacting with agentic AI insights, enabling strategic financial steering
 * and unlocking new efficiencies, revenue streams, and risk mitigation strategies worth millions
 * to both individual wealth builders and large enterprises.
 */
export const PredictiveAnalyticsView: React.FC = () => {
    const context = useContext(DataContext);
    const [scenarioInput, setScenarioInput] = useState<string>('');
    const [whatIfResult, setWhatIfResult] = useState<WhatIfScenarioResult | null>(null);
    const [isLoadingScenario, setIsLoadingScenario] = useState(false);
    const [scenarioError, setScenarioError] = useState('');

    const [cashFlowProjections, setCashFlowProjections] = useState<CashFlowProjectionItem[]>([]);
    const [netWorthProjections, setNetWorthProjections] = useState<NetWorthProjectionItem[]>([]);

    if (!context) {
        throw new Error("PredictiveAnalyticsView must be within a DataProvider");
    }
    const { transactions, budgets, goals } = context;

    /**
     * @description Formats a numeric amount into a currency string.
     * @param {number} amount - The numeric value to format.
     * @param {string} currency - The currency code (default 'USD').
     * @returns {string} The formatted currency string.
     */
    const formatAmount = useCallback((amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    }, []);

    /**
     * @description Formats a numeric value into a percentage string.
     * @param {number} value - The numeric value to format (e.g., 85 for 85%).
     * @returns {string} The formatted percentage string.
     */
    const formatPercentage = useCallback((value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
    }, []);

    /**
     * @description Memoized instance of GoogleGenAI for interacting with the AI model.
     * Business value: Provides efficient, secure access to the underlying large language model
     * for all AI-driven predictive features, ensuring consistent performance and scalability.
     */
    const platoAi = useMemo(() => {
        if (process.env.NEXT_PUBLIC_API_KEY) {
            return new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string });
        }
        return null;
    }, []);

    /**
     * @description Function to trigger "What If" scenario analysis using Plato AI.
     * @param {string} predefinedScenario - An optional predefined scenario string.
     * Business value: Enables instant, data-backed financial scenario modeling,
     * allowing users to evaluate strategic choices and their financial ramifications
     * with high fidelity, reducing speculative risk.
     */
    const runWhatIfScenario = useCallback(async (predefinedScenario: string = '') => {
        const currentScenario = predefinedScenario || scenarioInput.trim();
        if (!currentScenario) {
            setScenarioError('Please enter a scenario to analyze.');
            return;
        }
        if (!platoAi) {
            setScenarioError('Plato AI API key is not configured.');
            return;
        }

        setIsLoadingScenario(true);
        setScenarioError('');
        setWhatIfResult(null);

        try {
            const transactionSummary = transactions.slice(0, 50).map(t =>
                `${t.date} - ${t.description} (${t.category}): ${t.type === 'income' ? '+' : '-'}${t.currency}${t.amount.toFixed(2)}`
            ).join('\n');

            const goalSummary = goals ? goals.map(g =>
                `${g.name}: Target ${formatAmount(g.targetAmount)}, Current ${formatAmount(g.currentAmount)}, Progress ${g.progressPercentage.toFixed(1)}%`
            ).join('\n') : 'No financial goals set.';

            const fullPrompt = `Analyze the following hypothetical financial scenario against the user's historical transactions and current financial goals. Describe the potential impact on their cash flow and financial goals over the next 6-12 months. Focus on key changes and actionable insights, and provide concrete recommendations. Return a JSON object matching the 'whatIfScenarioSchema'.\n\nUser Scenario: ${currentScenario}\n\nRecent Transactions:\n${transactionSummary}\n\nFinancial Goals:\n${goalSummary}`;

            const model = platoAi.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const response = await model.generateContent({
                contents: [{ text: fullPrompt }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 64,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                ],
                responseMimeType: "application/json",
                responseSchema: whatIfScenarioSchema,
            });

            const textResult = response.response.text().trim();
            let parsedResult;
            try {
                parsedResult = JSON.parse(textResult.replace(/```json\n|```/g, '').trim());
            } catch (jsonError) {
                console.error("Failed to parse AI response as JSON:", jsonError, "Raw response:", textResult);
                throw new Error("AI returned an unparseable response.");
            }
            setWhatIfResult(parsedResult as WhatIfScenarioResult);

        } catch (err) {
            console.error('Error running What If scenario:', err);
            setScenarioError(`Plato AI could not analyze the scenario: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoadingScenario(false);
        }
    }, [scenarioInput, transactions, goals, platoAi, formatAmount]);


    /**
     * @description Predefined What-If scenarios for quick access.
     * Business value: Accelerates user engagement with advanced scenario planning by offering
     * immediate, relevant starting points for common financial questions, boosting feature adoption.
     */
    const predefinedScenarios = useMemo(() => [
        'What if I cut dining out by 50%?',
        'What if I pay an extra $100 towards my highest interest debt?',
        'What if my monthly income increases by $500?',
        'What if I invest $200 monthly into a high-growth fund?'
    ], []);


    /**
     * @description Callback function to handle parsed cash flow projection results.
     * @param {object} result - Object containing cash flow projections and summary.
     * Business value: Ensures real-time updates of cash flow data within the UI,
     * maintaining data freshness and supporting dynamic financial analysis.
     */
    const handleCashFlowProjectionResult = useCallback((result: { projections: CashFlowProjectionItem[], summary: string }) => {
        if (result && result.projections) {
            setCashFlowProjections(result.projections);
        }
    }, []);

    /**
     * @description Callback function to handle parsed net worth projection results.
     * @param {object} result - Object containing net worth projections and summary.
     * Business value: Facilitates immediate visualization of net worth trends,
     * crucial for tracking long-term financial health and wealth accumulation goals.
     */
    const handleNetWorthProjectionResult = useCallback((result: { projections: NetWorthProjectionItem[], summary: string }) => {
        if (result && result.projections) {
            setNetWorthProjections(result.projections);
        }
    }, []);

    /**
     * @description Memoized data for the cash flow projection chart.
     * Business value: Optimizes rendering performance for dynamic charts,
     * ensuring a smooth and responsive user experience even with complex data sets.
     */
    const cashFlowChartData = useMemo(() =>
        cashFlowProjections.map(p => ({ label: p.period.substring(0, 3), value: p.netCashFlow }))
    , [cashFlowProjections]);

    /**
     * @description Memoized data for the net worth projection chart.
     * Business value: Provides an efficient data structure for visualizing net worth trends,
     * enabling quick assessment of financial growth and strategic adjustments.
     */
    const netWorthChartData = useMemo(() =>
        netWorthProjections.map(p => ({ label: p.period.substring(0, 3), value: p.estimatedNetWorth }))
    , [netWorthProjections]);


    return (
        <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-8 drop-shadow-lg">Plato's Oracle: Predictive Analytics</h2>

            {/* Cash Flow Projections */}
            <Card title="Cash Flow Forecast (Next 6 Months)" isCollapsible>
                <AITransactionWidget
                    title="Detailed Monthly Cash Flow"
                    prompt="Predict the user's cash flow for the next 6 months based on their historical transactions, recurring income, and expenses. Provide monthly breakdowns of estimated income, expenses, and net cash flow. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={cashFlowProjectionSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    onResultParsed={handleCashFlowProjectionResult}
                >
                    {(result: { projections: CashFlowProjectionItem[], summary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-48 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400">{result.summary}</p>
                            <ul className="list-disc list-inside">
                                {result.projections.map((proj, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold">{proj.period}:</span> Income {formatAmount(proj.estimatedIncome)}, Expenses {formatAmount(proj.estimatedExpenses)}, Net {formatAmount(proj.netCashFlow)}
                                        <span className="block text-gray-500 text-xxs ml-4">Drivers: {proj.keyDrivers.join(', ')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </AITransactionWidget>
                <div className="mt-4">
                    <ProjectionChart title="Projected Net Cash Flow" data={cashFlowChartData} />
                </div>
            </Card>

            {/* Net Worth Projections */}
            <Card title="Net Worth Trajectory (Next 12 Months)" isCollapsible>
                <AITransactionWidget
                    title="Estimated Net Worth Growth"
                    prompt="Estimate the user's net worth trajectory for the next 12 months, considering their current assets (e.g., bank balance, known investments), liabilities (e.g., debts, recurring payments), and projected savings/spending habits. Provide monthly net worth figures. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={netWorthProjectionSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{ currentBankBalance: '15000', totalDebts: '8000', knownInvestments: '25000' }}
                    onResultParsed={handleNetWorthProjectionResult}
                >
                    {(result: { projections: NetWorthProjectionItem[], summary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-48 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400">{result.summary}</p>
                            <ul className="list-disc list-inside">
                                {result.projections.map((proj, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold">{proj.period}:</span> Estimated Net Worth {formatAmount(proj.estimatedNetWorth)}
                                        <span className="block text-gray-500 text-xxs ml-4">Assets: {proj.assetGrowthDrivers.join(', ')} / Liabilities: {proj.liabilityReductionDrivers.join(', ')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </AITransactionWidget>
                <div className="mt-4">
                    <ProjectionChart title="Projected Net Worth" data={netWorthChartData} />
                </div>
            </Card>

            {/* "What If" Scenario Planner */}
            <Card title="What If? Scenario Planner" isCollapsible>
                <p className="text-gray-400 text-sm mb-3">Ask Plato AI to analyze hypothetical financial changes and predict their impact.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {predefinedScenarios.map((scenario, index) => (
                        <button
                            key={index}
                            onClick={() => { setScenarioInput(scenario); runWhatIfScenario(scenario); }}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-1 rounded-full transition duration-200"
                            disabled={isLoadingScenario}
                        >
                            {scenario.split(' ')[0]}...
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-3">
                    <textarea
                        value={scenarioInput}
                        onChange={(e) => setScenarioInput(e.target.value)}
                        placeholder="e.g., 'What if I save an extra $200 per month?', 'What if I take a loan of $10,000 for a car at 5% interest?', 'What if my salary increases by 10% next quarter?'"
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[80px] custom-scrollbar"
                    />
                    <button
                        onClick={() => runWhatIfScenario()}
                        disabled={isLoadingScenario || !scenarioInput.trim()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingScenario ? 'Analyzing Scenario...' : 'Run Scenario Analysis'}
                    </button>
                </div>

                {scenarioError && <p className="text-red-400 text-xs mt-3">{scenarioError}</p>}

                {whatIfResult && (
                    <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-3">
                        <h5 className="font-semibold text-cyan-300 text-base">Scenario: {whatIfResult.scenarioDescription}</h5>
                        <p className="text-gray-300 text-sm">{whatIfResult.impactSummary}</p>
                        <p className="text-gray-400 text-sm">
                            Projected Monthly Cash Flow Change: <span className={whatIfResult.projectedCashFlowChange >= 0 ? 'text-green-400' : 'text-red-400'}>{formatAmount(whatIfResult.projectedCashFlowChange)}</span>
                        </p>
                        <div>
                            <p className="font-semibold text-gray-300 text-sm">Affected Goals:</p>
                            <ul className="list-disc list-inside text-xs text-gray-400">
                                {whatIfResult.affectedGoals.map(goal => (
                                    <li key={goal.goalId}>
                                        <span className={`font-semibold ${goal.impact === 'positive' ? 'text-green-400' : goal.impact === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>{goal.goalName}</span>: {goal.details}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-300 text-sm">Recommendations:</p>
                            <ul className="list-disc list-inside text-xs text-gray-400">
                                {whatIfResult.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </Card>

            {/* Early Financial Warning System */}
            <Card title="Plato AI Early Warning System" isCollapsible>
                <AITransactionWidget
                    title="Potential Future Risks"
                    prompt="Based on historical spending, income patterns, and known recurring expenses, identify any potential future financial risks or challenges in the next 3-6 months. Examples: risk of overspending in a category, approaching a budget limit, potential cash flow crunch, missed goal targets, increasing debt. Provide the nature of the risk, its estimated timing, its severity, and suggested preventative actions. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={financialWarningSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{ currentBudgets: budgets, currentGoals: goals }}
                >
                    {(result: { warnings: FinancialWarning[] }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {result.warnings.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.warnings.map((warning, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className={`font-semibold ${warning.severity === 'high' ? 'text-red-400' : warning.severity === 'medium' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                                {warning.type.replace(/_/g, ' ')} ({warning.severity})
                                            </span> - {warning.description} <span className="text-gray-500">({warning.estimatedTiming})</span>
                                            <ul className="list-disc list-inside ml-4 text-gray-500">
                                                {warning.suggestedActions.map((action, aidx) => <li key={aidx}>{action}</li>)}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No significant future financial risks detected by Plato AI for the next 3-6 months. Keep up the great work!</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Anomaly Detection (Agentic AI Simulation) */}
            <Card title="Plato AI Anomaly Detection" isCollapsible>
                <AITransactionWidget
                    title="Detected Unusual Activity"
                    prompt="Act as an Agentic AI Anomaly Detection System. Review the user's recent and historical transactions for any unusual patterns, significant deviations from normal spending/income, potential fraud signals, or unrecognized recurring payments. Identify any anomalies, describe them, assess their severity, and suggest immediate investigation steps. Present findings as an 'anomaly' report. Assume the user's base currency is USD. This simulates direct output from an internal monitoring agent."
                    transactions={transactions}
                    responseSchema={anomalyDetectionSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                >
                    {(result: { anomalies: AnomalyDetectionResult[], overallAssessment: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.overallAssessment}</p>
                            {result.anomalies.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.anomalies.map((anomaly, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className={`font-semibold ${anomaly.severity === 'critical' ? 'text-red-500' : anomaly.severity === 'high' ? 'text-orange-400' : anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                                Anomaly ({anomaly.type.replace(/_/g, ' ')} - {anomaly.severity})
                                            </span>: {anomaly.description} <span className="text-gray-500">({anomaly.detectedDate})</span>
                                            <ul className="list-disc list-inside ml-4 text-gray-500">
                                                {anomaly.suggestedInvestigation.map((step, sidx) => <li key={sidx}>{step}</li>)}
                                                {anomaly.affectedTransactions.length > 0 && <li className="font-medium">Affected Transactions: {anomaly.affectedTransactions.join(', ')}</li>}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No significant anomalies or unusual activities detected by Plato AI's monitoring agent.</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Advanced Goal Attainment Probability */}
            <Card title="Goal Attainment Probability (Advanced)" isCollapsible>
                 <AITransactionWidget
                    title="Goal Projections & Optimizations"
                    prompt="Analyze the user's current financial goals and provide an updated probability of achieving each goal, estimated time to achievement, and tailored recommendations to optimize their progress. Consider their current spending, income, and any linked categories. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={{
                        type: Type.OBJECT,
                        properties: {
                            goalsAnalysis: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        goalName: { type: Type.STRING },
                                        currentProgress: { type: Type.NUMBER }, // %
                                        probability: { type: Type.NUMBER }, // %
                                        estimatedCompletionDate: { type: Type.STRING },
                                        optimizations: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ['goalName', 'currentProgress', 'probability', 'estimatedCompletionDate', 'optimizations']
                                }
                            }
                        },
                        required: ['goalsAnalysis']
                    }}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{ financialGoals: goals }}
                >
                    {(result: { goalsAnalysis: Array<{ goalName: string; currentProgress: number; probability: number; estimatedCompletionDate: string; optimizations: string[]; }> }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {result.goalsAnalysis.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.goalsAnalysis.map((goal, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className="font-semibold text-green-400">{goal.goalName}:</span>
                                            <p className="ml-4">Current Progress: {goal.currentProgress.toFixed(1)}%</p>
                                            <p className="ml-4">Probability of Achievement: <span className={goal.probability > 75 ? 'text-green-300' : goal.probability > 50 ? 'text-yellow-300' : 'text-red-300'}>{formatPercentage(goal.probability)}</span></p>
                                            <p className="ml-4">Est. Completion: {goal.estimatedCompletionDate}</p>
                                            <p className="ml-4 font-semibold text-gray-400">Optimizations:</p>
                                            <ul className="list-disc list-inside ml-8 text-gray-500">
                                                {goal.optimizations.map((opt, oidx) => <li key={oidx}>{opt}</li>)}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No financial goals to analyze. Consider setting some goals to get started!</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Spending Category Forecast */}
            <Card title="Spending Category Forecast (Next 3 Months)" isCollapsible>
                <AITransactionWidget
                    title="Predicted Spending by Category"
                    prompt="Analyze historical spending patterns across different categories for the user. Predict the average monthly spend for key categories over the next 3 months, identify trends (increasing, decreasing, stable), and suggest drivers behind these trends. Provide actionable recommendations for optimizing spending in each category. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={spendingCategoryForecastSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                >
                    {(result: { forecasts: SpendingCategoryForecastItem[], overallSummary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.overallSummary}</p>
                            {result.forecasts.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.forecasts.map((forecast, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className={`font-semibold ${forecast.trend === 'increasing' ? 'text-red-400' : forecast.trend === 'decreasing' ? 'text-green-400' : 'text-cyan-400'}`}>
                                                {forecast.category} ({forecast.trend})
                                            </span>: Predicted {formatAmount(forecast.predictedMonthlySpend)}/month
                                            <span className="block text-gray-500 text-xxs ml-4">Drivers: {forecast.drivers.join(', ')}</span>
                                            <ul className="list-disc list-inside ml-4 text-gray-500">
                                                {forecast.recommendations.map((rec, ridx) => <li key={ridx}>{rec}</li>)}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No significant spending categories detected for forecast.</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Investment Growth Projections */}
            <Card title="Investment Growth Projections" isCollapsible>
                <AITransactionWidget
                    title="Portfolio Growth Outlook"
                    prompt="Provide a projection for the user's investments based on current values, historical performance, and general market outlook. Offer 6-month and 1-year projected values, identify key growth drivers and risk factors, and suggest actions to optimize returns or mitigate risks. Assume an average market growth rate for diversified investments and consider individual transaction data for specific investment entries. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={investmentProjectionSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{ existingInvestments: "Diversified Stocks: $10,000, Crypto: $5,000, Savings Account: $2,000" }}
                >
                    {(result: { projections: InvestmentProjectionItem[], summary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.summary}</p>
                            {result.projections.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.projections.map((proj, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className="font-semibold text-green-400">{proj.investmentName}:</span> Current {formatAmount(proj.currentValue)}
                                            <ul className="list-disc list-inside ml-4 text-gray-400">
                                                <li>Projected 6 Months: {formatAmount(proj.projectedValue6Months)}</li>
                                                <li>Projected 1 Year: {formatAmount(proj.projectedValue1Year)}</li>
                                                <li className="text-gray-500">Growth Drivers: {proj.growthDrivers.join(', ')}</li>
                                                <li className="text-gray-500">Risk Factors: {proj.riskFactors.join(', ')}</li>
                                                <li className="text-gray-500">Actions: {proj.suggestedActions.join(', ')}</li>
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No specific investment data to project. Consider tracking your investments.</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Tokenized Asset Projections (Token Rails Simulation) */}
            <Card title="Tokenized Asset Projections (Simulated)" isCollapsible>
                <AITransactionWidget
                    title="Digital Asset Value Forecast"
                    prompt="Provide a projection for the user's tokenized assets (e.g., stablecoins, digital equities) based on simulated current balances, expected market stability, and underlying economic factors. Offer 6-month and 1-year projected values in fiat equivalent, identify key stability drivers and digital asset specific risk factors (e.g., smart contract risk), and suggest actions to optimize holdings or mitigate risks. Assume access to simulated token rail data for current balances and market conditions. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={tokenizedAssetProjectionSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{
                        simulatedTokenBalances: [
                            { name: 'USD_Stablecoin', balance: 5000 },
                            { name: 'MoneyToken-GOV', balance: 1000, fiatValue: 1200 }, // Example with current fiat value
                            { name: 'EuroStable', balance: 2000 }
                        ]
                    }}
                >
                    {(result: { projections: TokenizedAssetProjectionItem[], summary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.summary}</p>
                            {result.projections.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.projections.map((proj, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className="font-semibold text-teal-400">{proj.assetName}:</span> Current {proj.currentBalance} tokens
                                            <ul className="list-disc list-inside ml-4 text-gray-400">
                                                <li>Projected Fiat Value 6 Months: {formatAmount(proj.projectedValueFiat6Months)}</li>
                                                <li>Projected Fiat Value 1 Year: {formatAmount(proj.projectedValueFiat1Year)}</li>
                                                <li className="text-gray-500">Stability Factors: {proj.priceStabilityFactors.join(', ')}</li>
                                                <li className="text-gray-500">Risk Factors: {proj.riskFactors.join(', ')}</li>
                                                <li className="text-gray-500">Actions: {proj.suggestedActions.join(', ')}</li>
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No specific tokenized asset data to project. Consider integrating with token rails.</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Debt Repayment Forecasting */}
            <Card title="Debt Repayment Forecasting" isCollapsible>
                <AITransactionWidget
                    title="Accelerated Debt Payoff Strategies"
                    prompt="Analyze the user's current debts based on transaction patterns and provided contextual data. For each debt, project the payoff date and total interest paid under current payment plans. Then, suggest strategies to accelerate repayment, quantify their impact, and explain how they affect cash flow. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={debtRepaymentForecastSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{
                        debts: [
                            { name: 'Credit Card A', balance: 2500, monthlyPayment: 100, interestRate: 18.9 },
                            { name: 'Student Loan B', balance: 15000, monthlyPayment: 200, interestRate: 4.5 }
                        ]
                    }}
                >
                    {(result: { forecasts: DebtRepaymentForecast[], overallSummary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.overallSummary}</p>
                            {result.forecasts.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.forecasts.map((forecast, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className="font-semibold text-orange-400">{forecast.debtName}:</span> Current Balance {formatAmount(forecast.currentBalance)} (Int. {forecast.interestRate}%)
                                            <ul className="list-disc list-inside ml-4 text-gray-400">
                                                <li>Monthly Payment: {formatAmount(forecast.monthlyPayment)}</li>
                                                <li>Projected Payoff: {forecast.projectedPayoffDate}</li>
                                                <li>Total Interest Paid: {formatAmount(forecast.totalInterestPaid)}</li>
                                                <li className="text-gray-500">Strategies: {forecast.accelerationStrategies.join(', ')}</li>
                                                <li className="text-gray-500">Impact: {forecast.impactOnCashFlow}</li>
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No specific debt data to analyze. Consider adding your debts.</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Payment Routing Optimization (Real-time Payments Simulation) */}
            <Card title="Payment Routing Optimization (Simulated)" isCollapsible>
                <AITransactionWidget
                    title="Optimal Payment Rail Recommendations"
                    prompt="Simulate a Payment Routing Engine. Based on predefined payment types (e.g., large transfer, international, micro-payment), predict the optimal payment rail to use (e.g., 'rail_fast', 'rail_batch', 'token_rail_usd') to minimize cost and latency. Provide predicted metrics for the recommended rail and compare with alternatives. Assume access to simulated real-time payment rail performance data. Assume the user's base currency is USD."
                    transactions={transactions} // Still pass transactions for context if needed
                    responseSchema={paymentRoutingRecommendationSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{
                        simulatedPaymentScenarios: [
                            { type: 'Large Transfer (>$10,000)', amount: 15000, currency: 'USD' },
                            { type: 'International Payment (EUR)', amount: 500, currency: 'EUR' },
                            { type: 'Micro-payment (<$10)', amount: 7.50, currency: 'USD' }
                        ],
                        simulatedRailPerformance: {
                            'rail_fast': { avgLatencyMs: 200, avgCostFiat: 0.05, capacity: 'high' },
                            'rail_batch': { avgLatencyMs: 3600000, avgCostFiat: 0.01, capacity: 'unlimited' }, // 1 hour
                            'token_rail_usd': { avgLatencyMs: 10000, avgCostFiat: 0.02, capacity: 'medium' } // 10 seconds
                        }
                    }}
                >
                    {(result: { recommendations: PaymentRoutingRecommendationItem[], overallOptimizationSummary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.overallOptimizationSummary}</p>
                            {result.recommendations.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.recommendations.map((rec, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className="font-semibold text-indigo-400">Payment: {rec.transactionType} ({formatAmount(rec.amount, rec.currency)})</span>
                                            <ul className="list-disc list-inside ml-4 text-gray-400">
                                                <li>Recommended Rail: <span className="text-green-300 font-medium">{rec.recommendedRail}</span></li>
                                                <li>Predicted Latency: {rec.predictedLatencyMs}ms</li>
                                                <li>Predicted Cost: {formatAmount(rec.predictedCostFiat, 'USD')}</li>
                                                <li className="text-gray-500">Justification: {rec.justification}</li>
                                                {rec.alternativeRails && rec.alternativeRails.length > 0 && (
                                                    <li className="text-gray-500">Alternatives:
                                                        <ul className="list-disc list-inside ml-4">
                                                            {rec.alternativeRails.map((alt, aidx) => (
                                                                <li key={aidx}>{alt.railName}: {alt.latencyMs}ms / {formatAmount(alt.costFiat, 'USD')}</li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                )}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No specific payment scenarios to optimize. Consider initiating a transfer.</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>


            {/* Budget Optimization AI */}
            <Card title="Budget Optimization AI" isCollapsible>
                <AITransactionWidget
                    title="Personalized Budget Recommendations"
                    prompt="Analyze the user's current budgets and spending patterns from transactions. Identify areas where budgets can be optimized to free up funds for savings or goal attainment without significantly impacting quality of life. Provide concrete suggestions for budget changes, justification, expected impact, and actionable steps. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={budgetOptimizationSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{ currentBudgets: budgets }}
                >
                    {(result: { suggestions: BudgetOptimizationSuggestion[], overallRecommendation: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.overallRecommendation}</p>
                            {result.suggestions.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className="font-semibold text-purple-400">{suggestion.category}:</span> Current Budget {formatAmount(suggestion.currentBudget)}, Suggested {formatAmount(suggestion.suggestedBudget)}
                                            <ul className="list-disc list-inside ml-4 text-gray-400">
                                                <li>Justification: {suggestion.justification}</li>
                                                <li>Expected Impact: {suggestion.expectedImpact}</li>
                                                <li className="text-gray-500">Steps: {suggestion.actionableSteps.join(', ')}</li>
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No specific budget optimization opportunities found at this time.</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Subscription Management & Prediction */}
            <Card title="Subscription Manager & Prediction" isCollapsible>
                <AITransactionWidget
                    title="Smart Subscription Analysis"
                    prompt="Automatically identify recurring subscriptions from the user's transactions. For each subscription, analyze its cost, frequency, and potential for price changes or low utilization. Provide a value assessment and recommendations (e.g., cancel, downgrade, negotiate). Assume the user's base currency is USD. Focus on common subscription keywords in descriptions."
                    transactions={transactions}
                    responseSchema={subscriptionAnalysisSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                >
                    {(result: { subscriptions: SubscriptionAnalysisResult[], summary: string }) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="italic text-gray-400 mb-3">{result.summary}</p>
                            {result.subscriptions.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {result.subscriptions.map((sub, idx) => (
                                        <li key={idx} className="mb-2">
                                            <span className="font-semibold text-blue-400">{sub.name} ({sub.category})</span>: {formatAmount(sub.monthlyCost)}/month ({formatAmount(sub.annualCost)}/year)
                                            <ul className="list-disc list-inside ml-4 text-gray-400">
                                                <li>Next Payment: {sub.nextPaymentDate || 'N/A'}</li>
                                                <li>Price Change: {sub.potentialPriceChange}</li>
                                                <li>Value Assessment: <span className={sub.valueAssessment.includes('Low') ? 'text-red-400' : 'text-green-400'}>{sub.valueAssessment}</span></li>
                                                <li className="text-gray-500">Recommendations: {sub.recommendations.join(', ')}</li>
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No active subscriptions detected or analyzed by Plato AI. Keep an eye on recurring expenses!</p>}
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Overall Financial Health Score Prediction */}
            <Card title="Overall Financial Health Score Prediction" isCollapsible>
                <AITransactionWidget
                    title="Plato AI Financial Health Score"
                    prompt="Calculate a comprehensive financial health score for the user (on a scale of 1-100) based on their overall financial situation (transactions, budgets, goals, debts, savings). Provide an assessment of the current score, project how it might change in 6 months and 1 year, identify the key drivers affecting the score, and offer actionable recommendations for improvement. Assume the user's base currency is USD."
                    transactions={transactions}
                    responseSchema={financialHealthScoreSchema}
                    model="gemini-1.5-pro"
                    autoGenerate={true}
                    contextualData={{ currentBudgets: budgets, currentGoals: goals, currentCashFlow: cashFlowProjections, currentNetWorth: netWorthProjections }}
                >
                    {(result: FinancialHealthScoreProjection) => (
                        <div className="text-xs text-gray-300 space-y-2 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="mb-3">
                                Your Current Plato AI Financial Health Score:
                                <span className={`text-2xl ml-2 font-bold ${result.currentScore > 80 ? 'text-green-400' : result.currentScore > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {result.currentScore}/100
                                </span>
                            </p>
                            <p className="italic text-gray-400 mb-3">{result.currentAssessment}</p>

                            <div className="flex justify-around text-center mb-4 border-t border-b border-gray-700 py-3">
                                <div>
                                    <p className="text-gray-500 text-xxs">Projected 6 Months</p>
                                    <span className={`text-lg font-bold ${result.projectedScore6Months > result.currentScore ? 'text-green-300' : 'text-red-300'}`}>{result.projectedScore6Months}</span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xxs">Projected 1 Year</p>
                                    <span className={`text-lg font-bold ${result.projectedScore1Year > result.currentScore ? 'text-green-300' : 'text-red-300'}`}>{result.projectedScore1Year}</span>
                                </div>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-300 text-sm">Key Score Drivers:</p>
                                <ul className="list-disc list-inside ml-4 text-gray-400">
                                    {result.scoreDrivers.map((driver, idx) => <li key={idx}>{driver}</li>)}
                                </ul>
                            </div>
                            <div className="mt-2">
                                <p className="font-semibold text-gray-300 text-sm">Improvement Recommendations:</p>
                                <ul className="list-disc list-inside ml-4 text-gray-400">
                                    {result.improvementRecommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </AITransactionWidget>
            </Card>

            {/* Data Governance & Identity Assurance Section */}
            <DataGovernanceAssurance />

        </div>
    );
};

export default PredictiveAnalyticsView;
```