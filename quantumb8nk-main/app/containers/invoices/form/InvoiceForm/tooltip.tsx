// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ReactTooltip from "react-tooltip";

import { Tooltip } from "../../../../../common/ui-components";

const tooltipMessage = "Counterparty must be selected to select account";

export default function InvoiceTooltip() {
  return (
    <>
      <Tooltip className="ml-1 mt-1 cursor-pointer" data-tip={tooltipMessage} />
      <ReactTooltip
        multiline
        data-place="top"
        data-type="dark"
        data-effect="float"
      />
    </>
  );
}
