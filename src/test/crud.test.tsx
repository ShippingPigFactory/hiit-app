import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AppProvider, useApp } from '../contexts/AppContext';
import type { WorkoutTemplate } from '../types';

// Wrapper that provides AppContext
function wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

// Helper to build a minimal WorkoutTemplate
function makeTemplate(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: 'test-1',
    name: 'Test Workout',
    exercises: [{ id: 'ex-1', name: 'Push-Ups' }],
    rounds: 3,
    workSeconds: 30,
    restSeconds: 15,
    restBetweenRoundsSeconds: 30,
    metValue: 8,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Default template IDs seeded by AppContext
const DEFAULT_IDS = ['tabata', 'hiit-basic', 'endurance'];

beforeEach(() => {
  // Clear localStorage so each test starts from DEFAULT_TEMPLATES
  localStorage.clear();
});

describe('AppContext CRUD — WorkoutTemplate', () => {
  // ------------------------------------------------------------------
  // READ: default templates are present on first load
  // ------------------------------------------------------------------
  it('READ: renders default templates when localStorage is empty', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.templates).toHaveLength(3);
    expect(result.current.templates.map((t) => t.id)).toEqual(
      expect.arrayContaining(DEFAULT_IDS),
    );
  });

  // ------------------------------------------------------------------
  // CREATE: addTemplate appends a new template
  // ------------------------------------------------------------------
  it('CREATE: addTemplate adds a new template to the list', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const newTemplate = makeTemplate({ id: 'custom-1', name: 'My Custom Workout' });

    act(() => {
      result.current.addTemplate(newTemplate);
    });

    expect(result.current.templates).toHaveLength(4);
    const added = result.current.templates.find((t) => t.id === 'custom-1');
    expect(added).toBeDefined();
    expect(added?.name).toBe('My Custom Workout');
  });

  // ------------------------------------------------------------------
  // UPDATE: updateTemplate modifies an existing template by id
  // ------------------------------------------------------------------
  it('UPDATE: updateTemplate modifies name and rounds of an existing template', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.updateTemplate('tabata', { name: 'Tabata Modified', rounds: 12 });
    });

    const updated = result.current.templates.find((t) => t.id === 'tabata');
    expect(updated).toBeDefined();
    expect(updated?.name).toBe('Tabata Modified');
    expect(updated?.rounds).toBe(12);
    // Other fields should remain unchanged
    expect(updated?.workSeconds).toBe(20);
    expect(updated?.restSeconds).toBe(10);
  });

  // ------------------------------------------------------------------
  // DELETE: deleteTemplate removes a template by id
  // ------------------------------------------------------------------
  it('DELETE: deleteTemplate removes the template with the given id', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.templates.find((t) => t.id === 'hiit-basic')).toBeDefined();

    act(() => {
      result.current.deleteTemplate('hiit-basic');
    });

    expect(result.current.templates).toHaveLength(2);
    expect(result.current.templates.find((t) => t.id === 'hiit-basic')).toBeUndefined();
  });

  // ------------------------------------------------------------------
  // localStorage persistence: changes are saved to localStorage
  // ------------------------------------------------------------------
  it('PERSISTENCE: addTemplate saves updated list to localStorage', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const newTemplate = makeTemplate({ id: 'persisted-1', name: 'Persisted Workout' });

    act(() => {
      result.current.addTemplate(newTemplate);
    });

    const stored = JSON.parse(localStorage.getItem('burn:templates') ?? '[]') as WorkoutTemplate[];
    const found = stored.find((t) => t.id === 'persisted-1');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Persisted Workout');
  });

  it('PERSISTENCE: deleteTemplate removes the entry from localStorage', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.deleteTemplate('endurance');
    });

    const stored = JSON.parse(localStorage.getItem('burn:templates') ?? '[]') as WorkoutTemplate[];
    expect(stored.find((t) => t.id === 'endurance')).toBeUndefined();
    expect(stored).toHaveLength(2);
  });

  it('PERSISTENCE: data is loaded from localStorage on mount', () => {
    // Pre-seed localStorage with a custom set of templates
    const savedTemplates: WorkoutTemplate[] = [
      makeTemplate({ id: 'from-storage', name: 'Loaded From Storage' }),
    ];
    localStorage.setItem('burn:templates', JSON.stringify(savedTemplates));

    const { result } = renderHook(() => useApp(), { wrapper });

    // Should load the saved template instead of the 3 defaults
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].id).toBe('from-storage');
    expect(result.current.templates[0].name).toBe('Loaded From Storage');
  });
});
