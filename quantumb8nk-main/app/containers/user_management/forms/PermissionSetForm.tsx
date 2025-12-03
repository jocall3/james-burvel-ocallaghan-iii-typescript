// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik, FormikProps } from "formik";
import React, { useRef } from "react";
import * as Yup from "yup";
import { PermissionFormValue, PermissionSetFormValues } from "./types";
import {
  FormikInputField,
  FormikErrorMessage,
} from "../../../../common/formik";
import { Button, Label } from "../../../../common/ui-components";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";
import Permissions from "./Permissions";
import { AUTHORIZATION_RESOURCE_FIELDS_FOR_DASHBOARD } from "../../../../generated/dashboard/constants/authorization_mapping";

interface PermissionSetFormProps {
  initialValues: PermissionSetFormValues;
  submitMutation: (values: PermissionSetFormValues) => void;
  permissionSetId?: string;
  isClone?: boolean;
  isDrawerContent?: boolean;
}

function PermissionSetForm({
  initialValues,
  submitMutation,
  permissionSetId,
  isClone,
  isDrawerContent,
}: PermissionSetFormProps) {
  const isUpdate = !isClone && permissionSetId;
  const formikRef = useRef<
    FormikProps<{
      permissions: PermissionFormValue[];
      name?: string;
      description?: string;
    }>
  >(null);

  const validate = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string(),
    permissions: Yup.array()
      .optional()
      .of(
        Yup.object({
          resource: Yup.string().required("Resource is required"),
          actions: Yup.array()
            .min(1, "Actions are required")
            .test("read-required", "View action required", (value = []) =>
              value.some((v) => v === "read"),
            ),
        }),
      ),
  });

  return (
    <PageHeader
      crumbs={[
        { name: "User Management", path: "/settings/user_management/groups" },
        {
          name: "Permission Sets",
          path: "/settings/user_management/permission_sets",
        },
      ]}
      hideBreadCrumbs={isDrawerContent}
      title={isUpdate ? "Update Permission Set" : "Create Permission Set"}
    >
      <div className="form-create form-create-wide">
        <Formik
          initialValues={initialValues}
          onSubmit={submitMutation}
          innerRef={
            formikRef as React.RefObject<FormikProps<PermissionSetFormValues>>
          }
          validationSchema={validate}
        >
          {({ values }: FormikProps<PermissionSetFormValues>) => (
            <Form>
              <div className="grid w-full gap-6">
                <div>
                  <Label className="mb-1" id="name">
                    Name
                  </Label>
                  <Field id="name" name="name" component={FormikInputField} />
                  <FormikErrorMessage name="name" />
                </div>
                <div>
                  <Label className="mb-1" id="description">
                    Description
                  </Label>
                  <Field
                    id="description"
                    name="description"
                    component={FormikInputField}
                  />
                </div>
                <Permissions
                  formikRef={formikRef}
                  values={values}
                  authorizationResourceAttributes={
                    AUTHORIZATION_RESOURCE_FIELDS_FOR_DASHBOARD
                  }
                />
                <div className="flex">
                  <Button isSubmit buttonType="primary">
                    {isUpdate ? "Update" : "Create"}
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

export default PermissionSetForm;
