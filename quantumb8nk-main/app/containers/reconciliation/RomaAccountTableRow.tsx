// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useLocation } from "react-router";
import { InternalAccount } from "../../../generated/dashboard/graphqlSchema";
import { formatCount, buildFilters } from "./utils";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";
import { ButtonClickEventTypes } from "../../../common/ui-components/Button/Button";
import { Pill, Drawer } from "../../../common/ui-components";
import { getDrawerContent } from "~/common/utilities/getDrawerContent";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";

export interface TableRowProps {
  name: string;
  account: InternalAccount;
  groupBy?: string;
  tableRowKeys?: {
    [key: string]: string;
  };
}

function flattenObject(
  obj: InternalAccount,
  prefix = "",
): Record<string, string | number | null> {
  let flattened: Record<string, string | number | null> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key] as string | number | null;

    if (typeof value === "object" && value !== null) {
      const nestedPrefix = prefix ? `${prefix}.${key}` : key;
      const nestedFlattened = flattenObject(value, nestedPrefix);
      flattened = { ...flattened, ...nestedFlattened };
    } else {
      flattened[key] = value;
    }
  });

  return flattened;
}

export default function RomaAccountTableRow({
  name,
  account,
  groupBy,
  tableRowKeys,
}: TableRowProps) {
  const accountGroupName =
    account?.accountGroups?.length > 0 ? account.accountGroups[0].name : "N/A";
  const connectionName =
    account?.connection?.nickname || account?.connection?.vendor?.name;
  const location = useLocation();

  const flattenedObject = flattenObject(account);

  const [realTimeBalancesFlag] = useLiveConfiguration({
    featureName: "ledgers_account_recon_real_time_balances",
  });

  const handleClick = (event: ButtonClickEventTypes) => {
    if (account?.id) {
      const target = event.target as HTMLElement;
      const isInsideDrawer =
        target.closest(".ant-drawer") !== null ||
        target.closest(".ant-drawer *") !== null;
      if (!isInsideDrawer) {
        if (location.pathname === "/reconciliation") {
          const filters = buildFilters(account?.id);
          handleLinkClick(`/reconcile?${filters}`, event);
        } else {
          handleLinkClick(`/accounts/${account?.id}`, event);
        }
      }
    }
  };

  const textAlign = "text-right px-8";
  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer border-t border-gray-50 text-gray-700 hover:bg-[#FAFAF9]"
    >
      <td className="whitespace-nowrap px-2 py-4 text-sm">
        <div className="pl-12 text-left">{name}</div>
      </td>
      {groupBy === "banks" && (
        <td className="ml-6 whitespace-nowrap py-4 text-left text-sm text-gray-500">
          {accountGroupName}
        </td>
      )}
      {groupBy !== "banks" && (
        <td className="ml-6 whitespace-nowrap py-4 text-left text-sm text-gray-500">
          {connectionName}
        </td>
      )}
      {Object.entries(tableRowKeys || {}).map(([key]) => {
        if (Object.prototype.hasOwnProperty.call(flattenedObject, key)) {
          if (flattenedObject[key] === null) {
            return (
              <td
                key={`${account.id}-${key}`}
                className={`whitespace-nowrap ${textAlign} ml-4 py-4 text-sm text-gray-500`}
              >
                {key === "prettyLedgerVariance" ? "-" : "N/A"}
              </td>
            );
          }

          const formattedValue =
            typeof flattenedObject[key] === "number"
              ? formatCount(flattenedObject[key] as number)
              : flattenedObject[key];

          const toolTip = realTimeBalancesFlag
            ? (flattenedObject.prettyBalanceTypeAndDate as string)
            : `As of ${flattenedObject.prettyBankBalanceAsOfDate as string}`;

          let cellContent;
          if (key === "prettyLedgerVariance") {
            const rawValue = flattenedObject.ledgerVariance;

            cellContent = (
              <Drawer
                trigger={
                  <Pill dataTip={toolTip} showTooltip>
                    <span
                      className={`${rawValue === "0" ? "text-green-500" : ""}`}
                    >
                      {formattedValue}
                    </span>
                  </Pill>
                }
                path={`/accounts/${account?.id}?`}
                // TODO: LEDG-2296
                className="[&_.ant-drawer-content-wrapper]:!w-[1000px]"
              >
                {getDrawerContent("InternalAccountLedgers", account.id)}
              </Drawer>
            );
          } else {
            cellContent = formattedValue;
          }

          return (
            <td
              key={`${account.id}-${key}`}
              className={`whitespace-nowrap ${textAlign} ml-4 py-4 text-sm text-gray-500`}
            >
              {cellContent}
            </td>
          );
        }
        return null;
      })}
    </tr>
  );
}
