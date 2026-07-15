const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${res.status}`)
    }

    return res.json()
  }

  async login(email: string, password: string) {
    const data = await this.request<{ success: boolean; data: { token: string; user: any } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return data.data
  }

  async register(userData: { email: string; password: string; name: string }) {
    const data = await this.request<{ success: boolean; data: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, role: 'talent' }),
    })
    return data.data
  }

  async getMe() {
    const data = await this.request<{ success: boolean; data: any }>('/api/auth/me')
    return data.data
  }

  async listUsers(offset = 0, limit = 20, role?: string) {
    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    })
    if (role) params.set('role', role)
    return this.request<{ success: boolean; data: any[]; total: number }>(`/api/users?${params}`)
  }

  async createUser(userData: { name: string; email: string; password: string; role: string }) {
    return this.request<{ success: boolean; data: any }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: { name: string; email: string; password?: string; role: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE',
    })
  }

  async validateBrandCode(code: string) {
    return this.request<{ success: boolean; data: any }>(`/api/brand/validate/${code}`, {
      method: 'POST',
    })
  }

  async getBrandAccess(code: string) {
    return this.request<{ success: boolean; data: any }>(`/api/brand/access/${code}`)
  }

  // Talent management
  async listTalents(offset = 0, limit = 20) {
    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    })
    return this.request<{ success: boolean; data: any[]; total: number }>(`/api/talents?${params}`)
  }

  async createTalent(talentData: { name: string; email: string; phone?: string; user_id?: string }) {
    return this.request<{ success: boolean; data: any }>('/api/talents', {
      method: 'POST',
      body: JSON.stringify(talentData),
    })
  }

  async updateTalent(id: string, talentData: { name?: string; email?: string; phone?: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/talents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(talentData),
    })
  }

  async deleteTalent(id: string) {
    return this.request<{ success: boolean }>(`/api/talents/${id}`, {
      method: 'DELETE',
    })
  }

  // Social media management
  async listSocialMedia(talentId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/api/talents/${talentId}/social-media`)
  }

  async createSocialMedia(talentId: string, data: { platform: string; username: string; url?: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/talents/${talentId}/social-media`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSocialMedia(id: string, data: { username?: string; url?: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/social-media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSocialMedia(id: string) {
    return this.request<{ success: boolean }>(`/api/social-media/${id}`, {
      method: 'DELETE',
    })
  }

  // Job management
  async getJob(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/jobs/${id}`)
  }

  async listJobs(offset = 0, limit = 20) {
    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    })
    return this.request<{ success: boolean; data: any[]; total: number }>(`/api/jobs?${params}`)
  }

  async createJob(jobData: { title: string; description?: string; brand_name: string; deadline?: string }) {
    return this.request<{ success: boolean; data: any }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    })
  }

  async updateJob(id: string, jobData: { title?: string; description?: string; brand_name?: string; status?: string; deadline?: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    })
  }

  async deleteJob(id: string) {
    return this.request<{ success: boolean }>(`/api/jobs/${id}`, {
      method: 'DELETE',
    })
  }

  // Job assignments
  async assignToJob(jobId: string, socialMediaId: string) {
    return this.request<{ success: boolean; data: any }>(`/api/jobs/${jobId}/assignments`, {
      method: 'POST',
      body: JSON.stringify({ social_media_id: socialMediaId }),
    })
  }

  async unassignFromJob(assignmentId: string) {
    return this.request<{ success: boolean }>(`/api/assignments/${assignmentId}`, {
      method: 'DELETE',
    })
  }

  async listAssignmentsByJob(jobId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/api/jobs/${jobId}/assignments`)
  }

  // Progress tracking
  async getProgress(assignmentId: string) {
    return this.request<{ success: boolean; data: any }>(`/api/progress/${assignmentId}`)
  }

  async updateProgressStep(assignmentId: string, step: string, notes?: string) {
    return this.request<{ success: boolean; data: any }>(`/api/progress/${assignmentId}/step`, {
      method: 'PUT',
      body: JSON.stringify({ step, notes }),
    })
  }

  async getJobProgress(jobId: string) {
    return this.request<{ success: boolean; data: any[] }>(`/api/jobs/${jobId}/progress`)
  }

  // Dashboard
  async getDashboard() {
    return this.request<{ success: boolean; data: any }>('/api/dashboard')
  }
}

export const apiClient = new ApiClient()
