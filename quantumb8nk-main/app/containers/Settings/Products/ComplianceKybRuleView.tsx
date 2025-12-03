// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  DateTime,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
  Button,
} from "../../../../common/ui-components";
import NotFound from "../../../../errors/components/NotFound";
import {
  Compliance__RuleType,
  useComplianceRuleViewQuery,
} from "../../../../generated/dashboard/graphqlSchema";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";

const COMPLIANCE_RULE_MAPPING = {
  id: "ID",
  name: "Name",
  conditions: "Conditions",
  action: "Action",
  createdAt: "Created At",
  updatedAt: "Updated At",
};

interface ComplianceKybRuleViewProps {
  match: { params: { complianceRuleId: string } };
}

const editRuleButton = (canManage: boolean, complianceRuleId: string) =>
  canManage && (
    <Button
      buttonType="primary"
      onClick={() => {
        window.location.href = `/settings/compliance/kyb/rules/${complianceRuleId}/edit`;
      }}
    >
      Edit Rule
    </Button>
  );

function ComplianceKybRuleView({
  match: {
    params: { complianceRuleId },
  },
}: ComplianceKybRuleViewProps) {
  const { data, loading, error } = useComplianceRuleViewQuery({
    variables: {
      id: complianceRuleId,
    },
  });

  if (error) {
    return <NotFound message="Something went wrong." subtext="" />;
  }

  const complianceRule = data?.complianceRule as Compliance__RuleType;
  const cannotReadRulesContent =
    "You cannot view rules with your permissions. Please contact your administrator to gain permissions.";
  const canRead = data?.abilities?.ComplianceRule.canRead ?? false;
  const canManage = data?.abilities?.ComplianceRule.canCreate ?? false;

  const complianceRuleData = {
    ...complianceRule,
    createdAt: complianceRule?.createdAt ? (
      <DateTime timestamp={complianceRule?.createdAt} />
    ) : null,
    updatedAt: complianceRule?.updatedAt ? (
      <DateTime timestamp={complianceRule?.updatedAt} />
    ) : null,
    discardedAt: complianceRule?.discardedAt ? (
      <DateTime timestamp={complianceRule?.discardedAt} />
    ) : null,
    conditions: complianceRule?.sentenceConditions,
  };

  if (loading || !data) {
    return (
      <PageHeader hideBreadCrumbs title={complianceRuleData?.name}>
        <KeyValueTableSkeletonLoader dataMapping={COMPLIANCE_RULE_MAPPING} />
      </PageHeader>
    );
  }

  return canRead ? (
    <PageHeader
      action={editRuleButton(canManage, complianceRuleId)}
      hideBreadCrumbs
      title={complianceRuleData?.name}
    >
      <KeyValueTable
        key={complianceRule?.id}
        data={complianceRuleData}
        dataMapping={COMPLIANCE_RULE_MAPPING}
      />
    </PageHeader>
  ) : (
    cannotReadRulesContent
  );
}

export default ComplianceKybRuleView;
