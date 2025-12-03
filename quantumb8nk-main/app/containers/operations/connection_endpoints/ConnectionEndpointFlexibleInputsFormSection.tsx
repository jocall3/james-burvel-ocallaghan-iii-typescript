// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useFormikContext } from "formik";
import FlexibleFields from "~/common/formik/flexible_form/FlexibleFields";
import GraphqlQueryResult from "../../../../common/ui-components/GraphqlQueryResult/GraphqlQueryResult";
import { FormValues } from "./types";
import { FormContainer, Heading } from "../../../../common/ui-components";
import { useConnectionEndpointCreateFormFieldsQuery } from "../../../../generated/dashboard/graphqlSchema";

export interface ConnectionEndpointFlexibleInputsFormSectionProps {
  name: string;
}

export default function ConnectionEndpointFlexibleInputsFormSection({
  name,
}: ConnectionEndpointFlexibleInputsFormSectionProps) {
  const {
    values: { strategy },
  } = useFormikContext<FormValues>();
  const queryResult = useConnectionEndpointCreateFormFieldsQuery({
    variables: {
      strategy,
    },
  });

  return (
    <GraphqlQueryResult result={queryResult}>
      {({ data }) => {
        const strategyFields = data.endpointCreationStrategyFields;

        if (!strategyFields) {
          return null;
        }

        if (data.endpointCreationStrategyFields) {
          return (
            <FormContainer>
              <Heading className="mt-6" level="h2">
                Configurations
              </Heading>
              <FlexibleFields
                name={name}
                fields={data.endpointCreationStrategyFields.fields}
              />
            </FormContainer>
          );
        }

        return null;
      }}
    </GraphqlQueryResult>
  );
}
