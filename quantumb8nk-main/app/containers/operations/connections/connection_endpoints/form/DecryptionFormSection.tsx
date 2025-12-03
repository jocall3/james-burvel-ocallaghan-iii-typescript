// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FieldsRow, HorizontalRule } from "~/common/ui-components";
import { ConnectionEndpointTemplate } from "~/generated/dashboard/graphqlSchema";
import TemplateInputField from "~/app/containers/operations/connections/connection_endpoints/form/TemplateInputField";
import {
  getDecryptionOptionFields,
  getTemplateFieldsByName,
} from "~/app/containers/operations/connections/connection_endpoints/form/utilities";

interface DecryptionFormSectionProps {
  connectionEndpointTemplate: ConnectionEndpointTemplate;
}

function DecryptionFormSection({
  connectionEndpointTemplate,
}: DecryptionFormSectionProps) {
  const templateFieldsByName = getTemplateFieldsByName(
    connectionEndpointTemplate,
  );

  const decryptionOptionFields = getDecryptionOptionFields(
    connectionEndpointTemplate,
  );

  return (
    <div>
      <div className="flex flex-row justify-between">
        <span className="text-base font-medium">Decryption</span>
      </div>

      <HorizontalRule className="my-2" />

      <FieldsRow>
        <TemplateInputField
          fieldName="decryptionStrategy"
          connectionEndpointTemplateField={
            templateFieldsByName.decryption_strategy
          }
        />
      </FieldsRow>

      {decryptionOptionFields.length > 0 && (
        <FieldsRow columns={2}>
          {decryptionOptionFields.map((templateField) => (
            <TemplateInputField
              key={templateField.name}
              fieldName={templateField.name}
              connectionEndpointTemplateField={templateField}
            />
          ))}
        </FieldsRow>
      )}
    </div>
  );
}

export default DecryptionFormSection;
