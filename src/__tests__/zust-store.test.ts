import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotesStore } from '@/shared/zust-store';

const mockNote = {
  id: 'test-1',
  title: 'Test Note',
  content: '{}',
  tag: 'General',
  createdAt: 1000,
  updatedAt: 1000,
};

describe('zust-store (notes)', () => {
  beforeEach(() => {
    useNotesStore.setState({
      notes: [],
      activeNoteId: null,
      initialized: false,
      showOnboarding: false,
    });
  });

  it('starts empty', () => {
    const state = useNotesStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.activeNoteId).toBeNull();
    expect(state.initialized).toBe(false);
  });

  it('sets initialized state', () => {
    useNotesStore.getState().setInitialized([mockNote], null);
    const state = useNotesStore.getState();
    expect(state.initialized).toBe(true);
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].title).toBe('Test Note');
  });

  it('sets active note', () => {
    useNotesStore.getState().setInitialized([mockNote], null);
    useNotesStore.getState().setActiveNote('test-1');
    expect(useNotesStore.getState().activeNoteId).toBe('test-1');
  });

  it('clears active note', () => {
    useNotesStore.getState().setInitialized([mockNote], 'test-1');
    useNotesStore.getState().setActiveNote(null);
    expect(useNotesStore.getState().activeNoteId).toBeNull();
  });

  it('adds a note', () => {
    const id = useNotesStore.getState().addNote({
      title: 'New Note',
      content: '{}',
      tag: 'Work',
    });
    const state = useNotesStore.getState();
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].title).toBe('New Note');
    expect(state.notes[0].tag).toBe('Work');
    expect(state.notes[0].id).toBe(id);
    expect(state.notes[0].createdAt).toBeDefined();
  });

  it('updates a note title', () => {
    useNotesStore.getState().setInitialized([mockNote], null);
    useNotesStore.getState().updateNote('test-1', { title: 'Updated Title' });
    expect(useNotesStore.getState().notes[0].title).toBe('Updated Title');
  });

  it('updates a note content', () => {
    useNotesStore.getState().setInitialized([mockNote], null);
    useNotesStore.getState().updateNote('test-1', { content: '{"key":"value"}' });
    expect(useNotesStore.getState().notes[0].content).toBe('{"key":"value"}');
  });

  it('deletes a note', () => {
    useNotesStore.getState().setInitialized([mockNote], null);
    useNotesStore.getState().deleteNote('test-1');
    expect(useNotesStore.getState().notes).toHaveLength(0);
  });

  it('toggles favorite', () => {
    useNotesStore.getState().setInitialized([{ ...mockNote, favorited: false }], null);
    useNotesStore.getState().toggleFavorite('test-1');
    expect(useNotesStore.getState().notes[0].favorited).toBe(true);
    useNotesStore.getState().toggleFavorite('test-1');
    expect(useNotesStore.getState().notes[0].favorited).toBe(false);
  });

  it('toggles pin', () => {
    useNotesStore.getState().setInitialized([{ ...mockNote, pinned: false }], null);
    useNotesStore.getState().togglePin('test-1');
    expect(useNotesStore.getState().notes[0].pinned).toBe(true);
    useNotesStore.getState().togglePin('test-1');
    expect(useNotesStore.getState().notes[0].pinned).toBe(false);
  });

  it('deletes notes by tag', () => {
    useNotesStore.getState().setInitialized([
      { ...mockNote, id: '1', tag: 'Work' },
      { ...mockNote, id: '2', tag: 'Personal' },
      { ...mockNote, id: '3', tag: 'Work' },
    ], null);
    useNotesStore.getState().deleteNotesByTag('Work');
    const state = useNotesStore.getState();
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].tag).toBe('Personal');
  });

  it('manages onboarding state', () => {
    expect(useNotesStore.getState().showOnboarding).toBe(false);
    useNotesStore.getState().setOnboardingNeeded(true);
    expect(useNotesStore.getState().showOnboarding).toBe(true);
  });
});
