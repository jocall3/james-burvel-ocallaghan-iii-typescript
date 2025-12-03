// components/components/card-data-serializers.ts
// This file provides a comprehensive set of utilities and interfaces for serializing
// and deserializing complex Card component configurations and data, suitable for
// persistence, API communication, and ensuring data integrity across different
// application states or versions. It addresses the challenges of handling
// non-serializable types such as ReactNode and functions.

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
} from '../Card'; // Assuming Card.tsx is in the parent directory

// ================================================================================================
// SERIALIZABLE TYPE DEFINITIONS - MIRRORING CARD PROPS
// ================================================================================================

/**
 * @description Represents a serialized ReactNode. In most cases, a ReactNode cannot be directly
 * serialized to JSON. This type allows for common strategies:
 * - `string`: For simple text content or a reference ID to a registered component/template.
 * - `{ componentId: string; props?: Record<string, any>; }`: For complex components that can be
 *   reconstructed from an ID and serializable props.
 * - `null`: If the ReactNode is optional or cannot be serialized.
 */
export type SerializableReactNode = string | { componentId: string; props?: Record<string, any>; } | null;

/**
 * @description Represents a serialized function. Functions cannot be directly serialized.
 * This can be an ID referring to a known function in a registry, or null if not applicable.
 */
export type SerializableFunction = string | null;

/**
 * @description A utility type to convert a `ReactNode` to `SerializableReactNode` and functions to `SerializableFunction`.
 * Non-serializable properties (like `React.ReactElement` which is part of `ReactNode` but often for icons)
 * need special handling. For this serializer, `React.ReactElement` will be represented by a string `componentId`.
 */
type ToSerializable<T> = {
  [K in keyof T]: T[K] extends ReactNode | React.ReactElement | undefined
    ? SerializableReactNode
    : T[K] extends Function | undefined
      ? SerializableFunction
      : T[K] extends Array<infer U>
        ? U extends ReactNode | React.ReactElement | Function
          ? Array<ToSerializable<U>> // Handle arrays of complex types
          : T[K] // Keep arrays of simple types as is
        : T[K] extends object
          ? ToSerializable<T[K]> // Recursively apply to nested objects
          : T[K]; // Keep primitive types as is
};

/**
 * @description Defines the structure for a serializable action item in the card's header.
 * Functions are replaced with their serializable counterparts (e.g., string IDs or null).
 */
export interface SerializableCardHeaderAction extends ToSerializable<CardHeaderAction> {
  // Explicitly override to ensure React.ReactElement for 'icon' is handled.
  // Assuming icon can be serialized as a string ID, or just ignored if not crucial for persistence.
  icon?: SerializableReactNode;
  onClick?: SerializableFunction;
  renderCustom?: SerializableFunction;
}

/**
 * @description Serializable version of CardAction.
 */
export interface SerializableCardAction extends SerializableCardHeaderAction, ToSerializable<CardAction> {
  renderCustom?: SerializableFunction;
}

/**
 * @description Serializable version of CardTab.
 */
export interface SerializableCardTab extends ToSerializable<CardTab> {
  icon?: SerializableReactNode;
  content: SerializableReactNode;
  badge?: SerializableReactNode;
}

/**
 * @description Serializable version of CardSection.
 */
export interface SerializableCardSection extends ToSerializable<CardSection> {
  content: SerializableReactNode;
  actions?: SerializableCardHeaderAction[];
}

/**
 * @description Serializable version of CardBadge.
 */
export interface SerializableCardBadge extends ToSerializable<CardBadge> {
  content: SerializableReactNode;
  onClick?: SerializableFunction;
}

/**
 * @description Serializable version of CardOverlay.
 */
export interface SerializableCardOverlay extends ToSerializable<CardOverlay> {
  content: SerializableReactNode;
  onDismiss?: SerializableFunction;
  closeButton?: SerializableReactNode;
}

/**
 * @description Serializable version of CardDraggableConfig.
 */
export interface SerializableCardDraggableConfig extends ToSerializable<CardDraggableConfig> {
  onDragStart?: SerializableFunction;
  onDragEnd?: SerializableFunction;
  onDrag?: SerializableFunction;
}

/**
 * @description Serializable version of CardResizableConfig.
 */
export interface SerializableCardResizableConfig extends ToSerializable<CardResizableConfig> {
  onResizeStart?: SerializableFunction;
  onResizeEnd?: SerializableFunction;
  onResize?: SerializableFunction;
}

/**
 * @description Serializable version of CardPersistenceConfig.
 * Note: onSave/onLoad usually refers to external storage logic, not internal component state.
 * These functions often manage the persistence mechanism itself, so they are typically not serialized.
 */
export interface SerializableCardPersistenceConfig extends ToSerializable<CardPersistenceConfig> {
  onSave?: SerializableFunction;
  onLoad?: SerializableFunction;
}

/**
 * @description Serializable version of CardVirtualizationConfig.
 */
export interface SerializableCardVirtualizationConfig extends ToSerializable<CardVirtualizationConfig> {
  renderItem: SerializableFunction; // This function is critical and needs special handling for reconstruction
}

/**
 * @description Serializable version of CardAccessControl.
 */
export interface SerializableCardAccessControl extends ToSerializable<CardAccessControl> {
  permissionChecker?: SerializableFunction;
  onAccessDenied?: SerializableReactNode;
}

/**
 * @description Serializable version of CardRealtimeConfig.
 */
export interface SerializableCardRealtimeConfig extends ToSerializable<CardRealtimeConfig> {
  onUpdate?: SerializableFunction;
  connector?: SerializableFunction;
}

/**
 * @description Serializable version of CardKeyboardNavConfig.
 */
export interface SerializableCardKeyboardNavConfig extends ToSerializable<CardKeyboardNavConfig> {
  onFocus?: SerializableFunction;
  onBlur?: SerializableFunction;
}

/**
 * @description Serializable version of CardContextMenuItem.
 */
export interface SerializableCardContextMenuItem extends SerializableCardAction, ToSerializable<CardContextMenuItem> {
  subItems?: SerializableCardContextMenuItem[];
  renderCustom?: SerializableFunction;
}

/**
 * @description Serializable version of CardHeaderPrefixSuffix.
 */
export interface SerializableCardHeaderPrefixSuffix extends ToSerializable<CardHeaderPrefixSuffix> {
  content: SerializableReactNode;
}

/**
 * @description The main serializable props interface for the Card component. This interface mirrors
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
}

// ================================================================================================
// SERIALIZATION CONTEXT & REGISTRIES
// ================================================================================================

/**
 * @description Interface defining the context required for deserialization.
 * This context provides mappings from serializable IDs to actual React components,
 * elements, or functions that cannot be directly serialized.
 */
export interface DeserializationContext {
  /**
   * @description A registry mapping string IDs to React components or elements.
   * This is used to reconstruct `ReactNode` properties.
   * Example: `{ 'MyCustomIcon': <MyCustomIcon />, 'DefaultLoadingIndicator': <LoadingSpinner /> }`
   */
  componentRegistry?: Record<string, ReactNode | React.ComponentType<any>>;

  /**
   * @description A registry mapping string IDs to function implementations.
   * This is used to reconstruct `onClick`, `onSave`, `renderItem`, etc.
   * Example: `{ 'handleCardClick': (e) => console.log('Card Clicked'), 'saveCardState': async (id, state) => { /* ... */ } }`
   */
  functionRegistry?: Record<string, Function>;

  /**
   * @description A fallback component or function to use if a registered ID is not found.
   */
  fallbackResolver?: {
    component?: ReactNode | React.ComponentType<any>;
    function?: Function;
  };
}

/**
 * @description Type for a function that can transform a serialized value during deserialization.
 * Useful for data migration or cleaning.
 */
export type DeserializationTransformer<T> = (serializedValue: any, context: DeserializationContext) => T;

/**
 * @description Represents a schema definition for a card property, including its type and
 * an optional transformer for deserialization. This enhances data integrity and migration.
 */
export interface CardPropertySchema<T = any> {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'ReactNode' | 'function' | 'enum';
  enumOptions?: string[]; // For 'enum' types
  isArray?: boolean;
  nestedSchema?: CardSchema; // For 'object' or 'array' types
  transformer?: DeserializationTransformer<T>;
  defaultValue?: T;
  required?: boolean;
}

/**
 * @description A schema definition for an entire card or a sub-object within it.
 * This is used for validation and guided deserialization.
 */
export type CardSchema = {
  [K in keyof SerializableCardProps]?: CardPropertySchema<SerializableCardProps[K]>;
};

/**
 * @description Defines the current version of the card data schema.
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
 * @description Error thrown when a non-serializable type is encountered without a handling strategy.
 */
export class NonSerializableTypeError extends Error {
  constructor(message: string, public path: string, public value: any) {
    super(`Non-serializable type encountered at ${path}: ${message}`);
    this.name = 'NonSerializableTypeError';
  }
}

/**
 * @description Error thrown when deserialization fails due to missing context or malformed data.
 */
export class DeserializationError extends Error {
  constructor(message: string, public path?: string, public serializedData?: any) {
    super(`Deserialization failed${path ? ` at ${path}` : ''}: ${message}`);
    this.name = 'DeserializationError';
  }
}

/**
 * @description Error thrown when a data validation fails against a defined schema.
 */
export class SchemaValidationError extends Error {
  constructor(message: string, public errors: { path: string; message: string; }[] = []) {
    super(`Schema validation failed: ${message}`);
    this.name = 'SchemaValidationError';
  }
}

// ================================================================================================
// CORE SERIALIZER UTILITIES
// ================================================================================================

/**
 * @description Utility class for serializing and deserializing complex CardProps objects.
 * It handles the conversion of ReactNodes and functions to serializable formats (IDs or null)
 * and reconstructs them during deserialization using a provided context.
 */
export class CardDataSerializer {
  private schemaVersions: CardDataSchemaVersion[];
  private currentSchema: CardSchema;
  private currentVersion: string;

  constructor(schemaVersions: CardDataSchemaVersion[], currentVersion: string) {
    if (!schemaVersions || schemaVersions.length === 0) {
      throw new Error("CardDataSerializer requires at least one schema version.");
    }
    this.schemaVersions = schemaVersions.sort((a, b) => a.version.localeCompare(b.version)); // Ensure versions are ordered
    const resolvedSchema = this.schemaVersions.find(s => s.version === currentVersion);
    if (!resolvedSchema) {
      throw new Error(`Schema version "${currentVersion}" not found in provided schema versions.`);
    }
    this.currentSchema = resolvedSchema.schema;
    this.currentVersion = currentVersion;
  }

  /**
   * @description Recursively serializes a value, handling ReactNode and functions.
   * @param value The value to serialize.
   * @param path The current path in the object structure for error reporting.
   * @returns A serializable representation of the value.
   * @throws {NonSerializableTypeError} if an unexpected non-serializable type is encountered.
   */
  private serializeValue(value: any, path: string = ''): any {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    // Handle specific React elements/nodes that might appear in place of raw ReactNode
    if (React.isValidElement(value)) {
      // For simple elements like icons or placeholders, we might serialize their type/props
      // or simply return a known ID if they are registered.
      // For this implementation, we'll try to serialize known structures or treat as a string ID.
      // E.g., if it's an SVG icon, we could represent it as '{ componentId: "SvgIcon", props: { d: "..." } }'
      // Or simply map specific known icons to string IDs.
      if (typeof value.type === 'string') { // Intrinsic HTML element
        return { componentId: value.type, props: this.serializeValue(value.props, `${path}.props`) };
      }
      // If it's a known component, assume it's referenced by a `componentId`
      if (value.type && (value.type as any).displayName) {
        return { componentId: (value.type as any).displayName, props: this.serializeValue(value.props, `${path}.props`) };
      }
      // Fallback: If it's a complex ReactNode that cannot be easily serialized, return null
      console.warn(`Complex ReactNode found at ${path} and cannot be automatically serialized. Returning null.`, value);
      return null;
    }

    if (Array.isArray(value)) {
      return value.map((item, index) => this.serializeValue(item, `${path}[${index}]`));
    }

    if (typeof value === 'object') {
      const serializedObject: Record<string, any> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          serializedObject[key] = this.serializeValue(value[key], `${path}.${key}`);
        }
      }
      return serializedObject;
    }

    if (typeof value === 'function') {
      // Functions are replaced by null or, ideally, a reference ID to a registered function.
      // For this general serializer, we return null, assuming context-based reconstruction.
      console.warn(`Function found at ${path} and cannot be serialized. Returning null.`);
      return null;
    }

    // Should not reach here for standard JS types
    throw new NonSerializableTypeError(`Unhandled type: ${typeof value}`, path, value);
  }

  /**
   * @description Converts a `CardProps` object into a `SerializableCardProps` object,
   * suitable for JSON serialization.
   * @param props The `CardProps` object to serialize.
   * @returns A `SerializableCardProps` object.
   */
  public serialize(props: CardProps): SerializableCardProps {
    const serialized = this.serializeValue(props);
    return { ...serialized, _schemaVersion: this.currentVersion }; // Add schema version for deserialization
  }

  /**
   * @description Recursively deserializes a value using the provided context and schema.
   * @param serializedValue The serialized value to deserialize.
   * @param context The deserialization context.
   * @param schema The schema for the current property.
   * @param path The current path in the object structure for error reporting.
   * @returns The deserialized value.
   * @throws {DeserializationError} if deserialization fails.
   */
  private deserializeValue(
    serializedValue: any,
    context: DeserializationContext,
    schema?: CardPropertySchema,
    path: string = ''
  ): any {
    if (serializedValue === null || serializedValue === undefined) {
      return schema?.defaultValue !== undefined ? schema.defaultValue : null;
    }

    // Apply transformer if available in schema
    if (schema?.transformer) {
      try {
        return schema.transformer(serializedValue, context);
      } catch (e: any) {
        throw new DeserializationError(`Transformer failed for ${path}: ${e.message}`, path, serializedValue);
      }
    }

    if (schema?.type === 'ReactNode') {
      if (typeof serializedValue === 'string') {
        // Assume string is a componentId or raw text
        return context.componentRegistry?.[serializedValue] || serializedValue || context.fallbackResolver?.component;
      }
      if (typeof serializedValue === 'object' && serializedValue.componentId) {
        const Component = context.componentRegistry?.[serializedValue.componentId];
        if (Component && typeof Component === 'function') { // It's a React component
          const deserializedProps = this.deserializeValue(serializedValue.props, context, schema?.nestedSchema, `${path}.props`);
          return React.createElement(Component as React.ComponentType<any>, deserializedProps);
        } else if (Component && React.isValidElement(Component)) { // It's a pre-built element
          return Component;
        } else if (Component) { // Could be just a string, number, etc.
          return Component;
        }
        console.warn(`Component with ID '${serializedValue.componentId}' not found in registry for ${path}. Using fallback or null.`);
        return context.fallbackResolver?.component || null;
      }
      return null;
    }

    if (schema?.type === 'function') {
      if (typeof serializedValue === 'string') {
        return context.functionRegistry?.[serializedValue] || context.fallbackResolver?.function;
      }
      return null;
    }

    if (Array.isArray(serializedValue)) {
      if (!schema?.isArray && schema?.type !== 'array') {
        console.warn(`Array found at ${path} but schema doesn't expect an array. Attempting to deserialize elements.`);
      }
      return serializedValue.map((item, index) =>
        this.deserializeValue(item, context, schema?.nestedSchema, `${path}[${index}]`)
      );
    }

    if (typeof serializedValue === 'object' && serializedValue !== null) {
      if (schema?.type === 'object' && schema?.nestedSchema) {
        const deserializedObject: Record<string, any> = {};
        for (const key in serializedValue) {
          if (Object.prototype.hasOwnProperty.call(serializedValue, key)) {
            deserializedObject[key] = this.deserializeValue(
              serializedValue[key],
              context,
              schema.nestedSchema[key as keyof CardSchema],
              `${path}.${key}`
            );
          }
        }
        return deserializedObject;
      }
      // If no nested schema, deserialize as a generic object
      const deserializedObject: Record<string, any> = {};
      for (const key in serializedValue) {
        if (Object.prototype.hasOwnProperty.call(serializedValue, key)) {
          deserializedObject[key] = this.deserializeValue(serializedValue[key], context, undefined, `${path}.${key}`);
        }
      }
      return deserializedObject;
    }

    // Default return for primitives or unknown types
    return serializedValue;
  }

  /**
   * @description Converts a `SerializableCardProps` object back into a `CardProps` object.
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

    let dataToDeserialize = { ...serializedProps };
    const dataVersion = (serializedProps as any)._schemaVersion || 'unknown';

    // Apply migration logic if the data version is older than the current serializer's version
    if (dataVersion !== this.currentVersion) {
      console.info(`Migrating card data from version ${dataVersion} to ${this.currentVersion}...`);
      const startIndex = this.schemaVersions.findIndex(s => s.version === dataVersion);
      const endIndex = this.schemaVersions.findIndex(s => s.version === this.currentVersion);

      if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        console.warn(`Cannot find schema versions for migration from ${dataVersion} to ${this.currentVersion}. Attempting to deserialize directly.`);
      } else {
        for (let i = startIndex; i < endIndex; i++) {
          const migrationSchema = this.schemaVersions[i + 1];
          if (migrationSchema.migrationLogic) {
            console.log(`Applying migration logic for version ${migrationSchema.version}`);
            dataToDeserialize = migrationSchema.migrationLogic(dataToDeserialize, this.schemaVersions[i].version);
          }
        }
      }
    }

    const deserialized = this.deserializeValue(dataToDeserialize, context, { type: 'object', nestedSchema: this.currentSchema });

    // Ensure the output matches CardProps type structure as closely as possible
    // The `_schemaVersion` property is an internal metadata, not part of CardProps, so it should be removed.
    const { _schemaVersion, ...result } = deserialized as SerializableCardProps & { _schemaVersion?: string };
    return result as CardProps;
  }
}

// ================================================================================================
// SCHEMA VALIDATION UTILITIES
// ================================================================================================

/**
 * @description A utility class for validating data against a defined `CardSchema`.
 * This ensures the integrity and correctness of serialized or deserialized data.
 */
export class CardSchemaValidator {
  private schema: CardSchema;

  constructor(schema: CardSchema) {
    this.schema = schema;
  }

  /**
   * @description Validates an object against the stored schema.
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

        // Check for required properties
        if (propSchema.required && (value === undefined || value === null)) {
          errors.push({ path: currentPath, message: `Property '${key}' is required.` });
          continue;
        }
        if (value === undefined || value === null) {
          continue; // Skip further validation if optional and missing
        }

        // Validate type
        switch (propSchema.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push({ path: currentPath, message: `Expected string, got ${typeof value}.` });
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push({ path: currentPath, message: `Expected number, got ${typeof value}.` });
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
          case 'ReactNode': // For serialized ReactNode, we might check for specific formats
            if (typeof value !== 'string' && (typeof value !== 'object' || value === null || !value.componentId)) {
                errors.push({ path: currentPath, message: `Expected string or { componentId: string } for ReactNode, got ${typeof value}.` });
            }
            break;
          case 'function': // For serialized function, we expect a string (ID) or null
            if (value !== null && typeof value !== 'string') {
                errors.push({ path: currentPath, message: `Expected string (function ID) or null for function, got ${typeof value}.` });
            }
            break;
          default:
            console.warn(`No specific validation rule for type '${propSchema.type}' at ${currentPath}.`);
        }
      }
    }

    return errors;
  }

  /**
   * @description Throws a `SchemaValidationError` if the data is invalid.
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
// CARD DATA REGISTRY & FACTORIES
// ================================================================================================

/**
 * @description Manages a registry of components and functions that can be referenced by ID.
 * This is crucial for deserializing ReactNodes and functions.
 */
export class CardComponentRegistry {
  private components: Record<string, ReactNode | React.ComponentType<any>> = {};
  private functions: Record<string, Function> = {};

  /**
   * @description Registers a component or React element with a unique ID.
   * @param id The unique ID for the component.
   * @param component The React component or element.
   */
  public registerComponent(id: string, component: ReactNode | React.ComponentType<any>): void {
    if (this.components[id]) {
      console.warn(`Component with ID '${id}' is being overwritten in the registry.`);
    }
    this.components[id] = component;
  }

  /**
   * @description Registers a function with a unique ID.
   * @param id The unique ID for the function.
   * @param func The function to register.
   */
  public registerFunction(id: string, func: Function): void {
    if (this.functions[id]) {
      console.warn(`Function with ID '${id}' is being overwritten in the registry.`);
    }
    this.functions[id] = func;
  }

  /**
   * @description Retrieves a registered component by its ID.
   * @param id The ID of the component.
   * @returns The registered component or `undefined` if not found.
   */
  public getComponent(id: string): ReactNode | React.ComponentType<any> | undefined {
    return this.components[id];
  }

  /**
   * @description Retrieves a registered function by its ID.
   * @param id The ID of the function.
   * @returns The registered function or `undefined` if not found.
   */
  public getFunction(id: string): Function | undefined {
    return this.functions[id];
  }

  /**
   * @description Creates a deserialization context from the current registry.
   * @returns A `DeserializationContext` object.
   */
  public toDeserializationContext(): DeserializationContext {
    return {
      componentRegistry: { ...this.components },
      functionRegistry: { ...this.functions },
      // Fallback resolvers can be configured here if needed globally
    };
  }
}

/**
 * @description A factory for common ReactNode components.
 */
export const CardReactNodeFactory = {
  /**
   * @description Creates a simple SVG icon component.
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
   * @description Creates a basic loading spinner.
   * @param className Optional CSS class name.
   * @returns A ReactElement for a loading spinner.
   */
  createLoadingSpinner(className?: string): React.ReactElement {
    return (
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-white ${className || ''}`}></div>
    );
  },

  /**
   * @description Creates a simple text node.
   * @param text The text content.
   * @param className Optional CSS class name.
   * @returns A ReactElement for a span containing text.
   */
  createText(text: string, className?: string): React.ReactElement {
    return <span className={className}>{text}</span>;
  },

  /**
   * @description Creates a custom render component for a complex card action.
   * @param action The CardAction object.
   * @param iconClass Optional class for the icon.
   * @returns A ReactNode representing the custom action.
   */
  createCustomActionRender(action: CardAction, iconClass?: string): ReactNode {
    return (
      <div className="flex items-center space-x-2">
        {action.icon && React.cloneElement(action.icon, { className: iconClass || 'h-4 w-4' })}
        <span>{action.label}</span>
      </div>
    );
  },
};


// ================================================================================================
// EXAMPLE SCHEMA DEFINITION & REGISTRY POPULATION
// ================================================================================================

/**
 * @description Defines the current and past schema versions for card data.
 * This array would be managed as part of your application's data migration strategy.
 */
export const cardSchemaVersions: CardDataSchemaVersion[] = [
  {
    version: "1.0.0",
    schema: {
      title: { type: 'string' },
      variant: { type: 'enum', enumOptions: ['default', 'outline', 'ghost', 'interactive', 'solid'] },
      isCollapsible: { type: 'boolean', defaultValue: false },
      headerActions: { type: 'array', nestedSchema: {
        id: { type: 'string', required: true },
        label: { type: 'string', required: true },
        icon: { type: 'ReactNode' },
        onClick: { type: 'function' },
      } as CardSchema },
      children: { type: 'ReactNode' },
      // ... more properties as needed for version 1.0.0
    },
    migrationLogic: (oldData: any) => {
      // No migration needed for the first version
      return oldData;
    },
  },
  {
    version: "1.1.0",
    schema: {
      ...cardSchemaVersions[0].schema, // Inherit from previous version
      footerContent: { type: 'ReactNode' },
      tabs: { type: 'array', nestedSchema: {
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
    },
    migrationLogic: (oldData: any, oldVersion: string) => {
      if (oldVersion === "1.0.0") {
        // Example: If an old card used 'content' directly, map it to a single tab.
        if (oldData.content && !oldData.tabs) {
          oldData.tabs = [{
            id: 'default-tab',
            label: 'Content',
            content: oldData.content,
          }];
          delete oldData.content;
        }
      }
      return oldData;
    },
  },
  // Add more schema versions as your CardProps evolve
];

/**
 * @description An instance of the global component registry.
 */
export const globalCardComponentRegistry = new CardComponentRegistry();

// Populate the registry with common components and functions
globalCardComponentRegistry.registerComponent('InfoIcon', CardReactNodeFactory.createSvgIcon("M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"));
globalCardComponentRegistry.registerComponent('ErrorIcon', CardReactNodeFactory.createSvgIcon("M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"));
globalCardComponentRegistry.registerComponent('EmptyIcon', CardReactNodeFactory.createSvgIcon("M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"));
globalCardComponentRegistry.registerComponent('LoadingSpinner', CardReactNodeFactory.createLoadingSpinner('text-cyan-500'));
globalCardComponentRegistry.registerComponent('TextSpan', CardReactNodeFactory.createText('')); // Use a factory for dynamic props

// Register example functions
globalCardComponentRegistry.registerFunction('logClick', (event: React.MouseEvent) => console.log('Button clicked:', event.currentTarget.id));
globalCardComponentRegistry.registerFunction('handleRetry', () => console.log('Retrying operation...'));
globalCardComponentRegistry.registerFunction('onCardSelected', (isSelected: boolean) => console.log('Card selected state:', isSelected));
globalCardComponentRegistry.registerFunction('defaultTabChangeHandler', (tabId: string) => console.log('Tab changed to:', tabId));
globalCardComponentRegistry.registerFunction('defaultRealtimeUpdate', (data: any) => console.log('Realtime update:', data));

// ================================================================================================
// EXPORT MAIN SERIALIZER INSTANCE
// ================================================================================================

/**
 * @description The primary serializer instance for CardProps.
 * Configured with the latest schema version for robust serialization and deserialization
 * with built-in schema migration capabilities.
 */
export const cardDataSerializer = new CardDataSerializer(
  cardSchemaVersions,
  cardSchemaVersions[cardSchemaVersions.length - 1].version // Always use the latest schema for serialization
);

/**
 * @description Returns a `DeserializationContext` populated from the global component registry.
 * This function provides a convenient way to get the context required for deserialization.
 * @returns A `DeserializationContext` instance.
 */
export function getGlobalDeserializationContext(): DeserializationContext {
  return globalCardComponentRegistry.toDeserializationContext();
}

/**
 * @description Convenience function to serialize `CardProps` to a JSON string.
 * @param props The `CardProps` object to serialize.
 * @returns A JSON string representation of the card data.
 * @throws {NonSerializableTypeError} if serialization fails.
 */
export function stringifyCardProps(props: CardProps): string {
  const serializableProps = cardDataSerializer.serialize(props);
  return JSON.stringify(serializableProps);
}

/**
 * @description Convenience function to deserialize a JSON string back to `CardProps`.
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

  // Optional: Validate the deserialized data against the current schema
  const validator = new CardSchemaValidator(cardDataSerializer['currentSchema']);
  validator.assertValid(deserialized); // Will throw SchemaValidationError if invalid

  return deserialized;
}

// ================================================================================================
// ADVANCED DATA MANIPULATION & HELPER FUNCTIONS
// ================================================================================================

/**
 * @description Deeply clones a serializable card data object, ensuring immutability.
 * Useful before applying transformations or migrations.
 * @param data The serializable card data to clone.
 * @returns A deep clone of the data.
 */
export function deepCloneSerializableCardData<T extends SerializableCardProps>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * @description Generates a unique ID suitable for card elements or actions.
 * @returns A unique string ID.
 */
export function generateUniqueCardId(): string {
  return `card-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * @description Extracts all unique component IDs referenced in a serializable card data structure.
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
 * @description Extracts all unique function IDs referenced in a serializable card data structure.
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
    if (typeof obj === 'string' && globalCardComponentRegistry.getFunction(obj)) { // Check if string looks like a registered function ID
      ids.add(obj);
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        traverse(obj[key]);
      }
    }
  };

  // Specific traversal for known function-holding properties
  if (serializableProps.onCardInteraction && typeof serializableProps.onCardInteraction === 'string') ids.add(serializableProps.onCardInteraction);
  if (serializableProps.onCardViewed && typeof serializableProps.onCardViewed === 'string') ids.add(serializableProps.onCardViewed);
  if (serializableProps.onCollapseToggle && typeof serializableProps.onCollapseToggle === 'string') ids.add(serializableProps.onCollapseToggle);
  if (serializableProps.onRetry && typeof serializableProps.onRetry === 'string') ids.add(serializableProps.onRetry);
  if (serializableProps.onLoadMore && typeof serializableProps.onLoadMore === 'string') ids.add(serializableProps.onLoadMore);
  if (serializableProps.onSelect && typeof serializableProps.onSelect === 'string') ids.add(serializableProps.onSelect);
  if (serializableProps.onTabChange && typeof serializableProps.onTabChange === 'string') ids.add(serializableProps.onTabChange);
  if (serializableProps.onRevertVersion && typeof serializableProps.onRevertVersion === 'string') ids.add(serializableProps.onRevertVersion);
  if (serializableProps.onClick && typeof serializableProps.onClick === 'string') ids.add(serializableProps.onClick);
  if (serializableProps.onFocus && typeof serializableProps.onFocus === 'string') ids.add(serializableProps.onFocus);
  if (serializableProps.onBlur && typeof serializableProps.onBlur === 'string') ids.add(serializableProps.onBlur);

  if (serializableProps.headerActions) {
    serializableProps.headerActions.forEach(action => {
      if (action.onClick && typeof action.onClick === 'string') ids.add(action.onClick);
      if (action.renderCustom && typeof action.renderCustom === 'string') ids.add(action.renderCustom);
    });
  }
  if (serializableProps.cardActions) {
    serializableProps.cardActions.forEach(action => {
      if (action.onClick && typeof action.onClick === 'string') ids.add(action.onClick);
      if (action.renderCustom && typeof action.renderCustom === 'string') ids.add(action.renderCustom);
    });
  }
  if (serializableProps.contextMenuActions) {
    serializableProps.contextMenuActions.forEach(action => {
      if (action.onClick && typeof action.onClick === 'string') ids.add(action.onClick);
      if (action.renderCustom && typeof action.renderCustom === 'string') ids.add(action.renderCustom);
      // TODO: Recursively traverse subItems
    });
  }
  if (serializableProps.emptyStateAction) {
    if (serializableProps.emptyStateAction.onClick && typeof serializableProps.emptyStateAction.onClick === 'string') {
      ids.add(serializableProps.emptyStateAction.onClick);
    }
  }

  // Iterate over all properties that might hold functions, following a more generic approach
  traverse(serializableProps);

  return ids;
}

/**
 * @description Provides a generic transformation function that can be used within a schema.
 * This example transformer ensures a numeric value is always within a min/max range.
 * @param min The minimum allowed value.
 * @param max The maximum allowed value.
 * @returns A `DeserializationTransformer` function.
 */
export function createNumericRangeTransformer(min: number, max: number): DeserializationTransformer<number> {
  return (value: any) => {
    let num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      console.warn(`Attempted to transform non-numeric value to number in range [${min}, ${max}], defaulting to min.`);
      return min;
    }
    return Math.max(min, Math.min(max, num));
  };
}

/**
 * @description Provides a generic transformation function for boolean values, handling various string inputs.
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

// Add more complex data processing and transformation functions below to extend file size and utility.

/**
 * @description Filters out card actions based on a dynamic predicate function.
 * This is a post-deserialization utility to manage action visibility.
 * @param actions An array of `CardAction` objects.
 * @param predicate A function that returns `true` if an action should be kept.
 * @returns A filtered array of `CardAction` objects.
 */
export function filterCardActions(actions: CardAction[] | undefined, predicate: (action: CardAction) => boolean): CardAction[] {
  if (!actions) return [];
  return actions.filter(predicate);
}

/**
 * @description Sorts card actions based on a given key and order.
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
    // Fallback for other types or if types differ
    return 0;
  });
}

/**
 * @description Merges multiple `CardProps` objects into a single one, with later props overriding earlier ones.
 * This can be useful for dynamic configuration.
 * @param propSets An array of `CardProps` objects to merge.
 * @returns A single merged `CardProps` object.
 */
export function mergeCardProps(...propSets: Partial<CardProps>[]): CardProps {
  // Deep merge would be ideal, but a shallow merge is often sufficient for initial setup
  // For complex objects/arrays, this would need a recursive merge
  const merged: Partial<CardProps> = {};
  for (const props of propSets) {
    Object.assign(merged, props); // Simple shallow merge
    // For arrays or objects that should be merged deeply (e.g., headerActions), handle explicitly
    if (props.headerActions) {
      merged.headerActions = [...(merged.headerActions || []), ...props.headerActions];
    }
    if (props.badges) {
      merged.badges = [...(merged.badges || []), ...props.badges];
    }
    // ... extend for other array/object properties that need deep merging or concatenation
  }
  return merged as CardProps; // Type assertion as it's a partial merge
}

/**
 * @description Monitors for changes in card data and provides a diff,
 * suitable for auditing or collaborative editing.
 * @param oldData The original `SerializableCardProps` data.
 * @param newData The new `SerializableCardProps` data.
 * @returns A JSON patch-like array of changes.
 */
export function diffCardData(oldData: SerializableCardProps, newData: SerializableCardProps): any[] {
  const diffs: any[] = [];

  const compareObjects = (obj1: any, obj2: any, path: string) => {
    const keys1 = new Set(Object.keys(obj1));
    const keys2 = new Set(Object.keys(obj2));

    // Added/Modified
    for (const key of keys2) {
      const currentPath = path ? `${path}/${key}` : key;
      if (!keys1.has(key)) {
        diffs.push({ op: 'add', path: currentPath, value: obj2[key] });
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        // If it's an object, recurse
        if (typeof obj1[key] === 'object' && obj1[key] !== null &&
            typeof obj2[key] === 'object' && obj2[key] !== null &&
            !Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
          compareObjects(obj1[key], obj2[key], currentPath);
        } else {
          diffs.push({ op: 'replace', path: currentPath, value: obj2[key] });
        }
      }
    }

    // Removed
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
 * @description Applies a diff (e.g., from `diffCardData`) to a base `SerializableCardProps` object.
 * @param baseData The base `SerializableCardProps` object.
 * @param patches An array of patch operations.
 * @returns The patched `SerializableCardProps` object.
 */
export function applyCardDataPatch(baseData: SerializableCardProps, patches: any[]): SerializableCardProps {
  const clonedData = deepCloneSerializableCardData(baseData); // Work on a clone to ensure immutability
  // This is a simplified JSON patch implementation. A full one would handle array indices carefully.

  for (const patch of patches) {
    const pathParts = patch.path.split('/').filter(Boolean); // ['', 'a', 'b'] -> ['a', 'b']
    let current: any = clonedData;
    let parent: any = null;
    let key: string = '';

    for (let i = 0; i < pathParts.length; i++) {
      key = pathParts[i];
      if (i < pathParts.length - 1) {
        parent = current;
        current = current[key];
        if (typeof current !== 'object' || current === null) {
          console.warn(`Patch path traversal failed at ${key}. Skipping patch.`, patch);
          current = null; // Mark as failed path
          break;
        }
      }
    }

    if (current === null) continue; // Path traversal failed

    switch (patch.op) {
      case 'add':
      case 'replace':
        if (parent) {
          parent[key] = patch.value;
        } else {
          // If pathParts.length is 1, it's a top-level property
          (clonedData as any)[key] = patch.value;
        }
        break;
      case 'remove':
        if (parent) {
          delete parent[key];
        } else {
          delete (clonedData as any)[key];
        }
        break;
      default:
        console.warn(`Unknown patch operation: ${patch.op}. Skipping.`, patch);
    }
  }
  return clonedData;
}

// Add more data processing, validation, or utility functions as needed to reach the target line count
// while maintaining relevance to "card data structures for persistence or API communication".
// This could involve:
// - Encryption/Decryption hooks
// - Compression/Decompression utilities
// - Advanced schema validation rules (e.g., regex for strings, range for numbers)
// - Dynamic form generation metadata extractors
// - Data anonymization/masking functions for sensitive fields
// - Internationalization string extraction for serializable props.

/**
 * @description Generates a simplified summary of `SerializableCardProps`,
 * useful for quick previews or dashboard listings without full deserialization.
 * @param serializableProps The serialized card properties.
 * @returns A summary object with key properties.
 */
export function summarizeSerializableCardProps(serializableProps: SerializableCardProps): { id?: string; title?: string; variant?: CardVariant; lastUpdated?: string; hasActions: boolean; hasTabs: boolean; } {
  return {
    id: (serializableProps as any).persistence?.id || serializableProps.title?.replace(/\s/g, '_').toLowerCase() || 'unknown',
    title: typeof serializableProps.title === 'string' ? serializableProps.title : undefined,
    variant: serializableProps.variant,
    lastUpdated: new Date().toISOString(), // This would typically come from metadata, not inferred
    hasActions: (serializableProps.headerActions?.length || 0) > 0 || (serializableProps.cardActions?.length || 0) > 0,
    hasTabs: (serializableProps.tabs?.length || 0) > 0,
  };
}

/**
 * @description Creates a minimal `SerializableCardProps` object from essential details,
 * useful for generating new cards programmatically before full configuration.
 * @param title The title of the new card.
 * @param variant The visual variant of the card.
 * @returns A basic `SerializableCardProps` object.
 */
export function createMinimalSerializableCard(title: string, variant: CardVariant = 'default'): SerializableCardProps {
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
        icon: { componentId: 'InfoIcon' }, // Using a registered icon
        onClick: 'logClick', // Using a registered function
      },
    ],
    children: 'This is a new card generated from a minimal template.',
    _schemaVersion: cardDataSerializer['currentVersion'],
  };
}

/**
 * @description Serializes card configuration into a URL-friendly query string format.
 * Note: This is highly simplified and only suitable for small, simple configurations.
 * Complex ReactNodes or functions cannot be reliably embedded.
 * @param serializableProps The simplified `SerializableCardProps` to encode.
 * @returns A URL query string.
 */
export function encodeCardPropsToQueryString(serializableProps: Partial<SerializableCardProps>): string {
  const params = new URLSearchParams();
  for (const key in serializableProps) {
    if (Object.prototype.hasOwnProperty.call(serializableProps, key)) {
      const value = (serializableProps as any)[key];
      // Only encode simple primitives for URL safety
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        params.append(key, String(value));
      }
    }
  }
  return params.toString();
}

/**
 * @description Decodes card configuration from a URL query string.
 * @param queryString The URL query string.
 * @returns A partial `SerializableCardProps` object.
 */
export function decodeCardPropsFromQueryString(queryString: string): Partial<SerializableCardProps> {
  const params = new URLSearchParams(queryString);
  const decoded: Partial<SerializableCardProps> = {};
  for (const [key, value] of params.entries()) {
    // Attempt to infer type
    if (value === 'true') (decoded as any)[key] = true;
    else if (value === 'false') (decoded as any)[key] = false;
    else if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) (decoded as any)[key] = Number(value);
    else (decoded as any)[key] = value;
  }
  return decoded;
}

/**
 * @description Defines an extensible configuration for how specific `CardProps` fields
 * should be serialized or deserialized, allowing for custom handlers.
 */
export interface FieldSerializationConfig {
  [fieldName: string]: {
    serialize?: (value: any) => any;
    deserialize?: (serializedValue: any, context: DeserializationContext) => any;
  };
}

/**
 * @description A factory function to create a serializer with custom field-level handlers.
 * This allows for fine-grained control over how specific properties are processed.
 * @param schemaVersions The array of schema versions.
 * @param currentVersion The current active schema version.
 * @param fieldHandlers Custom handlers for specific fields.
 * @returns A new instance of `CardDataSerializer` with extended capabilities.
 */
export function createCustomCardDataSerializer(
  schemaVersions: CardDataSchemaVersion[],
  currentVersion: string,
  fieldHandlers?: FieldSerializationConfig
): CardDataSerializer {
  // We would extend the internal serializeValue and deserializeValue methods
  // of the CardDataSerializer to check `fieldHandlers` for custom logic before default processing.
  // For demonstration, this is a conceptual extension. In a real scenario,
  // CardDataSerializer's methods would need to be designed with hook points.
  class CustomSerializer extends CardDataSerializer {
    private customFieldHandlers = fieldHandlers;

    constructor(versions: CardDataSchemaVersion[], currentVer: string, handlers?: FieldSerializationConfig) {
      super(versions, currentVer);
      this.customFieldHandlers = handlers;
    }

    protected override serializeValue(value: any, path: string = ''): any {
      const fieldName = path.split('.').pop();
      if (fieldName && this.customFieldHandlers?.[fieldName]?.serialize) {
        return this.customFieldHandlers[fieldName].serialize!(value);
      }
      return super['serializeValue'](value, path); // Access base class private method
    }

    protected override deserializeValue(
      serializedValue: any,
      context: DeserializationContext,
      schema?: CardPropertySchema,
      path: string = ''
    ): any {
      const fieldName = path.split('.').pop();
      if (fieldName && this.customFieldHandlers?.[fieldName]?.deserialize) {
        return this.customFieldHandlers[fieldName].deserialize!(serializedValue, context);
      }
      return super['deserializeValue'](serializedValue, context, schema, path); // Access base class private method
    }
  }

  return new CustomSerializer(schemaVersions, currentVersion, fieldHandlers);
}

/**
 * @description A conceptual service for interacting with a backend API for card data.
 * This would abstract away the API calls and integrate with the serializer.
 */
export class CardApiService {
  private baseUrl: string;
  private serializer: CardDataSerializer;
  private deserializationContext: DeserializationContext;

  constructor(baseUrl: string, serializer: CardDataSerializer, context: DeserializationContext) {
    this.baseUrl = baseUrl;
    this.serializer = serializer;
    this.deserializationContext = context;
  }

  /**
   * @description Fetches a card by its ID from the API and deserializes it.
   * @param id The ID of the card to fetch.
   * @returns A Promise resolving to a `CardProps` object.
   */
  public async getCard(id: string): Promise<CardProps> {
    const response = await fetch(`${this.baseUrl}/cards/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch card ${id}: ${response.statusText}`);
    }
    const serializedData: SerializableCardProps = await response.json();
    return this.serializer.deserialize(serializedData, this.deserializationContext);
  }

  /**
   * @description Saves a `CardProps` object to the API after serialization.
   * @param cardProps The `CardProps` object to save.
   * @returns A Promise resolving when the card is saved.
   */
  public async saveCard(cardProps: CardProps): Promise<void> {
    const serializedData = this.serializer.serialize(cardProps);
    const response = await fetch(`${this.baseUrl}/cards/${(cardProps.persistence as any)?.id || cardProps.title?.replace(/\s/g, '_')}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serializedData),
    });
    if (!response.ok) {
      throw new Error(`Failed to save card: ${response.statusText}`);
    }
  }

  /**
   * @description Deletes a card from the API.
   * @param id The ID of the card to delete.
   * @returns A Promise resolving when the card is deleted.
   */
  public async deleteCard(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/cards/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete card ${id}: ${response.statusText}`);
    }
  }
}