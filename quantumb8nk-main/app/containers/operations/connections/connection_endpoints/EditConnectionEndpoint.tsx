// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "~/common/ui-components";
import {
  useOperationsEditConnectionEndpointQuery,
  useOperationsUpdateConnectionEndpointMutation,
} from "~/generated/dashboard/graphqlSchema";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import { useDispatchContext } from "~/app/MessageProvider";
import { ConnectionEndpointFormValues } from "~/app/containers/operations/connections/connection_endpoints/form/FormValues";
import { formatConnectonEndpointFormValuesForMutation } from "~/app/containers/operations/connections/connection_endpoints/form/utilities";
import ConnectionEndpointForm from "~/app/containers/operations/connections/connection_endpoints/form/ConnectionEndpointForm";

interface EditConnectionEndpointProps {
  match: {
    params: {
      connectionEndpointId: string;
    };
  };
}

function EditConnectionEndpoint({
  match: {
    params: { connectionEndpointId },
  },
}: EditConnectionEndpointProps) {
  const [updateConnectionEndpoint] =
    useOperationsUpdateConnectionEndpointMutation();
  const { dispatchSuccess, dispatchError } = useDispatchContext();

  const { data, loading } = useOperationsEditConnectionEndpointQuery({
    variables: {
      id: connectionEndpointId,
    },
  });

  const connectionEndpoint = data?.connectionEndpoint;

  let content: React.ReactElement | null = null;
  let pageHeaderProps: PageHeaderProps = {
    title: "Edit Connection Endpoint",
    loading,
  };

  if (
    !loading &&
    connectionEndpoint &&
    connectionEndpoint.connectionEndpointTemplate
  ) {
    const {
      connection,
      operationsEndpoint: endpoint,
      connectionEndpointTemplate,
    } = connectionEndpoint;

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
          name: connection.bestName,
          path: `/operations/connections/${connection.id}`,
        },
        {
          name: "Connection Endpoints",
          path: `/operations/connections/${connection.id}?section=connectionEndpoints`,
        },
        {
          name: connectionEndpoint.label,
          path: `/operations/connection_endpoints/${connectionEndpointId}`,
        },
        {
          name: "Edit",
        },
      ],
    };
    const initialValues: ConnectionEndpointFormValues = {
      connectionEndpointTemplateId: connectionEndpointTemplate.id,
      label: connectionEndpoint.label,
      protocol: endpoint.protocol,
      host: endpoint.host || "",
      cleanAfterRead: [endpoint.cleanAfterRead],
      allowInboundRequests: [endpoint.allowInboundRequests],
      authenticationStrategy: endpoint.authenticationStrategy || null,
      port: endpoint.port || "",
      username: endpoint.username || "",
      password: "TODO - Encrypted Stuff",
      authentication_options: JSON.parse(
        endpoint.authenticationOptions,
      ) as Record<string, string>,
      encryptionStrategy: endpoint.encryptionStrategy || null,
      encryptionKey: null,
      decryption_options: JSON.parse(endpoint.decryptionOptions) as Record<
        string,
        string
      >,
      signingStrategy: endpoint.signingStrategy || null,
      decryptionStrategy: endpoint.decryptionStrategy || null,
      inboundAuthenticationStrategy: null,
    };

    const handleSubmit = (formData: ConnectionEndpointFormValues) => {
      const values = formatConnectonEndpointFormValuesForMutation(formData);

      // Avoid spread operator to strict type check
      return updateConnectionEndpoint({
        variables: {
          input: {
            id: connectionEndpointId,
            host: values.host,
            port: values.port,
            allowInboundRequests: values.allowInboundRequests,
            cleanAfterRead: values.cleanAfterRead,
            username: values.username,
          },
        },
      })
        .then((response) => {
          const { errors = [] } =
            response.data?.operationsUpdateConnectionEndpoint || {};
          if (errors.length) {
            dispatchError(errors.toString());
          } else {
            window.location.href = `/operations/connection_endpoints/${connectionEndpointId}`;
            dispatchSuccess("Updated Endpoint");
          }
        })
        .catch((error: Error) => {
          const errorMsg =
            error.message || "Sorry, could not update the Connection Endpoint";
          dispatchError(errorMsg);
        });
    };

    content = (
      <ConnectionEndpointForm
        initialFormValues={initialValues}
        onSubmit={handleSubmit}
        isEdit={false}
        templates={[connectionEndpointTemplate]}
      />
    );
  }

  return <PageHeader {...pageHeaderProps}>{content}</PageHeader>;
}

export default EditConnectionEndpoint;
