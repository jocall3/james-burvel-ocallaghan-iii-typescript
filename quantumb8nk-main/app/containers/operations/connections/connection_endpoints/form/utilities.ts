// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import invariant from "ts-invariant";
import { ConnectionEndpointFormValues } from "./FormValues";
import {
  ConnectionEndpointTemplate,
  ConnectionEndpointTemplateField,
  EndpointLabelEnum,
  Endpoint_SigningStrategyEnum,
  Endpoint__AuthenticationStrategyEnum,
  Endpoint__DecryptionStrategyEnum,
  Endpoint__EncryptionStrategyEnum,
  Endpoint__InboundAuthenticationStrategyEnum,
  Endpoint__ProtocolEnum,
} from "~/generated/dashboard/graphqlSchema";
import { isChecked } from "~/app/utilities/CheckboxUtils";

const DEFAULT_OPTION_VALUE = "";
const AUTHENTICATION_OPTIONS_PREFIX = "authentication_options.";
const DECRYPTION_OPTIONS_PREFIX = "decryption_options.";

export function formatConnectonEndpointFormValuesForMutation(
  values: ConnectionEndpointFormValues,
) {
  const {
    protocol,
    label,
    host,
    connectionEndpointTemplateId,
    authenticationStrategy,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    authentication_options,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    decryption_options,
    ...remainingValues
  } = values;

  invariant(
    connectionEndpointTemplateId,
    "Connection Endpoint Template should always be defined",
  );
  invariant(label, "Label should always be defined");
  invariant(protocol, "Protocol should always be defined");
  invariant(host, "Host should always be defined");
  invariant(
    authenticationStrategy,
    "Authentication strategy should always be defined",
  );

  return {
    ...remainingValues,
    connectionEndpointTemplateId,
    label,
    host,
    protocol,
    authenticationStrategy,
    cleanAfterRead: isChecked(values.cleanAfterRead),
    allowInboundRequests: isChecked(values.allowInboundRequests),
    authenticationOptions: JSON.stringify(authentication_options),
    decryptionOptions: JSON.stringify(decryption_options),
  };
}

export function getAuthenticationOptionFields(
  connectionEndpointTemplate: ConnectionEndpointTemplate,
): ConnectionEndpointTemplateField[] {
  return connectionEndpointTemplate.fields.filter(({ name }) =>
    name.startsWith(AUTHENTICATION_OPTIONS_PREFIX),
  );
}

export function getDecryptionOptionFields(
  connectionEndpointTemplate: ConnectionEndpointTemplate,
): ConnectionEndpointTemplateField[] {
  return connectionEndpointTemplate.fields.filter(({ name }) =>
    name.startsWith(DECRYPTION_OPTIONS_PREFIX),
  );
}

export function getTemplateFieldsByName(
  connectionEndpointTemplate: ConnectionEndpointTemplate,
): Record<string, ConnectionEndpointTemplateField> {
  return connectionEndpointTemplate.fields.reduce(
    (mapping, field) => ({ ...mapping, [field.name]: field }),
    {},
  );
}

function authenticationOptionsInitialValues(
  connectionEndpointTemplate: ConnectionEndpointTemplate,
): Record<string, string> {
  return connectionEndpointTemplate.fields.reduce(
    (acc, { name, value }: ConnectionEndpointTemplateField) => {
      if (!name.startsWith(AUTHENTICATION_OPTIONS_PREFIX)) return acc;

      const authenticationOption = name.replace(
        AUTHENTICATION_OPTIONS_PREFIX,
        "",
      );

      const initialValue = (value as string) || DEFAULT_OPTION_VALUE;

      return {
        ...acc,
        [authenticationOption]: initialValue,
      };
    },
    {},
  );
}

function decryptionOptionsInitialValues(
  connectionEndpointTemplate: ConnectionEndpointTemplate,
): Record<string, string> {
  return connectionEndpointTemplate.fields.reduce(
    (acc, { name, value }: ConnectionEndpointTemplateField) => {
      if (!name.startsWith(DECRYPTION_OPTIONS_PREFIX)) return acc;

      const decryptionOption = name.replace(DECRYPTION_OPTIONS_PREFIX, "");
      const initialValue = (value as string) || DEFAULT_OPTION_VALUE;

      return {
        ...acc,
        [decryptionOption]: initialValue,
      };
    },
    {},
  );
}

export function templateInitialValues(
  connectionEndpointTemplate: ConnectionEndpointTemplate,
): ConnectionEndpointFormValues {
  const templateFieldsByName = getTemplateFieldsByName(
    connectionEndpointTemplate,
  );

  return {
    connectionEndpointTemplateId: connectionEndpointTemplate.id,
    label: (templateFieldsByName.label?.value as EndpointLabelEnum) || null,
    protocol: templateFieldsByName.protocol?.value as Endpoint__ProtocolEnum,
    host: (templateFieldsByName.host?.value as string) ?? "",
    port: (templateFieldsByName.port?.value as string) ?? "",
    authenticationStrategy: templateFieldsByName.authentication_strategy
      ?.value as Endpoint__AuthenticationStrategyEnum,
    username: (templateFieldsByName.username?.value as string) ?? "",
    password: (templateFieldsByName.password?.value as string) ?? "",
    cleanAfterRead: (templateFieldsByName.clean_after_read?.value
      ? [templateFieldsByName.clean_after_read.value]
      : []) as boolean[],
    authentication_options: authenticationOptionsInitialValues(
      connectionEndpointTemplate,
    ),
    decryption_options: decryptionOptionsInitialValues(
      connectionEndpointTemplate,
    ),
    allowInboundRequests: (templateFieldsByName.allow_inbound_requests?.value
      ? [templateFieldsByName.allow_inbound_requests.value]
      : []) as boolean[],
    encryptionStrategy:
      (templateFieldsByName.encryption_strategy
        ?.value as Endpoint__EncryptionStrategyEnum) || null,
    encryptionKey: (templateFieldsByName.encryption_key?.value as string) ?? "",
    signingStrategy:
      (templateFieldsByName.signing_strategy
        ?.value as Endpoint_SigningStrategyEnum) || null,
    decryptionStrategy:
      (templateFieldsByName.decryption_strategy
        ?.value as Endpoint__DecryptionStrategyEnum) || null,
    inboundAuthenticationStrategy:
      (templateFieldsByName.inbound_authentication_strategy
        ?.value as Endpoint__InboundAuthenticationStrategyEnum) || null,
  };
}
