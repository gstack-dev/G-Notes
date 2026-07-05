import { describe, it, expect, beforeEach } from 'vitest';
import { useCategoriesStore } from '@/shared/categories-store';

describe('categories-store', () => {
  beforeEach(() => {
    useCategoriesStore.setState({ categories: [], initialized: false });
  });

  it('starts empty', () => {
    const state = useCategoriesStore.getState();
    expect(state.categories).toEqual([]);
    expect(state.initialized).toBe(false);
  });

  it('sets initialized categories', () => {
    const cats = [
      { name: 'Work', createdAt: 1000 },
      { name: 'Personal', createdAt: 2000 },
    ];
    useCategoriesStore.getState().setInitialized(cats);
    const state = useCategoriesStore.getState();
    expect(state.initialized).toBe(true);
    expect(state.categories).toHaveLength(2);
    expect(state.categories[0].name).toBe('Work');
  });

  it('adds a category', () => {
    useCategoriesStore.getState().addCategory('Work');
    const state = useCategoriesStore.getState();
    expect(state.categories).toHaveLength(1);
    expect(state.categories[0].name).toBe('Work');
  });

  it('does not add duplicate categories', () => {
    useCategoriesStore.getState().addCategory('Work');
    useCategoriesStore.getState().addCategory('Work');
    expect(useCategoriesStore.getState().categories).toHaveLength(1);
  });

  it('removes a category', () => {
    useCategoriesStore.getState().addCategory('Work');
    useCategoriesStore.getState().addCategory('Personal');
    useCategoriesStore.getState().removeCategory('Work');
    const state = useCategoriesStore.getState();
    expect(state.categories).toHaveLength(1);
    expect(state.categories[0].name).toBe('Personal');
  });

  it('removing non-existent category does nothing', () => {
    useCategoriesStore.getState().addCategory('Work');
    useCategoriesStore.getState().removeCategory('NonExistent');
    expect(useCategoriesStore.getState().categories).toHaveLength(1);
  });
});
