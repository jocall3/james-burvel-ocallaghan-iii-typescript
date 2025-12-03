// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { useToast } from "@chakra-ui/react";
import React from "react";
import ReactJson from "react-json-view";
import {
  ConfirmModal,
  KeyValueTableSkeletonLoader,
  Toast,
  ToastPanel,
} from "~/common/ui-components";
import { useCopyText } from "~/common/utilities/useCopyText";

interface CopyableReactJsonModalProps {
  json: string | null | undefined;
  loading: boolean;
  title: string;
  keysToFilter?: string[];
  closeModal: () => void;
}

function CopyableReactJsonModal({
  json,
  loading,
  title,
  keysToFilter = [],
  closeModal,
}: CopyableReactJsonModalProps) {
  const [, , copy] = useCopyText();
  const toast = useToast();

  const handleOnConfirm = (jsonString: string) => {
    const jsonObject = JSON.parse(jsonString) as object;
    keysToFilter.forEach((key) => delete jsonObject[key]);

    const prettyJson = JSON.stringify(jsonObject, null, 4);

    copy(prettyJson);
    toast({
      duration: 1000,
      position: "top",
      render: () => (
        <Toast>
          <ToastPanel>Copied json to clipboard</ToastPanel>
        </Toast>
      ),
    });
  };

  let content;
  if (!json || loading) {
    content = <KeyValueTableSkeletonLoader />;
  } else {
    content = (
      <ReactJson
        src={JSON.parse(json) as object}
        name={null}
        displayObjectSize={false}
        displayDataTypes={false}
        collapsed={1}
        enableClipboard={false}
      />
    );
  }

  return (
    <ConfirmModal
      isOpen
      title={title}
      confirmText="Copy To Clipboard"
      cancelText="Close"
      setIsOpen={closeModal}
      confirmDisabled={!json || loading}
      onConfirm={() => json && handleOnConfirm(json)}
      bodyClassName="max-h-96 overflow-y-scroll"
    >
      {content}
    </ConfirmModal>
  );
}

export default CopyableReactJsonModal;
