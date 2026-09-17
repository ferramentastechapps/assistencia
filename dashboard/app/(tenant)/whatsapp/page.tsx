'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Smartphone, RefreshCw, Trash2, Wifi, WifiOff, Loader } from 'lucide-react'
import { whatsappApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/lib/store'
import Image from 'next/image'

interface Instance {
  id: string
  instanceName: string
  phoneNumber: string | null
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR'
  profileName: string | null
}

export default function WhatsAppPage() {
  const { token } = useAuthStore()
  const [instances, setInstances] = useState<Instance[]>([])
  const [qrModal, setQrModal] = useState<{ id: string; qr: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    loadInstances()

    // Socket.io para atualizações em tempo real
    const socketUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || window.location.origin) : ''
    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token }
    })

    socket.on('instance:status', ({ instanceId, status, phoneNumber }: any) => {
      setInstances(prev => prev.map(i =>
        i.id === instanceId ? { ...i, status, phoneNumber: phoneNumber || i.phoneNumber } : i
      ))
      if (status === 'CONNECTED') {
        toast.success('WhatsApp conectado com sucesso! 🎉')
        setQrModal(null)
      }
    })

    socket.on('qr:updated', ({ instanceId, qrCode }: any) => {
      if (qrModal?.id === instanceId) {
        setQrModal({ id: instanceId, qr: qrCode })
      }
    })

    socketRef.current = socket
    return () => { socket.disconnect() }
  }, [token])

  const loadInstances = async () => {
    try {
      const { data } = await whatsappApi.listInstances()
      setInstances(data)
    } catch { toast.error('Erro ao carregar instâncias') }
    finally { setLoading(false) }
  }

  const createInstance = async () => {
    setCreating(true)
    try {
      const { data } = await whatsappApi.createInstance()
      setInstances(prev => [data, ...prev])
      toast.success('Instância criada!')
      // Mostrar QR imediatamente
      showQr(data.id)
    } catch { toast.error('Erro ao criar instância') }
    finally { setCreating(false) }
  }

  const showQr = async (id: string) => {
    try {
      const { data } = await whatsappApi.getQrCode(id)
      setQrModal({ id, qr: data.base64 || data.qrcode?.base64 || '' })
    } catch { toast.error('Erro ao gerar QR Code') }
  }

  const disconnect = async (id: string) => {
    if (!confirm('Desconectar este número?')) return
    try {
      await whatsappApi.disconnect(id)
      setInstances(prev => prev.map(i => i.id === id ? { ...i, status: 'DISCONNECTED', phoneNumber: null } : i))
      toast.success('Número desconectado')
    } catch { toast.error('Erro ao desconectar') }
  }

  const deleteInstance = async (id: string) => {
    if (!confirm('Deletar esta instância? Esta ação é irreversível.')) return
    try {
      await whatsappApi.deleteInstance(id)
      setInstances(prev => prev.filter(i => i.id !== id))
      toast.success('Instância removida')
    } catch { toast.error('Erro ao remover instância') }
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp</h1>
          <p className="text-white/40 text-sm mt-1">Gerencie seus números conectados</p>
        </div>
        <button onClick={createInstance} disabled={creating} className="btn-primary flex items-center gap-2">
          {creating ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
          Novo número
        </button>
      </div>

      {/* Instances */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : instances.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-700 flex items-center justify-center mx-auto mb-4">
            <Smartphone size={24} className="text-white/30" />
          </div>
          <h3 className="font-semibold mb-2">Nenhum número conectado</h3>
          <p className="text-white/40 text-sm mb-6">Conecte seu primeiro número WhatsApp para começar.</p>
          <button onClick={createInstance} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Conectar número
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {instances.map(instance => (
            <div key={instance.id} className="card p-6 flex flex-col gap-4 hover:border-white/10 transition-all">
              {/* Status header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', {
                    'bg-brand-500/15': instance.status === 'CONNECTED',
                    'bg-red-500/15': instance.status === 'DISCONNECTED' || instance.status === 'ERROR',
                    'bg-yellow-500/15': instance.status === 'CONNECTING',
                  })}>
                    {instance.status === 'CONNECTED'
                      ? <Wifi size={18} className="text-brand-400" />
                      : instance.status === 'CONNECTING'
                      ? <RefreshCw size={18} className="text-yellow-400 animate-spin-slow" />
                      : <WifiOff size={18} className="text-red-400" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {instance.profileName || instance.phoneNumber || 'Aguardando conexão'}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">
                      {instance.phoneNumber || instance.instanceName.slice(-12)}
                    </div>
                  </div>
                </div>
                <span className={clsx('badge', {
                  'badge-green': instance.status === 'CONNECTED',
                  'badge-red': instance.status === 'DISCONNECTED' || instance.status === 'ERROR',
                  'badge-yellow': instance.status === 'CONNECTING',
                })}>
                  <div className={clsx('status-dot', {
                    'connected': instance.status === 'CONNECTED',
                    'disconnected': instance.status === 'DISCONNECTED',
                    'connecting': instance.status === 'CONNECTING',
                  })} />
                  {instance.status === 'CONNECTED' ? 'Conectado' :
                   instance.status === 'CONNECTING' ? 'Conectando' : 'Desconectado'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                {instance.status !== 'CONNECTED' && (
                  <button
                    onClick={() => showQr(instance.id)}
                    className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-sm py-2"
                  >
                    Conectar via QR
                  </button>
                )}
                {instance.status === 'CONNECTED' && (
                  <button
                    onClick={() => disconnect(instance.id)}
                    className="btn-secondary flex-1 text-sm py-2"
                  >
                    Desconectar
                  </button>
                )}
                <button
                  onClick={() => deleteInstance(instance.id)}
                  className="btn-danger py-2 px-3"
                  title="Deletar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card p-8 max-w-sm w-full text-center">
            <h3 className="font-bold text-lg mb-2">Escaneie o QR Code</h3>
            <p className="text-white/40 text-sm mb-6">
              Abra o WhatsApp no celular → Menu → Dispositivos conectados → Conectar dispositivo
            </p>
            {qrModal.qr ? (
              <div className="bg-white rounded-2xl p-4 inline-block mb-6">
                <img
                  src={qrModal.qr.startsWith('data:') ? qrModal.qr : `data:image/png;base64,${qrModal.qr}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-surface-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/30 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Aguardando leitura...
            </div>
            <button onClick={() => setQrModal(null)} className="btn-secondary w-full">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
