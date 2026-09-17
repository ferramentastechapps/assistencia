import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'ZapIA — Atendimento Inteligente via WhatsApp',
  description: 'Sistema profissional de atendimento ao cliente via WhatsApp com Inteligência Artificial. Automatize, personalize e escale seu atendimento.',
  keywords: 'WhatsApp, chatbot, IA, atendimento, automação, CRM',
  openGraph: {
    title: 'ZapIA — Atendimento Inteligente via WhatsApp',
    description: 'Automatize e escale seu atendimento com IA',
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050507] text-[#f1f3f9] antialiased selection:bg-emerald-500/25 selection:text-emerald-300">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#090a0f',
              color: '#f1f3f9',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#050507' }
            }
          }}
        />
      </body>
    </html>
  )
}
