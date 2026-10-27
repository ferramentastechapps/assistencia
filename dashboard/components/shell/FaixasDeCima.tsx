'use client'

import { useEffect, useRef } from 'react'

export const VARIAVEL_DAS_FAIXAS = '--faixas-de-cima'

export function FaixasDeCima({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        VARIAVEL_DAS_FAIXAS,
        `${el.offsetHeight}px`
      )
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty(VARIAVEL_DAS_FAIXAS)
    }
  }, [])

  return (
    <div ref={ref} className="sticky top-0 z-50">
      {children}
    </div>
  )
}
