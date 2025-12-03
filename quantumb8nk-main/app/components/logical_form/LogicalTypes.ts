// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import * as Yup from "yup";
import {
  LogicalForm__MethodNameEnum,
  LogicalForm__OperatorEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { LegacyMetadata } from "../MetadataInput";

export type Proposition = Predicate | Statement;

export enum PropositionType {
  Predicate = "predicate",
  Statement = "statement",
}

export type Predicate = {
  field?: LogicalForm__MethodNameEnum | null;
  operator?:
    | LogicalForm__OperatorEnum.And
    | LogicalForm__OperatorEnum.Or
    | null;
  negate?: boolean | null;
  value?:
    | string
    | Array<string>
    | number
    | Record<string, string>
    | LegacyMetadata;
};

export type Statement = {
  field?: never;
  operator?: LogicalForm__OperatorEnum | null;
  negate?: boolean | null;
  value: Array<Proposition>;
};

export type FormValues<T = object> = T & {
  conditions: Proposition;
};

export type Approver = {
  id: string;
  conditional_group_ids: string[];
  number_of_reviewers: number;
};

export type Data = {
  conditions?: {
    operator?: LogicalForm__OperatorEnum;
    value: Array<Proposition>;
    negate?: boolean;
  };
  name?: string;
  approvers?: Approver[];
};

/**
 * ----- Yup Validation Schema -----
 *
 * The Schema below validates the input to grey out the submit button if the formik state is not valid. Note that it
 * does not validate the value string itself, but moreso validates presence.
 */
const predicateSchema = Yup.object({
  field: Yup.string().required(),
  operator: Yup.string()
    .oneOf(Object.values(LogicalForm__OperatorEnum))
    .required(),
  negate: Yup.boolean().required(),
  value: Yup.lazy((value: string | Array<string> | Record<string, string>) =>
    Yup.mixed().when("operator", {
      // missing and present operators do not require a value
      is: (field: string) =>
        field === LogicalForm__OperatorEnum.Missing ||
        field === LogicalForm__OperatorEnum.Present,
      then: Yup.string().nullable().optional(),
      otherwise: () => {
        if (Array.isArray(value)) {
          // Metadata will be an array of objects. Awkward check since `oneOf` wasn't working for me
          if (
            (value as Array<{ key: string; value: string } | string>).find(
              (v) => v && typeof v === "object" && v.key && v.value,
            )
          ) {
            return Yup.array().of(
              Yup.object({
                key: Yup.string().required(),
                value: Yup.string().required(),
              }),
            );
          }
          // All other values will be an array of strings
          return Yup.array().of(Yup.string().min(1, "at least 1"));
        }
        // Otherwise the value should be a string
        return Yup.string().required();
      },
    }),
  ),
});

const propositionSchema = Yup.lazy((value: Proposition) => {
  if (!("field" in value)) {
    const statementSchema = Yup.object({
      operator: Yup.string()
        .oneOf(Object.values(LogicalForm__OperatorEnum))
        .required(),
      negate: Yup.boolean().required(),
      value: Yup.array().of(propositionSchema).min(1, "at least 1"),
    });

    return statementSchema as Yup.SchemaOf<Statement>;
  }

  return predicateSchema;
});

export const validationSchema = Yup.object({
  conditions: propositionSchema as Yup.SchemaOf<Proposition>,
});
