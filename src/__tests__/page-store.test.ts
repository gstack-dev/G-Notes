import { describe, it, expect, beforeEach } from 'vitest';
import { usePageStore } from '@/shared/page-store';

describe('page-store', () => {
  beforeEach(() => {
    usePageStore.setState({ activePage: 'dashboard', categoryFilter: null });
  });

  it('starts on dashboard', () => {
    expect(usePageStore.getState().activePage).toBe('dashboard');
  });

  it('navigates to notes page', () => {
    usePageStore.getState().setActivePage('notes');
    expect(usePageStore.getState().activePage).toBe('notes');
  });

  it('navigates to categories page', () => {
    usePageStore.getState().setActivePage('categories');
    expect(usePageStore.getState().activePage).toBe('categories');
  });

  it('navigates to favorites page', () => {
    usePageStore.getState().setActivePage('favorites');
    expect(usePageStore.getState().activePage).toBe('favorites');
  });

  it('sets category filter', () => {
    usePageStore.getState().setCategoryFilter('Work');
    expect(usePageStore.getState().categoryFilter).toBe('Work');
  });

  it('clears category filter', () => {
    usePageStore.getState().setCategoryFilter('Work');
    usePageStore.getState().setCategoryFilter(null);
    expect(usePageStore.getState().categoryFilter).toBeNull();
  });

  it('starts with no category filter', () => {
    expect(usePageStore.getState().categoryFilter).toBeNull();
  });
});
