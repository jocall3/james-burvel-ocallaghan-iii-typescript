// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import BankPartnerIcon from "./BankPartnerIcon";

interface BankAcceptedProps {
  partnerName: string;
  partnerKey: string;
  noteToPartner: string;
  noteToModernTreasury: string;
}

export default function BankAccepted({
  partnerName,
  partnerKey,
  noteToPartner,
  noteToModernTreasury,
}: BankAcceptedProps) {
  return (
    <div className="mb-8 basis-1/3 border">
      <div className="m-5">
        <span className="rounded bg-green-50 px-2 py-0.5 text-sm">
          Partner Accepted
        </span>
        <BankPartnerIcon
          bankPartner={partnerKey}
          logoCssClass="rounded flex-none grow-0 w-80 h-80"
          containerCssClass="w-328 h-80 justify-center items-center flex flex-col"
        />
        <p className="mb-6 text-xs font-medium">
          {`Note from you to ${partnerName}`}
        </p>
        <p className="mb-4 text-xs font-normal text-gray-500">
          {`${noteToPartner}`}
        </p>
        <p className="mb-6 text-xs font-medium">
          {`Note from ${partnerName} to MT`}
        </p>
        <p className="mb-4 text-xs font-normal text-gray-500">
          {`${noteToModernTreasury}`}
        </p>
      </div>
    </div>
  );
}
