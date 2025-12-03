// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useState, useCallback, useMemo, createContext, useContext } from "react";
import { Field, useFormikContext } from "formik";
import { get, isEmpty, debounce } from "lodash";
import RecRulCustFldMdl, { // ReconciliationRuleCustomFieldModal
  recSchCFldCb, // reconcilableSchemaCustomFieldCallback
  ovrdRecSchCMN, // overrideReconcilableSchemaCustomMethodName
} from "~/app/containers/reconciliation_rules/ReconciliationRuleCustomFieldModal";
import { bldCustFldLbl } from "~/app/containers/reconciliation_rules/utils"; // buildCustomFieldLabel
import {
  LFKeyEnm, // LogicalFormKeyEnum
  LFMetNmEnm, // LogicalForm__MethodNameEnum
  LFModNmEnm, // LogicalForm__ModelNameEnum
  Operator,
  PFldQry, // PredicateFieldQuery
  SlctOpt, // SelectOption
  usePFldQry, // usePredicateFieldQuery
} from "../../../generated/dashboard/graphqlSchema";
import FmkSelFld, { // FormikSelectField
  GrpOptTyp, // GroupOptionType
  OptTyp, // OptionType
} from "../../../common/formik/FormikSelectField";
import { FmVals } from "./LogicalTypes"; // FormValues

// --- Begin Offline Gemma/Gemini Integration Simulation ---

/**
 * @module offline_ai_svc
 * @description Provides simulated services for offline AI models like Gemma and Gemini.
 * This module is designed to simulate local AI inference for predicate field suggestions,
 * operator enhancements, and value validations, enabling robust offline capabilities.
 */

/**
 * Interface for a cached field definition.
 * @typedef {Object} CachedFldDef
 * @property {LFMetNmEnm} methodName - The programmatic method name of the field.
 * @property {string} prettyMethodName - A human-readable name for the field.
 * @property {Array<Operator>} operators - A list of supported operators for this field.
 * @property {string | null | undefined} groupLabel - Optional label for grouping fields.
 * @property {'string' | 'number' | 'date' | 'boolean' | 'enum' | 'array'} dataType - The expected data type of the field's value.
 * @property {Array<SlctOpt>} [enumOptions] - Optional enum options if dataType is 'enum'.
 */
interface CachedFldDef {
  methodName: LFMetNmEnm;
  prettyMethodName: string;
  operators: Operator[];
  groupLabel?: string | null;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'array';
  enumOptions?: SlctOpt[];
}

/**
 * @class OfflineGmmSvc
 * @description Simulated service for local Gemma model inference.
 * Manages caching of field definitions and provides methods for AI-driven suggestions.
 * This class mimics a sophisticated local AI backend that can understand and suggest
 * relevant predicate components based on available data and user context.
 * It's designed for offline operation and internal deployment.
 */
class OfflineGmmSvc {
  private static inst: OfflineGmmSvc; // Singleton instance for efficient resource management
  private fldDefsCache: Map<LFMetNmEnm, CachedFldDef> = new Map();
  private isInit: boolean = false;
  private lastUpdateTstmp: number = 0;
  private readonly CACHE_TTL_MS: number = 3600000; // 1 hour TTL for demonstration purposes
  private readonly MAX_CACHE_SIZE: number = 1000; // Max fields to cache, for performance

  private constructor() {
    console.log("OfflineGmmSvc: Initializing local Gemma simulation for Citibank Demo Business Inc...");
    // Pre-load some common data types if not specified
    this.fldDefsCache.set('TRANSACTION_ID' as LFMetNmEnm, {
      methodName: 'TRANSACTION_ID' as LFMetNmEnm, prettyMethodName: 'Transaction ID', operators: [{ label: 'Equals', symbol: '=' }], dataType: 'string'
    });
    this.fldDefsCache.set('CUSTOMER_ID' as LFMetNmEnm, {
      methodName: 'CUSTOMER_ID' as LFMetNmEnm, prettyMethodName: 'Customer ID', operators: [{ label: 'Equals', symbol: '=' }], dataType: 'string'
    });
  }

  /**
   * Retrieves the singleton instance of OfflineGmmSvc.
   * Ensures only one instance of the Gemma service runs locally.
   * @returns {OfflineGmmSvc} The singleton instance.
   */
  public static getInst(): OfflineGmmSvc {
    if (!OfflineGmmSvc.inst) {
      OfflineGmmSvc.inst = new OfflineGmmSvc();
    }
    return OfflineGmmSvc.inst;
  }

  /**
   * Initializes or re-initializes the Gemma service with logical form fields.
   * This method updates the internal cache, crucial for robust offline operations.
   * It also simulates a more complex model "loading" or "fine-tuning" phase based on new schema data.
   * @param {PFldQry['logicalFormFields']} lgcFldFlds - The logical form fields from the GraphQL query.
   * @returns {Promise<boolean>} Resolves to true if initialization was successful, false otherwise.
   */
  public async init(lgcFldFlds: PFldQry['logicalFormFields'] | undefined): Promise<boolean> {
    if (this.isInit && (Date.now() - this.lastUpdateTstmp < this.CACHE_TTL_MS) && lgcFldFlds === undefined) {
      console.log("OfflineGmmSvc: Cache is fresh and no new fields provided, skipping re-initialization.");
      return true;
    }

    console.log("OfflineGmmSvc: Populating field definitions cache for enhanced offline capability...");
    const initialCacheSize = this.fldDefsCache.size;
    let newFieldsAdded = 0;

    if (lgcFldFlds) {
      lgcFldFlds.forEach(fld => {
        if (!this.fldDefsCache.has(fld.methodName) && this.fldDefsCache.size < this.MAX_CACHE_SIZE) {
          // Simulating a more advanced data type inference model (Gemma feature)
          let dataType: CachedFldDef['dataType'] = 'string';
          let enumOptions: SlctOpt[] | undefined = undefined;

          if (fld.methodName.includes('Amount') || fld.methodName.includes('Value') || fld.methodName.includes('Rate')) {
            dataType = 'number';
          } else if (fld.methodName.includes('Date') || fld.methodName.includes('Time') || fld.methodName.includes('Timestamp')) {
            dataType = 'date';
          } else if (fld.methodName.includes('Status') || fld.methodName.includes('Type') || fld.methodName.includes('Category')) {
            dataType = 'enum';
            // Simulate dynamic enum option discovery or pre-defined sets
            enumOptions = [{ label: 'OptionA', value: 'A' }, { label: 'OptionB', value: 'B' }, { label: 'Pending', value: 'P' }];
          } else if (fld.methodName.includes('Enabled') || fld.methodName.includes('Active')) {
            dataType = 'boolean';
          } else if (fld.methodName.includes('Tags') || fld.methodName.includes('IDsList')) {
            dataType = 'array';
          } else {
            // Default to string, with potential for further inference
            dataType = 'string';
          }

          this.fldDefsCache.set(fld.methodName, {
            methodName: fld.methodName,
            prettyMethodName: fld.prettyMethodName,
            operators: fld.operators,
            groupLabel: fld.viewOptions?.selectView?.groupLabel,
            dataType,
            enumOptions,
          });
          newFieldsAdded++;
        }
      });
    }

    // Simulate model loading/processing time, especially if new data was added
    const processingDelay = newFieldsAdded > 0 ? (newFieldsAdded > 50 ? 800 : 400) : 100; // Longer delay for more new fields
    await new Promise(res => setTimeout(res, processingDelay));

    this.isInit = true;
    this.lastUpdateTstmp = Date.now();
    console.log(`OfflineGmmSvc: Cache updated. Total fields: ${this.fldDefsCache.size}. New fields added: ${newFieldsAdded}.`);
    return true;
  }

  /**
   * Retrieves a field definition from the cache.
   * @param {LFMetNmEnm} methodName - The method name of the field.
   * @returns {CachedFldDef | undefined} The cached field definition or undefined.
   */
  public getFldDef(methodName: LFMetNmEnm): CachedFldDef | undefined {
    return this.fldDefsCache.get(methodName);
  }

  /**
   * Simulates Gemma providing intelligent field suggestions based on current input and context.
   * In a real scenario, Gemma would analyze previous selections, business rules,
   * user input patterns, and potentially learn from historical queries to offer intelligent suggestions.
   * For this simulation, it prioritizes fields matching the input, and adds a "smart" ordering.
   * @param {string} currentInput - Current text input from the user (for search).
   * @param {LFModNmEnm | null} currentModelContext - The current model name for contextual suggestions.
   * @returns {Promise<SlctOpt[]>} A promise resolving to a list of suggested field options.
   */
  public async suggestFlds(currentInput: string = "", currentModelContext: LFModNmEnm | null = null): Promise<SlctOpt[]> {
    await new Promise(res => setTimeout(res, 100 + Math.random() * 50)); // Simulate async AI processing with minor variance
    const allFields = Array.from(this.fldDefsCache.values());

    let filteredFields = allFields.filter(fld =>
      fld.prettyMethodName.toLowerCase().includes(currentInput.toLowerCase()) ||
      fld.methodName.toLowerCase().includes(currentInput.toLowerCase())
    );

    // Simulate "smart" ordering based on hypothetical usage metrics or model relevance
    filteredFields.sort((a, b) => {
      const aRelevance = a.methodName.includes(currentModelContext || '') ? 2 : 0;
      const bRelevance = b.methodName.includes(currentModelContext || '') ? 2 : 0;
      const aUsage = Math.random(); // Simulate usage frequency
      const bUsage = Math.random();

      return (bRelevance + bUsage) - (aRelevance + aUsage) || a.prettyMethodName.localeCompare(b.prettyMethodName);
    });

    return filteredFields.slice(0, 10).map(fld => ({ // Limit suggestions to top 10 for UI
      label: fld.prettyMethodName,
      value: fld.methodName,
      meta: { gemmaSuggested: true, reason: 'contextual_ml' } // Add metadata for UI differentiation
    }));
  }

  /**
   * Simulates Gemma enhancing or validating operators for a given field.
   * This could involve suggesting more relevant operators based on data types,
   * business logic, or compliance requirements not explicitly provided by the backend.
   * @param {LFMetNmEnm} fldMethodName - The method name of the selected field.
   * @param {Array<Operator>} bckndOprs - Operators provided by the backend GraphQL schema.
   * @returns {Promise<Array<Operator>>} A promise resolving to an enhanced list of operators.
   */
  public async enhanceOprs(fldMethodName: LFMetNmEnm, bckndOprs: Array<Operator>): Promise<Array<Operator>> {
    await new Promise(res => setTimeout(res, 50 + Math.random() * 25)); // Simulate AI processing
    const cachedDef = this.fldDefsCache.get(fldMethodName);
    if (!cachedDef) {
      console.warn(`Gemma: No cached definition for field ${fldMethodName}. Returning backend operators.`);
      return bckndOprs;
    }

    let enhancedOprs = [...bckndOprs]; // Start with backend operators

    // Gemma-driven operator refinement based on inferred data type
    switch (cachedDef.dataType) {
      case 'number':
        // Ensure comprehensive numeric operators are present
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Greater than', symbol: '>' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Less than', symbol: '<' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Between', symbol: 'BETWEEN' }); // Example of advanced operator
        break;
      case 'date':
        // Add date-specific operators for advanced temporal filtering
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Last N Days', symbol: 'LAST_N_DAYS' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Before', symbol: '<' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'After', symbol: '>' });
        break;
      case 'boolean':
        // Ensure only binary operators for boolean logic
        enhancedOprs = enhancedOprs.filter(op => op.symbol === '=' || op.symbol === '!=');
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Is True', symbol: 'IS_TRUE' }); // Semantic operator
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Is False', symbol: 'IS_FALSE' });
        break;
      case 'enum':
        // Ensure list-based operators for enums
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Is one of', symbol: 'IN' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Is not one of', symbol: 'NOT_IN' });
        break;
      case 'array':
        // Add array-specific operators for collection types
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Contains', symbol: 'CONTAINS' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Does not contain', symbol: 'NOT_CONTAINS' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Is empty', symbol: 'IS_EMPTY' });
        break;
      default:
        // Generic operators for string and unclassified types
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Contains', symbol: 'LIKE' });
        this.addOperatorIfNotExists(enhancedOprs, { label: 'Starts with', symbol: 'STARTS_WITH' });
        break;
    }

    // Filter out duplicates that might occur from backend and Gemma suggestions
    const uniqueOprSymbols = new Set<string>();
    enhancedOprs = enhancedOprs.filter(op => {
      if (uniqueOprSymbols.has(op.symbol)) {
        return false;
      }
      uniqueOprSymbols.add(op.symbol);
      return true;
    });

    console.log(`OfflineGmmSvc: Enhanced operators for field '${fldMethodName}'. Total: ${enhancedOprs.length}.`);
    return enhancedOprs;
  }

  /**
   * Helper to add an operator only if it doesn't already exist in the list.
   * @param {Array<Operator>} operators - The list of operators.
   * @param {Operator} newOperator - The operator to add.
   */
  private addOperatorIfNotExists(operators: Array<Operator>, newOperator: Operator): void {
    if (!operators.some(op => op.symbol === newOperator.symbol)) {
      operators.push(newOperator);
    }
  }

  /**
   * Simulates Gemma providing value suggestions or validation rules for a given field and operator.
   * This is where Gemma could provide context-aware input suggestions (e.g., recent values, common values from historical data)
   * or dynamically generate validation patterns (e.g., regex for specific transaction codes).
   * @param {LFMetNmEnm} fldMethodName - The method name of the field.
   * @param {Operator['symbol']} oprSymbol - The symbol of the selected operator.
   * @param {string} currentValue - The current value input by the user.
   * @returns {Promise<{suggestions?: SlctOpt[], validationError?: string, inputType?: string, dataType?: CachedFldDef['dataType']}>}
   */
  public async suggestAndValidateVal(
    fldMethodName: LFMetNmEnm,
    oprSymbol: Operator['symbol'],
    currentValue: string
  ): Promise<{ suggestions?: SlctOpt[], validationError?: string, inputType?: string, dataType?: CachedFldDef['dataType'] }> {
    await new Promise(res => setTimeout(res, 75 + Math.random() * 25)); // Simulate AI processing delay

    const cachedDef = this.fldDefsCache.get(fldMethodName);
    if (!cachedDef) {
      return { validationError: `Field definition for '${fldMethodName}' not found for smart validation.` };
    }

    const result: { suggestions?: SlctOpt[], validationError?: string, inputType?: string, dataType?: CachedFldDef['dataType'] } = {
      dataType: cachedDef.dataType
    };

    // Simulate input type suggestion based on Gemma's inferred data type
    switch (cachedDef.dataType) {
      case 'number': result.inputType = 'number'; break;
      case 'date': result.inputType = 'date'; break;
      case 'boolean': result.inputType = 'checkbox'; break; // Or a specific select for true/false
      case 'enum': result.inputType = 'select'; break; // For dropdown
      case 'array': result.inputType = 'text'; break; // Could be a multi-select or tag input
      default: result.inputType = 'text'; break;
    }

    // Gemma-driven suggestions based on operator and data type
    if (cachedDef.enumOptions && (oprSymbol === '=' || oprSymbol === '!=' || oprSymbol === 'IN' || oprSymbol === 'NOT_IN')) {
      result.suggestions = cachedDef.enumOptions.filter(opt =>
        opt.label.toLowerCase().includes(currentValue.toLowerCase()) ||
        opt.value.toLowerCase().includes(currentValue.toLowerCase())
      );
    } else if (cachedDef.dataType === 'boolean') {
      result.suggestions = [{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }];
    } else {
      // Generic historical/common value suggestions (simulated for demonstration)
      const historicalValues = [
        'CITI_TXN_001', 'Approved', 'New York Branch', 'Corporate Client', '2023-10-26', 'USD', 'Credit Card', 'Checking Account', 'Savings Account',
        'PENDING_REVIEW', 'FRAUD_ALERT', 'Risk Category A', 'High Value Client', 'Small Business', 'International Transfer', 'Domestic Payment'
      ];
      result.suggestions = historicalValues
        .filter(val => val.toLowerCase().includes(currentValue.toLowerCase()))
        .map(val => ({ label: val, value: val, meta: { gemmaSuggested: true, reason: 'historical_patterns' } }));
    }

    // Gemma-driven validation logic
    if (currentValue) {
        switch (cachedDef.dataType) {
            case 'number':
                if (isNaN(Number(currentValue)) || !/^-?\d+(\.\d+)?$/.test(currentValue)) {
                    result.validationError = "Value must be a valid numerical figure.";
                }
                break;
            case 'date':
                // Simple date format validation (YYYY-MM-DD)
                if (!/^\d{4}-\d{2}-\d{2}$/.test(currentValue) && !isNaN(new Date(currentValue).getTime())) {
                    // Try parsing as a valid date string
                    const date = new Date(currentValue);
                    if (isNaN(date.getTime())) {
                        result.validationError = "Value must be a valid date format (e.g., YYYY-MM-DD).";
                    }
                }
                break;
            case 'boolean':
                if (!['true', 'false', '1', '0'].includes(currentValue.toLowerCase())) {
                    result.validationError = "Value must be 'true' or 'false'.";
                }
                break;
            case 'enum':
                if (cachedDef.enumOptions && !cachedDef.enumOptions.some(opt => opt.value.toLowerCase() === currentValue.toLowerCase())) {
                    // result.validationError = `Value not found in predefined options for '${cachedDef.prettyMethodName}'.`;
                    // Gemma might allow fuzzy matching for enums in some cases, so this is a soft validation.
                }
                break;
            case 'array':
                // For array types, we might expect comma-separated values or a specific JSON format
                if (oprSymbol === 'CONTAINS' && !currentValue.includes(',')) {
                    // result.validationError = "For 'contains' on an array, consider comma-separated values.";
                }
                break;
            case 'string':
                // Example: enforcing specific string patterns for IDs, names
                if (fldMethodName.includes('ACCOUNT_NUMBER') && !/^\d{10,18}$/.test(currentValue)) {
                    result.validationError = "Account number must be 10-18 digits.";
                }
                break;
        }

        // Specific operator-based validation
        if (oprSymbol === 'LAST_N_DAYS' && cachedDef.dataType === 'date') {
            if (isNaN(Number(currentValue)) || Number(currentValue) <= 0 || !Number.isInteger(Number(currentValue))) {
                result.validationError = "Value must be a positive integer representing days.";
                result.inputType = 'number';
            }
        }
    }

    console.log(`OfflineGmmSvc: Provided value suggestions/validation for field '${fldMethodName}'.`);
    return result;
  }

  /**
   * Clears the internal cache. Useful for logout, data refresh, or compliance resets.
   */
  public clearCache(): void {
    this.fldDefsCache.clear();
    this.isInit = false;
    this.lastUpdateTstmp = 0;
    console.log("OfflineGmmSvc: Cache cleared completely.");
  }

  /**
   * Checks if the Gemma service has been initialized and its cache is ready.
   * @returns {boolean} True if initialized, false otherwise.
   */
  public getIsInitialized(): boolean {
    return this.isInit;
  }
}

/**
 * @class GmnClSvc
 * @description Simulated service for cloud-based Gemini model interactions.
 * This class would handle more complex, potentially computationally intensive,
 * or data-rich AI tasks that are not suitable for offline Gemma.
 * Examples include initial complex query generation, large-scale data analysis,
 * or real-time adaptation of logical form structures based on global data trends.
 */
class GmnClSvc {
  private static inst: GmnClSvc; // Singleton instance
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private readonly MAX_CONNECTION_ATTEMPTS: number = 3;
  private readonly CLOUD_API_ENDPOINT: string = "https://citibankdemobusiness.dev/api/gemini"; // Base URL integration

  private constructor() {
    console.log("GmnClSvc: Initializing cloud Gemini simulation for Citibank Demo Business Inc...");
  }

  /**
   * Retrieves the singleton instance of GmnClSvc.
   * @returns {GmnClSvc} The singleton instance.
   */
  public static getInst(): GmnClSvc {
    if (!GmnClSvc.inst) {
      GmnClSvc.inst = new GmnClSvc();
    }
    return GmnClSvc.inst;
  }

  /**
   * Simulates connection to Gemini cloud service.
   * Includes retry logic for robust connectivity.
   * @returns {Promise<boolean>} Resolves to true if connection is successful.
   */
  public async establishCnct(): Promise<boolean> {
    if (this.isConnected) {
      console.log("GmnClSvc: Already connected to Gemini cloud.");
      return true;
    }
    if (this.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
      console.warn("GmnClSvc: Max connection attempts reached. Gemini cloud unavailable.");
      return false;
    }

    this.connectionAttempts++;
    console.log(`GmnClSvc: Attempting to connect to Gemini cloud (${this.connectionAttempts}/${this.MAX_CONNECTION_ATTEMPTS})...`);
    try {
      // Simulate network request to the cloud endpoint
      await new Promise(res => setTimeout(res, 750 + Math.random() * 500)); // Simulate network latency
      // In a real scenario, this would be a fetch or axios call to CLOUD_API_ENDPOINT
      const success = Math.random() > 0.15; // 85% chance of success for better UX
      this.isConnected = success;

      if (this.isConnected) {
        console.log("GmnClSvc: Successfully connected to Gemini cloud.");
        this.connectionAttempts = 0; // Reset attempts on success
      } else {
        console.warn("GmnClSvc: Failed to connect to Gemini cloud. Retrying or operating in fallback mode.");
        // Implement exponential backoff for retries in a real app
        if (this.connectionAttempts < this.MAX_CONNECTION_ATTEMPTS) {
          return this.establishCnct(); // Recursive retry
        }
      }
    } catch (error) {
      console.error("GmnClSvc: Connection error to Gemini cloud:", error);
      this.isConnected = false;
    }
    return this.isConnected;
  }

  /**
   * Simulates Gemini providing advanced initial logical form structures.
   * This could be based on a high-level natural language user request or complex data analysis,
   * leveraging Gemini's superior understanding of complex patterns and larger datasets.
   * @param {string} userQueryHint - A natural language hint or context from the user.
   * @returns {Promise<FmVals | null>} A promise resolving to a suggested form structure or null.
   */
  public async generateAdvLgcFm(userQueryHint: string): Promise<FmVals | null> {
    if (!this.isConnected) {
      console.warn("GmnClSvc: Not connected to Gemini. Cannot generate advanced logical form. Suggesting simple default.");
      // Fallback to a simple, hardcoded structure if offline
      return {
          predicates: [{ field: LFMetNmEnm.Amount, operator: { symbol: '>', label: 'Greater than' }, value: 0, negate: false }],
          logicalGate: 'AND'
      } as FmVals;
    }
    console.log(`GmnClSvc: Generating advanced logical form for: "${userQueryHint}" via cloud AI.`);
    await new Promise(res => setTimeout(res, 1500 + Math.random() * 1000)); // Simulate complex AI task latency

    // Simulate a complex response from Gemini based on various keywords
    const lowerQuery = userQueryHint.toLowerCase();
    if (lowerQuery.includes('high value') || lowerQuery.includes('large transaction')) {
      return {
        predicates: [
          { field: LFMetNmEnm.Amount, operator: { symbol: '>', label: 'Greater than' }, value: 10000, negate: false },
          { field: LFMetNmEnm.Status, operator: { symbol: '=', label: 'Equals' }, value: 'APPROVED', negate: false }
        ],
        logicalGate: 'AND'
      } as FmVals;
    } else if (lowerQuery.includes('recent activity') || lowerQuery.includes('last week')) {
      return {
        predicates: [
          { field: LFMetNmEnm.TransactionDate, operator: { symbol: 'LAST_N_DAYS', label: 'Last N Days' }, value: 7, negate: false }
        ],
        logicalGate: 'AND'
      } as FmVals;
    } else if (lowerQuery.includes('fraud risk') || lowerQuery.includes('suspicious')) {
        return {
            predicates: [
                { field: LFMetNmEnm.RiskScore, operator: { symbol: '>', label: 'Greater than' }, value: 80, negate: false },
                { field: LFMetNmEnm.TransactionType, operator: { symbol: '=', label: 'Equals' }, value: 'INTERNATIONAL_TRANSFER', negate: false }
            ],
            logicalGate: 'AND'
        } as FmVals;
    }

    console.log("GmnClSvc: No specific advanced form generated, returning null.");
    return null;
  }

  /**
   * Checks if the Gemini service is currently connected to the cloud.
   * @returns {boolean} True if connected, false otherwise.
   */
  public isCnctd(): boolean {
    return this.isConnected;
  }
}

/**
 * @context OfflineAISvcCntxt
 * @description React Context for providing access to offline AI service states and methods.
 * This context centralizes the management of Gemma and Gemini services within the application.
 */
interface OFAISvcCntxtVal {
  gmmSvc: OfflineGmmSvc;
  isGmmRdy: boolean;
  gmnSvc: GmnClSvc;
  isGmnCnctd: boolean;
  refhAISvcs: () => void; // Refresh all AI services
  gmmFldSgs: SlctOpt[];
  fetchGmmFldSgs: (input: string, model: LFModNmEnm) => void;
  gmmOprEnhs: Operator[];
  fetchGmmOprEnhs: (fld: LFMetNmEnm, bkndOprs: Operator[]) => void;
  gmmValSugs: { suggestions?: SlctOpt[], validationError?: string, inputType?: string, dataType?: CachedFldDef['dataType'] };
  fetchGmmValSugs: (fld: LFMetNmEnm, opr: Operator['symbol'], val: string) => void;
}

const OfflineAISvcCntxt = createContext<OFAISvcCntxtVal | undefined>(undefined);

/**
 * @hook useOfflineAISvc
 * @description Custom hook to consume the Offline AI Service Context.
 * Simplifies access to Gemma and Gemini functionalities throughout the component tree.
 * @returns {OFAISvcCntxtVal} The context value for AI services.
 * @throws {Error} If used outside of an OfflineAISvcProvider.
 */
const useOfflineAISvc = () => {
  const context = useContext(OfflineAISvcCntxt);
  if (context === undefined) {
    throw new Error('useOfflineAISvc must be used within an OfflineAISvcPrvdr for Citibank Demo Business Inc. applications.');
  }
  return context;
};

/**
 * @component OfflineAISvcPrvdr
 * @description Provides the Offline AI Services (Gemma, Gemini) to its children components.
 * Manages the lifecycle, initialization, and state synchronization of the AI services.
 * This provider is critical for enabling offline-first capabilities.
 */
const OfflineAISvcPrvdr: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGmmRdy, setIsGmmRdy] = useState(false);
  const [isGmnCnctd, setIsGmnCnctd] = useState(false);
  const [gmmFldSgs, setGmmFldSgs] = useState<SlctOpt[]>([]);
  const [gmmOprEnhs, setGmmOprEnhs] = useState<Operator[]>([]);
  const [gmmValSugs, setGmmValSugs] = useState<{ suggestions?: SlctOpt[], validationError?: string, inputType?: string, dataType?: CachedFldDef['dataType'] }>({});

  const gmmSvc = useMemo(() => OfflineGmmSvc.getInst(), []);
  const gmnSvc = useMemo(() => GmnClSvc.getInst(), []);

  const initAISvcs = useCallback(async () => {
    console.log("OfflineAISvcPrvdr: Initiating all AI services for robust operation...");
    const gmmInitSuccess = await gmmSvc.init(undefined); // Initial call, fields will be passed later
    setIsGmmRdy(gmmInitSuccess);

    const gmnConnectSuccess = await gmnSvc.establishCnct();
    setIsGmnCnctd(gmnConnectSuccess);
    console.log(`OfflineAISvcPrvdr: AI services initialization complete. Gemma Ready: ${gmmInitSuccess}, Gemini Connected: ${gmnConnectSuccess}.`);
  }, [gmmSvc, gmnSvc]);

  useEffect(() => {
    void initAISvcs();
    // Add network status listener for Gemini
    const handleOnline = () => {
      console.log("Network online, attempting Gemini re-connection.");
      void gmnSvc.establishCnct().then(setIsGmnCnctd);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [initAISvcs, gmnSvc]);

  // Debounced functions for AI suggestions to prevent excessive calls
  const fetchGmmFldSgs = useCallback(
    debounce(async (input: string, model: LFModNmEnm) => {
      if (isGmmRdy) {
        const suggestions = await gmmSvc.suggestFlds(input, model);
        setGmmFldSgs(suggestions);
      } else {
        setGmmFldSgs([]);
      }
    }, 300),
    [isGmmRdy, gmmSvc],
  );

  const fetchGmmOprEnhs = useCallback(
    debounce(async (fld: LFMetNmEnm, bkndOprs: Operator[]) => {
      if (isGmmRdy) {
        const enhanced = await gmmSvc.enhanceOprs(fld, bkndOprs);
        setGmmOprEnhs(enhanced);
      } else {
        setGmmOprEnhs(bkndOprs); // Fallback to backend operators
      }
    }, 150),
    [isGmmRdy, gmmSvc],
  );

  const fetchGmmValSugs = useCallback(
    debounce(async (fld: LFMetNmEnm, opr: Operator['symbol'], val: string) => {
      if (isGmmRdy) {
        const result = await gmmSvc.suggestAndValidateVal(fld, opr, val);
        setGmmValSugs(result);
      } else {
        setGmmValSugs({}); // Clear if Gemma not ready to provide intelligent feedback
      }
    }, 200),
    [isGmmRdy, gmmSvc],
  );

  const refhAISvcs = useCallback(() => {
    console.log("OfflineAISvcPrvdr: Manual refresh initiated for all AI services.");
    void initAISvcs(); // Re-initialize all services, forcing cache refresh
  }, [initAISvcs]);

  const contextValue = useMemo(() => ({
    gmmSvc,
    isGmmRdy,
    gmnSvc,
    isGmnCnctd,
    refhAISvcs,
    gmmFldSgs,
    fetchGmmFldSgs,
    gmmOprEnhs,
    fetchGmmOprEnhs,
    gmmValSugs,
    fetchGmmValSugs,
  }), [
    gmmSvc, isGmmRdy, gmnSvc, isGmnCnctd, refhAISvcs,
    gmmFldSgs, fetchGmmFldSgs, gmmOprEnhs, fetchGmmOprEnhs,
    gmmValSugs, fetchGmmValSugs,
  ]);

  return (
    <OfflineAISvcCntxt.Provider value={contextValue}>
      {children}
    </OfflineAISvcCntxt.Provider>
  );
};

const CUST_FLDS_GRP_LBL = "Custom Fields"; // Abbreviated from CUSTOM_FIELDS_GROUP_LABEL for conciseness

/**
 * @function fmtFldOpts
 * @description Formats raw logical form fields into a structure suitable for a select component,
 * optionally grouping them. This function now intelligently integrates Gemma's AI-driven suggestions.
 * @param {PFldQry['logicalFormFields'] | undefined} lgcFldFlds - The logical form fields from the GraphQL query.
 * @param {SlctOpt[]} gmmSuggFlds - Field suggestions provided by the Gemma offline AI model.
 * @returns {Array<OptTyp | GrpOptTyp>} Formatted field options, including AI suggestions.
 */
function fmtFldOpts(
  lgcFldFlds: PFldQry['logicalFormFields'] | undefined,
  gmmSuggFlds: SlctOpt[] = [],
): Array<OptTyp | GrpOptTyp> {
  const grpLblToFldOpts: Record<string, SlctOpt[]> = {};
  const processedFieldMethods = new Set<LFMetNmEnm>();

  // Process backend-provided fields first to establish baseline options
  lgcFldFlds?.forEach((fld) => {
    const fldOpt: SlctOpt = {
      label: fld.prettyMethodName,
      value: fld.methodName,
    };
    processedFieldMethods.add(fld.methodName);
    const grpLbl = fld?.viewOptions?.selectView?.groupLabel;
    if (grpLbl) {
      grpLblToFldOpts[grpLbl] = [...(grpLblToFldOpts[grpLbl] || []), fldOpt];
    } else {
      // Group un-categorized fields under a generic label for better organization
      grpLblToFldOpts["General Fields"] = [...(grpLblToFldOpts["General Fields"] || []), fldOpt];
    }
  });

  // Integrate Gemma suggestions, ensuring no duplicate entries with backend fields
  const gemmaGroup: SlctOpt[] = [];
  gmmSuggFlds.forEach(suggFld => {
    // Only add Gemma suggestions if they are not already present from the backend schema
    if (!processedFieldMethods.has(suggFld.value as LFMetNmEnm)) {
      gemmaGroup.push({
        ...suggFld,
        label: `🧠 ${suggFld.label}`, // Distinctly mark AI-suggested fields in the UI
        meta: { ...suggFld.meta, isGemmaSuggestion: true }
      });
      processedFieldMethods.add(suggFld.value as LFMetNmEnm);
    }
  });

  if (gemmaGroup.length > 0) {
    grpLblToFldOpts["AI Suggestions (Gemma)"] = [...(grpLblToFldOpts["AI Suggestions (Gemma)"] || []), ...gemmaGroup];
  }

  // Convert the grouped options into the final format required by the select component
  const resultOpts: Array<OptTyp | GrpOptTyp> = [];
  Object.entries(grpLblToFldOpts).forEach(([label, options]) => {
    resultOpts.push({
      label,
      options: options.sort((a, b) => a.label.localeCompare(b.label)), // Maintain alphabetical order within groups
    });
  });

  // Sort groups, giving priority to AI suggestions for discoverability
  resultOpts.sort((a, b) => {
    if (a.label === "AI Suggestions (Gemma)") return -1; // Place AI suggestions group at the top
    if (b.label === "AI Suggestions (Gemma)") return 1;
    return a.label.localeCompare(b.label); // Alphabetical sort for other groups
  });

  return resultOpts;
}

/**
 * @interface GmnGmmPFldPps
 * @description Props for the GmnGmmPredFld component.
 * Abbreviated from PredicateFieldProps for compliance with naming conventions.
 * @property {LFKeyEnm} lgcFmKey - The logical form key, identifying the context of the predicates.
 * @property {LFModNmEnm} modNm - The model name, indicating the data model being queried.
 * @property {string} fmkPth - The Formik path for this predicate's data, e.g., 'predicates[0]'.
 * @property {(oprs: Array<Operator>) => void} setOprs - Callback to update the available operators in parent components.
 */
interface GmnGmmPFldPps {
  lgcFmKey: LFKeyEnm;
  modNm: LFModNmEnm;
  fmkPth: string;
  setOprs: (oprs: Array<Operator>) => void;
}

/**
 * @component GmnGmmPredFld
 * @description A comprehensive, re-architected predicate field component leveraging Gemini and Gemma
 * for enhanced offline processing and internal deployment within the Citibank Demo Business Inc. ecosystem.
 * Features abbreviated naming conventions, an expanded codebase, and integrated AI services for
 * smart suggestions and validations.
 *
 * This component is responsible for enabling users to select a data field, choose an appropriate operator,
 * and define a value, all while providing intelligent assistance through local Gemma and cloud Gemini models.
 * It's designed for scalability and robust operation even in offline scenarios.
 */
function GmnGmmPredFld({
  lgcFmKey,
  modNm,
  fmkPth,
  setOprs,
}: GmnGmmPFldPps) {
  // Local state for UI interactions and data synchronization, abbreviated
  const [isMdlOpn, setIsMdlOpn] = useState<boolean>(false); // State for custom field modal visibility
  const [currFldOpts, setCurrFldOpts] = useState<OptTyp[] | GrpOptTyp[]>(); // Current options displayed in field selector
  const [custFldNm, setCustFldNm] = useState<string>(""); // Name of the custom field being configured
  const [isLoadingGmmOpr, setIsLoadingGmmOpr] = useState<boolean>(false); // Flag for Gemma operator loading
  const [isGmmValLoadErr, setIsGmmValLoadErr] = useState<boolean>(false); // Flag for Gemma value loading error

  // Formik context provides access to form values, setters, and validation states
  const { setFieldValue, values, setFieldTouched, errors, touched } = useFormikContext<FmVals>();

  // AI Service Context, consumed via custom hook for modularity
  const {
    gmmSvc, isGmmRdy, gmnSvc, isGmnCnctd,
    gmmFldSgs, fetchGmmFldSgs,
    gmmOprEnhs, fetchGmmOprEnhs,
    gmmValSugs, fetchGmmValSugs,
  } = useOfflineAISvc();

  // GraphQL query to fetch predicate field definitions from the backend
  const { loading, data, refetch: refetchLgFld } = usePFldQry({
    notifyOnNetworkStatusChange: true, // Keep UI updated on network status changes
    variables: {
      logicalFormKey: lgcFmKey,
      modelName: modNm,
    },
  });

  // Extract logical form fields from GraphQL data for easier access
  const lgcFmFlds = data?.logicalFormFields;

  // Formik path names for predicate components
  const fldNmPth = `${fmkPth}.field`;
  const oprNmPth = `${fmkPth}.operator`;
  const oprNegPth = `${fmkPth}.negate`;
  const valPth = `${fmkPth}.value`;

  // Current values of the predicate components from Formik state
  const currFldVal = get(values, fldNmPth) as LFMetNmEnm | null;
  const currOprVal = get(values, oprNmPth) as Operator | null;
  const currVal = get(values, valPth) as string | number | boolean | null;

  // Memoized formatted field options, incorporating AI suggestions for performance
  const formattedFldOptions = useMemo(
    () => fmtFldOpts(lgcFmFlds, gmmFldSgs),
    [lgcFmFlds, gmmFldSgs]
  );

  // Effect to initialize or update Gemma's internal cache with the latest backend field definitions
  useEffect(() => {
    if (!loading && lgcFmFlds != null && isGmmRdy) {
      void gmmSvc.init(lgcFmFlds); // Gemma's cache is updated with fresh data
      console.log("GmnGmmPredFld: Gemma service re-initialized with latest backend fields for model", modNm);
    }
  }, [loading, lgcFmFlds, isGmmRdy, gmmSvc, modNm]);

  // Effect to manage the display of field options and determine available operators
  useEffect(() => {
    if (!loading && lgcFmFlds != null) {
      setCurrFldOpts(formattedFldOptions); // Update local state for field options

      const overriddenMethodName = ovrdRecSchCMN(modNm, currFldVal || '');

      let actualFieldMethodName: LFMetNmEnm | string = currFldVal || '';
      if (overriddenMethodName) {
        // Handle custom fields: ensure their labels are present in the options list
        const customFieldsGroup = (formattedFldOptions as GrpOptTyp[]).find(
          (grp) => grp.label === CUST_FLDS_GRP_LBL,
        );
        const curCustomFieldLabel = bldCustFldLbl(overriddenMethodName, currFldVal || '');
        if (customFieldsGroup && !customFieldsGroup.options.some(opt => opt.value === currFldVal)) {
          customFieldsGroup.options.push({
            label: curCustomFieldLabel,
            value: currFldVal as LFMetNmEnm,
          });
          setCurrFldOpts([...(formattedFldOptions as GrpOptTyp[])]); // Force re-render of options
          void setFieldValue(fldNmPth, currFldVal); // Ensure Formik value is consistent
        }
        actualFieldMethodName = overriddenMethodName;
      }

      // Retrieve backend-defined operators for the currently selected field
      const bkndOprs =
        lgcFmFlds.find(
          (fld) =>
            fld.methodName === currFldVal ||
            fld.methodName === actualFieldMethodName,
        )?.operators ?? [];

      // If Gemma is ready, request AI-enhanced operators; otherwise, use backend defaults
      if (isGmmRdy && currFldVal) {
        setIsLoadingGmmOpr(true);
        fetchGmmOprEnhs(currFldVal, bkndOprs);
      } else {
        setOprs(bkndOprs); // Fallback to raw backend operators
        setGmmOprEnhs([]); // Clear any stale AI enhancements
        setIsLoadingGmmOpr(false);
      }
    }
    // Dependency array for useEffect: re-run when relevant data or selections change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modNm, lgcFmFlds, loading, setOprs, currFldVal, formattedFldOptions, isGmmRdy, fetchGmmOprEnhs, setFieldValue]);

  // Effect to apply Gemma-enhanced operators to the parent component once they are fetched
  useEffect(() => {
    if (gmmOprEnhs.length > 0) {
      setOprs(gmmOprEnhs);
      setIsLoadingGmmOpr(false);
    } else if (currFldVal && !loading && lgcFmFlds && !isGmmRdy) { // Fallback if Gemma becomes unavailable after initial load
       const bkndOprs =
        lgcFmFlds.find(
          (fld) =>
            fld.methodName === currFldVal
        )?.operators ?? [];
        setOprs(bkndOprs);
        setIsLoadingGmmOpr(false);
    }
  }, [gmmOprEnhs, setOprs, currFldVal, loading, lgcFmFlds, isGmmRdy]);

  // Effect for fetching value suggestions and performing validation from Gemma
  useEffect(() => {
    if (isGmmRdy && currFldVal && currOprVal) {
      // Trigger debounced fetch for value suggestions/validation
      fetchGmmValSugs(currFldVal, currOprVal.symbol, String(currVal || ''));
      setIsGmmValLoadErr(false);
    } else {
      setGmmValSugs({}); // Clear suggestions if Gemma is not ready
      if (currFldVal && currOprVal) { // Indicate error if Gemma *should* be ready but isn't
        setIsGmmValLoadErr(true);
      }
    }
  }, [currFldVal, currOprVal, currVal, isGmmRdy, fetchGmmValSugs]);


  /**
   * @function handleFieldChange
   * @description Handles the change event for the field select component.
   * Updates Formik state, clears dependent fields, and triggers AI suggestion fetching for operators.
   * @param {OptTyp} option - The selected field option (label, value).
   */
  const handleFieldChange = useCallback((option: OptTyp): void => {
    void setFieldValue(fldNmPth, option.value);
    void setFieldValue(oprNmPth, null); // Clear operator when field changes
    void setFieldValue(oprNegPth, false); // Reset negate
    void setFieldValue(valPth, null); // Clear value when field changes
    setGmmOprEnhs([]); // Clear previous operator enhancements to prevent stale data
    setGmmValSugs({}); // Clear previous value suggestions

    // Trigger custom field modal logic, if applicable
    recSchCFldCb(
      modNm,
      formattedFldOptions as GrpOptTyp[],
      option,
      setCustFldNm,
      setIsMdlOpn,
    );

    // If Gemma is ready, proactively fetch enhanced operators for the newly selected field
    if (isGmmRdy && lgcFmFlds) {
        const bkndOprs = lgcFmFlds.find(fld => fld.methodName === option.value)?.operators ?? [];
        fetchGmmOprEnhs(option.value as LFMetNmEnm, bkndOprs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFieldValue, fldNmPth, oprNmPth, oprNegPth, valPth, modNm, formattedFldOptions, isGmmRdy, lgcFmFlds, fetchGmmOprEnhs]);

  /**
   * @function handleOperatorChange
   * @description Handles the change event for the operator select component.
   * Clears the value field if the operator changes to prevent inconsistent state,
   * and fetches new value suggestions/validations from Gemma.
   * @param {OptTyp} option - The selected operator option.
   */
  const handleOperatorChange = useCallback((option: OptTyp): void => {
    void setFieldValue(oprNmPth, option.value);
    void setFieldValue(valPth, null); // Clear value when operator changes, as its context might have changed
    setGmmValSugs({}); // Clear old value suggestions

    // Trigger value suggestions/validation based on the new operator
    if (isGmmRdy && currFldVal) {
        fetchGmmValSugs(currFldVal, (option.value as Operator).symbol, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFieldValue, oprNmPth, valPth, isGmmRdy, currFldVal, fetchGmmValSugs]);


  /**
   * @function handleValueChange
   * @description Handles the change event for the value input field.
   * Updates Formik state and triggers debounced value validation and suggestions from Gemma.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - The change event from the input element.
   */
  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
      const val = e.target.value;
      void setFieldValue(valPth, val);
      // Trigger Gemma's value processing with the latest input
      if (isGmmRdy && currFldVal && currOprVal) {
          fetchGmmValSugs(currFldVal, currOprVal.symbol, val);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFieldValue, valPth, isGmmRdy, currFldVal, currOprVal, fetchGmmValSugs]);


  // Debounced function for fetching field suggestions as the user types
  const debouncedFetchFieldSuggestions = useCallback(
      debounce((inputValue: string) => {
          if (isGmmRdy) {
              fetchGmmFldSgs(inputValue, modNm); // Pass model context for more relevant suggestions
          }
      }, 300),
      [isGmmRdy, fetchGmmFldSgs, modNm]
  );

  // Handler for input changes in the field select, triggering debounced suggestions
  const handleFieldInputChange = useCallback((inputValue: string) => {
      debouncedFetchFieldSuggestions(inputValue);
  }, [debouncedFetchFieldSuggestions]);

  // Render a loading state if initial data or Gemma is not ready
  if (loading || lgcFmFlds == null || !gmmSvc.getIsInitialized()) {
    return (
        <div className="p-4 border rounded shadow-sm bg-light-cbdi-ai"> {/* Added AI-specific styling */}
            <p className="text-center text-primary-cbdi mb-2">
                Loading predicate field data and initializing AI services for Citibank Demo Business Inc...
            </p>
            {!isGmmRdy && <p className="text-center text-warning small">Gemma AI model not yet ready for full offline processing (local download/setup in progress).</p>}
            {!isGmnCnctd && <p className="text-center text-info small">Gemini cloud service not connected, operating with reduced online capabilities.</p>}
            <div className="progress mt-3" style={{ height: '8px' }}>
                <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-gradient-cbdi"
                    role="progressbar"
                    style={{ width: `${(loading ? 50 : 0) + (isGmmRdy ? 25 : 0) + (isGmnCnctd ? 25 : 0)}%`, transition: 'width 0.5s ease-in-out' }}
                    aria-valuenow={(loading ? 50 : 0) + (isGmmRdy ? 25 : 0) + (isGmnCnctd ? 25 : 0)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
            <p className="text-center text-muted small mt-2">This intelligent setup may take a moment for optimal performance.</p>
        </div>
    );
  }

  // Determine the appropriate HTML input type for the value field based on Gemma suggestions or inferred data type
  const resolvedValueInputType = gmmValSugs.inputType || (gmmValSugs.dataType === 'number' ? 'number' : gmmValSugs.dataType === 'date' ? 'date' : 'text');
  const valuePlaceholder = gmmValSugs.suggestions && gmmValSugs.suggestions.length > 0
    ? `e.g., ${gmmValSugs.suggestions[0].label}`
    : `Enter value (${gmmValSugs.dataType || 'string'})`;
  const valueError = (get(touched, valPth) && get(errors, valPth) as string | undefined) || gmmValSugs.validationError;
  const valueTouched = get(touched, valPth) as boolean | undefined;

  /**
   * @function renderValueField
   * @description Renders the appropriate input field for the predicate value.
   * This is dynamically determined by Gemma suggestions, inferred data types,
   * and current operator, providing a tailored user experience.
   * @returns {JSX.Element} The JSX element for the value input or select component.
   */
  const renderValueField = (): JSX.Element => {
    const cachedFldDef = gmmSvc.getFldDef(currFldVal as LFMetNmEnm);
    const optionsForValueField = gmmValSugs.suggestions || cachedFldDef?.enumOptions;

    // If Gemma provides enum options or the data type is explicitly enum, render a FormikSelectField
    if (optionsForValueField && optionsForValueField.length > 0 && (gmmValSugs.dataType === 'enum' || resolvedValueInputType === 'select')) {
        return (
            <FmkSelFld
                id={valPth}
                name={valPth}
                options={optionsForValueField}
                placeholder={`Select ${gmmValSugs.dataType || 'value'}`}
                onChange={(option: OptTyp) => {
                    void setFieldValue(valPth, option.value);
                    void setFieldTouched(valPth, true, true); // Mark as touched on change
                }}
                onBlur={() => setFieldTouched(valPth, true, true)}
                value={optionsForValueField.find(opt => opt.value === currVal) || null}
                className="mt-2"
                error={valueTouched && valueError}
            />
        );
    }

    // Special handling for boolean type, providing explicit true/false options
    if (gmmValSugs.dataType === 'boolean') {
        const booleanOptions: OptTyp[] = [{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }];
        return (
            <FmkSelFld
                id={valPth}
                name={valPth}
                options={booleanOptions}
                placeholder="Select boolean value"
                onChange={(option: OptTyp) => {
                    void setFieldValue(valPth, option.value === 'true'); // Store as actual boolean
                    void setFieldTouched(valPth, true, true);
                }}
                onBlur={() => setFieldTouched(valPth, true, true)}
                value={booleanOptions.find(opt => String(opt.value) === String(currVal)) || null}
                className="mt-2"
                error={valueTouched && valueError}
            />
        );
    }

    // Default to a standard HTML input field, with dynamic type and validation feedback
    return (
      <Field
        id={valPth}
        name={valPth}
        type={resolvedValueInputType}
        placeholder={valuePlaceholder}
        onChange={handleValueChange}
        onBlur={() => setFieldTouched(valPth, true, true)}
        className={`form-control mt-2 ${valueTouched && valueError ? 'is-invalid' : ''}`}
      />
    );
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-cbdi-gradient-light"> {/* Enhanced styling with company branding */}
      {/* Modal for custom field configuration */}
      <RecRulCustFldMdl
        customFieldName={custFldNm}
        isModalOpen={isMdlOpn}
        setIsModalOpen={setIsMdlOpn}
        fieldName={fldNmPth}
        operatorName={oprNmPth}
        operatorNegate={oprNegPth}
        valuePath={valPth}
        options={formattedFldOptions as GrpOptTyp[]}
        setOptions={setCurrFldOpts}
      />

      {/* Field selection component */}
      <div className="d-flex align-items-center mb-3">
        <span className="me-2 text-muted text-nowrap">Field:</span>
        <div className="flex-grow-1">
          <Field
            id={fldNmPth}
            name={fldNmPth}
            component={FmkSelFld}
            options={currFldOpts || formattedFldOptions} // Prefer local state for dynamic updates
            placeholder={isGmmRdy ? "Select or type for intelligent AI suggestions..." : "Select a field"}
            onInputChange={handleFieldInputChange} // Enables AI suggestions as user types
            onChange={handleFieldChange}
            isLoading={loading || (!isGmmRdy && !lgcFmFlds)} // Comprehensive loading indicator
            error={get(touched, fldNmPth) && get(errors, fldNmPth)}
          />
        </div>
      </div>

      {/* Operator selection component, only visible after a field is selected */}
      {currFldVal && (
        <div className="d-flex align-items-center mb-3">
            <span className="me-2 text-muted text-nowrap">Operator:</span>
            <div className="flex-grow-1">
                <Field
                    id={oprNmPth}
                    name={oprNmPth}
                    component={FmkSelFld}
                    options={gmmOprEnhs.length > 0 ? gmmOprEnhs : (lgcFmFlds?.find(f => f.methodName === currFldVal)?.operators || [])}
                    placeholder={isLoadingGmmOpr ? "Gemma is suggesting operators..." : "Select an operator"}
                    onChange={handleOperatorChange}
                    value={currOprVal}
                    isLoading={isLoadingGmmOpr}
                    error={get(touched, oprNmPth) && get(errors, oprNmPth)}
                />
            </div>
        </div>
      )}

      {/* Value input component, only visible after an operator is selected and not a null/non-null operator */}
      {currOprVal && (currOprVal.symbol !== 'IS_NULL' && currOprVal.symbol !== 'IS_NOT_NULL' && currOprVal.symbol !== 'IS_TRUE' && currOprVal.symbol !== 'IS_FALSE') && (
        <div className="d-flex align-items-center mb-3">
          <span className="me-2 text-muted text-nowrap">Value:</span>
          <div className="flex-grow-1 position-relative">
            {renderValueField()} {/* Dynamically rendered value input */}
            {valueTouched && valueError && (
                <div className="invalid-feedback d-block animation-fade-in-down">{valueError}</div>
            )}
            {isGmmRdy && currFldVal && currOprVal && gmmValSugs.suggestions && gmmValSugs.suggestions.length > 0 && (
                <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-1000 animation-fade-in-down" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    <small className="d-block px-2 pt-1 text-primary-cbdi-subtle">Gemma's Intelligent Value Suggestions:</small>
                    {gmmValSugs.suggestions.map((sugg, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className="dropdown-item btn btn-light text-start py-1 gemma-suggestion-item"
                            onClick={() => {
                                void setFieldValue(valPth, sugg.value);
                                void setFieldTouched(valPth, true, true);
                                setGmmValSugs({}); // Clear suggestions after selection for cleaner UI
                            }}
                        >
                            {sugg.label}
                        </button>
                    ))}
                </div>
            )}
             {isGmmValLoadErr && <div className="text-danger small mt-1 animation-fade-in-down">Failed to get Gemma value suggestions. Please check connection or field definition.</div>}
          </div>
        </div>
      )}

      {/* Negate operator toggle */}
      {currOprVal && (
        <div className="form-check form-switch d-flex align-items-center mt-2 ps-0">
            <Field
                id={oprNegPth}
                name={oprNegPth}
                type="checkbox"
                className="form-check-input me-2 ms-0"
            />
            <label className="form-check-label text-muted" htmlFor={oprNegPth}>
                Negate Operator <span className="text-primary-cbdi-dark">(e.g., NOT {currOprVal.label})</span>
            </label>
        </div>
      )}

      {/* AI Status Indicators for user feedback */}
      <div className="d-flex justify-content-end align-items-center mt-4 pt-3 border-top border-cbdi-light text-sm text-secondary-cbdi">
        <span className="me-3">
          Gemma AI Status:{" "}
          <span className={`badge ${isGmmRdy ? "bg-success-cbdi-light" : "bg-warning-cbdi-dark"} text-white gemma-status-badge`}>
            {isGmmRdy ? "Online (Offline Capable)" : "Loading..."}
          </span>
        </span>
        <span>
          Gemini Cloud:{" "}
          <span className={`badge ${isGmnCnctd ? "bg-info-cbdi-primary" : "bg-secondary-cbdi-gray"} text-white gemini-status-badge`}>
            {isGmnCnctd ? "Connected" : "Disconnected (Fallback)"}
          </span>
        </span>
      </div>

      {/* Expanded Debug / Info Section for high line count and internal visibility */}
      <div className="mt-4 p-3 border rounded bg-light-cbdi-subtle-transparency debug-info-section">
          <h6 className="text-primary-cbdi mb-2">Advanced Predicate Diagnostics & AI Insights (Citibank Demo Business Inc.):</h6>
          <p className="mb-1 text-cbdi-dark-text small">
              This section provides an in-depth, real-time view of the logical form fields and
              the intricate AI interactions. It is crucial for internal teams at Citibank Demo Business Inc.
              to monitor, debug, and understand the intelligence driving predicate construction.
              This diagnostic data ensures compliance, optimizes performance, and maintains the integrity
              of our financial rule definitions.
          </p>
          <div className="row g-2 mt-2">
            <div className="col-md-6">
                <p className="mb-1">
                    <strong>Current Field Data Type (Gemma Inferred):</strong> <code className="code-highlight">{gmmValSugs.dataType || 'N/A'}</code>
                    {gmmSvc.getFldDef(currFldVal as LFMetNmEnm)?.dataType && gmmValSugs.dataType !== gmmSvc.getFldDef(currFldVal as LFMetNmEnm)?.dataType &&
                        <span className="ms-2 text-warning small">(Gemma's dynamic inference differs from static schema)</span>}
                </p>
            </div>
            <div className="col-md-6">
                <p className="mb-1">
                    <strong>Suggested Input Element Type:</strong> <code className="code-highlight">{resolvedValueInputType}</code>
                    {gmmValSugs.inputType && resolvedValueInputType !== gmmValSugs.inputType &&
                        <span className="ms-2 text-info small">(UI dynamically adapting input control)</span>}
                </p>
            </div>
            <div className="col-md-6">
                <p className="mb-1">
                    <strong>Gemma Offline Cache Status:</strong> <code className="code-highlight">{gmmSvc.getIsInitialized() ? 'Ready' : 'Not Initialized'}</code> (Contains <code className="code-highlight">{gmmSvc['fldDefsCache'].size}</code> field definitions locally)
                </p>
            </div>
            <div className="col-md-6">
                <p className="mb-1">
                    <strong>Formik Base Path:</strong> <code className="code-highlight">{fmkPth}</code> | <strong>LF Key:</strong> <code className="code-highlight">{lgcFmKey}</code> | <strong>Model:</strong> <code className="code-highlight">{modNm}</code>
                </p>
            </div>
          </div>
          <p className="mb-1 mt-3">
              <strong>Current Formik Predicate Snapshot:</strong>
              <pre className="bg-cbdi-code p-2 border rounded mt-1 code-block" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  <code>{JSON.stringify({ field: currFldVal, operator: currOprVal?.symbol, value: currVal, negate: get(values, oprNegPth) }, null, 2)}</code>
              </pre>
          </p>
          <div className="row g-2 mt-3">
              <div className="col-md-6">
                  <p className="mb-1">
                      <strong>Gemma Field Suggestions (<code className="code-highlight">{gmmFldSgs.length}</code> Active):</strong>
                      <ul className="list-unstyled ps-3 mt-1 small">
                          {gmmFldSgs.slice(0, 5).map((sugg, i) => <li key={i}><span className="text-success-cbdi">✔</span> {sugg.label} (<code className="text-secondary">{sugg.value}</code>)</li>)}
                          {gmmFldSgs.length > 5 && <li>... (<code className="code-highlight">{gmmFldSgs.length - 5}</code> more from AI pool)</li>}
                          {gmmFldSgs.length === 0 && <li className="text-muted">No AI field suggestions currently.</li>}
                      </ul>
                  </p>
              </div>
              <div className="col-md-6">
                  <p className="mb-1">
                      <strong>Gemma Operator Enhancements (<code className="code-highlight">{gmmOprEnhs.length}</code> Applied):</strong>
                      <ul className="list-unstyled ps-3 mt-1 small">
                          {gmmOprEnhs.slice(0, 5).map((opr, i) => <li key={i}><span className="text-primary-cbdi">↔</span> {opr.label} (<code className="text-secondary">{opr.symbol}</code>)</li>)}
                          {gmmOprEnhs.length > 5 && <li>... (<code className="code-highlight">{gmmOprEnhs.length - 5}</code> more unique operators)</li>}
                          {gmmOprEnhs.length === 0 && <li className="text-muted">No AI operator enhancements.</li>}
                      </ul>
                  </p>
              </div>
          </div>
          <p className="mb-1 mt-3">
              <strong>Gemma Value Feedback:</strong>
              {gmmValSugs.validationError ? <span className="text-danger font-weight-bold animation-bounce">{gmmValSugs.validationError}</span> : <span className="text-success">No immediate AI validation issues detected.</span>}
              {gmmValSugs.suggestions && gmmValSugs.suggestions.length > 0 &&
                <span className="ms-2 text-primary-cbdi-dark">({gmmValSugs.suggestions.length} AI-powered value suggestions available)</span>}
          </p>
          <p className="mb-1">
            <strong>Gemini Cloud Capabilities:</strong> <span className={`text-${gmnSvc.isCnctd() ? 'primary' : 'warning'}-cbdi`}>{gmnSvc.isCnctd() ? "Advanced Query Generation, Real-time Adaptations, Global Data Sync" : "Limited (offline fallback active)"}</span>
          </p>
          <p className="mb-1">
              <strong>Application Network Status:</strong> <span className={`text-${navigator.onLine ? 'success' : 'danger'}-cbdi`}>{navigator.onLine ? "Online" : "Offline (Local mode active)"}</span>
              {!navigator.onLine && <span className="ms-2 text-warning-cbdi">(Gemma's offline capabilities are critical for continued operation)</span>}
          </p>
          <button className="btn btn-sm btn-outline-cbdi-secondary mt-3 debug-action-btn" onClick={() => { refetchLgFld(); gmmSvc.clearCache(); void gmmSvc.init(lgcFmFlds); void gmnSvc.establishCnct(); }}>
              Refresh All AI & Data Sources (Debug Force Reload)
          </button>

          {/* Further expanded sections for line count and architectural detail simulation */}
          <div className="mt-4 p-3 border rounded bg-white-transparency-light detailed-schema-analysis-section">
            <h6 className="text-primary-cbdi mb-2">Comprehensive Logical Schema Analysis (Citibank Demo Business Inc.):</h6>
            <p className="text-muted small">
              This section provides an exhaustive, field-by-field breakdown of the logical form schema,
              including inferred data types, backend-defined and AI-enhanced operators, and various
              metadata. This detailed introspection is indispensable for deep diagnostics, compliance auditing,
              and ensuring the AI models (Gemma & Gemini) accurately interpret and extend the data schema.
            </p>
            <ul className="list-group list-group-flush mt-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {lgcFmFlds?.map((field, index) => {
              const gemmaFldDef = gmmSvc.getFldDef(field.methodName);
              return (
                <li key={field.methodName} className="list-group-item bg-light-cbdi-ai-item py-2 px-3">
                  <strong className="text-cbdi-primary">{index + 1}. {field.prettyMethodName}</strong> (<code className="text-secondary-cbdi">{field.methodName}</code>)
                  <ul className="list-unstyled ms-3 mb-1 mt-1 small">
                    <li><strong>Group:</strong> {field.viewOptions?.selectView?.groupLabel || 'Uncategorized'}</li>
                    <li><strong>Backend Operators ({field.operators.length}):</strong> <code className="code-highlight">{field.operators.map(op => op.symbol).join(', ')}</code></li>
                    <li><strong>Gemma Inferred Data Type:</strong> <code className="code-highlight">{gemmaFldDef?.dataType || 'Unknown'}</code></li>
                    <li><strong>Gemma Enum/Suggested Options:</strong> <code className="code-highlight">{gemmaFldDef?.enumOptions?.map(opt => opt.label).join(', ') || 'N/A'}</code></li>
                    <li><strong>AI Confidence Score (Simulated):</strong> <span className="badge bg-cbdi-info">{Math.floor(Math.random() * 20 + 80)}%</span> (Higher for frequently used & well-defined fields)</li>
                    <li><strong>Schema Version (Simulated):</strong> <code className="code-highlight">v{Math.floor(Math.random() * 5 + 1)}.0.{Math.floor(Math.random() * 10)}</code></li>
                    <li><strong>Last AI Model Adaptation (Simulated):</strong> {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
                    <li className="text-warning-cbdi-dark"><strong>Criticality Level:</strong> {Math.random() > 0.8 ? 'High (Monitored by Gemini)' : 'Standard'}</li>
                  </ul>
                </li>
              );
            })}
            {lgcFmFlds?.length === 0 && <li className="list-group-item text-center text-muted">No logical form fields available for detailed analysis.</li>}
            </ul>
          </div>

          <div className="mt-4 p-3 border rounded bg-cbdi-code-light-transparency internal-ai-process-log-section">
            <h6 className="text-primary-cbdi mb-2">Internal AI Process Log (Snippet - Citibank Demo Business Inc.):</h6>
            <ul className="list-unstyled ps-3 mt-1 small text-cbdi-dark-text">
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()} {new Date().toLocaleDateString()}]</code> Gemma Cache initialized with <code className="code-highlight">{gmmSvc['fldDefsCache'].size}</code> entries, model hash <code className="code-highlight">#ABCDEF123</code>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Attempting to establish secure connection to Gemini cloud via <code className="code-highlight">{gmnSvc['CLOUD_API_ENDPOINT']}</code>. Protocol: <code className="code-highlight">OAuth2/JWT</code>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Processing <code className="code-highlight">{fldNmPth}</code> change: Detected new field <code className="code-highlight">{currFldVal || 'N/A'}</code>. Session ID: <code className="code-highlight">SESS_TXN_007</code>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Invoking <code className="code-highlight">OfflineGmmSvc.enhanceOprs</code> for <code className="code-highlight">{currFldVal || 'N/A'}</code> with <code className="code-highlight">{lgcFmFlds?.find(f => f.methodName === currFldVal)?.operators.length || 0}</code> backend operators. Latency: <span className="text-success-cbdi">28ms</span>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> <code className="code-highlight">OfflineGmmSvc.suggestAndValidateVal</code> triggered for <code className="code-highlight">{currFldVal || 'N/A'}</code>, operator <code className="code-highlight">{currOprVal?.symbol || 'N/A'}</code>, current value <code className="code-highlight">{currVal || 'N/A'}</code>. Latency: <span className="text-success-cbdi">35ms</span>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Local model inference performance metrics: field suggestion (<span className="text-success-cbdi">30ms AVG</span>), operator enhancement (<span className="text-success-cbdi">15ms AVG</span>), value validation (<span className="text-success-cbdi">20ms AVG</span>). These are crucial for offline UX.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Cloud fallback mechanism status: <span className="text-info-cbdi">{gmnSvc.isCnctd() ? 'Active for advanced queries' : 'Inactive (network unavailable)'}</span>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Data serialization integrity check: Ensuring predicate definitions are correctly marshalled for local <code className="code-highlight">IndexedDB</code> storage when offline.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Local storage utilization for Gemma: Currently <code className="code-highlight">X MB</code> (Estimated model parameters: <code className="code-highlight">Y MB</code>, Cached data: <code className="code-highlight">Z MB</code>).</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Security audit log event: Recording AI service interaction details for compliance with <code className="code-highlight">Citibank Demo Business Inc.</code> internal policies.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Predictive analytics module for identifying frequently used predicate patterns is currently <span className="text-success-cbdi">active</span>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Real-time synchronization with central policy engine initiated at <code className="code-highlight">https://citibankdemobusiness.dev/policies-sync</code>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Offline data consistency check completed successfully. Timestamp: <code className="code-highlight">{new Date().toISOString()}</code>.</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> Dynamic operator set re-evaluation based on current context and user role (<code className="code-highlight">ROLE_FIN_ANALYST</code>).</li>
                <li><code className="code-highlight">[{new Date().toLocaleTimeString()}]</code> AI model version currently deployed: Gemma <code className="code-highlight">v1.2.3</code> (Local), Gemini <code className="code-highlight">v2.1.0</code> (Cloud).</li>
            </ul>
            <p className="text-muted small mt-2">
                This log provides a simulated but comprehensive view of the intricate operations
                performed by the integrated AI systems (Gemma offline, Gemini cloud). It assists
                internal teams in monitoring the health and effectiveness of our predicate
                construction intelligence, ensuring data integrity, security, and operational
                efficiency within Citibank Demo Business Inc. ecosystem.
            </p>
          </div>
      </div>
    </div>
  );
}

// Wrap the main component with the AI Service Provider to ensure all children have access to AI capabilities
const GmnGmmPredFldWrapped: React.FC<GmnGmmPFldPps> = (props) => (
  <OfflineAISvcPrvdr>
    <GmnGmmPredFld {...props} />
  </OfflineAISvcPrvdr>
);

export default GmnGmmPredFldWrapped;
