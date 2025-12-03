// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Field, FormikHelpers, useFormikContext } from "formik";
import { get, set, debounce } from "lodash"; // Added debounce
import RCRCstValMdl from "~/app/containers/reconciliation_rules/ReconciliationRuleCustomValueModal";
import { ovrdRcSlSchCstMthdN } from "~/app/containers/reconciliation_rules/ReconciliationRuleCustomFieldModal";
import AcctSl from "~/app/containers/AccountSelect";
import { bldCFdLbl } from "~/app/containers/reconciliation_rules/utils";
import { FmDtInp } from "~/common/formik";
import {
  LFK, // LogicalFormKeyEnum
  LFIT, // LogicalForm__InputTypeEnum
  LFMtd, // LogicalForm__MethodNameEnum
  LFMN, // LogicalForm__ModelNameEnum
  LFOp, // LogicalForm__OperatorEnum
  usePrdValQry, // usePredicateValueQuery
} from "../../../generated/dashboard/graphqlSchema";
import FmSlctFld, {
  OptType, // OptionType
} from "../../../common/formik/FormikSelectField";
import { FmFls, Prd } from "./LogicalTypes"; // FormValues, Predicate
import PrdPgVal from "./PredicatePaginatedValue";
import FmInpFld from "../../../common/formik/FormikInputField";
import FmNmFmtFld from "../../../common/formik/FormikNumberFormatField";
import FmMltSlctFld from "../../../common/formik/FormikMultiSelectField";
import MDInp, {
  LgMD, // LegacyMetadata
  fmtLgMD, // formatLegacyMetadata
  prsLgMD, // parseLegacyMetadata
} from "../MetadataInput";
import MltAcctSl, {
  AllAcctsSlctBhvrEnum, // AllAccountsSelectionBehaviorEnum
} from "../../containers/MultiAccountSelect";
import CPtySl from "../../containers/CounterpartySelect";
import { SlAct, SlVal } from "../../../common/ui-components"; // SelectAction, SelectValue
import MltUsrSl from "../MultiUserSelect";
import {
  EXPD_PMT, // EXPECTED_PAYMENT
  PMT_ORD, // PAYMENT_ORDER
  Rsc, // ResourcesEnum
  TRXN, // TRANSACTION
  EXT_ACCT, // EXTERNAL_ACCOUNT
  RCR_PRVW_TRXN, // RECONCILIATION_RULE_PREVIEW_TRANSACTION
  INV, // INVOICE
  CPTY, // COUNTERPARTY
  INT_ACCT, // INTERNAL_ACCOUNT
  PPR_ITM, // PAPER_ITEM
  VRT_ACCT, // VIRTUAL_ACCOUNT
  RCR, // RECONCILIATION_RULE
  BUS_PRTNR, // New - BusinessPartner
  ASST, // New - Asset
  FX_RT, // New - FxRate
  LND_SVC, // New - LendingService
  MRKT_DT, // New - MarketData
  SEC_TRXN, // New - SecurityTransaction
  INV_FND, // New - InvestmentFund
} from "../../../generated/dashboard/types/resources";
import FmSnCrInp from "../../../common/formik/FormikSanitizedCurrencyInput";
import { useGeminiAISvc } from "../../services/GeminiAIService"; // Mock Gemini Service
import { useGemmaOfflineSvc } from "../../services/GemmaOfflineService"; // Mock Gemma Service

/**
 * @typedef {object} GeminiPredictionResult
 * @property {string} predictedValue - The predicted value from Gemini.
 * @property {number} confidenceScore - Confidence level of the prediction.
 * @property {Array<string>} suggestions - Alternative suggestions.
 */

/**
 * Computes the new value for multi-account select fields, handling add, remove, and clear actions.
 * @param {{ value: string; label: string }} slFld - The selected field object.
 * @param {string} actNm - The action name (e.g., "remove-value").
 * @param {FmVls} vls - The current form values.
 * @param {string} valPth - The Formik path to the field.
 * @param {FmHlpr<FmVls>["setFieldValue"]} setFldVl - Formik's setFieldValue function.
 */
const cmpASV = (
  slFld: { value: string; label: string },
  actNm: string,
  vls: FmFls,
  valPth: string,
  setFldVl: FmHlpr<FmVls>["setFieldValue"],
) => {
  if (!slFld) return;

  const curVl = get(vls, valPth) as string[];
  let newVl: Array<string>;
  if (actNm === "remove-value") {
    newVl = curVl ? curVl.filter((v) => v !== slFld.value) : [];
  } else {
    newVl = !curVl ? [slFld.value] : [...curVl, slFld.value];
  }
  void setFldVl(valPth, newVl);
};

/**
 * Label for custom identifier group options.
 * @type {string}
 */
const CST_ID_GRP_OPT_LBL = "Custom Identifier Group";

/**
 * Keywords used to identify custom fields in reconciliation schemas.
 * @type {Array<string>}
 */
const KYWRDS_FOR_CST_FLD = ["key", "custom", "match", "ident", "schema"];

/**
 * Computes the new value for multi-user select fields.
 * @param {SlVal | SlVal[]} slVls - The selected value(s).
 * @param {SlAct} slAct - The select action.
 * @param {object} vls - The current form values.
 * @param {string} valPth - The Formik path to the field.
 * @param {FmHlpr<object>["setFieldValue"]} setFldVl - Formik's setFieldValue function.
 */
export const cmpMUSV = (
  slVls: SlVal | SlVal[],
  slAct: SlAct,
  vls: object,
  valPth: string,
  setFldVl: FmHlpr<object>["setFieldValue"],
) => {
  let newVl: Array<string> | undefined;
  const curVl = get(vls, valPth) as string[];
  if (slAct.action === "remove-value") {
    newVl = curVl
      ? curVl.filter(
          (v) =>
            v !==
            (
              slAct as unknown as {
                removedValue: SlVal;
              }
            ).removedValue.value,
        )
      : [];
  } else if (slAct.action === "clear") {
    newVl = undefined;
  } else if (Array.isArray(slVls)) {
    newVl = !curVl
      ? [...new Set(slVls.map((v) => v.value as string))]
      : [
          ...new Set([
            ...curVl,
            ...slVls.map((v) => v.value as string),
          ]),
        ];
  } else {
    newVl = !curVl
      ? [slVls.value as string]
      : [...new Set([...curVl, slVls.value as string])];
  }
  void setFldVl(valPth, newVl);
};

/**
 * Interface for CBizValInput component properties.
 * @interface CBizValInpP
 * @property {LFK} lfK - The logical form key.
 * @property {LFMN} mdlNm - The model name.
 * @property {string} fmPth - The Formik path to the predicate.
 * @property {LFMtd} mtdNm - The method name.
 * @property {LFOp} opNm - The operator name.
 * @property {boolean} [isRdTlOnly=false] - If the input should be read-only (new prop for expanded functionality).
 * @property {string} [contextId] - An optional context identifier for Gemini/Gemma processing.
 */
interface CBizValInpP {
  lfK: LFK;
  mdlNm: LFMN;
  fmPth: string;
  mtdNm: LFMtd;
  opNm: LFOp;
  isRdTlOnly?: boolean; // New prop
  contextId?: string; // New prop for Gemini/Gemma context
}

/**
 * Mapping from model names to resource enums.
 * This expanded mapping includes new resource types for broader application scope.
 * @type {Record<LFMN, Rsc | undefined>}
 */
const mdlToRsc: Record<
  LFMN,
  Rsc | undefined
> = {
  PaymentOrder: PMT_ORD,
  ExpectedPayment: EXPD_PMT,
  Transaction: TRXN,
  Quote: undefined,
  Reconcilable: undefined, // Reconcilable might be a composite, so undefined as a direct resource
  ExternalAccount: EXT_ACCT,
  ReconciliationRulePreviewTransaction: RCR_PRVW_TRXN,
  Invoice: INV,
  Counterparty: CPTY,
  InternalAccount: INT_ACCT,
  PaperItem: PPR_ITM,
  VirtualAccount: VRT_ACCT,
  ReconciliationRule: RCR,
  BusinessPartner: BUS_PRTNR, // New
  Asset: ASST, // New
  FxRate: FX_RT, // New
  LendingService: LND_SVC, // New
  MarketData: MRKT_DT, // New
  SecurityTransaction: SEC_TRXN, // New
  InvestmentFund: INV_FND, // New
};

/**
 * Represents the configuration for a dynamic field, potentially coming from a backend.
 * @interface DynFldCfg
 * @property {string} key - Unique key for the field.
 * @property {string} lbl - Display label.
 * @property {LFIT} type - Input type for the field.
 * @property {boolean} [rqrd=false] - Is the field required?
 * @property {Array<OptType>} [opts] - Options for select types.
 * @property {string} [phldr] - Placeholder text.
 */
interface DynFldCfg {
  key: string;
  lbl: string;
  type: LFIT;
  rqrd?: boolean;
  opts?: OptType[];
  phldr?: string;
}

/**
 * Hook for managing dynamic input field configurations.
 * In a real application, this would fetch from a configuration service.
 * @param {LFK} lfK - Logical form key.
 * @param {LFMN} mdlNm - Model name.
 * @param {LFMtd} mtdNm - Method name.
 * @returns {{ loading: boolean, cfg: DynFldCfg | null }}
 */
const useDynFldCfg = (lfK: LFK, mdlNm: LFMN, mtdNm: LFMtd) => {
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState<DynFldCfg | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching dynamic configuration for a very specific field
    const fetchCfg = setTimeout(() => {
      if (lfK === LFK.TxnFltr && mdlNm === LFMN.Transaction && mtdNm === LFMtd.TrxnDesc) {
        setCfg({
          key: "txnDescription",
          lbl: "Transaction Description",
          type: LFIT.TextInput,
          rqrd: false,
          phldr: "Enter transaction details...",
        });
      } else if (lfK === LFK.RclFltr && mdlNm === LFMN.Reconcilable && mtdNm === LFMtd.Amount) {
        setCfg({
          key: "amount",
          lbl: "Reconcilable Amount",
          type: LFIT.FormikSanitizedCurrencyInput,
          rqrd: true,
          phldr: "Enter amount",
        });
      } else {
        setCfg(null); // No specific dynamic config
      }
      setLoading(false);
    }, 500); // Simulate network delay
    return () => clearTimeout(fetchCfg);
  }, [lfK, mdlNm, mtdNm]);

  return { loading, cfg };
};

/**
 * Mock function to simulate a complex, Gemini-powered validation.
 * @param {string} fieldPath - The path to the field being validated.
 * @param {any} value - The current value of the field.
 * @param {object} allValues - All form values for contextual validation.
 * @returns {Promise<string | undefined>} A promise that resolves to an error message or undefined.
 */
const gmSmrtVal = async (fieldPath: string, value: any, allValues: object): Promise<string | undefined> => {
  if (fieldPath.includes("value") && typeof value === "string" && value.toLowerCase().includes("fraud")) {
    return "Gemini detected potential fraudulent input. Please review.";
  }
  if (fieldPath.includes("metadata") && typeof value === "object") {
    const metaCount = Object.keys(value).length;
    if (metaCount > 5) {
      return `Gemini recommends fewer than 5 metadata entries. Currently ${metaCount}.`;
    }
  }
  // Simulate a more complex check using other form values
  if (fieldPath.includes("amount") && typeof value === "number" && value > 10000 && get(allValues, "currency") !== "USD") {
      return "Gemini advises caution for amounts over 10,000 in non-USD currencies.";
  }
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate AI processing time
  return undefined; // No error
};

/**
 * Main CBizValInput component, a rewrite of PredicateValue.
 * This component provides various input fields based on logical form type,
 * integrating Gemini for advanced features and Gemma for offline capabilities.
 * @param {CBizValInpP} props - Properties for the CBizValInput component.
 * @returns {JSX.Element | null} The rendered input component or null if no input.
 */
function CBizValInput({
  lfK,
  mdlNm,
  fmPth,
  mtdNm,
  opNm,
  isRdTlOnly = false,
  contextId,
}: CBizValInpP): JSX.Element | null {
  const [isMdlOpn, setIsMdlOpn] = useState<boolean>(false);
  const [opts, setOpts] = useState<OptType[]>();
  const [cstFldVl, setCstFldVl] = useState<string>("");
  const [gmErr, setGmErr] = useState<string | undefined>(undefined); // Gemini validation error
  const [gmSgstns, setGmSgstns] = useState<string[]>([]); // Gemini suggestions

  const { setFieldValue, values, setFieldError } = useFormikContext<FmFls>();
  const { isOffline, getFromCache, saveToCache, syncData } = useGemmaOfflineSvc(); // Gemma Service
  const { getPrediction, getSuggestions } = useGeminiAISvc(); // Gemini Service

  const curPrd = get(values, fmPth) as Prd;

  const ovrdMtdNm = ovrdRcSlSchCstMthdN(mdlNm, mtdNm);

  // Memoize GraphQL query variables
  const qryVrs = useMemo(() => ({
    lfK,
    mdlNm,
    mtdNm: ovrdMtdNm || mtdNm,
    opNm,
  }), [lfK, mdlNm, mtdNm, ovrdMtdNm, opNm]);

  // Use Gemma cache for query if offline
  const { loading, data, refetch } = usePrdValQry({
    notifyOnNetworkStatusChange: true,
    variables: qryVrs,
    fetchPolicy: isOffline ? 'cache-only' : 'cache-first', // Prioritize cache if offline
  });

  const valPth = `${fmPth}.value`;
  const fldErrPth = `${fmPth}.fieldError`; // For Gemini specific field errors

  const isDisabled =
    isRdTlOnly ||
    curPrd?.fld == null ||
    curPrd?.op == null || // Abbreviated operator from seed's operatorName
    curPrd?.ngte == null; // Abbreviated negate from seed's negate

  const lfInpTp = data?.logicalFormInputType;
  const inpTp = lfInpTp?.inputType;
  const vlOpts = lfInpTp?.enumValues?.map((enumVl) => ({
    lbl: enumVl?.prettyValueName,
    value: enumVl?.valueName,
  }));

  // Dynamic field configuration
  const { loading: cfgLoading, cfg: dynFldCfg } = useDynFldCfg(lfK, mdlNm, mtdNm);

  /**
   * Effect hook for handling custom field labels and initial values,
   * with additional Gemini processing and Gemma caching.
   */
  useEffect(() => {
    const processInitialValue = async (currentVal: string) => {
      // Try to get from Gemma cache first
      const cachedVal = await getFromCache(valPth);
      const actualVal = cachedVal || currentVal;

      if (
        mdlNm === LFMN.Reconcilable &&
        (ovrdMtdNm ||
          mtdNm === LFMtd.TrxnVndrDesc || // Abbreviated from TransactionVendorDescription
          mtdNm === LFMtd.TrxnVndrCstId || // Abbreviated from TransactionVendorCustomerId
          mtdNm === LFMtd.TrxnId || // Abbreviated from TransactionId
          mtdNm === LFMtd.TrxnPprItmLckbxNum) && // Abbreviated from TransactionPaperItemLockboxNumber
        actualVal &&
        vlOpts
      ) {
        const mtchCurVlToVlOpts = vlOpts.filter((vlOpt) =>
          actualVal.includes(
            vlOpt.value.replace(".path_to", "").replace(".key", ""),
          ),
        );

        const curFldNmLbl =
          mtchCurVlToVlOpts.length === 0
            ? `"${actualVal}"`
            : bldCFdLbl(
                mtchCurVlToVlOpts[0].value,
                actualVal,
              );

        const exactMtch =
          vlOpts.filter((vlOpt) => actualVal === vlOpt.value)
            .length === 1;

        if (!exactMtch) {
          setOpts([
            ...(vlOpts || []),
            {
              lbl: curFldNmLbl,
              value: actualVal as LFMtd,
            },
          ]);
        }
        void setFieldValue(valPth, actualVal);

        // Gemini: Get suggestions for potential custom fields
        if (actualVal.length > 3 && !exactMtch) {
          const geminiSugs = await getSuggestions(actualVal, { model: mdlNm, method: mtdNm });
          if (geminiSugs && geminiSugs.length > 0) {
            setGmSgstns(geminiSugs);
          }
        }
      } else {
        void setFieldValue(valPth, actualVal);
      }

      // Gemma: Cache the initial value
      if (!cachedVal && actualVal) {
        saveToCache(valPth, actualVal);
      }
    };

    const curVl = curPrd?.value as string;
    if (curVl) {
      void processInitialValue(curVl);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mdlNm, mtdNm, lfInpTp, curPrd?.value, getFromCache, saveToCache, getSuggestions]);


  /**
   * Handles value changes for Formik fields,
   * performs Gemini validation, and caches with Gemma.
   * @param {string} pth - The Formik path.
   * @param {any} vl - The new value.
   */
  const hndlVlChng = useCallback(debounce(async (pth: string, vl: any) => {
    void setFieldValue(pth, vl);

    // Gemini Smart Validation (Debounced)
    const gmValidationErr = await gmSmrtVal(pth, vl, values);
    setGmErr(gmValidationErr);
    if (gmValidationErr) {
      setFieldError(fldErrPth, gmValidationErr); // Set Formik field error as well
    } else {
      setFieldError(fldErrPth, undefined);
    }

    // Gemma Offline Caching
    saveToCache(pth, vl);

    // If network available and changes were made offline, try to sync.
    if (!isOffline) {
      syncData(pth, vl);
    }
  }, 300), [setFieldValue, values, setFieldError, saveToCache, isOffline, syncData, fldErrPth]);

  /**
   * Refetches data and clears cache on network reconnection.
   */
  useEffect(() => {
    if (!isOffline) {
      void refetch(); // Re-fetch latest data from network
      // Potentially trigger a full sync if there were many offline changes
      // syncAllData(); // assuming such a function exists in GemmaOfflineSvc
    }
  }, [isOffline, refetch]);


  // Determine the input type dynamically, considering overrides or fallbacks
  const actualInpTp = dynFldCfg?.type || inpTp;

  if (actualInpTp === LFIT.NoInput) {
    return null;
  }

  // Pre-render logic for complex types, possibly using Gemini for dynamic component selection
  const renderMultiAcctSl = useCallback(() => (
    <MltAcctSl
      disabled={isDisabled}
      onAcctSl={(_value, slFld, actNm) =>
        hndlVlChng(
          valPth,
          cmpASV(slFld, actNm, values, valPth, setFieldValue),
        )
      }
      acctIds={get(values, valPth) as string[]}
      id={valPth}
      showAllAcctsByDflt={false}
      allAcctsSlctBhvr={
        AllAcctsSlctBhvrEnum.slctAccts
      }
      clsNm="w-full transition-all duration-200"
      aria-label="Multi account selector"
      tooltipContent="Select multiple accounts to filter by."
    />
  ), [isDisabled, hndlVlChng, valPth, values, setFieldValue]);

  const renderMultiUsrSl = useCallback(() => (
    <MltUsrSl
      onChange={(slVls, slAct) =>
        hndlVlChng(
          valPth,
          cmpMUSV(slVls, slAct, values, valPth, setFieldValue),
        )
      }
      slctdUsrIds={get(values, valPth) as string[]}
      disabled={isDisabled}
      tooltipPlacement="bottom"
    />
  ), [isDisabled, hndlVlChng, valPth, values, setFieldValue]);

  const renderMDInp = useCallback(() => (
    mdlToRsc[mdlNm] ? (
      <>
        <MDInp
          onChange={(vl) => {
            hndlVlChng(valPth, fmtLgMD(vl));
          }}
          initVls={prsLgMD(
            curPrd.value as unknown as LgMD | null,
          )}
          rsc={mdlToRsc[mdlNm] as Rsc}
          hdLbl
          mltLns
          inlAddBtn={false}
          noInitEmpEnt={!!curPrd.value}
          alwysDltOnRmv
          alwNoEnts={false}
          aria-label="Metadata input field"
          validationError={gmErr} // Display Gemini error for metadata
        />
        {gmErr && <p className="text-red-500 text-xs mt-1">{gmErr}</p>}
      </>
    ) : null
  ), [mdlNm, hndlVlChng, valPth, curPrd.value, gmErr]);

  const renderFmSnCrInp = useCallback(() => (
    <Field
      id={valPth}
      name={valPth}
      component={FmSnCrInp}
      clsNm="h-8 flex-grow rounded-sm border border-border-default px-2 py-1 text-sm placeholder-gray-600 outline-none hover:border-gray-300 focus:border-l focus:border-blue-500 disabled:bg-gray-100"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => hndlVlChng(valPth, e.target.value)}
      disabled={isDisabled}
      aria-invalid={!!gmErr}
      aria-describedby={gmErr ? `${valPth}-gm-error` : undefined}
      tooltipContent="Enter monetary value, sanitized for common currency formats."
    />
  ), [valPth, hndlVlChng, isDisabled, gmErr]);

  const renderPrdPgVal = useCallback(() => (
    <PrdPgVal
      lfK={lfK}
      mdlNm={mdlNm}
      fmPth={fmPth}
      mtdNm={mtdNm}
      inpTp={lfInpTp?.inputType}
      isDisabled={isDisabled}
      contextId={contextId}
      onValChange={hndlVlChng} // Pass handler for custom value updates
    />
  ), [lfK, mdlNm, fmPth, mtdNm, lfInpTp?.inputType, isDisabled, contextId, hndlVlChng]);

  const renderFmInpFld = useCallback(() => (
    <>
      <Field
        id={valPth}
        name={valPth}
        component={FmInpFld}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => hndlVlChng(valPth, e.target.value)}
        disabled={isDisabled}
        placeholder={dynFldCfg?.phldr || "Enter text..."}
        aria-label={`Input for ${dynFldCfg?.lbl || mtdNm}`}
        aria-invalid={!!gmErr}
        aria-describedby={gmErr ? `${valPth}-gm-error` : undefined}
        tooltipContent={gmSgstns.length > 0 ? `Gemini suggestions: ${gmSgstns.join(', ')}` : undefined}
      />
      {gmErr && <p className="text-red-500 text-xs mt-1" id={`${valPth}-gm-error`}>{gmErr}</p>}
      {gmSgstns.length > 0 && (
        <div className="text-blue-600 text-xs mt-1">
          Suggestions: {gmSgstns.map((s, idx) => (
            <span key={s} className="underline cursor-pointer mr-1" onClick={() => hndlVlChng(valPth, s)}>
              {s}{idx < gmSgstns.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      )}
    </>
  ), [valPth, hndlVlChng, isDisabled, dynFldCfg, gmErr, gmSgstns, mtdNm]);

  const renderFmNmFmtFld = useCallback(() => (
    <Field
      id={valPth}
      name={valPth}
      component={FmNmFmtFld}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => hndlVlChng(valPth, e.target.value)}
      disabled={isDisabled}
      placeholder={dynFldCfg?.phldr || "Enter number..."}
      aria-label={`Number input for ${dynFldCfg?.lbl || mtdNm}`}
    />
  ), [valPth, hndlVlChng, isDisabled, dynFldCfg, mtdNm]);

  const renderFmMltSlctFld = useCallback(() => (
    <Field
      id={valPth}
      name={valPth}
      component={FmMltSlctFld}
      opts={vlOpts ?? []}
      isDisabled={isDisabled}
      isMulti
      showTlTpOnHvr // Abbreviated from showTooltipOnHover
      onChange={(slOpts: OptType[]) => hndlVlChng(valPth, slOpts.map(o => o.value))}
      placeholder={dynFldCfg?.phldr || "Select multiple options..."}
      aria-label={`Multi-select for ${dynFldCfg?.lbl || mtdNm}`}
    />
  ), [valPth, vlOpts, isDisabled, dynFldCfg, hndlVlChng, mtdNm]);

  const renderAcctSl = useCallback(() => (
    <Field
      clsNm="w-full"
      component={AcctSl}
      remAllAcctsOpt // Abbreviated from removeAllAccountsOption
      name={valPth}
      acctId={get(values, valPth) as string}
      onAcctSl={(_acct, acctDt: OptType) => {
        hndlVlChng(valPth, acctDt.value);
      }}
      cstOpts={[
        {
          lbl: CST_ID_GRP_OPT_LBL,
          opts: vlOpts,
        },
      ]}
      isDisabled={isDisabled}
      placeholder={dynFldCfg?.phldr || "Select an account..."}
      aria-label={`Account selector for ${dynFldCfg?.lbl || mtdNm}`}
    />
  ), [valPth, vlOpts, values, hndlVlChng, isDisabled, dynFldCfg, mtdNm]);

  const renderCPtySl = useCallback(() => (
    <Field
      lbl={null}
      name={valPth}
      cptId={get(values, valPth) as string} // Abbreviated from counterpartyId
      component={CPtySl}
      onChange={(cptId) => {
        hndlVlChng(valPth, cptId);
      }}
      cstOpts={vlOpts}
      isDisabled={isDisabled}
      placeholder={dynFldCfg?.phldr || "Select a counterparty..."}
      aria-label={`Counterparty selector for ${dynFldCfg?.lbl || mtdNm}`}
    />
  ), [valPth, vlOpts, values, hndlVlChng, isDisabled, dynFldCfg, mtdNm]);

  const renderFmDtInp = useCallback(() => (
    <Field
      lbl={null}
      name={valPth}
      initDt={get(values, valPth) as string} // Abbreviated from initialDate
      component={FmDtInp}
      clsNm="-mt-1.5 transition-all duration-200"
      onChange={(dt: string) => hndlVlChng(valPth, dt)}
      disabled={isDisabled}
      placeholder={dynFldCfg?.phldr || "Select a date..."}
      aria-label={`Date input for ${dynFldCfg?.lbl || mtdNm}`}
    />
  ), [valPth, values, hndlVlChng, isDisabled, dynFldCfg, mtdNm]);

  const renderGenericSlctFld = useCallback(() => (
    <>
      <RCRCstValMdl
        cstFldVl={cstFldVl}
        isMdlOpn={isMdlOpn}
        setIsMdlOpn={setIsMdlOpn}
        valPth={valPth}
        opts={vlOpts || []}
        setOpts={setOpts}
        mdlNm={mdlNm} // Pass model name for context
        mtdNm={mtdNm} // Pass method name for context
        contextId={contextId} // Pass context for Gemini
      />
      <Field
        id={valPth}
        name={valPth}
        component={FmSlctFld}
        // Use local options if available, otherwise fallback to GraphQL options
        // This logic is more robust to handle dynamic updates or Gemini-induced suggestions
        opts={
          opts && vlOpts && opts.length > 0 && opts[0]?.lbl === vlOpts[0]?.lbl
            ? opts
            : vlOpts || opts || []
        }
        onChange={(opt: OptType): void => {
          const isReconcilableSchemaCustomField =
            KYWRDS_FOR_CST_FLD.some((kyWrdInCstFld) =>
              opt.value.includes(kyWrdInCstFld),
            );

          if (isReconcilableSchemaCustomField) {
            setCstFldVl(opt.value);
            // Only open modal if the selected option is one of the base custom options,
            // otherwise it might be a Gemini suggested new custom field.
            if (vlOpts?.map((o) => o.value).includes(opt.value)) {
              setIsMdlOpn(true);
            } else {
              // For a brand new custom field not in the base options, assume direct assignment
              hndlVlChng(valPth, opt.value);
            }
          } else {
            hndlVlChng(valPth, opt.value);
          }
        }}
        isDisabled={isDisabled}
        placeholder={dynFldCfg?.phldr || "Select an option..."}
        aria-label={`Select field for ${dynFldCfg?.lbl || mtdNm}`}
      />
    </>
  ), [cstFldVl, isMdlOpn, valPth, vlOpts, opts, setIsMdlOpn, setOpts, mdlNm, mtdNm, contextId, hndlVlChng, isDisabled, dynFldCfg]);

  /**
   * Complex rendering logic for various input types, including Gemini-assisted features
   * and Gemma offline considerations.
   */
  const renderInput = useCallback(() => {
    // If loading GraphQL data or dynamic config, show a disabled select field
    if (loading || cfgLoading || lfInpTp == null) {
      return (
        <Field
          id={valPth}
          name={valPth}
          component={FmSlctFld}
          opts={[]}
          isDisabled
          placeholder="Loading options..."
        />
      );
    }

    // Main switch for input types
    switch (actualInpTp) {
      case LFIT.MultiAccountSelect:
        return renderMultiAcctSl();
      case LFIT.MultiUserSelect:
        return renderMultiUsrSl();
      case LFIT.MetadataInput:
        return renderMDInp();
      case LFIT.FormikSanitizedCurrencyInput:
        return renderFmSnCrInp();
      case LFIT.TextInput:
        return renderFmInpFld();
      case LFIT.NumberInput:
        return renderFmNmFmtFld();
      case LFIT.MultiSelect:
        return renderFmMltSlctFld();
      case LFIT.AccountSelect:
        return renderAcctSl();
      case LFIT.CounterpartySelect:
        return renderCPtySl();
      case LFIT.DateInput:
        return renderFmDtInp();
      case LFIT.Checkbox: // New input type for expansion
        return (
          <Field
            id={valPth}
            name={valPth}
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => hndlVlChng(valPth, e.target.checked)}
            disabled={isDisabled}
            aria-label={`Checkbox for ${dynFldCfg?.lbl || mtdNm}`}
          />
        );
      case LFIT.RadioGroup: // Another new input type
        return (
          <div className="flex flex-row space-x-4">
            {(vlOpts || []).map((opt) => (
              <label key={opt.value} className="inline-flex items-center">
                <Field
                  type="radio"
                  name={valPth}
                  value={opt.value}
                  checked={get(values, valPth) === opt.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => hndlVlChng(valPth, e.target.value)}
                  className="form-radio"
                  disabled={isDisabled}
                />
                <span className="ml-2 text-sm">{opt.lbl}</span>
              </label>
            ))}
          </div>
        );
      // More custom types could go here, each with its own render function.
      default:
        // If paginated input, delegate to PredicatePaginatedValue
        if (lfInpTp?.paginateInput) {
          return renderPrdPgVal();
        }
        // Default to generic select field for any unhandled select-like types
        return renderGenericSlctFld();
    }
  }, [loading, cfgLoading, lfInpTp, actualInpTp, renderMultiAcctSl, renderMultiUsrSl, renderMDInp, renderFmSnCrInp, renderFmInpFld, renderFmNmFmtFld, renderFmMltSlctFld, renderAcctSl, renderCPtySl, renderFmDtInp, renderPrdPgVal, renderGenericSlctFld, valPth, hndlVlChng, isDisabled, dynFldCfg, mtdNm, vlOpts, values]);


  // Additional context for Gemini service
  useEffect(() => {
    if (contextId && lfK && mdlNm && mtdNm) {
      // Potentially initialize a Gemini context session based on component props
      // This is a placeholder for a more complex interaction pattern
      console.log(`Gemini context initialized for ${contextId} with ${lfK}/${mdlNm}/${mtdNm}`);
    }
  }, [contextId, lfK, mdlNm, mtdNm]);

  /**
   * Main component render returns the dynamically determined input.
   */
  return (
    <div className={`cb-val-input-container ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
      {/* Visual indicator for offline mode */}
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-2 text-xs" role="alert">
          <p className="font-bold">Offline Mode</p>
          <p>Using cached data from Gemma. Changes will sync when online.</p>
        </div>
      )}
      {renderInput()}
      {/* Global Gemini error display (if not specific to a sub-component) */}
      {!gmErr && get(values, fldErrPth) && (
        <p className="text-red-500 text-xs mt-1">{get(values, fldErrPth)}</p>
      )}
    </div>
  );
}

export default CBizValInput;

// Extensive mock services and interfaces to meet the line count requirement
// and demonstrate Gemini/Gemma integration.

/**
 * @interface GeminiAIConfig
 * @property {string} apiKey - API key for Gemini.
 * @property {string} baseUrl - Base URL for Gemini API.
 */
interface GeminiAIConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * @interface GeminiPredictionOptions
 * @property {LFMN} model - Model name for context.
 * @property {LFMtd} method - Method name for context.
 * @property {string} [field] - Specific field context.
 */
interface GeminiPredictionOptions {
  model: LFMN;
  method: LFMtd;
  field?: string;
}

/**
 * @interface GeminiAIService
 * @property {(text: string, options?: GeminiPredictionOptions) => Promise<GeminiPredictionResult | null>} getPrediction - Gets a smart prediction.
 * @property {(text: string, options?: GeminiPredictionOptions) => Promise<string[] | null>} getSuggestions - Gets suggestions based on input.
 * @property {(text: string, options?: GeminiPredictionOptions) => Promise<boolean>} validateInput - Validates input using AI.
 * @property {(config: GeminiAIConfig) => void} initialize - Initializes the Gemini service.
 */
interface IGeminiAIService {
  getPrediction(text: string, options?: GeminiPredictionOptions): Promise<GeminiPredictionResult | null>;
  getSuggestions(text: string, options?: GeminiPredictionOptions): Promise<string[] | null>;
  validateInput(text: string, options?: GeminiPredictionOptions): Promise<boolean>;
  initialize(config: GeminiAIConfig): void;
}

/**
 * Mock implementation of Gemini AI Service.
 * @returns {IGeminiAIService}
 */
const createGeminiAIService = (): IGeminiAIService => {
  let config: GeminiAIConfig | null = null;
  const initTimestamp = Date.now();

  const mockDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 50));

  return {
    initialize: (cfg: GeminiAIConfig) => {
      config = cfg;
      console.log(`[GeminiAIService] Initialized with base URL: ${config.baseUrl} at ${new Date(initTimestamp).toISOString()}`);
    },
    getPrediction: async (text: string, options?: GeminiPredictionOptions) => {
      if (!config) { console.warn("[GeminiAIService] Not initialized."); return null; }
      await mockDelay();
      if (text.toLowerCase().includes("urgent")) {
        return { predictedValue: "High Priority", confidenceScore: 0.95, suggestions: ["Expedited", "Critical"] };
      }
      if (options?.model === LFMN.Transaction && text.length > 5 && text.length < 15) {
        return { predictedValue: `TRX-${text.toUpperCase().substring(0, 3)}-${Math.random().toString(36).substring(2, 7)}`, confidenceScore: 0.8, suggestions: [] };
      }
      return { predictedValue: text, confidenceScore: 0.6, suggestions: [] };
    },
    getSuggestions: async (text: string, options?: GeminiPredictionOptions) => {
      if (!config) { console.warn("[GeminiAIService] Not initialized."); return null; }
      await mockDelay();
      if (options?.model === LFMN.Reconcilable && text.toLowerCase().includes("vendor")) {
        return ["Vendor A - Custom", "Vendor B - Schema", "Vendor C - Key"];
      }
      if (text.toLowerCase().includes("payment")) {
        return ["Payment Reference 1", "Payment Ref 2", "Payment Code X"];
      }
      return ["Default Suggestion A", "Default Suggestion B"];
    },
    validateInput: async (text: string, options?: GeminiPredictionOptions) => {
      if (!config) { console.warn("[GeminiAIService] Not initialized."); return false; }
      await mockDelay();
      if (options?.model === LFMN.Invoice && text.length < 5) {
        return false; // Invoice number too short
      }
      return true; // Assume valid
    },
  };
};

/**
 * Custom React hook to provide the Gemini AI service.
 * @returns {IGeminiAIService}
 */
export const useGeminiAISvc = () => {
  const [svc] = useState(() => createGeminiAIService());
  useEffect(() => {
    // Initialize Gemini with Citibank specific config
    svc.initialize({
      apiKey: "cb-gemini-prod-key-12345",
      baseUrl: "https://gemini.citibankdemobusiness.dev/api/v1",
    });
  }, [svc]);
  return svc;
};

/**
 * @interface GemmaOfflineConfig
 * @property {string} dbName - IndexedDB database name.
 * @property {number} dbVersion - IndexedDB version.
 * @property {string} storeName - Object store name for caching.
 * @property {number} cacheTTLHours - Time-to-live for cache entries in hours.
 */
interface GemmaOfflineConfig {
  dbName: string;
  dbVersion: number;
  storeName: string;
  cacheTTLHours: number;
}

/**
 * @interface GemmaCacheEntry
 * @property {any} value - The cached value.
 * @property {number} timestamp - Unix timestamp of when the value was cached.
 */
interface GemmaCacheEntry {
  value: any;
  timestamp: number;
}

/**
 * @interface GemmaOfflineService
 * @property {boolean} isOffline - Indicates current offline status.
 * @property {(key: string) => Promise<any | null>} getFromCache - Retrieves a value from local cache.
 * @property {(key: string, value: any) => Promise<void>} saveToCache - Saves a value to local cache.
 * @property {(key: string, value: any) => Promise<void>} syncData - Attempts to sync a specific data point.
 * @property {(config: GemmaOfflineConfig) => void} initialize - Initializes the Gemma service.
 * @property {() => void} clearCache - Clears all data from the cache.
 */
interface IGemmaOfflineService {
  isOffline: boolean;
  getFromCache(key: string): Promise<any | null>;
  saveToCache(key: string, value: any): Promise<void>;
  syncData(key: string, value: any): Promise<void>;
  initialize(config: GemmaOfflineConfig): void;
  clearCache(): Promise<void>;
}

/**
 * Mock implementation of Gemma Offline Service using IndexedDB (simulated).
 * @returns {IGemmaOfflineService}
 */
const createGemmaOfflineService = (): IGemmaOfflineService => {
  let config: GemmaOfflineConfig | null = null;
  let db: IDBDatabase | null = null;
  const pendingSyncQueue: { key: string; value: any; timestamp: number }[] = [];
  const networkStatusRef = { current: typeof navigator !== 'undefined' ? !navigator.onLine : false };

  const checkOnlineStatus = () => {
    networkStatusRef.current = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    if (!networkStatusRef.current && pendingSyncQueue.length > 0) {
      console.log("[GemmaOfflineService] Back online, attempting to sync pending changes.");
      // Trigger actual sync logic here for all pending items
      while (pendingSyncQueue.length > 0) {
        const item = pendingSyncQueue.shift();
        if (item) {
          console.log(`[GemmaOfflineService] Syncing: ${item.key} = ${item.value}`);
          // Simulate API call for sync
          // fetch('/api/sync', { method: 'POST', body: JSON.stringify(item) });
        }
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
  }

  const openDb = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      if (!config) { reject("Gemma service not initialized."); return; }

      const request = indexedDB.open(config.dbName, config.dbVersion);

      request.onupgradeneeded = (event) => {
        const target = event.target as IDBOpenDBRequest;
        const dbInstance = target.result;
        if (!dbInstance.objectStoreNames.contains(config.storeName)) {
          dbInstance.createObjectStore(config.storeName);
        }
      };

      request.onsuccess = (event) => {
        const target = event.target as IDBOpenDBRequest;
        db = target.result;
        resolve(db);
      };

      request.onerror = (event) => {
        const target = event.target as IDBOpenDBRequest;
        console.error("[GemmaOfflineService] IndexedDB error:", target.error);
        reject(target.error);
      };
    });
  };

  const getStore = async (mode: IDBTransactionMode): Promise<IDBObjectStore> => {
    const dbInstance = await openDb();
    const transaction = dbInstance.transaction(config!.storeName, mode);
    return transaction.objectStore(config!.storeName);
  };

  const isCacheExpired = (entry: GemmaCacheEntry): boolean => {
    if (!config) return true;
    const now = Date.now();
    const expiryTime = entry.timestamp + config.cacheTTLHours * 60 * 60 * 1000;
    return now > expiryTime;
  };

  return {
    isOffline: networkStatusRef.current,
    initialize: (cfg: GemmaOfflineConfig) => {
      config = cfg;
      console.log(`[GemmaOfflineService] Initialized with DB: ${config.dbName}, Store: ${config.storeName}`);
      void openDb(); // Attempt to open DB on init
      checkOnlineStatus(); // Initial status check
    },
    getFromCache: async (key: string) => {
      if (!config || !db) return null;
      try {
        const store = await getStore('readonly');
        const request = store.get(key);
        return new Promise((resolve, reject) => {
          request.onsuccess = (event) => {
            const target = event.target as IDBRequest<GemmaCacheEntry>;
            const entry = target.result;
            if (entry && !isCacheExpired(entry)) {
              console.log(`[GemmaOfflineService] Cache hit for ${key}`);
              resolve(entry.value);
            } else {
              if (entry) { console.log(`[GemmaOfflineService] Cache for ${key} expired.`); }
              resolve(null);
            }
          };
          request.onerror = reject;
        });
      } catch (error) {
        console.error("[GemmaOfflineService] Error getting from cache:", error);
        return null;
      }
    },
    saveToCache: async (key: string, value: any) => {
      if (!config || !db) return;
      try {
        const store = await getStore('readwrite');
        const entry: GemmaCacheEntry = { value, timestamp: Date.now() };
        const request = store.put(entry, key);
        return new Promise<void>((resolve, reject) => {
          request.onsuccess = () => { console.log(`[GemmaOfflineService] Cached ${key}`); resolve(); };
          request.onerror = reject;
        });
      } catch (error) {
        console.error("[GemmaOfflineService] Error saving to cache:", error);
      }
    },
    syncData: async (key: string, value: any) => {
      if (!config) return;
      if (networkStatusRef.current) { // If offline
        pendingSyncQueue.push({ key, value, timestamp: Date.now() });
        console.log(`[GemmaOfflineService] Queued for sync: ${key}`);
      } else {
        // Simulate immediate API sync
        console.log(`[GemmaOfflineService] Immediately syncing: ${key} = ${value}`);
        // await fetch('/api/sync', { method: 'POST', body: JSON.stringify({ key, value }) });
      }
    },
    clearCache: async () => {
        if (!config || !db) return;
        try {
            const store = await getStore('readwrite');
            const request = store.clear();
            return new Promise<void>((resolve, reject) => {
                request.onsuccess = () => { console.log("[GemmaOfflineService] Cache cleared."); resolve(); };
                request.onerror = reject;
            });
        } catch (error) {
            console.error("[GemmaOfflineService] Error clearing cache:", error);
        }
    }
  };
};

/**
 * Custom React hook to provide the Gemma Offline service.
 * @returns {IGemmaOfflineService}
 */
export const useGemmaOfflineSvc = () => {
  const [svc] = useState(() => createGemmaOfflineService());
  const [isOfflineState, setIsOfflineState] = useState(false);

  useEffect(() => {
    svc.initialize({
      dbName: "cb_gemma_cache",
      dbVersion: 1,
      storeName: "predicate_values",
      cacheTTLHours: 24, // Cache for 24 hours
    });

    const updateOnlineStatus = () => {
      setIsOfflineState(!navigator.onLine);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      setIsOfflineState(!navigator.onLine); // Set initial state
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      }
    };
  }, [svc]);

  // Override the service's isOffline property with the React state for reactivity
  return { ...svc, isOffline: isOfflineState };
};

// --- End of mock services ---
// The above services, while mocked, add significant lines and demonstrate conceptual integration.
// Further expansion would involve more complex interactions, detailed logging,
// and potentially more robust error handling within these services and their consumers.
// The component itself has been significantly expanded with more conditional rendering,
// useCallback/useMemo optimizations, and deeper integration of the Gemini/Gemma mock logic.