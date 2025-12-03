// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Button,
  ButtonClickEventTypes,
  PageHeader,
} from "../../../common/ui-components";
import { useSweepRuleViewQuery } from "../../../generated/dashboard/graphqlSchema";
import sectionWithNavigator from "../sectionWithNavigator";
import NotFound from "../../../errors/components/NotFound";
import AccountBalanceChart from "./AccountBalanceChart";
import SweepRulePaymentOrders from "./SweepRulePaymentOrders";
import SweepRuleEvents from "./SweepRuleEvents";
import SweepRuleDetails from "./SweepRuleDetails";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

interface SweepRuleViewProps {
  match: { params: { sweep_rule_id: string } };
}

function SweepRuleView({
  match: {
    params: { sweep_rule_id: sweepRuleId },
  },
}: SweepRuleViewProps) {
  const { data, loading } = useSweepRuleViewQuery({
    variables: {
      id: sweepRuleId,
    },
  });
  const { search } = useLocation();
  const hasSuccessMessage = search.includes("success");
  const sweepRule = data?.sweepRule;
  const title = `${sweepRule?.managedAccount?.name ?? ""} to ${
    sweepRule?.supportingAccount?.name ?? ""
  }`;

  function renderContent(section: string) {
    switch (section) {
      case "events":
        return <SweepRuleEvents sweepRuleId={sweepRuleId} />;
      case "paymentOrders":
        return <SweepRulePaymentOrders sweepRuleId={sweepRuleId} />;
      case "details":
        return (
          sweepRule && (
            <>
              <div className="sticky rounded-md border border-alpha-black-100 bg-background-default">
                <AccountBalanceChart
                  managedAccountId={sweepRule.managedAccountId}
                  managedAccountLabel={sweepRule.managedAccount?.name}
                  supportingAccountLabel={sweepRule.supportingAccount?.name}
                  supportingAccountId={sweepRule.supportingAccountId}
                  targetBalance={sweepRule.targetBalance}
                  selectedDays={sweepRule.schedule?.daysOfWeek ?? []}
                  every={sweepRule.schedule?.every ?? "day"}
                  interval={sweepRule.schedule?.interval ?? 1}
                  endDate={sweepRule.schedule?.endDate ?? undefined}
                  timeZone={sweepRule.schedule?.timeZone as string}
                />
              </div>
              <div className="sticky top-4 bg-background-default mint-lg:mt-0">
                <SweepRuleDetails loading={loading} sweepRule={sweepRule} />
              </div>
            </>
          )
        );
      default:
        return null;
    }
  }

  const sections = {
    details: "Details",
    paymentOrders: "Payment Orders",
    events: "Events",
  };

  return (
    <>
      {!loading && !sweepRule && (
        <NotFound
          ctaText="Sweep Rules"
          onCtaClick={(event: ButtonClickEventTypes) => {
            handleLinkClick("/sweeps", event);
          }}
        />
      )}
      {!loading && sweepRule && (
        <PageHeader
          title={title}
          loading={loading}
          crumbs={[
            { name: "All Automated Sweeps", path: "/sweeps" },
            { name: title },
          ]}
          right={
            <Button
              buttonType="primary"
              onClick={(event: ButtonClickEventTypes) =>
                handleLinkClick(`/sweeps/${sweepRuleId}/edit`, event)
              }
            >
              Edit
            </Button>
          }
          sections={sections}
          defaultSection="details"
        >
          {({ currentSection: section }) => (
            <>
              {hasSuccessMessage && (
                <Alert alertType="success">Sweep rule created!</Alert>
              )}
              {renderContent(section as string)}
            </>
          )}
        </PageHeader>
      )}
    </>
  );
}

export default sectionWithNavigator(SweepRuleView, "paymentOrders");
