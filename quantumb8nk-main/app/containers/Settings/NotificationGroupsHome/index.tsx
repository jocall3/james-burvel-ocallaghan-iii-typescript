// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import {
  FieldGroup,
  Label,
  SelectField,
} from "../../../../common/ui-components";
import SomethingWentWrong from "../../../../errors/components/SomethingWentWrong";
import {
  NotificationGroup,
  NotificationGroupsHomeQuery,
  useActiveComplianceQuery,
  useNotificationGroupsHomeQuery,
  useDeleteNotificationGroupMutation,
  useCreateNotificationGroupMutation,
} from "../../../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../../MessageProvider";
import { PageHeader } from "../../../../common/ui-components/PageHeader/PageHeader";

interface NotificationGroupsHomeProps {
  viewData: NotificationGroupsHomeQuery;
}

function NotificationGroupsHome({ viewData }: NotificationGroupsHomeProps) {
  const [destroyNotificationGroup] = useDeleteNotificationGroupMutation();
  const [createNotificationGroup] = useCreateNotificationGroupMutation();
  const { data: activeComplianceData } = useActiveComplianceQuery();
  const {
    groupsUnpaginated: groupOptions,
    notificationGroups,
    abilities: {
      Group: { canUpdate },
    },
  } = viewData;
  const [nGroups, setNGroups] = useState(notificationGroups);
  const { dispatchError, dispatchSuccess } = useDispatchContext();

  const activeCompliance = activeComplianceData?.products.totalCount === 1;

  const notificationGroupsFor = (topic: string, events: Array<string>) => {
    const objects: Array<Array<NotificationGroup>> = [];
    events.forEach((event) => {
      objects.push(
        nGroups.filter((ng) => ng.topic === topic && ng.event === event),
      );
    });
    return objects.flat();
  };

  const handleNotificationGroupChange = (
    topic: string,
    events: Array<string>,
    id: string,
    option: { id: string },
    action,
  ) => {
    if (action === "select-option") {
      events.forEach((event) => {
        createNotificationGroup({
          variables: { input: { input: { group: id, topic, event } } },
        })
          .then((data) => {
            const notificationGroup =
              data.data?.createNotificationGroup?.notificationGroup;
            if (notificationGroup) {
              setNGroups((prevNGroups) => [...prevNGroups, notificationGroup]);
            }
          })
          .then(() => dispatchSuccess("Notification Group saved."))
          .catch((error: Error) => {
            dispatchError(error.message);
          });
      });
    } else if (action === "remove-value") {
      events.forEach((event) => {
        const notificationGroup = notificationGroupsFor(topic, [event]).find(
          (ng) => ng.groupId === option.id,
        );
        const notificationGroupId = notificationGroup?.id;
        if (notificationGroupId) {
          destroyNotificationGroup({
            variables: { input: { input: { id: notificationGroupId } } },
          })
            .then(() =>
              setNGroups((prevNGroups) =>
                prevNGroups.filter(
                  (nGroup) => nGroup.id !== notificationGroupId,
                ),
              ),
            )
            .then(() =>
              dispatchSuccess("Notification group removed successfully."),
            )
            .catch((error: Error) => {
              dispatchError(error.message);
            });
        }
      });
    }
  };

  function renderNotificationGroupSelect(
    label: string,
    resource: string,
    events: Array<string>,
  ) {
    return (
      <FieldGroup direction="top-to-bottom" className="mb-4">
        <Label id={`${resource}.manage`}>{label}</Label>
        <SelectField
          required
          isMulti
          isClearable={false}
          name={`${resource}.manage`}
          handleChange={(...args: [string, { id: string }, string]) =>
            handleNotificationGroupChange(resource, events, ...args)
          }
          selectValue={notificationGroupsFor(resource, events).map(
            (ng) => ng.groupId,
          )}
          placeholder="--Roles--"
          options={groupOptions}
          disabled={!canUpdate}
          containerClasses="flex-grow"
        />
      </FieldGroup>
    );
  }

  return (
    <PageHeader hideBreadCrumbs title="Notifications">
      <div>
        <h3 className="mb-2 text-base font-medium">
          Organization Notifications
        </h3>
        <div className="mb-2 text-xs text-gray-600">
          Adding roles will subscribe them to email notifications
        </div>
      </div>
      <div className="notifications-section">
        {renderNotificationGroupSelect("Rules are Edited", "rule", [
          "created",
          "updated",
          "deleted",
        ])}
        {renderNotificationGroupSelect("Payment Orders Fail", "payment_order", [
          "failed",
        ])}
        {renderNotificationGroupSelect("Returns Created", "return", [
          "created",
        ])}
        {renderNotificationGroupSelect("Paper Items", "paper_item_report", [
          "created",
        ])}
        {renderNotificationGroupSelect(
          "Expected Payment Orders are Overdue",
          "expected_payment",
          ["overdue"],
        )}
        {renderNotificationGroupSelect(
          "Webhook Endpoints Fail",
          "webhook_endpoint",
          ["failing"],
        )}
        {activeCompliance &&
          renderNotificationGroupSelect(
            "Compliance Decisions are automatically Denied",
            "compliance/decision",
            ["automatic_denial"],
          )}
        {renderNotificationGroupSelect(
          "Virtual Account High Utilization",
          "virtual_account",
          ["high_utilization"],
        )}
        {renderNotificationGroupSelect("Invoices", "invoices/invoice", [
          "unpaid",
          "payment_pending",
          "payment_failed",
          "paid",
          "voided",
        ])}
      </div>
    </PageHeader>
  );
}

export default function FetchNotificationGroupsContainer() {
  const { data: viewData, loading, error } = useNotificationGroupsHomeQuery();

  if (loading && !viewData) {
    return <ClipLoader />;
  }
  if (error || !viewData) {
    return <SomethingWentWrong />;
  }
  return <NotificationGroupsHome viewData={viewData} />;
}
