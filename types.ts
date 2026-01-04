
export type Language = 'en' | 'ml' | 'hi' | 'ta' | 'kn';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  schedule: string; // HH:mm format
  stock: number;
  lastTaken?: number;
}

export interface PatientNote {
  id: string;
  text: string;
  timestamp: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  medicines: Medicine[];
  notes: PatientNote[];
  createdAt: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'info';
  timestamp: number;
}

export type Page = 'dashboard' | 'patients' | 'workspace' | 'alerts';
