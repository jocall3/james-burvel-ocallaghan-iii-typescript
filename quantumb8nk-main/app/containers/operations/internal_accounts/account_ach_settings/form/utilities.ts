// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { AccountACHSettingFormValues } from "./FormValues";

export function formatAccountACHSettingFormValuesForMutation(
  formValues: AccountACHSettingFormValues,
) {
  return {
    ...formValues,
    direction: formValues.direction || null,
    connectionEndpointLabel: formValues.connectionEndpointLabel || null,
  };
}
