// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  ComplianceRulesHomeDocument,
  useComplianceRulesHomeQuery,
} from "../../../../generated/dashboard/graphqlSchema";
import { COMPLIANCE_RULE } from "../../../../generated/dashboard/types/resources";
import {
  ButtonClickEventTypes,
  CreateEntityButton,
} from "../../../../common/ui-components";
import ListView from "../../../components/ListView";
import {
  getComplianceSearchComponents,
  mapComplianceRuleQueryToVariables,
} from "../../../../common/search_components/rulesComplianceSearchComponents";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";
import { handleLinkClick } from "../../../../common/utilities/handleLinkClick";

const newRuleButton = (canManage: boolean) =>
  canManage && (
    <CreateEntityButton
      entityToCreate="Rule"
      onClick={(event: ButtonClickEventTypes) => {
        handleLinkClick("/settings/compliance/kyb/rules/new", event);
      }}
    />
  );

function ComplianceKybRulesTable() {
  // TODO (mchaudhry05): Remove once ListView supports
  // canManage permission checks
  const { data } = useComplianceRulesHomeQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 1,
    },
  });

  const canManage = data?.abilities.ComplianceRule.canCreate ?? false;

  const searchComponents = getComplianceSearchComponents();
  return (
    <PageHeader
      action={newRuleButton(canManage)}
      hideBreadCrumbs
      title="Know Your Business Rules"
    >
      <ListView
        graphqlDocument={ComplianceRulesHomeDocument}
        resource={COMPLIANCE_RULE}
        mapQueryToVariables={mapComplianceRuleQueryToVariables}
        defaultSearchComponents={searchComponents.defaultComponents}
        additionalSearchComponents={searchComponents.additionalComponents}
        disableMetadata
      />
    </PageHeader>
  );
}

export default ComplianceKybRulesTable;
