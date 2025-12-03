// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import invariant from "ts-invariant";
import { VirtualAccountSettingAllocationTypeEnum } from "~/generated/dashboard/graphqlSchema";
import { VirtualAccountSettingFormValues } from "./FormValues";

export function isAllocationRangeRequired(
  allocationType: VirtualAccountSettingAllocationTypeEnum,
) {
  return allocationType === VirtualAccountSettingAllocationTypeEnum.Range;
}

export function isAllocationIdentifierRequired(
  allocationType: VirtualAccountSettingAllocationTypeEnum,
) {
  return [
    VirtualAccountSettingAllocationTypeEnum.Prefix,
    VirtualAccountSettingAllocationTypeEnum.Suffix,
    VirtualAccountSettingAllocationTypeEnum.Id,
  ].includes(allocationType);
}

export function formatVirtualAccountSettingFormValuesForMutation(
  values: VirtualAccountSettingFormValues,
) {
  const {
    allocationType,
    allocationLength,
    allocationRangeStart,
    allocationRangeEnd,
    allocationIdentifier,
  } = values;

  invariant(allocationType, "Allocation Type should always be defined");

  return {
    allocationType,
    ...(allocationLength
      ? { allocationLength: parseInt(allocationLength, 10) }
      : {}),
    ...(isAllocationRangeRequired(allocationType) && {
      allocationRangeStart,
      allocationRangeEnd,
    }),
    ...(isAllocationIdentifierRequired(allocationType) && {
      allocationIdentifier,
    }),
  };
}
