// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { cn } from "~/common/utilities/cn";

export default function GroupedAccountTableHeader({
  header,
}: {
  header: {
    [key: string]: string;
  };
}) {
  return (
    <thead>
      <tr className="border-gray-50">
        {Object.entries(header).map(([key, value], index) => (
          <th
            key={header[key]}
            className={cn(
              index === 0 ? "pl-10 text-left" : "",
              index === 1 ? "text-left" : "px-6",
              index > 1 ? "text-right" : "",
              "bg-[#FAFAF9] py-2.5 text-xs font-normal text-gray-500",
            )}
          >
            {value}
          </th>
        ))}
      </tr>
    </thead>
  );
}
