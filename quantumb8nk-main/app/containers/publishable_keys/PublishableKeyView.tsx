// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import {
  Badge,
  BadgeAction,
  BadgeType,
  ButtonClickEventTypes,
  ConfirmModal,
  DateTime,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
  LoadingLine,
  MTContainer,
} from "../../../common/ui-components";
import useErrorBanner from "../../../common/utilities/useErrorBanner";
import NotFound from "../../../errors/components/NotFound";
import {
  useDeletePublishableKeyMutation,
  usePublishableKeyViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import { PageHeader } from "../../../common/ui-components/PageHeader/PageHeader";
import { handleLinkClick } from "../../../common/utilities/handleLinkClick";

const PUBLISHABLE_KEY_DATA_MAPPING = {
  id: "ID",
  name: "Name",
  key: "Key",
  prettyDomainAllowlist: "Allowed Domains",
  prettyRateLimit: "Rate Limit",
  prettyCreatedAt: "Created At",
  prettyDiscardedAt: "Discarded At",
};

type RouterProps = {
  match: {
    params: {
      publishable_key_id: string;
    };
  };
  isDrawerContent?: boolean;
};

function PublishableKeyView({
  match: {
    params: { publishable_key_id: publishableKeyId },
  },
  isDrawerContent,
}: RouterProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { loading, data, error } = usePublishableKeyViewQuery({
    variables: { id: publishableKeyId },
  });
  const [deletePublishableKey] = useDeletePublishableKeyMutation();
  const flashError = useErrorBanner();

  if (error) {
    return <NotFound message="Something went wrong." subtext="" />;
  }

  if (!data?.publishableKey || loading) {
    return (
      <div>
        <MTContainer
          header={
            <div className="w-48">
              <LoadingLine />
            </div>
          }
          headerSize="l"
        >
          <KeyValueTableSkeletonLoader
            dataMapping={PUBLISHABLE_KEY_DATA_MAPPING}
          />
        </MTContainer>
      </div>
    );
  }

  const publishableKey = {
    prettyCreatedAt: <DateTime timestamp={data.publishableKey.createdAt} />,
    prettyDiscardedAt: data.publishableKey.discardedAt ? (
      <DateTime timestamp={data.publishableKey.discardedAt} />
    ) : null,
    ...data.publishableKey,
  };

  const actionBadge = () => {
    const actions: Array<BadgeAction> = [];
    actions.push({
      label: "Edit",
      onClick: (event: ButtonClickEventTypes) => {
        handleLinkClick(publishableKey.editPath, event);
      },
    });
    actions.push({
      label: "Deactivate",
      onClick: () => setConfirmOpen(true),
      type: "danger",
    });
    return <Badge text="Actions" type={BadgeType.Cool} actions={actions} />;
  };

  return (
    <PageHeader
      action={!isDrawerContent && actionBadge()}
      hideBreadCrumbs
      title={publishableKey?.name}
    >
      <ConfirmModal
        isOpen={confirmOpen}
        setIsOpen={setConfirmOpen}
        confirmType="delete"
        title="Are you sure you want to deactivate this Publishable Key? This cannot be undone."
        onConfirm={() => {
          setConfirmOpen(false);
          deletePublishableKey({
            variables: { input: { id: publishableKeyId } },
          })
            .then(({ data: deleteData }) => {
              if (deleteData?.deletePublishableKey?.errors?.length) {
                flashError(deleteData.deletePublishableKey.errors[0]);
                window.scrollTo(0, 0);
              } else {
                window.location.href = `/developers/publishable_keys`;
              }
            })
            .catch((e: Error) => {
              flashError(e.message);
            });
        }}
      />
      <KeyValueTable
        dataMapping={PUBLISHABLE_KEY_DATA_MAPPING}
        data={publishableKey}
        copyableData={["id", "key"]}
      />
    </PageHeader>
  );
}

export default PublishableKeyView;
