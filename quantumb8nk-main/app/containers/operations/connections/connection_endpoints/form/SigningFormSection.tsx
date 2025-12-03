// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FieldsRow, HorizontalRule } from "~/common/ui-components";
import { ConnectionEndpointTemplate } from "~/generated/dashboard/graphqlSchema";
import TemplateInputField from "~/app/containers/operations/connections/connection_endpoints/form/TemplateInputField";
import { getTemplateFieldsByName } from "~/app/containers/operations/connections/connection_endpoints/form/utilities";

interface SigningFormSectionProps {
  connectionEndpointTemplate: ConnectionEndpointTemplate;
}

function SigningFormSection({
  connectionEndpointTemplate,
}: SigningFormSectionProps) {
  const templateFieldsByName = getTemplateFieldsByName(
    connectionEndpointTemplate,
  );

  return (
    <div>
      <div className="flex flex-row justify-between">
        <span className="text-base font-medium">Signing</span>
      </div>

      <HorizontalRule className="my-2" />

      <FieldsRow>
        <TemplateInputField
          fieldName="signingStrategy"
          connectionEndpointTemplateField={
            templateFieldsByName.signing_strategy
          }
        />
      </FieldsRow>
    </div>
  );
}

export default SigningFormSection;
