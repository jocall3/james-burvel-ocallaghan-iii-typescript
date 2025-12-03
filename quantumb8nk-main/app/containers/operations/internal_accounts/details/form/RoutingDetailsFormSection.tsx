// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { FieldArray } from "formik";
import { HorizontalRule } from "~/common/ui-components";
import { RoutingDetailFormValues } from "./FormValues";
import AddRoutingDetailModal from "./AddRoutingDetailModal";
import DetailsFormSectionHeader, {
  DetailType,
} from "./DetailsFormSectionHeader";
import RoutingDetailFieldGroup from "./RoutingDetailFieldGroup";

interface RoutingDetailsFormSectionProps {
  fieldName?: string;
  routingDetails: RoutingDetailFormValues[];
}

function RoutingDetailsFormSection({
  fieldName = "routingDetails",
  routingDetails,
}: RoutingDetailsFormSectionProps) {
  const [showRoutingDetailModal, setShowRoutingDetailModal] = useState(false);

  return (
    <FieldArray name={fieldName}>
      {({ push, remove }) => (
        <>
          <div>
            <DetailsFormSectionHeader
              detailType={DetailType.Routing}
              onAddClick={() => setShowRoutingDetailModal(true)}
            />

            <HorizontalRule className="my-2" />

            <div className="grid grid-cols-2 gap-6">
              {routingDetails.map((routingDetail, index) => {
                const indexedFieldName = `${fieldName}.[${index}].routingNumber`;
                const onDelete = () => {
                  remove(index);
                };

                return (
                  <RoutingDetailFieldGroup
                    key={indexedFieldName}
                    fieldName={indexedFieldName}
                    routingDetail={routingDetail}
                    onDelete={onDelete}
                  />
                );
              })}
            </div>
          </div>

          {showRoutingDetailModal && (
            <AddRoutingDetailModal
              closeModal={() => setShowRoutingDetailModal(false)}
              onSubmit={(data: RoutingDetailFormValues) => push(data)}
            />
          )}
        </>
      )}
    </FieldArray>
  );
}

export default RoutingDetailsFormSection;
