// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { startCase } from "lodash";

export function formatCustomFieldLabel(
  predicateFieldWithoutPathToKey: string,
  predicateFieldKeyValue: string,
) {
  return `${startCase(
    predicateFieldWithoutPathToKey,
  )}: "${predicateFieldKeyValue}"`;
}

export function formatCustomFieldValue(
  predicateFieldWithoutPathToKey: string,
  predicateFieldKeyValue: string,
) {
  return `${predicateFieldWithoutPathToKey}.${predicateFieldKeyValue}`;
}

/**
 *
 * @param predicateFieldWithoutPathToKey (ex. expected_payments.custom_identifiers)
 * @param currentPredicateField (ex. expected_payments.custom_identifiers.name)
 * @returns (ex. name)
 */
function getPathToKeyValue(
  predicateFieldWithoutPathToKey: string,
  currentPredicateField: string,
) {
  const pathToKeyValue = currentPredicateField.substring(
    predicateFieldWithoutPathToKey.length + 1,
  );

  return pathToKeyValue;
}

// removes _path_to_key/_key OR .path_to.key/.key from methodName
export function methodNameWithoutPathToKey(methodName: string) {
  if (methodName.includes("_path_to") || methodName.includes("_key")) {
    return methodName.replace("_path_to", "").replace("_key", "");
  }
  if (methodName.includes(".path_to") || methodName.includes(".key")) {
    return methodName.replace(".path_to", "").replace(".key", "");
  }
  return methodName;
}

export function buildCustomFieldLabel(
  predicateFieldWithPathToKey: string,
  currentPredicateField: string,
) {
  const predicateFieldWithoutPathToKey = methodNameWithoutPathToKey(
    predicateFieldWithPathToKey,
  );
  const predicateFieldKeyValue = getPathToKeyValue(
    predicateFieldWithoutPathToKey,
    currentPredicateField,
  );

  return formatCustomFieldLabel(
    predicateFieldWithoutPathToKey,
    predicateFieldKeyValue,
  );
}
