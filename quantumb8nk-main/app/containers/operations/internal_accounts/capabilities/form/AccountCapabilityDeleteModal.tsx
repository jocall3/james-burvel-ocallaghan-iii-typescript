// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import DetailsTable from "~/app/components/DetailsTable";
import { ConfirmModal } from "~/common/ui-components";
import { useAccountCapabilityDetailsTableQuery } from "~/generated/dashboard/graphqlSchema";
import { ACCOUNT_CAPABILITY } from "~/generated/dashboard/types/resources";

interface AccountCapabilityDeleteModalProps {
  onConfirm: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  id: string;
}

export default function AccountCapabilityDeleteModal({
  onConfirm,
  isOpen,
  setIsOpen,
  id,
}: AccountCapabilityDeleteModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Delete Account Capability"
      subtitle="Are you sure you want to delete this capability? Please note related objects, like ACH Settings, will not be deleted."
      onConfirm={onConfirm}
      confirmType="delete"
      bodyClassName="max-h-96 overflow-y-scroll"
    >
      <DetailsTable
        graphqlQuery={useAccountCapabilityDetailsTableQuery}
        id={id}
        resource={ACCOUNT_CAPABILITY}
      />
    </ConfirmModal>
  );
}
