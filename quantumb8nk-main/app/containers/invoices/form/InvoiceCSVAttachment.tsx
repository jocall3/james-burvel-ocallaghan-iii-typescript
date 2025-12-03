// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { Field, useFormikContext } from "formik";
import { useDispatchContext } from "~/app/MessageProvider";
import {
  Button,
  Heading,
  HorizontalRule,
  Icon,
  Dropzone,
  ConfirmModal,
} from "../../../../common/ui-components";

export default function InvoiceCSVAttachment({
  oldFilename,
  oldLink,
}: {
  oldFilename: string;
  oldLink: string;
}) {
  const [modalCsvFile, setModalCsvFile] = useState<File | null>(null);
  const [csvFilename, setCsvFilename] = useState<string | null>(oldFilename);
  const [csvUrl, setCsvUrl] = useState<string | null>(oldLink);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { dispatchError, dispatchClearMessage } = useDispatchContext();
  const MAX_CSV_SIZE_BYTES = 5_000_000;
  const { setFieldValue } = useFormikContext();
  const validateAndSet = ([file]: [File], [rejected]: [File]) => {
    if (rejected) {
      dispatchError(`Your image is too large. Please upload a csv \
                        with a maximum size of ${
                          MAX_CSV_SIZE_BYTES / 1_000_000
                        } MB.`);
    } else {
      dispatchClearMessage();
      setModalCsvFile(file);
    }
  };
  const removeFile = () => {
    void setFieldValue("csvAttachmentFile", null);
    setModalCsvFile(null);
    setCsvFilename("");
    setCsvUrl("");
  };
  const confirmAndSubmit = () => {
    void setFieldValue("csvAttachmentFile", modalCsvFile);
    setModalOpen(false);
    setCsvFilename(modalCsvFile?.name || "");
    setCsvUrl(modalCsvFile?.webkitRelativePath || "");
  };

  return (
    <div>
      <div>
        <div className="flex justify-between">
          <div className="flex items-center">
            <Heading level="h2" size="l">
              CSV Attachment
            </Heading>
          </div>
          <div className="pl-2">
            {modalOpen ? (
              <ConfirmModal
                title="Add CSV File"
                isOpen={modalOpen}
                confirmText="Save"
                setIsOpen={() => setModalOpen(false)}
                onConfirm={() => confirmAndSubmit()}
              >
                <Field
                  component={Dropzone}
                  maxSize={MAX_CSV_SIZE_BYTES}
                  accept="application/csv, text/csv"
                  name="csvAttachmentFile"
                  onDrop={validateAndSet}
                  handleChange={validateAndSet}
                />
                <div className="mb-4">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={modalCsvFile?.webkitRelativePath || csvUrl || ""}
                  >
                    {modalCsvFile?.name || csvFilename}
                  </a>
                </div>
              </ConfirmModal>
            ) : (
              <Button onClick={() => setModalOpen(true)}>
                {csvFilename ? "Edit CSV File" : "Attach CSV File"}
              </Button>
            )}
          </div>
        </div>
        <div className="pb-4 pt-2">
          <HorizontalRule />
        </div>
        <div className="mb-2 flex w-full flex-row items-center">
          <a
            target="_blank"
            className="pr-4"
            rel="noopener noreferrer"
            href={csvUrl || ""}
          >
            {csvFilename}
          </a>
          {csvFilename && (
            <Button onClick={removeFile}>
              <Icon iconName="clear" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
