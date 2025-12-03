// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ApolloError, FetchResult } from "@apollo/client";
import { isEmpty, capitalize, startCase } from "lodash";
import ReactTooltip from "react-tooltip";
import { checkActionsAlignment } from "~/app/actions/checkActionsAlignment";
import useLiveConfiguration from "~/common/utilities/useLiveConfiguration";
import { getDrawerContent } from "~/common/utilities/getDrawerContent";
import sectionWithNavigator from "../sectionWithNavigator";
import {
  PaymentOrderViewQuery,
  PaymentOrder__StatusEnum,
  ReviewActionEnum,
  usePaymentOrderViewQuery,
  useReviewPaymentOrdersMutation,
  useUpdatePaymentOrderMetadataMutation,
  useUpdatePaymentOrderStatusMutation,
  usePaymentOrderDetailsTableQuery,
  useActiveComplianceQuery,
  Decision__StatusEnum,
  Return__ReturnableTypeEnum,
  ReturnsForAssociatedEntityDocument,
  useExportDataToFileMutation,
  ExportFileEnum,
  ExportableEnum,
  ExportDataToFileMutation,
  InvoicesForAssociatedEntityDocument,
  RuleReviewers,
  Reviewer,
  useReviewableViewRuleReviewersQuery,
  RuleResourceTypeEnum,
} from "../../../generated/dashboard/graphqlSchema";
import DocumentUploadContainer from "../DocumentUploadContainer";
import MetadataView from "../../components/MetadataView";
import {
  Alert,
  Badge,
  BadgeAction,
  Button,
  ButtonClickEventTypes,
  Clickable,
  DateTime,
  Drawer,
  Icon,
  IndexTable,
  IndexTableSkeletonLoader,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
  Layout,
  PopoverPanel,
  SectionNavigator,
  Popover,
  PopoverTrigger,
  BadgeType,
} from "../../../common/ui-components";
import ReversalModal from "../../components/ReversalModal";
import DetailsTable from "../../components/DetailsTable";
import PaymentOrderTimeline from "./PaymentOrderTimeline";
import ReversalsMiniView, {
  REVERSAL_DATA_MAPPING,
} from "../reversals/ReversalsMiniView";
import {
  PAYMENT_ORDER_STATUSES,
  PAYMENT_ORDER_STATUS_TO_BADGE,
  PAYMENT_REFERENCE_TYPE_MAPPING,
} from "../../constants";
import PaymentOrderAttemptAccountNumber from "../../components/account_number/PaymentOrderAttemptAccountNumber";
import LineItemsView from "../../components/LineItemsView";
import PaymentOrderRiskProfileView from "../PaymentOrderRiskProfileView";
import PaymentOrderFormContainer from "../payment_order_form/PaymentOrderFormContainer";
import ExternalAccountView from "../ExternalAccountView";
import {
  PAYMENT_ORDER,
  RETURN,
  INVOICE,
} from "../../../generated/dashboard/types/resources";
import ListView from "../../components/ListView";
import InternalTool from "../../components/InternalTool";
import PaymentOrderInternalToolsView from "../PaymentOrderInternalToolsView";
import { KeyValuePair } from "../../constants/payment_order_form";
import { useDispatchContext } from "../../MessageProvider";
import PaymentOrderStatusBanner from "./PaymentOrderStatusBanner";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import ReviewablesApprovalTimeline from "../ReviewablesApprovalTimeline";
import ReviewableApprovalActions from "../approvals/ReviewableApprovalActions";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

const TRANSACTION_DATA_MAPPING: Record<string, string | undefined> = {
  accountLongName: "Account",
  prettyAmount: "Amount",
  description: "Description",
  direction: "Direction",
  asOfDate: "Date",
  status: "Status",
};

const ACCOUNT_DETAILS_DATA_MAPPING = {
  id: "Account ID",
  type: "Account Type",
  nameOnAccount: "Name on Account",
  routingNumber: "Routing Number",
  accountNumber: "Account Number",
  bankName: "Bank Name",
  address: "Address",
};

const COUNTERPARTY_DATA_MAPPING = {
  id: "Counterparty ID",
  name: "Name",
  email: "Email",
};

const SECTIONS = {
  trackingDetails: "Tracking",
  counterparty: "Counterparty",
  lineItems: "Line Items",
  metadata: "Metadata",
  documents: "Documents",
  invoices: "Invoices",
};

const statusBadge = (
  status: PaymentOrder__StatusEnum | undefined,
  isReviewing: boolean,
  tooltipMessage: string | null,
): JSX.Element => {
  if (status) {
    return (
      <>
        <span data-for="status-badge-tooltip" data-tip={tooltipMessage}>
          <Badge
            keepCaseFormat
            text={PAYMENT_ORDER_STATUSES[status]}
            type={PAYMENT_ORDER_STATUS_TO_BADGE[status]}
            disabled={isReviewing}
          />
        </span>
        <ReactTooltip
          id="status-badge-tooltip"
          data-place="bottom"
          place="bottom"
        />
      </>
    );
  }
  return <span />;
};

interface TrackingDetailsProps {
  paymentOrder: NonNullable<PaymentOrderViewQuery["paymentOrder"]>;
}

function TrackingDetails({ paymentOrder }: TrackingDetailsProps): JSX.Element {
  const batchDetails = paymentOrder.currentPaymentOrderAttempt
    ?.paymentOrderBatch && {
    id: paymentOrder.currentPaymentOrderAttempt?.paymentOrderBatch?.id,
    batchFileName:
      paymentOrder.currentPaymentOrderAttempt?.paymentOrderBatch?.fileNameOrId,
    createdAt: (
      <DateTime
        timestamp={
          paymentOrder.currentPaymentOrderAttempt?.paymentOrderBatch?.createdAt
        }
      />
    ),
  };

  const paymentReferences =
    paymentOrder.currentPaymentOrderAttempt?.paymentReferences || [];

  return (
    <KeyValueTable
      data={
        Object.assign(
          {
            prettyStatus: (
              <div className="flex">
                {statusBadge(paymentOrder.status, false, null)}
              </div>
            ),
            ...batchDetails,
          },
          ...paymentReferences.map((pf) => ({
            [`${pf.id}`]: pf.referenceNumber,
          })),
        ) as Record<string, string>
      }
      dataMapping={
        Object.assign(
          {
            prettyStatus: "Status",
            ...(paymentOrder.currentPaymentOrderAttempt?.paymentOrderBatch && {
              batchFileName: "Batch File Name",
              createdAt: "Batch File Created At",
            }),
          },
          ...paymentReferences.map((pf) => ({
            [`${pf.id}`]:
              PAYMENT_REFERENCE_TYPE_MAPPING[pf.referenceNumberType] ||
              startCase(`${pf.referenceNumberType}`),
          })),
        ) as Record<string, string>
      }
      altRowClassNames="tabbed-key-value-row"
      altTableClassNames="tabbed-key-value-table"
      unformattedColumnIds={new Set(["batchFileName"])}
    />
  );
}

const sectionHeader = (title: string) => (
  <div className="mb-4 border-b border-gray-50 pb-2">
    <p className="text-base font-medium">{startCase(title)}</p>
  </div>
);
interface TabsProps {
  paymentOrderId: string;
  loading: boolean;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  data?: PaymentOrderViewQuery;
  error?: ApolloError;
  reviewPaymentOrderCallback: (
    reviewAction: ReviewActionEnum,
    reviewAsGroupId: string | null,
    reviewerId: string | null,
    reviewAsAdminOverride: boolean,
  ) => void;
  blockedComplianceCasePath?: string;
  blockedExternalAccountPath?: string;
  allRuleReviewers: RuleReviewers[];
  advancedApprovalsPhase2Enabled: boolean;
  activeCompliance: boolean;
}

function Tabs({
  paymentOrderId,
  loading,
  currentSection,
  setCurrentSection,
  data,
  error,
  reviewPaymentOrderCallback,
  blockedComplianceCasePath,
  blockedExternalAccountPath,
  allRuleReviewers,
  advancedApprovalsPhase2Enabled,
  activeCompliance,
}: TabsProps) {
  const { dispatchError } = useDispatchContext();
  const [updatePaymentOrderMetadata] = useUpdatePaymentOrderMetadataMutation({
    refetchQueries: ["PaymentOrderView"],
  });

  const saveMetadata = useCallback(
    (metadata: Record<string, string>) =>
      new Promise((resolve, reject) => {
        if (metadata) {
          updatePaymentOrderMetadata({
            variables: {
              input: {
                id: paymentOrderId,
                metadata: JSON.stringify(metadata),
              },
            },
          })
            .then((response) => {
              const errors =
                response?.data?.updatePaymentOrderMetadata?.errors || [];
              const returnedPaymentOrder =
                response?.data?.updatePaymentOrderMetadata?.paymentOrder;
              if (errors.length) {
                dispatchError(errors.toString());
                reject(errors);
              } else {
                resolve(returnedPaymentOrder);
              }
            })
            .catch((updateError) => reject(updateError));
        }
      }),
    [updatePaymentOrderMetadata, paymentOrderId, dispatchError],
  );

  if (loading || error) {
    return null;
  }

  const paymentOrder = data?.paymentOrder;

  if (!paymentOrder) {
    return null;
  }

  const drawerTrigger = (label) => (
    <Clickable onClick={() => {}}>
      <div className="text-blue-500 hover:text-blue-600">{label}</div>
    </Clickable>
  );

  function receivingAccountData(
    // Explicitly pass in the paymentOrder to tell typescript that paymentOrder is not-null.
    // eslint-disable-next-line @typescript-eslint/no-shadow
    paymentOrder: NonNullable<PaymentOrderViewQuery["paymentOrder"]>,
  ) {
    const currentPaymentOrderAttemptId =
      paymentOrder?.currentPaymentOrderAttempt?.id;
    const receivingEntityId = paymentOrder?.receivingEntity?.id;
    const partialAccountNumber =
      paymentOrder?.currentPaymentOrderAttempt?.safeReceivingAccountNumber;

    let drawerContent: JSX.Element | string | null = null;

    switch (paymentOrder?.receivingEntity?.typename) {
      case "ExternalAccount":
        drawerContent = getDrawerContent(
          "ExternalAccount",
          paymentOrder.receivingEntity?.id,
        );
        break;
      case "InternalAccount":
        drawerContent = getDrawerContent(
          "InternalAccount",
          paymentOrder.receivingEntity?.id,
        );
        break;
      default:
        break;
    }
    const drawer = (
      <Drawer
        trigger={drawerTrigger(receivingEntityId)}
        path={paymentOrder?.receivingEntity?.path}
      >
        {drawerContent}
      </Drawer>
    );

    const accountNumberPoa =
      currentPaymentOrderAttemptId &&
      partialAccountNumber &&
      receivingEntityId ? (
        <PaymentOrderAttemptAccountNumber
          paymentOrderAttemptId={currentPaymentOrderAttemptId}
          receivingEntityId={receivingEntityId}
          partialAccountNumber={partialAccountNumber}
        />
      ) : null;

    return {
      id: drawer,
      type: startCase(paymentOrder?.receivingEntity?.typename),
      nameOnAccount:
        paymentOrder.currentPaymentOrderAttempt?.receivingPartyName,
      accountNumber: accountNumberPoa,
      routingNumber:
        paymentOrder.currentPaymentOrderAttempt?.receivingRoutingNumber,
      address: paymentOrder.currentPaymentOrderAttempt?.receivingAddress,
      bankName: paymentOrder.currentPaymentOrderAttempt?.receivingPartyBankName,
    };
  }

  function counterpartyData(
    receivingEntity: NonNullable<
      PaymentOrderViewQuery["paymentOrder"]
    >["receivingEntity"],
  ) {
    if (!receivingEntity?.counterparty) {
      return {
        id: null,
        name: null,
        email: null,
      };
    }

    const { counterparty } = receivingEntity;

    const drawer = (
      <Drawer trigger={drawerTrigger(counterparty.id)} path={counterparty.path}>
        {getDrawerContent("Counterparty", counterparty.id)}
      </Drawer>
    );

    return {
      id: drawer,
      name: counterparty.name,
      email: counterparty.email,
    };
  }

  function renderReviewablesApprovalTimeline() {
    const renderApprovalsTimeline =
      (allRuleReviewers && allRuleReviewers.length > 0) ||
      blockedComplianceCasePath ||
      blockedExternalAccountPath;

    if (renderApprovalsTimeline) {
      return (
        <ReviewablesApprovalTimeline
          enableSequentialApprovers={advancedApprovalsPhase2Enabled}
          canAdminOverride={paymentOrder?.canAdminOverride}
          currentUserId={data?.currentUser?.id as string}
          lastUpdaterId={paymentOrder?.lastUpdaterId as string}
          onReview={reviewPaymentOrderCallback}
          blockedExternalAccountPath={blockedExternalAccountPath}
          blockedComplianceCasePath={blockedComplianceCasePath}
          allRuleReviewers={allRuleReviewers}
          adminOverrideReviewer={
            paymentOrder?.adminOverrideReviewer as Reviewer
          }
          reviewableStatus={paymentOrder?.status as PaymentOrder__StatusEnum}
        />
      );
    }

    return null;
  }

  function renderContent(
    // Explicitly pass in the paymentOrder to tell typescript that paymentOrder is not-null.
    // eslint-disable-next-line @typescript-eslint/no-shadow
    paymentOrder: NonNullable<PaymentOrderViewQuery["paymentOrder"]>,
  ) {
    switch (currentSection) {
      case "trackingDetails":
        return (
          <>
            <div className="mb-5">
              <PaymentOrderStatusBanner paymentOrder={paymentOrder} />
              {renderReviewablesApprovalTimeline()}
            </div>
            <div id="tracking-details">
              {sectionHeader(currentSection)}
              <TrackingDetails paymentOrder={paymentOrder} />
            </div>
            <div className="mt-10">
              <PaymentOrderTimeline paymentOrderId={paymentOrderId} />
            </div>
          </>
        );
      case "lineItems":
        return (
          <>
            {sectionHeader(currentSection)}
            <LineItemsView
              itemizableType="payment_orders"
              itemizableId={paymentOrderId}
            />
          </>
        );
      case "counterparty":
        return (
          <>
            <div>
              {sectionHeader("Account Details")}
              {(loading || !paymentOrder) && (
                <KeyValueTableSkeletonLoader
                  dataMapping={ACCOUNT_DETAILS_DATA_MAPPING}
                />
              )}
              {paymentOrder && (
                <KeyValueTable
                  dataMapping={ACCOUNT_DETAILS_DATA_MAPPING}
                  data={receivingAccountData(paymentOrder)}
                  copyableData={["id", "email"]}
                  altRowClassNames="tabbed-key-value-row"
                  altTableClassNames="tabbed-key-value-table"
                />
              )}
            </div>
            <div className="mt-8">
              {sectionHeader("Counterparty Details")}
              {(loading || !paymentOrder) && (
                <KeyValueTableSkeletonLoader
                  dataMapping={COUNTERPARTY_DATA_MAPPING}
                />
              )}
              {paymentOrder && (
                <KeyValueTable
                  dataMapping={COUNTERPARTY_DATA_MAPPING}
                  data={counterpartyData(paymentOrder.receivingEntity)}
                  copyableData={["id", "email"]}
                  altRowClassNames="tabbed-key-value-row"
                  altTableClassNames="tabbed-key-value-table"
                />
              )}
            </div>
          </>
        );
      case "returns":
        return (
          <ListView
            graphqlDocument={ReturnsForAssociatedEntityDocument}
            resource={RETURN}
            constantQueryVariables={{
              returnableId: paymentOrder.id,
              returnableType: Return__ReturnableTypeEnum.PaymentOrder,
            }}
            enableExportData
            scrollX
          />
        );
      case "reversals":
        return (
          <>
            {sectionHeader(currentSection)}
            {loading && (
              <IndexTableSkeletonLoader
                headers={Object.keys(REVERSAL_DATA_MAPPING).map(
                  (key) =>
                    (REVERSAL_DATA_MAPPING as Record<string, string>)[key],
                )}
                numRows={3}
              />
            )}
            {paymentOrder && (
              <ReversalsMiniView paymentOrderId={paymentOrder.id} />
            )}
          </>
        );
      case "transactions":
        // TODO(stephane-mt): Add a payment_order_id filter to transactions
        // and replace this with ListView
        return (
          <>
            {sectionHeader(currentSection)}
            {loading && (
              <IndexTableSkeletonLoader
                headers={Object.keys(TRANSACTION_DATA_MAPPING).map(
                  (key) => TRANSACTION_DATA_MAPPING[key],
                )}
                numRows={5}
              />
            )}
            {paymentOrder && (
              <IndexTable
                dataMapping={TRANSACTION_DATA_MAPPING}
                data={paymentOrder.transactions.map((transaction) => ({
                  ...transaction,
                  direction: capitalize(transaction.direction),
                  status: transaction.posted ? "Posted" : "Pending",
                }))}
                styleMapping={{
                  description: "table-entry-wide",
                  prettyAmount: "table-entry-right-align table-entry-small",
                }}
              />
            )}
          </>
        );
      case "invoices":
        return (
          <ListView
            graphqlDocument={InvoicesForAssociatedEntityDocument}
            resource={INVOICE}
            constantQueryVariables={{
              paymentOrderId,
            }}
            disableMetadata
            enableExportData
            scrollX
          />
        );
      case "documents":
        return (
          <DocumentUploadContainer
            documentable_id={paymentOrderId}
            documentable_type="PaymentOrder"
            enableActions={paymentOrder.canUpdate}
          />
        );
      case "metadata":
        return (
          <MetadataView
            initialMetadata={
              JSON.parse(paymentOrder.metadata) as Array<{
                key: string;
                value: string;
              }>
            }
            enableActions={paymentOrder.canUpdate}
            saveEntity={saveMetadata}
            resource={PAYMENT_ORDER}
          />
        );
      case "complianceRuleMetadata":
        return (
          <MetadataView
            initialMetadata={
              JSON.parse(
                paymentOrder.complianceRuleMetadata as string,
              ) as Array<{
                key: string;
                value: string;
              }>
            }
            enableActions={false}
            resource={PAYMENT_ORDER}
          />
        );
      case "riskProfile":
        return activeCompliance ? (
          <>
            {sectionHeader(currentSection)}
            <PaymentOrderRiskProfileView
              paymentOrderQuery={data}
              loading={loading}
            />
          </>
        ) : null;
      default:
        return null;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <SectionNavigator
          sections={{
            ...SECTIONS,
            ...(activeCompliance ? { riskProfile: "Risk Profile" } : {}),
            ...(!isEmpty(
              JSON.parse(paymentOrder.complianceRuleMetadata || "{}"),
            ) && {
              complianceRuleMetadata: "Compliance Rule Metadata",
            }),
            ...(!isEmpty(paymentOrder.returns) && { returns: "Returns" }),
            ...(!isEmpty(paymentOrder.reversals) && { reversals: "Reversals" }),
            ...(!isEmpty(paymentOrder.transactions) && {
              transactions: "Transactions",
            }),
          }}
          currentSection={currentSection}
          onClick={setCurrentSection}
        />
      </div>
      {renderContent(paymentOrder)}
    </div>
  );
}

interface PaymentOrderViewProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  match: { params: { payment_order_id: string } };
}

function PaymentOrderView({
  currentSection,
  setCurrentSection,
  match: {
    params: { payment_order_id: paymentOrderId },
  },
}: PaymentOrderViewProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const { loading, error, data, refetch } = usePaymentOrderViewQuery({
    variables: { id: paymentOrderId },
  });
  const [
    showExternalAccountApprovalAlert,
    setShowExternalAccountApprovalAlert,
  ] = useState<boolean>(true);
  const [showComplianceApprovalAlert, setShowComplianceAccountApprovalAlert] =
    useState<boolean>(true);
  const [
    showCounterpartyNeedsApprovalAlert,
    setShowCounterpartyNeedsApprovalAlert,
  ] = useState<boolean>(true);
  const [showCounterpartyDeniedAlert, setShowCounterpartyDeniedAlert] =
    useState<boolean>(true);
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const actionsRef = useRef<HTMLInputElement | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<"right" | "left">(
    "right",
  );
  const [
    advancedApprovalsPhase2EnabledData,
    advancedApprovalsPhase2Loading,
    advancedApprovalsPhase2Error,
  ] = useLiveConfiguration({ featureName: "advanced_approvals_phase_2" });

  const advancedApprovalsPhase2Enabled =
    (!advancedApprovalsPhase2Loading &&
      !advancedApprovalsPhase2Error &&
      advancedApprovalsPhase2EnabledData) ??
    false;

  const { data: activeComplianceData } = useActiveComplianceQuery();
  const activeCompliance = activeComplianceData?.products.totalCount === 1;

  function externalAccountDrawer() {
    return data?.paymentOrder?.receivingEntity?.typename ===
      "ExternalAccount" ? (
      <Drawer
        trigger={
          <Button className="ml-1" buttonType="link">
            Manage your External Accounts approvals
          </Button>
        }
        path={data?.paymentOrder?.receivingEntity?.path}
        onClose={(): void => {
          void (async () => {
            await refetch();
          })();
        }}
      >
        <ExternalAccountView
          bypassConfirmModal
          hideBreadcrumbs
          match={{
            params: {
              external_account_id: data?.paymentOrder.receivingEntity?.id,
            },
          }}
        />
      </Drawer>
    ) : null;
  }

  function toggleIsUpdating() {
    if (!isUpdating) {
      setIsUpdating(true);
    } else {
      setIsUpdating(false);
    }
  }

  const paymentOrder = data?.paymentOrder;

  const [reviewPaymentOrders, { loading: isReviewing }] =
    useReviewPaymentOrdersMutation();
  function reviewPaymentOrderCallback(
    reviewAction: ReviewActionEnum,
    reviewAsGroupId: string | null,
    reviewerId: string | null,
    reviewAsAdminOverride: boolean,
  ) {
    reviewPaymentOrders({
      variables: {
        input: {
          input: {
            ids: [paymentOrderId],
            reviewAction,
            reviewAsGroupId,
            reviewerId,
            reviewAsAdminOverride,
          },
        },
      },
    })
      .then((response) => {
        const { data: reviewPaymentOrderData } = response;
        if (reviewPaymentOrderData?.reviewPaymentOrders?.allSucceeded) {
          window.location.reload();
        } else {
          dispatchError(`${reviewAction} was unsuccessful.`);
        }
      })
      .catch(() => {
        dispatchError("An error occurred");
      });
  }

  const [updatePaymentOrderStatus] = useUpdatePaymentOrderStatusMutation({
    refetchQueries: ["PaymentOrderView"],
  });
  function updatePaymentOrderStatusFunc(status: PaymentOrder__StatusEnum) {
    updatePaymentOrderStatus({
      variables: { input: { id: paymentOrderId, status } },
    })
      .then((response) => {
        const { data: updatePaymentOrderStatusData } = response;
        const errors =
          updatePaymentOrderStatusData?.updatePaymentOrderStatus?.errors ?? [];
        if (errors.length) {
          dispatchError(errors.toString());
        } else {
          window.location.reload();
        }
      })
      .catch(() =>
        dispatchError("Sorry, we could not update the payment order"),
      );
  }

  const [exportDataToFile] = useExportDataToFileMutation();
  function generatePdfFunc() {
    exportDataToFile({
      variables: {
        input: {
          input: {
            fileType: ExportFileEnum.Pdf,
            exportableId: paymentOrderId,
            exportableType: ExportableEnum.PaymentOrder,
          },
        },
      },
    })
      .then(
        (
          result: FetchResult<
            ExportDataToFileMutation,
            Record<string, unknown>,
            Record<string, unknown>
          >,
        ) => {
          if (result.data?.exportDataToFile?.errors?.length === 0) {
            dispatchSuccess(
              "Your PDF export is being processed and will arrive in your email shortly.",
            );
            return;
          }

          const errorMessage = result.data?.exportDataToFile?.errors[0];
          dispatchError(errorMessage || "An error occurred.");
        },
      )
      .catch(() => {
        dispatchError("An error occurred.");
      });
  }

  const needsApproval =
    paymentOrder?.status === PaymentOrder__StatusEnum.NeedsApproval;
  const denied = paymentOrder?.status === PaymentOrder__StatusEnum.Denied;

  const showPendingExternalAccountApproval =
    paymentOrder?.blockedByExternalAccountApproval && needsApproval;

  const showCounterpartyDenied =
    paymentOrder?.deniedByCounterpartyStatus && denied;
  const showCounterpartyNeedsApproval =
    paymentOrder?.needsApprovalBecauseCounterpartyStatus && needsApproval;

  const caseId = paymentOrder?.decision?.complianceCase?.id;
  const decisionStatus = paymentOrder?.decision?.status;

  const { data: allRuleReviewersData } = useReviewableViewRuleReviewersQuery({
    variables: {
      reviewableId: paymentOrderId,
      reviewableType: RuleResourceTypeEnum.PaymentOrder,
    },
  });

  const allRuleReviewers =
    allRuleReviewersData?.ruleReviewers as RuleReviewers[];

  function pendingExternalAccountAlert(): JSX.Element | null {
    if (paymentOrder?.receivingEntity?.typename !== "ExternalAccount") {
      return null;
    }

    const externalAccountPath = paymentOrder?.receivingEntity?.path;

    return showPendingExternalAccountApproval &&
      externalAccountPath &&
      showExternalAccountApprovalAlert ? (
      <Alert
        alertType="warning"
        className="mb-2"
        onClear={(): void => setShowExternalAccountApprovalAlert(false)}
      >
        The External Account on this payment order requires approval.
        {externalAccountDrawer()}
      </Alert>
    ) : null;
  }

  function pendingComplianceAlert(): JSX.Element | null {
    if (
      (!caseId && !decisionStatus) ||
      Decision__StatusEnum.NeedsApproval !== decisionStatus
    ) {
      return null;
    }

    const casePath = `/compliance/cases/${caseId ?? ""}`;

    return showComplianceApprovalAlert ? (
      <Alert
        alertType="warning"
        className="mb-2"
        onClear={(): void => setShowComplianceAccountApprovalAlert(false)}
      >
        Compliance on this payment order requires approval.
        <Button
          className="ml-1"
          buttonType="link"
          display="inline-block"
          onClick={(event: ButtonClickEventTypes): void => {
            handleLinkClick(casePath, event);
          }}
        >
          Manage your Compliance approvals
        </Button>
      </Alert>
    ) : null;
  }

  function pendingCounterpartyAlert(): JSX.Element | null {
    const counterparty = data?.paymentOrder?.counterparty;
    const counterpartyCasePath = counterparty?.decision?.complianceCase?.path;

    return showCounterpartyNeedsApproval &&
      counterpartyCasePath &&
      showCounterpartyNeedsApprovalAlert ? (
      <Alert
        alertType="warning"
        className="mb-2"
        onClear={(): void => setShowCounterpartyNeedsApprovalAlert(false)}
      >
        Counterparty on this payment order requires approval.
        <Button
          className="ml-1"
          buttonType="link"
          display="inline-block"
          onClick={(event: ButtonClickEventTypes): void => {
            handleLinkClick(counterpartyCasePath, event);
          }}
        >
          Manage your Counterparty approvals
        </Button>
      </Alert>
    ) : null;
  }

  function deniedCounterpartyAlert(): JSX.Element | null {
    const counterparty = data?.paymentOrder?.counterparty;
    const counterpartyDecisionPath = counterparty?.decision?.path;

    return showCounterpartyDenied &&
      counterpartyDecisionPath &&
      showCounterpartyDeniedAlert ? (
      <Alert
        alertType="danger"
        className="mb-2"
        onClear={(): void => setShowCounterpartyDeniedAlert(false)}
      >
        The Payment Order is Denied because the Counterparty has been Denied
        after being flagged by Compliance ongoing watchlist monitoring.
        <Button
          className="ml-1"
          buttonType="link"
          display="inline-block"
          onClick={(event: ButtonClickEventTypes): void => {
            handleLinkClick(counterpartyDecisionPath, event);
          }}
        >
          Manage your Compliance Cases
        </Button>
      </Alert>
    ) : null;
  }

  function statusBadgeTooltipMessage(): string | null {
    if (pendingExternalAccountAlert() != null) {
      return "The External Account on this payment order requires approval.";
    }

    if (pendingComplianceAlert() != null) {
      return "Compliance on this payment order requires approval.";
    }

    if (pendingCounterpartyAlert() != null) {
      return "Counterparty on this payment order requires approval.";
    }

    if (deniedCounterpartyAlert() != null) {
      return "Counterparty on this payment order is denied.";
    }

    if (paymentOrder?.status === PaymentOrder__StatusEnum.NeedsApproval) {
      const isAdminOverride = paymentOrder?.reviewers.some(
        (reviewer) =>
          reviewer.action === ReviewActionEnum.Approve &&
          reviewer.group?.id == null,
      );

      if (isAdminOverride) {
        return null;
      }

      const pendingReviewers = paymentOrder?.reviewers
        .filter((reviewer) => reviewer.action === ReviewActionEnum.Pending)
        .map(
          (reviewer) =>
            reviewer?.groups
              ?.map((cur_group): string => cur_group?.name ?? "")
              .join(" or "),
        )
        .filter(Boolean);

      if (pendingReviewers.length > 0) {
        return `Reviewers Pending: ${pendingReviewers.join(", ")}`;
      }
    }

    return null;
  }

  function newActions(): Array<BadgeAction> {
    const canUndoReview = paymentOrder?.canUndoReview;
    const actionLinks: Array<BadgeAction> = [];

    if (canUndoReview) {
      actionLinks.push({
        label: `Undo ${
          paymentOrder?.status === PaymentOrder__StatusEnum.Approved
            ? "Approval"
            : "Denial"
        }`,
        onClick: () =>
          updatePaymentOrderStatusFunc(PaymentOrder__StatusEnum.NeedsApproval),
      });
    }

    if (paymentOrder?.canUpdate && paymentOrder?.isCancellable) {
      actionLinks.push({
        label: "Cancel",
        onClick: () =>
          updatePaymentOrderStatusFunc(PaymentOrder__StatusEnum.Cancelled),
        type: "danger",
      });
    }

    if (paymentOrder?.canUpdate && paymentOrder?.isRedraftable) {
      actionLinks.push({
        label: "Redraft",
        onClick: () =>
          updatePaymentOrderStatusFunc(PaymentOrder__StatusEnum.NeedsApproval),
      });
    }

    if (paymentOrder?.canUpdate && paymentOrder?.isReversable) {
      actionLinks.push({
        label: "Reverse",
        onClick: () => setIsReverseModalOpen(true),
      });
    }

    if (paymentOrderId != null) {
      actionLinks.push({
        label: "Duplicate",
        onClick: (): void => {
          window.location.href = `/payment_orders/new?source_payment_order_id=${paymentOrderId}`;
        },
      });
    }

    if (paymentOrderId) {
      actionLinks.push({
        label: "Export PDF",
        onClick: (): void => generatePdfFunc(),
      });
    }

    return actionLinks;
  }

  // Listen to resize events to adjust anchorPosition for actions popover
  useEffect(() => {
    checkActionsAlignment(actionsRef, setAnchorPosition);
  }, []);

  function allActions() {
    const canReviewAsReviewer =
      allRuleReviewers &&
      allRuleReviewers
        .map(
          (ruleReviewers) =>
            ruleReviewers.reviewers?.map(
              (reviewer) => reviewer.canReviewAsGroups.length > 0,
            ),
        )
        .flat()
        .some(Boolean);

    return (
      <div className="flex gap-2" ref={actionsRef}>
        <Badge
          anchorOrigin={{ horizontal: anchorPosition }}
          icon={<Icon iconName="more_horizontal" />}
          actions={newActions()}
          type={BadgeType.Default}
          disabled={isReviewing}
        />
        {paymentOrder?.canUpdate && needsApproval && !isUpdating && (
          <Button onClick={toggleIsUpdating}>Edit</Button>
        )}
        {(canReviewAsReviewer || paymentOrder?.canAdminOverride) && (
          <Popover>
            <PopoverTrigger buttonType="primary">
              Review
              <Icon
                iconName="chevron_down"
                size="s"
                color="currentColor"
                className="text-white"
              />
            </PopoverTrigger>
            <PopoverPanel
              className="max-h-96 overflow-y-scroll"
              anchorOrigin={{ horizontal: anchorPosition }}
            >
              <ReviewableApprovalActions
                onReview={reviewPaymentOrderCallback}
                allRuleReviewers={allRuleReviewers}
                canAdminOverride={paymentOrder?.canAdminOverride}
                disableActions={isReviewing}
              />
            </PopoverPanel>
          </Popover>
        )}
      </div>
    );
  }

  if (isUpdating && paymentOrder) {
    return (
      <PaymentOrderFormContainer
        isEditForm
        paymentOrderId={paymentOrderId}
        paymentOrderData={{
          ...paymentOrder,
          accountingCategory: paymentOrder.accountingCategory?.id,
          accountingLedgerClass: paymentOrder.accountingLedgerClass?.id,
          amount: paymentOrder.prettyAmount,
          metadata: JSON.parse(paymentOrder.metadata) as KeyValuePair[],
          originatingAccountId: paymentOrder.originatingAccountId,
          counterparty:
            paymentOrder?.receivingEntity?.typename === "ExternalAccount"
              ? paymentOrder.receivingEntity.counterparty?.id
              : undefined,
          transactionMonitoringEnabled:
            !!paymentOrder?.transactionMonitoringEnabled,
          complianceRuleMetadata: JSON.parse(
            paymentOrder.complianceRuleMetadata as string,
          ) as KeyValuePair[],
          purpose: paymentOrder.purpose ?? undefined,
          originatingAccountCurrency:
            paymentOrder?.originatingAccount?.currency,
          foreignExchangeIndicator: paymentOrder?.foreignExchangeIndicator,
        }}
      />
    );
  }

  const header = () => {
    const headerMessage =
      pendingCounterpartyAlert() || deniedCounterpartyAlert();

    if (headerMessage) {
      return (
        <div className="container-headline payment-order-headline z-10">
          {headerMessage}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <InternalTool>
        <PaymentOrderInternalToolsView id={paymentOrderId} />
      </InternalTool>
      <div>
        <PageHeader
          title={paymentOrder?.prettyAmount || ""}
          subtitle={paymentOrder?.sentence || ""}
          left={statusBadge(
            paymentOrder?.status,
            isReviewing,
            statusBadgeTooltipMessage(),
          )}
          loading={loading}
          right={allActions()}
        >
          <Layout
            heading={header()}
            primaryContent={
              <DetailsTable
                graphqlQuery={usePaymentOrderDetailsTableQuery}
                id={paymentOrderId}
                resource={PAYMENT_ORDER}
              />
            }
            secondaryContent={
              <Tabs
                paymentOrderId={paymentOrderId}
                loading={loading}
                data={data}
                error={error}
                currentSection={currentSection}
                setCurrentSection={setCurrentSection}
                reviewPaymentOrderCallback={reviewPaymentOrderCallback}
                blockedComplianceCasePath={
                  (caseId || decisionStatus) &&
                  Decision__StatusEnum.NeedsApproval === decisionStatus
                    ? (paymentOrder?.decision?.complianceCase?.path as string)
                    : undefined
                }
                blockedExternalAccountPath={
                  paymentOrder?.blockedByExternalAccountApproval &&
                  needsApproval
                    ? (paymentOrder?.receivingEntity?.path as string)
                    : undefined
                }
                allRuleReviewers={allRuleReviewers}
                advancedApprovalsPhase2Enabled={
                  advancedApprovalsPhase2Enabled as boolean
                }
                activeCompliance={activeCompliance}
              />
            }
            ratio="1/3"
          />
          {paymentOrder && (
            <ReversalModal
              isOpen={isReverseModalOpen}
              setIsOpen={setIsReverseModalOpen}
              paymentOrderData={paymentOrder}
            />
          )}
        </PageHeader>
      </div>
    </>
  );
}

export default sectionWithNavigator(PaymentOrderView, "trackingDetails");
