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

  async validateBrandCode(code: string) {
    return this.request<{ success: boolean; data: any }>(`/api/brand/validate/${code}`, {
      method: 'POST',
    })
  }

  async getBrandAccess(code: string) {
    return this.request<{ success: boolean; data: any }>(`/api/brand/access/${code}`)
  }
}

export const apiClient = new ApiClient()
