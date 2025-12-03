// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FieldsRow, HorizontalRule } from "~/common/ui-components";
import { ConnectionEndpointTemplate } from "~/generated/dashboard/graphqlSchema";
import TemplateInputField from "~/app/containers/operations/connections/connection_endpoints/form/TemplateInputField";
import {
  getAuthenticationOptionFields,
  getTemplateFieldsByName,
} from "~/app/containers/operations/connections/connection_endpoints/form/utilities";

interface AuthenticationFormSectionProps {
  connectionEndpointTemplate: ConnectionEndpointTemplate;
}

function AuthenticationFormSection({
  connectionEndpointTemplate,
}: AuthenticationFormSectionProps) {
  const templateFieldsByName = getTemplateFieldsByName(
    connectionEndpointTemplate,
  );

  const authenticationOptionFields = getAuthenticationOptionFields(
    connectionEndpointTemplate,
  );

  return (
    <div>
      <div className="flex flex-row justify-between">
        <span className="text-base font-medium">Authentication</span>
      </div>

      <HorizontalRule className="my-2" />

      <FieldsRow>
        <TemplateInputField
          fieldName="authenticationStrategy"
          connectionEndpointTemplateField={
            templateFieldsByName.authentication_strategy
          }
        />
      </FieldsRow>

      <FieldsRow columns={2}>
        <TemplateInputField
          fieldName="username"
          connectionEndpointTemplateField={templateFieldsByName.username}
        />
        <TemplateInputField
          fieldName="password"
          connectionEndpointTemplateField={templateFieldsByName.password}
        />
        {authenticationOptionFields.map((templateField) => (
          <TemplateInputField
            key={templateField.name}
            fieldName={templateField.name}
            connectionEndpointTemplateField={templateField}
          />
        ))}
      </FieldsRow>
    </div>
  );
}

export default AuthenticationFormSection;
