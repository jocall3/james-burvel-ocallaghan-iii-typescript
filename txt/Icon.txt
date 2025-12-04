// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import {
  File,
  Folder,
  ChevronRight,
  Clock,
  HardDrive,
  Star,
  Trash2,
  List,
  Grid,
  Search,
  MoreVertical,
  ArrowDownUp,
  X,
  Sparkles,
  Loader2,
  AlertTriangle,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FolderPlus,
  Edit3,
  Share2,
  Info,
  Check,
  FolderOpen,
  Terminal,
  Save,
  BrainCircuit,
  MessageSquareQuote,
  LayoutDashboard,
} from 'lucide-react';

export const iconMap = {
  file: File,
  folder: Folder,
  folderOpen: FolderOpen,
  chevronRight: ChevronRight,
  clock: Clock,
  hardDrive: HardDrive,
  star: Star,
  trash: Trash2,
  list: List,
  grid: Grid,
  search: Search,
  more: MoreVertical,
  sort: ArrowDownUp,
  close: X,
  sparkles: Sparkles,
  loader: Loader2,
  warning: AlertTriangle,
  fileText: FileText,
  fileImage: FileImage,
  fileVideo: FileVideo,
  fileAudio: FileAudio,
  folderPlus: FolderPlus,
  rename: Edit3, // Maps 'rename' key to Lucide's Edit3 icon.
  share: Share2,
  info: Info,
  check: Check,
  terminal: Terminal,
  save: Save,
  brain: BrainCircuit,
  summary: MessageSquareQuote,
  dashboard: LayoutDashboard,
};

// --- New Features and Enhancements Below ---

/**
 * Defines standard semantic sizes for icons, mapping to pixel values.
 * This provides a consistent sizing scale across the application.
 */
export type IconSizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * A map of `IconSizePreset` keys to numerical pixel values.
 * This allows for easy configuration and extension of icon sizes.
 */
export const ICON_SIZE_MAP: Record<IconSizePreset, number> = {
  xs: 12, // Extra small
  sm: 16, // Small
  md: 20, // Medium (default size for `Icon` component)
  lg: 24, // Large
  xl: 32, // Extra large
  '2xl': 48, // Double extra large
};

/**
 * Defines semantic variants for icon coloring.
 * These variants are designed to correspond to utility classes available
 * in the project's CSS framework (e.g., Tailwind CSS) for easy theming.
 */
export type IconVariant =
  | 'default' // Standard icon color
  | 'primary' // Emphasized action color
  | 'secondary' // Less emphasized action color
  | 'success' // Positive indication color
  | 'danger' // Negative or critical indication color
  | 'warning' // Cautionary indication color
  | 'info' // Informational indication color
  | 'muted' // Subdued or less prominent color
  | 'brand' // Application-specific brand color
  | 'inherit'; // Inherit color from parent text (text-current)

/**
 * Helper function to generate CSS class names for icon coloring based on the `IconVariant`.
 * This function assumes the use of a utility-first CSS framework (like Tailwind CSS)
 * where classes such as `text-blue-600` are available for styling.
 *
 * @param variant The `IconVariant` to determine the color class for.
 * @returns A string containing the appropriate CSS class name.
 */
export function getIconColorClassName(variant: IconVariant): string {
  switch (variant) {
    case 'primary':
      return 'text-blue-600 dark:text-blue-400';
    case 'secondary':
      return 'text-gray-500 dark:text-gray-400';
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'danger':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'info':
      return 'text-sky-600 dark:text-sky-400';
    case 'brand':
        return 'text-indigo-600 dark:text-indigo-400'; // Example brand color, adjust as per design system
    case 'muted':
      return 'text-gray-400 dark:text-gray-500';
    case 'inherit':
        return 'text-current'; // Inherits the color from the parent element's text color
    case 'default':
    default:
      return 'text-gray-700 dark:text-gray-300'; // Default icon color for neutral elements
  }
}

type IconName = keyof typeof iconMap;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** The name of the icon to display, corresponding to a key in `iconMap`. */
  name: IconName;
  /**
   * The size of the icon. Can be an `IconSizePreset` ('xs', 'sm', 'md', 'lg', 'xl', '2xl'),
   * a number (interpreted as pixels), or a string (e.g., '1em', '24px').
   * Defaults to 'md' (20px).
   */
  size?: IconSizePreset | number | string;
  /**
   * The semantic variant of the icon, which determines its color.
   * Defaults to 'default'.
   */
  variant?: IconVariant;
  /**
   * Additional CSS class names to apply to the icon.
   * These classes will be merged with internal styling classes.
   */
  className?: string;
  /**
   * If `true`, applies a spinning animation to the icon.
   * This is typically used with the `loader` icon for visual feedback.
   */
  spin?: boolean;
  /**
   * An accessible title for the icon, which is read by screen readers.
   * Essential for conveying the icon's meaning to users with disabilities.
   * If provided, `aria-hidden` will be `false` by default.
   */
  title?: string;
  /**
   * An `aria-label` for the icon, providing an alternative text description.
   * Useful when the icon is clickable or stands alone without a visible text label.
   * If provided, `aria-hidden` will be `false` by default.
   */
  'aria-label'?: string;
  /**
   * A boolean indicating whether the icon is decorative and should be ignored by screen readers.
   * Set to `true` if the icon is purely visual and provides no semantic meaning.
   * Defaults to `true` if neither `title` nor `aria-label` are provided.
   */
  'aria-hidden'?: boolean;
}

/**
 * The `Icon` component provides a flexible and accessible way to display Lucide icons.
 * It integrates semantic sizing, coloring variants, and accessibility features.
 *
 * @param props The properties for the icon component.
 * @returns A React element rendering the specified Lucide icon.
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'md', // Default size preset
  variant = 'default',
  className = '',
  spin = false,
  title,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHiddenProp,
  ...props
}) => {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) {
    // Log a warning in development to indicate a missing icon mapping.
    // In production, consider returning a fallback UI or a generic error icon.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Icon "${name}" not found in iconMap. Please check the 'name' prop or add the icon to 'iconMap'.`);
    }
    return null; // Return nothing if the icon is not found
  }

  // Determine the actual size: convert preset string to number, otherwise use the provided value.
  const actualSize = typeof size === 'string' && size in ICON_SIZE_MAP
    ? ICON_SIZE_MAP[size as IconSizePreset]
    : size;

  // Generate CSS classes for color variant and spin animation.
  // The 'animate-spin' class is assumed to be provided by the CSS framework (e.g., Tailwind CSS).
  const variantClass = getIconColorClassName(variant);
  const spinClass = spin ? 'animate-spin' : '';
  const combinedClassName = [variantClass, spinClass, className].filter(Boolean).join(' ');

  // Determine the `aria-hidden` attribute value for accessibility.
  // By default, Lucide icons render `aria-hidden="true"` unless `title` or `aria-label` are passed.
  // We explicitly manage this based on the presence of `title` or `aria-label`,
  // or an explicit `ariaHiddenProp` override.
  const computedAriaHidden = ariaHiddenProp ?? (!title && !ariaLabel);

  return (
    <LucideIcon
      size={actualSize}
      className={combinedClassName}
      title={title}
      aria-label={ariaLabel}
      aria-hidden={computedAriaHidden}
      {...props}
    />
  );
};

export default Icon;

/**
 * A higher-order function that creates a specialized icon component with predefined properties.
 * This is useful for establishing consistent iconography throughout an application or
 * for reducing prop repetition in specific contexts.
 *
 * @template T The type of the icon name, ensuring it's a valid `IconName`.
 * @param defaultProps The default properties to apply to the `Icon` component.
 *                     These can still be overridden by props passed to the created component.
 * @returns A new React functional component that renders an `Icon` with the given defaults.
 *
 * @example
 * // Create a specific 'DangerTrashIcon' that is always red and large.
 * export const DangerTrashIcon = createThemedIcon({
 *   name: 'trash',
 *   variant: 'danger',
 *   size: 'lg',
 *   className: 'hover:opacity-80' // Add default hover effect
 * });
 *
 * // Usage in JSX: <DangerTrashIcon />
 * // You can still override default props: <DangerTrashIcon size="sm" className="opacity-50" />
 */
export function createThemedIcon<T extends IconName>(defaultProps: Omit<IconProps, 'name'> & { name: T }) {
    const ThemedIcon: React.FC<Partial<IconProps>> = (props) => {
      // Merge defaultProps with user-provided props, giving precedence to user props.
      // This ensures that user-defined properties always override the defaults.
      const mergedProps: IconProps = { ...defaultProps, ...props };
      return <Icon {...mergedProps} />;
    };
    // Assign a display name for easier debugging in React DevTools.
    ThemedIcon.displayName = `ThemedIcon(${String(defaultProps.name).charAt(0).toUpperCase() + String(defaultProps.name).slice(1)})`;
    return ThemedIcon;
}

/**
 * A utility component to display a stack of icons, useful for creating layered visuals
 * like an icon with a badge or overlay.
 * This component provides the basic container and requires its children (typically `Icon` components)
 * to be positioned using CSS (e.g., `absolute` positioning).
 *
 * @param props The properties for the icon stack component, including `children` and `className`.
 * @returns A React `div` element acting as a container for stacked icons.
 *
 * @example
 * // Example using available icons:
 * <IconStack className="relative w-8 h-8">
 *   <Icon name="folder" size="2xl" variant="secondary" className="absolute top-0 left-0" />
 *   <Icon name="sparkles" size="sm" variant="warning" className="absolute bottom-0 right-0 -mr-1 -mb-1" />
 * </IconStack>
 * // This example assumes 'w-8 h-8', 'absolute', 'top-0', 'left-0', 'bottom-0', 'right-0', '-mr-1', '-mb-1'
 * // are valid utility classes in the project's CSS framework (e.g., Tailwind CSS).
 */
export const IconStack: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    // Apply default `relative` positioning and flex properties to center children if no specific positioning.
    // The `className` prop allows users to override or extend these styles.
    const combinedClassName = `relative flex items-center justify-center ${className || ''}`;
    return (
      <div className={combinedClassName} {...props}>
        {children}
      </div>
    );
};