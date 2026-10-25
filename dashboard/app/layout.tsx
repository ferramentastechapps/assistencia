import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'ZapIA — Gestão Inteligente de Assistência Técnica & WhatsApp',
  description: 'Sistema operacional completo para assistência técnica de celulares com IA integrada, controle de bancada e automação no WhatsApp.',
  keywords: 'Assistência técnica, celulares, WhatsApp, chatbot, IA, ordens de serviço, CRM, trade-in',
  openGraph: {
    title: 'ZapIA — Gestão de Assistência Técnica com IA',
    description: 'Automatize sua bancada e atendimento de celular com IA',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#DCD8CD] text-[#1C1D21] font-sans antialiased selection:bg-[#F5C518]/30 selection:text-black min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1C1D21',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 16px 36px -6px rgba(0,0,0,0.08), inset 0 1px 0 #FFFFFF',
              padding: '12px 18px',
            },
            success: {
              iconTheme: { primary: '#18191B', secondary: '#F5C518' }
            }
          }}
        />
      </body>
    </html>
  )
}
