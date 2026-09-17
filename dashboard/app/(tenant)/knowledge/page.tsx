'use client'

import { useEffect, useState } from 'react'
import { Upload, FileText, Globe, Plus, Trash2, Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { knowledgeApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'

interface Document {
  id: string
  title: string
  type: string
  status: 'PROCESSING' | 'READY' | 'ERROR'
  chunkCount: number
  filename: string | null
  fileSize: number | null
  createdAt: string
}

type AddMode = null | 'text' | 'url' | 'pdf'

export default function KnowledgePage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [addMode, setAddMode] = useState<AddMode>(null)
  const [form, setForm] = useState({ title: '', content: '', url: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadDocs() }, [])

  const loadDocs = async () => {
    try {
      const { data } = await knowledgeApi.list()
      setDocs(data)
    } catch { toast.error('Erro ao carregar documentos') }
    finally { setLoading(false) }
  }

  const addText = async () => {
    if (!form.title || !form.content) return toast.error('Preencha título e conteúdo')
    setSubmitting(true)
    try {
      const { data } = await knowledgeApi.addText(form.title, form.content)
      setDocs(prev => [data, ...prev])
      setForm({ title: '', content: '', url: '' })
      setAddMode(null)
      toast.success('Texto adicionado! Indexando...')
    } catch { toast.error('Erro ao adicionar') }
    finally { setSubmitting(false) }
  }

  const addUrl = async () => {
    if (!form.title || !form.url) return toast.error('Preencha título e URL')
    setSubmitting(true)
    try {
      const { data } = await knowledgeApi.addUrl(form.title, form.url)
      setDocs(prev => [data, ...prev])
      setForm({ title: '', content: '', url: '' })
      setAddMode(null)
      toast.success('URL adicionada! Indexando...')
    } catch { toast.error('Erro ao adicionar URL — verifique se está acessível') }
    finally { setSubmitting(false) }
  }

  const deleteDoc = async (id: string) => {
    if (!confirm('Remover este documento da base de conhecimento?')) return
    try {
      await knowledgeApi.delete(id)
      setDocs(prev => prev.filter(d => d.id !== id))
      toast.success('Documento removido')
    } catch { toast.error('Erro ao remover') }
  }

  // Dropzone para PDF
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file) return
      setSubmitting(true)
      try {
        const { data } = await knowledgeApi.uploadPdf(file)
        setDocs(prev => [data, ...prev])
        setAddMode(null)
        toast.success(`"${file.name}" enviado! Indexando...`)
      } catch { toast.error('Erro ao enviar PDF') }
      finally { setSubmitting(false) }
    }
  })

  const statusIcon = (status: string) => {
    if (status === 'READY') return <CheckCircle size={14} className="text-brand-400" />
    if (status === 'ERROR') return <AlertCircle size={14} className="text-red-400" />
    return <Clock size={14} className="text-yellow-400 animate-pulse" />
  }

  const typeIcon = (type: string) => {
    if (type === 'URL') return <Globe size={16} className="text-blue-400" />
    return <FileText size={16} className="text-white/40" />
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Base de Conhecimento</h1>
          <p className="text-white/40 text-sm mt-1">A IA responderá baseada nesses documentos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddMode('text')} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus size={15} /> Texto/FAQ
          </button>
          <button onClick={() => setAddMode('url')} className="btn-secondary flex items-center gap-2 text-sm">
            <Globe size={15} /> URL
          </button>
          <button onClick={() => setAddMode('pdf')} className="btn-primary flex items-center gap-2 text-sm">
            <Upload size={15} /> Upload PDF
          </button>
        </div>
      </div>

      {/* Add Forms */}
      {addMode === 'text' && (
        <div className="card p-6 space-y-4 animate-slide-up">
          <h3 className="font-semibold">Adicionar texto / FAQ</h3>
          <div>
            <label className="label">Título</label>
            <input className="input" placeholder="Ex: Política de Devolução" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Conteúdo</label>
            <textarea className="input min-h-[140px] resize-none" placeholder="Cole aqui as informações, FAQ, política, etc."
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={addText} disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting && <Loader size={14} className="animate-spin" />} Adicionar
            </button>
            <button onClick={() => setAddMode(null)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {addMode === 'url' && (
        <div className="card p-6 space-y-4 animate-slide-up">
          <h3 className="font-semibold">Adicionar URL</h3>
          <div>
            <label className="label">Título</label>
            <input className="input" placeholder="Ex: Página de Preços" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">URL</label>
            <input className="input" type="url" placeholder="https://seusite.com/pagina" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={addUrl} disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting && <Loader size={14} className="animate-spin" />} Adicionar
            </button>
            <button onClick={() => setAddMode(null)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {addMode === 'pdf' && (
        <div className="animate-slide-up">
          <div
            {...getRootProps()}
            className={clsx(
              'card p-12 text-center cursor-pointer border-2 border-dashed transition-all',
              isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-white/[0.08] hover:border-white/20'
            )}
          >
            <input {...getInputProps()} />
            {submitting ? (
              <div className="flex flex-col items-center gap-3">
                <Loader size={28} className="text-brand-400 animate-spin" />
                <p className="text-white/60">Enviando e indexando...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload size={28} className="text-white/30" />
                <p className="font-medium">{isDragActive ? 'Solte o PDF aqui!' : 'Arraste um PDF ou clique para selecionar'}</p>
                <p className="text-sm text-white/30">Máximo 50MB</p>
              </div>
            )}
          </div>
          <button onClick={() => setAddMode(null)} className="btn-ghost mt-3">Cancelar</button>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={32} className="text-white/20 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Base de conhecimento vazia</h3>
          <p className="text-white/40 text-sm">Adicione documentos para a IA responder seus clientes com precisão.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="card p-4 flex items-center gap-4 hover:border-white/10 transition-all">
              <div className="w-9 h-9 rounded-xl bg-surface-700 flex items-center justify-center flex-shrink-0">
                {typeIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{doc.title}</span>
                  <span className="badge badge-gray text-xs">{doc.type}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    {statusIcon(doc.status)}
                    {doc.status === 'READY' ? `${doc.chunkCount} chunks indexados` :
                     doc.status === 'ERROR' ? 'Erro ao processar' : 'Indexando...'}
                  </span>
                  <span className="text-xs text-white/20">
                    {format(new Date(doc.createdAt), "d 'de' MMM", { locale: ptBR })}
                  </span>
                  {doc.fileSize && (
                    <span className="text-xs text-white/20">
                      {(doc.fileSize / 1024).toFixed(0)}KB
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => deleteDoc(doc.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
