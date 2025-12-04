// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesktopView } from './DesktopView';
import { GlobalStateProvider } from '../../contexts/GlobalStateContext';

// Mock child components as they have their own dependencies.
// We use data-testid attributes for robust querying in tests.
vi.mock('../LeftSidebar', () => ({
    LeftSidebar: () => <div data-testid="left-sidebar">Sidebar</div>
}));
vi.mock('./Taskbar', () => ({
    Taskbar: () => <div data-testid="taskbar">Taskbar</div>
}));
vi.mock('./FeatureDock', () => ({
    FeatureDock: () => <input data-testid="feature-dock" placeholder="Search all features..." />
}));

// Define a local interface matching what WindowComponent expects.
// This is done to provide type safety within the mock without adding new top-level imports.
interface MockWindowComponentProps {
    id: string;
    title: string;
    children: React.ReactNode;
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
    resizable: boolean;
    movable: boolean;
    isActive: boolean;
    zIndex: number;
    onFocus: (id: string) => void;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onUpdate: (id: string, updates: { x?: number, y?: number, width?: number, height?: number, zIndex?: number }) => void;
}

// Mock the actual window component that DesktopView would render.
// This allows us to test if DesktopView passes the correct props and handles callbacks.
vi.mock('./WindowComponent', () => ({
    WindowComponent: ({ id, title, children, zIndex, isActive, onFocus, onClose, onMinimize, onUpdate }: MockWindowComponentProps) => (
        <div data-testid={`window-${id}`} style={{ zIndex }} className={isActive ? 'active' : ''}>
            <div data-testid={`window-header-${id}`}>{title}</div>
            <button data-testid={`window-focus-btn-${id}`} onClick={() => onFocus(id)}>Focus</button>
            <button data-testid={`window-close-btn-${id}`} onClick={() => onClose(id)}>Close</button>
            <button data-testid={`window-minimize-btn-${id}`} onClick={() => onMinimize(id)}>Minimize</button>
            {/* Added a mock button to test onUpdate callback for completeness */}
            <button data-testid={`window-update-btn-${id}`} onClick={() => onUpdate(id, { x: 100, y: 100 })}>Update Pos</button>
            <div data-testid={`window-content-${id}`}>{children}</div>
        </div>
    )
}));

// Define the shape of a window object that DesktopView expects in its `windows` prop.
// This reflects the data DesktopView processes to render individual windows.
interface DesktopWindowData {
    id: string;
    title: string;
    icon: string;
    component: React.ComponentType; // The content component to be rendered inside the window frame
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
    resizable: boolean;
    movable: boolean;
    zIndex: number;
}

// Helper interface for rendering options with default values for better test readability and reusability.
interface RenderDesktopViewOptions {
    windows?: DesktopWindowData[];
    activeId?: string | null;
    onLaunch?: vi.Mock;
    onClose?: vi.Mock;
    onMinimize?: vi.Mock;
    onFocus?: vi.Mock;
    onUpdate?: vi.Mock;
}

/**
 * Renders the DesktopView component with optional props, wrapped in GlobalStateProvider.
 * Provides default mock functions for callbacks to simplify test setup.
 *
 * @param options - An object containing props to pass to DesktopView.
 * @returns The render result from @testing-library/react.
 */
export const renderDesktopViewWithDefaults = ({
    windows = [],
    activeId = null,
    onLaunch = vi.fn(),
    onClose = vi.fn(),
    onMinimize = vi.fn(),
    onFocus = vi.fn(),
    onUpdate = vi.fn(),
}: RenderDesktopViewOptions = {}) => {
    return render(
        <GlobalStateProvider>
            <DesktopView
                windows={windows}
                activeId={activeId}
                onLaunch={onLaunch}
                onClose={onClose}
                onMinimize={onMinimize}
                onFocus={onFocus}
                onUpdate={onUpdate}
            />
        </GlobalStateProvider>
    );
};

describe('DesktopView Component', () => {
    // Clear all mocks before each test to ensure test isolation and prevent side effects.
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Layout and Core Components Rendering', () => {
        it('renders the FeatureDock with correct placeholder text', () => {
            renderDesktopViewWithDefaults();
            expect(screen.getByTestId('feature-dock')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Search all features...')).toBeInTheDocument();
        });

        it('renders the LeftSidebar', () => {
            renderDesktopViewWithDefaults();
            expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
            expect(screen.getByText('Sidebar')).toBeInTheDocument();
        });

        it('renders the Taskbar', () => {
            renderDesktopViewWithDefaults();
            expect(screen.getByTestId('taskbar')).toBeInTheDocument();
            expect(screen.getByText('Taskbar')).toBeInTheDocument();
        });
    });

    describe('Window Management and Display', () => {
        // A simple mock component to use as window content
        const MockAppContent = () => <div data-testid="mock-app-content">Mock Application Content</div>;

        const mockWindow1: DesktopWindowData = {
            id: 'app-1',
            title: 'My First App',
            icon: 'icon1.png',
            component: MockAppContent,
            x: 10, y: 10, width: 300, height: 200,
            minimized: false, resizable: true, movable: true, zIndex: 1
        };

        const mockWindow2: DesktopWindowData = {
            id: 'app-2',
            title: 'Another App',
            icon: 'icon2.png',
            component: MockAppContent,
            x: 50, y: 50, width: 400, height: 300,
            minimized: false, resizable: true, movable: true, zIndex: 2
        };

        it('renders no windows when the windows array is empty', () => {
            renderDesktopViewWithDefaults({ windows: [] });
            expect(screen.queryByTestId(/window-/)).not.toBeInTheDocument();
        });

        it('renders a single active window with correct properties', () => {
            renderDesktopViewWithDefaults({ windows: [mockWindow1], activeId: 'app-1' });
            const windowElement = screen.getByTestId('window-app-1');
            expect(windowElement).toBeInTheDocument();
            expect(screen.getByTestId('window-header-app-1')).toHaveTextContent('My First App');
            expect(windowElement).toHaveClass('active');
            expect(windowElement).toHaveStyle(`z-index: ${mockWindow1.zIndex}`);
            expect(screen.getByTestId('window-content-app-1')).toContainElement(screen.getByTestId('mock-app-content'));
        });

        it('renders multiple windows, with only the active window having the "active" class', () => {
            renderDesktopViewWithDefaults({
                windows: [
                    { ...mockWindow1, zIndex: 10 },
                    { ...mockWindow2, zIndex: 20 }
                ],
                activeId: 'app-2'
            });

            const window1 = screen.getByTestId('window-app-1');
            const window2 = screen.getByTestId('window-app-2');

            expect(window1).toBeInTheDocument();
            expect(window2).toBeInTheDocument();

            expect(window1).not.toHaveClass('active');
            expect(window2).toHaveClass('active');

            expect(window1).toHaveStyle('z-index: 10');
            expect(window2).toHaveStyle('z-index: 20');
        });

        it('does not render windows that are minimized (assuming DesktopView filters them out visually)', () => {
            const minimizedWindow: DesktopWindowData = { ...mockWindow1, id: 'app-minimized', minimized: true };
            renderDesktopViewWithDefaults({ windows: [minimizedWindow], activeId: null });
            expect(screen.queryByTestId('window-app-minimized')).not.toBeInTheDocument();
            // Minimized windows are typically managed by the Taskbar, not rendered on the desktop itself.
        });

        it('renders the correct content component inside each window', () => {
            renderDesktopViewWithDefaults({ windows: [mockWindow1], activeId: 'app-1' });
            expect(screen.getByTestId('mock-app-content')).toBeInTheDocument();
            expect(screen.getByTestId('window-content-app-1')).toContainElement(screen.getByTestId('mock-app-content'));
        });
    });

    describe('Callback Functionality and User Interactions', () => {
        const MockAppContent = () => <div data-testid="mock-app-content-callbacks">App with Callbacks</div>;
        const mockInteractiveWindow: DesktopWindowData = {
            id: 'app-3',
            title: 'Test App with Callbacks',
            icon: 'icon3.png',
            component: MockAppContent,
            x: 10, y: 10, width: 300, height: 200,
            minimized: false, resizable: true, movable: true, zIndex: 1
        };

        it('calls onFocus when a window requests to be focused', () => {
            const mockOnFocus = vi.fn();
            renderDesktopViewWithDefaults({
                windows: [mockInteractiveWindow],
                activeId: null, // Ensure it's not active initially
                onFocus: mockOnFocus
            });

            const focusButton = screen.getByTestId('window-focus-btn-app-3');
            fireEvent.click(focusButton);
            expect(mockOnFocus).toHaveBeenCalledTimes(1);
            expect(mockOnFocus).toHaveBeenCalledWith('app-3');
        });

        it('calls onClose when a window requests to be closed', () => {
            const mockOnClose = vi.fn();
            renderDesktopViewWithDefaults({
                windows: [mockInteractiveWindow],
                activeId: 'app-3',
                onClose: mockOnClose
            });

            const closeButton = screen.getByTestId('window-close-btn-app-3');
            fireEvent.click(closeButton);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
            expect(mockOnClose).toHaveBeenCalledWith('app-3');
        });

        it('calls onMinimize when a window requests to be minimized', () => {
            const mockOnMinimize = vi.fn();
            renderDesktopViewWithDefaults({
                windows: [mockInteractiveWindow],
                activeId: 'app-3',
                onMinimize: mockOnMinimize
            });

            const minimizeButton = screen.getByTestId('window-minimize-btn-app-3');
            fireEvent.click(minimizeButton);
            expect(mockOnMinimize).toHaveBeenCalledTimes(1);
            expect(mockOnMinimize).toHaveBeenCalledWith('app-3');
        });

        it('calls onUpdate when a window requests to update its state (e.g., position/size)', () => {
            const mockOnUpdate = vi.fn();
            renderDesktopViewWithDefaults({
                windows: [mockInteractiveWindow],
                activeId: 'app-3',
                onUpdate: mockOnUpdate
            });

            const updateButton = screen.getByTestId('window-update-btn-app-3');
            fireEvent.click(updateButton);
            expect(mockOnUpdate).toHaveBeenCalledTimes(1);
            expect(mockOnUpdate).toHaveBeenCalledWith('app-3', { x: 100, y: 100 });
        });
    });

    describe('GlobalStateProvider Integration', () => {
        // This test ensures that DesktopView is correctly rendered within the GlobalStateProvider.
        // It's an integration check for the test setup and basic context provision.
        it('renders DesktopView within GlobalStateProvider without throwing errors', () => {
            expect(() => renderDesktopViewWithDefaults()).not.toThrow();
            // Re-verify a core component to ensure successful render within context
            expect(screen.getByTestId('feature-dock')).toBeInTheDocument();
        });
    });
});