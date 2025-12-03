// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik, FormikProps } from "formik";
import React, { useRef } from "react";
import * as Yup from "yup";
import { RoleFormValues } from "./types";
import {
  FormikInputField,
  FormikErrorMessage,
} from "../../../../common/formik";
import { Button, Label } from "../../../../common/ui-components";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";
import MultiSelectDropdown from "../MultiSelectDropdown";

interface RoleFormProps {
  initialValues: RoleFormValues;
  submitMutation: (values: RoleFormValues) => void;
  permissionSetOptions: { value: string; label: string }[];
  roleId?: string;
  isClone?: boolean;
  isDrawerContent?: boolean;
}

function RoleForm({
  initialValues,
  submitMutation,
  permissionSetOptions,
  roleId,
  isClone,
  isDrawerContent,
}: RoleFormProps) {
  const formikRef = useRef<FormikProps<RoleFormValues>>();

  const isUpdate = !isClone && roleId;

  const validate = () =>
    Yup.object({
      name: Yup.string().required("Required"),
      description: Yup.string(),
      permissionSetIds: Yup.array().max(
        10,
        ({ max }) => `Too many permission sets - max ${max} per role`,
      ),
    });

  return (
    <PageHeader
      crumbs={[
        { name: "User Management", path: "/settings/user_management/groups" },
        {
          name: "Roles",
          path: "/settings/user_management/roles",
        },
      ]}
      hideBreadCrumbs={isDrawerContent}
      title={isUpdate ? "Update Role" : "Create Role"}
    >
      <div className="form-create form-create-wide">
        <Formik
          initialValues={initialValues}
          onSubmit={submitMutation}
          innerRef={formikRef as React.RefObject<FormikProps<RoleFormValues>>}
          validationSchema={validate}
        >
          <Form>
            <div className="grid w-full gap-6">
              <div>
                <Label id="name" className="mb-1">
                  Name
                </Label>
                <Field id="name" name="name" component={FormikInputField} />
                <FormikErrorMessage name="name" />
              </div>
              <div>
                <Label id="description" className="mb-1">
                  Description
                </Label>
                <Field
                  id="description"
                  name="description"
                  component={FormikInputField}
                />
              </div>
              <div>
                <Label className="mb-1">Permission Sets</Label>
                <MultiSelectDropdown
                  formikRef={formikRef as React.RefObject<FormikProps<object>>}
                  options={permissionSetOptions}
                  fieldKey="permissionSetIds"
                  placeholderText="Select Permission Sets"
                  initialValues={initialValues.permissionSetIds}
                />
                <FormikErrorMessage name="permissionSetIds" />
              </div>
              <div className="flex">
                <Button isSubmit buttonType="primary">
                  {isUpdate ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </Form>
        </Formik>
      </div>
    </PageHeader>
  );
}

export default RoleForm;
