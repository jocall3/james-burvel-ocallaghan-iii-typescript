// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  Onboarding__PartnerSearchStatusEnum,
  OnboardingPartnerMatch__StatusEnum,
} from "../../../generated/dashboard/graphqlSchema";

interface StatusButtonProps {
  status?:
    | Onboarding__PartnerSearchStatusEnum
    | OnboardingPartnerMatch__StatusEnum
    | null;
}

const SearchStatus = Onboarding__PartnerSearchStatusEnum;
const MatchStatus = OnboardingPartnerMatch__StatusEnum;

export default function StatusButton({ status }: StatusButtonProps) {
  let colour = "";
  let text = "";

  switch (status) {
    case SearchStatus.QuestionnairePending:
      text = "Questionnaire Pending";
      colour = "bg-yellow-25";
      break;
    case SearchStatus.QuestionnaireCompleted:
      text = "Questionnaire Completed";
      colour = "bg-yellow-50";
      break;
    case SearchStatus.MatchesFound:
      text = "Matches Found";
      colour = "bg-green-25";
      break;
    case SearchStatus.Completed:
      text = "Completed";
      colour = "bg-green-25";
      break;
    case SearchStatus.Failed:
      text = "Failed";
      colour = "bg-red-25";
      break;
    case SearchStatus.Expired:
      text = "Expired";
      colour = "bg-red-25";
      break;
    case MatchStatus.AwaitingBankPartnershipsResponse:
      text = "Awaiting Bank Partnerships Response";
      colour = "bg-yellow-25";
      break;
    case MatchStatus.AwaitingPartnerResponse:
      text = "Awaiting Partner Response";
      colour = "bg-yellow-50";
      break;
    case MatchStatus.MutuallyAccepted:
      text = "Mutually Accepted";
      colour = "bg-green-25";
      break;
    case MatchStatus.PartnerAccepted:
      text = "Partner Accepted";
      colour = "bg-green-25";
      break;
    case MatchStatus.CustomerDeclined:
      text = "Customer Declined";
      colour = "bg-red-25";
      break;
    case MatchStatus.PartnerDeclined:
      text = "Partner Declined";
      colour = "bg-red-25";
      break;
    case MatchStatus.CustomerRemoved:
      text = "Customer Removed";
      colour = "bg-purple-25";
      break;
    default:
  }

  return (
    <span className={`rounded px-2 py-0.5 text-sm ${colour}`}>{text}</span>
  );
}
