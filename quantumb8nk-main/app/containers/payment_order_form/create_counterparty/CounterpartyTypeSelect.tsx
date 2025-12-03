// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Icon } from "../../../../common/ui-components";

export enum CreationType {
  Counterparty,
  ExternalAccount,
}

interface CounterpartyTypeSelectProps {
  setType: (type: CreationType) => void;
}

function CounterpartyTypeSelect({ setType }: CounterpartyTypeSelectProps) {
  return (
    <div className="max-w-[600px]">
      <div
        id="counterpartySelect"
        onClick={() => setType(CreationType.Counterparty)}
        onKeyDown={() => {}}
        role="button"
        tabIndex={0}
        className="mb-6 rounded border border-gray-50 p-4 hover:border-gray-100 hover:bg-gray-25"
      >
        <p className="pb-4 font-medium">Create a Counterparty</p>
        <p className="pb-4 text-sm text-gray-500">
          Create a new counterparty and connect a bank account for future use.
          By creating a counterparty, you can do the following:
        </p>
        <div className="flex flex-row justify-between text-gray-500">
          <div>
            <div className="mb-4 flex flex-row">
              <Icon
                iconName="checkmark_circle"
                color="currentColor"
                className="text-green-500"
                size="m"
              />
              <p className="pl-2">Save accounts for future use</p>
            </div>
            <div className="flex flex-row">
              <Icon
                iconName="checkmark_circle"
                color="currentColor"
                className="text-green-500"
                size="m"
              />
              <p className="pl-2">Modify or add multiple bank accounts</p>
            </div>
          </div>
          <div>
            <div className="mb-4 flex flex-row">
              <Icon
                iconName="checkmark_circle"
                color="currentColor"
                className="text-green-500"
                size="m"
              />
              <p className="pl-2">Add Non-Sufficient Funds protection</p>
            </div>
            <div className="flex flex-row">
              <Icon
                iconName="checkmark_circle"
                color="currentColor"
                className="text-green-500"
                size="m"
              />
              <p className="pl-2">Add documents, metadata, and more</p>
            </div>
          </div>
        </div>
      </div>
      <div
        id="externalAccountSelect"
        onClick={() => setType(CreationType.ExternalAccount)}
        onKeyDown={() => {}}
        role="button"
        tabIndex={0}
        className="rounded border border-gray-50 p-4 hover:border-gray-100 hover:bg-gray-25"
      >
        <p className="pb-4 font-medium">Create External Bank Account</p>
        <p className="text-sm text-gray-500">
          Create a bank account that does not have an assigned counterparty.
          This is not recommended for most workflows.
        </p>
      </div>
    </div>
  );
}

export default CounterpartyTypeSelect;
