import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AppSettings, WorkoutSession, WorkoutTemplate } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
  vibrationEnabled: true,
  weightKg: 70,
  preparationSeconds: 5,
};

const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tabata',
    name: 'Tabata Classic',
    exercises: [
      { id: 'e1', name: 'Burpees' },
      { id: 'e2', name: 'Jump Squats' },
    ],
    rounds: 8,
    workSeconds: 20,
    restSeconds: 10,
    restBetweenRoundsSeconds: 0,
    metValue: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hiit-basic',
    name: 'HIIT Basics',
    exercises: [
      { id: 'e3', name: 'High Knees' },
      { id: 'e4', name: 'Push-Ups' },
      { id: 'e5', name: 'Mountain Climbers' },
    ],
    rounds: 6,
    workSeconds: 40,
    restSeconds: 20,
    restBetweenRoundsSeconds: 60,
    metValue: 9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'endurance',
    name: 'Endurance Burn',
    exercises: [
      { id: 'e6', name: 'Box Jumps' },
      { id: 'e7', name: 'Kettlebell Swings' },
      { id: 'e8', name: 'Battle Ropes' },
      { id: 'e9', name: 'Plank Hold' },
    ],
    rounds: 4,
    workSeconds: 45,
    restSeconds: 15,
    restBetweenRoundsSeconds: 90,
    metValue: 11,
    createdAt: new Date().toISOString(),
  },
];

interface AppContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  templates: WorkoutTemplate[];
  addTemplate: (t: WorkoutTemplate) => void;
  updateTemplate: (id: string, partial: Partial<WorkoutTemplate>) => void;
  deleteTemplate: (id: string) => void;
  history: WorkoutSession[];
  addSession: (s: WorkoutSession) => void;
  deleteSession: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadLS('burn:settings', DEFAULT_SETTINGS)
  );
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() =>
    loadLS('burn:templates', DEFAULT_TEMPLATES)
  );
  const [history, setHistory] = useState<WorkoutSession[]>(() =>
    loadLS('burn:history', [])
  );

  useEffect(() => {
    localStorage.setItem('burn:settings', JSON.stringify(settings));
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('burn:templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('burn:history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  }, []);

  const addTemplate = useCallback((t: WorkoutTemplate) => {
    setTemplates((prev) => [...prev, t]);
  }, []);

  const updateTemplate = useCallback((id: string, partial: Partial<WorkoutTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...partial } : t)));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addSession = useCallback((s: WorkoutSession) => {
    setHistory((prev) => [s, ...prev]);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        history,
        addSession,
        deleteSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
