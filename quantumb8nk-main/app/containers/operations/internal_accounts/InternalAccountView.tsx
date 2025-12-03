// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import {
  ConfirmModal,
  Layout,
  PageHeader,
  SectionNavigator,
} from "~/common/ui-components";
import {
  OperationsAccountAchSettingsForInternalAccountDocument,
  OperationsAccountCapabilitiesForInternalAccountDocument,
  OperationsVirtualAccountSettingsForInternalAccountDocument,
  useOperationsDeactivateInternalAccountMutation,
  useOperationsInternalAccountViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import ListView from "~/app/components/ListView";
import {
  ACCOUNT_ACH_SETTING,
  ACCOUNT_CAPABILITY,
  VIRTUAL_ACCOUNT_SETTING,
} from "~/generated/dashboard/types/resources";
import {
  getAccountAchSettingSearchComponents,
  mapAccountAchSettingQueryToVariables,
} from "~/common/search_components/accountAchSettingSearchComponents";
import {
  getAccountCapabilitySearchComponents,
  mapAccountCapabilityQueryToVariables,
} from "~/common/search_components/accountCapabilitySearchComponents";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import OperationalStatusBadge from "~/app/components/OperationalStatusBadge";
import sectionWithNavigator from "../../sectionWithNavigator";
import InternalAccountDetailsTable from "./details/InternalAccountDetailsTable";
import InternalAccountActions from "./InternalAccountActions";
import InternalAccountConfigurationViewModal from "./InternalAccountConfigurationViewModal";
import {
  getVirtualAccountSettingsSearchComponents,
  mapVirtualAccountSettingsQueryToVariables,
} from "~/common/search_components/virtualAccountSettingsSearchComponents";
import { OPERATIONAL_STATUSES } from "~/app/constants";
import useErrorBanner from "~/common/utilities/useErrorBanner";

const AUDIT_RECORD_ENTITY_TYPE = "InternalAccount";

const SECTIONS = {
  capabilities: "Capabilities",
  accountAchSettings: "Account ACH Settings",
  virtualAccountSettings: "Virtual Account Settings",
  auditTrail: "Audit Trail",
};

interface InternalAccountViewProps {
  match: {
    params: {
      internalAccountId: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
  hideBreadCrumbs?: boolean;
}

function InternalAccountView({
  match: {
    params: { internalAccountId },
  },
  currentSection,
  setCurrentSection,
  hideBreadCrumbs = false,
}: InternalAccountViewProps) {
  const { data, loading } = useOperationsInternalAccountViewQuery({
    variables: {
      id: internalAccountId,
    },
  });

  const [showConfigurationModal, setShowConfigurationModal] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);

  const [deactivateInternalAccount] =
    useOperationsDeactivateInternalAccountMutation();

  const flashError = useErrorBanner();

  const handleDeactivateAccount = () => {
    deactivateInternalAccount({
      variables: {
        input: {
          id: internalAccountId,
        },
      },
    })
      .then((res) => {
        const { errors = [] } =
          res.data?.operationsDeactivateInternalAccount || {};

        if (errors.length) {
          flashError(errors.toString());
        } else {
          window.location.href = `/operations/internal_accounts/${internalAccountId}`;
        }
      })
      .catch(() => flashError("Something went wrong!"))
      .finally(() => setShowDeactivationModal(false));
  };

  let content;
  switch (currentSection) {
    case "capabilities": {
      const searchComponents = getAccountCapabilitySearchComponents();

      content = (
        <ListView
          customizableColumns={false}
          disableMetadata
          resource={ACCOUNT_CAPABILITY}
          graphqlDocument={
            OperationsAccountCapabilitiesForInternalAccountDocument
          }
          constantQueryVariables={{ internalAccountId }}
          mapQueryToVariables={mapAccountCapabilityQueryToVariables}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "accountAchSettings": {
      const searchComponents = getAccountAchSettingSearchComponents();

      content = (
        <ListView
          customizableColumns={false}
          initialShowSearchArea={false}
          disableMetadata
          resource={ACCOUNT_ACH_SETTING}
          graphqlDocument={
            OperationsAccountAchSettingsForInternalAccountDocument
          }
          constantQueryVariables={{ internalAccountId }}
          mapQueryToVariables={mapAccountAchSettingQueryToVariables}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "virtualAccountSettings": {
      const searchComponents = getVirtualAccountSettingsSearchComponents();

      content = (
        <ListView
          customizableColumns={false}
          initialShowSearchArea={false}
          disableMetadata
          resource={VIRTUAL_ACCOUNT_SETTING}
          graphqlDocument={
            OperationsVirtualAccountSettingsForInternalAccountDocument
          }
          constantQueryVariables={{
            internalAccountId,
            operationalStatuses: OPERATIONAL_STATUSES,
          }}
          mapQueryToVariables={mapVirtualAccountSettingsQueryToVariables}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
        />
      );
      break;
    }
    case "auditTrail": {
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: internalAccountId,
            entityType: AUDIT_RECORD_ENTITY_TYPE,
            includeAdminActions: true,
            includeAssociations: true,
          }}
          hideHeadline
          hideLinks
        />
      );
      break;
    }
    default:
      break;
  }

  const internalAccount = data?.internalAccount;
  const title = internalAccount?.longName || internalAccountId;

  return (
    <PageHeader
      title={title}
      loading={loading}
      left={
        internalAccount && (
          <OperationalStatusBadge status={internalAccount.operationalStatus} />
        )
      }
      right={
        internalAccount && (
          <InternalAccountActions
            internalAccountId={internalAccountId}
            path={internalAccount.path}
            onViewConfigurationClick={() => setShowConfigurationModal(true)}
            onDeactivateAccountClick={() => setShowDeactivationModal(true)}
          />
        )
      }
      hideBreadCrumbs={hideBreadCrumbs}
    >
      <Layout
        ratio="1/3"
        primaryContent={
          <InternalAccountDetailsTable internalAccountId={internalAccountId} />
        }
        secondaryContent={
          <div className="mt-4">
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onClick={setCurrentSection}
            />
            {content}
          </div>
        }
      />
      <ConfirmModal
        title="Confirm Account Deactivation"
        isOpen={showDeactivationModal}
        setIsOpen={setShowDeactivationModal}
        confirmText="Deactivate Account"
        confirmType="delete"
        onConfirm={handleDeactivateAccount}
      >
        Are you sure you want to deactivate this account?
      </ConfirmModal>
      {showConfigurationModal && (
        <InternalAccountConfigurationViewModal
          internalAccountId={internalAccountId}
          closeModal={() => setShowConfigurationModal(false)}
        />
      )}
    </PageHeader>
  );
}

export default sectionWithNavigator(InternalAccountView, "capabilities");
