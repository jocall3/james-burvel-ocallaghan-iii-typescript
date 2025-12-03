// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import PublishableKeyForm from "../../components/PublishableKeyForm";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";

function PublishableKeyCreate() {
  return (
    <PageHeader
      crumbs={[
        {
          name: "Developers",
        },
        {
          name: "Publishable Keys",
          path: "/developers/publishable_keys",
        },
      ]}
      title="New Publishable Key"
    >
      <div className="max-w-lg">
        <PublishableKeyForm />
      </div>
    </PageHeader>
  );
}

export default PublishableKeyCreate;
