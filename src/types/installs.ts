export interface InstallStep {
  step: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  tips: string[];
}

export interface TroubleshootingItem {
  problem: string;
  solution: string;
  severity: 'low' | 'medium' | 'high';
}
