// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import MetadataView from "~/app/components/MetadataView";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import {
  useInvoiceDetailsTableQuery,
  InvoiceLineItemsDocument,
  PaymentOrdersForAssociatedEntityDocument,
  ExpectedPaymentsForAssociatedEntityDocument,
  useUpdateInvoiceStatusMutation,
  InvoiceStatusEnum,
  TransactionLineItemsViewDocument,
  useUpdateInvoiceMetadataMutation,
  useInvoiceViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../MessageProvider";
import {
  INVOICE,
  INVOICE_LINE_ITEM,
  PAYMENT_ORDER,
  EXPECTED_PAYMENT,
  TRANSACTION_LINE_ITEM,
} from "../../../generated/dashboard/types/resources";
import DetailsTable from "../../components/DetailsTable";
import {
  ConfirmModal,
  Layout,
  SectionNavigator,
} from "../../../common/ui-components";
import ListView from "../../components/ListView";
import sectionWithNavigator from "../sectionWithNavigator";
import InvoiceViewHeader from "./InvoiceViewHeader";

const SECTIONS = {
  lineItems: "Line Items",
  paymentOrders: "Payment Orders",
  expectedPayments: "Expected Payments",
  transactionLineItems: "Reconciled Items",
  metadata: "Metadata",
  auditTrail: "Audit Trail",
};

function InvoiceView({
  match: {
    params: { invoice_id: invoiceId },
  },
  currentSection,
  setCurrentSection,
}: {
  match: {
    params: {
      invoice_id: string;
    };
  };
  currentSection: string;
  setCurrentSection: (section: string) => void;
}) {
  const { loading, data } = useInvoiceViewQuery({
    variables: { invoiceId },
  });

  const invoice = data?.invoice;
  const [updateInvoiceStatus] = useUpdateInvoiceStatusMutation({
    refetchQueries: ["InvoiceDetailsTable", "InvoiceHeaderView"],
  });
  const [updateInvoiceMetadata] = useUpdateInvoiceMetadataMutation({
    refetchQueries: ["InvoiceDetailsTable", "InvoiceHeaderView"],
  });
  const [isConfirmUnpaidModalOpen, setIsConfirmUnpaidModalOpen] =
    useState(false);
  const [isConfirmVoidModalOpen, setIsConfirmVoidModalOpen] = useState(false);
  const [isConfirmPaidModalOpen, setIsConfirmPaidModalOpen] = useState(false);
  const { dispatchSuccess, dispatchError } = useDispatchContext();

  const saveMetadata = (metadata: Record<string, string>) =>
    new Promise((resolve, reject) => {
      if (metadata) {
        updateInvoiceMetadata({
          variables: {
            input: {
              id: invoiceId,
              metadata: JSON.stringify(metadata),
            },
          },
        })
          .then((response) => {
            const { invoice: returnedInvoice, errors = [] } =
              response?.data?.updateInvoiceMetadata || {};
            if (errors.length) {
              dispatchError(errors.toString());
              reject(errors);
            } else {
              resolve(returnedInvoice);
            }
          })
          .catch((error) => reject(error));
      }
    });

  function handleUpdateStatus(status: InvoiceStatusEnum) {
    updateInvoiceStatus({
      variables: {
        input: {
          id: invoiceId,
          status,
        },
      },
    })
      .then((response) => {
        const { errors = [] } = response.data?.updateInvoiceStatus || {};
        if (errors.length) {
          dispatchError(errors[0]);
        } else {
          dispatchSuccess("Invoice status updated successfully.");
        }
      })
      .catch((err: Error) => {
        dispatchError(err.message);
      });
  }

  let content;
  switch (currentSection) {
    case "lineItems":
      content = (
        <div id="invoiceLineItems">
          <ListView
            customizableColumns={false}
            disableMetadata
            graphqlDocument={InvoiceLineItemsDocument}
            resource={INVOICE_LINE_ITEM}
            constantQueryVariables={{
              invoiceId,
            }}
          />
        </div>
      );
      break;
    case "paymentOrders":
      content = (
        <ListView
          graphqlDocument={PaymentOrdersForAssociatedEntityDocument}
          resource={PAYMENT_ORDER}
          constantQueryVariables={{
            invoiceId,
          }}
          enableExportData
          scrollX
        />
      );
      break;
    case "expectedPayments":
      content = (
        <ListView
          graphqlDocument={ExpectedPaymentsForAssociatedEntityDocument}
          resource={EXPECTED_PAYMENT}
          constantQueryVariables={{
            invoiceId,
          }}
          enableExportData
          scrollX
        />
      );
      break;
    case "transactionLineItems":
      content = (
        <ListView
          disableMetadata
          graphqlDocument={TransactionLineItemsViewDocument}
          resource={TRANSACTION_LINE_ITEM}
          constantQueryVariables={{
            invoiceId,
          }}
          enableExportData
          scrollX
        />
      );
      break;
    case "metadata":
      content = !loading && invoice && (
        <MetadataView
          initialMetadata={
            invoice?.metadata
              ? (JSON.parse(invoice?.metadata) as Array<{
                  key: string;
                  value: string;
                }>)
              : []
          }
          enableActions={invoice.canUpdate}
          saveEntity={saveMetadata}
          resource={INVOICE}
        />
      );
      break;
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{ entityId: invoiceId, entityType: "Invoices::Invoice" }}
          hideHeadline
        />
      );
      break;
    default:
      break;
  }

  return (
    <div className="p-6">
      <Layout
        heading={
          <InvoiceViewHeader
            invoiceId={invoiceId}
            onUpdateInvoiceToUnpaid={() => setIsConfirmUnpaidModalOpen(true)}
            onVoidInvoice={() => setIsConfirmVoidModalOpen(true)}
            onUpdateInvoiceToPaid={() => setIsConfirmPaidModalOpen(true)}
          />
        }
        primaryContent={
          <DetailsTable
            graphqlQuery={useInvoiceDetailsTableQuery}
            id={invoiceId}
            resource={INVOICE}
          />
        }
        secondaryContent={
          <div>
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onClick={(section: string) => setCurrentSection(section)}
            />
            {content}
          </div>
        }
      />
      <ConfirmModal
        onConfirm={() => {
          setIsConfirmUnpaidModalOpen(false);
          handleUpdateStatus(InvoiceStatusEnum.Unpaid);
        }}
        setIsOpen={setIsConfirmUnpaidModalOpen}
        isOpen={isConfirmUnpaidModalOpen}
        title="Issue invoice?"
      >
        This action is final and cannot be undone. Once the invoice is issued it
        can no longer be edited.
      </ConfirmModal>
      <ConfirmModal
        onConfirm={() => {
          setIsConfirmVoidModalOpen(false);
          handleUpdateStatus(InvoiceStatusEnum.Voided);
        }}
        setIsOpen={setIsConfirmVoidModalOpen}
        isOpen={isConfirmVoidModalOpen}
        title="Void invoice?"
      >
        This action is final and cannot be undone.
      </ConfirmModal>
      <ConfirmModal
        onConfirm={() => {
          setIsConfirmPaidModalOpen(false);
          handleUpdateStatus(InvoiceStatusEnum.Paid);
        }}
        setIsOpen={setIsConfirmPaidModalOpen}
        isOpen={isConfirmPaidModalOpen}
        title="Mark invoice as paid?"
      >
        This action is final and cannot be undone.
      </ConfirmModal>
    </div>
  );
}

export default sectionWithNavigator(InvoiceView, "lineItems");
