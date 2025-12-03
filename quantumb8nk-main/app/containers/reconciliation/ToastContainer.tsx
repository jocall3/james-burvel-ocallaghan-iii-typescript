// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { when } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import { useToast } from "@chakra-ui/react";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import { Toast, ToastButton, ToastPanel } from "../../../common/ui-components";

function ToastContainer() {
  const toast = useToast();
  const { data: dataStore } = useReconSplitViewStore();
  const { toast: toastProps } = dataStore;

  void when(
    () => Boolean(toastProps?.text),
    () => {
      const { durationSeconds, status, text, undoAction, dismissable } =
        toastProps || {};
      toast({
        duration: (durationSeconds ?? 1) * 1000,
        isClosable: true,
        render: () => (
          <Toast>
            <ToastPanel status={status} className="pl-5">
              {text}
            </ToastPanel>
            {undoAction && (
              <ToastButton
                onClick={() => {
                  void undoAction();
                }}
              >
                Undo
              </ToastButton>
            )}

            {dismissable && (
              <ToastButton onClick={() => toast.closeAll()} closeButton />
            )}
          </Toast>
        ),
      });

      return () => {
        dataStore.setToast(null);
      };
    },
  );

  return null;
}

export default observer(ToastContainer);
