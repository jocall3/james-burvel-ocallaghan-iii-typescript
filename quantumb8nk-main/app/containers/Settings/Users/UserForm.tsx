// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useMemo } from "react";
import { useParams } from "react-router";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";
import { ClipLoader } from "react-spinners";
import { useReadLiveMode } from "~/common/utilities/useReadLiveMode";
import AuditRecordsHome from "../../../components/AuditRecordsHome";
import ReduxCheckbox from "../../../../common/deprecated_redux/ReduxCheckbox";
import ReduxInputField from "../../../../common/deprecated_redux/ReduxInputField";
import {
  Button,
  ConfirmModal,
  Label,
  DateTime,
  FieldGroup,
  MTContainer,
} from "../../../../common/ui-components";
import {
  useUserViewDeprecatedQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  UserViewDeprecatedQuery,
} from "../../../../generated/dashboard/graphqlSchema";
import SomethingWentWrong from "../../../../errors/components/SomethingWentWrong";
import NotFound from "../../../../errors/components/NotFound";
import { useDispatchContext } from "../../../MessageProvider";

interface UserFormProps {
  userData: UserViewDeprecatedQuery;
  userId: string;
}

function UserForm({ userData, userId }: UserFormProps) {
  const isLiveMode = useReadLiveMode();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const {
    organizationUser,
    currentOrganization: { canUseMfa, live: isLive, scimActive },
    groupsUnpaginated: groups,
    abilities: {
      Organization: { canEdit: canEditOrganization },
      User: { canUpdate: hasUserManagePermissions },
    },
    users: {
      nodes: [
        {
          name: userName,
          email: userEmail,
          discardedAt,
          additionalSecurity,
          groupMemberships,
          createdFromDirectory,
        },
      ],
    },
  } = userData;
  const canEditUsers = (!scimActive || !isLiveMode) && hasUserManagePermissions;
  const canDeleteUser = hasUserManagePermissions && !createdFromDirectory;
  const currentUserId = organizationUser?.user?.id;
  const [isConfirmEditOpen, setIsConfirmEditOpen] = useState(false);
  const [isConfirmAccountUpdateOpen, setIsConfirmAccountUpdateOpen] =
    useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [removedRoles, setRemovedRoles] = useState(new Set());
  const liveModeGroups = useMemo(
    () => Object.values(groups).filter((g) => g.liveMode),
    [groups],
  );
  const testModeGroups = useMemo(
    () => Object.values(groups).filter((g) => !g.liveMode),
    [groups],
  );
  const [mfaSetting, setMfaSetting] = useState(
    omit(additionalSecurity, ["__typename"]),
  );

  const [state, setState] = useState(() => {
    let liveGroups: string[] = [];
    let testGroups: string[] = [];
    let isActive = true;
    let archivedAt: string | null = null;

    liveGroups = groupMemberships
      .filter((gu) => gu.liveMode)
      .map((gu) => gu.id);
    testGroups = groupMemberships
      .filter((gu) => !gu.liveMode)
      .map((gu) => gu.id);

    isActive = !discardedAt;
    archivedAt = discardedAt as string;

    return {
      userId,
      email: userEmail,
      name: userName,
      liveGroups,
      testGroups,
      isActive,
      archivedAt,
    };
  });

  const auditTrail = useMemo(() => {
    const showTrail = state.userId === currentUserId || canEditOrganization;
    return showTrail ? (
      <AuditRecordsHome
        showIP
        perPage={10}
        queryArgs={{ actorId: state.userId, actorType: "User" }}
      />
    ) : (
      <div className="font-italic text-center">
        You need to be an admin to view other user’s audit trails
      </div>
    );
  }, [state.userId, currentUserId, canEditOrganization]);

  function headerText() {
    if (!state.isActive) {
      return "Deleted User";
    }

    if (canEditUsers) {
      return "Update User";
    }

    return "View User";
  }

  function onGroupToggle(e: React.ChangeEvent<HTMLInputElement>, liveMode) {
    const groupIdsKey = liveMode ? "liveGroups" : "testGroups";
    const { [groupIdsKey]: groupIds } = state;

    const clickedId = e.target.id;
    const checked = !groupIds.includes(clickedId);

    if (checked) {
      removedRoles.delete(clickedId);
      setRemovedRoles(removedRoles);
    } else {
      removedRoles.add(clickedId);
      setRemovedRoles(removedRoles);
    }

    setState(() => {
      if (checked) {
        return { ...state, [groupIdsKey]: [...groupIds, clickedId] };
      }
      const newGroupIds = groupIds.filter((groupId) => groupId !== clickedId);
      return { ...state, [groupIdsKey]: newGroupIds };
    });
  }

  function onUserDataChange(e: React.ChangeEvent<HTMLInputElement>) {
    const {
      target: {
        value,
        dataset: { field },
      },
    } = e;
    if (field) {
      setState({ ...state, [field]: value });
    }
  }

  function onDeleteUser() {
    deleteUser({
      variables: {
        input: {
          input: {
            id: userId,
          },
        },
      },
    })
      .then(({ data }) => {
        const errors = data?.deleteUser?.errors;
        if (errors?.length) {
          dispatchError(errors.toString());
          setIsConfirmDeleteOpen(false);
        } else {
          window.location.href = "/settings/users";
        }
      })
      .catch(() => {
        dispatchError(
          "Sorry but we couldn't delete this user data. Please check for anything that is invalid",
        );
        setIsConfirmDeleteOpen(false);
      });
  }

  function renderGroupCheckboxes(
    groupsToDisplay: typeof groups,
    isLiveModeGroups: boolean,
  ) {
    const groupIds = isLiveModeGroups ? state.liveGroups : state.testGroups;
    const disableCheckBox =
      !hasUserManagePermissions ||
      (scimActive && isLiveModeGroups) ||
      (isLiveModeGroups && !isLiveMode);

    let groupRows: React.ReactNode;
    if (isEmpty(groupsToDisplay)) {
      groupRows = (
        <div className="index-table-row highlighted-row">
          <div className="table-entry">
            You have insufficient permissions to give this user roles in this
            mode
          </div>
        </div>
      );
    } else if (isLiveMode !== isLiveModeGroups) {
      groupRows = (
        <div className="pb-4 pt-2 italic">
          Switch to {isLiveMode ? "sandbox" : "live"} mode to edit this user’s{" "}
          {isLiveMode ? "sandbox" : "live"} roles.
        </div>
      );
    } else {
      groupRows = groupsToDisplay.map((g) => (
        <div key={g.id} className="index-table-row">
          <div className="table-entry">{g.name}</div>
          <div className="mr-6 mt-2 flex">
            <ReduxCheckbox
              name={`checkbox${g.id}`}
              id={g.id}
              input={{
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  onGroupToggle(e, isLiveModeGroups),
                checked: groupIds.includes(g.id),
              }}
              disabled={disableCheckBox}
            />
          </div>
        </div>
      ));
    }

    return (
      <div className="index-table table-permissions table w-full">
        <div className="table-head">
          <div className="header-row index-table-row">
            <div className="table-entry">Roles</div>
            <div className="table-entry table-entry-right-align">
              Select Roles
            </div>
          </div>
        </div>
        <div className="table-body">{groupRows}</div>
      </div>
    );
  }

  function submitForm() {
    const { liveGroups, testGroups, name } = state;

    const data = {
      name,
      additionalSecurity: mfaSetting,
      ...(!isEmpty(liveModeGroups) ? { liveGroups } : {}),
      ...(!isEmpty(testModeGroups) ? { testGroups } : {}),
    };

    updateUser({
      variables: {
        input: {
          input: {
            id: userId,
            ...data,
          },
        },
      },
    })
      .then(({ data: result }) => {
        const errors = result?.updateUser?.errors;
        if (errors?.length) {
          dispatchError(errors.toString());
        } else {
          setIsConfirmEditOpen(false);
          setIsConfirmAccountUpdateOpen(false);
          setRemovedRoles(new Set());
          dispatchSuccess("User Updated");
        }
      })
      .catch(() => {
        dispatchError(
          "Sorry but we couldn't save this user data. Please check for anything that is invalid",
        );
      });
  }

  function handleSubmit() {
    if (
      (!isEmpty(liveModeGroups) && isEmpty(state.liveGroups)) ||
      (!isEmpty(testModeGroups) && isEmpty(state.testGroups))
    ) {
      setIsConfirmEditOpen(true);
    } else if (removedRoles.size !== 0) {
      setIsConfirmAccountUpdateOpen(true);
    } else {
      submitForm();
    }
  }

  const updateUserButton = (
    <Button buttonType="primary" onClick={handleSubmit}>
      Update User
    </Button>
  );

  const deleteUserButton = (
    <Button
      buttonType="destructive"
      onClick={() => setIsConfirmDeleteOpen(true)}
    >
      Delete User
    </Button>
  );

  function rolesCheckboxes() {
    return (
      <>
        <div className="form-section">
          <h3 className="h3-no-bottom-border">
            <span>Roles (Live Mode)</span>
            {!isLive ? (
              <div className="header-hint">
                These roles will determine this user’s permissions when your
                organization is live in production. We recommend giving users at
                least one role in live mode if you want them to have access to
                live data.
              </div>
            ) : null}
          </h3>
          {renderGroupCheckboxes(liveModeGroups, true)}
        </div>

        <div className="form-section">
          <h3 className="h3-no-bottom-border">Roles (Test Mode)</h3>
          {renderGroupCheckboxes(testModeGroups, false)}
        </div>
      </>
    );
  }

  function emailAddendum() {
    return (
      <div className="-mt-3 mb-3 text-xs">
        <span>
          Please view&nbsp;
          <a
            target="_blank"
            rel="noreferrer"
            href="https://help.moderntreasury.com/hc/en-us/articles/8378724123533"
          >
            this help article
          </a>
          &nbsp;to change this email.
        </span>
      </div>
    );
  }

  function deletedText() {
    return (
      <div className="mb-2 inline-block">
        <div className="flex flex-row rounded bg-yellow-50 px-2 py-1 text-yellow-700">
          <span>Deleted At:&nbsp;</span>
          <DateTime timestamp={state.archivedAt} />
        </div>
      </div>
    );
  }

  return (
    <>
      <MTContainer header={headerText()}>
        {state.archivedAt && deletedText()}
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          setIsOpen={setIsConfirmDeleteOpen}
          title={`Are you sure you want to delete ${state.email}?`}
          onConfirm={onDeleteUser}
          confirmType="delete"
        />
        <ConfirmModal
          isOpen={isConfirmEditOpen}
          setIsOpen={setIsConfirmEditOpen}
          title="Confirm Roles"
          onConfirm={submitForm}
          confirmText="Update User"
          cancelText="Back"
        >
          <div>
            <span>{`Before you save this user, please confirm their roles. The user is currently configured with no roles in ${
              isEmpty(state.liveGroups) ? "Live" : "Test"
            } Mode. If this configuration is intended, you may save the user below. For more details about roles in Modern Treasury, refer to our `}</span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://help.moderntreasury.com/hc/en-us/articles/360062065312-How-to-Create-Roles-and-Permissions"
            >
              help documentation.
            </a>
          </div>
        </ConfirmModal>
        <ConfirmModal
          title="Confirm Permissions"
          isOpen={isConfirmAccountUpdateOpen}
          setIsOpen={setIsConfirmAccountUpdateOpen}
          onConfirm={submitForm}
          confirmText="Update Permissions"
          cancelText="Back"
        >
          <div>
            Removing access to internal accounts will result in reports becoming
            inaccessible if the owners no longer have access to the accounts.
            Are you sure you want to update permissions?
          </div>
        </ConfirmModal>

        <form onSubmit={submitForm} className="form-create">
          <div className="form-section user-detail-form-section">
            <div className="form-row form-row-full flex">
              <ReduxInputField
                required
                input={{
                  onChange: onUserDataChange,
                  value: state.name ?? "",
                  name: "name",
                }}
                label="Name"
                type="name"
                disabled={!(canEditUsers && state.isActive)}
                dataField="name"
              />
            </div>
            <div className="form-row form-row-full flex flex-col">
              <ReduxInputField
                required
                input={{
                  onChange: onUserDataChange,
                  value: state.email,
                  name: "email",
                }}
                label="Email"
                type="email"
                disabled
                dataField="email"
              />
              {state.isActive && emailAddendum()}
            </div>
          </div>
          <div className="form-section">
            <h3 className="h3-no-bottom-border">
              <span>Multi-factor authentication</span>
            </h3>
            {canUseMfa && (
              <FieldGroup direction="left-to-right">
                <ReduxCheckbox
                  id="mfaSetting"
                  input={{
                    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                      setMfaSetting({
                        ...mfaSetting,
                        auth0Mfa: event.target.checked,
                      }),
                    checked: !!mfaSetting.auth0Mfa,
                    "data-field": "auth0Mfa",
                  }}
                  name="auth0Mfa"
                  disabled={!canEditUsers}
                />
                <Label
                  id="mfaSetting"
                  helpText="When checked, this user will only be able to access this organization when using multi-factor authentication. <br />If it is their first time logging in after enabling this setting, the user will be prompted to set up multi-factor authentication.<br /><br /><br />Note: Google sign-in and SAML users will not be affected by this setting."
                >
                  Require multi-factor authentication
                </Label>
              </FieldGroup>
            )}
            {!canUseMfa && (
              <div className="-mt-3 mb-3 text-xs">
                <span>Please reach out to </span>
                <a href="mailto: support@moderntreasury.com">
                  support@moderntreasury.com
                </a>
                <span> to enable this feature</span>
              </div>
            )}
          </div>

          {state.isActive && rolesCheckboxes()}
          <div className="flex flex-row space-x-2">
            {canEditUsers && state.isActive && updateUserButton}
            {canDeleteUser && state.isActive && deleteUserButton}
          </div>
        </form>
      </MTContainer>
      {auditTrail}
    </>
  );
}

export default function FetchUserViewContainer(props) {
  const { user_id: userId } = useParams<{ user_id: string }>();
  const {
    loading,
    data: userData,
    error,
  } = useUserViewDeprecatedQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      id: userId,
    },
  });

  if (loading && !userData) {
    return <ClipLoader />;
  }
  if (error) {
    return <SomethingWentWrong />;
  }
  if (userData?.users.nodes.length === 0) {
    return (
      <NotFound
        message="Unable to find User."
        subtext="We can't find the page you're looking for."
      />
    );
  }

  return <UserForm {...props} userData={userData} userId={userId} />;
}
