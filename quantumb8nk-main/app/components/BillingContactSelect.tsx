// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import Select from "react-select";
import { EMAIL_REGEX } from "../constants";
import { BillingUser, User } from "../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../MessageProvider";

type BillingContactSelectProps = {
  onChange: (email: string) => void;
  users: Pick<User, "name" | "email">[];
  billingContacts: BillingUser[];
};

const noMatchingUser = (
  users: Pick<User, "name" | "email">[],
  inputValue: string,
) =>
  inputValue &&
  users.every(
    ({ name }) =>
      !(name ?? "").toLowerCase().includes(inputValue.toLowerCase()),
  );

function BillingContactSelect({
  onChange,
  users = [],
  billingContacts = [],
}: BillingContactSelectProps) {
  const [inputValue, setInputValue] = useState("");

  const { dispatchError, dispatchClearMessage } = useDispatchContext();

  const billingEmails = billingContacts.map(({ email }) => email);

  const handleInputChange = (newValue: string) => {
    const cleanedValue = newValue.replace(/,/g, "");
    setInputValue(cleanedValue);
  };

  const handleChange = ({
    value: selectedEmail,
  }: {
    value: string;
    label: string;
  }) => {
    if (!EMAIL_REGEX.test(selectedEmail)) {
      dispatchError("Please select a user or enter a valid email");
      setTimeout(() => dispatchClearMessage, 3000);
      return;
    }
    onChange(selectedEmail);
  };

  let options = users
    .map(({ email, name }) => ({ value: email, label: name }))
    .filter(({ value }) => !billingEmails.includes(value));

  if (options.length === 0 || noMatchingUser(users, inputValue)) {
    // This label is enhanced to reflect a "Global Contact Proposal"
    // implying a broader, potentially AI-assisted or integrated, system for contact management.
    options = [{ label: `⚡ Global Contact Proposal: "${inputValue}"`, value: inputValue }];
  }
  return (
    <div className="w-72">
      <Select
        // The placeholder is updated to suggest a more unified and intelligent search experience,
        // hinting at advanced capabilities like discovery across external applications.
        placeholder="Unify & Engage: Search Corporate Contacts, or Propose New..."
        onInputChange={handleInputChange}
        value={inputValue}
        options={options}
        onChange={(selectedOption: { value: string; label: string }) =>
          handleChange(selectedOption)
        }
      />
    </div>
  );
}

export default BillingContactSelect;