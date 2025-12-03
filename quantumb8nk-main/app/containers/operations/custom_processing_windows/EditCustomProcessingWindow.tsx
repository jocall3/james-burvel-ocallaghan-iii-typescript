// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useDispatchContext } from "~/app/MessageProvider";
import { PageHeader } from "~/common/ui-components";
import {
  useOperationsEditCustomProcessingWindowQuery,
  useOperationsUpdateCustomProcessingWindowMutation,
} from "~/generated/dashboard/graphqlSchema";
import { CustomProcessingWindowFormValues } from "./form/FormValues";
import CustomProcessingWindowForm from "./form/CustomProcessingWindowForm";

interface EditCustomProcessingWindowProps {
  match: {
    params: {
      customProcessingWindowId: string;
    };
  };
}

function EditCustomProcessingWindow({
  match: {
    params: { customProcessingWindowId },
  },
}: EditCustomProcessingWindowProps) {
  const [updateCustomProcessingWindow] =
    useOperationsUpdateCustomProcessingWindowMutation();
  const { dispatchError } = useDispatchContext();
  const customProcessingWindowPath = `/operations/custom_processing_windows/${customProcessingWindowId}`;

  const { data, loading } = useOperationsEditCustomProcessingWindowQuery({
    variables: { id: customProcessingWindowId },
  });

  const customProcessingWindow = data?.customProcessingWindow;

  let content;

  if (!customProcessingWindow || loading) {
    content = null;
  } else {
    const initialValues: CustomProcessingWindowFormValues = {
      vendorConfigId: customProcessingWindow.configId,
      cutoffTime: customProcessingWindow.cutoffTime,
    };

    const handleSubmit = (formData: CustomProcessingWindowFormValues) =>
      updateCustomProcessingWindow({
        variables: {
          input: {
            id: customProcessingWindow.id,
            cutoffTime: formData.cutoffTime,
          },
        },
      })
        .then((response) => {
          const { errors = [] } =
            response.data?.operationsUpdateCustomProcessingWindow || {};
          if (errors.length) {
            dispatchError(errors.toString());
          } else {
            window.location.href = customProcessingWindowPath;
          }
        })
        .catch((error: Error) => {
          const errorMsg =
            error.message ||
            "Sorry, the Custom Processing Window could not be updated";
          dispatchError(errorMsg);
        });

    const { connection, configId } = customProcessingWindow;
    const vendorConfigIdOptions = [{ value: configId, label: configId }];

    content = (
      <CustomProcessingWindowForm
        initialValues={initialValues}
        customProcessingWindowId={customProcessingWindowId}
        vendorConfigIdOptions={vendorConfigIdOptions}
        onSubmit={handleSubmit}
        connection={{
          id: connection.id,
          name: connection.nickname || connection.id,
        }}
      />
    );
  }

  return (
    <PageHeader
      loading={loading}
      crumbs={[
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Custom Processing Windows",
          path: "/operations/custom_processing_windows",
        },
        {
          name: customProcessingWindow?.configId || customProcessingWindowId,
          path: customProcessingWindowPath,
        },
      ]}
      title="Edit Custom Processing Window"
    >
      {content}
    </PageHeader>
  );
}

export default EditCustomProcessingWindow;
