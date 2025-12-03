// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { handleLinkClick } from "~/common/utilities/handleLinkClick";
import { useReadLiveMode } from "~/common/utilities/useReadLiveMode";
import {
  Button,
  ButtonClickEventTypes,
  Label,
} from "~/common/ui-components/index";
import { useCurrentOrganizationQuery } from "~/generated/dashboard/graphqlSchema";
import isNewAppNav from "~/app/utilities/newAppNavigation";
import AccountingHomeTabView from "~/app/containers/accounting/AccountingHomeTabView";
import Gon from "~/common/utilities/gon";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";

type AccountingVendor = "QuickBooks" | "NetSuite";

enum DisabledReason {
  Sandbox = "sandbox",
  NonAdmin = "non_admin",
}

function ConnectLedgerButton({
  title,
  vendor,
  disabledReason,
}: {
  title: string;
  vendor: AccountingVendor;
  disabledReason?: DisabledReason;
}) {
  const isNewNav = isNewAppNav();
  const newNavQueryParam = isNewNav ? "&newnav=true" : "";
  const ledgerConnectPath = isNewNav
    ? "/settings/beta/accounting/ledger_connect"
    : "/settings/accounting/ledger_connect";
  const fullPath = `${ledgerConnectPath}?vendor=${vendor.toLowerCase()}${newNavQueryParam}`;

  let tooltipMessage = "";
  if (disabledReason === DisabledReason.NonAdmin) {
    tooltipMessage = "Setup is only enabled for organization admins";
  } else if (disabledReason === DisabledReason.Sandbox) {
    tooltipMessage = "Setup is not enabled in Sandbox mode";
  }

  return (
    <Button
      buttonType="primary"
      onClick={(event: ButtonClickEventTypes) => {
        handleLinkClick(fullPath, event);
      }}
      disabled={!!disabledReason}
      title={tooltipMessage}
    >
      {title}
    </Button>
  );
}

function AccountingHome() {
  const {
    ui: {
      ledger: {
        id = "",
        vendor = "",
        must_reconnect_ledger: mustReconnectLedger = false,
      } = {},
    },
  } = Gon.gon ?? {};
  const isLiveMode = useReadLiveMode();
  let content;
  const { data: organizationData } = useCurrentOrganizationQuery();
  const canManageOrganization =
    organizationData?.currentOrganization.canEdit ?? false;

  if (id) {
    content = (
      <AccountingHomeTabView
        ledgerId={id}
        vendor={vendor}
        canManageOrganization={canManageOrganization}
      />
    );
  } else {
    content = (
      <>
        <div className="form-section">
          {!isLiveMode && (
            <div className="form-row flex">
              <Label>QuickBooks can only be connected in live mode.</Label>
            </div>
          )}
          <div className="form-row flex">
            <ConnectLedgerButton
              title="Setup QuickBooks"
              vendor="QuickBooks"
              disabledReason={
                !canManageOrganization
                  ? DisabledReason.NonAdmin
                  : (!isLiveMode && DisabledReason.Sandbox) || undefined
              }
            />
          </div>
        </div>
        <div className="form-section">
          <div className="form-row flex">
            <ConnectLedgerButton
              title="Setup NetSuite"
              vendor="NetSuite"
              disabledReason={
                !canManageOrganization ? DisabledReason.NonAdmin : undefined
              }
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <PageHeader hideBreadCrumbs title="Accounting">
      {mustReconnectLedger && (
        <div className="mt-container">
          We are having trouble connecting to your ledger.
          <ConnectLedgerButton
            title="Reconnect Ledger"
            vendor="QuickBooks"
            disabledReason={!isLiveMode ? DisabledReason.Sandbox : undefined}
          />
        </div>
      )}
      <div className="mt-container">
        <form className="form-create">{content}</form>
      </div>
    </PageHeader>
  );
}

export default AccountingHome;
