// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { connect, FormikProps, ErrorMessage } from "formik";
import { FormValues } from "../../constants/payment_order_form";
import DocumentUploadModal from "./document_upload/DocumentUploadModal";
import DocumentEditModal from "./document_upload/DocumentEditModal";
import { FormSurface, Icon } from "../../../common/ui-components";

function PaymentDocumentsUpload({
  formik,
}: {
  formik: FormikProps<FormValues>;
}) {
  const { values } = formik;
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  return (
    <FormSurface
      heading="Documents"
      optional
      id="documents"
      addButtonProps={{
        onClick: () => setIsUploadModalOpen(true),
      }}
    >
      <div className="flex flex-col pt-4">
        {values && values.documents && values.documents.length === 0 && (
          <span className="mt-2 text-xs text-text-muted">
            No documents added
          </span>
        )}
        {values &&
          values.documents &&
          values.documents.length > 0 &&
          values.documents.map((d, index) => (
            <div
              key={`doc[${index}]`}
              className="group w-full border-b border-border-default py-3 text-xs hover:bg-gray-25"
            >
              <ErrorMessage
                name={`documents.${index}.file`}
                component="span"
                className="mt-1 text-xs text-text-critical"
              />
              <div className="mb-2 flex w-full flex-row items-center">
                <div className="w-20 font-medium text-text-muted">Name</div>
                <div className="max-w-[60%] overflow-hidden overflow-ellipsis whitespace-nowrap font-medium">
                  {d.file.name}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="ml-auto flex h-6 w-6 flex-none items-center justify-center hover:bg-gray-100"
                >
                  <div
                    id={`doc[${index}].edit`}
                    className="hidden h-6 w-6 items-center justify-center group-hover:flex"
                  >
                    <Icon
                      iconName="edit"
                      color="currentColor"
                      className="text-gray-500"
                      size="s"
                    />
                  </div>
                </button>
              </div>
              <ErrorMessage
                name={`documents.${index}.documentType`}
                component="span"
                className="mt-1 text-xs text-text-critical"
              />
              <div className="flex w-full flex-row">
                <span className="w-20 font-medium text-text-muted">
                  Category
                </span>
                <span className="max-w-[60%] overflow-hidden overflow-ellipsis whitespace-nowrap font-medium">
                  {d.documentType || "-"}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Modals */}

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        handleModalClose={() => {
          setIsUploadModalOpen(false);
        }}
      />
      <DocumentEditModal
        isOpen={isEditModalOpen}
        handleModalClose={() => {
          setIsEditModalOpen(false);
        }}
      />
    </FormSurface>
  );
}

export default connect<Record<never, never>, FormValues>(
  PaymentDocumentsUpload,
);
