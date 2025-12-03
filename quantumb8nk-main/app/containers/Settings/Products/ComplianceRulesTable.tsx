// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { handleLinkClick } from "~/common/utilities/handleLinkClick";
import {
  RuleResourceTypeEnum,
  useComplianceCaseRulesHomeQuery,
} from "../../../../generated/dashboard/graphqlSchema";
import EntityTableView from "../../../components/EntityTableView";
import { CursorPaginationInput } from "../../../types/CursorPaginationInput";
import RuleCondition from "../../../components/rules/RuleCondition";
import {
  Button,
  ButtonClickEventTypes,
  DateTime,
  Icon,
} from "../../../../common/ui-components";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";

const COLUMN_HEADER_MAPPING: Record<string, string> = {
  name: "Rule Name",
  conditions: "Conditions",
  approvers: "Approvers",
  createdAt: "Created At",
};

type QueryFilter = {
  name?: string;
};

function ComplianceRulesTable() {
  const { loading, data, error, refetch } = useComplianceCaseRulesHomeQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      resourceType: RuleResourceTypeEnum.ComplianceCase,
    },
  });

  const cannotReadRulesContent =
    "You cannot view rules with your permissions. Please contact your administrator to gain permissions.";

  const canManage = data?.abilities.Rule.canCreate ?? false;
  const canRead = data?.abilities.Rule.canRead ?? false;

  const rules =
    loading || !data || error
      ? []
      : data.rules.edges.map((rule) => ({
          ...rule.node,
          approvers:
            rule.node.groups[0].name +
            (rule.node.groups.length > 1
              ? ` (+ ${rule.node.groups.length - 1} more)`
              : ""),
          createdAt: <DateTime timestamp={rule.node.createdAt} />,
          data: JSON.parse(rule.node.data) as Record<string, unknown>,
          conditions: (
            <ol>
              {rule.node.prettyRuleConditions.map((conditions) => (
                <li className="mb-1 mt-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                  <RuleCondition
                    ruleCondition={conditions}
                    includeLinks={false}
                  />
                </li>
              ))}
            </ol>
          ),
        }));

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
    query: QueryFilter;
  }) => {
    const { query } = options;
    await refetch({
      name: query.name,
    });
  };

  return (
    <PageHeader
      action={
        canManage ? (
          <Button
            buttonType="primary"
            onClick={(event: ButtonClickEventTypes): void => {
              handleLinkClick(
                `/settings/compliance/rules/new?resourceType=${RuleResourceTypeEnum.ComplianceCase}`,
                event,
              );
            }}
          >
            <Icon iconName="add" color="white" />
            New Rule
          </Button>
        ) : null
      }
      hideBreadCrumbs
      title="Case Rules"
    >
      {!loading && !canRead && cannotReadRulesContent}
      {canRead && (
        <EntityTableView
          data={rules}
          dataMapping={COLUMN_HEADER_MAPPING}
          loading={loading}
          onQueryArgChange={handleRefetch}
          cursorPagination={data?.rules?.pageInfo}
        />
      )}
    </PageHeader>
  );
}

export default ComplianceRulesTable;
