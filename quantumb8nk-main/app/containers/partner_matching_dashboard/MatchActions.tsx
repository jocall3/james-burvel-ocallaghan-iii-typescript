// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import MatchSentToBank from "./MatchSentToBank";
import BankAccepted from "./BankAccepted";
import Actions from "./Actions";
import { OnboardingPartnerMatch__StatusEnum } from "../../../generated/dashboard/graphqlSchema";

interface PartnerContactsProps {
  name: string;
  email: string;
}

interface MatchActionsProps {
  status: string;
  partnerSearchId: string;
  partnerMatchId: string;
  partnerName: string;
  partnerId: string;
  partnerKey: string;
  customerName: string;
  noteToPartner: string;
  noteToModernTreasury: string;
  partnerContactsNotified: PartnerContactsProps[];
}

export default function MatchActions({
  status,
  partnerSearchId,
  partnerMatchId,
  partnerName,
  partnerId,
  partnerKey,
  customerName,
  noteToPartner,
  noteToModernTreasury,
  partnerContactsNotified = [],
}: MatchActionsProps) {
  switch (status) {
    case OnboardingPartnerMatch__StatusEnum.PartnerAccepted:
      return (
        <BankAccepted
          partnerName={partnerName}
          partnerKey={partnerKey}
          noteToPartner={noteToPartner}
          noteToModernTreasury={noteToModernTreasury}
        />
      );
    case OnboardingPartnerMatch__StatusEnum.AwaitingPartnerResponse:
      return (
        <MatchSentToBank
          noteToPartner={noteToPartner}
          partnerMatchId={partnerMatchId}
          partnerKey={partnerKey}
          partnerContactsNotified={partnerContactsNotified}
        />
      );
    default:
      return (
        <Actions
          partnerSearchId={partnerSearchId}
          partnerMatchId={partnerMatchId}
          partnerName={partnerName}
          partnerId={partnerId}
          partnerKey={partnerKey}
          customerName={customerName}
          existingNoteToPartner={noteToPartner || ""}
        />
      );
  }
}
