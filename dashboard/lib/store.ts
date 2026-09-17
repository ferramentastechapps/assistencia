'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenant: {
    id: string
    name: string
    plan: string
    apiUsage: number
    maxMessages: number
  }
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        Cookies.set('zapia_token', token, { expires: 7, secure: true, sameSite: 'strict' })
        set({ user, token })
      },

      logout: () => {
        Cookies.remove('zapia_token')
        set({ user: null, token: null })
        window.location.href = '/login'
      },

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: 'zapia-auth',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)
