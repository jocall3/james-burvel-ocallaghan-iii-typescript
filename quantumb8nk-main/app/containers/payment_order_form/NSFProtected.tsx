// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { PAYMENT_TYPES_WITH_NSF } from "../../constants";
import { PaymentFieldProps } from "../../constants/payment_order_form";
import { Checkbox, FieldGroup, Label } from "../../../common/ui-components";

function NSFProtected({ form, field }: PaymentFieldProps) {
  const [nsfProtection, setNSFProtection] = useState(
    form?.values?.nsfProtected || false,
  );

  function toggleNSFProtected() {
    setNSFProtection(!nsfProtection);
    void form.setFieldValue("nsfProtected", !nsfProtection);
  }

  function toggleDisabled() {
    const { direction, paymentType } = form.values;
    if (paymentType) {
      return !(
        PAYMENT_TYPES_WITH_NSF.includes(paymentType) && direction === "debit"
      );
    }
    return true;
  }

  return (
    <FieldGroup direction="left-to-right">
      <Checkbox
        onChange={toggleNSFProtected}
        checked={nsfProtection}
        disabled={toggleDisabled()}
        id={field.name}
        name={field.name}
      />
      <Label>NSF Protected</Label>
    </FieldGroup>
  );
}

export default NSFProtected;
