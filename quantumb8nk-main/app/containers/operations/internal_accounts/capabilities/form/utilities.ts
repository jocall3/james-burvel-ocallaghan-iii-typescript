// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import invariant from "ts-invariant";
import { isChecked } from "~/app/utilities/CheckboxUtils";
import { isAddressEmpty } from "~/common/formik/FormikAddressForm";
import { AccountCapabilityFormValues } from "./FormValues";

export function formatAccountCapabilityFormValuesForMutation(
  values: AccountCapabilityFormValues,
) {
  invariant(values.paymentType, "Payment type should always be defined");
  invariant(values.direction, "Direction should always be defined");

  return {
    ...values,
    paymentType: values.paymentType,
    direction: values.direction,
    identifier: values.identifier || null,
    partyName: values.partyName || null,
    paymentSubtypes:
      values.paymentSubtypes.length > 0 ? values.paymentSubtypes : null,
    anyCurrency: isChecked(values.anyCurrency),
    address: isAddressEmpty(values.address) ? null : values.address,
  };
}
