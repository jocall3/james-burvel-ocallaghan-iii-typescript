// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import {
  Field,
  change,
  reduxForm,
  formValueSelector,
  getFormSyncErrors,
} from "redux-form";
import InlineCounterpartyAddressForm from "./InlineCounterpartyAddressForm";
import { InlineCounterpartyAccountRoutingDetails } from "./InlineCounterpartyAccountRoutingDetails";
import {
  AccountCountryOptions,
  AccountCountryType,
  RoutingNumberField,
} from "../../../components/CounterpartyAccountCountryOptions";
import ReduxInputField from "../../../../common/deprecated_redux/ReduxInputField";
import ReduxSelectBar from "../../../../common/deprecated_redux/ReduxSelectBar";
import { Button, Icon, SelectField } from "../../../../common/ui-components";
import { required } from "../../../../common/ui-components/validations";

function mailingAddressDisplayName(address) {
  let displayAddress = "";

  displayAddress += address.line1;
  if (address.line2) {
    displayAddress += ` ${address.line1}`;
  }
  displayAddress += `, ${address.locality} ${address.region} ${address.postal_code}`;

  // Shorten mailing address if it's too long.
  if (displayAddress.length > 30) {
    displayAddress = `${displayAddress.slice(0, 30)}...`;
  }
  return displayAddress;
}

function InlineCounterpartyAccountForm({
  account,
  change: reduxChange,
  counterpartyName,
  isEdit,
  addAddress,
  errors,
  setConfirmDisabled,
  forceRemount,
}) {
  const accountErrors = errors?.account;
  const addressErrors = errors?.account?.party_address;

  const getData = useCallback(
    (dataName) => (account ? account[dataName] : {}),
    [account],
  );

  useEffect(() => {
    if (getData("account_country_type") === AccountCountryType.USChecksOnly) {
      setConfirmDisabled(!!accountErrors || !!addressErrors);
    } else {
      setConfirmDisabled(!!accountErrors);
    }
  }, [getData, setConfirmDisabled, accountErrors, addressErrors]);

  const clearRoutingAndAccountNumbers = () => {
    Object.values(RoutingNumberField).forEach((routingNumber) => {
      if (routingNumber !== RoutingNumberField.SWIFT_CODE) {
        reduxChange(`${account}.${routingNumber}`, null, false, false);
        reduxChange(`${account}.${routingNumber}_touched`, false, false, false);
      }
    });
    reduxChange("account.iban_account_number", null, false, false);
    reduxChange("account.account_number", null, false, false);
    // HACK: This component needs to be remounted to force redux-form to run validations.
    forceRemount();
  };

  const partyAddress = getData("party_address");

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm">Type</p>
        <SelectField
          selectValue={getData("account_country_type")}
          classes="w-80"
          disabled={isEdit}
          options={AccountCountryOptions}
          handleChange={(value) => {
            reduxChange("account.account_country_type", value, false, false);
            clearRoutingAndAccountNumbers();
          }}
        />
      </div>
      {account?.account_country_type !== "US_CHECKS_ONLY" && (
        <>
          <div className="flex justify-between">
            <div />
            {/* The negative margin bottom is used to undo the margin added by SelectGroup */}
            <Field
              className="-mb-2 w-80"
              name="account.party_type"
              component={ReduxSelectBar}
              selectOptions={[
                {
                  text: "Business",
                  value: "business",
                  selectedClassName: "bg-cyan-600 text-white",
                },
                {
                  text: "Individual",
                  value: "individual",
                  selectedClassName: "bg-cyan-600 text-white",
                },
              ]}
            />
          </div>
          <div className="flex justify-between">
            <div />
            {/* The negative margin bottom is used to undo the margin added by SelectGroup */}
            <Field
              className="-mb-2 w-80"
              name="account.account_type"
              component={ReduxSelectBar}
              selectOptions={[
                {
                  text: "Checking",
                  value: "checking",
                  selectedClassName: "bg-cyan-600 text-white",
                },
                {
                  text: "Savings",
                  value: "savings",
                  selectedClassName: "bg-cyan-600 text-white",
                },
              ]}
            />
          </div>
        </>
      )}
      <div className="flex justify-between">
        <p className="pt-2 text-sm">Name on Account</p>
        <Field
          placeholder={counterpartyName}
          className="w-80"
          name="account.party_name"
          component={ReduxInputField}
          validate={[required]}
          type="text"
        />
      </div>
      <div className="flex justify-between">
        <p className="pt-2 text-sm">Nickname</p>
        <Field
          className="w-80"
          name="account.name"
          component={ReduxInputField}
          type="text"
        />
      </div>
      {account?.account_country_type !== "US_CHECKS_ONLY" ? (
        <>
          <InlineCounterpartyAccountRoutingDetails
            getData={getData}
            reduxChange={reduxChange}
            accountCountryType={getData("account_country_type")}
          />
          <div className="flex justify-between">
            <div className="flex gap-2 pt-2">
              <p className="text-sm">Mailing Address</p>
              <p className="text-sm text-text-disabled">Optional</p>
            </div>
            <div className="w-80">
              {account?.party_address ? (
                <Button onClick={() => addAddress()}>
                  {mailingAddressDisplayName(account.party_address)}
                  <Icon iconName="edit" />
                </Button>
              ) : (
                <Button className="w-44" onClick={() => addAddress()}>
                  <Icon iconName="add" size="s" />
                  Add Address
                </Button>
              )}
            </div>
          </div>
        </>
      ) : (
        <InlineCounterpartyAddressForm
          fieldName="account"
          address={partyAddress}
          addressName="party_address"
          setConfirmDisabled={setConfirmDisabled}
          shouldValidate
        />
      )}
    </div>
  );
}

const selector = formValueSelector("counterparty");
const mapStateToProps = (state) => ({
  account: selector(state, "account"),
  counterpartyName: selector(state, "name"),
  errors: getFormSyncErrors("counterparty")(state),
});

export default compose(
  connect(mapStateToProps, { change }),
  reduxForm({
    form: "counterparty",
    destroyOnUnmount: false,
    keepValues: true,
  }),
)(InlineCounterpartyAccountForm);
