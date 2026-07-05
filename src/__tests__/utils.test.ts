import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('merges tailwind classes (later overrides)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('merges tailwind classes with array input', () => {
    expect(cn(['p-4', 'm-2'], 'p-2')).toBe('m-2 p-2');
  });
});
