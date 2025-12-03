// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { FieldArray, FormikProps } from "formik";
import React, { useState } from "react";
import { Box } from "@chakra-ui/react";

import InvoiceLineItemModal from "../InvoiceLineItemModal";
import InvoiceFormLineItemTable from "../InvoiceFormLineItemTable";
import {
  Button,
  Heading,
  HorizontalRule,
  Icon,
} from "../../../../../common/ui-components";

import { Checkbox, Dropdown } from "./LasSelect";
import { InvoiceFormValues } from "./types";

type PropTypes = {
  setFieldValue: FormikProps<InvoiceFormValues>["setFieldValue"];
  values: FormikProps<InvoiceFormValues>["values"];
  setShowLineItemModal: (arg: boolean) => void;
  setEditingLineItem: (arg: number | null) => void;
  setAmount: (arg: string) => void;
  setDisableLineItems: (arg: boolean) => void;
  showLineItemModal: boolean;
  editingLineItem: number | null;
  disableLineItems: boolean;
  showLas: boolean;
  isEditing: boolean | undefined;
};

export default function LineItems({
  setFieldValue,
  values,
  setShowLineItemModal,
  setEditingLineItem,
  setDisableLineItems,
  setAmount,
  showLineItemModal,
  editingLineItem,
  disableLineItems,
  showLas,
  isEditing,
}: PropTypes) {
  const [disableEditing] = useState(
    isEditing && !!values.ledgerAccountSettlement,
  );
  const [disableLasSelect] = useState(
    !!isEditing && !!values.ledgerAccountSettlement,
  );
  return (
    <div className="pb-8">
      {showLas ? (
        <Box marginBottom={24}>
          <Dropdown
            setFieldValue={setFieldValue}
            setAmount={setAmount}
            values={values}
            isDisabled={disableLasSelect}
          />
        </Box>
      ) : null}
      <div className="flex justify-between">
        <div className="flex items-center text-base">
          <Heading level="h2" size="m">
            Line Items
          </Heading>
          <span className="pl-2 pt-1 text-xs font-normal text-text-muted">
            Required
          </span>
        </div>
        <div className="flex">
          {!disableEditing && values.lineItems.length ? (
            <Button
              buttonType="link"
              onClick={() => {
                void setFieldValue("lineItems", []);
              }}
            >
              <Icon iconName="remove" />
              Remove All Line Items
            </Button>
          ) : null}
          <div className="pl-2">
            <Button
              buttonType="secondary"
              disabled={disableLineItems || disableEditing}
              onClick={() => setShowLineItemModal(true)}
            >
              Add Line Item
            </Button>
          </div>
        </div>
      </div>
      <div className="pb-2 pt-2">
        <HorizontalRule />
      </div>
      {!values.ingestLedgerEntries ? (
        <FieldArray name="lineItems">
          {({ remove, push }) => (
            <div className="mb-4">
              {values.lineItems.length ? (
                <InvoiceFormLineItemTable
                  lineItems={values.lineItems}
                  currency={values.currency}
                  onRemoveLineItem={remove}
                  onEditLineItem={(index: number) => {
                    setShowLineItemModal(true);
                    setEditingLineItem(index);
                  }}
                  disableLineItems={disableLineItems || !!disableEditing}
                />
              ) : (
                <div className="text-gray-500">None</div>
              )}
              {showLineItemModal && (
                <InvoiceLineItemModal
                  onConfirm={(data) => {
                    setShowLineItemModal(false);
                    if (editingLineItem != null) {
                      void setFieldValue(`lineItems.${editingLineItem}`, data);
                      setEditingLineItem(null);
                    } else {
                      push(data);
                    }
                  }}
                  onRequestClose={() => setShowLineItemModal(false)}
                  currency={values.currency}
                  lineItem={
                    editingLineItem != null
                      ? values.lineItems[editingLineItem]
                      : null
                  }
                />
              )}
            </div>
          )}
        </FieldArray>
      ) : null}
      {showLas && !disableLasSelect ? (
        <Checkbox
          setFieldValue={setFieldValue}
          setDisableLineItems={setDisableLineItems}
          disableLineItems={disableLineItems}
          values={values}
        />
      ) : null}
    </div>
  );
}
