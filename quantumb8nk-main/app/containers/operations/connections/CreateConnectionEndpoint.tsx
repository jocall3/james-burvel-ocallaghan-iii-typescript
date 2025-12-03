// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import { toFlexibleInput } from "~/common/formik/flexible_form/flexibleFormUtils";
import { FormContainer } from "../../../../common/ui-components";
import GraphqlQueryResult from "../../../../common/ui-components/GraphqlQueryResult/GraphqlQueryResult";
import useErrorBanner from "../../../../common/utilities/useErrorBanner";
import {
  useCreateConnectionEndpointMutation,
  useEndpointCreationStrategyFormQuery,
} from "../../../../generated/dashboard/graphqlSchema";
import ConnectionEndpointForm, {
  OnSubmit,
  Validate,
  ValidateErrors,
} from "../connection_endpoints/ConnectionEndpointForm";

interface CreatePageProps {
  match: {
    params: {
      connectionId: string;
    };
  };
}

const validate: Validate = (values) => {
  const errors: ValidateErrors = {};

  Object.keys(values).forEach((key) => {
    const value = values[key] as string;

    // otherInputs are validated at field level in children components
    const skipValidationFields = ["otherInputs", "additionalDescriptor"];

    if (
      !skipValidationFields.includes(key) &&
      (!value || value.trim() === "")
    ) {
      errors[key] = "This field is required";
    }
  });

  return errors;
};

function CreatePage({
  match: {
    params: { connectionId },
  },
}: CreatePageProps) {
  const creationStrategyFormQuery = useEndpointCreationStrategyFormQuery({
    variables: {
      connectionId,
    },
  });

  const [createConnectionEndpoint] = useCreateConnectionEndpointMutation();
  const flashError = useErrorBanner();

  const onSubmit: OnSubmit = (values) => {
    const { ...input } = values;
    return createConnectionEndpoint({
      variables: {
        input: {
          input: {
            ...input,
            otherInputs: toFlexibleInput(input.otherInputs),
          },
        },
      },
    })
      .then((result) => {
        const data = result.data?.createConnectionEndpoint;

        if (result.errors) {
          flashError("Something went wrong!");
        } else if (data?.errors?.length) {
          flashError(data?.errors.join(", "));
        } else if (data?.connectionEndpoint) {
          window.location.href = `/operations/connections/${connectionId}?section=connectionEndpoints`;
        } else {
          flashError("Something went wrong!");
        }
      })
      .catch(() => {
        flashError("Something went wrong!");
      });
  };

  return (
    <GraphqlQueryResult result={creationStrategyFormQuery}>
      {({ data }) => {
        const { connection } = data;
        const { strategySelectOptions } = data.endpointCreationStrategyForm;

        const initialStrategy =
          strategySelectOptions.length > 0
            ? strategySelectOptions[0].value
            : null;

        if (!initialStrategy) {
          flashError(
            `There is no available endpoint creation strategy for this Connection: ${connectionId}`,
          );
          return null;
        }

        const originalInitialValues = {
          strategy: initialStrategy,
          otherInputs: { connection: connectionId },
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
              {
                name:
                  connection?.nickname || connection?.entity || connectionId,
                path: `/operations/connections/${connectionId}`,
              },
            ]}
            title="Create Connection Endpoint"
          >
            <FormContainer className="mt-4">
              <ConnectionEndpointForm
                strategySelectOptions={strategySelectOptions}
                initialValues={originalInitialValues}
                onSubmit={onSubmit}
                validate={validate}
              />
            </FormContainer>
          </PageHeader>
        );
      }}
    </GraphqlQueryResult>
  );
}

export default CreatePage;
