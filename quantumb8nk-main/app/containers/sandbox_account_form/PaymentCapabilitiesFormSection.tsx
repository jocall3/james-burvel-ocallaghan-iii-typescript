// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { useFormikContext } from "formik";
import React, { useEffect } from "react";
import { camelCase } from "lodash";
import { useSandboxSupportedPaymentTypesQuery } from "../../../generated/dashboard/graphqlSchema";
import PaymentCapabilityField from "./PaymentCapabilityField";
import { PaymentCapabilities, FormValues } from "./types";
import GraphqlQueryResult from "../../../common/ui-components/GraphqlQueryResult/GraphqlQueryResult";
import { FieldGroup, Label } from "../../../common/ui-components";

export default function PaymentCapabilitiesFormSection() {
  const {
    setFieldValue,
    values: { currency, connectionId },
  } = useFormikContext<FormValues>();
  const queryResult = useSandboxSupportedPaymentTypesQuery({
    variables: { currency, connectionId },
  });
  const { data, loading } = queryResult;

  // Clear the paymentCapabilities field when loading new data
  // and set default values when we have the new data.
  useEffect(() => {
    if (loading) {
      void setFieldValue("paymentCapabilities", {});
    } else if (data) {
      const { defaultPaymentTypes } = data.sandboxSupportedPaymentTypes;
      const value: PaymentCapabilities = defaultPaymentTypes.reduce(
        (accum, paymentType) => {
          // eslint-disable-next-line no-param-reassign
          accum[camelCase(paymentType.paymentType)] = paymentType.directions;
          return accum;
        },
        {},
      );
      void setFieldValue("paymentCapabilities", value);
    }
  }, [data, loading, setFieldValue]);

  return (
    <GraphqlQueryResult result={queryResult}>
      {({
        data: {
          sandboxSupportedPaymentTypes: { supportedPaymentTypes },
        },
      }) => (
        <FieldGroup>
          <Label>Account Capabilities</Label>
          <table className="w-full">
            <colgroup>
              <col className="w-full" />
              <col className="whitespace-nowrap" />
              <col className="whitespace-nowrap" />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left text-xs font-bold">Payment Type</th>
                <th className="px-s text-center text-xs font-bold">Credit</th>
                <th className="text-center text-xs font-bold">Debit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {supportedPaymentTypes.map(({ paymentType, directions }) => (
                <PaymentCapabilityField
                  paymentType={paymentType}
                  directions={directions}
                  key={paymentType}
                />
              ))}
            </tbody>
          </table>
        </FieldGroup>
      )}
    </GraphqlQueryResult>
  );
}
