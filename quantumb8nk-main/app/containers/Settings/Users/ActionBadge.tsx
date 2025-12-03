// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { handleLinkClick } from "../../../../common/utilities/handleLinkClick";
import {
  Badge,
  BadgeType,
  ButtonClickEventTypes,
} from "../../../../common/ui-components";

interface ActionBadgeProps {
  discardedAt?: string | null;
  canEditUsers: boolean;
  userId: string;
}
type Action = {
  label: string;
  onClick: (event: ButtonClickEventTypes) => void;
};
function ActionBadge({ discardedAt, canEditUsers, userId }: ActionBadgeProps) {
  if (discardedAt) {
    return <Badge text="Deleted" type={BadgeType.Default} />;
  }
  const actions: Action[] = [];

  if (canEditUsers) {
    actions.push({
      label: "Edit",
      onClick: (event: ButtonClickEventTypes) => {
        handleLinkClick(`/settings/users/${userId}/edit`, event);
      },
    });
    return <Badge text="Actions" type={BadgeType.Cool} actions={actions} />;
  }
  return <Badge text="No Permissions" type={BadgeType.Default} />;
}

export default ActionBadge;
