// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  useOperationsConnectionImportInternalAccountQuery,
  useOperationsImportInternalAccountMutation,
} from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "~/app/MessageProvider";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import ImportConfigurationJsonForm, {
  ImportFormValues,
} from "../ImportConfigurationJsonForm";

interface ImportInternalAccountProps {
  match: {
    params: {
      connectionId: string;
    };
  };
}

function ImportInternalAccount({
  match: {
    params: { connectionId },
  },
}: ImportInternalAccountProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [importInternalAccount] = useOperationsImportInternalAccountMutation();

  const { data, loading } = useOperationsConnectionImportInternalAccountQuery({
    variables: { id: connectionId },
  });

  const connection = data?.connection;

  let content;

  if (!connection || loading) {
    content = null;
  } else {
    const handleSubmit = (values: ImportFormValues) =>
      importInternalAccount({
        variables: {
          input: {
            connectionId,
            internalAccountConfiguration: values.configurationJson,
          },
        },
      })
        .then((result) => {
          const { errors = [], internalAccount } =
            result.data?.operationsImportInternalAccount || {};
          if (errors.length) {
            dispatchError(errors.toString());
          } else if (internalAccount && internalAccount.id) {
            dispatchSuccess("Internal Account was successfully imported.");

            const internalAccountId = internalAccount.id;
            window.location.href = `/operations/internal_accounts/${internalAccountId}`;
          } else {
            window.location.href = `/operations/connections/${connectionId}`;
          }
        })
        .catch((err: Error) => {
          dispatchError(
            err.message ||
              "Unable to import Internal Account. Please try again.",
          );
        });
    content = (
      <ImportConfigurationJsonForm
        helpText="To export an Internal Account to JSON, go to the Internal Account View page."
        placeholder='{"party_name": "Party Name"}'
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <PageHeader
      loading={loading}
      crumbs={[
        { name: "Operations", path: "/operations" },
        { name: "Connections", path: "/operations/connections" },
        {
          name: connection?.nickname || connection?.entity || connectionId,
          path: `/operations/connections/${connectionId}`,
        },
      ]}
      title="Import Internal Account Configuration"
    >
      {content}
    </PageHeader>
  );
}

export default ImportInternalAccount;
