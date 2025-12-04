// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlobalStateProvider, useAppContext } from './GlobalStateContext';

const TestComponent = () => {
  const { state, dispatch } = useAppContext();
  return (
    <div>
      <div data-testid="view-type">{state.viewType}</div>
      <button onClick={() => dispatch({ type: 'LAUNCH_FEATURE', payload: { featureId: 'test-feature' } })}>
        Launch Feature
      </button>
      <div data-testid="launch-request">{state.launchRequest?.featureId}</div>
    </div>
  );
};

describe('GlobalStateContext', () => {
  it('should provide initial state', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );
    expect(screen.getByTestId('view-type').textContent).toBe('grid');
  });

  it('should update state when an action is dispatched', () => {
    render(
      <GlobalStateProvider>
        <TestComponent />
      </GlobalStateProvider>
    );

    act(() => {
      screen.getByText('Launch Feature').click();
    });

    expect(screen.getByTestId('launch-request').textContent).toBe('test-feature');
  });
});
