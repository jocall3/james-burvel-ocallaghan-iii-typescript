// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { FormikErrors } from "formik";
import React from "react";
import { ConnectionEndpointFormValues } from "~/app/containers/operations/connections/connection_endpoints/form/FormValues";
import { Button, HorizontalRule } from "~/common/ui-components";
import { ConnectionEndpointTemplate } from "~/generated/dashboard/graphqlSchema";

interface ConnectionEndpointFormSummaryProps {
  submitDisabled: boolean;
  isEdit: boolean;
  currentTemplate: ConnectionEndpointTemplate | undefined;
  values: ConnectionEndpointFormValues;
  errors: FormikErrors<ConnectionEndpointFormValues>;
}

function ConnectionEndpointFormSummary({
  submitDisabled,
  isEdit,
  currentTemplate,
  values,
  errors,
}: ConnectionEndpointFormSummaryProps) {
  const description = isEdit ? "Updating" : "Creating";

  return (
    <div>
      <div className="sticky top-4 mt-4 rounded border bg-background-default mint-lg:mt-0">
        <div className="grid gap-y-2 p-6">
          <div className="mb-2 text-xs text-text-muted">
            Connection Endpoint Summary
          </div>
          {description}

          <div className="w-[100] overflow-scroll">
            Connection Endpoint Template
            {JSON.stringify(currentTemplate)}
            <hr />
            Form Values Endpoint Template
            {JSON.stringify(values)}
            <hr />
            Errors
            {JSON.stringify(errors)}
          </div>
        </div>
        <HorizontalRule />
        <div className="flex justify-end px-6 py-4">
          <Button buttonType="primary" disabled={submitDisabled} isSubmit>
            {isEdit ? "Save Changes" : "Create Connection Endpoint"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConnectionEndpointFormSummary;
