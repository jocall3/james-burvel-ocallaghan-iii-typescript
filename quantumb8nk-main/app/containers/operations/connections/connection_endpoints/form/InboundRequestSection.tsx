// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FieldsRow, HorizontalRule } from "~/common/ui-components";
import { ConnectionEndpointTemplate } from "~/generated/dashboard/graphqlSchema";
import TemplateInputField, {
  TemplateInputFieldType,
} from "~/app/containers/operations/connections/connection_endpoints/form/TemplateInputField";
import { getTemplateFieldsByName } from "~/app/containers/operations/connections/connection_endpoints/form/utilities";

interface InboundRequestFormSectionProps {
  connectionEndpointTemplate: ConnectionEndpointTemplate;
}

function InboundRequestFormSection({
  connectionEndpointTemplate,
}: InboundRequestFormSectionProps) {
  const templateFieldsByName = getTemplateFieldsByName(
    connectionEndpointTemplate,
  );

  return (
    <div>
      <div className="flex flex-row justify-between">
        <span className="text-base font-medium">Inbound Requests</span>
      </div>

      <HorizontalRule className="my-2" />

      <FieldsRow>
        <TemplateInputField
          fieldName="inboundAuthenticationStrategy"
          connectionEndpointTemplateField={
            templateFieldsByName.encryption_strategy
          }
        />
      </FieldsRow>

      <FieldsRow columns={2}>
        <TemplateInputField
          fieldName="allowInboundRequests"
          connectionEndpointTemplateField={
            templateFieldsByName.allow_inbound_requests
          }
          inputType={TemplateInputFieldType.CHECKBOX}
        />
      </FieldsRow>
    </div>
  );
}

export default InboundRequestFormSection;
