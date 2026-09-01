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

export interface PredictResponse {
  success: boolean;
  mergeTimeHours: number;
  willReturn: boolean;
  probability: number;
  riskLevel: string;
  message: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const fetchDashboardData = async (repo: string = 'expressjs/express'): Promise<DashboardData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard?repo=${encodeURIComponent(repo)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Backend API unavailable, falling back to mockData.json:", error);
    try {
      const mockResponse = await fetch('/mockData.json');
      if (!mockResponse.ok) throw new Error('Mock data response was not ok');
      return await mockResponse.json();
    } catch (fallbackError) {
      console.error("Error fetching fallback mock data:", fallbackError);
      return null;
    }
  }
};

export const predictRetention = async (mergeTimeHours: number, author?: string): Promise<PredictResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ml/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mergeTimeHours, author }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error triggering ML prediction:", error);
    return null;
  }
};
