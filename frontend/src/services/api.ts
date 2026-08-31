export interface OverviewMetrics {
  totalContributors: number;
  firstTimeContributors: number;
  returningContributors: number;
  retentionRate: string;
}

export interface OnboardingBreakdown {
  documentationClarity: number;
  responseTime: number;
  issueAccessibility: number;
  prExperience: number;
}

export interface OnboardingScore {
  total: number;
  breakdown: OnboardingBreakdown;
}

export interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  text: string;
}

export interface AIAnalysis {
  frictionPoints: string[];
  recommendations: Recommendation[];
}

export interface Prediction {
  author: string;
  mergeTimeHours: number;
  willReturn: boolean;
  probability: number;
}

export interface MLFeatures {
  onboardingScore: OnboardingScore;
  aiAnalysis: AIAnalysis;
  recentPredictions: Prediction[];
}

export interface DashboardData {
  repository: string;
  overviewMetrics: OverviewMetrics;
  mlFeatures: MLFeatures;
}

export const fetchDashboardData = async (): Promise<DashboardData | null> => {
  try {
    const response = await fetch('/mockData.json');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Error fetching ML data:", error);
    return null;
  }
};
