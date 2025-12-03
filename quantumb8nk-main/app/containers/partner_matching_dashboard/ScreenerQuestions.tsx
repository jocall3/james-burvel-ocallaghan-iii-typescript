// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PartnerSearchDetailViewQuery } from "../../../generated/dashboard/graphqlSchema";
import IndexTable from "../../../common/ui-components/IndexTable/IndexTable";
import { filterAnswers, modifyAnswer } from "../../utilities/PartnerMatchUtils";

type Answers = NonNullable<
  PartnerSearchDetailViewQuery["partnerSearch"]
>["answers"];
interface ScreenerQuestionsProps {
  answers: Answers;
  hasBorder?: boolean;
}

export default function ScreenerQuestions({
  answers,
  hasBorder = true,
}: ScreenerQuestionsProps) {
  if (!answers) return null;

  const relevantAnswers = filterAnswers(answers);

  // Recreate answer object to conform to how we want to see it on the page
  const modifiedAnswers = relevantAnswers.map((answer) => modifyAnswer(answer));

  return (
    <div
      className={
        hasBorder
          ? "basis-2/3 rounded border bg-white p-6"
          : "basis-2/3 rounded bg-white p-6"
      }
    >
      <p className="text-xs font-medium">Customer Info Sheet</p>
      <IndexTable
        data={modifiedAnswers}
        dataMapping={{
          questionText: "",
          answerValue: "",
        }}
        styleMapping={{
          questionText:
            "text-gray-500 whitespace-normal table-entry-wide table-entry-allow-overflow text-clip break-normal",
          answerValue:
            "table-entry-small whitespace-normal table-entry-allow-overflow text-clip break-words",
        }}
      />
    </div>
  );
}
