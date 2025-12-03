// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PartnerSearchDetailViewQuery } from "../../../generated/dashboard/graphqlSchema";
import { Icon } from "../../../common/ui-components";

type Organization = NonNullable<
  PartnerSearchDetailViewQuery["partnerSearch"]
>["organization"];
type InitiatingUser = NonNullable<
  PartnerSearchDetailViewQuery["partnerSearch"]
>["initiatingUser"];

interface InitiatingUserInfosProps {
  organization: Organization;
  initiatingUser: InitiatingUser;
}

const SALESFORCE_DOMAIN =
  "https://moderntreasury.lightning.force.com/one/one.app";

function createSalesforcePayload(terms: string) {
  return {
    componentDef: "forceSearch:searchPageDesktop",
    attributes: {
      term: terms,
      groupId: "DEFAULT",
      scopeMap: { type: "TOP_RESULTS" },
      context: {
        disableSpellCorrection: false,
        disableIntentQuery: false,
        searchDialogSessionId: "00000000-0000-0000-0000-000000000000",
        searchSource: "INPUT_DESKTOP",
        permsAndPrefs: {
          "SearchUi.feedbackComponentEnabled": false,
          "OrgPreferences.ChatterEnabled": true,
          "Search.crossObjectsAutoSuggestEnabled": true,
          "OrgPreferences.EinsteinSearchNaturalLanguageEnabled": false,
          "SearchUi.searchUIInteractionLoggingEnabled": false,
          "MySearch.userCanHaveMySearchBestResult": false,
        },
      },
    },
    state: {},
  };
}

function generateSalesforceLink(terms: string) {
  const payload = createSalesforcePayload(terms);
  let encodedString = "";
  try {
    encodedString = window.btoa(JSON.stringify(payload));
  } catch (e) {
    // Error message is displayed in resulting div
    return null;
  }

  return `${SALESFORCE_DOMAIN}#${encodedString}`;
}

export default function InitiatingUserInfo({
  organization,
  initiatingUser,
}: InitiatingUserInfosProps) {
  const contactLink = generateSalesforceLink(initiatingUser.email);
  const accountLink = generateSalesforceLink(
    organization?.domainName || organization?.name || "",
  );
  return (
    <div className="mb-8 basis-1/3 border">
      <div className="m-5">
        <p className="mb-6 text-xs font-medium">Search details</p>
        <p className="text-xs font-normal text-gray-500">
          Information about the user who started this partner search
        </p>
        <div className="grid grid-cols-12 flex-row">
          <div className="col-span-5 mt-3 break-words border-t border-gray-50 pt-3 text-xs font-bold text-black">
            User Name
          </div>
          <div className="col-span-7 mt-3 break-words border-t border-gray-50 pt-3 text-xs text-black">
            {initiatingUser.name}
          </div>
          <div className="col-span-5 mt-3 break-words border-t border-gray-50 pt-3 text-xs font-bold text-black">
            User Email
          </div>
          <div className="col-span-7 mt-3 break-words border-t border-gray-50 pt-3 text-xs text-black">
            {initiatingUser.email}
          </div>
          <div className="col-span-5 mt-3 break-words border-t border-gray-50 pt-3 text-xs font-bold text-black">
            SFDC Contact
          </div>
          <div className="col-span-7 mt-3 break-words border-t border-gray-50 pt-3 text-xs text-black">
            {contactLink ? (
              <a
                href={contactLink}
                className="text-blue-500"
                target="_blank"
                rel="noreferrer"
              >
                <div className="grid grid-flow-col">
                  <div>
                    View in Salesforce
                    {"  "}
                    <Icon
                      iconName="arrow_forward"
                      size="xs"
                      color="currentColor"
                      className="text-blue-500"
                    />
                  </div>
                </div>
              </a>
            ) : (
              <div>Unable to generate contact link</div>
            )}
          </div>
          <div className="col-span-5 mt-3 break-words border-t border-gray-50 pt-3 text-xs font-bold text-black">
            SFDC Account
          </div>
          <div className="col-span-7 mt-3 break-words border-t border-gray-50 pt-3 text-xs text-black">
            {accountLink ? (
              <a
                href={accountLink}
                className="text-blue-500"
                target="_blank"
                rel="noreferrer"
              >
                <div className="grid grid-flow-col">
                  <div>
                    View in Salesforce
                    {"  "}
                    <Icon
                      iconName="arrow_forward"
                      size="xs"
                      color="currentColor"
                      className="text-blue-500"
                    />
                  </div>
                </div>
              </a>
            ) : (
              <div>Unable to generate account link</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
