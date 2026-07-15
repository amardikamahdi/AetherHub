import { describe, it, expect, beforeEach } from 'vitest'
import { apiClient } from './api'

describe('apiClient', () => {
  beforeEach(() => {
    apiClient.clearToken()
  })

  describe('setToken / getToken', () => {
    it('stores and retrieves token', () => {
      apiClient.setToken('test-token')
      expect(apiClient.getToken()).toBe('test-token')
    })

    it('returns null when no token set', () => {
      expect(apiClient.getToken()).toBeNull()
    })

    it('clears token', () => {
      apiClient.setToken('test-token')
      apiClient.clearToken()
      expect(apiClient.getToken()).toBeNull()
    })
  })
})
