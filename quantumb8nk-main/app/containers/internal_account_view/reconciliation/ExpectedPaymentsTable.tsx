// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useCallback, useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import * as Sentry from "@sentry/browser";
import { observer } from "mobx-react-lite";
import { uniqBy } from "lodash";
import ListView from "~/app/components/ListView";
import { mapNewExpectedPaymentQueryToVariables } from "~/common/search_components/expectedPaymentSearchComponents";
import { EXPECTED_PAYMENT } from "~/generated/dashboard/types/resources";
import { getDrawerContent } from "~/common/utilities/getDrawerContent";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";
import { useReconSplitViewStore } from "~/app/contexts/recon-split-view-context";
import { Button, Drawer, LoadingLine, Stack } from "~/common/ui-components";
import { SPLIT_RECONCILIATION_ACTIONS } from "~/common/constants/analytics";
import { cn } from "~/common/utilities/cn";
import {
  ExpectedPayment__StatusEnum,
  ExpectedPaymentsHomeQueryResult,
  ExpectedPaymentsTableDocument,
  useExpectedPaymentsTableCountLazyQuery,
  useCalculateExpectedPaymentsTotalAmountLazyQuery,
} from "../../../../generated/dashboard/graphqlSchema";
import ExpectedPaymentFormContainer from "../../expected_payments/ExpectedPaymentFormContainer";
import trackEvent from "../../../../common/utilities/trackEvent";
import useQueryParams from "~/app/components/filter/useQueryParams";

function selectedTransactionNetDirection(amount?: number) {
  if (!amount) return undefined;

  return amount > 0 ? "credit" : "debit";
}

interface EmptyExpectedPaymentsTableProps {
  internalAccountIds?: string[];
}

export function mapQueryToVariablesExpectedPayments(
  query: Record<string, unknown>,
) {
  const newQuery = {
    ...query,
    status:
      query.status !== undefined
        ? query.status
        : [
            ExpectedPayment__StatusEnum.Unreconciled,
            ExpectedPayment__StatusEnum.PartiallyReconciled,
          ],
  };

  return mapNewExpectedPaymentQueryToVariables(newQuery);
}

function EmptyExpectedPaymentsTable({
  internalAccountIds = [],
}: EmptyExpectedPaymentsTableProps) {
  return (
    <div className="flex h-[53dvh] w-full flex-col items-center justify-center gap-3 text-center font-medium not-italic text-gray-500">
      {internalAccountIds.length === 0 ? (
        <div className="text-base">Select an Account</div>
      ) : (
        <div className="text-base">No Expected Payments</div>
      )}
    </div>
  );
}

interface ExpectedPaymentsTableProps {
  internalAccountIds?: string[];
  disableBulkActions?: boolean;
}

function ExpectedPaymentsTable({
  internalAccountIds,
  disableBulkActions,
}: ExpectedPaymentsTableProps) {
  const [enableScrollX, setEnableScrollX] = useState(false);
  const { data: dataStore } = useReconSplitViewStore();
  const {
    expectedPayments,
    setExpectedPayments,
    expectedPaymentTotalCount,
    setExpectedPaymentTotalCount,
    setSelectedExpectedPaymentIds,
    selectedTransactionIds,
    selectedExpectedPaymentIds,
    refresh,
    setRefresh,
    selectedUnreconciledTotalWithNetCreditDebit,
    setSelectEverythingExpectedPayments,
    setExpectedPaymentsTotalAmountRange,
  } = dataStore;
  const [getFilters] = useQueryParams();
  const [netReconciliationEnabled] = useLiveConfiguration({
    featureName: "reconciliation/net_reconciliation",
  });
  const [selectAllEnabled] = useLiveConfiguration({
    featureName: "reconciliation_select_all",
  });

  const [getExpectedPaymentsTableCountQuery, { loading }] =
    useExpectedPaymentsTableCountLazyQuery();

  const [getExpectedPaymentsSelectEverythingTotalAmountQuery] =
    useCalculateExpectedPaymentsTotalAmountLazyQuery();

  const createExpectedPaymentToolTip =
    selectedTransactionIds.length === 0
      ? "Select a Transaction to make a matching Expected Payment"
      : null;

  const handleSelectEverythingExpectedPaymentsTotalAmount = useCallback(
    (query?: Record<string, unknown>) => {
      const defaultQuery = {
        internalAccountIds,
        status: [
          ExpectedPayment__StatusEnum.Unreconciled,
          ExpectedPayment__StatusEnum.PartiallyReconciled,
        ],
      };

      getExpectedPaymentsSelectEverythingTotalAmountQuery({
        variables: {
          ...mapNewExpectedPaymentQueryToVariables({
            ...query,
            ...defaultQuery,
          }),
        },
        fetchPolicy: "no-cache",
      })
        .then((response) => {
          const totalRange =
            response.data?.calculateExpectedPaymentsTotalAmount?.totalRange;

          setExpectedPaymentsTotalAmountRange(
            (totalRange?.min as bigint) || BigInt(0),
            (totalRange?.max as bigint) || BigInt(0),
          );
        })
        .catch((err) => {
          Sentry.captureException(err);
        });
    },
    [
      getExpectedPaymentsSelectEverythingTotalAmountQuery,
      internalAccountIds,
      setExpectedPaymentsTotalAmountRange,
    ],
  );

  const handleTableCount = useCallback(
    (query?: Record<string, unknown>) => {
      const defaultQuery = {
        internalAccountIds,
        status: [
          ExpectedPayment__StatusEnum.Unreconciled,
          ExpectedPayment__StatusEnum.PartiallyReconciled,
        ],
      };

      getExpectedPaymentsTableCountQuery({
        variables: {
          ...mapNewExpectedPaymentQueryToVariables({
            ...query,
            ...defaultQuery,
          }),
        },
        fetchPolicy: "no-cache",
      })
        .then((response) => {
          setExpectedPaymentTotalCount(
            response.data?.expectedPayments?.totalCount || 0,
          );
        })
        .catch((err) => {
          Sentry.captureException(err);
        });
    },
    [
      getExpectedPaymentsTableCountQuery,
      internalAccountIds,
      setExpectedPaymentTotalCount,
    ],
  );

  useEffect(() => {
    const initialParse = getFilters(EXPECTED_PAYMENT);
    handleTableCount(initialParse);
    if (selectAllEnabled) {
      handleSelectEverythingExpectedPaymentsTotalAmount(initialParse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    handleTableCount,
    handleSelectEverythingExpectedPaymentsTotalAmount,
    selectAllEnabled,
  ]);

  return (
    <Stack
      id="expected-payments-table"
      className="grid-rows-[36px_minmax(100px,_1fr)] gap-3"
    >
      <div className="flex w-full items-end justify-between px-4">
        <div
          className={cn(
            "flex flex-1 gap-2",
            loading && "items-center",
            !loading && "items-baseline",
          )}
        >
          <div className="text-base font-medium text-gray-700">
            Expected Payments
          </div>
          {loading && (
            <div className="w-8">
              <LoadingLine />
            </div>
          )}
          {!loading && (
            <div className="text-xs text-gray-500">
              {expectedPaymentTotalCount || "0"}
            </div>
          )}
        </div>

        <div>
          <Drawer
            trigger={
              <span
                className="flex items-center gap-1.5"
                data-tip={createExpectedPaymentToolTip}
                data-for="create-expected-payment-button"
                data-effect="solid"
              >
                <Button
                  buttonHeight="extra-small"
                  disabled={
                    selectedTransactionIds.length === 0 ||
                    (selectedTransactionIds.length > 1 &&
                      selectedExpectedPaymentIds.length > 1)
                  }
                  onClick={() => {
                    trackEvent(
                      null,
                      SPLIT_RECONCILIATION_ACTIONS.CREATE_EXPECTED_PAYMENT_CLICKED,
                    );
                  }}
                >
                  Create Expected Payment
                </Button>
                {/* !important overriding classes to correct conflicting component behavior */}
                <ReactTooltip
                  id="create-expected-payment-button"
                  className="!absolute !left-auto !top-auto !-ml-4 !mb-28 !mt-0 text-center"
                />
              </span>
            }
          >
            {({ toggleIsOpen }: { toggleIsOpen: () => void }) => {
              const handleSuccess = () => {
                toggleIsOpen(); // Close the Drawer
                setRefresh();
              };
              const amount = netReconciliationEnabled
                ? selectedUnreconciledTotalWithNetCreditDebit
                : undefined;

              const expectedPaymentFormProps = {
                internalAccountId: internalAccountIds?.[0],
                direction: selectedTransactionNetDirection(amount),
                rawAmountLowerBound: amount,
                transactionId:
                  selectedTransactionIds.length >= 1
                    ? selectedTransactionIds[0]
                    : undefined,
                onSuccess: handleSuccess,
              };

              return (
                <ExpectedPaymentFormContainer {...expectedPaymentFormProps} />
              );
            }}
          </Drawer>
        </div>
      </div>
      <ListView
        graphqlDocument={ExpectedPaymentsTableDocument}
        mapQueryToVariables={mapQueryToVariablesExpectedPayments}
        resource={EXPECTED_PAYMENT}
        enableExportData={false}
        enableNewFilters
        scrollX={enableScrollX}
        renderDrawerContent={getDrawerContent}
        enableActions
        onDataChange={(
          query: Record<string, unknown>,
          data?: Record<string, unknown>,
        ) => {
          const typedResult = data as
            | ExpectedPaymentsHomeQueryResult["data"]
            | undefined;
          if (typedResult) {
            const unqiueExpectedPayments = uniqBy(
              [...typedResult.expectedPayments.edges, ...expectedPayments],
              (element) => element.node.id,
            );
            setExpectedPayments(unqiueExpectedPayments);
            setEnableScrollX(typedResult.expectedPayments.edges.length > 0);
            handleTableCount(query);
            if (selectAllEnabled) {
              handleSelectEverythingExpectedPaymentsTotalAmount(query);
            }
          }
        }}
        initialSelectedRows={dataStore.selectedExpectedPaymentIds}
        setSelectedRowCallback={setSelectedExpectedPaymentIds}
        constantQueryVariables={{
          internalAccountIds,
        }}
        overrideFilterValue={{
          status: {
            hidden: true,
            value: ExpectedPayment__StatusEnum.Unreconciled,
          },
        }}
        filterIdsToRemove={[
          "internalAccountIds",
          "status",
          "reconciliationMethod",
          "transactionId",
        ]}
        refetch={refresh}
        customViewName="expected_payment_reconciliation_split_view"
        overrideCustomColumnValue={{
          prettyDateRange: { default: true },
          prettyAmountRange: { default: true },
          prettyAmountUnreconciled: { default: true },
          description: { default: true },
        }}
        emptyDataRowText={
          <EmptyExpectedPaymentsTable internalAccountIds={internalAccountIds} />
        }
        onQueryArgChangeCallback={(filters: Record<string, unknown>) => {
          if (selectAllEnabled) {
            handleSelectEverythingExpectedPaymentsTotalAmount(filters);
          }
          handleTableCount(filters);
        }}
        setSelectEverythingCallback={
          selectAllEnabled ? setSelectEverythingExpectedPayments : undefined
        }
        totalCount={expectedPaymentTotalCount}
        disableBulkActions={disableBulkActions}
        stickyHeader
      />
    </Stack>
  );
}

export default observer(ExpectedPaymentsTable);
