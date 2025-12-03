// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { startCase } from "lodash";
import { ClipLoader } from "react-spinners";
import SelectField from "../../../common/ui-components/Select/SelectField";

type StatusSelectorProps<StatusEnumT> = {
  selected: StatusEnumT;
  options: StatusEnumT[];
  onChange: (newValue: StatusEnumT) => void | Promise<void>;
  title: string;
  loading?: boolean;
};

export default function StatusSelector<StatusEnumT>({
  selected,
  options,
  onChange,
  title = "Manage Partner Search Status",
  loading = false,
}: StatusSelectorProps<StatusEnumT>) {
  function getSelectOptions(values: StatusEnumT[]) {
    return values.map((value) => ({
      label: startCase(value as unknown as string),
      value,
    }));
  }

  async function handleChange(option: StatusEnumT) {
    await onChange(option);
  }

  return (
    <div className="mb-8 basis-1/3 border">
      <div className="m-5">
        {loading ? (
          <div className="flex justify-center">
            <ClipLoader />
          </div>
        ) : (
          <>
            <p className="mb-6 text-xs font-medium">{title}</p>
            <SelectField
              selectValue={selected}
              options={getSelectOptions(options)}
              handleChange={handleChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
