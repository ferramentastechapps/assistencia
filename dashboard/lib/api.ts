import axios from 'axios'
import Cookies from 'js-cookie'

const baseURL = typeof window !== 'undefined'
  ? '/api/v1'
  : (process.env.INTERNAL_API_URL || 'http://127.0.0.1:3011/api/v1')

export const api = axios.create({
  baseURL,
  timeout: 30000,
})

// Interceptor — injetar token JWT em todas as requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('zapia_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor — redirecionar para login se 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('zapia_token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  googleLogin: (credential: string) =>
    api.post('/auth/google', { credential }),
  register: (data: { name: string; email: string; password: string; companyName: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
export const whatsappApi = {
  listInstances: () => api.get('/whatsapp/instances'),
  createInstance: (name?: string) => api.post('/whatsapp/instances', { name }),
  getQrCode: (id: string) => api.get(`/whatsapp/instances/${id}/qr`),
  disconnect: (id: string) => api.delete(`/whatsapp/instances/${id}/disconnect`),
  deleteInstance: (id: string) => api.delete(`/whatsapp/instances/${id}`),
}

// ─── Conversas ────────────────────────────────────────────────────────────────
export const conversationsApi = {
  list: (params?: { status?: string; search?: string; stageId?: string; tagId?: string; page?: number; limit?: number }) =>
    api.get('/conversations', { params }),
  getById: (id: string) => api.get(`/conversations/${id}`),
  assign: (id: string) => api.post(`/conversations/${id}/assign`),
  resolve: (id: string) => api.post(`/conversations/${id}/resolve`),
  returnToAI: (id: string) => api.post(`/conversations/${id}/return-to-ai`),
  sendMessage: (id: string, message: string, isInternalNote = false) =>
    api.post(`/conversations/${id}/send`, { message, isInternalNote }),
  addTag: (id: string, tagId: string) =>
    api.post(`/conversations/${id}/tags`, { tagId }),
  removeTag: (id: string, tagId: string) =>
    api.delete(`/conversations/${id}/tags/${tagId}`),
  updateStage: (id: string, stageId?: string, estimatedValue?: number) =>
    api.patch(`/conversations/${id}/stage`, { stageId, estimatedValue }),
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tagsApi = {
  list: () => api.get('/tags'),
  create: (name: string, color?: string) => api.post('/tags', { name, color }),
  delete: (id: string) => api.delete(`/tags/${id}`),
}

// ─── Respostas Rápidas (Canned Responses) ─────────────────────────────────────
export const quickRepliesApi = {
  list: () => api.get('/quick-replies'),
  create: (shortcut: string, title: string, content: string) =>
    api.post('/quick-replies', { shortcut, title, content }),
  delete: (id: string) => api.delete(`/quick-replies/${id}`),
}

// ─── CRM Pipeline / Kanban ───────────────────────────────────────────────────
export const pipelineApi = {
  getStages: () => api.get('/pipeline/stages'),
  getBoard: () => api.get('/pipeline/board'),
  createStage: (name: string, color?: string, order?: number) =>
    api.post('/pipeline/stages', { name, color, order }),
  deleteStage: (id: string) => api.delete(`/pipeline/stages/${id}`),
}

// ─── Base de conhecimento ─────────────────────────────────────────────────────
export const knowledgeApi = {
  list: () => api.get('/knowledge'),
  addText: (title: string, content: string) =>
    api.post('/knowledge/text', { title, content }),
  addUrl: (title: string, url: string) =>
    api.post('/knowledge/url', { title, url }),
  uploadPdf: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/knowledge/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  delete: (id: string) => api.delete(`/knowledge/${id}`),
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  conversationsChart: () => api.get('/analytics/conversations-chart'),
}

// ─── AI Config ────────────────────────────────────────────────────────────────
export const aiConfigApi = {
  get: () => api.get('/ai-config'),
  update: (data: Record<string, any>) => api.patch('/ai-config', data),
}

// ─── Modelos & Nichos de Empresa ─────────────────────────────────────────────
export const templatesApi = {
  list: () => api.get('/templates'),
  getById: (id: string) => api.get(`/templates/${id}`),
  apply: (templateId: string) => api.post('/templates/apply', { templateId }),
}

// ─── Ordens de Serviço (Bancada Técnica) ─────────────────────────────────────
export const repairsApi = {
  list: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/repairs', { params }),
  stats: () => api.get('/repairs/stats'),
  getById: (id: string) => api.get(`/repairs/${id}`),
  create: (data: Record<string, any>) => api.post('/repairs', data),
  update: (id: string, data: Record<string, any>) => api.patch(`/repairs/${id}`, data),
  updateStatus: (id: string, status: string, notifyWhatsapp = true, customMessage?: string) =>
    api.patch(`/repairs/${id}/status`, { status, notifyWhatsapp, customMessage }),
  delete: (id: string) => api.delete(`/repairs/${id}`),
  // Tabela de preços de referência
  listQuotes: (params?: { brand?: string; service?: string }) => api.get('/repairs/quotes', { params }),
  createQuote: (data: Record<string, any>) => api.post('/repairs/quotes', data),
  deleteQuote: (id: string) => api.delete(`/repairs/quotes/${id}`),
}

// ─── Catálogo de Celulares & Trade-In ────────────────────────────────────────
export const catalogApi = {
  listProducts: (params?: {
    brand?: string; category?: string; condition?: string;
    search?: string; available?: boolean; featured?: boolean;
    page?: number; limit?: number
  }) => api.get('/catalog/products', { params }),
  stats: () => api.get('/catalog/stats'),
  getProduct: (id: string) => api.get(`/catalog/products/${id}`),
  createProduct: (data: Record<string, any>) => api.post('/catalog/products', data),
  updateProduct: (id: string, data: Record<string, any>) => api.patch(`/catalog/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/catalog/products/${id}`),
  // Trade-In
  evaluateTradeIn: (data: {
    brand: string; model: string; storage?: string;
    batteryHealth?: number; condition: string;
    hasBox?: boolean; hasCharger?: boolean;
    customerPhone?: string; conversationId?: string;
  }) => api.post('/catalog/trade-in', data),
  listTradeIns: () => api.get('/catalog/trade-in'),
}
