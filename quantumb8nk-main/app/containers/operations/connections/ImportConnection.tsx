// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useOperationsImportConnectionMutation } from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "~/app/MessageProvider";
import { PageHeader } from "~/common/ui-components/PageHeader/PageHeader";
import ImportConfigurationJsonForm, {
  ImportFormValues,
} from "../ImportConfigurationJsonForm";

function ImportConnection() {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [importConnection] = useOperationsImportConnectionMutation();

  const onSubmit = (values: ImportFormValues) =>
    importConnection({
      variables: {
        input: {
          connectionConfiguration: values.configurationJson,
        },
      },
    })
      .then((result) => {
        const { errors = [] } = result.data?.operationsImportConnection || {};
        if (errors.length) {
          dispatchError(errors.toString());
        } else if (result.data?.operationsImportConnection?.connection) {
          dispatchSuccess("Connection was successfully imported.");
          window.location.href =
            result.data.operationsImportConnection.connection.path;
        }
      })
      .catch((err: Error) => {
        dispatchError(
          err.message || "Unable to import Connection. Please try again.",
        );
      });

  return (
    <PageHeader
      crumbs={[
        {
          name: "Operations",
          path: "/operations",
        },
        {
          name: "Connections",
          path: "/operations/connections",
        },
      ]}
      title="Import Connection Configuration"
    >
      <ImportConfigurationJsonForm
        helpText="To export a Connection to JSON, go to the Connection View page."
        placeholder='{"vendor":"jpmc"}'
        onSubmit={onSubmit}
      />
    </PageHeader>
  );
}

export default ImportConnection;
