import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { usePlayback } from './usePlayback';

describe('usePlayback', () => {
  test('clamps next/previous within bounds and resets', () => {
    const { result } = renderHook(() => usePlayback(3));
    expect(result.current.stepIndex).toBe(0);

    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next()); // would exceed; clamps at 2
    expect(result.current.stepIndex).toBe(2);

    act(() => result.current.reset());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });
});
