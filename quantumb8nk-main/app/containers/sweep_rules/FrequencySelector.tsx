// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field } from "formik";
import React from "react";
import { FieldGroup } from "../../../common/ui-components";
import { FormikSelectField, FormikErrorMessage } from "../../../common/formik";

function FrequencySelector({ plural }: { plural?: boolean }) {
  const options = ["Day", "Week"].map((value) => ({
    label: plural ? `${value}s` : value,
    value: value.toLowerCase(),
  }));

  return (
    <FieldGroup key="Frequency">
      <Field
        id="schedule.every"
        name="schedule.every"
        options={options}
        component={FormikSelectField}
      />
      <FormikErrorMessage name="every" />
    </FieldGroup>
  );
}

export default FrequencySelector;
