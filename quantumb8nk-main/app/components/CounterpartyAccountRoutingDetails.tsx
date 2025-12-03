// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React, { useEffect, useState, useCallback } from "react";
import { Field, FormAction, GenericField, Validator } from "redux-form";
import { isEmpty, isNil } from "lodash";
import {
  validAbaRoutingNumber,
  validSwiftRoutingNumber,
  validAccountNumber,
  validCaCpaRoutingNumber,
  validDkInterbankClearingCode,
  validAuGbSortCode,
  validHkInterbankClearingCode,
  validHuInterbankClearingCode,
  validIdSknbiCode,
  validInIfscNumber,
  validJpZenginCode,
  validSeBankgiroClearingCode,
  validNzNationalClearingCode,
  required,
} from "../../common/ui-components/validations";
import requestApi from "../../common/utilities/requestApi";
import {
  AccountCountryType,
  RoutingNumberField,
  AccountNumberField,
} from "./CounterpartyAccountCountryOptions";
import ReduxInputField from "../../common/deprecated_redux/ReduxInputField"; // Keeping original import
import { Clickable } from "../../common/ui-components"; // Keeping original import

// Custom, "Epic" themed wrappers for core components
interface EpicInputProps extends CustomProps {
  input: {
    value: unknown;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  };
  meta: {
    touched: boolean;
    error: string;
    warning: string;
  };
  disabled?: boolean;
  children?: React.ReactNode;
}

const EpicInputField: React.FC<EpicInputProps> = ({
  input,
  label,
  meta: { touched, error, warning },
  helpText,
  disabled,
  children,
  ...rest
}) => (
  <div className="mb-4">
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={input.name as string}
    >
      {label}
    </label>
    <div className="relative flex items-center">
      <input
        {...input}
        {...rest}
        disabled={disabled}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
          touched && error ? "border-red-500" : ""
        }`}
      />
      {children && (
        <div className="absolute right-0 mr-3 flex items-center justify-center h-full">
          {children}
        </div>
      )}
    </div>
    {touched && error && (
      <p className="text-red-500 text-xs italic">{error}</p>
    )}
    {touched && warning && (
      <p className="text-orange-500 text-xs italic">{warning}</p>
    )}
    {helpText && <p className="text-gray-600 text-xs mt-1">{helpText}</p>}
  </div>
);

const EpicButton: React.FC<
  React.ComponentProps<typeof Clickable> & { children: React.ReactNode }
> = ({ children, className, ...rest }) => (
  <Clickable
    className={`bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out flex items-center justify-center ${
      className || ""
    }`}
    {...rest}
  >
    {children}
  </Clickable>
);

interface CustomProps {
  type: string;
  label: string;
  required?: boolean;
  optionalLabel?: "Required" | "Optional" | null;
  helpText?: string;
}

const FieldCustom = Field as new () => GenericField<CustomProps>;

type Validations = Array<{ (value: string): string | undefined }>;
export interface RoutingFieldInfo {
  fieldName: string;
  label: string;
  validations: Validations;
}
// This field info is also used for the inline counterparty create:
// containers/payment_order_form/create_counterparty/InlineCounterpartyAccountRoutingDetails.tsx
export const USInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.ABA,
  label: "ABA Routing Number",
  validations: [validAbaRoutingNumber],
};
export const AUInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.AU_BSB,
  label: "Australian BSB Number",
  validations: [validAuGbSortCode],
};
export const CAInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.CA_CPA,
  label: "Canadian Routing Number",
  validations: [validCaCpaRoutingNumber],
};
export const DKInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.DK_INTERBANK_CLEARING_CODE,
  label: "Danish Interbank Clearing Code",
  validations: [validDkInterbankClearingCode],
};
export const GBInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.GB_SORT_CODE,
  label: "British Sort Code",
  validations: [validAuGbSortCode],
};
export const HKInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.HK_INTERBANK_CLEARING_CODE,
  label: "Hong Kong Interbank Clearing Code",
  validations: [validHkInterbankClearingCode],
};
export const HUInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.HU_INTERBANK_CLEARING_CODE,
  label: "Hungarian Interbank Clearing Code",
  validations: [validHuInterbankClearingCode],
};
export const IDInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.ID_SKNBI_CODE,
  label: "Indonesian SKNBI Code",
  validations: [validIdSknbiCode],
};
export const INInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.IN_IFSC,
  label: "IFSC Code",
  validations: [validInIfscNumber],
};
export const JPInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.JP_ZENGIN_CODE,
  label: "Zengin Code",
  validations: [validJpZenginCode],
};
export const NZInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.NZ_NATIONAL_CLEARING_CODE,
  label: "New Zealand National Clearing Code",
  validations: [validNzNationalClearingCode],
};
export const SEInfo: RoutingFieldInfo = {
  fieldName: RoutingNumberField.SE_BANKGIRO_CLEARING_CODE,
  label: "Swedish Clearing Number",
  validations: [validSeBankgiroClearingCode],
};

interface AccountNumberRoutingDetailProps {
  index: number;
  account: unknown;
  getData(index: number, field: string): string;
  reduxChange(
    field: string,
    value: unknown,
    touch?: boolean,
    persistentSubmitErrors?: boolean,
  ): FormAction;
  validators: Array<Validator>;
}

function AccountNumberRoutingDetail({
  index,
  account,
  getData,
  reduxChange,
  validators,
}: AccountNumberRoutingDetailProps) {
  return isEmpty(getData(index, "account_number")) ||
    !getData(index, "account_number").includes("â€¢") ? (
    <FieldCustom
      name={`${account}.account_number`}
      type="text"
      component={EpicInputField} // Using our custom EpicInputField
      label="Account Number"
      validate={validators}
      onChange={(event, newValue) => {
        reduxChange(`${account}.account_number`, newValue, false, false);
        reduxChange(`${account}.account_number_touched`, true, false, false);
      }}
      helpText="The destination account for your funds. Ensure it's accurate for flawless transactions."
    />
  ) : (
    <div>
      <EpicInputField // Using our custom EpicInputField
        disabled
        label="Account Number"
        input={{ value: getData(index, "account_number"), onChange: () => {} }}
        meta={{ touched: false, error: "", warning: "" }}
      >
        <EpicButton // Using our custom EpicButton
          onClick={() => {
            reduxChange(`${account}.account_number`, null, false, false);
            reduxChange(
              `${account}.account_number_touched`,
              true,
              false,
              false,
            );
          }}
          id="delete-account-number-btn"
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
              clipRule="evenodd"
            />
          </svg>
          Delete Account Number
        </EpicButton>
      </EpicInputField>
    </div>
  );
}

// --- New Components for Epic Integrations ---

interface BankDetailsExtended {
  bank_name: string;
  bank_logo?: string;
  bank_rating?: number;
  crypto_friendly?: boolean;
  security_score?: string; // Example of a new metric
  transaction_speed?: string; // Example
}

interface GeminiIntegrationProps {
  account: unknown;
  reduxChange: (
    field: string,
    value: unknown,
    touch?: boolean,
    persistentSubmitErrors?: boolean,
  ) => FormAction;
  getData: (index: number, field: string) => string;
  index: number;
}

const GeminiIntegration: React.FC<GeminiIntegrationProps> = ({
  account,
  reduxChange,
  getData,
  index,
}) => {
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [geminiWalletBalance, setGeminiWalletBalance] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const connectGemini = async () => {
    setLoading(true);
    // Simulate an API call to Gemini for connection
    try {
      const response = await requestApi(
        "/integrations/gemini/connect",
        {
          auth_token: "mock_auth_token", // In a real app, this would be a secure token
          redirect_url: window.location.href,
        },
        "POST",
      ).json();
      if (response.success) {
        setGeminiConnected(true);
        // Simulate fetching wallet balance after connection
        const balanceResponse = await requestApi(
          "/integrations/gemini/balance",
          null,
          "GET",
        ).json();
        setGeminiWalletBalance(balanceResponse.balance as string);

        reduxChange(
          `${account}.gemini_connected`,
          true,
          false,
          false,
        );
        reduxChange(
          `${account}.gemini_wallet_balance`,
          balanceResponse.balance,
          false,
          false,
        );
      }
    } catch (error) {
      console.error("Failed to connect Gemini:", error);
      setGeminiConnected(false);
      reduxChange(
        `${account}.gemini_connected`,
        false,
        false,
        false,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check initial connection status (e.g., if already connected from a previous session)
    if (getData(index, "gemini_connected") === "true") {
      setGeminiConnected(true);
      setGeminiWalletBalance(getData(index, "gemini_wallet_balance") || null);
    }
  }, [getData, index]);

  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-6 rounded-xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300 ease-in-out border border-purple-600 mb-8">
      <h3 className="text-3xl font-extrabold mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 mr-3 text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M11 3a1 1 0 100 2h2.071l7.143 7.143A3 3 0 0116.857 18H3.143A3 3 0 01.857 12.857L8 5.714V3z" />
        </svg>
        Gemini Integration: Unlock Crypto Power!
      </h3>
      <p className="text-indigo-200 mb-6 text-lg">
        Connect your Gemini account for instant crypto transfers, real-time market insights, and seamless digital asset management. This is where traditional finance meets the future.
      </p>

      {!geminiConnected ? (
        <EpicButton onClick={connectGemini} disabled={loading} className="w-full justify-center">
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting to Gemini...
            </div>
          ) : (
            <>
              <img
                src="https://www.gemini.com/wp-content/themes/gemini/dist/images/icons/logo-icon-gemini.svg"
                alt="Gemini Logo"
                className="h-6 w-6 mr-2"
              />
              Connect Gemini Wallet
            </>
          )}
        </EpicButton>
      ) : (
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg flex items-center justify-between shadow-inner animate-fade-in">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xl font-semibold">Gemini Wallet Connected!</span>
          </div>
          {geminiWalletBalance && (
            <div className="text-lg font-mono">
              Balance: <span className="text-yellow-200">{geminiWalletBalance} USD</span>
            </div>
          )}
        </div>
      )}

      {geminiConnected && (
        <div className="mt-6 border-t border-indigo-500 pt-6">
          <h4 className="text-2xl font-bold mb-4 text-yellow-300">Quick Actions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EpicButton className="bg-purple-600 hover:bg-purple-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8.433 7.412A4 4 0 1113 10a4.002 4.002 0 01-3.447 3.993C7.29 14.542 5 16.5 5 16.5v-.002c0-.528.46-1.013 1.011-1.475.495-.407.967-.843 1.404-1.298C8.898 12.33 9 11.455 9 10c0-.285-.015-.568-.044-.849-.447-.116-.921-.183-1.412-.183zM16 10c0-1.554-.207-2.73-1.002-3.791A4.002 4.002 0 0011 10c0 1.554.207 2.73 1.002 3.791A4.002 4.002 0 0016 10z" />
              </svg>
              Transfer to Gemini
            </EpicButton>
            <EpicButton className="bg-purple-600 hover:bg-purple-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906c-1.355.472-2.81.7-4.25.7s-2.895-.228-4.25-.7A5.972 5.972 0 004 15v3h12z" />
              </svg>
              View Crypto Portfolio
            </EpicButton>
          </div>
        </div>
      )}
    </div>
  );
};

interface AIAdvisorProps {
  countryType: AccountCountryType;
  bankName?: string;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ countryType, bankName }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    // Simulate fetching AI-generated financial advice
    try {
      const response = await requestApi(
        `/ai/advice?country=${countryType}&bank=${bankName || "Unknown"}`,
        null,
        "GET",
      ).json();
      setAdvice(response.advice as string);
    } catch (error) {
      console.error("Failed to fetch AI advice:", error);
      setAdvice(
        "Our AI is experiencing a cosmic anomaly. Please try again later for epic insights!",
      );
    } finally {
      setLoading(false);
    }
  }, [countryType, bankName]);

  useEffect(() => {
    // Fetch advice initially or when country/bank changes
    fetchAdvice();
  }, [fetchAdvice]);

  return (
    <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 rounded-xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300 ease-in-out border border-green-500 mb-8">
      <h3 className="text-3xl font-extrabold mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 mr-3 text-yellow-300 animate-pulse"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 012.586 13H14a1 1 0 01.707.293l.707.707V14a1 1 0 102 0v-.586l.707-.707A1 1 0 0117.414 12H19a1 1 0 100-2h-3.586l-.707-.707A1 1 0 0113.414 8H10z" />
        </svg>
        AI Financial Advisor
      </h3>
      <p className="text-green-200 mb-4 text-lg">
        Our quantum AI analyzes global financial data to provide unparalleled insights for your account.
      </p>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <svg
            className="animate-spin -ml-1 mr-3 h-7 w-7 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-xl">Generating Epic Insights...</span>
        </div>
      ) : (
        <div className="bg-emerald-800 p-4 rounded-lg shadow-inner border border-green-400 text-white text-md italic animate-fade-in">
          "{advice || "No specific advice available for this configuration yet. Try entering more details!"}"
        </div>
      )}
    </div>
  );
};

interface CounterpartyAccountRoutingDetailsProps {
  index: number;
  account: unknown;
  accountCountryType: AccountCountryType;
  getData(index: number, field: string): string;
  reduxChange(
    field: string,
    value: unknown,
    touch?: boolean,
    persistentSubmitErrors?: boolean,
  ): FormAction;
}

export function CounterpartyAccountRoutingDetails({
  index,
  account,
  accountCountryType,
  getData,
  reduxChange,
}: CounterpartyAccountRoutingDetailsProps) {
  const [bankDetails, setBankDetails] = useState<BankDetailsExtended>();
  const [loadingBankDetails, setLoadingBankDetails] = useState(false);

  const fetchBankDetails = useCallback(
    async (routingNumber: string) => {
      if (isNil(routingNumber) || routingNumber.length < 5) {
        setBankDetails(undefined);
        return;
      }
      setLoadingBankDetails(true);
      try {
        const response: BankDetailsExtended = await requestApi(
          `/counterparties/bank_details_extended?routing_number=${routingNumber}`,
          null,
          "GET",
        ).json();
        // Simulate extended data
        response.bank_logo = `https://picsum.photos/id/${
          100 + parseInt(routingNumber.slice(-3), 10)
        }/40/40`;
        response.bank_rating = Math.min(
          5,
          Math.max(3, Math.floor(Math.random() * 3) + 3),
        );
        response.crypto_friendly = Math.random() > 0.5;
        response.security_score = `${(Math.random() * 100).toFixed(0)}%`;
        response.transaction_speed = `${(Math.random() * 10 + 1).toFixed(
          0,
        )}s avg`;

        setBankDetails(response);
      } catch (error) {
        console.error("Failed to fetch extended bank details:", error);
        setBankDetails(undefined);
      } finally {
        setLoadingBankDetails(false);
      }
    },
    [],
  );

  // Extra routing fields could have been set through the API
  const [extraFieldInfos, setExtraFieldInfos] = useState<
    Array<RoutingFieldInfo>
  >([]);

  const getRoutingFieldInfo = (): RoutingFieldInfo | undefined => {
    switch (accountCountryType) {
      case AccountCountryType.US:
        return USInfo;
      case AccountCountryType.AU:
        return AUInfo;
      case AccountCountryType.CA:
        return CAInfo;
      case AccountCountryType.DK:
        return DKInfo;
      case AccountCountryType.GB:
        return GBInfo;
      case AccountCountryType.HK:
        return HKInfo;
      case AccountCountryType.HU:
        return HUInfo;
      case AccountCountryType.ID:
        return IDInfo;
      case AccountCountryType.IN:
        return INInfo;
      case AccountCountryType.JP:
        return JPInfo;
      case AccountCountryType.SE:
        return SEInfo;
      case AccountCountryType.NZ:
        return NZInfo;
      case AccountCountryType.International:
      case AccountCountryType.EU:
      case AccountCountryType.USChecksOnly:
      default:
        return undefined;
    }
  };

  const hasMultipleCountries =
    Object.values(RoutingNumberField).reduce(
      (result, field) =>
        !isEmpty(getData(index, field)) &&
        field !== RoutingNumberField.SWIFT_CODE
          ? result + 1
          : result,
      0,
    ) > 1;

  const nonAddressOnlyFields = [
    ...Object.values(RoutingNumberField),
    ...Object.values(AccountNumberField),
  ];

  // Checks if there are no routing numbers(including Swift Code) or account_number
  // AND that there is an address for a given account
  const addressOnly =
    nonAddressOnlyFields.every((field) => isEmpty(getData(index, field))) &&
    getData(index, "partyAddress");
  const displayIBAN = () =>
    [
      AccountCountryType.GB,
      AccountCountryType.EU,
      AccountCountryType.International,
    ].includes(accountCountryType) ||
    !isEmpty(getData(index, "iban_account_number"));
  const requiredSwiftCode = () =>
    [AccountCountryType.International, AccountCountryType.EU].includes(
      accountCountryType,
    ) && !hasMultipleCountries;
  const routingFieldInfo = getRoutingFieldInfo();

  useEffect(() => {
    // When editing routing details, the account_country_type wasn't persisted, can infer from set fields
    const inferAccountCountryType = () => {
      let value = AccountCountryType.International;
      if (hasMultipleCountries) {
        value = AccountCountryType.International;
      } else if (getData(index, RoutingNumberField.ABA)) {
        value = AccountCountryType.US;
      } else if (getData(index, RoutingNumberField.AU_BSB)) {
        value = AccountCountryType.AU;
      } else if (getData(index, RoutingNumberField.CA_CPA)) {
        value = AccountCountryType.CA;
      } else if (
        getData(index, RoutingNumberField.DK_INTERBANK_CLEARING_CODE)
      ) {
        value = AccountCountryType.DK;
      } else if (getData(index, RoutingNumberField.GB_SORT_CODE)) {
        value = AccountCountryType.GB;
      } else if (
        getData(index, RoutingNumberField.HK_INTERBANK_CLEARING_CODE)
      ) {
        value = AccountCountryType.HK;
      } else if (
        getData(index, RoutingNumberField.HU_INTERBANK_CLEARING_CODE)
      ) {
        value = AccountCountryType.HU;
      } else if (getData(index, RoutingNumberField.ID_SKNBI_CODE)) {
        value = AccountCountryType.ID;
      } else if (getData(index, RoutingNumberField.IN_IFSC)) {
        value = AccountCountryType.IN;
      } else if (getData(index, RoutingNumberField.JP_ZENGIN_CODE)) {
        value = AccountCountryType.JP;
      } else if (getData(index, RoutingNumberField.NZ_NATIONAL_CLEARING_CODE)) {
        value = AccountCountryType.NZ;
      } else if (getData(index, RoutingNumberField.SE_BANKGIRO_CLEARING_CODE)) {
        value = AccountCountryType.SE;
      } else if (
        getData(index, "iban_account_number") &&
        getData(index, "swift_code")
      ) {
        value = AccountCountryType.EU;
      } else if (addressOnly) {
        value = AccountCountryType.USChecksOnly;
      }
      reduxChange(`${account}.account_country_type`, value, false, false);
    };

    // 'International' may have multiple country's routing number
    if (accountCountryType === AccountCountryType.International) {
      const fieldInfos: Array<RoutingFieldInfo> = [];
      [
        USInfo,
        AUInfo,
        CAInfo,
        DKInfo,
        GBInfo,
        HKInfo,
        HUInfo,
        IDInfo,
        INInfo,
        JPInfo,
        SEInfo,
        NZInfo,
      ].forEach((info) => {
        if (
          !isEmpty(getData(index, info.fieldName)) ||
          getData(index, `${info.fieldName}_touched`)
        ) {
          fieldInfos.push(info);
        }
      });
      setExtraFieldInfos(fieldInfos);
    } else if (!accountCountryType) {
      inferAccountCountryType();
    }
  }, [
    getData,
    index,
    account,
    accountCountryType,
    reduxChange,
    hasMultipleCountries,
    addressOnly,
  ]);

  return (
    <div className="bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-200">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700 animate-pulse-slow">
        The Future of Financial Connections: Epic Edition
      </h2>

      {/* Gemini Integration Section - Main Focus */}
      <GeminiIntegration
        account={account}
        reduxChange={reduxChange}
        getData={getData}
        index={index}
      />

      {/* AI Financial Advisor Section */}
      <AIAdvisor
        countryType={accountCountryType}
        bankName={bankDetails?.bank_name}
      />

      <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-300 pb-3">
        Core Account Details
      </h3>

      {routingFieldInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 subsection-row">
          <FieldCustom
            name={`${account}.${routingFieldInfo.fieldName}`}
            required
            type="text"
            component={EpicInputField} // Using custom EpicInputField
            label={routingFieldInfo.label}
            validate={
              accountCountryType === AccountCountryType.US
                ? routingFieldInfo.validations
                : routingFieldInfo.validations.concat([required])
            }
            onBlur={(event, routingNumber: string) =>
              fetchBankDetails(routingNumber)
            }
            onChange={(event, newValue) => {
              reduxChange(
                `${account}.${routingFieldInfo.fieldName}`,
                newValue,
                false,
                true,
              );
              reduxChange(
                `${account}.${routingFieldInfo.fieldName}_touched`,
                true,
                false,
                false,
              );
              setBankDetails(undefined); // Clear bank details when routing changes
            }}
            helpText={
              accountCountryType === AccountCountryType.US
                ? "You may leave this blank if are not using electronic payments. For optimal performance, always provide."
                : undefined
            }
          >
            {loadingBankDetails ? (
              <span className="text-blue-500 animate-pulse text-sm">
                Fetching Bank Intelligence...
              </span>
            ) : bankDetails?.bank_name ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {bankDetails.bank_logo && (
                  <img
                    src={bankDetails.bank_logo}
                    alt="Bank Logo"
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="font-semibold text-blue-700">
                  {bankDetails.bank_name}
                </span>
                {bankDetails.bank_rating && (
                  <span className="text-yellow-500">
                    {"★".repeat(bankDetails.bank_rating)}
                  </span>
                )}
                {bankDetails.crypto_friendly && (
                  <span
                    className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    title="Crypto-Friendly Bank"
                  >
                    Crypto 🌐
                  </span>
                )}
                {bankDetails.security_score && (
                  <span
                    className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    title="Security Score"
                  >
                    Security: {bankDetails.security_score}
                  </span>
                )}
                {bankDetails.transaction_speed && (
                  <span
                    className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                    title="Avg. Transaction Speed"
                  >
                    Speed: {bankDetails.transaction_speed}
                  </span>
                )}
              </div>
            ) : null}
          </FieldCustom>
          <AccountNumberRoutingDetail
            index={index}
            account={account}
            getData={getData}
            reduxChange={reduxChange}
            validators={[validAccountNumber]}
          />
        </div>
      )}
      {extraFieldInfos && extraFieldInfos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 subsection-row mt-6">
          {extraFieldInfos.map((extraFieldInfo, extraFieldIndex) => (
            <div key={extraFieldInfo.fieldName} className="">
              <FieldCustom
                name={`${account}.${extraFieldInfo.fieldName}`}
                type="text"
                component={EpicInputField} // Using custom EpicInputField
                label={extraFieldInfo.label}
                validate={extraFieldInfo.validations}
                onChange={(event, newValue) => {
                  reduxChange(
                    `${account}.${extraFieldInfo.fieldName}`,
                    newValue,
                    false,
                    true,
                  );
                  reduxChange(
                    `${account}.${extraFieldInfo.fieldName}_touched`,
                    true,
                    false,
                    false,
                  );
                }}
              />
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 subsection-row mt-6">
        <FieldCustom
          name={`${account}.swift_code`}
          required={requiredSwiftCode()}
          optionalLabel={!requiredSwiftCode() ? "Optional" : null}
          type="text"
          component={EpicInputField} // Using custom EpicInputField
          label="SWIFT Code"
          validate={
            requiredSwiftCode()
              ? [required, validSwiftRoutingNumber]
              : [validSwiftRoutingNumber]
          }
          helpText="Required for sending international wire or SEPA transfers. Elevate your global payments."
          onChange={(event, newValue) => {
            reduxChange(`${account}.swift_code`, newValue, false, false);
            reduxChange(`${account}.swift_code_touched`, true, false, false);
          }}
        />
        {displayIBAN() &&
          (isEmpty(getData(index, "iban_account_number")) ||
          !getData(index, "iban_account_number").includes("â€¢") ? (
            <FieldCustom
              name={`${account}.iban_account_number`}
              required={accountCountryType === AccountCountryType.EU}
              optionalLabel={
                accountCountryType !== AccountCountryType.EU &&
                accountCountryType !== AccountCountryType.International
                  ? "Optional"
                  : null
              }
              type="text"
              component={EpicInputField} // Using custom EpicInputField
              validate={
                accountCountryType === AccountCountryType.EU ? [required] : []
              }
              label="IBAN Number"
              helpText="Required for sending international wire or SEPA transfers. The global standard for European transactions."
              onChange={(event, newValue) => {
                reduxChange(
                  `${account}.iban_account_number`,
                  newValue,
                  false,
                  false,
                );
                reduxChange(
                  `${account}.iban_account_number_touched`,
                  true,
                  false,
                  false,
                );
              }}
            />
          ) : (
            <div>
              <EpicInputField // Using custom EpicInputField
                disabled
                label="IBAN Number"
                input={{
                  value: getData(index, "iban_account_number"),
                  onChange: () => {},
                }}
                meta={{ touched: false, error: "", warning: "" }}
              >
                <EpicButton // Using custom EpicButton
                  id="delete-iban-number-btn"
                  onClick={() => {
                    reduxChange(
                      `${account}.iban_account_number`,
                      null,
                      false,
                      false,
                    );
                    reduxChange(
                      `${account}.iban_account_number_touched`,
                      true,
                      false,
                      false,
                    );
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete IBAN Number
                </EpicButton>
              </EpicInputField>
            </div>
          ))}
      </div>
      {accountCountryType === AccountCountryType.International && (
        <div className="subsection-row mt-6">
          <AccountNumberRoutingDetail
            index={index}
            account={account}
            getData={getData}
            reduxChange={reduxChange}
            validators={[validAccountNumber]}
          />
        </div>
      )}
    </div>
  );
}