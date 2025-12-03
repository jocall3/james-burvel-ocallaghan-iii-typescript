// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useOperationsConnectionConfigurationQuery } from "~/generated/dashboard/graphqlSchema";
import CopyableReactJsonModal from "../CopyableReactJsonModal";

interface ConnectionConfigurationViewModalProps {
  connectionId: string;
  closeModal: () => void;
}

function ConnectionConfigurationViewModal({
  connectionId,
  closeModal,
}: ConnectionConfigurationViewModalProps) {
  const { data, loading } = useOperationsConnectionConfigurationQuery({
    variables: {
      id: connectionId,
    },
  });
  const configurationJson = data?.connectionConfiguration;

  return (
    <CopyableReactJsonModal
      json={configurationJson}
      loading={loading}
      title="View Connection Configuration"
      closeModal={closeModal}
    />
  );
}

export default ConnectionConfigurationViewModal;
