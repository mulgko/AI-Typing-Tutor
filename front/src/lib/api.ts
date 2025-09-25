// API 클라이언트 라이브러리

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// 토큰 관리
export const tokenManager = {
  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },
  setToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  },
  removeToken: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  },
};

// API 요청 헬퍼
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = tokenManager.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// 타입 정의
export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    goal: {
      targetWPM: number;
      targetAccuracy: number;
    };
  };
  statistics: {
    totalTests: number;
    totalTimeSpent: number;
    bestWPM: number;
    bestAccuracy: number;
    averageWPM: number;
    averageAccuracy: number;
    streak: {
      current: number;
      longest: number;
    };
  };
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    notifications: {
      email: boolean;
      reminders: boolean;
    };
    typingSettings: {
      showKeyboard: boolean;
      playSounds: boolean;
      highlightErrors: boolean;
    };
  };
}

export interface TypingTest {
  _id: string;
  textContent: string;
  userInput: string;
  results: {
    wpm: number;
    accuracy: number;
    errors: number;
    timeElapsed: number;
    charactersTyped: number;
    wordsTyped: number;
  };
  analysis?: {
    typingPattern?: any;
    errorAnalysis?: any;
  };
  aiInsights?: {
    recommendations: string[];
    nextGoals: Array<{
      type: string;
      target: number;
      timeframe: string;
    }>;
  };
  testMode: "practice" | "test" | "challenge";
  createdAt: string;
  completedAt: string;
}

export interface TypingText {
  _id: string;
  title: string;
  content: string;
  metadata: {
    category: string;
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
    characterCount: number;
    wordCount: number;
  };
  statistics: {
    timesUsed: number;
    averageWPM: number;
    averageAccuracy: number;
    rating: number;
  };
}

// Auth API
export const authApi = {
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await apiClient.post<{
      message: string;
      user: User;
      token: string;
    }>("/auth/register", userData);

    tokenManager.setToken(response.token);
    return response;
  },

  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post<{
      message: string;
      user: User;
      token: string;
    }>("/auth/login", credentials);

    tokenManager.setToken(response.token);
    return response;
  },

  async getMe() {
    return apiClient.get<{ user: User }>("/auth/me");
  },

  async logout() {
    const response = await apiClient.post<{ message: string }>("/auth/logout");
    tokenManager.removeToken();
    return response;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return apiClient.put<{ message: string }>("/auth/change-password", data);
  },
};

// Typing API
export const typingApi = {
  async startTest(data: {
    textId?: string;
    textContent: string;
    testMode?: "practice" | "test" | "challenge";
  }) {
    return apiClient.post<{
      message: string;
      testId: string;
      test: Partial<TypingTest>;
    }>("/typing/test/start", data);
  },

  async completeTest(
    testId: string,
    data: {
      userInput: string;
      wpm: number;
      accuracy: number;
      timeElapsed: number;
      keystrokeData?: Array<{
        key: string;
        timestamp: number;
        correct: boolean;
        timeSinceLastKey: number;
      }>;
    }
  ) {
    return apiClient.post<{
      message: string;
      test: TypingTest;
      aiAnalysis?: any;
    }>(`/typing/test/${testId}/complete`, data);
  },

  async getTests(params?: {
    page?: number;
    limit?: number;
    testMode?: string;
  }) {
    const queryString = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return apiClient.get<{
      tests: TypingTest[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/typing/tests${queryString}`);
  },

  async getTest(testId: string) {
    return apiClient.get<{
      message: string;
      test: TypingTest;
    }>(`/typing/test/${testId}`);
  },

  async getTexts(params?: {
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryString = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return apiClient.get<{
      texts: TypingText[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/typing/texts${queryString}`);
  },

  async getText(textId: string) {
    return apiClient.get<{
      message: string;
      text: TypingText;
    }>(`/typing/text/${textId}`);
  },
};

// AI API
export const aiApi = {
  async generateText(options: {
    difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
    category?: string;
    length?: "short" | "medium" | "long";
    focusAreas?: string[];
  }) {
    return apiClient.post<{
      message: string;
      text: {
        _id: string;
        title: string;
        content: string;
        metadata: any;
      };
      aiMetadata: any;
    }>("/ai/generate-text", options);
  },

  async getRecommendedTexts() {
    return apiClient.get<{
      message: string;
      recommendations: Array<{
        type: string;
        recommendation: any;
        texts: TypingText[];
      }>;
      userProfile: any;
    }>("/ai/recommend-texts");
  },

  async analyzePerformance(data: {
    period?: "week" | "month" | "quarter" | "year";
  }) {
    return apiClient.post<{
      message: string;
      analysis: any;
      aiInsights: any;
      recommendations: string[];
    }>("/ai/analyze-performance", data);
  },

  async generateStudyPlan(data: {
    targetWPM?: number;
    targetAccuracy?: number;
    dailyMinutes?: number;
    weeks?: number;
  }) {
    return apiClient.post<{
      message: string;
      studyPlan: any;
      estimatedProgress: any;
    }>("/ai/generate-study-plan", data);
  },
};

// User API
export const userApi = {
  async getProfile() {
    return apiClient.get<{
      message: string;
      user: User;
    }>("/user/profile");
  },

  async updateProfile(data: {
    profile?: Partial<User["profile"]>;
    preferences?: Partial<User["preferences"]>;
  }) {
    return apiClient.put<{
      message: string;
      user: User;
    }>("/user/profile", data);
  },

  async getStatistics(period?: "week" | "month" | "quarter" | "year" | "all") {
    const queryString = period ? `?period=${period}` : "";
    return apiClient.get<{
      message: string;
      statistics: any;
    }>(`/user/statistics${queryString}`);
  },

  async checkLevelup() {
    return apiClient.post<{
      message: string;
      leveledUp: boolean;
      oldLevel: string;
      newLevel: string;
      currentStats: any;
      requirements: any;
      progress: any;
    }>("/user/check-levelup");
  },

  async getAchievements() {
    return apiClient.get<{
      message: string;
      achievements: Array<{
        id: string;
        title: string;
        description: string;
        completed: boolean;
        progress: number;
      }>;
      summary: {
        completed: number;
        total: number;
        percentage: number;
      };
    }>("/user/achievements");
  },

  async getLeaderboard(params?: {
    category?: "wpm" | "accuracy" | "tests" | "time";
    period?: "week" | "month" | "quarter" | "year" | "all";
    limit?: number;
  }) {
    const queryString = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return apiClient.get<{
      message: string;
      leaderboard: Array<{
        rank: number;
        username: string;
        level: string;
        value: number;
        joinDate: string;
      }>;
      userRank: number;
      category: string;
      period: string;
    }>(`/user/leaderboard${queryString}`);
  },
};

// Analytics API
export const analyticsApi = {
  async getDashboard(period?: "week" | "month" | "quarter" | "year") {
    const queryString = period ? `?period=${period}` : "";
    return apiClient.get<{
      message: string;
      dashboard: any;
    }>(`/analytics/dashboard${queryString}`);
  },

  async getPerformanceAnalysis(params?: {
    period?: "week" | "month" | "quarter" | "year";
    category?: string;
    granularity?: "daily" | "weekly" | "monthly";
  }) {
    const queryString = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return apiClient.get<{
      message: string;
      analysis: any;
      metadata: any;
    }>(`/analytics/performance${queryString}`);
  },

  async getLearningPatterns() {
    return apiClient.get<{
      message: string;
      patterns: any;
      insights: any;
    }>("/analytics/learning-patterns");
  },

  async getPredictions(params?: {
    targetWPM?: number;
    targetAccuracy?: number;
    timeframe?: number;
  }) {
    const queryString = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return apiClient.get<{
      message: string;
      predictions: any;
      assumptions: any;
    }>(`/analytics/predictions${queryString}`);
  },

  async getComparison(params?: {
    compareWith?: "users" | "self" | "level";
    period?: "week" | "month" | "quarter" | "year";
    metric?: "wpm" | "accuracy";
  }) {
    const queryString = params
      ? "?" + new URLSearchParams(params as any).toString()
      : "";
    return apiClient.get<{
      message: string;
      comparison: any;
      metadata: any;
    }>(`/analytics/compare${queryString}`);
  },

  async getRecommendations() {
    return apiClient.get<{
      message: string;
      recommendations: any;
      basedOn: any;
    }>("/analytics/recommendations");
  },
};

export default apiClient;
