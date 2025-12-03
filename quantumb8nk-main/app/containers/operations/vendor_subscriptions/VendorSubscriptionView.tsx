// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import DetailsTable from "~/app/components/DetailsTable";
import {
  useVendorSubscriptionDetailsTableQuery,
  useOperationsVendorSubscriptionViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import {
  Badge,
  BadgeType,
  Layout,
  PageHeader,
  SectionNavigator,
} from "~/common/ui-components";
import { VENDOR_SUBSCRIPTION } from "~/generated/dashboard/types/resources";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import sectionWithNavigator from "../../sectionWithNavigator";

const AUDIT_RECORD_ENTITY_TYPE = "VendorSubscription";

const SECTIONS = {
  auditTrail: "Audit Trail",
};

interface VendorSubscriptionViewProps {
  match: {
    params: {
      vendorSubscriptionId: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function VendorSubscriptionView({
  match: {
    params: { vendorSubscriptionId },
  },
  currentSection,
  setCurrentSection,
}: VendorSubscriptionViewProps) {
  const { data, loading } = useOperationsVendorSubscriptionViewQuery({
    variables: {
      id: vendorSubscriptionId,
    },
  });

  let content;
  switch (currentSection) {
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: vendorSubscriptionId,
            entityType: AUDIT_RECORD_ENTITY_TYPE,
            includeAdminActions: true,
          }}
          hideHeadline
          hideLinks
        />
      );
      break;
    default:
      break;
  }

  const vendorSubscription = data?.vendorSubscription;
  const title = vendorSubscription?.vendorConfig.id || vendorSubscriptionId;

  return (
    <PageHeader
      loading={loading}
      title={title}
      left={
        vendorSubscription?.discardedAt && (
          <Badge text="Deleted" type={BadgeType.Default} />
        )
      }
    >
      <Layout
        ratio="1/3"
        primaryContent={
          <DetailsTable
            graphqlQuery={useVendorSubscriptionDetailsTableQuery}
            id={vendorSubscriptionId}
            resource={VENDOR_SUBSCRIPTION}
          />
        }
        secondaryContent={
          <div className="mt-4">
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onClick={(section: string) => setCurrentSection(section)}
            />
            {content}
          </div>
        }
      />
    </PageHeader>
  );
}

export default sectionWithNavigator(VendorSubscriptionView, "auditTrail");
