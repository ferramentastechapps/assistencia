'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { MessageCircle, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
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
    name: '', email: '', password: '', companyName: ''
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
      toast.success('Conta criada com sucesso pelo Google!')
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
            theme: 'filled_black',
            size: 'large',
            width: btnContainer.offsetWidth || 350,
            text: 'signup_with',
            shape: 'rectangular',
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
    if (form.password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      return
    }
    setLoading(true)

    try {
      await authApi.register(form)
      toast.success('Conta criada! Fazendo login...')
      
      const { data } = await authApi.login(form.email, form.password)
      setAuth(data.user, data.token)
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
    'Cancele quando quiser',
  ]

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 py-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/8 blur-[120px]" />
        </div>

        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <MessageCircle size={20} className="text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Zap<span className="gradient-text">IA</span></span>
            </Link>
            <p className="text-white/40 text-sm mt-3">Crie sua conta gratuitamente</p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
              {benefits.map(b => (
                <span key={b} className="flex items-center gap-1.5 text-xs text-brand-400">
                  <CheckCircle size={12} /> {b}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-8">
            {/* Google Sign-in */}
            <div className="mb-6 flex flex-col items-center">
              <div id="google-register-btn" className="w-full flex justify-center min-h-[44px]">
                {googleLoading && (
                  <div className="flex items-center gap-2 text-sm text-brand-400 py-2">
                    <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    Criando conta com Google...
                  </div>
                )}
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-900 px-3 text-white/40 font-medium">ou com seu e-mail</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="label">Nome da empresa</label>
                  <input
                    className="input"
                    placeholder="Minha Empresa"
                    value={form.companyName}
                    onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
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
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                <div className="flex gap-1 mt-2">
                  {[8, 12, 16].map(min => (
                    <div
                      key={min}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= min ? 'bg-brand-500' : 'bg-surface-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Criar conta com E-mail <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Já tem conta?{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
