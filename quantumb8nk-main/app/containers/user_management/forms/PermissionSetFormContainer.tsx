// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import PermissionSetForm from "./PermissionSetForm";
import {
  usePermissionSetFormQuery,
  useUpsertPermissionSetMutation,
  PermissionSetConnection,
} from "../../../../generated/dashboard/graphqlSchema";
import { PermissionSetFormValues } from "./types";
import { useDispatchContext } from "../../../MessageProvider";
import { useHandleLinkClick } from "../../../../common/utilities/handleLinkClick";
import { parse } from "../../../../common/utilities/queryString";
import { ValueType } from "~/app/components/filter/util";

interface PermissionSetFormContainerProps {
  match: {
    params: {
      permission_set_id?: string;
    };
  };
  onSuccess?: () => void;
  isClone?: boolean;
}

interface LogicalCondition {
  field: string;
  value: string;
}

function formatConditions(
  conditions?: string | null,
): Record<string, ValueType> | undefined {
  if (!conditions) {
    return undefined;
  }
  const parsedConditions = JSON.parse(conditions) as LogicalCondition[];
  parsedConditions.reduce((acc, { field, value }) => {
    acc[field] = value;
    return acc;
  }, {});
  return parsedConditions.reduce((acc, { field, value }) => {
    acc[field] = value;
    return acc;
  }, {});
}

function PermissionSetFormContainer({
  match: {
    params: { permission_set_id: permissionSetId },
  },
  onSuccess,
  isClone,
}: PermissionSetFormContainerProps) {
  const { dispatchSuccess, dispatchError } = useDispatchContext();
  const handleLinkClick = useHandleLinkClick();

  const { permission_set_id: urlPermissionSetId } = parse(
    window.location.search,
  ) as {
    permission_set_id?: string;
  };
  const fetchedPermissionSetId = permissionSetId || urlPermissionSetId;

  const fromCloneAction = Boolean(urlPermissionSetId) || isClone;

  const { data, loading, error } = usePermissionSetFormQuery({
    skip: !fetchedPermissionSetId,
    variables: {
      id: fetchedPermissionSetId || "",
    },
  });

  const [upsertPermissionSet] = useUpsertPermissionSetMutation({
    refetchQueries: ["Permissions"],
    update(cache, { data: permissionSetData }) {
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          permissionSets(permissionSetsRef: PermissionSetConnection) {
            return {
              ...permissionSetsRef,
              edges: [
                {
                  __typename: "PermissionSetEdge",
                  node: {
                    id: "id",
                    ...permissionSetData?.upsertPermissionSet?.permissionSet,
                  },
                },
                ...permissionSetsRef.edges,
              ],
            };
          },
        },
      });
    },
  });

  const handleUpsertPermissionSet = (values: PermissionSetFormValues) => {
    const permissionSet = {
      id: isClone ? undefined : permissionSetId,
      name: values.name,
      description: values.description,
      permissions: values.permissions?.map((permission) => ({
        ...permission,
        includeConditions: JSON.stringify(permission.includeConditions),
        excludeConditions: JSON.stringify(permission.excludeConditions),
      })),
    };

    upsertPermissionSet({
      variables: {
        input: { input: permissionSet },
      },
    })
      .then(({ data: mutationData }) => {
        if (mutationData?.upsertPermissionSet?.errors.length) {
          dispatchError(mutationData?.upsertPermissionSet?.errors.toString());
        } else if (onSuccess) {
          onSuccess();
          dispatchSuccess(
            permissionSetId
              ? "Permission Set Updated"
              : "Permission Set Created",
          );
        } else if (mutationData?.upsertPermissionSet?.permissionSet) {
          handleLinkClick(
            `/settings/user_management/permission_sets/${mutationData.upsertPermissionSet.permissionSet.id}`,
          );
        }
      })
      .catch(() => {
        dispatchError("An error occurred");
      });
  };

  if (!fetchedPermissionSetId) {
    const initialValues = {
      name: "",
      description: "",
      permissions: [],
    };
    return (
      <PermissionSetForm
        submitMutation={handleUpsertPermissionSet}
        initialValues={initialValues}
      />
    );
  }

  if (!data || loading || error) {
    return null;
  }

  const { permissionSet } = data;
  const initialValues = {
    name: fromCloneAction
      ? `${permissionSet?.name ?? ""} COPY`
      : permissionSet?.name ?? "",
    description: permissionSet?.description ?? "",
    permissions:
      permissionSet?.permissionsJson?.map(
        ({ actions, resource, includes, excludes }) => ({
          actions,
          resource,
          includeConditions: formatConditions(includes),
          excludeConditions: formatConditions(excludes),
        }),
      ) ?? [],
  };
  return (
    <PermissionSetForm
      submitMutation={handleUpsertPermissionSet}
      initialValues={initialValues}
      permissionSetId={fromCloneAction ? undefined : fetchedPermissionSetId}
      isClone={fromCloneAction}
    />
  );
}

export default PermissionSetFormContainer;
