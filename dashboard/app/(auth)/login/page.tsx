'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Wrench } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    google?: any
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '836980497147-lm4bk8crk2vl5ud1rpa7e1a04kk56t2b.apps.googleusercontent.com'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleCredential = async (response: any) => {
    if (!response?.credential) return
    setGoogleLoading(true)
    try {
      const { data } = await authApi.googleLogin(response.credential)
      setAuth(data.user, data.token)
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao autenticar com a Conta Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  const initGoogle = () => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
        })
        const btnContainer = document.getElementById('google-login-btn')
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.offsetWidth || 350,
            text: 'continue_with',
            shape: 'pill',
            locale: 'pt-BR'
          })
        }
      } catch (err) {
        console.error('Erro ao inicializar Google Sign-In', err)
      }
    }
  }

  useEffect(() => {
    initGoogle()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await authApi.login(form.email, form.password)
      setAuth(data.user, data.token)
      toast.success('Bem-vindo de volta!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <div className="min-h-screen bg-[#DCD8CD] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo & Tablet Identity */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-[#232528]/85 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-tactile-dark transition-transform duration-300 group-hover:scale-105">
                <Wrench size={22} className="text-[#F5C518]" />
              </div>
              <span className="font-black text-2xl tracking-tight text-[#1C1D21]">
                Zap<span className="text-[#F5C518]">IA</span>
              </span>
            </Link>
            <p className="text-[#797D8A] text-xs font-semibold mt-2">
              Gestão de Bancada & Atendimento WhatsApp com IA
            </p>
          </div>

          {/* Clay Card */}
          <div className="card !p-8 shadow-tactile-card rounded-[32px]">
            {/* Google Sign-in */}
            <div className="mb-6 flex flex-col items-center">
              <div id="google-login-btn" className="w-full flex justify-center min-h-[44px]">
                {googleLoading && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#18191B] py-2">
                    <div className="w-4 h-4 border-2 border-[#18191B] border-t-transparent rounded-full animate-spin" />
                    Autenticando com Google...
                  </div>
                )}
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.08]" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-3 text-[#888C95] font-bold">ou com seu e-mail</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Profissional</label>
                <input
                  type="email"
                  className="input"
                  placeholder="tecnico@assistencia.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888C95] hover:text-[#18191B] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary !py-3 font-bold mt-2 text-sm shadow-tactile-dark"
              >
                {loading ? 'Entrando na bancada...' : 'Acessar Sistema'}
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-black/[0.06] text-center">
              <p className="text-xs text-[#787C87] font-medium">
                Não tem uma conta de assistência?{' '}
                <Link href="/register" className="text-[#18191B] font-bold underline hover:opacity-80">
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
