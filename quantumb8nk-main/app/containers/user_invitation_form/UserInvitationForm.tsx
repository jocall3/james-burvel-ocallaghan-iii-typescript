// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Form, Formik, FormikProps } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import { Button, ConfirmModal } from "../../../common/ui-components";
import {
  useCreateUserInvitationMutation,
  useEditUserInvitationMutation,
  useDeleteUserInvitationMutation,
} from "../../../generated/dashboard/graphqlSchema";
import { UserInvitation } from "../../actions";
import { FormValues, GroupOption } from "../../constants/user_invitation_form";
import UserInvitationEmailField from "./UserInvitationEmailField";
import UserInvitationRolesSection from "./UserInvitationRolesSection";
import { useDispatchContext } from "../../MessageProvider";
import useLiveConfiguration from "../../../common/utilities/useLiveConfiguration";

export interface UserInvitationFormProps {
  liveGroupOptions: Array<GroupOption>;
  testGroupOptions: Array<GroupOption>;
  initialValues: FormValues;
  userInvitation: UserInvitation | null;
}

function UserInvitationForm({
  liveGroupOptions,
  testGroupOptions,
  initialValues,
  userInvitation,
}: UserInvitationFormProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const { dispatchError, dispatchSuccess } = useDispatchContext();

  const [createUserInvitation] = useCreateUserInvitationMutation();
  const [editUserInvitation] = useEditUserInvitationMutation();
  const [deleteUserInvitation] = useDeleteUserInvitationMutation();
  const [liveConfigEnabled] = useLiveConfiguration({
    featureName: "use_workspace_actor",
  });

  const afterActionUrl = liveConfigEnabled
    ? "/settings/user_management/user_invitations"
    : "/settings/users?tab=invites";

  const onSubmit = (values: FormValues) => {
    if (userInvitation?.id) {
      editUserInvitation({
        variables: {
          input: {
            input: {
              id: userInvitation.id,
              liveGroups: values.liveGroups,
              testGroups: values.testGroups,
            },
          },
        },
      })
        .then((result) => {
          if (result?.data?.editUserInvitation?.errors?.length) {
            dispatchError(result?.data?.editUserInvitation?.errors[0]);
          } else {
            dispatchSuccess("User Invite Updated");
          }
        })
        .catch((error: Error) => {
          try {
            const {
              errors: { message },
            } = JSON.parse(error.message) as { errors: { message: string } };
            dispatchError(message);
          } catch (e) {
            dispatchError(
              "Sorry but we couldn't save this user invite data. Please check for anything that is invalid",
            );
          }
        });
    } else {
      createUserInvitation({
        variables: {
          input: {
            input: {
              email: values.email,
              liveGroups: values.liveGroups,
              testGroups: values.testGroups,
            },
          },
        },
      })
        .then((result) => {
          if (result?.data?.createUserInvitation?.errors?.length) {
            dispatchError(result?.data?.createUserInvitation?.errors[0]);
          } else {
            window.location.href = afterActionUrl;
          }
        })
        .catch((error: Error) => {
          try {
            const {
              errors: { message },
            } = JSON.parse(error.message) as { errors: { message: string } };
            dispatchError(message);
          } catch (e) {
            dispatchError(
              "Sorry but we couldn't save this user invite data. Please check for anything that is invalid",
            );
          }
        });
    }
  };

  const onDelete = () => {
    if (userInvitation) {
      const { id } = userInvitation;
      deleteUserInvitation({
        variables: { input: { id } },
      })
        .then((result) => {
          if (result?.data?.deleteUserInvitation?.errors?.length) {
            dispatchError(result?.data?.deleteUserInvitation?.errors[0]);
          }
          window.location.href = afterActionUrl;
        })
        .catch((error: Error) => {
          dispatchError(error.message);
        });
    }
  };

  const validate = Yup.object({
    email: Yup.string().email("Please enter a valid email address"),
  });

  return (
    <div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title={`Are you sure you want to delete ${
          userInvitation?.email ?? ""
        }?`}
        onConfirm={onDelete}
        confirmType="delete"
      />
      <div className="form-create">
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validate}
        >
          {({ values }: FormikProps<FormValues>) => (
            <Form>
              <div>
                <div className="form-section user-detail-form-section">
                  <UserInvitationEmailField values={values} />
                </div>
                <UserInvitationRolesSection
                  values={values}
                  liveMode
                  groupOptions={liveGroupOptions}
                />
                <UserInvitationRolesSection
                  values={values}
                  liveMode={false}
                  groupOptions={testGroupOptions}
                />
                <div className="flex flex-row space-x-2">
                  {values.mode !== "view" && (
                    <Button buttonType="primary" isSubmit>
                      {values.mode === "edit" ? "Resend Invite" : "Send Invite"}
                    </Button>
                  )}
                  {values.mode === "edit" && (
                    <Button onClick={() => setIsDeleteModalOpen(true)}>
                      Delete Invite
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default UserInvitationForm;
