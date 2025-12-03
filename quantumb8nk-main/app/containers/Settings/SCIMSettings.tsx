// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Button, Icon } from "../../../common/ui-components";
import { useDirectorySyncUrlQuery } from "../../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../MessageProvider";

function SCIMSetupCTA({ organizationName }: { organizationName: string }) {
  return (
    <>
      <div key="scim-title" className="outer-container-headline font-medium">
        Activate SCIM Provisioning for your organization
      </div>
      <div className="pb-6 text-sm">
        Contact us to enable this feature for your organization.
      </div>
      <Button
        buttonType="primary"
        onClick={() =>
          window.open(
            `mailto:support@moderntreasury.com?subject=Set Up SCIM Provisioning for ${organizationName}`,
          )
        }
      >
        Contact Support
        <Icon size="s" color="white" iconName="external_link" />
      </Button>
    </>
  );
}

function SCIMAdminPortal() {
  const { data, loading, error } = useDirectorySyncUrlQuery();
  const portalLink: string = data?.directorySyncUrl || "";
  const { dispatchError } = useDispatchContext();

  if (error) {
    dispatchError(`Could not generate portal link: ${error.message}`);
  }

  return (
    <>
      <div key="scim-title" className="outer-container-headline font-medium">
        Directory Sync
      </div>
      <div className="pb-6 text-sm">
        Provision and de-provision accounts with your identity provider.
      </div>
      <Button
        buttonType="primary"
        disabled={loading || !portalLink}
        onClick={() => window.open(portalLink, "_blank")}
      >
        Configure
        <Icon size="s" color="white" iconName="external_link" />
      </Button>
    </>
  );
}

function SCIMSettings({
  organizationName,
  scimEnabled,
}: {
  organizationName: string;
  scimEnabled: boolean;
}) {
  return (
    <div className="rounded-md border border-solid border-gray-100 px-4 py-6">
      {!scimEnabled && <SCIMSetupCTA organizationName={organizationName} />}
      {scimEnabled && <SCIMAdminPortal />}
    </div>
  );
}

export default SCIMSettings;
