// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik, FormikProps } from "formik";
import React, { useRef } from "react";
import * as Yup from "yup";
import {
  FormikSelectField,
  FormikInputField,
  FormikErrorMessage,
} from "../../../../common/formik";
import { GroupFormValues } from "./types";
import { cn } from "../../../../common/utilities/cn";
import { Button, Label } from "../../../../common/ui-components";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";
import MultiUserSelect from "../../../components/MultiUserSelect";
import { computeMultiUserSelectValue } from "../../../components/logical_form/PredicateValue";

interface GroupFormProps {
  initialValues: GroupFormValues;
  roleOptions: { label: string; value: string }[];
  groupId?: string;
  scimActive?: boolean;
  submitMutation: (values: GroupFormValues) => void;
  isDrawerContent?: boolean;
}

function GroupForm({
  initialValues,
  roleOptions,
  groupId,
  scimActive,
  submitMutation,
  isDrawerContent,
}: GroupFormProps) {
  const formikRef = useRef<FormikProps<GroupFormValues>>();

  const validate = () =>
    Yup.object({
      name: Yup.string().required("Required"),
      description: Yup.string(),
    });

  return (
    <PageHeader
      crumbs={[
        { name: "User Management", path: "/settings/user_management/groups" },
        {
          name: "Groups",
          path: "/settings/user_management/groups",
        },
      ]}
      hideBreadCrumbs={isDrawerContent}
      title={groupId ? "Update Group" : "Create Group"}
    >
      <div className="form-create form-create-wide">
        <Formik
          initialValues={initialValues}
          onSubmit={submitMutation}
          innerRef={formikRef as React.RefObject<FormikProps<GroupFormValues>>}
          validationSchema={validate}
        >
          {({ values, setFieldValue }: FormikProps<GroupFormValues>) => (
            <Form>
              <div className="grid w-full gap-6">
                <div>
                  <Label className="mb-1" id="name">
                    Name
                  </Label>
                  <Field
                    id="name"
                    name="name"
                    disabled={scimActive}
                    component={FormikInputField}
                  />
                  <FormikErrorMessage name="name" />
                </div>
                <div>
                  <Label className="mb-1" id="description">
                    Description
                  </Label>
                  <Field
                    id="description"
                    name="description"
                    disabled={scimActive}
                    component={FormikInputField}
                  />
                </div>
                <div>
                  <Label className="mb-1">Role</Label>
                  <Field
                    id="roleId"
                    options={roleOptions}
                    name="roleId"
                    type="select"
                    placeholder="Select Role"
                    component={FormikSelectField}
                    className={cn(
                      "h-8 w-full rounded-sm border border-border-default px-2 py-1 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                    )}
                  />
                </div>
                <div>
                  <Label className="mb-1">Users</Label>
                  <MultiUserSelect
                    onChange={
                      scimActive
                        ? () => {}
                        : (selectValues, selectAction) =>
                            computeMultiUserSelectValue(
                              selectValues,
                              selectAction,
                              values,
                              "userIds",
                              setFieldValue,
                            )
                    }
                    disabled={scimActive}
                    selectedUserIds={values.userIds}
                  />
                </div>
                <div className="flex">
                  <Button isSubmit buttonType="primary">
                    {groupId ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageHeader>
  );
}

export default GroupForm;
