// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import {
  PageHeader,
  Layout,
  SectionNavigator,
  LoadingLine,
  Badge,
  BadgeType,
} from "~/common/ui-components";
import {
  PaymentTypeEnum,
  useAccountAchSettingDetailsTableQuery,
  useAccountCapabilityDetailsTableQuery,
  useOperationsDeleteAccountCapabilityMutation,
  useOperationsAccountCapabilityViewQuery,
} from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "~/app/MessageProvider";
import DetailsTable from "~/app/components/DetailsTable";
import {
  ACCOUNT_ACH_SETTING,
  ACCOUNT_CAPABILITY,
} from "~/generated/dashboard/types/resources";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import AccountCapabilityActions from "./AccountCapabilityActions";
import sectionWithNavigator from "../../../sectionWithNavigator";
import AccountCapabilityDeleteModal from "./form/AccountCapabilityDeleteModal";

const AUDIT_RECORD_ENTITY_TYPE = "AccountCapability";

interface AccountCapabilityViewProps {
  match: {
    params: {
      id: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function AccountCapabilityView({
  match: {
    params: { id },
  },
  setCurrentSection,
  currentSection,
}: AccountCapabilityViewProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAccountCapability] =
    useOperationsDeleteAccountCapabilityMutation();
  const { data, loading } = useOperationsAccountCapabilityViewQuery({
    variables: {
      id,
    },
  });

  const handleAccountCapabilityDelete = () => {
    deleteAccountCapability({
      variables: {
        input: {
          id,
        },
      },
    })
      .then((response) => {
        const { errors = [] } =
          response.data?.operationsDeleteAccountCapability || {};

        if (errors.length) {
          dispatchError(errors.toString());
        } else {
          dispatchSuccess("Account Capability was successfully deleted.");
          window.location.href = `/operations/capabilities/${id}`;
        }
      })
      .catch((err: Error) =>
        dispatchError(
          err.message ||
            "Unable to delete Account Capability. Please try again.",
        ),
      );
  };

  const capability = data?.accountCapability;

  const sections = {
    ...(capability?.paymentType === PaymentTypeEnum.Ach
      ? { achSettings: "ACH Settings" }
      : {}),
    auditTrail: "Audit Trail",
  };

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "View Capability",
    loading,
  };

  if (!loading && capability) {
    pageHeaderProps = {
      title: capability.bestName,
      crumbs: [
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Internal Accounts",
          path: "/operations/internal_accounts",
        },
        {
          name: capability.internalAccount.bestName,
          path: `/operations/internal_accounts/${capability.internalAccount.id}`,
        },
        {
          name: capability.bestName,
        },
      ],
      right: !capability.discardedAt && (
        <AccountCapabilityActions
          id={id}
          setDeleteModal={setIsDeleteModalOpen}
        />
      ),
      left: capability?.discardedAt && (
        <Badge text="Deleted" type={BadgeType.Default} />
      ),
    };
  }

  switch (currentSection) {
    case "auditTrail": {
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: id,
            entityType: AUDIT_RECORD_ENTITY_TYPE,
            includeAdminActions: true,
          }}
          hideHeadline
          hideLinks
        />
      );
      break;
    }
    case "achSettings": {
      content = (
        <div className="flex flex-col gap-y-4">
          {loading && <LoadingLine />}
          {!loading && !data?.accountCapability?.accountAchSettings
            ? "None"
            : data?.accountCapability?.accountAchSettings.map(
                (accountAchSetting) => (
                  <DetailsTable
                    graphqlQuery={useAccountAchSettingDetailsTableQuery}
                    resource={ACCOUNT_ACH_SETTING}
                    id={accountAchSetting.id}
                  />
                ),
              )}
        </div>
      );
      break;
    }
    default:
      break;
  }

  return (
    <PageHeader {...pageHeaderProps}>
      <Layout
        primaryContent={
          <div>
            <DetailsTable
              graphqlQuery={useAccountCapabilityDetailsTableQuery}
              id={id}
              resource={ACCOUNT_CAPABILITY}
            />
          </div>
        }
        secondaryContent={
          <div>
            <SectionNavigator
              sections={sections}
              currentSection={currentSection}
              onClick={setCurrentSection}
            />
            {content}
          </div>
        }
      />
      <AccountCapabilityDeleteModal
        id={id}
        onConfirm={handleAccountCapabilityDelete}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
    </PageHeader>
  );
}

export default sectionWithNavigator(AccountCapabilityView, "auditTrail");
