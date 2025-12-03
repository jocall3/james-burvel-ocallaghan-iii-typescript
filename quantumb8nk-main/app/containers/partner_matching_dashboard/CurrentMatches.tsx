// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ReactTooltip from "react-tooltip";
import IndexTable from "../../../common/ui-components/IndexTable/IndexTable";
import StatusButton from "./StatusButton";
import CopyableText from "../../../common/ui-components/CopyableText/CopyableText";
import Icon from "../../../common/ui-components/Icon/Icon";
import {
  OnboardingPartnerMatch__StatusEnum,
  PartnerMatch,
  Partner,
} from "../../../generated/dashboard/graphqlSchema";

type MatchInfo = Pick<
  PartnerMatch,
  | "id"
  | "status"
  | "userReportedPartnerName"
  | "userReported"
  | "noteToPartner"
  | "noteToModernTreasury"
> & {
  path?: string | null;
  partner?: Pick<Partner, "id" | "name" | "relationshipManagerEmail"> | null;
};
interface CurrentMatchesProps {
  matches?: MatchInfo[] | null;
}

interface InfoTooltipProps {
  note: string;
}

interface CopyableEmailProps {
  email: string;
}

const CURRENT_MATCHES_DATA_MAPPING = {
  partnerName: "Bank",
  userReported: "User Reported",
  relationshipManagerEmail: "MT Partnership Contact",
  status: "Status",
  noteToPartner: "Note from MT to Bank",
  noteToModernTreasury: "Note from Bank",
  expandedView: "",
};

const CURRENT_MATCHES_DATA_STYLE_MAPPING = {
  expandedView: "table-entry-right-align table-entry-small",
  relationshipManagerEmail: "table-entry-wide",
};

function CopyableEmail({ email }: CopyableEmailProps) {
  if (email) {
    return (
      <CopyableText text={email} className="text-blue-500">
        <a className="text-blue-500" href={`mailto:${email}`}>
          {email}
        </a>
      </CopyableText>
    );
  }

  return <span className="missing">N/A</span>;
}

function InfoTooltip({ note }: InfoTooltipProps) {
  if (note) {
    return (
      <div className="flex">
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-2">
          {note}
        </p>
        <span data-tip={note}>
          <Icon
            color="currentColor"
            className="text-gray-600"
            alignment="center"
            iconName="document_text_outlined"
            size="s"
          />
        </span>
        <ReactTooltip className="w-1/5 whitespace-pre-wrap" multiline />
      </div>
    );
  }

  return <span className="missing">N/A</span>;
}

export default function CurrentMatches({ matches }: CurrentMatchesProps) {
  const formattedMatches = matches
    ? matches
        .filter(
          (match) =>
            match.status !==
            OnboardingPartnerMatch__StatusEnum.BankPartnershipsRejected,
        )
        .map(
          ({
            status,
            userReported,
            partner,
            path,
            noteToPartner,
            noteToModernTreasury,
            userReportedPartnerName,
          }) => ({
            partnerName: partner?.name || userReportedPartnerName,
            userReported: userReported ? "Yes" : "No",
            relationshipManagerEmail: (
              <CopyableEmail email={partner?.relationshipManagerEmail || ""} />
            ),
            status: <StatusButton status={status} />,
            noteToPartner: <InfoTooltip note={noteToPartner ?? ""} />,
            noteToModernTreasury: (
              <InfoTooltip note={noteToModernTreasury ?? ""} />
            ),
            expandedView: (
              <a aria-label="Open expanded view" href={path || undefined}>
                <Icon alignment="center" iconName="arrow_forward" size="s" />
              </a>
            ),
          }),
        )
    : [];

  return (
    <div>
      <p className="mb-4 text-sm font-medium">Current Matches</p>
      <IndexTable
        data={formattedMatches}
        dataMapping={CURRENT_MATCHES_DATA_MAPPING}
        disableActionButtons
        styleMapping={CURRENT_MATCHES_DATA_STYLE_MAPPING}
      />
    </div>
  );
}
