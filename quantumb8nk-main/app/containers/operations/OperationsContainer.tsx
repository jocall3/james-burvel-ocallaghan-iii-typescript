// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Route, Switch } from "react-router";
import ConnectionsHome from "./connections/ConnectionsHome";
import ConnectionView from "./connections/ConnectionView";
import CreateConnection from "./connections/CreateConnection";
import ImportConnection from "./connections/ImportConnection";
import EditConnection from "./connections/EditConnection";
import ConnectionBulkImportsHome from "./connection_bulk_imports/ConnectionBulkImportsHome";
import ConnectionBulkImportView from "./connection_bulk_imports/ConnectionBulkImportView";
import ConnectionEndpointsHome from "./connection_endpoints/ConnectionEndpointsHome";
import ConnectionEndpointView from "./connection_endpoints/ConnectionEndpointView";
import CreateConnectionEndpoint from "./connections/CreateConnectionEndpoint";
import CreateConnectionEndpointV2 from "./connections/connection_endpoints/CreateConnectionEndpoint";
import OperationsHome from "./OperationsHome";
import PennyTestHome from "./PennyTestHome";
import InternalAccountsHome from "./internal_accounts/InternalAccountsHome";
import InternalAccountView from "./internal_accounts/InternalAccountView";
import EditInternalAccount from "./internal_accounts/details/EditInternalAccount";
import CreateInternalAccount from "./connections/CreateInternalAccount";
import ImportInternalAccount from "./connections/ImportInternalAccount";
import CreateCustomProcessingWindow from "./connections/CreateCustomProcessingWindow";
import CustomProcessingWindowsHome from "./custom_processing_windows/CustomProcessingWindowsHome";
import CustomProcessingWindowView from "./custom_processing_windows/CustomProcessingWindowView";
import EditCustomProcessingWindow from "./custom_processing_windows/EditCustomProcessingWindow";
import CreateAccountCapability from "./internal_accounts/capabilities/CreateAccountCapability";
import AccountCapabilityView from "./internal_accounts/capabilities/AccountCapabilityView";
import EditAccountCapability from "./internal_accounts/capabilities/EditAccountCapability";
import ACHSettingView from "./ach_settings/ACHSettingView";
import ACHSettingsHome from "./ach_settings/ACHSettingsHome";
import AccountACHSettingView from "./internal_accounts/account_ach_settings/AccountACHSettingView";
import EditAccountACHSetting from "./internal_accounts/account_ach_settings/EditAccountACHSetting";
import CreateAccountACHSetting from "./internal_accounts/account_ach_settings/CreateAccountACHSetting";
import VendorSubscriptionView from "./vendor_subscriptions/VendorSubscriptionView";
import CreateVirtualAccountSetting from "./internal_accounts/virtual_account_settings/CreateVirtualAccountSetting";
import EditVirtualAccountSetting from "./internal_accounts/virtual_account_settings/EditVirtualAccountSetting";
import VirtualAccountSettingView from "./internal_accounts/virtual_account_settings/VirtualAccountSettingView";
import EditConnectionEndpoint from "~/app/containers/operations/connections/connection_endpoints/EditConnectionEndpoint";
import EndpointView from "~/app/containers/operations/endpoints/EndpointView";

const OPERATIONS_ROOT = "/operations";

const ACCOUNT_ACH_SETTING_PATH = `${OPERATIONS_ROOT}/account_ach_settings/:id`;
const ACCOUNT_ACH_SETTING_EDIT_PATH = `${OPERATIONS_ROOT}/account_ach_settings/:id/edit`;
const ACH_SETTINGS_PATH = `${OPERATIONS_ROOT}/ach_settings`;
const ACH_SETTING_PATH = `${OPERATIONS_ROOT}/ach_settings/:id`;
const CAPABILITY_PATH = `${OPERATIONS_ROOT}/capabilities/:id`;
const CAPABILITY_EDIT_PATH = `${OPERATIONS_ROOT}/capabilities/:id/edit`;
const CONNECTIONS_PATH = `${OPERATIONS_ROOT}/connections`;
const CONNECTION_CREATE_PATH = `${OPERATIONS_ROOT}/connections/new`;
const CONNECTION_IMPORT_PATH = `${OPERATIONS_ROOT}/connections/import`;
const CONNECTION_PATH = `${OPERATIONS_ROOT}/connections/:connectionId`;
const CONNECTION_EDIT_PATH = `${OPERATIONS_ROOT}/connections/:connectionId/edit`;
const CONNECTION_CREATE_CONNECTION_ENDPOINT_PATH = `${OPERATIONS_ROOT}/connections/:connectionId/connection_endpoints/new`;
const CONNECTION_CREATE_CONNECTION_ENDPOINT_V2_PATH = `${OPERATIONS_ROOT}/connections/:connectionId/connection_endpoints/new_v2`;
const CONNECTION_CREATE_ACCOUNT_PATH = `${OPERATIONS_ROOT}/connections/:connectionId/accounts/new`;
const CONNECTION_IMPORT_ACCOUNT_PATH = `${OPERATIONS_ROOT}/connections/:connectionId/accounts/import`;
const CONNECTION_CREATE_CUSTOM_PROCESSING_WINDOW_PATH = `${OPERATIONS_ROOT}/connections/:connectionId/custom_processing_windows/new`;
const CONNECTION_BULK_IMPORTS_PATH = `${OPERATIONS_ROOT}/connection_bulk_imports`;
const CONNECTION_BULK_IMPORT_PATH = `${OPERATIONS_ROOT}/connection_bulk_imports/:connectionBulkImportId`;
const CONNECTION_ENDPOINTS_PATH = `${OPERATIONS_ROOT}/connection_endpoints`;
const CONNECTION_ENDPOINT_PATH = `${OPERATIONS_ROOT}/connection_endpoints/:connectionEndpointId`;
const CONNECTION_ENDPOINT_EDIT_PATH = `${OPERATIONS_ROOT}/connection_endpoints/:connectionEndpointId/edit`;
const CUSTOM_PROCESSING_WINDOWS_PATH = `${OPERATIONS_ROOT}/custom_processing_windows`;
const CUSTOM_PROCESSING_WINDOW_PATH = `${OPERATIONS_ROOT}/custom_processing_windows/:customProcessingWindowId`;
const CUSTOM_PROCESSING_WINDOW_EDIT_PATH = `${OPERATIONS_ROOT}/custom_processing_windows/:customProcessingWindowId/edit`;
const ENDPOINT_PATH = `${OPERATIONS_ROOT}/endpoints/:id`;
const INTERNAL_ACCOUNTS_PATH = `${OPERATIONS_ROOT}/internal_accounts`;
const INTERNAL_ACCOUNT_PATH = `${OPERATIONS_ROOT}/internal_accounts/:internalAccountId`;
const INTERNAL_ACCOUNT_EDIT_PATH = `${OPERATIONS_ROOT}/internal_accounts/:internalAccountId/edit`;
const INTERNAL_ACCOUNT_CREATE_ACCOUNT_ACH_SETTING_PATH = `${OPERATIONS_ROOT}/internal_accounts/:internalAccountId/account_ach_settings/new`;
const INTERNAL_ACCOUNT_CREATE_CAPABILITY_PATH = `${OPERATIONS_ROOT}/internal_accounts/:internalAccountId/capabilities/new`;
const INTERNAL_ACCOUNT_CREATE_VIRTUAL_ACCOUNT_SETTING_PATH = `${OPERATIONS_ROOT}/internal_accounts/:internalAccountId/virtual_account_settings/new`;
const PENNY_TEST_PATH = `${OPERATIONS_ROOT}/penny_tests`;
const VENDOR_SUBSCRIPTION_PATH = `${OPERATIONS_ROOT}/vendor_subscriptions/:vendorSubscriptionId`;
const VIRTUAL_ACCOUNT_SETTING_PATH = `${OPERATIONS_ROOT}/virtual_account_settings/:id`;
const VIRTUAL_ACCOUNT_SETTING_EDIT_PATH = `${OPERATIONS_ROOT}/virtual_account_settings/:id/edit`;

function OperationsContainer() {
  return (
    <Switch>
      <Route exact path={OPERATIONS_ROOT} component={OperationsHome} />
      <Route exact path={CONNECTIONS_PATH} component={ConnectionsHome} />
      <Route exact path={CONNECTION_CREATE_PATH} component={CreateConnection} />
      <Route exact path={CONNECTION_IMPORT_PATH} component={ImportConnection} />
      <Route exact path={CONNECTION_EDIT_PATH} component={EditConnection} />
      <Route exact path={CONNECTION_PATH} component={ConnectionView} />
      <Route
        exact
        path={CONNECTION_CREATE_ACCOUNT_PATH}
        component={CreateInternalAccount}
      />
      <Route
        exact
        path={CONNECTION_IMPORT_ACCOUNT_PATH}
        component={ImportInternalAccount}
      />
      <Route
        exact
        path={CONNECTION_CREATE_CUSTOM_PROCESSING_WINDOW_PATH}
        component={CreateCustomProcessingWindow}
      />
      <Route
        exact
        path={CONNECTION_BULK_IMPORTS_PATH}
        component={ConnectionBulkImportsHome}
      />
      <Route
        exact
        path={CONNECTION_BULK_IMPORT_PATH}
        component={ConnectionBulkImportView}
      />
      <Route
        exact
        path={CONNECTION_ENDPOINTS_PATH}
        component={ConnectionEndpointsHome}
      />
      <Route
        exact
        path={CONNECTION_ENDPOINT_PATH}
        component={ConnectionEndpointView}
      />
      <Route
        exact
        path={CONNECTION_ENDPOINT_EDIT_PATH}
        component={EditConnectionEndpoint}
      />
      <Route exact path={ENDPOINT_PATH} component={EndpointView} />
      <Route
        exact
        path={INTERNAL_ACCOUNTS_PATH}
        component={InternalAccountsHome}
      />
      <Route
        exact
        path={INTERNAL_ACCOUNT_PATH}
        component={InternalAccountView}
      />
      <Route
        exact
        path={INTERNAL_ACCOUNT_EDIT_PATH}
        component={EditInternalAccount}
      />
      <Route
        exact
        path={INTERNAL_ACCOUNT_CREATE_CAPABILITY_PATH}
        component={CreateAccountCapability}
      />
      <Route
        exact
        path={INTERNAL_ACCOUNT_CREATE_ACCOUNT_ACH_SETTING_PATH}
        component={CreateAccountACHSetting}
      />
      <Route
        exact
        path={INTERNAL_ACCOUNT_CREATE_VIRTUAL_ACCOUNT_SETTING_PATH}
        component={CreateVirtualAccountSetting}
      />
      <Route exact path={ACH_SETTING_PATH} component={ACHSettingView} />
      <Route exact path={ACH_SETTINGS_PATH} component={ACHSettingsHome} />
      <Route
        exact
        path={ACCOUNT_ACH_SETTING_EDIT_PATH}
        component={EditAccountACHSetting}
      />
      <Route
        exact
        path={ACCOUNT_ACH_SETTING_PATH}
        component={AccountACHSettingView}
      />
      <Route
        exact
        path={VIRTUAL_ACCOUNT_SETTING_EDIT_PATH}
        component={EditVirtualAccountSetting}
      />
      <Route
        exact
        path={VIRTUAL_ACCOUNT_SETTING_PATH}
        component={VirtualAccountSettingView}
      />
      <Route exact path={CAPABILITY_PATH} component={AccountCapabilityView} />
      <Route
        exact
        path={CAPABILITY_EDIT_PATH}
        component={EditAccountCapability}
      />
      <Route
        exact
        path={CUSTOM_PROCESSING_WINDOWS_PATH}
        component={CustomProcessingWindowsHome}
      />
      <Route
        exact
        path={CUSTOM_PROCESSING_WINDOW_PATH}
        component={CustomProcessingWindowView}
      />
      <Route
        exact
        path={CUSTOM_PROCESSING_WINDOW_EDIT_PATH}
        component={EditCustomProcessingWindow}
      />
      <Route
        exact
        path={CONNECTION_CREATE_CONNECTION_ENDPOINT_PATH}
        component={CreateConnectionEndpoint}
      />
      <Route
        exact
        path={CONNECTION_CREATE_CONNECTION_ENDPOINT_V2_PATH}
        component={CreateConnectionEndpointV2}
      />
      <Route exact path={PENNY_TEST_PATH} component={PennyTestHome} />
      <Route
        exact
        path={VENDOR_SUBSCRIPTION_PATH}
        component={VendorSubscriptionView}
      />
    </Switch>
  );
}

export default OperationsContainer;
