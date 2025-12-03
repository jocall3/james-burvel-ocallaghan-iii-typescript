// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import Button from "../../../common/ui-components/Button/Button";
import BankPartnerIcon from "./BankPartnerIcon";

interface PartnerContactsProps {
  name: string;
  email: string;
}

interface MatchSentToBankProps {
  partnerMatchId: string;
  noteToPartner: string;
  partnerKey: string;
  partnerContactsNotified: PartnerContactsProps[];
}

export default function MatchSentToBank({
  partnerMatchId,
  noteToPartner,
  partnerKey,
  partnerContactsNotified,
}: MatchSentToBankProps) {
  return (
    <div className="mb-8 basis-1/3 border">
      <div className="m-5">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-sm">
          Match Sent to Bank
        </span>
        <BankPartnerIcon
          bankPartner={partnerKey}
          logoCssClass="rounded flex-none grow-0 w-80 h-80"
          containerCssClass="w-328 h-80 justify-center items-center flex flex-col"
        />
        <p className="mb-6 text-xs font-medium">Note From MT to Bank</p>
        <p className="mb-4 text-xs font-normal text-gray-500">
          {`${noteToPartner}`}
        </p>
        <Button
          className="mt-4"
          buttonType="secondary"
          fullWidth
          buttonHeight="medium"
          onClick={() => {
            const { location } = window;
            window.open(
              `${location.origin}/public/partner_matches/${partnerMatchId}`,
            );
          }}
        >
          View Sent Match
        </Button>
        {partnerContactsNotified.length > 0 && (
          <div className="mt-4 flex flex-col justify-center rounded bg-gray-25 p-4">
            <p className="h-4 text-xs font-medium text-gray-900">
              This match was sent to:
            </p>
            {partnerContactsNotified.map((pc) => (
              <div>
                <p className="h-4 pt-2 text-xs font-medium">{pc.name}</p>
                <p className="h-4 pb-4 pt-2 text-xs font-normal text-gray-500">
                  {pc.email}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
