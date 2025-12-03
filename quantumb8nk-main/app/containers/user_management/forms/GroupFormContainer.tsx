// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import GroupForm from "./GroupForm";
import {
  useGroupFormQuery,
  useUpsertGroupMutation,
  GroupConnection,
} from "../../../../generated/dashboard/graphqlSchema";
import { GroupFormValues } from "./types";
import { useDispatchContext } from "../../../MessageProvider";
import { useHandleLinkClick } from "../../../../common/utilities/handleLinkClick";

interface GroupFormContainerProps {
  match: {
    params: {
      group_id?: string;
    };
  };
  onSuccess?: () => void;
}

function GroupFormContainer({
  match: {
    params: { group_id: groupId },
  },
  onSuccess,
}: GroupFormContainerProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const handleLinkClick = useHandleLinkClick();

  const { data, loading, error } = useGroupFormQuery({
    variables: {
      id: groupId,
      fetchGroup: Boolean(groupId),
    },
    notifyOnNetworkStatusChange: true,
  });

  const [upsertGroup] = useUpsertGroupMutation({
    update(cache, { data: mutationData }) {
      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          roles(groupRef: GroupConnection) {
            return {
              ...groupRef,
              edges: [
                {
                  __typename: "GroupEdge",
                  node: {
                    id: "id",
                    ...mutationData?.upsertGroup?.group,
                  },
                },
                ...groupRef.edges,
              ],
            };
          },
        },
      });
    },
  });

  const createGroup = (values: GroupFormValues) => {
    const group = {
      id: groupId || null,
      name: values.name,
      description: values.description,
      roleId: values.roleId,
      userIds: values.userIds,
    };

    upsertGroup({
      variables: {
        input: { input: group },
      },
    })
      .then(({ data: groupData }) => {
        if (groupData?.upsertGroup?.errors.length) {
          dispatchError(groupData?.upsertGroup?.errors.toString());
        } else if (onSuccess) {
          onSuccess();
          dispatchSuccess(groupId ? "Group Updated" : "Group Created");
        } else if (groupData?.upsertGroup?.group) {
          handleLinkClick(
            `/settings/user_management/groups/${groupData.upsertGroup.group.id}`,
          );
        }
      })
      .catch(() => {
        dispatchError("An error occurred");
      });
  };

  if (!data || loading || error) {
    return null;
  }

  const formattedRoles = data.rolesUnpaginated.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  if (!groupId) {
    const initialValues = {
      name: "",
      description: "",
    };
    return (
      <GroupForm
        roleOptions={formattedRoles}
        submitMutation={createGroup}
        initialValues={initialValues}
      />
    );
  }

  const initialValues = {
    name: data.group?.name ?? "",
    description: data.group?.description ?? "",
    roleId:
      data.group?.roles && data.group?.roles.length > 0
        ? data.group.roles[0].id
        : undefined,
    userIds: data.group?.userIds,
  };

  return (
    <GroupForm
      submitMutation={createGroup}
      initialValues={initialValues}
      groupId={groupId}
      roleOptions={formattedRoles}
      scimActive={!!data?.currentOrganization?.scimActive}
    />
  );
}

export default GroupFormContainer;
