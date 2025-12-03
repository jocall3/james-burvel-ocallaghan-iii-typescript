// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { v4 as uuidv4 } from "uuid";

export default function GroupedAccountTableFooter({
  footerData,
}: {
  footerData: Array<{
    [key: string]: string | number | undefined | null;
  }>;
}) {
  if (footerData.length === 0) {
    return null;
  }
  return (
    <tfoot className="py-6">
      {footerData.map((obj) => (
        <tr className="border-t border-gray-100 py-4" key={uuidv4()}>
          {Object.keys(obj).map((key, index) => (
            <td
              className={
                index === 0
                  ? "rounded-md bg-[#FAFAF9] px-6 py-3 pl-10 text-left font-medium uppercase text-gray-900"
                  : "rounded-md bg-[#FAFAF9] px-8 py-1 text-right font-medium text-gray-900"
              }
              key={key}
            >
              {obj[key] !== null ? obj[key] : "N/A"}
            </td>
          ))}
        </tr>
      ))}
    </tfoot>
  );
}
