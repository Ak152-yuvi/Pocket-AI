import {
  AuthResponse,
  User,
  UserProfile,
  HealthStatus,
  HomePlannerInput,
  HomePlannerResponse,
  PartyPlannerInput,
  PartyPlannerResponse,
  JewelryPlannerInput,
  JewelryPlannerResponse,
  OutfitAnalysisResponse,
  HistorySummaryItem,
  HistoryDetailResponse
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ps_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } else if (data.errors && Array.isArray(data.errors)) {
        errorDetail = data.errors.join(', ');
      }
    } catch {
      // Use fallback error message
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Health
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthStatus>(res);
  },

  // Auth
  async register(data: { name: string; email: string; password: string; confirm_password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<User>(res);
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    } catch {
      // Continue client cleanup even if request fails
    }
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_user');
  },

  // Planners
  async generateHomePlan(data: HomePlannerInput): Promise<HomePlannerResponse> {
    const res = await fetch(`${API_BASE}/generate-home`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<HomePlannerResponse>(res);
  },

  async generatePartyPlan(data: PartyPlannerInput): Promise<PartyPlannerResponse> {
    const res = await fetch(`${API_BASE}/generate-party`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<PartyPlannerResponse>(res);
  },

  async generateJewelryPlan(data: JewelryPlannerInput): Promise<JewelryPlannerResponse> {
    const res = await fetch(`${API_BASE}/generate-jewelry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<JewelryPlannerResponse>(res);
  },

  async analyzeOutfit(file: File): Promise<OutfitAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/analyze-outfit`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    return handleResponse<OutfitAnalysisResponse>(res);
  },

  // History
  async getHistory(): Promise<HistorySummaryItem[]> {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<HistorySummaryItem[]>(res);
  },

  async getHistoryItem(id: number | string): Promise<HistoryDetailResponse> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<HistoryDetailResponse>(res);
  },

  async deleteHistory(id: number | string): Promise<{ message: string; id: number }> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string; id: number }>(res);
  },

  // User Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<UserProfile>(res);
  },

  async updateProfile(data: {
    name?: string;
    preferred_currency?: string;
    preferred_style?: string;
    preferred_language?: string;
  }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<UserProfile>(res);
  },
};
