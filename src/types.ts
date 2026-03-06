export type Unit = 'cm' | 'mm';

export type ThemeType = 'coffee' | 'matcha' | 'cosy' | 'sunset' | 'beton' | 'gold' | 'mint' | 'night';

export interface MarkingPoint {
  angle: number;
  position: number;
}

export interface CalculationResults {
  circumference: number;
  stepDistance: number;
  markingPoints: MarkingPoint[];
}

export interface TemplateData {
  diameter: number;
  circumference: number;
  points: number;
  unit: Unit;
}

export interface SavedState {
  d: string;
  p: number;
  u: Unit;
}
