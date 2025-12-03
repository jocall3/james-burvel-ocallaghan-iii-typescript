// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import {
  PageHeader,
  Layout,
  SectionNavigator,
  ConfirmModal,
  Badge,
  BadgeType,
} from "~/common/ui-components";
import { PageHeaderProps } from "~/common/ui-components/PageHeader/PageHeader";
import {
  useAccountAchSettingDetailsTableQuery,
  useOperationsAccountAchSettingViewQuery,
  useOperationsDeleteAccountAchSettingMutation,
} from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "~/app/MessageProvider";
import DetailsTable from "~/app/components/DetailsTable";
import { ACCOUNT_ACH_SETTING } from "~/generated/dashboard/types/resources";
import AccountACHSettingsActions from "./AccountACHSettingActions";
import sectionWithNavigator from "../../../sectionWithNavigator";

const AUDIT_RECORD_ENTITY_TYPE = "AccountACHSetting";

const SECTIONS = {
  auditTrail: "Audit Trail",
};
interface AccountACHSettingViewProps {
  match: {
    params: {
      id: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function AccountACHSettingView({
  match: {
    params: { id },
  },
  currentSection,
  setCurrentSection,
}: AccountACHSettingViewProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAccountACHSetting] =
    useOperationsDeleteAccountAchSettingMutation();
  const { data, loading } = useOperationsAccountAchSettingViewQuery({
    variables: {
      id,
    },
  });

  const handleDelete = () => {
    deleteAccountACHSetting({
      variables: {
        input: {
          id,
        },
      },
    })
      .then((response) => {
        const { errors = [], accountAchSetting = null } =
          response.data?.operationsDeleteAccountAchSetting || {};

        if (errors.length) {
          dispatchError(errors.toString());
        } else if (accountAchSetting) {
          dispatchSuccess("Account ACH Setting was successfully deleted.");
          window.location.href = `/operations/internal_accounts/${accountAchSetting.internalAccount.id}?section=accountAchSettings`;
        }
      })
      .catch((err: Error) =>
        dispatchError(
          err.message ||
            "Unable to delete Account ACH Setting. Please try again.",
        ),
      );
  };

  let content;
  let pageHeaderProps: PageHeaderProps = {
    title: "View Account ACH Setting",
    loading,
  };

  switch (currentSection) {
    case "auditTrail":
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
    default:
      break;
  }

  const accountAchSetting = data?.accountAchSetting;

  if (!loading && accountAchSetting) {
    const { id: internalAccountId, bestName } =
      accountAchSetting.internalAccount;

    pageHeaderProps = {
      title: `${accountAchSetting.prettyDirection} Account ACH Setting`,
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
          name: bestName,
          path: `/operations/internal_accounts/${internalAccountId}`,
        },
        {
          name: "Account ACH Settings",
          path: `/operations/internal_accounts/${internalAccountId}?section=accountAchSettings`,
        },
        {
          name: accountAchSetting.prettyDirection,
          path: `/operations/account_ach_settings/${id}`,
        },
      ],
      right: !accountAchSetting.discardedAt && (
        <AccountACHSettingsActions
          id={id}
          setDeleteModal={setIsDeleteModalOpen}
        />
      ),
      left: accountAchSetting.discardedAt && (
        <Badge text="Deleted" type={BadgeType.Default} />
      ),
    };
  }

  return (
    <PageHeader {...pageHeaderProps}>
      <Layout
        primaryContent={
          <DetailsTable
            graphqlQuery={useAccountAchSettingDetailsTableQuery}
            id={id}
            resource={ACCOUNT_ACH_SETTING}
          />
        }
        secondaryContent={
          <div>
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
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title="Delete Account ACH Setting"
        subtitle="Are you sure you want to delete this ACH account setting? Please first disable all existing ACH account capabilities and relevant reversal Vendor Subscriptions before deleting the account's ACH Setting."
        onConfirm={handleDelete}
        confirmType="delete"
        bodyClassName="max-h-96 overflow-y-scroll"
      >
        <DetailsTable
          graphqlQuery={useAccountAchSettingDetailsTableQuery}
          id={id}
          resource={ACCOUNT_ACH_SETTING}
        />
      </ConfirmModal>
    </PageHeader>
  );
}

export default sectionWithNavigator(AccountACHSettingView, "auditTrail");
