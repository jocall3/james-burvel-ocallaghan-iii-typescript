// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field, FormikProps, FieldArray, FieldArrayRenderProps } from "formik";
import {
  FormikErrorMessage,
  FormikSelectField,
} from "../../../../common/formik";
import { cn } from "../../../../common/utilities/cn";
import { PermissionFormValue } from "./types";
import {
  Button,
  FormSurface,
  HelpText,
  Icon,
} from "../../../../common/ui-components";
import MultiSelectDropdownPanel from "~/app/containers/user_management/MultiSelectDropdown";
import FilterArea from "../../../components/filter/FilterArea";
import {
  FilterType,
  mapLogicalFieldsToFilters,
  mapFiltersToAppliedFilters,
} from "../../../components/filter/util";
import {
  useAuthorizationFiltersQuery,
  ResourceEnum,
} from "../../../../generated/dashboard/graphqlSchema";
import { AuthorizationResourceAttributes } from "../../../../generated/dashboard/constants/authorization_mapping";

const MAX_PERMISSIONS_PER_SET = 15;

function PermissionRow({
  formikRef,
  key,
  index,
  authorizationResourceAttributes,
  arrayHelpers,
  initialPermissionsValue,
}: {
  formikRef: React.RefObject<
    FormikProps<{ permissions: PermissionFormValue[] }>
  >;
  key: string;
  index: number;
  authorizationResourceAttributes: AuthorizationResourceAttributes;
  arrayHelpers: FieldArrayRenderProps;
  initialPermissionsValue?: PermissionFormValue;
}) {
  const [selectedResource, setSelectedResource] = useState(
    initialPermissionsValue?.resource,
  );
  const {
    data: filtersData,
    loading: filtersLoading,
    error: filtersError,
  } = useAuthorizationFiltersQuery({
    skip:
      !selectedResource ||
      !Object.values(ResourceEnum).includes(selectedResource as ResourceEnum),
    variables: {
      resource: selectedResource as ResourceEnum,
    },
  });

  const actionLabelMap: { [key: string]: string } = {
    read: "View",
    create: "Create",
    update: "Edit",
    delete: "Delete",
  };

  const filters =
    !filtersLoading &&
    !filtersError &&
    filtersData &&
    mapLogicalFieldsToFilters(filtersData.logicalFormFields);

  const permissionsOptions = Object.entries(
    authorizationResourceAttributes,
  ).map(([k, v]) => ({
    value: k,
    label: v.resourceLabel,
    actions: v.permits,
  }));

  return (
    <div key={key} className="mb-2 flex w-full gap-2">
      <div className="w-full flex-row gap-y-4">
        <div className="flex-1">
          <Field
            id={`permissions[${index}].resource`}
            options={permissionsOptions}
            name={`permissions[${index}].resource`}
            type="select"
            placeholder="Select Resource"
            component={FormikSelectField}
            onChange={(option: {
              label: string;
              value: string;
              actions: string[];
            }): void => {
              void formikRef.current?.setFieldValue(
                `permissions[${index}].resource`,
                option.value,
              );
              void formikRef.current?.setFieldValue(
                `permissions[${index}].includeConditions`,
                {},
              );
              void formikRef.current?.setFieldValue(
                `permissions[${index}].excludeConditions`,
                {},
              );
              setSelectedResource(option.value);
            }}
            className={cn(
              "h-8 w-full rounded-sm border border-border-default px-2 py-1 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
            )}
          />
          <FormikErrorMessage
            className="text-sm"
            name={`permissions.${index}.resource`}
          />
        </div>

        <div className="mt-2 flex-1">
          <MultiSelectDropdownPanel
            formikRef={formikRef as React.RefObject<FormikProps<object>>}
            fieldKey={`permissions[${index}].actions`}
            options={
              selectedResource
                ? authorizationResourceAttributes[selectedResource].permits.map(
                    (action) => ({
                      label: actionLabelMap[action],
                      value: action,
                    }),
                  )
                : []
            }
            placeholderText="Select Actions"
            initialValues={initialPermissionsValue?.actions}
          />
          <FormikErrorMessage
            className="text-sm"
            name={`permissions.${index}.actions`}
          />
          <div>
            <HelpText text="“View” must be selected in addition to any other actions" />
          </div>
        </div>

        {!filtersLoading && filters && filters.length > 0 && (
          <>
            <div className="mt-2 grid grid-cols-[88px_1fr] items-center gap-2 text-gray-500">
              <div className="text-sm">Only Include</div>
              <div className="flex-1">
                <FilterArea
                  constraintFilter
                  filters={filters as FilterType[]}
                  appliedFilters={mapFiltersToAppliedFilters(
                    filters as FilterType[],
                    initialPermissionsValue?.includeConditions,
                  )}
                  onChange={(newValue) => {
                    void formikRef.current?.setFieldValue(
                      `permissions[${index}].includeConditions`,
                      newValue,
                    );
                  }}
                  disableQueryURLParams
                  filterSelectorDropdownLabel="Add constraint"
                />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-[88px_1fr] items-center gap-2 text-gray-500">
              <div className="text-sm">And Exclude</div>
              <div className="flex-1">
                <FilterArea
                  constraintFilter
                  filters={filters as FilterType[]}
                  appliedFilters={mapFiltersToAppliedFilters(
                    filters as FilterType[],
                    initialPermissionsValue?.excludeConditions,
                  )}
                  onChange={(newValue) => {
                    void formikRef.current?.setFieldValue(
                      `permissions[${index}].excludeConditions`,
                      newValue,
                    );
                  }}
                  disableQueryURLParams
                  filterSelectorDropdownLabel="Add constraint"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <Button
        id="remove-rule-condition-btn"
        onClick={(): void => {
          setSelectedResource("");
          arrayHelpers.remove(index);
        }}
        iconOnly
      >
        <Icon iconName="clear" size="m" />
      </Button>
    </div>
  );
}

function Permissions({
  formikRef,
  values,
  authorizationResourceAttributes,
  disabled,
}: {
  formikRef: React.RefObject<
    FormikProps<{ permissions: PermissionFormValue[] }>
  >;
  values: FormikProps<{ permissions: PermissionFormValue[] }>["values"];
  disabled?: boolean;
  authorizationResourceAttributes: AuthorizationResourceAttributes;
}) {
  return (
    <div className="flex w-full flex-col gap-y-2">
      <FieldArray
        name="permissions"
        render={(arrayHelpers) => (
          <>
            <div className="flex justify-between">
              <div>Permissions</div>
              <Button
                disabled={
                  disabled ||
                  values.permissions.length >= MAX_PERMISSIONS_PER_SET
                }
                onClick={() => {
                  arrayHelpers.push({
                    resource: "",
                    actions: [],
                  });
                }}
                buttonHeight="extra-small"
              >
                <Icon iconName="add" />
                Add
              </Button>
            </div>
            <FormSurface initialShowFormFields>
              {!disabled &&
              values?.permissions &&
              values.permissions.length > 0 ? (
                <div className="mt-4">
                  {(values?.permissions || []).map((_, index) => {
                    const key = `permissions.${index}`;
                    return (
                      <PermissionRow
                        formikRef={formikRef}
                        key={key}
                        index={index}
                        authorizationResourceAttributes={
                          authorizationResourceAttributes
                        }
                        arrayHelpers={arrayHelpers}
                        initialPermissionsValue={values?.permissions?.[index]}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm italic">No permissions yet</div>
              )}
              {disabled && (
                <HelpText text="You cannot assign custom permissions when a role is selected." />
              )}
            </FormSurface>
          </>
        )}
      />
    </div>
  );
}

export default Permissions;
