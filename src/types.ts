export interface Subject {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface Session {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_color: string;
  duration: number;
  date: string;
  notes: string;
}

export interface Stat {
  name: string;
  total_duration: number;
  color: string;
}
