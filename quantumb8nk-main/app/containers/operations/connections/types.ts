// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import {
  ConnectionExtraInputType,
  VendorSubscriptionInput,
} from "../../../../generated/dashboard/graphqlSchema";

export const toExtraGraphqlInputType = (entity: string, extra: object) =>
  ({ [entity]: extra }) as unknown as ConnectionExtraInputType;

export interface CreateFormValues {
  entity: string;
  vendorCustomerId: string;
  nickname: string;
  extra: object;
}

export interface EditFormValues {
  vendorCustomerId: string;
  nickname: string;
  extra: object;
  connectionEndpoints: ConnectionEndpointFormValues[];
  vendorSubscriptionIdsToDiscard: string[];
  vendorSubscriptionsToCreate: string[];
}

export interface ConnectionEndpointFormValues {
  id: string;
  label: string;
  vendorSubscriptions: VendorSubscriptionFormValues[];
}

export interface VendorSubscriptionFormValues {
  id?: string;
  configId: string;
  description: string;
  subscribed: boolean;
}

export interface ConnectionEndpoint {
  id: string;
  label: string;
  vendorSubscriptions: VendorSubscription[];
  vendorConfigs: VendorConfig[];
}

interface VendorSubscription {
  id: string;
  vendorConfig: VendorConfig;
}

interface VendorConfig {
  id: string;
  description?: string | null;
}

function getVendorSubscriptionFormValues(
  vendorConfigs: VendorConfig[],
  connectionEndpoint: ConnectionEndpoint,
): VendorSubscriptionFormValues[] {
  return vendorConfigs.map((config) => {
    const vendorSubscription = connectionEndpoint.vendorSubscriptions.find(
      (subscription) => subscription.vendorConfig.id === config.id,
    );

    return {
      id: vendorSubscription?.id || "",
      configId: config.id,
      description: config.description || "",
      subscribed: !!vendorSubscription,
    };
  });
}

export function getConnectionEndpointFormValues(
  connectionEndpoints: ConnectionEndpoint[],
): ConnectionEndpointFormValues[] {
  return connectionEndpoints.map((connectionEndpoint) => ({
    id: connectionEndpoint.id,
    label: connectionEndpoint.label,
    vendorSubscriptions: getVendorSubscriptionFormValues(
      connectionEndpoint.vendorConfigs,
      connectionEndpoint,
    ),
  }));
}

export function parseVendorSubscriptionsToCreate(
  vendorSubscriptionsToCreate: string[],
): VendorSubscriptionInput[] {
  return vendorSubscriptionsToCreate.map((vendorSubscriptionInput: string) => {
    const [connectionEndpointId, configId] = vendorSubscriptionInput.split(":");
    return {
      connectionEndpointId,
      configId,
    };
  });
}
