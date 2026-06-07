import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from './App';

describe('App', () => {
  test('renders the lab with topic navigation and synchronized learning panels', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /DSA Visualizer Lab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bubble Sort/i })).toBeInTheDocument();
    expect(screen.getByText(/O\(1\) push/i)).toBeInTheDocument();
    expect(screen.getByText(/stack.push\(12\)/i)).toBeInTheDocument();
  });

  test('steps through a selected topic and resets to the first state', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Bubble Sort/i }));
    expect(screen.getByText(/Start bubble sort/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next step/i }));
    expect(screen.getByText(/Compare index 0 and 1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    expect(screen.getByText(/Start bubble sort/i)).toBeInTheDocument();
  });
});
