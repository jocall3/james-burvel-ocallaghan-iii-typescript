// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  PageHeader,
  Button,
  ButtonClickEventTypes,
} from "../../../common/ui-components";
import EntityTableView, {
  INITIAL_PAGINATION,
} from "../../components/EntityTableView";
import {
  SweepRule,
  useSweepRulesViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { CursorPaginationInput } from "../../types/CursorPaginationInput";
import { balanceFormatter } from "./utilities";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

interface AutomatedSweepRule {
  id: string;
  managedAccount: string;
  supportingAccount: string;
  targetBalance: string;
  schedule: string | null | undefined;
  status: string;
  path: string;
}

export default function SweepRulesContainer() {
  const { data, loading, error, refetch } = useSweepRulesViewQuery({
    variables: {
      first: INITIAL_PAGINATION.perPage,
    },
  });

  const SWEEP_STATUS = {
    active: "Active",
    disabled: "Disabled",
  };

  const sweepRules: AutomatedSweepRule[] =
    loading || !data || error
      ? []
      : data.sweepRules.edges.map(({ node }) => ({
          ...node,
          managedAccount: node.managedAccount.longName,
          supportingAccount: node.supportingAccount.longName,
          targetBalance: balanceFormatter(
            node.targetBalance as number,
            node.managedAccount?.currency,
          ),
          schedule: node.schedule?.description,
          path: `/sweeps/${node.id}`,
          status: node.pausedAt ? "Disabled" : "Active",
        }));

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
  }) => {
    const { cursorPaginationParams } = options;
    await refetch({
      ...cursorPaginationParams,
    });
  };

  const sweepsTable = (filteredSweepRules: AutomatedSweepRule[]) => (
    <EntityTableView
      data={filteredSweepRules as unknown as SweepRule[]}
      loading={loading}
      onQueryArgChange={handleRefetch}
      resource="sweep_rule"
      dataMapping={{
        managedAccount: "Target Balance Account",
        supportingAccount: "Supporting Account",
        targetBalance: "Target Balance",
        schedule: "Schedule",
        description: "Description",
      }}
    />
  );

  function renderContent(section: string) {
    const activeSweeps = sweepRules.filter(
      (sweepRule: AutomatedSweepRule) => sweepRule.status === "Active",
    );
    const disabledSweeps = sweepRules.filter(
      (sweepRule: AutomatedSweepRule) => sweepRule.status === "Disabled",
    );

    switch (section) {
      case "active":
        return sweepsTable(activeSweeps);
      case "disabled":
        return sweepsTable(disabledSweeps);
      default:
        return sweepsTable(activeSweeps);
    }
  }
  return (
    <PageHeader
      title="Sweeps"
      loading={loading}
      right={
        <Button
          buttonType="primary"
          onClick={(event: ButtonClickEventTypes) =>
            handleLinkClick("/sweeps/new", event)
          }
        >
          New Sweep Rule
        </Button>
      }
      sections={SWEEP_STATUS}
      defaultSection="active"
    >
      {({ currentSection }) => renderContent(currentSection as string)}
    </PageHeader>
  );
}
