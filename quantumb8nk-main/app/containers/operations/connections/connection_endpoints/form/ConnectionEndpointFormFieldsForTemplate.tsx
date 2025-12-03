// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FieldsRow } from "~/common/ui-components";
import {
  ConnectionEndpointTemplate,
  ConnectionEndpointTemplateField,
} from "~/generated/dashboard/graphqlSchema";
import TemplateInputField, {
  TemplateInputFieldType,
} from "~/app/containers/operations/connections/connection_endpoints/form/TemplateInputField";
import AuthenticationFormSection from "~/app/containers/operations/connections/connection_endpoints/form/AuthenticationFormSection";
import EncryptionFormSection from "~/app/containers/operations/connections/connection_endpoints/form/EncryptionFormSection";
import DecryptionFormSection from "~/app/containers/operations/connections/connection_endpoints/form/DecryptionFormSection";
import SigningFormSection from "~/app/containers/operations/connections/connection_endpoints/form/SigningFormSection";
import InboundRequestSection from "~/app/containers/operations/connections/connection_endpoints/form/InboundRequestSection";

interface ConnectionEndpointFormFieldsForTemplateProps {
  connectionEndpointTemplate: ConnectionEndpointTemplate;
}

function ConnectionEndpointFormFieldsForTemplate({
  connectionEndpointTemplate,
}: ConnectionEndpointFormFieldsForTemplateProps) {
  const fieldMapping: Partial<Record<string, ConnectionEndpointTemplateField>> =
    connectionEndpointTemplate.fields.reduce(
      (mapping, field) => ({ ...mapping, [field.name]: field }),
      {},
    );

  return (
    <>
      <FieldsRow>
        <TemplateInputField
          fieldName="label"
          connectionEndpointTemplateField={fieldMapping.label}
        />
      </FieldsRow>
      <FieldsRow>
        <TemplateInputField
          fieldName="protocol"
          connectionEndpointTemplateField={fieldMapping.protocol}
        />
      </FieldsRow>

      <FieldsRow columns={2}>
        <TemplateInputField
          fieldName="host"
          connectionEndpointTemplateField={fieldMapping.host}
        />
        <TemplateInputField
          fieldName="port"
          connectionEndpointTemplateField={fieldMapping.port}
        />
      </FieldsRow>

      <FieldsRow>
        <TemplateInputField
          fieldName="cleanAfterRead"
          connectionEndpointTemplateField={fieldMapping.clean_after_read}
          inputType={TemplateInputFieldType.CHECKBOX}
        />
      </FieldsRow>

      <AuthenticationFormSection
        connectionEndpointTemplate={connectionEndpointTemplate}
      />

      <EncryptionFormSection
        connectionEndpointTemplate={connectionEndpointTemplate}
      />

      <DecryptionFormSection
        connectionEndpointTemplate={connectionEndpointTemplate}
      />

      <SigningFormSection
        connectionEndpointTemplate={connectionEndpointTemplate}
      />

      <InboundRequestSection
        connectionEndpointTemplate={connectionEndpointTemplate}
      />
    </>
  );
}

export default ConnectionEndpointFormFieldsForTemplate;
