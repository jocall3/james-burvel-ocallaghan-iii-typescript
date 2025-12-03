// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useLocation } from "react-router-dom";
import GroupsHome from "./GroupsHomeV2";
import UsersHome from "./UsersHomeV2";
import RolesHome from "./RolesHome";
import PermissionSetsHome from "./PermissionSetsHome";
import {
  ActionItem,
  Icon,
  Popover,
  Button,
  PopoverPanel,
  PopoverTrigger,
  PageHeader,
  ButtonClickEventTypes,
} from "../../../common/ui-components";
import UserInvitationsTableView from "../../components/UserInvitationsTableView";
import { useUsersManageAbilityQuery } from "../../../generated/dashboard/graphqlSchema";
import { useHandleLinkClick } from "../../../common/utilities/handleLinkClick";

const GROUPS = "settings/user_management/groups";
const USERS = "settings/user_management/users";
const ROLES = "settings/user_management/roles";
const PERMISSION_SETS = "settings/user_management/permission_sets";
const USER_INVITATIONS = "settings/user_management/user_invitations";

const TABS = {
  [GROUPS]: "Groups",
  [ROLES]: "Roles",
  [PERMISSION_SETS]: "Permission Sets",
  [USERS]: "Users",
  [USER_INVITATIONS]: "User Invitations",
};

function UserManagementOverview() {
  const handleLinkClick = useHandleLinkClick();
  const { pathname } = useLocation();

  const currentTab = pathname.replace("/", "");
  const { loading, data, error } = useUsersManageAbilityQuery();

  const canAddUsers: boolean =
    loading || !data || error
      ? false
      : data.abilities.User.canUpdate && !data.currentOrganization?.scimActive;

  let content: JSX.Element;
  switch (currentTab) {
    case GROUPS:
      content = <GroupsHome />;
      break;
    case ROLES:
      content = <RolesHome />;
      break;
    case PERMISSION_SETS:
      content = <PermissionSetsHome />;
      break;
    case USERS:
      content = <UsersHome />;
      break;
    case USER_INVITATIONS:
      content = <UserInvitationsTableView fromUserManagement />;
      break;
    default:
      content = <GroupsHome />;
      break;
  }

  const createDropdown = (
    <div id="create-payment-dropdown" className="flex-end">
      <Popover>
        <PopoverTrigger buttonType="primary">
          Create
          <Icon
            iconName="chevron_down"
            size="s"
            color="currentColor"
            className="text-white"
          />
        </PopoverTrigger>
        <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
          <>
            <ActionItem
              onClick={(event: ButtonClickEventTypes) => {
                handleLinkClick("/settings/user_management/groups/new", event);
              }}
            >
              <div id="group">Group</div>
            </ActionItem>
            <ActionItem
              onClick={(event: ButtonClickEventTypes) => {
                handleLinkClick("/settings/user_management/roles/new", event);
              }}
            >
              <div id="role">Role</div>
            </ActionItem>
            <ActionItem
              onClick={(event: ButtonClickEventTypes) => {
                handleLinkClick(
                  "/settings/user_management/permission_sets/new",
                  event,
                );
              }}
            >
              <div id="permission-set">Permission Set</div>
            </ActionItem>
          </>
        </PopoverPanel>
      </Popover>
    </div>
  );

  return (
    <PageHeader
      title="User Management"
      action={
        <div className="grid grid-flow-col gap-4">
          {canAddUsers && (
            <Button
              onClick={(event: ButtonClickEventTypes) => {
                handleLinkClick(
                  `/settings/user_management/user_invitations/new`,
                  event,
                );
              }}
            >
              Invite User
            </Button>
          )}
          <Button
            onClick={(e) =>
              handleLinkClick("/settings/user_management/configure", e)
            }
          >
            Configure
          </Button>
          {createDropdown}
        </div>
      }
      currentSection={currentTab}
      setCurrentSection={(tab: string) => {
        handleLinkClick(`/${tab}`);
      }}
      sections={TABS}
      hideBreadCrumbs
    >
      {content}
    </PageHeader>
  );
}

export default UserManagementOverview;
