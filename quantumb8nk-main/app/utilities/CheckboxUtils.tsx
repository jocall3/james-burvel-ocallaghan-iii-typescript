/**
 * @file CheckboxUtils.tsx
 * @description
 * This file provides a comprehensive suite of utilities for managing,
 * validating, transforming, and enhancing checkbox-related functionality
 * within modern web applications. It aims to be a robust, commercial-grade
 * solution incorporating best practices, advanced state management,
 * accessibility considerations, and hypothetical AI-driven insights
 * using a simulated Gemini AI integration.
 *
 * It supports various checkbox patterns including single, grouped, and
 * tristate checkboxes, offering deep customization and extensibility.
 *
 * @version 3.0.0
 * @author AI Expert Programmer
 * @date 2023-10-27
 */

/**
 * Represents the fundamental structure of a single checkbox option.
 * @template T The type of the value associated with the checkbox.
 */
export interface CheckboxOption<T = string | number | boolean> {
  /** A unique identifier for the checkbox option. If not provided, one will be generated. */
  id?: string;
  /** The value associated with the checkbox. This is typically what is submitted or stored. */
  value: T;
  /** The display label for the checkbox. */
  label: string;
  /** The current checked state of the checkbox. */
  checked: boolean;
  /** Whether the checkbox is disabled and cannot be interacted with. */
  disabled?: boolean;
  /** An optional description or tooltip for the checkbox. */
  description?: string;
  /** Additional data associated with the checkbox, useful for complex scenarios. */
  meta?: Record<string, any>;
  /** Indicates if the checkbox is currently in an indeterminate (tristate) state. */
  indeterminate?: boolean;
  /** Custom data attributes for enhanced integration (e.g., analytics, testing). */
  dataset?: Record<string, string>;
}

/**
 * Represents the state for a group of checkboxes.
 * @template T The type of the value associated with each checkbox.
 */
export interface CheckboxGroupState<T = string | number | boolean> {
  /** An array of all available checkbox options in the group. */
  options: CheckboxOption<T>[];
  /** An array of values for the currently checked options. */
  selectedValues: T[];
  /** Optional header or title for the checkbox group. */
  groupLabel?: string;
  /** Optional description for the entire group. */
  groupDescription?: string;
  /** Indicates if all checkboxes in the group are checked. */
  isAllChecked?: boolean;
  /** Indicates if some but not all checkboxes in the group are checked (indeterminate state). */
  isIndeterminate?: boolean;
  /** An error message associated with the group, if validation fails. */
  errorMessage?: string;
}

/**
 * Represents a single user preference for a checkbox.
 */
export interface UserCheckboxPreference<T = string | number | boolean> {
  /** The value of the checkbox to which this preference applies. */
  checkboxValue: T;
  /** The preferred initial checked state. */
  preferredCheckedState: boolean;
  /** The preferred order index. */
  preferredOrder?: number;
  /** Timestamp of when the preference was recorded or last updated. */
  timestamp?: number;
  /** Source of the preference (e.g., 'user_settings', 'ai_suggestion', 'system_default'). */
  source?: string;
}

/**
 * Represents a collection of user preferences for checkboxes, keyed by group ID or context.
 */
export interface UserCheckboxPreferences<T = string | number | boolean> {
  /** A map where keys are group identifiers and values are arrays of individual checkbox preferences. */
  [groupId: string]: UserCheckboxPreference<T>[];
}

/**
 * Defines criteria for detecting conflicts between checkbox selections.
 * @template T The type of the value associated with each checkbox.
 */
export interface CheckboxConflictRule<T = string | number | boolean> {
  /** A unique identifier for the rule. */
  id: string;
  /** An array of checkbox values that, if selected together, constitute a conflict. */
  conflictingValues: T[];
  /** A message to display when this conflict is detected. */
  message: string;
  /** The severity of the conflict (e.g., 'error', 'warning', 'info'). */
  severity: 'error' | 'warning' | 'info';
  /** Optional function to programmatically determine if the rule applies based on current selections. */
  predicate?: (selected: T[], allOptions: CheckboxOption<T>[]) => boolean;
}

/**
 * Represents an activity log entry related to checkbox interaction.
 */
export interface UserActivityLog {
  /** Timestamp of the activity. */
  timestamp: number;
  /** Type of interaction (e.g., 'checked', 'unchecked', 'group_toggle', 'form_submit'). */
  eventType: string;
  /** ID of the checkbox or group involved. */
  targetId: string;
  /** New state or value associated with the interaction. */
  newState?: any;
  /** User identifier (e.g., user ID, session ID). */
  userId?: string;
  /** Additional contextual data. */
  context?: Record<string, any>;
}

/**
 * Interface for a hypothetical AI request to Gemini for checkbox suggestions.
 */
export interface GeminiCheckboxSuggestionRequest {
  /** Current context or user query for suggestions. */
  context: string;
  /** Current state of checkbox options. */
  currentOptions: CheckboxOption<any>[];
  /** User's recent activity history. */
  userActivityHistory: UserActivityLog[];
  /** Optional user profile data for personalization. */
  userProfile?: Record<string, any>;
  /** Specific task for the AI (e.g., 'predict_selection', 'optimize_order', 'suggest_labels'). */
  taskType: 'predict_selection' | 'optimize_order' | 'suggest_labels' | 'detect_anomalies' | 'generate_descriptions';
  /** Additional parameters specific to the task. */
  taskParams?: Record<string, any>;
}

/**
 * Interface for a hypothetical AI response from Gemini for checkbox suggestions.
 */
export interface GeminiCheckboxSuggestionResponse {
  /** The suggested data, type depends on the task. */
  suggestions: any; // Could be CheckboxOption<any>[], string[], or a complex object
  /** A message from the AI. */
  message: string;
  /** Confidence score of the AI's suggestion. */
  confidenceScore?: number;
  /** Any errors encountered by the AI. */
  error?: string;
}

// --- Internal Helper Functions (not exported directly, but used internally) ---

/**
 * Generates a unique ID string.
 * @param prefix An optional prefix for the ID.
 * @returns A unique ID string.
 */
const generateUniqueId = (prefix: string = 'checkbox-id-'): string => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Performs a deep clone of a checkbox option to ensure immutability.
 * @template T The type of the value.
 * @param option The checkbox option to clone.
 * @returns A deep clone of the checkbox option.
 */
const deepCloneCheckboxOption = <T>(option: CheckboxOption<T>): CheckboxOption<T> => {
  return JSON.parse(JSON.stringify(option));
};

/**
 * Validates a single checkbox option structure.
 * @template T The type of the value.
 * @param option The option to validate.
 * @throws {Error} If the option is invalid.
 */
const validateCheckboxOption = <T>(option: CheckboxOption<T>): void => {
  if (typeof option !== 'object' || option === null) {
    throw new Error('CheckboxOption must be a non-null object.');
  }
  if (option.value === undefined) {
    throw new Error('CheckboxOption must have a "value" property.');
  }
  if (typeof option.label !== 'string' || option.label.trim() === '') {
    throw new Error('CheckboxOption must have a non-empty string "label" property.');
  }
  if (typeof option.checked !== 'boolean') {
    throw new Error('CheckboxOption must have a boolean "checked" property.');
  }
};

/**
 * Creates a debounced version of a function.
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced function.
 */
const debounce = (func: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

/**
 * Creates a throttled version of a function.
 * @param func The function to throttle.
 * @param limit The throttle limit in milliseconds.
 * @returns A throttled function.
 */
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  let lastResult: any;
  return function(this: any, ...args: any[]) {
    const context = this;
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(context, args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
};

/**
 * Simple in-memory logger for checkbox interactions.
 * In a real application, this would integrate with a centralized logging service (e.g., Splunk, DataDog).
 */
const interactionLog: UserActivityLog[] = [];
const MAX_LOG_SIZE = 500; // Limit to prevent excessive memory usage

/**
 * Records a user interaction with a checkbox.
 * @param logEntry The user activity log entry to record.
 */
const recordInteraction = (logEntry: UserActivityLog): void => {
  if (interactionLog.length >= MAX_LOG_SIZE) {
    interactionLog.shift(); // Remove oldest entry if max size reached
  }
  interactionLog.push({ ...logEntry, timestamp: logEntry.timestamp || Date.now() });
  // In a real app, this would dispatch to an analytics service or server endpoint
  // console.log('Checkbox Interaction Logged:', logEntry);
};

// --- Core Checkbox Utility Functions ---

/**
 * Determines the checked state of a collection of booleans, typically representing
 * a simplified view of checkbox states.
 *
 * @deprecated This function's input `boolean[]` is somewhat ambiguous for complex checkbox states.
 * Consider using `isAnyChecked`, `isAllChecked`, or `getTristateStatus` with `CheckboxOption<T>[]` instead
 * for more clarity and robust state management.
 *
 * It checks the last element in the array to determine the "current" state.
 * If the array is empty, it returns `false`.
 *
 * @param value An array of boolean values.
 * @returns The boolean state of the last element, or `false` if the array is empty.
 */
export const isChecked = (value: boolean[]): boolean => {
  if (!Array.isArray(value)) {
    console.error("Invalid input for isChecked: expected an array of booleans.");
    return false; // Default to false for invalid input
  }
  const { length } = value;
  const checked = length > 0 ? value[length - 1] : false;
  return checked;
};

/**
 * Generates initial checkbox options, ensuring each has a unique ID and default properties.
 * This is useful for initializing new checkbox groups.
 * @template T The type of the value associated with the checkbox.
 * @param optionsData An array of partial checkbox option data.
 * @returns An array of fully formed `CheckboxOption<T>` objects.
 */
export const initializeCheckboxOptions = <T>(
  optionsData: Partial<CheckboxOption<T>>[],
): CheckboxOption<T>[] => {
  if (!Array.isArray(optionsData)) {
    throw new Error('optionsData must be an array of partial CheckboxOption objects.');
  }
  return optionsData.map(opt => {
    const initializedOpt: CheckboxOption<T> = {
      id: opt.id || generateUniqueId(),
      value: opt.value as T, // Assume value is always provided in partials or will be validated later
      label: opt.label || String(opt.value),
      checked: opt.checked ?? false,
      disabled: opt.disabled ?? false,
      description: opt.description,
      meta: opt.meta,
      indeterminate: opt.indeterminate ?? false,
      dataset: opt.dataset,
    };
    try {
      validateCheckboxOption(initializedOpt);
    } catch (error) {
      console.error(`Invalid checkbox option detected during initialization:`, initializedOpt, error);
      // Depending on policy, could throw, filter out, or fix. For robustness, we'll fix missing values.
      if (!initializedOpt.label) initializedOpt.label = 'Invalid Label';
    }
    return initializedOpt;
  });
};

/**
 * Retrieves the values of all currently checked checkbox options.
 * @template T The type of the value associated with the checkbox.
 * @param options An array of `CheckboxOption<T>`.
 * @returns An array of the values of the checked options.
 */
export const getCheckedValues = <T>(options: CheckboxOption<T>[]): T[] => {
  if (!Array.isArray(options)) {
    console.warn("Input to getCheckedValues must be an array. Returning empty array.");
    return [];
  }
  return options.filter(option => option.checked).map(option => option.value);
};

/**
 * Updates the checked state of a single checkbox option within an array of options.
 * Returns a new array to maintain immutability.
 * @template T The type of the value associated with the checkbox.
 * @param currentOptions The current array of `CheckboxOption<T>`.
 * @param valueToUpdate The value of the checkbox to be updated.
 * @param newCheckedState The new checked state (true/false).
 * @param userId Optional user ID for logging.
 * @returns A new array of `CheckboxOption<T>` with the updated option.
 */
export const updateCheckboxState = <T>(
  currentOptions: CheckboxOption<T>[],
  valueToUpdate: T,
  newCheckedState: boolean,
  userId?: string,
): CheckboxOption<T>[] => {
  if (!Array.isArray(currentOptions)) {
    console.warn("Input to updateCheckboxState must be an array. Returning original array.");
    return currentOptions;
  }
  const updatedOptions = currentOptions.map(option => {
    if (option.value === valueToUpdate) {
      // Ensure we don't modify disabled checkboxes
      if (option.disabled && option.checked !== newCheckedState) {
        console.warn(`Attempted to change state of disabled checkbox with value: ${valueToUpdate}`);
        return deepCloneCheckboxOption(option); // Return original if disabled and state change attempted
      }
      recordInteraction({
        eventType: newCheckedState ? 'checked' : 'unchecked',
        targetId: option.id || String(option.value),
        newState: newCheckedState,
        userId: userId,
        context: { oldValue: option.checked },
      });
      return { ...option, checked: newCheckedState, indeterminate: false };
    }
    return deepCloneCheckboxOption(option);
  });
  return updatedOptions;
};

/**
 * Toggles the checked state of all checkboxes in a group.
 * If `forceState` is provided, all checkboxes will be set to that state.
 * Returns a new array to maintain immutability.
 * @template T The type of the value associated with the checkbox.
 * @param currentOptions The current array of `CheckboxOption<T>`.
 * @param forceState Optional boolean to force all checkboxes to a specific state (true/false).
 * @param userId Optional user ID for logging.
 * @returns A new array of `CheckboxOption<T>` with all options updated.
 */
export const toggleAllCheckboxes = <T>(
  currentOptions: CheckboxOption<T>[],
  forceState?: boolean,
  userId?: string,
): CheckboxOption<T>[] => {
  if (!Array.isArray(currentOptions)) {
    console.warn("Input to toggleAllCheckboxes must be an array. Returning original array.");
    return currentOptions;
  }

  const allChecked = currentOptions.every(option => option.checked || option.disabled);
  const newState = forceState !== undefined ? forceState : !allChecked;

  const updatedOptions = currentOptions.map(option => {
    if (option.disabled) {
      return deepCloneCheckboxOption(option); // Disabled checkboxes remain unchanged
    }
    recordInteraction({
      eventType: 'group_toggle',
      targetId: 'all_checkboxes', // A generic ID for group actions
      newState: newState,
      userId: userId,
      context: { checkboxId: option.id || String(option.value), oldValue: option.checked },
    });
    return { ...option, checked: newState, indeterminate: false };
  });
  return updatedOptions;
};

/**
 * Determines if any checkbox in the given array is currently checked.
 * @template T The type of the value associated with the checkbox.
 * @param options An array of `CheckboxOption<T>`.
 * @returns `true` if at least one checkbox is checked, `false` otherwise.
 */
export const isAnyChecked = <T>(options: CheckboxOption<T>[]): boolean => {
  if (!Array.isArray(options)) return false;
  return options.some(option => option.checked);
};

/**
 * Determines if all non-disabled checkboxes in the given array are currently checked.
 * @template T The type of the value associated with the checkbox.
 * @param options An array of `CheckboxOption<T>`.
 * @returns `true` if all non-disabled checkboxes are checked, `false` otherwise.
 */
export const isAllChecked = <T>(options: CheckboxOption<T>[]): boolean => {
  if (!Array.isArray(options) || options.length === 0) return false;
  const nonDisabledOptions = options.filter(option => !option.disabled);
  if (nonDisabledOptions.length === 0) return true; // If no non-disabled, consider "all checked" true
  return nonDisabledOptions.every(option => option.checked);
};

/**
 * Calculates the tristate (indeterminate) status for a group of checkboxes.
 * @template T The type of the value associated with the checkbox.
 * @param options An array of `CheckboxOption<T>`.
 * @returns `true` if all non-disabled are checked, `false` if none are checked, and `null` if some are checked (indeterminate).
 */
export const getTristateStatus = <T>(options: CheckboxOption<T>[]): boolean | null => {
  if (!Array.isArray(options) || options.length === 0) {
    return false; // Or a consistent default for empty groups.
  }
  const nonDisabledOptions = options.filter(option => !option.disabled);
  if (nonDisabledOptions.length === 0) {
    return false; // No actionable checkboxes, so not "checked" in a meaningful way.
  }

  const checkedCount = nonDisabledOptions.filter(opt => opt.checked).length;

  if (checkedCount === 0) {
    return false; // None are checked
  }
  if (checkedCount === nonDisabledOptions.length) {
    return true; // All are checked
  }
  return null; // Some are checked, but not all (indeterminate)
};

/**
 * Provides an initialized `CheckboxGroupState` based on an array of `CheckboxOption`s.
 * This function calculates `isAllChecked` and `isIndeterminate` based on the provided options.
 * @template T The type of the value associated with the checkbox.
 * @param options The array of checkbox options.
 * @param groupLabel Optional label for the group.
 * @param groupDescription Optional description for the group.
 * @returns An initialized `CheckboxGroupState<T>`.
 */
export const getCheckboxGroupState = <T>(
  options: CheckboxOption<T>[],
  groupLabel?: string,
  groupDescription?: string,
): CheckboxGroupState<T> => {
  const clonedOptions = options.map(deepCloneCheckboxOption);
  const selectedValues = getCheckedValues(clonedOptions);
  const tristateStatus = getTristateStatus(clonedOptions);

  return {
    options: clonedOptions,
    selectedValues: selectedValues,
    groupLabel: groupLabel,
    groupDescription: groupDescription,
    isAllChecked: tristateStatus === true,
    isIndeterminate: tristateStatus === null,
    errorMessage: undefined,
  };
};

/**
 * Validates a given array of checkbox options against a set of custom validation rules.
 * @template T The type of the value associated with the checkbox.
 * @param options The array of checkbox options to validate.
 * @param validationRules An array of functions, each taking `CheckboxOption<T>[]` and returning an error message string or `null`.
 * @returns An array of error messages found, or empty array if no errors.
 */
export const validateCheckboxGroup = <T>(
  options: CheckboxOption<T>[],
  validationRules: ((options: CheckboxOption<T>[]) => string | null)[],
): string[] => {
  if (!Array.isArray(options)) return ["Invalid input: options must be an array."];
  if (!Array.isArray(validationRules)) return ["Invalid input: validationRules must be an array."];

  const errors: string[] = [];
  validationRules.forEach(rule => {
    try {
      const error = rule(options);
      if (error) {
        errors.push(error);
      }
    } catch (e: any) {
      console.error("Error executing custom validation rule:", e);
      errors.push(`Validation rule failed: ${e.message || 'Unknown error'}`);
    }
  });
  return errors;
};

/**
 * Checks for conflicts in checkbox selections based on predefined rules.
 * @template T The type of the value associated with the checkbox.
 * @param selectedValues An array of currently selected checkbox values.
 * @param allOptions All available checkbox options (useful for predicate rules).
 * @param conflictRules An array of `CheckboxConflictRule<T>`.
 * @returns An array of detected conflict messages.
 */
export const detectCheckboxConflicts = <T>(
  selectedValues: T[],
  allOptions: CheckboxOption<T>[],
  conflictRules: CheckboxConflictRule<T>[],
): { message: string; severity: 'error' | 'warning' | 'info'; ruleId: string }[] => {
  if (!Array.isArray(selectedValues)) return [{ message: "Invalid selected values input.", severity: "error", ruleId: "INVALID_INPUT" }];
  if (!Array.isArray(conflictRules)) return [{ message: "Invalid conflict rules input.", severity: "error", ruleId: "INVALID_INPUT" }];

  const detectedConflicts: { message: string; severity: 'error' | 'warning' | 'info'; ruleId: string }[] = [];

  for (const rule of conflictRules) {
    const hasConflict = rule.predicate
      ? rule.predicate(selectedValues, allOptions)
      : rule.conflictingValues.every(val => selectedValues.includes(val));

    if (hasConflict) {
      detectedConflicts.push({
        message: rule.message,
        severity: rule.severity,
        ruleId: rule.id,
      });
    }
  }
  return detectedConflicts;
};

/**
 * Applies user preferences to an array of checkbox options, overriding default states.
 * This is useful for loading saved user configurations.
 * @template T The type of the value associated with the checkbox.
 * @param initialOptions The initial array of checkbox options.
 * @param preferences User preferences for a specific group.
 * @returns A new array of `CheckboxOption<T>` with preferences applied.
 */
export const applyUserPreferences = <T>(
  initialOptions: CheckboxOption<T>[],
  preferences: UserCheckboxPreference<T>[],
): CheckboxOption<T>[] => {
  if (!Array.isArray(initialOptions)) return [];
  if (!Array.isArray(preferences)) return initialOptions.map(deepCloneCheckboxOption);

  const optionsMap = new Map<T, CheckboxOption<T>>();
  initialOptions.forEach(opt => optionsMap.set(opt.value, deepCloneCheckboxOption(opt)));

  preferences.forEach(pref => {
    const option = optionsMap.get(pref.checkboxValue);
    if (option) {
      option.checked = pref.preferredCheckedState;
      // Optionally, apply preferred order, but this requires re-sorting the array later
      if (pref.preferredOrder !== undefined) {
        option.meta = { ...option.meta, preferredOrder: pref.preferredOrder };
      }
    }
  });

  let result = Array.from(optionsMap.values());

  // Re-sort if preferredOrder was used
  if (preferences.some(p => p.preferredOrder !== undefined)) {
    result = result.sort((a, b) => {
      const orderA = a.meta?.preferredOrder ?? Infinity;
      const orderB = b.meta?.preferredOrder ?? Infinity;
      return orderA - orderB;
    });
  }

  return result;
};

/**
 * Creates a preference snapshot from the current state of checkbox options.
 * @template T The type of the value associated with the checkbox.
 * @param currentOptions The array of current checkbox options.
 * @param source Optional source of the preference (e.g., 'user_save').
 * @returns An array of `UserCheckboxPreference<T>`.
 */
export const createUserPreferencesSnapshot = <T>(
  currentOptions: CheckboxOption<T>[],
  source?: string,
): UserCheckboxPreference<T>[] => {
  if (!Array.isArray(currentOptions)) return [];
  const timestamp = Date.now();
  return currentOptions.map((option, index) => ({
    checkboxValue: option.value,
    preferredCheckedState: option.checked,
    preferredOrder: index, // Captures current display order
    timestamp: timestamp,
    source: source,
  }));
};

/**
 * Serializes a checkbox group state into a compact string representation (e.g., JSON or base64).
 * This is useful for storing state in URLs, local storage, or databases.
 * @template T The type of the value associated with the checkbox.
 * @param state The `CheckboxGroupState<T>` to serialize.
 * @returns A JSON string representing the selected values and potentially other minimal state.
 */
export const serializeCheckboxGroupState = <T>(state: CheckboxGroupState<T>): string => {
  if (!state || !Array.isArray(state.options)) {
    throw new Error('Invalid CheckboxGroupState provided for serialization.');
  }
  const serializableState = {
    selectedValues: state.selectedValues,
    // Optionally, include other minimal state needed for rehydration, e.g., initial enabled/disabled states
    // This depends on whether the `options` themselves are static or dynamically generated.
    // For maximum compatibility, we might only store selected values and expect options to be re-initialized.
  };
  return JSON.stringify(serializableState);
};

/**
 * Deserializes a string representation back into a `CheckboxGroupState`,
 * merging with a base set of options to reconstruct the full state.
 * @template T The type of the value associated with the checkbox.
 * @param serializedState The JSON string to deserialize.
 * @param baseOptions The initial/default set of checkbox options to merge with.
 * @param groupLabel Optional group label for the reconstructed state.
 * @param groupDescription Optional group description for the reconstructed state.
 * @returns A reconstructed `CheckboxGroupState<T>`.
 */
export const deserializeCheckboxGroupState = <T>(
  serializedState: string,
  baseOptions: CheckboxOption<T>[],
  groupLabel?: string,
  groupDescription?: string,
): CheckboxGroupState<T> => {
  if (typeof serializedState !== 'string' || !serializedState.trim()) {
    console.warn('Empty or invalid serializedState provided. Returning default state.');
    return getCheckboxGroupState(baseOptions, groupLabel, groupDescription);
  }

  try {
    const parsedState = JSON.parse(serializedState);
    if (!parsedState || !Array.isArray(parsedState.selectedValues)) {
      throw new Error('Parsed state is missing selectedValues array.');
    }

    const reconstructedOptions = baseOptions.map(option => ({
      ...deepCloneCheckboxOption(option),
      checked: parsedState.selectedValues.includes(option.value),
      indeterminate: false, // Deserialized state should resolve indeterminate
    }));

    return getCheckboxGroupState(reconstructedOptions, groupLabel, groupDescription);
  } catch (error) {
    console.error('Error deserializing checkbox state:', error);
    // Fallback to default state in case of deserialization error
    return getCheckboxGroupState(baseOptions, groupLabel, groupDescription);
  }
};

/**
 * Retrieves ARIA (Accessible Rich Internet Applications) properties for a checkbox group.
 * This promotes better accessibility for screen readers and other assistive technologies.
 * @param groupId A unique ID for the checkbox group.
 * @param label The visible label for the checkbox group.
 * @param descriptionId Optional ID of an element that describes the group.
 * @returns An object containing ARIA attributes.
 */
export const getCheckboxGroupAccessibilityProps = (
  groupId: string,
  label: string,
  descriptionId?: string,
): Record<string, string | undefined> => {
  if (!groupId || !label) {
    console.warn('groupId and label are required for optimal accessibility props.');
  }
  return {
    role: 'group',
    'aria-labelledby': groupId + '-label',
    'aria-describedby': descriptionId,
  };
};

/**
 * Retrieves ARIA properties for an individual checkbox.
 * @param option The `CheckboxOption` for which to get props.
 * @returns An object containing ARIA attributes.
 */
export const getCheckboxAccessibilityProps = <T>(
  option: CheckboxOption<T>,
): Record<string, string | boolean | undefined> => {
  if (!option || !option.id) {
    console.warn('CheckboxOption with an ID is required for optimal accessibility props.');
  }
  return {
    id: option.id,
    'aria-checked': option.indeterminate ? 'mixed' : option.checked,
    'aria-disabled': option.disabled,
    'aria-describedby': option.description ? `${option.id}-description` : undefined,
  };
};

// --- Advanced / AI-Driven (Simulated Gemini) Checkbox Functions ---

/**
 * Simulates a call to a Gemini AI service to predict checkbox selections
 * based on user context and history.
 *
 * @remarks This function is a simulation. In a real-world scenario, it would
 * make an asynchronous network request to a Gemini API endpoint.
 *
 * @template T The type of the value associated with the checkbox.
 * @param request The `GeminiCheckboxSuggestionRequest` object.
 * @returns A Promise that resolves with `GeminiCheckboxSuggestionResponse` containing predicted selections.
 */
export const simulateGeminiPredictCheckboxSelection = async <T>(
  request: GeminiCheckboxSuggestionRequest,
): Promise<GeminiCheckboxSuggestionResponse> => {
  console.info('Simulating Gemini AI call for checkbox prediction:', request.taskType, request.context);

  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200)); // Simulate network latency

  try {
    const { currentOptions, userActivityHistory, context, userProfile, taskType } = request;

    // Basic heuristic simulation for 'predict_selection'
    if (taskType === 'predict_selection') {
      const recentActivity = userActivityHistory.filter(log => log.eventType === 'checked' || log.eventType === 'unchecked');
      const frequentSelections = new Map<T, number>();
      recentActivity.forEach(log => {
        if (log.newState === true) {
          frequentSelections.set(log.context?.value || log.targetId as T, (frequentSelections.get(log.context?.value || log.targetId as T) || 0) + 1);
        }
      });

      // Simple context-based prediction: if "privacy" is in context, suggest privacy options.
      const contextualSelections = currentOptions.filter(opt =>
        context.toLowerCase().includes('privacy') && opt.label.toLowerCase().includes('privacy')
      );

      const predictedValues: T[] = [];
      // Combine frequent and contextual, prioritizing frequent
      Array.from(frequentSelections.entries())
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3) // Top 3 frequent
        .forEach(([value]) => {
          if (!predictedValues.includes(value)) predictedValues.push(value);
        });

      contextualSelections.forEach(opt => {
        if (!predictedValues.includes(opt.value)) predictedValues.push(opt.value);
      });

      const updatedOptions = currentOptions.map(opt => ({
        ...deepCloneCheckboxOption(opt),
        checked: predictedValues.includes(opt.value),
        meta: { ...opt.meta, aiPredicted: predictedValues.includes(opt.value) },
      }));

      return {
        suggestions: updatedOptions,
        message: 'AI predicted checkbox selections based on history and context.',
        confidenceScore: 0.75, // Simulated confidence
      };
    }

    // Basic heuristic simulation for 'optimize_order'
    if (taskType === 'optimize_order') {
      // Simulate ordering based on some criteria, e.g., frequently checked items first
      const frequentlyCheckedValues = Array.from(
        userActivityHistory.filter(log => log.eventType === 'checked' && log.newState === true)
          .reduce((acc, log) => {
            const value = log.context?.value || log.targetId as T;
            acc.set(value, (acc.get(value) || 0) + 1);
            return acc;
          }, new Map<T, number>())
          .entries()
      ).sort(([, countA], [, countB]) => countB - countA)
        .map(([value]) => value);

      const orderedOptions = [...currentOptions].sort((a, b) => {
        const indexA = frequentlyCheckedValues.indexOf(a.value);
        const indexB = frequentlyCheckedValues.indexOf(b.value);

        if (indexA === -1 && indexB === -1) return 0; // Neither frequently checked
        if (indexA === -1) return 1; // B is frequent, A is not
        if (indexB === -1) return -1; // A is frequent, B is not
        return indexA - indexB; // Sort by frequency
      });

      return {
        suggestions: orderedOptions,
        message: 'AI optimized checkbox order based on user interaction frequency.',
        confidenceScore: 0.82,
      };
    }

    // Basic heuristic simulation for 'suggest_labels'
    if (taskType === 'suggest_labels') {
      const suggestedLabels = currentOptions.map(opt => ({
        ...deepCloneCheckboxOption(opt),
        label: `${opt.label} (AI Enhanced)`, // Simple enhancement
        description: opt.description || `AI-generated description for ${opt.label}.`,
        meta: { ...opt.meta, aiSuggestedLabel: true },
      }));
      return {
        suggestions: suggestedLabels,
        message: 'AI generated enhanced labels and descriptions.',
        confidenceScore: 0.68,
      };
    }

    // Basic heuristic simulation for 'detect_anomalies'
    if (taskType === 'detect_anomalies') {
      const anomalies: string[] = [];
      const currentSelectedValues = getCheckedValues(currentOptions);

      // Example: If 'subscribe_marketing' is checked, but 'privacy_policy_accepted' is not.
      const marketingSubChecked = currentSelectedValues.includes('subscribe_marketing' as T);
      const privacyAcceptedChecked = currentSelectedValues.includes('privacy_policy_accepted' as T);

      if (marketingSubChecked && !privacyAcceptedChecked) {
        anomalies.push('Potential anomaly: Marketing subscription selected without privacy policy acceptance.');
      }
      if (currentSelectedValues.length > currentOptions.length / 2 && currentOptions.some(opt => opt.label.toLowerCase().includes('beta') && opt.checked)) {
        anomalies.push('Unusual number of features selected, including a beta feature. Confirm user intent.');
      }

      return {
        suggestions: anomalies,
        message: anomalies.length > 0 ? 'AI detected potential anomalies in selections.' : 'No anomalies detected.',
        confidenceScore: anomalies.length > 0 ? 0.90 : 0.99,
      };
    }

    // Basic heuristic simulation for 'generate_descriptions'
    if (taskType === 'generate_descriptions') {
      const describedOptions = currentOptions.map(opt => ({
        ...deepCloneCheckboxOption(opt),
        description: opt.description || `This option allows you to manage settings related to: ${opt.label}. (AI-generated)`,
        meta: { ...opt.meta, aiGeneratedDescription: true },
      }));
      return {
        suggestions: describedOptions,
        message: 'AI generated descriptions for all checkbox options.',
        confidenceScore: 0.70,
      };
    }


    return {
      suggestions: [],
      message: 'AI simulation for the given task type is not implemented or recognized.',
      confidenceScore: 0.1,
      error: 'Unsupported taskType for simulation.',
    };

  } catch (error: any) {
    console.error('Simulated Gemini AI call failed:', error);
    return {
      suggestions: [],
      message: 'Failed to process AI request due to an internal simulation error.',
      confidenceScore: 0,
      error: error.message || 'Unknown simulation error',
    };
  }
};

/**
 * An advanced service class for managing complex checkbox group interactions,
 * including integration with the simulated Gemini AI for enhanced features.
 * This class demonstrates best practices for encapsulating state and logic.
 * @template T The type of the value associated with the checkbox.
 */
export class CheckboxGroupManager<T = string | number | boolean> {
  private _groupState: CheckboxGroupState<T>;
  private readonly _groupId: string;
  private readonly _conflictRules: CheckboxConflictRule<T>[];
  private readonly _validationRules: ((options: CheckboxOption<T>[]) => string | null)[];
  private _userId?: string;

  /**
   * Constructs a new CheckboxGroupManager instance.
   * @param groupId A unique identifier for this checkbox group.
   * @param initialOptions An array of initial checkbox options.
   * @param groupLabel Optional label for the group.
   * @param groupDescription Optional description for the group.
   * @param conflictRules Optional array of conflict rules.
   * @param validationRules Optional array of custom validation functions.
   * @param userId Optional user ID for logging/personalization.
   */
  constructor(
    groupId: string,
    initialOptions: Partial<CheckboxOption<T>>[],
    groupLabel?: string,
    groupDescription?: string,
    conflictRules: CheckboxConflictRule<T>[] = [],
    validationRules: ((options: CheckboxOption<T>[]) => string | null)[] = [],
    userId?: string,
  ) {
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('CheckboxGroupManager requires a valid groupId string.');
    }
    this._groupId = groupId;
    this._userId = userId;
    this._conflictRules = conflictRules;
    this._validationRules = validationRules;
    const initializedOptions = initializeCheckboxOptions(initialOptions);
    this._groupState = getCheckboxGroupState(initializedOptions, groupLabel, groupDescription);
    this.revalidateGroup(); // Perform initial validation
    console.log(`CheckboxGroupManager for group "${this._groupId}" initialized.`);
  }

  /**
   * Gets the current immutable state of the checkbox group.
   * @returns A deep clone of the current `CheckboxGroupState<T>`.
   */
  public get state(): CheckboxGroupState<T> {
    return deepCloneCheckboxOption(this._groupState) as CheckboxGroupState<T>; // Deep clone to ensure immutability
  }

  /**
   * Gets the unique ID of this checkbox group.
   * @returns The group ID.
   */
  public get groupId(): string {
    return this._groupId;
  }

  /**
   * Sets the current user ID for logging and personalization.
   * @param userId The new user ID.
   */
  public setUserId(userId: string): void {
    this._userId = userId;
  }

  /**
   * Updates the checked state of a single checkbox within the group.
   * @param value The value of the checkbox to update.
   * @param checked The new checked state (true/false).
   */
  public updateOption(value: T, checked: boolean): void {
    const updatedOptions = updateCheckboxState(this._groupState.options, value, checked, this._userId);
    this.setNewState(updatedOptions);
  }

  /**
   * Toggles the checked state of all checkboxes in the group.
   * @param forceState Optional boolean to force all checkboxes to a specific state.
   */
  public toggleAll(forceState?: boolean): void {
    const updatedOptions = toggleAllCheckboxes(this._groupState.options, forceState, this._userId);
    this.setNewState(updatedOptions);
  }

  /**
   * Applies user preferences to the current checkbox options.
   * @param preferences An array of `UserCheckboxPreference<T>`.
   */
  public applyPreferences(preferences: UserCheckboxPreference<T>[]): void {
    const updatedOptions = applyUserPreferences(this._groupState.options, preferences);
    this.setNewState(updatedOptions);
    console.log(`Preferences applied to group "${this._groupId}".`);
  }

  /**
   * Creates a snapshot of the current state of checkboxes as user preferences.
   * @returns An array of `UserCheckboxPreference<T>`.
   */
  public createPreferencesSnapshot(): UserCheckboxPreference<T>[] {
    return createUserPreferencesSnapshot(this._groupState.options, 'manager_snapshot');
  }

  /**
   * Serializes the current group state into a string.
   * @returns A JSON string representing the minimal state.
   */
  public serializeState(): string {
    return serializeCheckboxGroupState(this._groupState);
  }

  /**
   * Deserializes a string into a group state, merging with current base options.
   * @param serializedState The string to deserialize.
   */
  public deserializeState(serializedState: string): void {
    try {
      const reconstructedState = deserializeCheckboxGroupState(
        serializedState,
        this._groupState.options, // Use current options as base
        this._groupState.groupLabel,
        this._groupState.groupDescription,
      );
      this._groupState = reconstructedState;
      this.revalidateGroup();
      console.log(`State for group "${this._groupId}" deserialized successfully.`);
    } catch (e) {
      console.error(`Failed to deserialize state for group "${this._groupId}":`, e);
      // Optionally, revert to previous state or log a critical error.
    }
  }

  /**
   * Triggers a re-validation of the entire checkbox group.
   * Updates `errorMessage` in the state if conflicts or validation issues are found.
   */
  public revalidateGroup(): void {
    let errors: string[] = [];

    // Run custom validation rules
    const validationErrors = validateCheckboxGroup(this._groupState.options, this._validationRules);
    errors = errors.concat(validationErrors);

    // Check for conflicts
    const conflictResults = detectCheckboxConflicts(
      this._groupState.selectedValues,
      this._groupState.options,
      this._conflictRules,
    );
    conflictResults.filter(c => c.severity === 'error').forEach(c => errors.push(c.message));

    // Consolidate messages. In a real UI, you might show multiple errors.
    this._groupState.errorMessage = errors.length > 0 ? errors.join('; ') : undefined;
    if (errors.length > 0) {
      console.warn(`Validation/Conflict errors for group "${this._groupId}":`, errors);
    }
  }

  /**
   * Internal method to update the state and re-calculate derived properties.
   * @param newOptions The updated array of checkbox options.
   */
  private setNewState(newOptions: CheckboxOption<T>[]): void {
    this._groupState = getCheckboxGroupState(
      newOptions,
      this._groupState.groupLabel,
      this._groupState.groupDescription,
    );
    this.revalidateGroup(); // Revalidate whenever state changes
    console.debug(`State updated for group "${this._groupId}". New selected values:`, this._groupState.selectedValues);
  }

  // --- Gemini AI Integration Methods (Simulated) ---

  /**
   * Requests Gemini AI to predict optimal checkbox selections for this group
   * based on context and user history.
   * The manager will apply the suggestions if confidence is high.
   * @param context A descriptive string for the AI to understand the current situation.
   * @param userProfile Optional user profile data for personalization.
   * @returns A Promise resolving to the AI's response.
   */
  public async suggestSelectionsWithGemini(
    context: string,
    userProfile?: Record<string, any>,
  ): Promise<GeminiCheckboxSuggestionResponse> {
    console.log(`Requesting AI selection suggestions for group "${this._groupId}"...`);
    const request: GeminiCheckboxSuggestionRequest = {
      context,
      currentOptions: this._groupState.options,
      userActivityHistory: interactionLog.filter(log => log.userId === this._userId),
      userProfile,
      taskType: 'predict_selection',
    };

    const response = await simulateGeminiPredictCheckboxSelection<T>(request);

    if (response.suggestions && Array.isArray(response.suggestions) && response.confidenceScore && response.confidenceScore > 0.6) {
      // Apply AI suggestions if confidence is high enough
      const suggestedOptions = response.suggestions as CheckboxOption<T>[];
      const updatedOptions = this._groupState.options.map(currentOpt => {
        const suggestedOpt = suggestedOptions.find(sOpt => sOpt.value === currentOpt.value);
        if (suggestedOpt && suggestedOpt.checked !== currentOpt.checked) {
          // Log AI-driven change
          recordInteraction({
            eventType: 'ai_suggested_change',
            targetId: currentOpt.id || String(currentOpt.value),
            newState: suggestedOpt.checked,
            userId: this._userId,
            context: { aiConfidence: response.confidenceScore, originalChecked: currentOpt.checked },
          });
          return { ...deepCloneCheckboxOption(currentOpt), checked: suggestedOpt.checked };
        }
        return deepCloneCheckboxOption(currentOpt);
      });
      this.setNewState(updatedOptions);
      console.info(`AI suggestions applied for group "${this._groupId}" with confidence ${response.confidenceScore}.`);
    } else {
      console.warn(`AI suggestion for group "${this._groupId}" not applied due to low confidence or no valid suggestions.`);
    }

    return response;
  }

  /**
   * Requests Gemini AI to optimize the display order of checkboxes in this group
   * based on predicted user engagement or other criteria.
   * @param userProfile Optional user profile data for personalization.
   * @returns A Promise resolving to the AI's response.
   */
  public async optimizeOrderWithGemini(
    userProfile?: Record<string, any>,
  ): Promise<GeminiCheckboxSuggestionResponse> {
    console.log(`Requesting AI to optimize checkbox order for group "${this._groupId}"...`);
    const request: GeminiCheckboxSuggestionRequest = {
      context: `Optimize order for user ${this._userId || 'guest'} in group ${this._groupId}.`,
      currentOptions: this._groupState.options,
      userActivityHistory: interactionLog.filter(log => log.userId === this._userId),
      userProfile,
      taskType: 'optimize_order',
    };

    const response = await simulateGeminiPredictCheckboxSelection<T>(request);

    if (response.suggestions && Array.isArray(response.suggestions) && response.confidenceScore && response.confidenceScore > 0.7) {
      const optimizedOptions = response.suggestions as CheckboxOption<T>[];
      // We need to ensure original checked states are maintained while applying new order
      const currentCheckedMap = new Map<T, boolean>();
      this._groupState.options.forEach(opt => currentCheckedMap.set(opt.value, opt.checked));

      const reorderedWithOptions = optimizedOptions.map(opt => ({
        ...deepCloneCheckboxOption(opt),
        checked: currentCheckedMap.get(opt.value) ?? opt.checked, // Retain original checked state
        meta: { ...opt.meta, aiOptimizedOrder: true },
      }));

      this.setNewState(reorderedWithOptions);
      console.info(`AI optimized order applied for group "${this._groupId}" with confidence ${response.confidenceScore}.`);
    } else {
      console.warn(`AI order optimization for group "${this._groupId}" not applied.`);
    }

    return response;
  }

  /**
   * Requests Gemini AI to generate or enhance labels and descriptions for checkboxes.
   * @param theme An optional theme or context for label generation (e.g., 'e-commerce', 'legal').
   * @returns A Promise resolving to the AI's response.
   */
  public async generateLabelsWithGemini(
    theme?: string,
  ): Promise<GeminiCheckboxSuggestionResponse> {
    console.log(`Requesting AI to generate/enhance labels for group "${this._groupId}"...`);
    const request: GeminiCheckboxSuggestionRequest = {
      context: `Generate or enhance labels/descriptions for checkbox group: ${this._groupState.groupLabel || this._groupId}. Theme: ${theme || 'general'}`,
      currentOptions: this._groupState.options,
      userActivityHistory: [], // Label generation might not need user history
      taskType: 'suggest_labels',
      taskParams: { theme },
    };

    const response = await simulateGeminiPredictCheckboxSelection<T>(request);

    if (response.suggestions && Array.isArray(response.suggestions) && response.confidenceScore && response.confidenceScore > 0.6) {
      const suggestedOptions = response.suggestions as CheckboxOption<T>[];
      const updatedOptions = this._groupState.options.map(currentOpt => {
        const suggestedOpt = suggestedOptions.find(sOpt => sOpt.value === currentOpt.value);
        if (suggestedOpt) {
          return {
            ...deepCloneCheckboxOption(currentOpt),
            label: suggestedOpt.label,
            description: suggestedOpt.description || currentOpt.description,
            meta: { ...currentOpt.meta, aiEnhancedLabel: true },
          };
        }
        return deepCloneCheckboxOption(currentOpt);
      });
      this.setNewState(updatedOptions);
      console.info(`AI generated labels/descriptions applied for group "${this._groupId}" with confidence ${response.confidenceScore}.`);
    } else {
      console.warn(`AI label generation for group "${this._groupId}" not applied.`);
    }

    return response;
  }

  /**
   * Requests Gemini AI to detect potential anomalies or inconsistencies in the current selections.
   * @returns A Promise resolving to the AI's response.
   */
  public async detectAnomaliesWithGemini(): Promise<GeminiCheckboxSuggestionResponse> {
    console.log(`Requesting AI to detect anomalies in group "${this._groupId}" selections...`);
    const request: GeminiCheckboxSuggestionRequest = {
      context: `Analyze current selections in group ${this._groupId} for anomalies.`,
      currentOptions: this._groupState.options,
      userActivityHistory: interactionLog.filter(log => log.userId === this._userId),
      taskType: 'detect_anomalies',
    };

    const response = await simulateGeminiPredictCheckboxSelection<T>(request);

    if (response.suggestions && Array.isArray(response.suggestions) && response.suggestions.length > 0 && response.confidenceScore && response.confidenceScore > 0.8) {
      console.warn(`AI detected anomalies in group "${this._groupId}":`, response.suggestions);
      this._groupState.errorMessage = (this._groupState.errorMessage ? this._groupState.errorMessage + '; ' : '') + `AI Anomaly: ${response.suggestions.join(', ')}`;
    } else if (response.confidenceScore && response.confidenceScore > 0.8) {
      console.info(`AI confirmed no anomalies detected in group "${this._groupId}".`);
    } else {
      console.warn(`AI anomaly detection for group "${this._groupId}" inconclusive.`);
    }

    return response;
  }
}

// --- Global Utility Wrappers & Additional Exports ---

/**
 * Provides a highly debounced function for scenarios where rapid checkbox changes
 * should only trigger a single action after a pause (e.g., saving preferences to backend).
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds (default: 500ms).
 * @returns A debounced function.
 */
export const debounceCheckboxAction = (func: Function, delay: number = 500) => debounce(func, delay);

/**
 * Provides a throttled function for scenarios where checkbox changes should
 * not trigger actions more frequently than a specified interval (e.g., analytics events).
 * @param func The function to throttle.
 * @param limit The throttle limit in milliseconds (default: 200ms).
 * @returns A throttled function.
 */
export const throttleCheckboxAction = (func: Function, limit: number = 200) => throttle(func, limit);

/**
 * Clears the in-memory interaction log. Useful for testing or privacy concerns.
 */
export const clearInteractionLog = (): void => {
  interactionLog.length = 0; // Clears the array
  console.info('Checkbox interaction log cleared.');
};

/**
 * Retrieves the current in-memory interaction log.
 * @returns A copy of the current `UserActivityLog` array.
 */
export const getInteractionLog = (): UserActivityLog[] => {
  return [...interactionLog]; // Return a copy to prevent external modification
};

/**
 * Exports the CheckboxOption type for external use.
 */
export type { CheckboxOption };

/**
 * Exports the CheckboxGroupState type for external use.
 */
export type { CheckboxGroupState };

/**
 * Exports the UserCheckboxPreference type for external use.
 */
export type { UserCheckboxPreference };

/**
 * Exports the UserCheckboxPreferences type for external use.
 */
export type { UserCheckboxPreferences };

/**
 * Exports the CheckboxConflictRule type for external use.
 */
export type { CheckboxConflictRule };

/**
 * Exports the UserActivityLog type for external use.
 */
export type { UserActivityLog };

/**
 * Exports the GeminiCheckboxSuggestionRequest type for external use.
 */
export type { GeminiCheckboxSuggestionRequest };

/**
 * Exports the GeminiCheckboxSuggestionResponse type for external use.
 */
export type { GeminiCheckboxSuggestionResponse };