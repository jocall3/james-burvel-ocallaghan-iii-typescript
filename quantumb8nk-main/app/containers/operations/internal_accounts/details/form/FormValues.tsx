// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { AddressFormValues } from "~/common/formik/FormikAddressForm";
import {
  CurrencyEnum,
  PaymentTypeEnum,
  RoutingDetailInput,
  AccountNumberTypeEnum,
  RoutingNumberTypeEnum,
  AccountDetailInput,
} from "~/generated/dashboard/graphqlSchema";

export type AccountDetailFormValues = {
  id?: string;
  accountNumber: string;
  accountNumberType: AccountNumberTypeEnum;
};

export type RoutingDetailFormValues = {
  id?: string;
  routingNumber: string;
  routingNumberType: RoutingNumberTypeEnum;
  paymentType: PaymentTypeEnum | null;
};

export type InternalAccountFormValues = {
  currency: CurrencyEnum;
  partyName: string;
  name: string;
  partyAddress: AddressFormValues;
  accountDetails: AccountDetailFormValues[];
  routingDetails: RoutingDetailFormValues[];
};

export type CustomInternalAccountFormValues = {
  currency: CurrencyEnum;
  name: string;
  partyAddress: AddressFormValues;
};

interface RoutingDetailRecord {
  id: string;
  routingNumber: string;
}

function modifiedRoutingDetailIds(
  initialRoutingDetails: RoutingDetailRecord[],
  routingDetailFormValues: RoutingDetailFormValues[],
): string[] {
  const initialRoutingNumbersById = initialRoutingDetails.reduce(
    (acc, routingDetail) => {
      acc[routingDetail.id] = routingDetail.routingNumber;
      return acc;
    },
    {},
  );

  return routingDetailFormValues.reduce((acc: string[], routingDetail) => {
    if (
      routingDetail.id &&
      routingDetail.routingNumber !==
        initialRoutingNumbersById[routingDetail.id]
    ) {
      acc.push(routingDetail.id);
    }
    return acc;
  }, []);
}

function deletedRoutingDetailIds(
  initialRoutingDetails: RoutingDetailRecord[],
  routingDetailFormValues: RoutingDetailFormValues[],
): string[] {
  const initialRoutingDetailIds = initialRoutingDetails.map(
    (routingDetail) => routingDetail.id,
  );
  const formRoutingDetailIds = routingDetailFormValues.reduce(
    (acc: string[], routingDetail) => {
      if (routingDetail.id) {
        acc.push(routingDetail.id);
      }
      return acc;
    },
    [],
  );

  return initialRoutingDetailIds.filter(
    (x) => !formRoutingDetailIds.includes(x),
  );
}

export function getRoutingDetailIdsToDiscard(
  initialRoutingDetails: RoutingDetailRecord[],
  routingDetailFormValues: RoutingDetailFormValues[],
): string[] {
  const modifiedIds = modifiedRoutingDetailIds(
    initialRoutingDetails,
    routingDetailFormValues,
  );
  const deletedIds = deletedRoutingDetailIds(
    initialRoutingDetails,
    routingDetailFormValues,
  );

  return modifiedIds.concat(deletedIds);
}

export function newRoutingDetailInputs(
  initialRoutingDetails: RoutingDetailRecord[],
  routingDetailFormValues: RoutingDetailFormValues[],
): RoutingDetailInput[] {
  const initialRoutingNumbersById = initialRoutingDetails.reduce(
    (acc, routingDetail) => {
      acc[routingDetail.id] = routingDetail.routingNumber;
      return acc;
    },
    {},
  );

  return routingDetailFormValues.reduce(
    (acc: RoutingDetailInput[], routingDetail) => {
      if (
        !routingDetail.id ||
        routingDetail.routingNumber !==
          initialRoutingNumbersById[routingDetail.id]
      ) {
        acc.push({
          routingNumberType: routingDetail.routingNumberType,
          routingNumber: routingDetail.routingNumber,
          paymentType: routingDetail.paymentType,
        });
      }
      return acc;
    },
    [],
  );
}

interface AccountDetailRecord {
  id: string;
  accountNumber: string;
}

export function getAccountDetailIdsToDiscard(
  initialAccountDetails: AccountDetailRecord[],
  accountDetailFormValues: AccountDetailFormValues[],
): string[] {
  const initialAccountDetailIds = initialAccountDetails.map(
    (accountDetail) => accountDetail.id,
  );
  const formAccountDetailIds = accountDetailFormValues.reduce(
    (acc: string[], accountDetail) => {
      if (accountDetail.id) {
        acc.push(accountDetail.id);
      }
      return acc;
    },
    [],
  );

  return initialAccountDetailIds.filter(
    (accountDetailId) => !formAccountDetailIds.includes(accountDetailId),
  );
}

export function newAccountDetailInputs(
  accountDetailFormValues: AccountDetailFormValues[],
): AccountDetailInput[] {
  return accountDetailFormValues.reduce(
    (acc: AccountDetailInput[], accountDetail) => {
      if (!accountDetail.id) {
        acc.push({
          accountNumber: accountDetail.accountNumber,
          accountNumberType: accountDetail.accountNumberType,
        });
      }
      return acc;
    },
    [],
  );
}
