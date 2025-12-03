// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FieldsRow, HorizontalRule } from "~/common/ui-components";
import { ConnectionEndpointTemplate } from "~/generated/dashboard/graphqlSchema";
import TemplateInputField, {
  TemplateInputFieldType,
} from "~/app/containers/operations/connections/connection_endpoints/form/TemplateInputField";
import { getTemplateFieldsByName } from "~/app/containers/operations/connections/connection_endpoints/form/utilities";

interface EncryptionFormSectionProps {
  connectionEndpointTemplate: ConnectionEndpointTemplate;
}

function EncryptionFormSection({
  connectionEndpointTemplate,
}: EncryptionFormSectionProps) {
  const templateFieldsByName = getTemplateFieldsByName(
    connectionEndpointTemplate,
  );

  return (
    <div>
      <div className="flex flex-row justify-between">
        <span className="text-base font-medium">Encryption</span>
      </div>

      <HorizontalRule className="my-2" />

      <FieldsRow>
        <TemplateInputField
          fieldName="encryptionStrategy"
          connectionEndpointTemplateField={
            templateFieldsByName.encryption_strategy
          }
        />
      </FieldsRow>

      <FieldsRow columns={2}>
        <TemplateInputField
          fieldName="encryptionKey"
          connectionEndpointTemplateField={templateFieldsByName.encryption_key}
          inputType={TemplateInputFieldType.TEXTAREA}
        />
      </FieldsRow>
    </div>
  );
}

export default EncryptionFormSection;
