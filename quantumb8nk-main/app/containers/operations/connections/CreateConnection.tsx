// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "~/common/ui-components";
import GraphqlQueryResult from "~/common/ui-components/GraphqlQueryResult/GraphqlQueryResult";
import useErrorBanner from "~/common/utilities/useErrorBanner";
import {
  useConnectionCreateFormQuery,
  useCreateConnectionMutation,
} from "~/generated/dashboard/graphqlSchema";
import CreateConnectionForm, {
  OnSubmit,
  Validate,
  ValidateErrors,
} from "./CreateConnectionForm";
import { CreateFormValues, toExtraGraphqlInputType } from "./types";

const validate: Validate = (values) => {
  const errors: ValidateErrors = {};
  if (!values.entity) errors.entity = "Entity is required";
  return errors;
};

function CreateConnection() {
  const formQueryResult = useConnectionCreateFormQuery({
    variables: {},
  });

  const [createConnection] = useCreateConnectionMutation();
  const flashError = useErrorBanner();

  const onSubmit: OnSubmit = (values) =>
    createConnection({
      variables: {
        input: {
          entity: values.entity,
          nickname: values.nickname,
          vendorCustomerId: values.vendorCustomerId,
          extra: toExtraGraphqlInputType(values.entity, values.extra),
        },
      },
    })
      .then((result) => {
        if (result.errors) {
          flashError("Something went wrong!");
        } else if (result.data?.createConnection?.errors?.length) {
          flashError(result.data?.createConnection.errors[0]);
        } else if (result.data?.createConnection?.connection) {
          const connectionId = result.data.createConnection.connection.id;
          window.location.href = `/operations/connections/${connectionId}`;
        } else {
          flashError("Something went wrong!");
        }
      })
      .catch(() => {
        flashError("Something went wrong!");
      });

  return (
    <GraphqlQueryResult result={formQueryResult}>
      {({ data }) => {
        const { entitySelectOptions } = data.connectionCreateForm;
        const initialEntity = entitySelectOptions[0].value;
        const initialValues: CreateFormValues = {
          entity: initialEntity,
          nickname: "",
          vendorCustomerId: "",
          extra: {},
        };
        return (
          <PageHeader
            crumbs={[
              {
                name: "Operations",
                path: "/operations",
              },
              {
                name: "Connections",
                path: "/operations/connections",
              },
            ]}
            title="Create Connection"
          >
            <CreateConnectionForm
              entitySelectOptions={entitySelectOptions}
              initialValues={initialValues}
              onSubmit={onSubmit}
              validate={validate}
            />
          </PageHeader>
        );
      }}
    </GraphqlQueryResult>
  );
}

export default CreateConnection;
