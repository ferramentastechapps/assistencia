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
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181f',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              fontSize: '14px'
            },
            success: {
              iconTheme: { primary: '#25a45e', secondary: '#fff' }
            }
          }}
        />
      </body>
    </html>
  )
}
