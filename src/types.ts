export interface Exercise {
  id: string;
  name: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  restBetweenRoundsSeconds: number;
  metValue: number;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  templateId?: string;
  name: string;
  date: string;
  durationSeconds: number;
  caloriesBurned: number;
  roundsCompleted: number;
  completed: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  weightKg: number;
  preparationSeconds: number;
}

export type TimerPhase = 'idle' | 'preparing' | 'working' | 'resting' | 'resting_between_rounds' | 'complete';
