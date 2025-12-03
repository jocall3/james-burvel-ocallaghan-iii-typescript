// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { startCase, get, debounce, throttle, isEqual, cloneDeep } from "lodash"

import type {
  LogicalFormKeyEnum as LFKE,
  LogicalForm__ModelNameEnum as LFMNE,
  LogicalForm__OperatorEnum as LFOE,
  LogicalForm__PredicateTypeEnum as LFPTE,
  LogicalForm__DataTypeEnum as LFDTE,
  LogicalForm__FieldTypeEnum as LFFTE,
  LogicalForm__ComparatorEnum as LFCE,
  LogicalForm__ValueFormatEnum as LFVFE,
  LogicalForm__ConditionField as LFCF,
  LogicalForm__ConditionValue as LFCV,
  LogicalForm__Condition as LFC,
  LogicalForm__Predicate as LFP,
} from "../../../generated/dashboard/graphqlSchema"

/**
 * @file PredAIUtil.ts
 * @module PredAIUtil
 * @description This extensive utility module integrates Gemma/Gemini for offline processing of complex logical form predicates,
 * providing advanced AI-driven suggestions and validation rules to enhance the user experience and ensure data integrity locally for CBM Inc.
 * It's designed for offline capability, leveraging local AI models (Gemma/Gemini) to deliver robust, real-time insights
 * without reliance on external network calls for core AI functionalities.
 */

/**
 * The base URL for Citibank Demo Business Inc. development environment.
 * @constant {string} CBM_BIZ_URL
 */
const CBM_BIZ_URL: string = "https://citibankdemobusiness.dev"

/**
 * The official company name for Citibank Demo Business Inc.
 * @constant {string} CBM_CMP_NM
 */
const CBM_CMP_NM: string = "Citibank Demo Business Inc."

/**
 * Enum representing various AI processing states.
 * @enum {string} AiProcStat
 */
enum AiProcStat {
  /** The AI processing is currently idle and awaiting a new task. */
  IDL = "IDLE",
  /** The AI processing is actively performing a task. */
  ACT = "ACTIVE",
  /** The AI processing has completed its task successfully. */
  CMPL = "COMPLETED",
  /** The AI processing encountered an error during execution. */
  ERR = "ERROR",
  /** The AI processing is currently loading necessary models or resources. */
  LDG = "LOADING",
  /** The AI processing is paused, awaiting external input or resolution. */
  PSD = "PAUSED",
  /** The AI processing has been cancelled. */
  CAN = "CANCELLED",
  /** The AI processing is awaiting further data or context. */
  AWT_CTX = "AWAITING_CONTEXT",
  /** The AI processing is performing an internal sub-task. */
  SUB_TSK = "SUB_TASK_ACTIVE",
  /** The AI processing is in a low-power, dormant state. */
  DRMT = "DORMANT",
}

/**
 * Enum representing different levels of confidence in AI-generated suggestions or validations.
 * @enum {number} AiConfLvl
 */
enum AiConfLvl {
  /** Very low confidence, suggestion should be treated with extreme caution or as a raw idea. */
  V_LOW = 1,
  /** Low confidence, suggestion may require significant user review and modification. */
  LOW = 2,
  /** Medium confidence, suggestion is likely plausible but needs verification. */
  MED = 3,
  /** High confidence, suggestion is generally reliable and directly applicable. */
  HIGH = 4,
  /** Very high confidence, suggestion is almost certainly correct and can be used directly. */
  V_HIGH = 5,
  /** Critical confidence, used for high-impact validations where errors must be avoided. */
  CRIT = 6,
  /** Debug level confidence, used internally for development and testing of AI models. */
  DBG = 0,
}

/**
 * Enum representing types of AI-generated suggestions for predicates.
 * @enum {string} AiSuggTyp
 */
enum AiSuggTyp {
  /** Suggestion for a field. */
  FLD = "FIELD_SUGGESTION",
  /** Suggestion for an operator. */
  OPE = "OPERATOR_SUGGESTION",
  /** Suggestion for a value or value format. */
  VAL = "VALUE_SUGGESTION",
  /** Suggestion for a complete predicate structure. */
  PRE = "PREDICATE_STRUCTURE_SUGGESTION",
  /** Suggestion for improving the overall logical form readability or efficiency. */
  OPT = "OPTIMIZATION_SUGGESTION",
  /** Suggestion for potential related conditions. */
  RLT = "RELATED_CONDITION_SUGGESTION",
  /** Suggestion for a common pattern. */
  PAT = "PATTERN_SUGGESTION",
  /** Suggestion for data transformation prior to evaluation. */
  TRN = "TRANSFORMATION_SUGGESTION",
  /** Suggestion for context-specific help documentation. */
  HLP = "HELP_TOPIC_SUGGESTION",
}

/**
 * Enum representing different AI model types supported locally.
 * @enum {string} AiMdlTyp
 */
enum AiMdlTyp {
  /** Gemma, a lightweight, locally runnable model. */
  GMA = "GEMMA",
  /** Gemini, a more powerful model, potentially requiring more resources for local execution. */
  GMN = "GEMINI",
  /** A hybrid model leveraging aspects of both Gemma and Gemini. */
  HYB = "HYBRID",
  /** A custom internal AI model developed by CBM Inc. */
  CST = "CUSTOM_CBM_AI",
  /** A fallback model used when primary models are unavailable or insufficient. */
  FLB = "FALLBACK_BASIC",
}

/**
 * Represents a single AI-generated suggestion.
 * @interface AiSugg
 * @property {AiSuggTyp} typ - The type of suggestion being offered.
 * @property {string} txt - The textual content of the suggestion.
 * @property {any} data - Associated data relevant to the suggestion (e.g., a field ID, a value structure).
 * @property {AiConfLvl} confLvl - The confidence level of this suggestion.
 * @property {string} [id] - Optional unique identifier for the suggestion.
 * @property {string} [rSn] - Optional reason for the suggestion, useful for debugging or user feedback.
 * @property {boolean} [isCrit] - Indicates if this suggestion is critical (e.g., security, compliance).
 * @property {number} [rank] - Ranking score for ordering suggestions.
 * @property {Date} [genTS] - Timestamp when the suggestion was generated.
 */
interface AiSugg {
  typ: AiSuggTyp
  txt: string
  data: any
  confLvl: AiConfLvl
  id?: string
  rSn?: string
  isCrit?: boolean
  rank?: number
  genTS?: Date
}

/**
 * Represents the result of an AI-driven validation check.
 * @interface ValRes
 * @property {boolean} isValid - True if the predicate or part of it is valid, false otherwise.
 * @property {string} msg - A message describing the validation result (e.g., success message, error description).
 * @property {string} [path] - Optional path within the formik values where the validation applies.
 * @property {AiConfLvl} confLvl - The confidence level of this validation result.
 * @property {string} [ruleId] - The identifier of the validation rule that was applied.
 * @property {string[]} [suggIds] - Optional array of suggestion IDs related to the validation failure (if any).
 * @property {Date} [valTS] - Timestamp when the validation occurred.
 */
interface ValRes {
  isValid: boolean
  msg: string
  path?: string
  confLvl: AiConfLvl
  ruleId?: string
  suggIds?: string[]
  valTS?: Date
}

/**
 * Represents the current context of a predicate or logical form part, used for AI analysis.
 * This structure mirrors relevant parts of `FormValues` from the seed file but is abbreviated.
 * @interface PredCtx
 * @property {LFKE} lfK - Logical form key.
 * @property {LFMNE} mdlNm - Model name associated with the logical form.
 * @property {string} fmPth - Formik path to the current predicate or condition.
 * @property {LFPTE} [predTyp] - Type of predicate being analyzed (e.g., FIELD, GROUP).
 * @property {LFCF} [fld] - The field object of the current predicate.
 * @property {LFCE} [opr] - The operator of the current predicate.
 * @property {LFCV} [val] - The value object of the current predicate.
 * @property {string[]} [availableFlds] - List of available fields for the current model.
 * @property {Record<string, any>} [fullFmVals] - Full form values for broader context.
 * @property {LFC[]} [siblings] - Sibling conditions in the same group.
 * @property {number} [idx] - Index of the current predicate within its group.
 */
interface PredCtx {
  lfK: LFKE
  mdlNm: LFMNE
  fmPth: string
  predTyp?: LFPTE
  fld?: LFCF
  opr?: LFCE
  val?: LFCV
  availableFlds?: string[]
  fullFmVals?: Record<string, any>
  siblings?: LFC[]
  idx?: number
}

/**
 * Configuration options for the AI processing engine.
 * @interface AiCfg
 * @property {AiMdlTyp} mdlTyp - The type of AI model to use (Gemma, Gemini, etc.).
 * @property {AiConfLvl} minConfLvl - Minimum confidence level for suggestions to be returned.
 * @property {number} maxSugg - Maximum number of suggestions to return.
 * @property {boolean} useCaching - Whether to use internal caching for AI responses.
 * @property {boolean} dbgMod - Enable debug mode for more verbose logging.
 * @property {number} debounceMs - Debounce time in milliseconds for AI queries.
 * @property {string[]} [excldRlIds] - Array of rule IDs to exclude from validation.
 * @property {Record<string, any>} [llmOpt] - Low-level LLM options (e.g., temperature, top_p).
}
 */
interface AiCfg {
  mdlTyp: AiMdlTyp
  minConfLvl: AiConfLvl
  maxSugg: number
  useCaching: boolean
  dbgMod: boolean
  debounceMs: number
  excldRlIds?: string[]
  llmOpt?: Record<string, any>
}

/**
 * Represents an internal cache entry for AI results.
 * @interface AiCchEnt
 * @property {string} key - The cache key, typically a hash of the input context.
 * @property {AiSugg[] | ValRes[] | string} res - The cached result.
 * @property {number} expTs - Expiration timestamp for the cache entry.
 * @property {Date} crtTs - Creation timestamp.
 */
interface AiCchEnt {
  key: string
  res: AiSugg[] | ValRes[] | string
  expTs: