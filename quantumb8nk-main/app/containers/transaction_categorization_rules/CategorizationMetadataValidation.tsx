// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { FieldArray, useFormikContext } from "formik";
import React from "react";
import { Button, FieldGroup, Icon, Label } from "~/common/ui-components";
import CategorizationMetadataKeySelect from "./CategorizationMetadataKeySelect";
import CategorizationMetadataValueSelect from "./CategorizationMetadataValueSelect";
import { TransactionCategorizationRuleFormType } from "./utils";

const required = (value: string): string | undefined => {
  if (!value) {
    return "This field is required";
  }

  return undefined;
};

function CategorizationMetadataValidation() {
  const { values, setFieldValue } =
    useFormikContext<TransactionCategorizationRuleFormType>();

  return (
    <FieldArray name="metadata">
      {({ remove, push }) => (
        <div>
          {Object.keys(values.metadata).length > 0 &&
            Object.entries(values.metadata).map((_keyValuePair, index) => (
              <div className="flex space-x-2">
                <FieldGroup
                  direction="top-to-bottom"
                  className="my-2 w-[200px]"
                >
                  {index === 0 && <Label className="font-medium">Key</Label>}

                  <CategorizationMetadataKeySelect
                    onChange={(value) => {
                      void setFieldValue(`metadata.${index}.key`, value);
                      void setFieldValue(`metadata[${index}].value`, null);
                    }}
                    selectedValue={values.metadata[index].key}
                    name={`metadata.${index}.key`}
                    id={`metadata.${index}.key`}
                    validation={required}
                  />
                </FieldGroup>

                <FieldGroup
                  direction="top-to-bottom"
                  className="my-2 w-[200px]"
                >
                  {index === 0 && <Label className="font-medium">Value</Label>}

                  <CategorizationMetadataValueSelect
                    onChange={(value) => {
                      void setFieldValue(`metadata[${index}].value`, value);
                    }}
                    categorizationMetadataKeyId={
                      values.metadata[index]?.key?.value
                    }
                    selectedValue={values.metadata[index]?.value}
                    name={`metadata[${index}].value`}
                    id={`metadata[${index}].value`}
                    disabled={values.metadata[index].key.value === ""}
                    validation={required}
                    key={values.metadata[index]?.key?.value}
                  />
                </FieldGroup>

                {Object.entries(values.metadata).length - 1 !== index && (
                  <Button
                    buttonType="secondary"
                    onClick={() => remove(index)}
                    className={index === 0 ? "mt-9" : "mt-2"}
                  >
                    <Icon iconName="clear" size="s" />
                  </Button>
                )}
                {Object.entries(values.metadata).length - 1 === index && (
                  <Button
                    buttonType="secondary"
                    onClick={() =>
                      push({
                        key: { label: "", value: "" },
                        value: { label: "", value: "" },
                      })
                    }
                    className={index === 0 ? "mt-9" : "mt-2"}
                  >
                    <Icon iconName="add" size="s" />
                  </Button>
                )}
              </div>
            ))}
        </div>
      )}
    </FieldArray>
  );
}

export default CategorizationMetadataValidation;
