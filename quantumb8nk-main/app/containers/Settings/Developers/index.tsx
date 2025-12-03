// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { useHistory } from "react-router";
import { useLocation } from "react-router-dom";
import EventsHome from "../../EventsHome";
import RequestLogsHome from "../../RequestLogsHome";
import WebhookEndpointsHome from "../../WebhookEndpointsHome";
import APIKeysHome from "../../APIKeysHome";
import PublishableKeysHome from "../../publishable_keys/PublishableKeysHome";
import { useApiKeyReadAbilityQuery } from "../../../../generated/dashboard/graphqlSchema";
import { PageHeader } from "../../../../common/ui-components";
import BulkRequestsHome from "../../BulkRequestsHome";

const API_KEYS = "api_keys";
const PUBLISHABLE_KEYS = "publishable_keys";
const API_LOGS = "logs";
const EVENTS = "events";
const WEBHOOKS = "webhooks";
const BULK_REQUESTS = "bulk_requests";

function UsersHome() {
  const history = useHistory();
  const { pathname } = useLocation();
  const [selectedTab, setSelectedTab] = useState<string>(
    pathname.split("/").slice(-1)[0],
  );
  const { data, loading, error } = useApiKeyReadAbilityQuery();

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    history.push(`/developers/${tab}`);
  };

  function renderTab() {
    switch (selectedTab) {
      case API_KEYS:
        return <APIKeysHome />;
      case PUBLISHABLE_KEYS:
        return <PublishableKeysHome />;
      case API_LOGS:
        return <RequestLogsHome />;
      case EVENTS:
        return <EventsHome />;
      case WEBHOOKS:
        return <WebhookEndpointsHome />;
      case BULK_REQUESTS:
        return <BulkRequestsHome />;
      default:
        return null;
    }
  }

  const canReadApiKeys = !!(
    !loading &&
    !error &&
    data &&
    data.abilities.APIKey.canRead
  );

  return (
    <PageHeader
      hideBreadCrumbs
      currentSection={selectedTab}
      setCurrentSection={handleTabChange}
      sections={{
        [API_LOGS]: "API Logs",
        [PUBLISHABLE_KEYS]: "Publishable Keys",
        [EVENTS]: "Events",
        [WEBHOOKS]: "Webhooks",
        [BULK_REQUESTS]: "Bulk Requests",
        ...(canReadApiKeys && { [API_KEYS]: "API Keys" }),
      }}
      title="Developers"
    >
      {renderTab()}
    </PageHeader>
  );
}

export default UsersHome;
