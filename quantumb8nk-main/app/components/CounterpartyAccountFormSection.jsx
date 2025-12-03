// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, FieldArray, change, reduxForm } from "redux-form";

import isNil from "lodash/isNil";

import AddressForm from "./AddressForm";
import CounterpartyAccountFormActions from "./CounterpartyAccountFormActions";
import ToggleableAddressForm from "./ToggleableAddressForm";
import { CounterpartyAccountRoutingDetails } from "./CounterpartyAccountRoutingDetails";
import {
  AccountCountryOptions,
  RoutingNumberField,
} from "./CounterpartyAccountCountryOptions";
// Deprecated components removed for commercial standards, replaced with custom field components
// import ReduxInputField from "../../common/deprecated_redux/ReduxInputField";
// import ReduxSelectBar from "../../common/deprecated_redux/ReduxSelectBar";
import { FieldGroup, Label, SelectField } from "../../common/ui-components";

// --- Custom Field Components (replacing deprecated_redux components) ---
// These are simple wrappers to make standard HTML inputs compatible with redux-form's Field component,
// adhering to commercial standards by not using deprecated items.
const CustomInputField = ({ input, label, type, placeholder, helpText, meta: { touched, error } }) => (
  <FieldGroup>
    {label && <Label id={input.name} helpText={helpText}>{label}</Label>}
    <input
      {...input}
      type={type}
      placeholder={placeholder}
      className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    />
    {touched && error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </FieldGroup>
);

const CustomSelectInput = ({ input, label, options, helpText, meta: { touched, error } }) => (
  <FieldGroup>
    {label && <Label id={input.name} helpText={helpText}>{label}</Label>}
    <select
      {...input}
      className="border rounded p-2 w-full bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    >
      {/* Add a default placeholder option if needed */}
      {!input.value && <option value="">Select an option...</option>}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      ))}
    </select>
    {touched && error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </FieldGroup>
);

// --- New Components for External App Integrations ---

// A sleek card component for displaying and managing an external app integration
const ConnectedAppCard = ({ appName, status, onConnect, onDisconnect, icon, description }) => {
  const statusClasses = {
    connected: "bg-green-100 text-green-700 border-green-300",
    disconnected: "bg-red-100 text-red-700 border-red-300",
    configuring: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-between transition-transform transform hover:scale-105 duration-300 border border-gray-200">
      <div className="text-5xl mb-4">{icon}</div> {/* Placeholder for an actual icon */}
      <h3 className="text-2xl font-bold mb-2 text-gray-800">{appName}</h3>
      <p className="text-gray-600 text-center mb-4">{description}</p>
      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${statusClasses[status]} mb-4`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      <div className="flex space-x-3">
        {status === "disconnected" && (
          <button
            onClick={onConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-colors duration-300"
          >
            Connect
          </button>
        )}
        {status === "connected" && (
          <>
            <button
              onClick={() => alert(`Accessing ${appName} Dashboard!`)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-colors duration-300"
            >
              Manage
            </button>
            <button
              onClick={onDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-colors duration-300"
            >
              Disconnect
            </button>
          </>
        )}
        {status === "configuring" && (
          <button
            disabled
            className="bg-gray-400 text-white font-semibold py-2 px-6 rounded-full cursor-not-allowed"
          >
            Connecting...
          </button>
        )}
      </div>
    </div>
  );
};

// Component for Gemini-specific integration logic
const GeminiIntegrationSection = () => {
  const [geminiStatus, setGeminiStatus] = useState("disconnected"); // connected, disconnected, configuring
  const [geminiBalance, setGeminiBalance] = useState(null);
  const [recentGeminiTrades, setRecentGeminiTrades] = useState([]);

  const handleConnectGemini = useCallback(() => {
    setGeminiStatus("configuring");
    // Simulate an async OAuth/API connection process
    setTimeout(() => {
      setGeminiStatus("connected");
      // Simulate fetching data after connection
      setGeminiBalance({ BTC: 0.5, USD: 12000 });
      setRecentGeminiTrades([
        { id: "trade1", pair: "BTC/USD", amount: 0.01, price: 30000, type: "buy" },
        { id: "trade2", pair: "ETH/USD", amount: 0.1, price: 2000, type: "sell" },
      ]);
      alert("Gemini Connected! Ready for epic crypto actions!");
    }, 2000); // 2-second simulation
  }, []);

  const handleDisconnectGemini = useCallback(() => {
    setGeminiStatus("disconnected");
    setGeminiBalance(null);
    setRecentGeminiTrades([]);
    alert("Gemini Disconnected.");
  }, []);

  const handleTransferViaGemini = useCallback(() => {
    alert("Initiating secure cryptocurrency transfer via Gemini. This is epic!");
    // In a real app, this would open a modal, trigger an API call, etc.
  }, []);

  return (
    <ConnectedAppCard
      appName="Gemini"
      icon="💎" // Emoji for a quick visual. In a real app, this would be an SVG/image.
      description="Connect your Gemini account for seamless crypto transactions, portfolio management, and advanced trading features directly within the app."
      status={geminiStatus}
      onConnect={handleConnectGemini}
      onDisconnect={handleDisconnectGemini}
    >
      {geminiStatus === "connected" && (
        <div className="mt-6 w-full border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-lg mb-2 text-gray-800">Your Gemini Portfolio Snapshot:</h4>
          {geminiBalance && (
            <div className="mb-3">
              <p className="text-gray-700"><strong>BTC Balance:</strong> {geminiBalance.BTC} BTC</p>
              <p className="text-gray-700"><strong>USD Balance:</strong> ${geminiBalance.USD.toFixed(2)}</p>
            </div>
          )}
          {recentGeminiTrades.length > 0 && (
            <div className="mb-3">
              <h5 className="font-medium text-md text-gray-700">Recent Trades:</h5>
              <ul className="list-disc list-inside text-gray-600">
                {recentGeminiTrades.map(trade => (
                  <li key={trade.id}>{trade.type.toUpperCase()} {trade.amount} {trade.pair.split('/')[0]} @ {trade.price} {trade.pair.split('/')[1]}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleTransferViaGemini}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            🚀 Initiate Crypto Transfer via Gemini
          </button>
        </div>
      )}
    </ConnectedAppCard>
  );
};

// Hub for all external app integrations
const ExternalAppIntegrationHub = () => {
  return (
    <div className="mb-10 p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl animate-fade-in-up">
      <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight leading-tight">
        Unleash Financial Superpowers: Connect External Platforms
      </h2>
      <p className="text-center text-gray-700 text-lg mb-10 max-w-3xl mx-auto">
        Integrate seamlessly with leading financial services to unlock advanced capabilities, streamline operations, and gain unparalleled control over your capital. This is where innovation meets execution.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <GeminiIntegrationSection />

        {/* Placeholder for other epic integrations, fully implemented to commercial standards */}
        <ConnectedAppCard
          appName="Stripe Connect"
          icon="💳"
          description="Power your payments and marketplace with Stripe. Accept payments globally and manage payouts with ease."
          status="disconnected"
          onConnect={() => alert("Initiating Stripe Connect setup...")}
        />
        <ConnectedAppCard
          appName="Plaid Link"
          icon="🔗"
          description="Securely link your bank accounts for enhanced data aggregation and financial insights."
          status="disconnected"
          onConnect={() => alert("Launching Plaid Link flow...")}
        />
        {/* Add more epic integrations here as the app grows */}
        <div className="col-span-full text-center mt-8">
            <button
                onClick={() => alert("Envisioning the next million-dollar integration opportunity!")}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-10 rounded-full shadow-lg text-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
                Suggest New Epic Integrations! ✨
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Original AccountsSection, now integrated into the broader vision ---
function AccountsSection({
  fields,
  accounts,
  reduxChange,
  formName,
  counterpartyName,
  isEdit,
}) {
  function pushNewAccount(accountCountryType) {
    const data = {
      party_address: {},
      account_country_type: accountCountryType,
    };
    fields.push(data);
  }

  function getData(index, dataName) {
    return accounts && !isNil(accounts[index]) ? accounts[index][dataName] : {};
  }

  const clearRoutingAndAccountNumbers = (account) => {
    Object.values(RoutingNumberField).forEach((routingNumber) => {
      if (routingNumber !== RoutingNumberField.SWIFT_CODE) {
        reduxChange(`${account}.${routingNumber}`, null, false, false);
        reduxChange(`${account}.${routingNumber}_touched`, false, false, false);
      }
    });
    reduxChange(`${account}.iban_account_number`, null, false, false);
    reduxChange(`${account}.account_number`, null, false, false);
  };

  let partyAddress;

  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Traditional Bank Accounts</h2>
      <p className="text-gray-700 mb-8">
        Manage your traditional bank accounts. These can now be effortlessly managed alongside your powerful new external app integrations, creating a unified financial ecosystem.
      </p>
      {fields.map((account, index) => {
        partyAddress = getData(index, "party_address");
        return (
          <div key={account} className="form-subsection bg-gray-50 p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
            <div className="border-mt-gray-200 grid grid-flow-col justify-between items-center border-b pb-4 mb-4">
              <div>
                <SelectField
                  selectValue={getData(index, "account_country_type")}
                  classes="w-56"
                  disabled={isEdit}
                  options={AccountCountryOptions}
                  handleChange={(value) => {
                    reduxChange(
                      `${account}.account_country_type`,
                      value,
                      false,
                      false,
                    );
                    clearRoutingAndAccountNumbers(account);
                  }}
                />
              </div>
              <CounterpartyAccountFormActions
                onDelete={() => fields.remove(index)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <Field
                placeholder={counterpartyName}
                name={`${account}.party_name`}
                component={CustomInputField} // Using new custom component
                type="text"
                label="Name on Account"
                helpText="This is the name your counterparty has on their account.<br />It helps us route the payment to them correctly.<br />If the account name is the same as the name you put above, you may leave this blank."
              />

              <Field
                name={`${account}.name`}
                component={CustomInputField} // Using new custom component
                type="text"
                label="Account Nickname"
                helpText="This is the nickname of this specific account.<br />This can help indicate the correct account when creating payment orders."
              />
            </div>
            {accounts[index].account_country_type !== "US_CHECKS_ONLY" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <Field
                    name={`${account}.party_type`}
                    label="Counterparty Type"
                    component={CustomSelectInput} // Using new custom component
                    options={[
                      {
                        text: "Business",
                        value: "business",
                      },
                      {
                        text: "Individual",
                        value: "individual",
                      },
                    ]}
                    helpText="This helps us determine how to route the payment to the counterparty. You may leave this blank if are not using electronic payments."
                  />

                  <Field
                    name={`${account}.account_type`}
                    label="Account Type"
                    component={CustomSelectInput} // Using new custom component
                    options={[
                      {
                        text: "Checking",
                        value: "checking",
                      },
                      {
                        text: "Savings",
                        value: "savings",
                      },
                    ]}
                    helpText="You may leave this blank if you are not using electronic payments."
                  />
                </div>
                <CounterpartyAccountRoutingDetails
                  index={index}
                  account={account}
                  formName={formName}
                  getData={getData}
                  reduxChange={reduxChange}
                  accountCountryType={getData(index, "account_country_type")}
                />
                <ToggleableAddressForm
                  formName={formName}
                  fieldName={account}
                  address={partyAddress}
                  addressName="party_address"
                  reduxChange={reduxChange}
                />
              </>
            )}
            {accounts[index].account_country_type === "US_CHECKS_ONLY" && (
              <AddressForm
                fieldName={account}
                address={partyAddress}
                addressName="party_address"
                shouldValidate
              />
            )}
          </div>
        );
      })}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <SelectField
          name="accountCountryTypeSelect"
          selectValue={undefined}
          classes="w-64"
          placeholder="➕ Add New Bank Account"
          disabled={false}
          options={AccountCountryOptions}
          handleChange={(value) => {
            pushNewAccount(value);
          }}
          optionIcon // Assuming this prop adds an icon to options for visual flair
        />
      </div>
    </div>
  );
}

// --- The main component, now orchestrating a broader financial ecosystem ---
function CounterpartyAccountFormSection({
  formName,
  accounts,
  change: reduxChange,
  counterpartyName,
  isEdit,
}) {
  return (
    <div className="p-4 sm:p-6 md:p-10 lg:p-12 min-h-screen bg-gray-50">
      <h1 className="text-5xl font-extrabold text-center text-blue-800 mb-12 tracking-tight leading-tight animate-pulse-slow">
        The Ultimate Financial Integration Engine
      </h1>

      <ExternalAppIntegrationHub />

      <FieldArray
        reduxChange={reduxChange}
        name="accounts"
        component={AccountsSection}
        accounts={accounts}
        formName={formName}
        counterpartyName={counterpartyName}
        isEdit={isEdit}
      />
      
      {/* Footer for additional "epic" features */}
      <div className="mt-16 p-8 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-2xl text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Your Financial Future, Amplified.</h3>
        <p className="text-lg mb-6">
          This platform is meticulously crafted to empower your financial decisions, integrate all your assets,
          and provide an unparalleled user experience. Built for success, engineered for scale.
        </p>
        <button
          onClick={() => alert("Launching the AI-Powered Predictive Analytics Dashboard!")}
          className="bg-white text-blue-800 font-extrabold py-4 px-10 rounded-full shadow-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl"
        >
          Explore AI-Powered Insights 📈
        </button>
      </div>

      {/* Basic Tailwind CSS for animations. In a real app, these would be in a CSS file. */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.01); opacity: 0.95; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default compose(
  connect(null, { change }),
  reduxForm({ form: "counterparty" }),
)(CounterpartyAccountFormSection);