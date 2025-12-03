// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "../../../../common/ui-components";
import {
  useOperationsConnectionCreateCustomProcessingWindowQuery,
  useOperationsCreateCustomProcessingWindowMutation,
} from "../../../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../../MessageProvider";
import { CustomProcessingWindowFormValues } from "../custom_processing_windows/form/FormValues";
import CustomProcessingWindowForm from "../custom_processing_windows/form/CustomProcessingWindowForm";

interface CreateCustomProcessingWindowProps {
  match: {
    params: {
      connectionId: string;
    };
  };
}

function CreateCustomProcessingWindow({
  match: {
    params: { connectionId },
  },
}: CreateCustomProcessingWindowProps) {
  const [createCustomProcessingWindow] =
    useOperationsCreateCustomProcessingWindowMutation();
  const { dispatchError } = useDispatchContext();

  const { data, loading } =
    useOperationsConnectionCreateCustomProcessingWindowQuery({
      variables: { id: connectionId },
    });

  const connection = data?.connection;

  let content;

  if (!connection || loading) {
    content = null;
  } else {
    const handleSubmit = (formData: CustomProcessingWindowFormValues) =>
      createCustomProcessingWindow({
        variables: {
          input: {
            connectionId,
            configId: formData.vendorConfigId,
            cutoffTime: formData.cutoffTime,
          },
        },
      })
        .then((response) => {
          const { errors = [], customProcessingWindow } =
            response.data?.operationsCreateCustomProcessingWindow || {};

          if (errors.length) {
            dispatchError(errors.toString());
          } else if (customProcessingWindow && customProcessingWindow.id) {
            const customProcessingWindowId = customProcessingWindow.id;
            window.location.href = `/operations/custom_processing_windows/${customProcessingWindowId}`;
          } else {
            window.location.href = `/operations/connections/${connectionId}`;
          }
        })
        .catch((error: Error) => {
          const errorMsg =
            error.message ||
            "Sorry, could not create the Custom Processing Window";
          dispatchError(errorMsg);
        });

    const vendorConfigIds = connection.connectionEndpoints.reduce(
      (acc: string[], connectionEndpoint) => {
        connectionEndpoint.vendorSubscriptions
          .filter(
            (vendorSubscription) =>
              vendorSubscription.vendorConfig.customProcessingWindowsSupported,
          )
          .forEach((vendorSubscription) =>
            acc.push(vendorSubscription.vendorConfig.id),
          );

        return acc;
      },
      [],
    );

    const vendorConfigIdOptions = vendorConfigIds.map((id) => ({
      value: id,
      label: id,
    }));

    content = (
      <CustomProcessingWindowForm
        onSubmit={handleSubmit}
        vendorConfigIdOptions={vendorConfigIdOptions}
        connection={{
          id: connection.id,
          name: connection.nickname || connection.entity || connectionId,
        }}
      />
    );
  }

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
          name: connection?.nickname || connection?.entity || connectionId,
          path: `/operations/connections/${connectionId}`,
        },
      ]}
      title="Create Custom Processing Window"
    >
      {content}
    </PageHeader>
  );
}

export default CreateCustomProcessingWindow;
