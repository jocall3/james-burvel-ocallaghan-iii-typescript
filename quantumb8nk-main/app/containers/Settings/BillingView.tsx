// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import moment from "moment-timezone";

import AddCardModal from "../../components/AddCardModal";
import CancelPlanModal from "../../components/CancelPlanModal";
import NotFound from "../../../errors/components/NotFound";
import {
  AmericanExpressLogo,
  ExpandableCard,
  Clickable,
  DiscoverLogo,
  Icon,
  LoadingLine,
  MastercardLogo,
  VisaLogo,
} from "../../../common/ui-components";
import BillingContacts from "./BillingContacts";
import BillingHistory from "./BillingHistory";
import BillingPlanActions from "./BillingPlanActions";
import BillingUsageBarChart from "../../components/BillingUsageBarChart";
import {
  useBillingDataViewQuery,
  Billing__NetworkEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";

function cardBrandLogo(network: Billing__NetworkEnum | null | undefined) {
  switch (network) {
    case Billing__NetworkEnum.Visa:
      return <VisaLogo />;
    case Billing__NetworkEnum.Mc:
      return <MastercardLogo />;
    case Billing__NetworkEnum.Amex:
      return <AmericanExpressLogo />;
    case Billing__NetworkEnum.Disc:
      return <DiscoverLogo />;
    default:
      return <Icon iconName="credit_card" size="xxl" />;
  }
}

function BillingView() {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [showCancelPlanModal, setShowCancelPlanModal] = useState(false);

  const { data, loading, error } = useBillingDataViewQuery();

  const {
    billingSettings,
    ordwaySubscriptionSettings,
    canViewBillingUsage = false,
  } = data?.billingData ?? {};

  const handleCancelPlan = () => {
    setShowCancelPlanModal(true);
  };

  if (!loading && (error || !data)) {
    return (
      <NotFound
        message="Something went wrong."
        subtext="We are having trouble connecting"
        ctaText="Reload"
        onCtaClick={() => window.location.reload()}
      />
    );
  }

  return (
    <PageHeader title="Billing">
      <AddCardModal
        isOpen={isAddCardModalOpen}
        handleModalClose={() => setIsAddCardModalOpen(false)}
      />
      <CancelPlanModal
        isOpen={showCancelPlanModal}
        handleModalClose={() => setShowCancelPlanModal(false)}
      />
      <div className="grid w-full max-w-xl grid-flow-row gap-8">
        <div className="grid grid-flow-row gap-4 text-sm mint-md:grid-cols-2">
          {(loading || ordwaySubscriptionSettings) && (
            <ExpandableCard
              heading="Plan"
              action={
                !loading ? (
                  <BillingPlanActions onCancelPlan={handleCancelPlan} />
                ) : null
              }
            >
              <div className="mt-2 border-t border-gray-100 py-4">
                {loading && (
                  <div className="flex flex-col space-y-2">
                    <div className="w-24">
                      <LoadingLine />
                    </div>
                    <div className="w-28">
                      <LoadingLine />
                    </div>
                    <br />
                    <div className="w-full">
                      <LoadingLine />
                    </div>
                  </div>
                )}
                {ordwaySubscriptionSettings && !loading && (
                  <>
                    <div className="mb-4 grid grid-flow-row">
                      {ordwaySubscriptionSettings?.planId ===
                      ordwaySubscriptionSettings?.selfServePlanId ? (
                        <>
                          <span>$499 per month &amp;</span>
                          <span>$0.10 and 0.1% per reconciled payment</span>
                        </>
                      ) : (
                        <span>
                          Please{" "}
                          <a href="mailto:support@moderntreasury.com">
                            contact your account manager
                          </a>{" "}
                          for information on your pricing plan.
                        </span>
                      )}
                    </div>
                    <div className="rounded bg-yellow-25 px-4 py-2">
                      <div className="flex flex-row items-center space-x-2">
                        <Icon
                          iconName="info"
                          color="currentColor"
                          className="text-yellow-300"
                          size="s"
                        />
                        <span className="text-xs font-medium text-gray-800">
                          Next Payment, &nbsp;
                          {moment(
                            ordwaySubscriptionSettings?.nextChargeDate,
                          ).format("MMM Do")}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ExpandableCard>
          )}
          {!!billingSettings && (
            <ExpandableCard
              heading="Payment details"
              action={
                !loading ? (
                  <Clickable onClick={() => setIsAddCardModalOpen(true)}>
                    <span>Edit</span>
                  </Clickable>
                ) : null
              }
            >
              <div className="mt-2 grid grid-flow-row space-y-2 border-t border-gray-100 py-4">
                <span>{cardBrandLogo(billingSettings?.network)}</span>
                <span>{`•••• •••• •••• ${billingSettings?.last4 ?? ""}`}</span>
                <span>{`expires ${moment(
                  billingSettings?.expiry,
                  "MMYY",
                ).format("MM/YY")}`}</span>
              </div>
            </ExpandableCard>
          )}
        </div>
        <div className="grid grid-flow-row gap-8">
          <BillingContacts
            loading={loading}
            billingContacts={
              data?.billingData?.ordwaySubscriptionSettings?.billingContacts ??
              []
            }
            users={data?.usersUnpaginated ?? []}
            organizationCreationSource={
              data?.currentOrganization.creationSource
            }
          />
          <BillingHistory
            loading={loading}
            ordwaySubscriptionSettings={ordwaySubscriptionSettings}
          />
          {canViewBillingUsage && <BillingUsageBarChart />}
        </div>
      </div>
    </PageHeader>
  );
}

export default BillingView;
