// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect } from "react";
import { useFormikContext } from "formik";
import { FieldGroup, Heading, Label } from "~/common/ui-components";
import { FormikErrorMessage } from "~/common/formik";
import GraphqlQueryResult from "../../../../common/ui-components/GraphqlQueryResult/GraphqlQueryResult";
import { useConnectionExtraFieldsQuery } from "../../../../generated/dashboard/graphqlSchema";
import { CreateFormValues } from "./types";
import ConnectionExtraField from "./ConnectionExtraField";

export interface CreateConnectionExtraFormSectionProps {
  name: string;
}

export default function CreateConnectionExtraFormSection({
  name,
}: CreateConnectionExtraFormSectionProps) {
  const {
    setFieldValue,
    values: { entity },
  } = useFormikContext<CreateFormValues>();
  const queryResult = useConnectionExtraFieldsQuery({
    variables: {
      entity,
    },
  });

  useEffect(() => {
    void setFieldValue(name, {});
  }, [name, entity, setFieldValue]);

  return (
    <GraphqlQueryResult result={queryResult}>
      {({ data }) =>
        data.connectionExtraFields && (
          <FieldGroup>
            <Label disabled id="extra">
              <Heading level="h2">Extra</Heading>
            </Label>
            <ConnectionExtraField
              name={name}
              fields={data.connectionExtraFields.fields}
            />
            <FormikErrorMessage name={name} />
          </FieldGroup>
        )
      }
    </GraphqlQueryResult>
  );
}
