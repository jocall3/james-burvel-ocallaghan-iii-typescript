// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AiCodeExplainer } from './AiCodeExplainer';
import * as services from '../../services/index';

vi.mock('../../services/index', async () => {
  const actual = await vi.importActual('../../services/index');
  return {
    ...actual,
    explainCodeStructured: vi.fn(),
  };
});

// FIX: Replaced type casting with `vi.mocked()` to correctly type the mocked function and resolve the 'vi' namespace error.
const mockExplainCodeStructured = vi.mocked(services.explainCodeStructured);

describe('AiCodeExplainer', () => {
  it('renders the component with example code', () => {
    render(<AiCodeExplainer />);
    expect(screen.getByText('AI Code Explainer')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/const bubbleSort/)).toBeInTheDocument();
  });

  it('calls the explain service when "Analyze Code" is clicked', async () => {
    mockExplainCodeStructured.mockResolvedValue({
        summary: 'This is a summary.',
        lineByLine: [],
        complexity: { time: 'O(n^2)', space: 'O(1)' },
        suggestions: [],
    });

    render(<AiCodeExplainer />);
    
    fireEvent.click(screen.getByText('Analyze Code'));

    await waitFor(() => {
        expect(services.explainCodeStructured).toHaveBeenCalled();
        expect(screen.getByText('This is a summary.')).toBeInTheDocument();
    });
  });
});
