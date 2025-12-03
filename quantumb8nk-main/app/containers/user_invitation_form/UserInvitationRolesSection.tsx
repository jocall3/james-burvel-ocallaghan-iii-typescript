// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field } from "formik";
import React from "react";
import { FormValues, GroupOption } from "../../constants/user_invitation_form";

interface UserInvitationRolesSectionProps {
  values: FormValues;
  liveMode: boolean;
  groupOptions: Array<GroupOption>;
}

function UserInvitationRolesSection({
  values,
  liveMode,
  groupOptions,
}: UserInvitationRolesSectionProps) {
  const titleSuffix = liveMode ? "(Live Mode)" : "(Test Mode)";
  const nameSuffix = liveMode ? "live" : "test";

  return (
    <div className="form-section">
      <h3 className="h3-no-bottom-border">
        Roles&nbsp;
        {titleSuffix}
        {liveMode && (
          <div className="header-hint">
            These roles will determine this user’s permissions when your
            organization is live in production. We recommend giving users at
            least one role in live mode if you want them to have access to live
            data.
          </div>
        )}
      </h3>
      <div className="index-table table-permissions table w-full">
        <div className="table-head">
          <div className="header-row index-table-row">
            <div className="table-entry">Roles</div>
            <div className="table-entry table-entry-right-align">
              Select Roles
            </div>
          </div>
        </div>
        <div className="table-body">
          {groupOptions.length === 0 ? (
            <div className="index-table-row highlighted-row">
              <div className="table-entry">
                You have insufficient permissions to give this user invitation
                roles in this mode
              </div>
            </div>
          ) : (
            <div>
              {groupOptions.map((g) => (
                <div key={g.id} className="index-table-row">
                  <div className="table-entry">{g.name}</div>
                  <div className="mr-6 mt-2 flex">
                    <Field
                      name={`${nameSuffix}Groups`}
                      id={`${g.id}`}
                      value={g.id}
                      type="checkbox"
                      disabled={values.mode === "view"}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserInvitationRolesSection;
