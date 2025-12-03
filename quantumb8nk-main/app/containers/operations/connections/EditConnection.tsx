// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import { LinkProps } from "~/common/ui-components/Breadcrumbs/Breadcrumbs";
import { useDispatchContext } from "~/app/MessageProvider";
import {
  useOperationsEditConnectionQuery,
  useOperationsUpdateConnectionMutation,
} from "../../../../generated/dashboard/graphqlSchema";
import EditConnectionForm, { OnSubmit } from "./EditConnectionForm";
import {
  EditFormValues,
  getConnectionEndpointFormValues,
  parseVendorSubscriptionsToCreate,
  toExtraGraphqlInputType,
} from "./types";

interface EditConnectionProps {
  match: {
    params: {
      connectionId: string;
    };
  };
}

function EditConnection({
  match: {
    params: { connectionId },
  },
}: EditConnectionProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const { data, loading } = useOperationsEditConnectionQuery({
    variables: { id: connectionId },
  });
  const [updateConnection] = useOperationsUpdateConnectionMutation();

  const connection = data?.connection;
  const extraFields = data?.connectionExtraFields;

  let content;
  let crumbs: LinkProps[] = [];

  if (connection && extraFields && !loading) {
    const extra = JSON.parse(connection.extra) as Record<string, unknown>;

    const initialValues: EditFormValues = {
      vendorCustomerId: connection.vendorCustomerId || "",
      nickname: connection.nickname || "",
      extra,
      connectionEndpoints: getConnectionEndpointFormValues(
        connection.connectionEndpoints,
      ),
      vendorSubscriptionIdsToDiscard: [],
      vendorSubscriptionsToCreate: [],
    };

    const onSubmit: OnSubmit = (values) => {
      const mutationInput = {
        id: connectionId,
        vendorCustomerId: values.vendorCustomerId,
        nickname: values.nickname,
        extra: toExtraGraphqlInputType(connection.entity, values.extra),
        vendorSubscriptionIdsToDiscard: values.vendorSubscriptionIdsToDiscard,
        vendorSubscriptionsToCreate: parseVendorSubscriptionsToCreate(
          values.vendorSubscriptionsToCreate,
        ),
      };

      return updateConnection({
        variables: {
          input: {
            ...mutationInput,
          },
        },
      })
        .then((result) => {
          const { errors = [] } = result.data?.operationsUpdateConnection || {};
          if (errors.length) {
            dispatchError(errors.toString());
          } else {
            dispatchSuccess("Connection was successfully updated.");
            window.location.href = connection.path;
          }
        })
        .catch((err: Error) => {
          dispatchError(
            err.message || "Unable to update Connection. Please try again.",
          );
        });
    };

    content = (
      <EditConnectionForm
        initialValues={initialValues}
        extraFields={extraFields}
        onSubmit={onSubmit}
      />
    );

    crumbs = [
      {
        name: "Operations",
        path: "/operations",
      },
      {
        name: "Connection",
        path: "/operations/connections",
      },
      {
        name: connection.entity,
        path: connection.path,
      },
    ];
  }
  return (
    <PageHeader
      loading={loading}
      crumbs={crumbs}
      title={`Edit ${connection?.entity || connectionId} Connection`}
    >
      {content}
    </PageHeader>
  );
}

export default EditConnection;
