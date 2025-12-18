// src/components/tower-notebook/types.ts

export type TowerData = {
  id: string;
  name: string;
  ports: number;
};

export type GeneratedOutput = {
  id: string;
  type: 'study-guide' | 'faq' | 'timeline' | 'audio' | 'report' | 'visualization';
  title: string;
  date: string;
  status: 'completed' | 'generating';
  content?: string;
  documentType?: string;
  milestoneType?: string;
};
