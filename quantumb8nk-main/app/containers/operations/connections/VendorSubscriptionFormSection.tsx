// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field } from "formik";
import React from "react";
import { ConnectionEndpointFormValues } from "~/app/containers/operations/connections/types";
import { FormikCheckboxField } from "~/common/formik";
import { Heading, Label } from "~/common/ui-components";

interface VendorSubscriptionFormSectionProps {
  connectionEndpoints: ConnectionEndpointFormValues[];
}

function VendorSubscriptionFormSection({
  connectionEndpoints,
}: VendorSubscriptionFormSectionProps) {
  if (!connectionEndpoints.length) {
    return (
      <>To create vendor subscriptions, first create a connection endpoint.</>
    );
  }

  return (
    <>
      {connectionEndpoints.map((connectionEndpoint, ceIndex) => {
        const connectionEndpointName = `connectionEndpoints.${ceIndex}`;
        return (
          <div key={connectionEndpointName} className="flex flex-col gap-2">
            <Heading level="h3" size="m" className="font-semibold">
              {connectionEndpoint.label}
            </Heading>
            <div className="flex flex-col gap-4">
              {connectionEndpoint.vendorSubscriptions.map(
                (vendorSubscription, vsIndex) => {
                  const vendorSubscriptionName = `${connectionEndpointName}.vendorSubscriptions.${vsIndex}`;
                  return (
                    <div
                      key={vendorSubscriptionName}
                      className="flex justify-between hover:bg-gray-50"
                    >
                      <div className="flex flex-col gap-1">
                        <Label>{vendorSubscription.configId}</Label>
                        <Label className="text-xs">
                          {vendorSubscription.description}
                        </Label>
                      </div>
                      <div className="mt-1 items-start">
                        {vendorSubscription.id ? (
                          <Field
                            className="cursor-pointer align-middle"
                            name="vendorSubscriptionIdsToDiscard"
                            value={vendorSubscription.id}
                            type="checkbox"
                            inverted
                            component={FormikCheckboxField}
                          />
                        ) : (
                          <Field
                            className="cursor-pointer align-middle"
                            name="vendorSubscriptionsToCreate"
                            type="checkbox"
                            value={`${connectionEndpoint.id}:${vendorSubscription.configId}`}
                            component={FormikCheckboxField}
                          />
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
export default VendorSubscriptionFormSection;
