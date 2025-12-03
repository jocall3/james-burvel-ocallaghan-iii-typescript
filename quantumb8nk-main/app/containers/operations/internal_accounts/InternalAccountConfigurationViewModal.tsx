// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { useOperationsInternalAccountConfigurationQuery } from "~/generated/dashboard/graphqlSchema";
import CopyableReactJsonModal from "../CopyableReactJsonModal";

interface InternalAccountConfigurationViewModalProps {
  internalAccountId: string;
  closeModal: () => void;
}

function InternalAccountConfigurationViewModal({
  internalAccountId,
  closeModal,
}: InternalAccountConfigurationViewModalProps) {
  const { data, loading } = useOperationsInternalAccountConfigurationQuery({
    variables: {
      id: internalAccountId,
    },
  });
  const configurationJson = data?.internalAccountConfiguration;

  return (
    <CopyableReactJsonModal
      keysToFilter={["connection_id"]}
      json={configurationJson}
      loading={loading}
      title="View Internal Account Configuration"
      closeModal={closeModal}
    />
  );
}

export default InternalAccountConfigurationViewModal;
