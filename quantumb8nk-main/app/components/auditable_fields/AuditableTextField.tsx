// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { LazyQueryExecFunction, OperationVariables } from "@apollo/client";
import React from "react";
import { ShowableText } from "../../../common/ui-components";

interface AuditableTextFieldProps {
  graphqlQuery: unknown;
  queryVariables: object;
  fieldName: string;
  defaultText?: string;
  allowCopy?: boolean;
}

type LazyQueryFunctionType = (
  queryArgs: Record<string, unknown>,
) => [getFullField: LazyQueryExecFunction<ResponseType, OperationVariables>];

type ResponseType = { [key: string]: string };

function AuditableTextField({
  graphqlQuery,
  queryVariables,
  fieldName,
  defaultText,
  allowCopy,
}: AuditableTextFieldProps) {
  const [getFullField] = (graphqlQuery as LazyQueryFunctionType)({
    variables: queryVariables,
  });

  async function fetchFullField() {
    const result = await getFullField();

    if (result.data === undefined) {
      return "";
    }

    return result.data[fieldName];
  }

  return (
    <ShowableText
      defaultText={defaultText || "••••"}
      fullText=""
      onClick={fetchFullField}
      allowCopy={allowCopy || false}
    />
  );
}

export default AuditableTextField;
