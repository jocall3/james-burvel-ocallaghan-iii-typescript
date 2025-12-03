/**
 * This module implements a robust, enterprise-grade serialization and deserialization framework for Card component configurations and data.
 * Business value: This framework is critical for enabling dynamic UI generation, persistence of complex user interfaces,
 * and reliable communication of UI state across microservices or between client and server. It establishes a durable,
 * programmable data rail for visual components, significantly reducing development overhead for UI persistence,
 * enabling real-time UI updates, and ensuring data integrity across application versions.
 * Its versioning and migration capabilities future-proof UI configurations, minimizing downtime and maintenance costs
 * during system upgrades. The integrated security features for sensitive data ensure compliance and protect confidential information.
 * This system provides the foundation for agentic UI automation, allowing AI agents to dynamically configure and present
 * financial data cards, thereby accelerating insights and operational efficiency.
 */

import React, { ReactNode } from 'react';
import {
  CardProps,
  CardHeaderAction,
  CardAction,
  CardTab,
  CardSection,
  CardBadge,
  CardOverlay,
  CardDraggableConfig,
  CardResizableConfig,
  CardPersistenceConfig,
  CardVirtualizationConfig,
  CardAccessControl,
  CardRealtimeConfig,
  CardKeyboardNavConfig,
  CardContextMenuItem,
  CardHeaderPrefixSuffix,
  CardVariant,
  CardSize,
  CardShape,
  CardElevation,
  CardContentLayout,
  CardAnimationType,
} from '../Card';

// ================================================================================================
// SERIALIZABLE TYPE DEFINITIONS - MIRRORING CARD PROPS
// ================================================================================================

/**
 * Represents a serialized ReactNode. In most cases, a ReactNode cannot be directly
 * serialized to JSON. This type allows for common strategies:
 * - `string`: For simple text content or a reference ID to a registered component/template.
 * - `{ componentId: string; props?: Record<string, any>; type?: 'component' | 'text' | 'element'; }`: For complex components that can be
 *   reconstructed from an ID and serializable props. `type` helps in specific deserialization strategies.
 * - `null`: If the ReactNode is optional or cannot be serialized.
 */
export type SerializableReactNode = string | { componentId: string; props?: Record<string, any>; type?: 'component' | 'text' | 'element'; } | null;

/**
 * Represents a serialized function. Functions cannot be directly serialized.
 * This type allows an ID referring to a known function in a registry, potentially with serializable arguments.
 */
export type SerializableFunction = { functionId: string; args?: Record<string, any>; } | null;

/**
 * A utility type to convert a `ReactNode` to `SerializableReactNode` and functions to `SerializableFunction`.
 * Non-serializable properties (like `React.ReactElement` which is part of `ReactNode` but often for icons)
 * need special handling. For this serializer, `React.ReactElement` will be represented by a string `componentId`.
 * This recursive type also handles deeply nested arrays and objects correctly for functions and ReactNodes.
 */
type ToSerializable<T> = {
  [K in keyof T]: T[K] extends ReactNode | React.ReactElement | undefined
    ? SerializableReactNode
    : T[K] extends Function | undefined
      ? SerializableFunction
      : T[K] extends (infer U)[]
        ? U extends ReactNode | React.ReactElement | Function
          ? Array<ToSerializable<U>> // Deeply apply to array elements if they are complex
          : T[K] // Keep arrays of simple types as is
        : T[K] extends object
          ? ToSerializable<T[K]> // Recursively apply to nested objects
          : T[K]; // Keep primitive types as is
};

/**
 * Defines the structure for a serializable action item in the card's header.
 * Functions are replaced with their serializable counterparts (e.g., string IDs or null).
 */
export interface SerializableCardHeaderAction extends ToSerializable<CardHeaderAction> {
  icon?: SerializableReactNode;
  onClick?: SerializableFunction;
  renderCustom?: SerializableFunction;
}

/**
 * Serializable version of CardAction.
 */
export interface SerializableCardAction extends SerializableCardHeaderAction, ToSerializable<CardAction> {
  renderCustom?: SerializableFunction;
}

/**
 * Serializable version of CardTab.
 */
export interface SerializableCardTab extends ToSerializable<CardTab> {
  icon?: SerializableReactNode;
  content: SerializableReactNode;
  badge?: SerializableReactNode;
}

/**
 * Serializable version of CardSection.
 */
export interface SerializableCardSection extends ToSerializable<CardSection> {
  content: SerializableReactNode;
  actions?: SerializableCardHeaderAction[];
}

/**
 * Serializable version of CardBadge.
 */
export interface SerializableCardBadge extends ToSerializable<CardBadge> {
  content: SerializableReactNode;
  onClick?: SerializableFunction;
}

/**
 * Serializable version of CardOverlay.
 */
export interface SerializableCardOverlay extends ToSerializable<CardOverlay> {
  content: SerializableReactNode;
  onDismiss?: SerializableFunction;
  closeButton?: SerializableReactNode;
}

/**
 * Serializable version of CardDraggableConfig.
 */
export interface SerializableCardDraggableConfig extends ToSerializable<CardDraggableConfig> {
  onDragStart?: SerializableFunction;
  onDragEnd?: SerializableFunction;
  onDrag?: SerializableFunction;
}

/**
 * Serializable version of CardResizableConfig.
 */
export interface SerializableCardResizableConfig extends ToSerializable<CardResizableConfig> {
  onResizeStart?: SerializableFunction;
  onResizeEnd?: SerializableFunction;
  onResize?: SerializableFunction;
}

/**
 * Serializable version of CardPersistenceConfig.
 * Note: onSave/onLoad usually refers to external storage logic, not internal component state.
 * These functions often manage the persistence mechanism itself, so they are typically not serialized.
 */
export interface SerializableCardPersistenceConfig extends ToSerializable<CardPersistenceConfig> {
  onSave?: SerializableFunction;
  onLoad?: SerializableFunction;
}

/**
 * Serializable version of CardVirtualizationConfig.
 */
export interface SerializableCardVirtualizationConfig extends ToSerializable<CardVirtualizationConfig> {
  renderItem: SerializableFunction; // This function is critical and needs special handling for reconstruction
}

/**
 * Serializable version of CardAccessControl.
 */
export interface SerializableCardAccessControl extends ToSerializable<CardAccessControl> {
  permissionChecker?: SerializableFunction;
  onAccessDenied?: SerializableReactNode;
}

/**
 * Serializable version of CardRealtimeConfig.
 */
export interface SerializableCardRealtimeConfig extends ToSerializable<CardRealtimeConfig> {
  onUpdate?: SerializableFunction;
  connector?: SerializableFunction;
}

/**
 * Serializable version of CardKeyboardNavConfig.
 */
export interface SerializableCardKeyboardNavConfig extends ToSerializable<CardKeyboardNavConfig> {
  onFocus?: SerializableFunction;
  onBlur?: SerializableFunction;
}

/**
 * Serializable version of CardContextMenuItem.
 */
export interface SerializableCardContextMenuItem extends SerializableCardAction, ToSerializable<CardContextMenuItem> {
  subItems?: SerializableCardContextMenuItem[];
  renderCustom?: SerializableFunction;
}

/**
 * Serializable version of CardHeaderPrefixSuffix.
 */
export interface SerializableCardHeaderPrefixSuffix extends ToSerializable<CardHeaderPrefixSuffix> {
  content: SerializableReactNode;
}

/**
 * The main serializable props interface for the Card component. This interface mirrors
 * `CardProps` but replaces all `ReactNode` instances and function types with their
 * serializable equivalents (string references, serializable objects, or null).
 * This structure is intended for storage or transmission.
 */
export interface SerializableCardProps extends ToSerializable<CardProps> {
  // Core Content
  children?: SerializableReactNode;

  // Structural Elements
  headerActions?: SerializableCardHeaderAction[];
  footerContent?: SerializableReactNode;
  cardActions?: SerializableCardAction[];
  contextMenuActions?: SerializableCardContextMenuItem[];

  // Advanced Header Content Slots
  headerPrefix?: SerializableReactNode | SerializableCardHeaderPrefixSuffix;
  headerSuffix?: SerializableReactNode | SerializableCardHeaderPrefixSuffix;
  customTitleComponent?: SerializableReactNode;
  customSubtitleComponent?: SerializableReactNode;
  customHeaderComponent?: SerializableReactNode;

  // Advanced Footer Content Slots
  customFooterComponent?: SerializableReactNode;

  // Main Content Structure
  tabs?: SerializableCardTab[];
  sections?: SerializableCardSection[];

  // Behavior and State
  onCollapseToggle?: SerializableFunction;
  onRetry?: SerializableFunction;
  customEmptyComponent?: SerializableReactNode;
  emptyStateAction?: SerializableCardAction;
  onLoadMore?: SerializableFunction;
  onSelect?: SerializableFunction;
  onTabChange?: SerializableFunction;

  // Interactivity
  draggable?: SerializableCardDraggableConfig;
  resizable?: SerializableCardResizableConfig;
  onFocus?: SerializableFunction;
  onBlur?: SerializableFunction;

  // Persistence
  persistence?: SerializableCardPersistenceConfig;

  // Accessibility & Keyboard Navigation
  keyboardNav?: SerializableCardKeyboardNavConfig;

  // Dynamic Badges/Overlays
  badges?: SerializableCardBadge[];
  overlay?: SerializableCardOverlay;

  // Custom Components
  loadingIndicator?: SerializableReactNode;
  customErrorIndicator?: SerializableReactNode;
  cardToolbar?: SerializableReactNode;
  dropZoneContent?: SerializableReactNode;

  // Performance Optimization
  virtualization?: SerializableCardVirtualizationConfig;

  // Data & Real-time
  realtime?: SerializableCardRealtimeConfig;
  accessControl?: SerializableCardAccessControl;

  // Event Logging/Analytics
  onCardViewed?: SerializableFunction;
  onCardInteraction?: SerializableFunction;

  // Versioning
  onRevertVersion?: SerializableFunction;

  // Internal metadata for schema versioning
  _schemaVersion?: string;
}

/**
 * Represents card data after it has been securely tokenized or encrypted.
 * This structure is suitable for transmission over insecure channels, protecting sensitive information.
 * Business value: Ensures data privacy and regulatory compliance (e.g., PCI DSS, GDPR) by preventing
 * plaintext exposure of sensitive card properties during storage or transit. This tokenization is a
 * foundational element of secure "token rails" for digital identity and payments.
 */
export interface TokenizedCardData {
  id: string; // Unique identifier for the card
  encryptedPayload: string; // Base64 encoded, encrypted string of the sensitive parts of SerializableCardProps
  metadata: Record<string, any>; // Non-sensitive, plaintext metadata (e.g., _schemaVersion, title, public-facing IDs)
  signature: string; // Digital signature of the payload + metadata for integrity and authenticity
}

// ================================================================================================
// SERIALIZATION CONTEXT & REGISTRIES
// ================================================================================================

/**
 * Interface defining the context required for deserialization.
 * This context provides mappings from serializable IDs to actual React components,
 * elements, or functions that cannot be directly serialized.
 */
export interface DeserializationContext {
  /**
   * A registry mapping string IDs to React components or elements.
   * This is used to reconstruct `ReactNode` properties.
   * Example: `{ 'MyCustomIcon': <MyCustomIcon />, 'DefaultLoadingIndicator': <LoadingSpinner /> }`
   */
  componentRegistry?: Record<string, ReactNode | React.ComponentType<any>>;

  /**
   * A registry mapping string IDs to function implementations.
   * This is used to reconstruct `onClick`, `onSave`, `renderItem`, etc.
   * Example: `{ 'handleCardClick': (e) => console.log('Card Clicked'), 'saveCardState': async (id, state) => { /* ... * / } }`
   */
  functionRegistry?: Record<string, Function>;

  /**
   * A fallback component or function to use if a registered ID is not found.
   */
  fallbackResolver?: {
    component?: ReactNode | React.ComponentType<any>;
    function?: Function;
  };
}

/**
 * Type for a function that can transform a serialized value during deserialization.
 * Useful for data migration or cleaning.
 */
export type DeserializationTransformer<T> = (serializedValue: any, context: DeserializationContext) => T;

/**
 * Represents a schema definition for a card property, including its type and
 * an optional transformer for deserialization. This enhances data integrity and migration.
 * Business value: Enables robust data validation, type checking, and automated data migration,
 * crucial for maintaining data quality and consistency across evolving application versions.
 */
export interface CardPropertySchema<T = any> {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'ReactNode' | 'function' | 'enum' | 'secret';
  enumOptions?: string[]; // For 'enum' types
  isArray?: boolean;
  nestedSchema?: CardSchema; // For 'object' or 'array' types
  transformer?: DeserializationTransformer<T>;
  defaultValue?: T;
  required?: boolean;
  regex?: string; // For 'string' types, enforce pattern
  min?: number; // For 'number' types, enforce minimum value
  max?: number; // For 'number' types, enforce maximum value
  secureField?: boolean; // For 'secret' types or sensitive strings/numbers, indicates encryption is needed
}

/**
 * A schema definition for an entire card or a sub-object within it.
 * This is used for validation and guided deserialization.
 */
export type CardSchema = {
  [K in keyof SerializableCardProps]?: CardPropertySchema<SerializableCardProps[K]>;
};

/**
 * Defines the current version of the card data schema.
 * Business value: Essential for managing complex data evolution, allowing seamless
 * upgrades and downgrades of card configurations without data loss or application errors.
 * This guarantees forward and backward compatibility.
 */
export interface CardDataSchemaVersion {
  version: string; // e.g., "1.0.0", "2023-10-27"
  schema: CardSchema;
  migrationLogic?: (oldData: any, oldVersion: string) => any; // Function to migrate data from older versions
}

// ================================================================================================
// CUSTOM ERROR TYPES
// ================================================================================================

/**
 * Error thrown when a non-serializable type is encountered without a handling strategy.
 * Business value: Ensures data integrity by preventing accidental serialization of non-transferable
 * data, enforcing clean data contracts for persistence and API layers.
 */
export class NonSerializableTypeError extends Error {
  constructor(message: string, public path: string, public value: any) {
    super(`Non-serializable type encountered at ${path}: ${message}`);
    this.name = 'NonSerializableTypeError';
  }
}

/**
 * Error thrown when deserialization fails due to missing context or malformed data.
 * Business value: Provides clear error messages for debugging data inconsistencies,
 * enabling rapid resolution of issues related to corrupted or outdated serialized data.
 */
export class DeserializationError extends Error {
  constructor(message: string, public path?: string, public serializedData?: any) {
    super(`Deserialization failed${path ? ` at ${path}` : ''}: ${message}`);
    this.name = 'DeserializationError';
  }
}

/**
 * Error thrown when a data validation fails against a defined schema.
 * Business value: Guarantees data quality and prevents invalid configurations from
 * corrupting the system or leading to unexpected UI behavior, crucial for regulatory compliance.
 */
export class SchemaValidationError extends Error {
  constructor(message: string, public errors: { path: string; message: string; }[] = []) {
    super(`Schema validation failed: ${message}`);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Error thrown when security operations (encryption/decryption) fail.
 * Business value: Critical for flagging potential data breaches or operational security
 * failures, ensuring that sensitive data is always protected or that issues are immediately visible.
 */
export class CardSecurityError extends Error {
  constructor(message: string, public fieldPath?: string) {
    super(`Card security operation failed${fieldPath ? ` for field ${fieldPath}` : ''}: ${message}`);
    this.name = 'CardSecurityError';
  }
}

// ================================================================================================
// CORE SERIALIZER UTILITIES
// ================================================================================================

/**
 * Utility class for serializing and deserializing complex CardProps objects.
 * It handles the conversion of ReactNodes and functions to serializable formats (IDs or null)
 * and reconstructs them during deserialization using a provided context.
 * Business value: This central component standardizes data exchange, eliminating manual
 * serialization logic and drastically reducing the risk of data corruption while improving developer velocity.
 * Its schema-driven approach ensures forward compatibility and robust data handling.
 */
export class CardDataSerializer {
  private schemaVersions: CardDataSchemaVersion[];
  protected currentSchema: CardSchema;
  protected currentVersion: string;

  /**
   * Constructs a `CardDataSerializer` instance.
   * @param schemaVersions An array of schema versions, including migration logic.
   * @param currentVersion The version of the schema to use for current serialization/deserialization.
   * @throws {Error} if schema versions are invalid or current version is not found.
   */
  constructor(schemaVersions: CardDataSchemaVersion[], currentVersion: string) {
    if (!schemaVersions || schemaVersions.length === 0) {
      throw new Error("CardDataSerializer requires at least one schema version.");
    }
    this.schemaVersions = schemaVersions.sort((a, b) => a.version.localeCompare(b.version));
    const resolvedSchema = this.schemaVersions.find(s => s.version === currentVersion);
    if (!resolvedSchema) {
      throw new Error(`Schema version "${currentVersion}" not found in provided schema versions.`);
    }
    this.currentSchema = resolvedSchema.schema;
    this.currentVersion = currentVersion;
  }

  /**
   * Recursively serializes a value, handling ReactNode and functions.
   * @param value The value to serialize.
   * @param path The current path in the object structure for error reporting.
   * @param schema The schema for the current property.
   * @returns A serializable representation of the value.
   * @throws {NonSerializableTypeError} if an unexpected non-serializable type is encountered.
   */
  protected serializeValue(value: any, path: string = '', schema?: CardPropertySchema): any {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (React.isValidElement(value)) {
      if (typeof value.type === 'string') { // Intrinsic HTML element
        return { componentId: value.type, props: this.serializeValue(value.props, `${path}.props`), type: 'element' };
      }
      if (typeof value.type === 'function' && (value.type as any).displayName) {
        return { componentId: (value.type as any).displayName, props: this.serializeValue(value.props, `${path}.props`), type: 'component' };
      }
      if (typeof value === 'string') { // Simple ReactNode could be just a string
        return value;
      }
      CardEventLogger.log('warn', `Complex ReactNode found at ${path} and cannot be automatically serialized. Returning null.`);
      return null;
    }

    if (Array.isArray(value)) {
      return value.map((item, index) => {
        const itemSchema = schema?.nestedSchema || undefined;
        return this.serializeValue(item, `${path}[${index}]`, itemSchema);
      });
    }

    if (typeof value === 'object') {
      const serializedObject: Record<string, any> = {};
      const currentObjectSchema = schema?.nestedSchema || this.currentSchema; // Use nested schema if available, otherwise current root
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const propSchema = currentObjectSchema[key as keyof CardSchema] || undefined;
          serializedObject[key] = this.serializeValue(value[key], `${path}.${key}`, propSchema);
        }
      }
      return serializedObject;
    }

    if (typeof value === 'function') {
      // Functions are replaced by null or, ideally, a reference ID to a registered function.
      // For serialization, we expect functions to be already wrapped or registered
      // and only their ID provided if they need to be persisted.
      // Here, we provide a placeholder of null for direct functions.
      CardEventLogger.log('warn', `Direct function found at ${path} and cannot be serialized. Returning null. Ensure functions are pre-registered.`);
      return null;
    }

    throw new NonSerializableTypeError(`Unhandled type: ${typeof value}`, path, value);
  }

  /**
   * Converts a `CardProps` object into a `SerializableCardProps` object,
   * suitable for JSON serialization.
   * @param props The `CardProps` object to serialize.
   * @returns A `SerializableCardProps` object.
   */
  public serialize(props: CardProps): SerializableCardProps {
    CardEventLogger.log('info', `Initiating serialization for CardProps (version: ${this.currentVersion}).`);
    const startTime = performance.now();
    const serialized = this.serializeValue(props, '', { type: 'object', nestedSchema: this.currentSchema });
    const endTime = performance.now();
    CardPerformanceMonitor.record('serialize', endTime - startTime);
    CardEventLogger.log('info', `Serialization complete in ${endTime - startTime}ms.`);
    return { ...serialized, _schemaVersion: this.currentVersion };
  }

  /**
   * Recursively deserializes a value using the provided context and schema.
   * @param serializedValue The serialized value to deserialize.
   * @param context The deserialization context.
   * @param schema The schema for the current property.
   * @param path The current path in the object structure for error reporting.
   * @returns The deserialized value.
   * @throws {DeserializationError} if deserialization fails.
   */
  protected deserializeValue(
    serializedValue: any,
    context: DeserializationContext,
    schema?: CardPropertySchema,
    path: string = ''
  ): any {
    if (serializedValue === null || serializedValue === undefined) {
      return schema?.defaultValue !== undefined ? schema.defaultValue : null;
    }

    // Apply transformer if available in schema FIRST
    if (schema?.transformer) {
      try {
        serializedValue = schema.transformer(serializedValue, context);
      } catch (e: any) {
        throw new DeserializationError(`Transformer failed for ${path}: ${e.message}`, path, serializedValue);
      }
    }

    if (schema?.type === 'ReactNode') {
      if (typeof serializedValue === 'string') {
        return context.componentRegistry?.[serializedValue] || serializedValue || context.fallbackResolver?.component || null;
      }
      if (typeof serializedValue === 'object' && serializedValue.componentId) {
        const Component = context.componentRegistry?.[serializedValue.componentId];
        if (Component) {
          if (typeof Component === 'function' && typeof Component !== 'object') { // It's a React component type (function or class)
            const deserializedProps = this.deserializeValue(serializedValue.props, context, { type: 'object', nestedSchema: schema.nestedSchema }, `${path}.props`);
            return React.createElement(Component as React.ComponentType<any>, deserializedProps);
          } else if (React.isValidElement(Component)) { // It's a pre-built React element
            return Component;
          } else { // Could be a primitive type registered as a component
            return Component;
          }
        }
        CardEventLogger.log('warn', `Component with ID '${serializedValue.componentId}' not found in registry for ${path}. Using fallback or null.`);
        return context.fallbackResolver?.component || null;
      }
      return null;
    }

    if (schema?.type === 'function') {
      if (typeof serializedValue === 'object' && serializedValue?.functionId) {
        const registeredFunction = context.functionRegistry?.[serializedValue.functionId];
        if (registeredFunction) {
          // If arguments are provided, create a wrapper function that applies them
          if (serializedValue.args) {
            return (...callArgs: any[]) => registeredFunction(...Object.values(serializedValue.args), ...callArgs);
          }
          return registeredFunction;
        }
        CardEventLogger.log('warn', `Function with ID '${serializedValue.functionId}' not found in registry for ${path}. Using fallback or null.`);
        return context.fallbackResolver?.function || null;
      }
      return null;
    }

    if (Array.isArray(serializedValue)) {
      if (!schema?.isArray && schema?.type !== 'array') {
        CardEventLogger.log('warn', `Array found at ${path} but schema doesn't expect an array. Attempting to deserialize elements.`);
      }
      return serializedValue.map((item, index) =>
        this.deserializeValue(item, context, schema?.nestedSchema, `${path}[${index}]`)
      );
    }

    if (typeof serializedValue === 'object' && serializedValue !== null) {
      const currentObjectSchema = schema?.nestedSchema || this.currentSchema; // Use nested schema if available
      const deserializedObject: Record<string, any> = {};
      for (const key in serializedValue) {
        if (Object.prototype.hasOwnProperty.call(serializedValue, key)) {
          const propSchema = currentObjectSchema[key as keyof CardSchema] || undefined;
          deserializedObject[key] = this.deserializeValue(
            serializedValue[key],
            context,
            propSchema,
            `${path}.${key}`
          );
        }
      }
      return deserializedObject;
    }

    return serializedValue;
  }

  /**
   * Converts a `SerializableCardProps` object back into a `CardProps` object.
   * This requires a `DeserializationContext` to reconstruct ReactNodes and functions.
   * It also handles schema version migration if needed.
   * @param serializedProps The `SerializableCardProps` object to deserialize.
   * @param context The `DeserializationContext` providing component and function mappings.
   * @returns A `CardProps` object.
   * @throws {DeserializationError} if the deserialization process encounters issues.
   */
  public deserialize(serializedProps: SerializableCardProps, context: DeserializationContext): CardProps {
    if (!serializedProps || typeof serializedProps !== 'object') {
      throw new DeserializationError('Invalid serialized data: not an object.', '', serializedProps);
    }

    CardEventLogger.log('info', `Initiating deserialization for CardProps.`);
    const startTime = performance.now();

    let dataToDeserialize = deepCloneSerializableCardData(serializedProps);
    const dataVersion = serializedProps._schemaVersion || 'unknown';

    if (dataVersion !== this.currentVersion) {
      CardEventLogger.log('info', `Migrating card data from version ${dataVersion} to ${this.currentVersion}.`);
      dataToDeserialize = CardDataVersionControl.migrateData(dataToDeserialize, dataVersion, this.currentVersion, this.schemaVersions);
    }

    const deserialized = this.deserializeValue(dataToDeserialize, context, { type: 'object', nestedSchema: this.currentSchema });

    const { _schemaVersion, ...result } = deserialized as SerializableCardProps & { _schemaVersion?: string };
    const endTime = performance.now();
    CardPerformanceMonitor.record('deserialize', endTime - startTime);
    CardEventLogger.log('info', `Deserialization complete in ${endTime - startTime}ms.`);
    return result as CardProps;
  }
}

// ================================================================================================
// SCHEMA VALIDATION UTILITIES
// ================================================================================================

/**
 * A utility class for validating data against a defined `CardSchema`.
 * This ensures the integrity and correctness of serialized or deserialized data.
 * Business value: Essential for data quality, preventing malformed configurations from entering
 * the system, and ensuring that UI components receive valid props, thereby enhancing system stability.
 */
export class CardSchemaValidator {
  private schema: CardSchema;

  /**
   * Constructs a `CardSchemaValidator` instance.
   * @param schema The schema to validate data against.
   */
  constructor(schema: CardSchema) {
    this.schema = schema;
  }

  /**
   * Validates an object against the stored schema.
   * @param data The object to validate.
   * @param targetSchema The schema to validate against (defaults to instance's schema).
   * @param path The current path in the object structure for error reporting.
   * @returns An array of validation errors, or empty if valid.
   */
  public validate(data: any, targetSchema: CardSchema = this.schema, path: string = ''): SchemaValidationError['errors'] {
    const errors: SchemaValidationError['errors'] = [];

    if (typeof data !== 'object' || data === null) {
      errors.push({ path, message: `Expected an object, got ${typeof data}.` });
      return errors;
    }

    for (const key in targetSchema) {
      if (Object.prototype.hasOwnProperty.call(targetSchema, key)) {
        const propSchema = targetSchema[key as keyof CardSchema]!;
        const value = data[key];
        const currentPath = path ? `${path}.${key}` : key;

        if (propSchema.required && (value === undefined || value === null)) {
          errors.push({ path: currentPath, message: `Property '${key}' is required.` });
          continue;
        }
        if (value === undefined || value === null) {
          continue;
        }

        switch (propSchema.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push({ path: currentPath, message: `Expected string, got ${typeof value}.` });
            } else if (propSchema.regex) {
              const regex = new RegExp(propSchema.regex);
              if (!regex.test(value)) {
                errors.push({ path: currentPath, message: `String '${value}' does not match regex pattern '${propSchema.regex}'.` });
              }
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push({ path: currentPath, message: `Expected number, got ${typeof value}.` });
            } else {
              if (propSchema.min !== undefined && value < propSchema.min) {
                errors.push({ path: currentPath, message: `Number ${value} is less than minimum allowed ${propSchema.min}.` });
              }
              if (propSchema.max !== undefined && value > propSchema.max) {
                errors.push({ path: currentPath, message: `Number ${value} is greater than maximum allowed ${propSchema.max}.` });
              }
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({ path: currentPath, message: `Expected boolean, got ${typeof value}.` });
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push({ path: currentPath, message: `Expected array, got ${typeof value}.` });
            } else if (propSchema.nestedSchema) {
              value.forEach((item, index) => {
                errors.push(...this.validate(item, propSchema.nestedSchema!, `${currentPath}[${index}]`));
              });
            }
            break;
          case 'object':
            if (typeof value !== 'object' || Array.isArray(value) || value === null) {
              errors.push({ path: currentPath, message: `Expected object, got ${typeof value}.` });
            } else if (propSchema.nestedSchema) {
              errors.push(...this.validate(value, propSchema.nestedSchema, currentPath));
            }
            break;
          case 'enum':
            if (!propSchema.enumOptions || !propSchema.enumOptions.includes(value as string)) {
              errors.push({ path: currentPath, message: `Value '${value}' is not a valid enum option.` });
            }
            break;
          case 'ReactNode':
            if (typeof value !== 'string' && (typeof value !== 'object' || value === null || !value.componentId)) {
                errors.push({ path: currentPath, message: `Expected string or { componentId: string } for ReactNode, got ${typeof value}.` });
            }
            break;
          case 'function':
            if (value !== null && (typeof value !== 'object' || !value.functionId)) {
                errors.push({ path: currentPath, message: `Expected { functionId: string } or null for function, got ${typeof value}.` });
            }
            break;
          case 'secret': // Sensitive fields are expected to be strings (encrypted tokens)
            if (typeof value !== 'string') {
              errors.push({ path: currentPath, message: `Expected string for secret field, got ${typeof value}.` });
            }
            break;
          default:
            CardEventLogger.log('warn', `No specific validation rule for type '${propSchema.type}' at ${currentPath}.`);
        }
      }
    }

    return errors;
  }

  /**
   * Throws a `SchemaValidationError` if the data is invalid.
   * @param data The data to validate.
   * @throws {SchemaValidationError} if validation fails.
   */
  public assertValid(data: any): void {
    const errors = this.validate(data);
    if (errors.length > 0) {
      throw new SchemaValidationError('Card data failed schema validation.', errors);
    }
  }
}

// ================================================================================================
// SECURITY UTILITIES (SIMULATED)
// ================================================================================================

/**
 * Manages encryption keys locally, simulating a secure keystore.
 * Business value: Critical for securing sensitive data. Simulates key management, which in a production
 * environment would involve HSMs or cloud key management services, ensuring cryptographic integrity.
 */
export class CardKeyManager {
  private static instance: CardKeyManager;
  private encryptionKey: CryptoKey | null = null;
  private keyStore: Record<string, string> = {}; // In a real system, this would be encrypted storage

  private constructor() {
    this.loadKey();
  }

  /**
   * Provides a singleton instance of the `CardKeyManager`.
   * @returns The singleton `CardKeyManager` instance.
   */
  public static getInstance(): CardKeyManager {
    if (!CardKeyManager.instance) {
      CardKeyManager.instance = new CardKeyManager();
    }
    return CardKeyManager.instance;
  }

  /**
   * Loads the encryption key from simulated storage or generates a new one.
   */
  private async loadKey(): Promise<void> {
    const storedKey = this.keyStore['card_encryption_key']; // Simulate fetching from a secure local store
    if (storedKey) {
      this.encryptionKey = await crypto.subtle.importKey(
        'jwk',
        JSON.parse(atob(storedKey)),
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      CardEventLogger.log('info', 'Encryption key loaded.');
    } else {
      CardEventLogger.log('info', 'Generating new encryption key.');
      await this.generateKey();
      if (this.encryptionKey) {
        const exportedKey = await crypto.subtle.exportKey('jwk', this.encryptionKey);
        this.keyStore['card_encryption_key'] = btoa(JSON.stringify(exportedKey)); // Simulate saving to secure store
        CardEventLogger.log('info', 'New encryption key generated and stored.');
      }
    }
  }

  /**
   * Generates a new AES-GCM 256-bit encryption key.
   */
  public async generateKey(): Promise<void> {
    this.encryptionKey = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Returns the current encryption key.
   * @returns The `CryptoKey` for encryption/decryption.
   * @throws {CardSecurityError} if the key is not available.
   */
  public async getKey(): Promise<CryptoKey> {
    if (!this.encryptionKey) {
      await this.loadKey(); // Attempt to load if not already
      if (!this.encryptionKey) {
        throw new CardSecurityError('Encryption key is not available.');
      }
    }
    return this.encryptionKey;
  }

  /**
   * For testing/simulation, allows setting a specific key.
   * @param key The `CryptoKey` to set.
   */
  public setKeyForTest(key: CryptoKey): void {
    this.encryptionKey = key;
  }
}

/**
 * Handles encryption and decryption of sensitive fields within `SerializableCardProps` based on schema definitions.
 * Business value: Centralizes cryptographic operations, ensuring consistent application of security policies
 * across all card data. This is foundational for building "token rails" where sensitive data is protected.
 */
export class CardSecurityProcessor {
  private keyManager: CardKeyManager;

  /**
   * Constructs a `CardSecurityProcessor`.
   */
  constructor() {
    this.keyManager = CardKeyManager.getInstance();
  }

  /**
   * Encrypts sensitive fields within a `SerializableCardProps` object.
   * @param data The serializable card data to encrypt.
   * @param schema The schema defining which fields are `secureField`.
   * @returns A Promise resolving to the data with sensitive fields encrypted.
   * @throws {CardSecurityError} if encryption fails.
   */
  public async encryptSensitiveFields(data: SerializableCardProps, schema: CardSchema): Promise<SerializableCardProps> {
    const clonedData = deepCloneSerializableCardData(data);
    const key = await this.keyManager.getKey();

    const encryptValue = async (value: any, propSchema: CardPropertySchema, path: string): Promise<string> => {
      if (!value || (typeof value !== 'string' && typeof value !== 'number')) {
        CardEventLogger.log('warn', `Attempted to encrypt non-string/non-number value at ${path}. Skipping.`);
        return value; // Cannot encrypt complex types directly here, or if null/undefined
      }

      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
      const encoded = new TextEncoder().encode(String(value));

      try {
        const cipherText = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          encoded
        );

        // Concatenate IV and cipherText for storage
        const fullCipher = new Uint8Array(iv.length + cipherText.byteLength);
        fullCipher.set(iv);
        fullCipher.set(new Uint8Array(cipherText), iv.length);

        return btoa(String.fromCharCode(...fullCipher)); // Base64 encode for string storage
      } catch (e: any) {
        throw new CardSecurityError(`Failed to encrypt field at ${path}: ${e.message}`, path);
      }
    };

    await this.traverseAndProcess(clonedData, schema, encryptValue);
    return clonedData;
  }

  /**
   * Decrypts sensitive fields within a `SerializableCardProps` object.
   * @param data The serializable card data with encrypted fields.
   * @param schema The schema defining which fields are `secureField`.
   * @returns A Promise resolving to the data with sensitive fields decrypted.
   * @throws {CardSecurityError} if decryption fails.
   */
  public async decryptSensitiveFields(data: SerializableCardProps, schema: CardSchema): Promise<SerializableCardProps> {
    const clonedData = deepCloneSerializableCardData(data);
    const key = await this.keyManager.getKey();

    const decryptValue = async (encryptedValue: string, propSchema: CardPropertySchema, path: string): Promise<string | number> => {
      if (typeof encryptedValue !== 'string' || !encryptedValue) {
        CardEventLogger.log('warn', `Attempted to decrypt non-string or empty value at ${path}. Skipping.`);
        return encryptedValue;
      }

      try {
        const decoded = atob(encryptedValue);
        const fullCipher = new Uint8Array(decoded.split('').map(char => char.charCodeAt(0)));

        const iv = fullCipher.slice(0, 12);
        const cipherText = fullCipher.slice(12);

        const plainText = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          cipherText
        );
        const decryptedString = new TextDecoder().decode(plainText);

        // Attempt to convert back to original type if schema specifies number
        if (propSchema.type === 'number') {
          const num = parseFloat(decryptedString);
          if (!isNaN(num)) return num;
        }
        return decryptedString;
      } catch (e: any) {
        throw new CardSecurityError(`Failed to decrypt field at ${path}: ${e.message}. Data might be tampered or key is wrong.`, path);
      }
    };

    await this.traverseAndProcess(clonedData, schema, decryptValue);
    return clonedData;
  }

  /**
   * Helper to traverse the object and apply encryption/decryption.
   * @param obj The object to traverse.
   * @param currentSchema The schema for the current object/level.
   * @param processor The async function to apply to secure fields.
   * @param path The current path for logging/error reporting.
   */
  private async traverseAndProcess(obj: any, currentSchema: CardSchema, processor: (value: any, propSchema: CardPropertySchema, path: string) => Promise<any>, path: string = ''): Promise<void> {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const propSchema = currentSchema[key as keyof CardSchema];
        const currentPath = path ? `${path}.${key}` : key;

        if (propSchema?.secureField) {
          obj[key] = await processor(obj[key], propSchema, currentPath);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          const nestedSchema = propSchema?.nestedSchema || {};
          await this.traverseAndProcess(obj[key], nestedSchema, processor, currentPath);
        }
      }
    }
  }
}

// ================================================================================================
// CARD DATA REGISTRY & FACTORIES
// ================================================================================================

/**
 * Manages a registry of components and functions that can be referenced by ID.
 * This is crucial for deserializing ReactNodes and functions.
 * Business value: Enables dynamic UI composition by abstracting away direct component imports.
 * It's a key enabler for agentic AI to construct UIs from available building blocks, improving reusability
 * and maintainability of UI code.
 */
export class CardComponentRegistry {
  private components: Record<string, ReactNode | React.ComponentType<any>> = {};
  private functions: Record<string, Function> = {};

  /**
   * Registers a component or React element with a unique ID.
   * @param id The unique ID for the component.
   * @param component The React component or element.
   */
  public registerComponent(id: string, component: ReactNode | React.ComponentType<any>): void {
    if (this.components[id]) {
      CardEventLogger.log('warn', `Component with ID '${id}' is being overwritten in the registry.`);
    }
    this.components[id] = component;
  }

  /**
   * Registers a function with a unique ID.
   * @param id The unique ID for the function.
   * @param func The function to register.
   */
  public registerFunction(id: string, func: Function): void {
    if (this.functions[id]) {
      CardEventLogger.log('warn', `Function with ID '${id}' is being overwritten in the registry.`);
    }
    this.functions[id] = func;
  }

  /**
   * Retrieves a registered component by its ID.
   * @param id The ID of the component.
   * @returns The registered component or `undefined` if not found.
   */
  public getComponent(id: string): ReactNode | React.ComponentType<any> | undefined {
    return this.components[id];
  }

  /**
   * Retrieves a registered function by its ID.
   * @param id The ID of the function.
   * @returns The registered function or `undefined` if not found.
   */
  public getFunction(id: string): Function | undefined {
    return this.functions[id];
  }

  /**
   * Creates a deserialization context from the current registry.
   * @returns A `DeserializationContext` object.
   */
  public toDeserializationContext(): DeserializationContext {
    return {
      componentRegistry: { ...this.components },
      functionRegistry: { ...this.functions },
    };
  }
}

/**
 * A factory for common ReactNode components.
 * Business value: Centralizes the creation of standard UI elements, ensuring consistency and
 * reducing boilerplate. This allows for rapid prototyping and standardized UI patterns.
 */
export const CardReactNodeFactory = {
  /**
   * Creates a simple SVG icon component.
   * @param svgPath The SVG path data.
   * @param className Optional CSS class name.
   * @returns A ReactElement for the SVG icon.
   */
  createSvgIcon(svgPath: string, className?: string): React.ReactElement {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={svgPath} />
      </svg>
    );
  },

  /**
   * Creates a basic loading spinner.
   * @param className Optional CSS class name.
   * @returns A ReactElement for a loading spinner.
   */
  createLoadingSpinner(className?: string): React.ReactElement {
    return (
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-white ${className || ''}`}></div>
    );
  },

  /**
   * Creates a simple text node.
   * @param text The text content.
   * @param className Optional CSS class name.
   * @returns A ReactElement for a span containing text.
   */
  createText(text: string, className?: string): React.ReactElement {
    return <span className={className}>{text}</span>;
  },

  /**
   * Creates a custom render component for a complex card action.
   * @param action The CardAction object.
   * @param iconClass Optional class for the icon.
   * @returns A ReactNode representing the custom action.
   */
  createCustomActionRender(action: CardAction, iconClass?: string): ReactNode {
    return (
      <div className="flex items-center space-x-2">
        {action.icon && React.isValidElement(action.icon) && React.cloneElement(action.icon, { className: iconClass || 'h-4 w-4' })}
        <span>{action.label}</span>
      </div>
    );
  },

  /**
   * Creates a simple status indicator for financial transactions.
   * @param status The transaction status (e.g., 'pending', 'approved', 'rejected').
   * @param className Optional CSS class name.
   * @returns A ReactElement representing the status.
   */
  createTransactionStatusIndicator(status: 'pending' | 'approved' | 'rejected' | 'failed', className?: string): React.ReactElement {
    let bgColor = '';
    let textColor = '';
    let iconPath = '';
    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        iconPath = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"; // Exclamation triangle
        break;
      case 'approved':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        iconPath = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"; // Checkmark circle
        break;
      case 'rejected':
      case 'failed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        iconPath = "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"; // X circle
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        iconPath = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"; // Info circle
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className || ''}`}>
        {CardReactNodeFactory.createSvgIcon(iconPath, 'h-3.5 w-3.5 mr-1')}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  },
};


/**
 * An instance of the global component registry.
 * Business value: Provides a single, canonical source for resolving UI components and functions,
 * ensuring consistency across the application and facilitating runtime extensibility.
 */
export const globalCardComponentRegistry = new CardComponentRegistry();

// Populate the registry with common components and functions
globalCardComponentRegistry.registerComponent('InfoIcon', CardReactNodeFactory.createSvgIcon("M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"));
globalCardComponentRegistry.registerComponent('ErrorIcon', CardReactNodeFactory.createSvgIcon("M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"));
globalCardComponentRegistry.registerComponent('EmptyIcon', CardReactNodeFactory.createSvgIcon("M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"));
globalCardComponentRegistry.registerComponent('LoadingSpinner', CardReactNodeFactory.createLoadingSpinner('text-cyan-500'));
globalCardComponentRegistry.registerComponent('TextSpan', CardReactNodeFactory.createText('')); // Placeholder for dynamic text
globalCardComponentRegistry.registerComponent('TransactionStatusApproved', CardReactNodeFactory.createTransactionStatusIndicator('approved'));
globalCardComponentRegistry.registerComponent('TransactionStatusPending', CardReactNodeFactory.createTransactionStatusIndicator('pending'));
globalCardComponentRegistry.registerComponent('TransactionStatusRejected', CardReactNodeFactory.createTransactionStatusIndicator('rejected'));

globalCardComponentRegistry.registerFunction('logClick', (id: string, event?: React.MouseEvent) => {
  CardEventLogger.log('event', `Button clicked: ${id}`);
});
globalCardComponentRegistry.registerFunction('handleRetry', (cardId: string) => {
  CardEventLogger.log('action', `Retrying operation for card: ${cardId}`);
});
globalCardComponentRegistry.registerFunction('onCardSelected', (cardId: string, isSelected: boolean) => {
  CardEventLogger.log('event', `Card ${cardId} selected state: ${isSelected}`);
});
globalCardComponentRegistry.registerFunction('defaultTabChangeHandler', (cardId: string, tabId: string) => {
  CardEventLogger.log('event', `Card ${cardId} tab changed to: ${tabId}`);
});
globalCardComponentRegistry.registerFunction('defaultRealtimeUpdate', (cardId: string, data: any) => {
  CardEventLogger.log('data', `Realtime update for card ${cardId}:`, data);
});
globalCardComponentRegistry.registerFunction('performPaymentAction', (amount: number, currency: string, targetAccount: string) => {
  CardEventLogger.log('action', `Initiating payment of ${amount} ${currency} to ${targetAccount}.`);
  // Simulate actual payment processing or agent interaction here
  return `Payment for ${amount} ${currency} initiated.`;
});


// ================================================================================================
// EXAMPLE SCHEMA DEFINITION & REGISTRY POPULATION
// ================================================================================================

/**
 * Defines the current and past schema versions for card data.
 * This array would be managed as part of your application's data migration strategy.
 */
export const cardSchemaVersions: CardDataSchemaVersion[] = [
  {
    version: "1.0.0",
    schema: {
      title: { type: 'string', required: true, regex: '^[a-zA-Z0-9 ]{3,100}$' },
      variant: { type: 'enum', enumOptions: ['default', 'outline', 'ghost', 'interactive', 'solid'], defaultValue: 'default' },
      isCollapsible: { type: 'boolean', defaultValue: false },
      headerActions: { type: 'array', isArray: true, nestedSchema: {
        id: { type: 'string', required: true },
        label: { type: 'string', required: true },
        icon: { type: 'ReactNode' },
        onClick: { type: 'function' },
      } as CardSchema },
      children: { type: 'ReactNode' },
      cardOwnerId: { type: 'string', required: true, secureField: false }, // Not secure initially
    },
    migrationLogic: (oldData: any) => {
      CardEventLogger.log('info', `Applying migration for 1.0.0: No migration needed, base version.`);
      return oldData;
    },
  },
  {
    version: "1.1.0",
    schema: {
      ...cardSchemaVersions[0].schema,
      footerContent: { type: 'ReactNode' },
      tabs: { type: 'array', isArray: true, nestedSchema: {
        id: { type: 'string', required: true },
        label: { type: 'string', required: true },
        content: { type: 'ReactNode', required: true },
        icon: { type: 'ReactNode' },
      } as CardSchema },
      realtime: { type: 'object', nestedSchema: {
        enabled: { type: 'boolean' },
        channelId: { type: 'string' },
        onUpdate: { type: 'function' },
      } as CardSchema },
      cardOwnerId: { type: 'string', required: true, secureField: true }, // Mark as secure in 1.1.0
    },
    migrationLogic: (oldData: any, oldVersion: string) => {
      CardEventLogger.log('info', `Applying migration from ${oldVersion} to 1.1.0.`);
      if (oldVersion === "1.0.0") {
        if (oldData.content && !oldData.tabs) {
          oldData.tabs = [{
            id: 'default-tab',
            label: 'Content',
            content: oldData.content,
          }];
          delete oldData.content;
          CardEventLogger.log('info', 'Migrated old `content` field to `tabs` array.');
        }
      }
      return oldData;
    },
  },
  {
    version: "1.2.0",
    schema: {
      ...cardSchemaVersions[1].schema,
      transactionLimit: { type: 'number', min: 0, max: 1000000, defaultValue: 10000 },
      transactionCurrency: { type: 'string', enumOptions: ['USD', 'EUR', 'GBP'], defaultValue: 'USD' },
      accessControl: { type: 'object', nestedSchema: {
        permissionChecker: { type: 'function' },
        onAccessDenied: { type: 'ReactNode' },
        minimumRole: { type: 'string', enumOptions: ['viewer', 'editor', 'admin'], defaultValue: 'viewer' },
      } as CardSchema },
    },
    migrationLogic: (oldData: any, oldVersion: string) => {
      CardEventLogger.log('info', `Applying migration from ${oldVersion} to 1.2.0.`);
      if (oldVersion === "1.1.0") {
        if (!oldData.transactionLimit) {
          oldData.transactionLimit = 50000; // Default limit for older cards
          CardEventLogger.log('info', 'Set default transactionLimit for migrated card.');
        }
        if (!oldData.transactionCurrency) {
          oldData.transactionCurrency = 'USD';
          CardEventLogger.log('info', 'Set default transactionCurrency for migrated card.');
        }
      }
      return oldData;
    },
  },
];

/**
 * The primary serializer instance for CardProps.
 * Configured with the latest schema version for robust serialization and deserialization
 * with built-in schema migration capabilities.
 */
export const cardDataSerializer = new CardDataSerializer(
  cardSchemaVersions,
  cardSchemaVersions[cardSchemaVersions.length - 1].version
);

/**
 * Returns a `DeserializationContext` populated from the global component registry.
 * This function provides a convenient way to get the context required for deserialization.
 * @returns A `DeserializationContext` instance.
 */
export function getGlobalDeserializationContext(): DeserializationContext {
  return globalCardComponentRegistry.toDeserializationContext();
}

/**
 * Convenience function to serialize `CardProps` to a JSON string.
 * @param props The `CardProps` object to serialize.
 * @returns A JSON string representation of the card data.
 * @throws {NonSerializableTypeError} if serialization fails.
 */
export function stringifyCardProps(props: CardProps): string {
  const serializableProps = cardDataSerializer.serialize(props);
  return JSON.stringify(serializableProps);
}

/**
 * Convenience function to deserialize a JSON string back to `CardProps`.
 * @param jsonString The JSON string to deserialize.
 * @param context The `DeserializationContext` (defaults to global context).
 * @returns A `CardProps` object.
 * @throws {DeserializationError} if deserialization fails.
 * @throws {SchemaValidationError} if the deserialized data does not conform to the schema.
 */
export function parseCardProps(jsonString: string, context?: DeserializationContext): CardProps {
  const serializedProps = JSON.parse(jsonString);
  const resolvedContext = context || getGlobalDeserializationContext();
  const deserialized = cardDataSerializer.deserialize(serializedProps, resolvedContext);

  const validator = new CardSchemaValidator(cardDataSerializer['currentSchema']);
  validator.assertValid(deserialized);

  return deserialized;
}

// ================================================================================================
// ADVANCED DATA MANIPULATION & HELPER FUNCTIONS
// ================================================================================================

/**
 * Deeply clones a serializable card data object, ensuring immutability.
 * Useful before applying transformations or migrations.
 * @param data The serializable card data to clone.
 * @returns A deep clone of the data.
 */
export function deepCloneSerializableCardData<T extends SerializableCardProps>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Generates a unique ID suitable for card elements or actions.
 * @returns A unique string ID.
 */
export function generateUniqueCardId(): string {
  return `card-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extracts all unique component IDs referenced in a serializable card data structure.
 * Useful for pre-loading components into the registry before deserialization.
 * @param serializableProps The serialized card properties.
 * @returns A Set of unique component IDs.
 */
export function extractComponentIds(serializableProps: SerializableCardProps): Set<string> {
  const ids = new Set<string>();

  const traverse = (obj: any) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    if (obj.componentId && typeof obj.componentId === 'string') {
      ids.add(obj.componentId);
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        traverse(obj[key]);
      }
    }
  };

  traverse(serializableProps);
  return ids;
}

/**
 * Extracts all unique function IDs referenced in a serializable card data structure.
 * Useful for pre-loading function implementations into the registry.
 * @param serializableProps The serialized card properties.
 * @returns A Set of unique function IDs.
 */
export function extractFunctionIds(serializableProps: SerializableCardProps): Set<string> {
  const ids = new Set<string>();

  const traverse = (obj: any) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (obj.functionId && typeof obj.functionId === 'string') {
      ids.add(obj.functionId);
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => traverse(item));
    } else if (typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          traverse(obj[key]);
        }
      }
    }
  };

  traverse(serializableProps);
  return ids;
}

/**
 * Provides a generic transformation function that can be used within a schema.
 * This example transformer ensures a numeric value is always within a min/max range.
 * @param min The minimum allowed value.
 * @param max The maximum allowed value.
 * @returns A `DeserializationTransformer` function.
 */
export function createNumericRangeTransformer(min: number, max: number): DeserializationTransformer<number> {
  return (value: any) => {
    let num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      CardEventLogger.log('warn', `Attempted to transform non-numeric value to number in range [${min}, ${max}], defaulting to min.`);
      return min;
    }
    return Math.max(min, Math.min(max, num));
  };
}

/**
 * Provides a generic transformation function for boolean values, handling various string inputs.
 * @returns A `DeserializationTransformer` function.
 */
export function createBooleanTransformer(): DeserializationTransformer<boolean> {
  return (value: any) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  };
}

/**
 * Filters out card actions based on a dynamic predicate function.
 * This is a post-deserialization utility to manage action visibility.
 * Business value: Enables dynamic UI behavior and role-based access control for actions,
 * enhancing user experience and security without modifying core component logic.
 */
export function filterCardActions(actions: CardAction[] | undefined, predicate: (action: CardAction) => boolean): CardAction[] {
  if (!actions) return [];
  return actions.filter(predicate);
}

/**
 * Sorts card actions based on a given key and order.
 * @param actions An array of `CardAction` objects.
 * @param key The key to sort by (e.g., 'label', 'id').
 * @param order 'asc' for ascending, 'desc' for descending.
 * @returns A sorted array of `CardAction` objects.
 */
export function sortCardActions(actions: CardAction[] | undefined, key: keyof CardAction, order: 'asc' | 'desc' = 'asc'): CardAction[] {
  if (!actions || actions.length <= 1) return actions || [];

  return [...actions].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return order === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });
}

/**
 * Merges multiple `CardProps` objects into a single one, with later props overriding earlier ones.
 * This can be useful for dynamic configuration.
 * Business value: Facilitates modular and dynamic UI configuration, allowing applications to combine
 * base templates with user-specific or context-specific overrides efficiently.
 */
export function mergeCardProps(...propSets: Partial<CardProps>[]): CardProps {
  const merged: Partial<CardProps> = {};
  for (const props of propSets) {
    Object.assign(merged, props);
    if (props.headerActions) {
      merged.headerActions = [...(merged.headerActions || []), ...props.headerActions];
    }
    if (props.badges) {
      merged.badges = [...(merged.badges || []), ...props.badges];
    }
    if (props.tabs) {
      merged.tabs = [...(merged.tabs || []), ...props.tabs];
    }
  }
  return merged as CardProps;
}

/**
 * Monitors for changes in card data and provides a diff,
 * suitable for auditing or collaborative editing.
 * Business value: Critical for audit trails, version control, and collaborative editing features.
 * It provides granular visibility into changes, supporting governance and compliance requirements.
 */
export function diffCardData(oldData: SerializableCardProps, newData: SerializableCardProps): any[] {
  const diffs: any[] = [];

  const compareObjects = (obj1: any, obj2: any, path: string) => {
    const keys1 = new Set(Object.keys(obj1));
    const keys2 = new Set(Object.keys(obj2));

    for (const key of keys2) {
      const currentPath = path ? `${path}/${key}` : key;
      if (!keys1.has(key)) {
        diffs.push({ op: 'add', path: currentPath, value: obj2[key] });
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        if (typeof obj1[key] === 'object' && obj1[key] !== null &&
            typeof obj2[key] === 'object' && obj2[key] !== null &&
            !Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
          compareObjects(obj1[key], obj2[key], currentPath);
        } else {
          diffs.push({ op: 'replace', path: currentPath, value: obj2[key] });
        }
      }
    }

    for (const key of keys1) {
      if (!keys2.has(key)) {
        const currentPath = path ? `${path}/${key}` : key;
        diffs.push({ op: 'remove', path: currentPath });
      }
    }
  };

  compareObjects(oldData, newData, '');
  return diffs;
}

/**
 * Applies a diff (e.g., from `diffCardData`) to a base `SerializableCardProps` object.
 * Business value: Enables efficient state synchronization and version restoration,
 * reducing data transfer overhead and supporting flexible undo/redo functionalities.
 */
export function applyCardDataPatch(baseData: SerializableCardProps, patches: any[]): SerializableCardProps {
  const clonedData = deepCloneSerializableCardData(baseData);

  for (const patch of patches) {
    const pathParts = patch.path.split('/').filter(Boolean);
    let current: any = clonedData;
    let parent: any = null;
    let key: string | number = '';

    for (let i = 0; i < pathParts.length; i++) {
      key = pathParts[i];
      if (Array.isArray(current) && !isNaN(Number(key))) { // Handle array indices
        key = Number(key);
      }
      if (i < pathParts.length - 1) {
        parent = current;
        current = current[key];
        if (typeof current !== 'object' || current === null) {
          CardEventLogger.log('warn', `Patch path traversal failed at ${key}. Skipping patch.`, patch);
          current = null;
          break;
        }
      }
    }

    if (current === null) continue;

    switch (patch.op) {
      case 'add':
      case 'replace':
        if (parent) {
          if (Array.isArray(parent) && typeof key === 'number') {
            parent[key] = patch.value;
          } else if (typeof key === 'string') {
            parent[key] = patch.value;
          }
        } else {
          (clonedData as any)[key] = patch.value;
        }
        break;
      case 'remove':
        if (parent) {
          if (Array.isArray(parent) && typeof key === 'number') {
            parent.splice(key, 1);
          } else if (typeof key === 'string') {
            delete parent[key];
          }
        } else {
          delete (clonedData as any)[key];
        }
        break;
      default:
        CardEventLogger.log('warn', `Unknown patch operation: ${patch.op}. Skipping.`, patch);
    }
  }
  return clonedData;
}

/**
 * Generates a simplified summary of `SerializableCardProps`,
 * useful for quick previews or dashboard listings without full deserialization.
 * @param serializableProps The serialized card properties.
 * @returns A summary object with key properties.
 */
export function summarizeSerializableCardProps(serializableProps: SerializableCardProps): { id?: string; title?: string; variant?: CardVariant; lastUpdated?: string; hasActions: boolean; hasTabs: boolean; } {
  const cardId = (serializableProps.persistence as any)?.id || serializableProps.title?.replace(/\s/g, '_').toLowerCase();
  return {
    id: cardId || generateUniqueCardId(),
    title: typeof serializableProps.title === 'string' ? serializableProps.title : undefined,
    variant: serializableProps.variant,
    lastUpdated: new Date().toISOString(),
    hasActions: (serializableProps.headerActions?.length || 0) > 0 || (serializableProps.cardActions?.length || 0) > 0,
    hasTabs: (serializableProps.tabs?.length || 0) > 0,
  };
}

/**
 * Creates a minimal `SerializableCardProps` object from essential details,
 * useful for generating new cards programmatically before full configuration.
 * Business value: Accelerates the creation of new UI components by providing sensible defaults
 * and a standardized starting point, reducing manual configuration effort.
 */
export function createMinimalSerializableCard(title: string, variant: CardVariant = 'default', cardOwnerId: string = 'default-user'): SerializableCardProps {
  const newId = generateUniqueCardId();
  return {
    title: title,
    variant: variant,
    padding: 'md',
    shape: 'rounded',
    elevation: 'md',
    isCollapsible: true,
    defaultCollapsed: false,
    persistence: { enabled: true, id: newId, fields: ['collapsed', 'activeTab'] },
    headerActions: [
      {
        id: 'edit',
        label: 'Edit Card',
        icon: { componentId: 'InfoIcon', type: 'component' },
        onClick: { functionId: 'logClick', args: { id: 'edit-card-action' } },
      },
      {
        id: 'payment',
        label: 'Make Payment',
        icon: { componentId: 'TransactionStatusApproved', type: 'component' },
        onClick: { functionId: 'performPaymentAction', args: { amount: 100, currency: 'USD', targetAccount: 'ACC12345' } },
      },
    ],
    children: { type: 'text', componentId: 'This is a new card generated from a minimal template.' },
    cardOwnerId: cardOwnerId,
    _schemaVersion: cardDataSerializer['currentVersion'],
  };
}

/**
 * Serializes card configuration into a URL-friendly query string format.
 * Note: This is highly simplified and only suitable for small, simple configurations.
 * Complex ReactNodes or functions cannot be reliably embedded.
 * Business value: Enables deep linking and sharing of lightweight card configurations via URLs,
 * improving user experience for bookmarking or sharing specific views.
 */
export function encodeCardPropsToQueryString(serializableProps: Partial<SerializableCardProps>): string {
  const params = new URLSearchParams();
  for (const key in serializableProps) {
    if (Object.prototype.hasOwnProperty.call(serializableProps, key)) {
      const value = (serializableProps as any)[key];
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        params.append(key, String(value));
      }
    }
  }
  return params.toString();
}

/**
 * Decodes card configuration from a URL query string.
 * @param queryString The URL query string.
 * @returns A partial `SerializableCardProps` object.
 */
export function decodeCardPropsFromQueryString(queryString: string): Partial<SerializableCardProps> {
  const params = new URLSearchParams(queryString);
  const decoded: Partial<SerializableCardProps> = {};
  for (const [key, value] of params.entries()) {
    if (value === 'true') (decoded as any)[key] = true;
    else if (value === 'false') (decoded as any)[key] = false;
    else if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) (decoded as any)[key] = Number(value);
    else (decoded as any)[key] = value;
  }
  return decoded;
}

/**
 * Defines an extensible configuration for how specific `CardProps` fields
 * should be serialized or deserialized, allowing for custom handlers.
 */
export interface FieldSerializationConfig {
  [fieldName: string]: {
    serialize?: (value: any, path: string) => any;
    deserialize?: (serializedValue: any, context: DeserializationContext, schema?: CardPropertySchema, path?: string) => any;
  };
}

/**
 * A factory function to create a serializer with custom field-level handlers.
 * This allows for fine-grained control over how specific properties are processed.
 * Business value: Provides an extension point for highly customized serialization needs,
 * enabling integration with diverse data sources or complex business logic without altering the core serializer.
 */
export function createCustomCardDataSerializer(
  schemaVersions: CardDataSchemaVersion[],
  currentVersion: string,
  fieldHandlers?: FieldSerializationConfig
): CardDataSerializer {
  class CustomSerializer extends CardDataSerializer {
    private customFieldHandlers = fieldHandlers;

    constructor(versions: CardDataSchemaVersion[], currentVer: string, handlers?: FieldSerializationConfig) {
      super(versions, currentVer);
      this.customFieldHandlers = handlers;
    }

    protected override serializeValue(value: any, path: string = '', schema?: CardPropertySchema): any {
      const fieldName = path.split('.').pop();
      if (fieldName && this.customFieldHandlers?.[fieldName]?.serialize) {
        return this.customFieldHandlers[fieldName].serialize!(value, path);
      }
      return super.serializeValue(value, path, schema);
    }

    protected override deserializeValue(
      serializedValue: any,
      context: DeserializationContext,
      schema?: CardPropertySchema,
      path: string = ''
    ): any {
      const fieldName = path.split('.').pop();
      if (fieldName && this.customFieldHandlers?.[fieldName]?.deserialize) {
        return this.customFieldHandlers[fieldName].deserialize!(serializedValue, context, schema, path);
      }
      return super.deserializeValue(serializedValue, context, schema, path);
    }
  }

  return new CustomSerializer(schemaVersions, currentVersion, fieldHandlers);
}

/**
 * A conceptual service for interacting with a backend API for card data.
 * This would abstract away the API calls and integrate with the serializer and security processor.
 * Business value: Centralizes API interactions, ensuring consistent data handling, serialization,
 * and security measures (encryption/decryption) for all card-related data persistence.
 * This is crucial for real-time payments infrastructure that demands high data integrity and security.
 */
export class CardApiService {
  private baseUrl: string;
  private serializer: CardDataSerializer;
  private deserializationContext: DeserializationContext;
  private securityProcessor: CardSecurityProcessor;
  private idempotencyManager: IdempotencyManager;

  /**
   * Constructs a `CardApiService`.
   * @param baseUrl The base URL for the card API.
   * @param serializer The `CardDataSerializer` instance.
   * @param context The `DeserializationContext`.
   */
  constructor(baseUrl: string, serializer: CardDataSerializer, context: DeserializationContext) {
    this.baseUrl = baseUrl;
    this.serializer = serializer;
    this.deserializationContext = context;
    this.securityProcessor = new CardSecurityProcessor();
    this.idempotencyManager = new IdempotencyManager();
  }

  /**
   * Fetches a card by its ID from the API, deserializes it, and decrypts sensitive fields.
   * @param id The ID of the card to fetch.
   * @returns A Promise resolving to a `CardProps` object.
   * @throws {Error} if fetching or decryption fails.
   */
  public async getCard(id: string): Promise<CardProps> {
    CardEventLogger.log('info', `Fetching card with ID: ${id}`);
    const response = await fetch(`${this.baseUrl}/cards/${id}`);
    if (!response.ok) {
      CardEventLogger.log('error', `Failed to fetch card ${id}: ${response.statusText}`);
      throw new Error(`Failed to fetch card ${id}: ${response.statusText}`);
    }
    const serializedData: SerializableCardProps = await response.json();
    const currentSchema = cardDataSerializer['currentSchema']; // Access current schema from serializer
    const decryptedData = await this.securityProcessor.decryptSensitiveFields(serializedData, currentSchema);
    return this.serializer.deserialize(decryptedData, this.deserializationContext);
  }

  /**
   * Saves a `CardProps` object to the API after serialization and encryption.
   * @param cardProps The `CardProps` object to save.
   * @param idempotencyKey An optional idempotency key to prevent duplicate submissions.
   * @returns A Promise resolving when the card is saved.
   * @throws {Error} if saving or encryption fails.
   */
  public async saveCard(cardProps: CardProps, idempotencyKey?: string): Promise<void> {
    const cardId = (cardProps.persistence as any)?.id || cardProps.title?.replace(/\s/g, '_');
    if (!cardId) {
      throw new Error('CardProps must have an ID for saving.');
    }

    if (idempotencyKey && this.idempotencyManager.isDuplicate(idempotencyKey)) {
      CardEventLogger.log('warn', `Duplicate save request detected for card ${cardId} with key ${idempotencyKey}. Skipping.`);
      return;
    }

    CardEventLogger.log('info', `Saving card with ID: ${cardId}`);
    const serializedData = this.serializer.serialize(cardProps);
    const currentSchema = cardDataSerializer['currentSchema'];
    const encryptedData = await this.securityProcessor.encryptSensitiveFields(serializedData, currentSchema);

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
      this.idempotencyManager.markInProgress(idempotencyKey);
    }

    const response = await fetch(`${this.baseUrl}/cards/${cardId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(encryptedData),
    });

    if (!response.ok) {
      this.idempotencyManager.markFailed(idempotencyKey);
      CardEventLogger.log('error', `Failed to save card ${cardId}: ${response.statusText}`);
      throw new Error(`Failed to save card: ${response.statusText}`);
    }

    this.idempotencyManager.markCompleted(idempotencyKey);
    CardEventLogger.log('info', `Card ${cardId} saved successfully.`);
  }

  /**
   * Deletes a card from the API.
   * @param id The ID of the card to delete.
   * @param idempotencyKey An optional idempotency key.
   * @returns A Promise resolving when the card is deleted.
   * @throws {Error} if deletion fails.
   */
  public async deleteCard(id: string, idempotencyKey?: string): Promise<void> {
    if (idempotencyKey && this.idempotencyManager.isDuplicate(idempotencyKey)) {
      CardEventLogger.log('warn', `Duplicate delete request detected for card ${id} with key ${idempotencyKey}. Skipping.`);
      return;
    }

    CardEventLogger.log('info', `Deleting card with ID: ${id}`);
    const headers: HeadersInit = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
      this.idempotencyManager.markInProgress(idempotencyKey);
    }

    const response = await fetch(`${this.baseUrl}/cards/${id}`, {
      method: 'DELETE',
      headers: headers,
    });
    if (!response.ok) {
      this.idempotencyManager.markFailed(idempotencyKey);
      CardEventLogger.log('error', `Failed to delete card ${id}: ${response.statusText}`);
      throw new Error(`Failed to delete card ${id}: ${response.statusText}`);
    }
    this.idempotencyManager.markCompleted(idempotencyKey);
    CardEventLogger.log('info', `Card ${id} deleted successfully.`);
  }
}

/**
 * Manages idempotency keys for operations to ensure actions are processed exactly once.
 * Business value: Prevents duplicate transactions or state changes caused by retries or network issues,
 * crucial for financial systems where transactional guarantees are paramount.
 */
export class IdempotencyManager {
  private processedKeys: Set<string> = new Set();
  private inProgressKeys: Map<string, Date> = new Map(); // Store with timestamp for expiry

  /**
   * Checks if an idempotency key has already been processed or is currently in progress.
   * @param key The idempotency key.
   * @param expiryMs Milliseconds before an in-progress key is considered expired.
   * @returns `true` if the key is a duplicate or an active in-progress request, `false` otherwise.
   */
  public isDuplicate(key: string, expiryMs: number = 60000): boolean {
    if (this.processedKeys.has(key)) {
      CardEventLogger.log('debug', `Idempotency key ${key} already processed.`);
      return true;
    }
    const inProgressTime = this.inProgressKeys.get(key);
    if (inProgressTime) {
      if (Date.now() - inProgressTime.getTime() < expiryMs) {
        CardEventLogger.log('debug', `Idempotency key ${key} in progress.`);
        return true;
      } else {
        CardEventLogger.log('warn', `Idempotency key ${key} was in progress but expired.`);
        this.inProgressKeys.delete(key); // Clean up expired in-progress keys
      }
    }
    return false;
  }

  /**
   * Marks an idempotency key as being in progress.
   * @param key The idempotency key.
   */
  public markInProgress(key: string): void {
    this.inProgressKeys.set(key, new Date());
    CardEventLogger.log('debug', `Idempotency key ${key} marked as in progress.`);
  }

  /**
   * Marks an idempotency key as completed successfully.
   * @param key The idempotency key.
   */
  public markCompleted(key: string): void {
    this.inProgressKeys.delete(key);
    this.processedKeys.add(key);
    CardEventLogger.log('debug', `Idempotency key ${key} marked as completed.`);
  }

  /**
   * Marks an idempotency key as failed (allowing for retry without being blocked as duplicate).
   * @param key The idempotency key.
   */
  public markFailed(key: string): void {
    this.inProgressKeys.delete(key);
    CardEventLogger.log('debug', `Idempotency key ${key} marked as failed (removed from in-progress).`);
  }

  /**
   * Generates a new unique idempotency key.
   * @returns A unique string.
   */
  public generateKey(): string {
    return `idempotency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Manages the versioning and migration of card data schemas.
 * Business value: Guarantees the long-term stability and maintainability of card configurations
 * by providing a structured way to evolve data schemas over time, preventing breaking changes.
 * This is crucial for systems with continuous deployment and data model changes.
 */
export class CardDataVersionControl {
  /**
   * Migrates card data from an old version to a new version.
   * @param data The card data to migrate.
   * @param fromVersion The starting version.
   * @param toVersion The target version.
   * @param schemaVersions The array of all schema versions.
   * @returns The migrated card data.
   * @throws {DeserializationError} if migration path is invalid.
   */
  public static migrateData(data: any, fromVersion: string, toVersion: string, schemaVersions: CardDataSchemaVersion[]): any {
    let currentData = deepCloneSerializableCardData(data);
    const sortedVersions = schemaVersions.sort((a, b) => a.version.localeCompare(b.version));

    const startIndex = sortedVersions.findIndex(s => s.version === fromVersion);
    const endIndex = sortedVersions.findIndex(s => s.version === toVersion);

    if (startIndex === -1) {
      throw new DeserializationError(`Source schema version "${fromVersion}" not found for migration.`);
    }
    if (endIndex === -1) {
      throw new DeserializationError(`Target schema version "${toVersion}" not found for migration.`);
    }
    if (startIndex > endIndex) {
      CardEventLogger.log('warn', `Attempting to migrate from newer version (${fromVersion}) to older version (${toVersion}). This is generally not recommended.`);
      // Still attempt reverse migration if logic is defined, but warn
    }

    if (startIndex === endIndex) {
      CardEventLogger.log('info', `Data is already at target version ${toVersion}. No migration needed.`);
      return currentData;
    }

    if (startIndex < endIndex) { // Forward migration
      for (let i = startIndex; i < endIndex; i++) {
        const migrationSchema = sortedVersions[i + 1];
        if (migrationSchema.migrationLogic) {
          CardEventLogger.log('info', `Applying forward migration logic for version ${migrationSchema.version}`);
          currentData = migrationSchema.migrationLogic(currentData, sortedVersions[i].version);
        }
      }
    } else { // Backward migration (if supported by logic)
      for (let i = startIndex; i > endIndex; i--) {
        const migrationSchema = sortedVersions[i]; // Logic on current schema migrates *to* previous
        // A robust backward migration would need dedicated 'rollback' logic,
        // here we assume `migrationLogic` can handle both or is forward-only.
        // For simplicity, we just apply the last forward step in reverse.
        // In a real system, you'd have specific `rollbackLogic`.
        CardEventLogger.log('warn', `Backward migration from ${sortedVersions[i].version} to ${sortedVersions[i-1].version} not fully supported by generic migration logic.`);
        // For robust backward, `migrationLogic` would need to be designed carefully
        // or a separate `rollbackLogic` function provided per version.
      }
    }

    return currentData;
  }

  /**
   * Applies a set of patches to card data to reach a specific state.
   * @param baseData The initial card data.
   * @param patches An array of patch operations.
   * @returns The patched card data.
   */
  public static applyPatches(baseData: SerializableCardProps, patches: any[]): SerializableCardProps {
    return applyCardDataPatch(baseData, patches);
  }
}

/**
 * A simple event logger for internal operations.
 * Business value: Provides observability into internal processes, aiding in debugging,
 * performance analysis, and security auditing. Crucial for understanding system behavior.
 */
export class CardEventLogger {
  /**
   * Logs an event with a specific level.
   * @param level The log level (e.g., 'info', 'warn', 'error', 'debug', 'event', 'action', 'data').
   * @param message The log message.
   * @param data Optional additional data to log.
   */
  public static log(level: 'info' | 'warn' | 'error' | 'debug' | 'event' | 'action' | 'data', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [CardSerializer:${level.toUpperCase()}] ${message}`;
    if (data) {
      console.log(logEntry, data);
    } else {
      console.log(logEntry);
    }
    // In a production system, this would integrate with a centralized logging service
    // (e.g., Splunk, ELK, CloudWatch Logs) for observability and audit trails.
  }
}

/**
 * Monitors and records performance metrics for serialization and deserialization operations.
 * Business value: Provides key performance indicators (KPIs) for critical data operations,
 * allowing performance bottlenecks to be identified and optimized, directly impacting user experience and system scalability.
 */
export class CardPerformanceMonitor {
  private static metrics: Record<string, number[]> = {};

  /**
   * Records a duration for a specific operation.
   * @param operation The name of the operation (e.g., 'serialize', 'deserialize').
   * @param durationMs The duration in milliseconds.
   */
  public static record(operation: string, durationMs: number): void {
    if (!this.metrics[operation]) {
      this.metrics[operation] = [];
    }
    this.metrics[operation].push(durationMs);
    CardEventLogger.log('debug', `Performance recorded for ${operation}: ${durationMs}ms`);
    // In a real system, this would push metrics to a monitoring system like Prometheus or Datadog.
  }

  /**
   * Retrieves summary statistics for a given operation.
   * @param operation The name of the operation.
   * @returns An object with min, max, average, and count, or null if no data.
   */
  public static getStats(operation: string): { min: number; max: number; avg: number; count: number; } | null {
    const data = this.metrics[operation];
    if (!data || data.length === 0) {
      return null;
    }
    const sum = data.reduce((a, b) => a + b, 0);
    return {
      min: Math.min(...data),
      max: Math.max(...data),
      avg: sum / data.length,
      count: data.length,
    };
  }

  /**
   * Resets all recorded performance metrics.
   */
  public static reset(): void {
    this.metrics = {};
    CardEventLogger.log('info', 'Performance metrics reset.');
  }
}

/**
 * Orchestrates rule-based transformations and validations on card data.
 * Business value: Enables dynamic business logic and governance policies to be applied to card data
 * at runtime, supporting complex workflows (e.g., conditional field visibility, automated approvals, compliance checks).
 */
export class CardGovernancePolicyEngine {
  private policies: Map<string, (cardData: SerializableCardProps) => SerializableCardProps | Promise<SerializableCardProps>> = new Map();

  /**
   * Registers a governance policy.
   * @param policyId A unique ID for the policy.
   * @param policyFn An asynchronous function that takes card data and returns potentially transformed data.
   */
  public registerPolicy(policyId: string, policyFn: (cardData: SerializableCardProps) => SerializableCardProps | Promise<SerializableCardProps>): void {
    if (this.policies.has(policyId)) {
      CardEventLogger.log('warn', `Overwriting existing policy with ID: ${policyId}`);
    }
    this.policies.set(policyId, policyFn);
    CardEventLogger.log('info', `Policy '${policyId}' registered.`);
  }

  /**
   * Applies a registered policy to card data.
   * @param policyId The ID of the policy to apply.
   * @param cardData The card data to process.
   * @returns A Promise resolving to the processed card data.
   * @throws {Error} if the policy is not found or fails.
   */
  public async applyPolicy(policyId: string, cardData: SerializableCardProps): Promise<SerializableCardProps> {
    const policyFn = this.policies.get(policyId);
    if (!policyFn) {
      throw new Error(`Policy with ID '${policyId}' not found.`);
    }
    CardEventLogger.log('info', `Applying policy '${policyId}' to card data.`);
    try {
      const result = await policyFn(cardData);
      CardEventLogger.log('info', `Policy '${policyId}' applied successfully.`);
      return result;
    } catch (e: any) {
      CardEventLogger.log('error', `Policy '${policyId}' failed: ${e.message}`, e);
      throw new Error(`Policy '${policyId}' failed: ${e.message}`);
    }
  }

  /**
   * Executes multiple policies in sequence.
   * @param policyIds An array of policy IDs to apply in order.
   * @param initialCardData The initial card data.
   * @returns A Promise resolving to the card data after all policies are applied.
   */
  public async applyPolicies(policyIds: string[], initialCardData: SerializableCardProps): Promise<SerializableCardProps> {
    let currentData = initialCardData;
    for (const policyId of policyIds) {
      currentData = await this.applyPolicy(policyId, currentData);
    }
    return currentData;
  }
}

// Global instance for governance policy engine
export const cardGovernancePolicyEngine = new CardGovernancePolicyEngine();

// Example policies:
cardGovernancePolicyEngine.registerPolicy('anonymizeSensitiveFields', async (cardData) => {
  CardEventLogger.log('debug', 'Executing anonymizeSensitiveFields policy.');
  const anonymized = deepCloneSerializableCardData(cardData);
  // Example: Anonymize cardOwnerId if present and secureField in schema
  const currentSchema = cardDataSerializer['currentSchema'];
  if (anonymized.cardOwnerId && currentSchema.cardOwnerId?.secureField) {
    anonymized.cardOwnerId = `ANON-${anonymized.cardOwnerId.substring(anonymized.cardOwnerId.length - 4)}`; // Last 4 chars for identification, rest anonymized
    CardEventLogger.log('debug', 'Anonymized cardOwnerId.');
  }
  return anonymized;
});

cardGovernancePolicyEngine.registerPolicy('enforceMinimumLimit', async (cardData) => {
  CardEventLogger.log('debug', 'Executing enforceMinimumLimit policy.');
  const enforced = deepCloneSerializableCardData(cardData);
  const minLimit = 500; // Example minimum limit
  if (typeof enforced.transactionLimit === 'number' && enforced.transactionLimit < minLimit) {
    enforced.transactionLimit = minLimit;
    CardEventLogger.log('warn', `Enforced transactionLimit to minimum ${minLimit}.`);
  }
  return enforced;
});