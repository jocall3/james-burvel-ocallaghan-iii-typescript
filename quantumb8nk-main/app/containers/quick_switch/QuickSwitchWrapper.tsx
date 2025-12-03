// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { ReactNode } from "react";
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  Action,
} from "kbar";
import { flattenDeep, snakeCase } from "lodash";
import Results, { SearchType } from "./Actions";
import { Icon } from "../../../common/ui-components";
import {
  QuickSwitchViewQuery,
  useQuickSwitchViewQuery,
} from "../../../generated/dashboard/graphqlSchema";
import trackEvent from "../../../common/utilities/trackEvent";
import { QUICK_SWITCH } from "../../../common/constants/analytics";

function formatActions(data: QuickSwitchViewQuery | undefined): Action[] {
  const actions: Action[] = [];

  if (data) {
    const sections = data?.quickSwitch?.sections;

    sections?.forEach((section) => {
      const sectionActions = section?.actions;

      sectionActions.forEach((sectionAction) => {
        const actionId = `${snakeCase(section.name)}_${snakeCase(
          sectionAction.name,
        )}`;
        let newAction: Action = {
          id: actionId,
          name: sectionAction.name,
          section: section.name,
        };

        if (sectionAction.value && typeof sectionAction.value === "string") {
          newAction = {
            ...newAction,
            perform: () => {
              window.location.href = sectionAction.value as string;
              trackEvent(null, QUICK_SWITCH.QUICK_SWITCH_SEARCHED, {
                type: SearchType.Predefined,
                action: actionId,
              });
            },
          };
        }

        actions.push(newAction);

        if (sectionAction.pages) {
          const sectionPages = sectionAction.pages;
          sectionPages.forEach((sectionPage) => {
            const sectionPageId = `${actionId}_${snakeCase(sectionPage.name)}`;
            actions.push({
              id: sectionPageId,
              name: sectionPage.name,
              parent: actionId,
            });

            const sectionPageActions = sectionPage.value;
            if (sectionPageActions) {
              sectionPageActions.forEach((sectionPageAction) => {
                const sectionPageActionId = snakeCase(sectionPageAction.name);
                actions.push({
                  id: `${sectionPageId}_${sectionPageActionId}`,
                  name: sectionPageAction.name,
                  perform: () => {
                    window.location.href = sectionPageAction.value as string;
                    trackEvent(null, QUICK_SWITCH.QUICK_SWITCH_SEARCHED, {
                      type: SearchType.Predefined,
                      action: `${sectionPageId}_${sectionPageActionId}`,
                    });
                  },
                  parent: sectionPageId,
                });
              });
            }
          });
        }
      });
    });
  }

  return flattenDeep(actions);
}

interface QuickSwitchWrapperProps {
  children: ReactNode;
}

export default function QuickSwitchWrapper({
  children,
}: QuickSwitchWrapperProps) {
  const { loading, data } = useQuickSwitchViewQuery();
  const actions = formatActions(data);

  if (loading) {
    return null;
  }

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="z-50">
          <KBarAnimator className="w-full max-w-[600px] rounded-md border border-alpha-black-100 bg-background-dark shadow-2xl">
            <div className="border-b border-alpha-black-100">
              <div className="flex flex-row items-center px-4">
                <Icon
                  className="text-gray-600"
                  color="currentColor"
                  iconName="search"
                  size="m"
                />
                <KBarSearch
                  defaultPlaceholder="Search..."
                  className="w-full border-none bg-background-dark py-3 pl-2 pr-4 text-gray-25 outline-none"
                />
              </div>
            </div>
            <Results />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}
