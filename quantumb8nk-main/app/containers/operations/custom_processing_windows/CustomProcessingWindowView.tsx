// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { useDispatchContext } from "~/app/MessageProvider";
import DetailsTable from "~/app/components/DetailsTable";
import {
  useCustomProcessingWindowDetailsTableQuery,
  useOperationsCustomProcessingWindowViewQuery,
  useOperationsDeleteCustomProcessingWindowMutation,
} from "~/generated/dashboard/graphqlSchema";
import {
  Badge,
  BadgeType,
  Layout,
  PageHeader,
  SectionNavigator,
} from "~/common/ui-components";
import { CUSTOM_PROCESSING_WINDOW } from "~/generated/dashboard/types/resources";
import AuditRecordsHome from "~/app/components/AuditRecordsHome";
import sectionWithNavigator from "../../sectionWithNavigator";
import CustomProcessingWindowActions from "./CustomProcessingWindowActions";
import CustomProcessingWindowDeleteModal from "./form/CustomProcessingWindowDeleteModal";

const AUDIT_RECORD_ENTITY_TYPE = "CustomProcessingWindow";

const SECTIONS = {
  auditTrail: "Audit Trail",
};
interface CustomProcessingWindowViewProps {
  match: {
    params: {
      customProcessingWindowId: string;
    };
  };
  setCurrentSection: (section: string) => void;
  currentSection: string;
}

function CustomProcessingWindowView({
  match: {
    params: { customProcessingWindowId },
  },
  currentSection,
  setCurrentSection,
}: CustomProcessingWindowViewProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCustomProcessingWindow] =
    useOperationsDeleteCustomProcessingWindowMutation();

  const { data, loading } = useOperationsCustomProcessingWindowViewQuery({
    variables: {
      id: customProcessingWindowId,
    },
  });

  const handleCustomProcessingWindowDelete = () => {
    deleteCustomProcessingWindow({
      variables: {
        input: {
          id: customProcessingWindowId,
        },
      },
    })
      .then((response) => {
        const { errors = [] } =
          response.data?.operationsDeleteCustomProcessingWindow || {};

        if (errors.length) {
          dispatchError(errors.toString());
        } else {
          dispatchSuccess("Custom Processing Window was successfully deleted.");
          window.location.href = `/operations/custom_processing_windows/${customProcessingWindowId}`;
        }
      })
      .catch((err: Error) =>
        dispatchError(
          err.message ||
            "Unable to delete Custom Processing Window. Please try again.",
        ),
      );
  };

  let content;
  switch (currentSection) {
    case "auditTrail":
      content = (
        <AuditRecordsHome
          queryArgs={{
            entityId: customProcessingWindowId,
            entityType: AUDIT_RECORD_ENTITY_TYPE,
            includeAdminActions: true,
          }}
          hideHeadline
          hideLinks
        />
      );
      break;
    default:
      break;
  }

  const customProcessingWindow = data?.customProcessingWindow;
  const title = customProcessingWindow?.configId || customProcessingWindowId;

  return (
    <PageHeader
      loading={loading}
      title={title}
      left={
        customProcessingWindow?.discardedAt && (
          <Badge text="Deleted" type={BadgeType.Default} />
        )
      }
      right={
        !customProcessingWindow?.discardedAt && (
          <CustomProcessingWindowActions
            customProcessingWindowId={customProcessingWindowId}
            setDeleteModal={setIsDeleteModalOpen}
          />
        )
      }
    >
      <Layout
        ratio="1/3"
        primaryContent={
          <DetailsTable
            graphqlQuery={useCustomProcessingWindowDetailsTableQuery}
            id={customProcessingWindowId}
            resource={CUSTOM_PROCESSING_WINDOW}
          />
        }
        secondaryContent={
          <div className="mt-4">
            <SectionNavigator
              sections={SECTIONS}
              currentSection={currentSection}
              onClick={(section: string) => setCurrentSection(section)}
            />
            {content}
          </div>
        }
      />
      {customProcessingWindow && (
        <CustomProcessingWindowDeleteModal
          onConfirm={handleCustomProcessingWindowDelete}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          customProcessingWindow={customProcessingWindow}
        />
      )}
    </PageHeader>
  );
}

export default sectionWithNavigator(CustomProcessingWindowView, "auditTrail");
