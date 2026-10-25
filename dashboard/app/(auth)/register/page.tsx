'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, CheckCircle2, Wrench } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    google?: any
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '836980497147-lm4bk8crk2vl5ud1rpa7e1a04kk56t2b.apps.googleusercontent.com'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleCredential = async (response: any) => {
    if (!response?.credential) return
    setGoogleLoading(true)
    try {
      const { data } = await authApi.googleLogin(response.credential)
      setAuth(data.user, data.token)
      toast.success('Conta criada com sucesso!')
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
        const btnContainer = document.getElementById('google-register-btn')
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.offsetWidth || 350,
            text: 'signup_with',
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
    if (form.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const { data } = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
      })
      setAuth(data.user, data.token)
      toast.success('Conta de assistência criada com sucesso!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'Sem cartão de crédito',
    '1.000 mensagens grátis/mês',
    'Especialista em Celulares',
  ]

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <div className="min-h-screen bg-[#E5E3DC] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-3 justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-[#18191B] flex items-center justify-center shadow-tactile-dark transition-transform duration-300 group-hover:scale-105">
                <Wrench size={22} className="text-[#F5C518]" />
              </div>
              <span className="font-black text-2xl tracking-tight text-[#18191B]">
                Zap<span className="text-[#F5C518]">IA</span>
              </span>
            </Link>
            <p className="text-[#787C87] text-xs font-semibold mt-2">Crie sua conta para assistência técnica</p>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {benefits.map(b => (
                <span key={b} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#18191B] bg-white px-2.5 py-1 rounded-full shadow-tactile-pill border border-black/[0.04]">
                  <CheckCircle2 size={12} className="text-[#10B981]" /> {b}
                </span>
              ))}
            </div>
          </div>

          <div className="card !p-8 shadow-tactile-card rounded-[32px]">
            {/* Google Sign-in */}
            <div className="mb-6 flex flex-col items-center">
              <div id="google-register-btn" className="w-full flex justify-center min-h-[44px]">
                {googleLoading && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#18191B] py-2">
                    <div className="w-4 h-4 border-2 border-[#18191B] border-t-transparent rounded-full animate-spin" />
                    Criando conta com Google...
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Seu nome</label>
                  <input
                    className="input"
                    placeholder="João Silva"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label">Nome da Assistência</label>
                  <input
                    className="input"
                    placeholder="iFix Celulares"
                    value={form.companyName}
                    onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Profissional</label>
                <input
                  type="email"
                  className="input"
                  placeholder="contato@assistencia.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Senha (mínimo 6 caracteres)</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
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
                {loading ? 'Criando sua bancada...' : 'Criar Conta de Assistência'}
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-black/[0.06] text-center">
              <p className="text-xs text-[#787C87] font-medium">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-[#18191B] font-bold underline hover:opacity-80">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
