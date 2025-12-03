// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  useOperationsCreateConnectionEndpointMutation,
  useOperationsCreateConnectionEndpointViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import { PageHeader } from "~/common/ui-components";
import ConnectionEndpointForm from "./form/ConnectionEndpointForm";
import { ConnectionEndpointFormValues } from "./form/FormValues";
import { useDispatchContext } from "~/app/MessageProvider";
import { formatConnectonEndpointFormValuesForMutation } from "~/app/containers/operations/connections/connection_endpoints/form/utilities";

interface CreateConnectionEndpointProps {
  match: {
    params: {
      connectionId: string;
    };
  };
}
export default function CreateConnectionEndpoint({
  match: {
    params: { connectionId },
  },
}: CreateConnectionEndpointProps) {
  const { dispatchError } = useDispatchContext();
  const [createConnectionEndpoint] =
    useOperationsCreateConnectionEndpointMutation();
  const { data, loading } = useOperationsCreateConnectionEndpointViewQuery({
    variables: {
      connectionId,
    },
  });

  const handleSubmit = (values: ConnectionEndpointFormValues) => {
    const sanitizedFormValues =
      formatConnectonEndpointFormValuesForMutation(values);

    return createConnectionEndpoint({
      variables: {
        input: {
          connectionId,
          ...sanitizedFormValues,
        },
      },
    })
      .then((response) => {
        const { errors = [], connectionEndpoint } =
          response.data?.operationsCreateConnectionEndpoint || {};
        if (errors.length) {
          dispatchError(errors.toString());
        } else if (connectionEndpoint) {
          window.location.href = `/operations/connection_endpoints/${connectionEndpoint.id}`;
        }
      })
      .catch((error: Error) => {
        const errorMsg =
          error.message || "Sorry, could not create the Connection Endpoint.";
        dispatchError(errorMsg);
      });
  };

  const connection = data?.connection;
  const templates = data?.connectionEndpointTemplates;

  let content: React.ReactElement | null = null;
  let pageHeaderProps: PageHeaderProps = {
    title: "Create Connection Endpoint",
    loading,
  };

  if (!loading && connection && templates) {
    content = (
      <ConnectionEndpointForm
        onSubmit={handleSubmit}
        templates={templates}
        isEdit={false}
      />
    );

    pageHeaderProps = {
      ...pageHeaderProps,
      crumbs: [
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Connections",
          path: "/operations/connections",
        },
        {
          name: connection?.nickname || connection?.entity || connectionId,
          path: `/operations/connections/${connectionId}`,
        },
        {
          name: "Create Connection Endpoint",
        },
      ],
    };
  }

  return <PageHeader {...pageHeaderProps}>{content}</PageHeader>;
}
