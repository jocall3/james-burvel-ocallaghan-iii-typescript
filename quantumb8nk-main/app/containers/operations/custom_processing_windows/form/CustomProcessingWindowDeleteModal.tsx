// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { Dispatch, SetStateAction } from "react";
import { ConfirmModal } from "~/common/ui-components";
import ConnectionVendorConfigCutoffTable, {
  CutoffType,
} from "../ConnectionVendorConfigCutoffTable";

interface CustomProcessingWindow {
  id: string;
  cutoffTime: string;
  configId: string;
  connection: {
    id: string;
  };
}
interface CustomProcessingWindowDeleteModalProps {
  onConfirm: () => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  customProcessingWindow: CustomProcessingWindow;
}

export default function CustomProcessingWindowDeleteModal({
  onConfirm,
  isOpen,
  setIsOpen,
  customProcessingWindow,
}: CustomProcessingWindowDeleteModalProps) {
  const {
    configId,
    connection: { id: connectionId },
  } = customProcessingWindow;

  return (
    <ConfirmModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Delete Custom Processing Window"
      subtitle="Are you sure you want to delete this processing window?"
      onConfirm={onConfirm}
      confirmType="delete"
      bodyClassName="max-h-96 overflow-y-scroll"
    >
      <ConnectionVendorConfigCutoffTable
        connectionId={connectionId}
        vendorConfigId={configId}
        customProcessingWindow={{
          ...customProcessingWindow,
          cutoffType: CutoffType.PENDING_DELETION,
        }}
      />
    </ConfirmModal>
  );
}
