
export enum ReportCategory {
  SAFETY = 'Safety Concern',
  LOST_FOUND = 'Lost & Found',
  INFRASTRUCTURE = 'Infrastructure',
  SUSPICIOUS = 'Suspicious Activity',
  COMMUNITY = 'Community Event',
  OTHER = 'Other'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: Severity;
  location: string;
  timestamp: number;
  votes: number;
  status: 'Open' | 'Investigating' | 'Resolved';
  author: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
