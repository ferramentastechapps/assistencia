# 🔒 Recomendações para Manter Foco Exclusivo em Assistência Técnica

## ✅ Status Atual
O sistema **já está configurado exclusivamente para assistência técnica de celulares**. O array `BUSINESS_TEMPLATES` contém apenas 1 template: `cellphone_repair`.

---

## 🛡️ Proteções Recomendadas

### 1. Bloquear Adição de Novos Templates

**Arquivo:** `backend/src/modules/templates/templates.data.ts`

Adicione um comentário de bloqueio no topo:

```typescript
// ⚠️ ATENÇÃO: Este sistema é EXCLUSIVAMENTE para assistência técnica de celulares
// NÃO adicione outros templates de negócio neste array
// Qualquer outro nicho de negócio deve ser uma instalação separada

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  // ÚNICO TEMPLATE PERMITIDO: Assistência Técnica de Celulares
  {
    id: 'cellphone_repair',
    ...
  }
  // ❌ NÃO ADICIONE MAIS TEMPLATES AQUI
]
```

---

### 2. Validar Marcas de Celular

**Criar arquivo:** `backend/src/modules/repairs/brands.validator.ts`

```typescript
// Lista oficial de marcas aceitas
export const ALLOWED_BRANDS = [
  'Apple',
  'Samsung',
  'Motorola',
  'Xiaomi',
  'Redmi',
  'POCO',
  'Realme',
  'Asus',
  'LG',
  'Sony',
  'OnePlus',
  'Oppo',
  'Vivo',
  'Nokia',
  'Lenovo',
  'TCL',
  'ZTE',
  'Positivo',
  'Multilaser'
] as const

export function isValidBrand(brand: string): boolean {
  return ALLOWED_BRANDS.some(
    b => b.toLowerCase() === brand.toLowerCase()
  )
}

export function normalizeBrand(brand: string): string {
  const found = ALLOWED_BRANDS.find(
    b => b.toLowerCase() === brand.toLowerCase()
  )
  return found || brand
}
```

**Uso nas rotas:**

```typescript
// backend/src/modules/repairs/repairs.routes.ts
import { isValidBrand, normalizeBrand } from './brands.validator'

app.post('/repairs', opts, async (request, reply) => {
  const body = request.body as { deviceBrand: string; ... }
  
  // Validar marca
  if (!isValidBrand(body.deviceBrand)) {
    return reply.code(400).send({
      error: 'Marca de celular não reconhecida',
      suggestion: 'Marcas aceitas: Apple, Samsung, Motorola, Xiaomi, etc.'
    })
  }
  
  // Normalizar nome da marca
  const normalizedBrand = normalizeBrand(body.deviceBrand)
  
  const order = await prisma.repairOrder.create({
    data: {
      ...
      deviceBrand: normalizedBrand,
      ...
    }
  })
  ...
})
```

---

### 3. Atualizar README com Foco Explícito

**Arquivo:** `README.md`

Adicionar no topo:

```markdown
# ZapIA 🤖 — Sistema de Atendimento WhatsApp para Assistência Técnica de Celulares

> ⚠️ **Sistema Especializado:** Este é um sistema focado EXCLUSIVAMENTE em 
> assistências técnicas de celulares e smartphones. Não é um sistema genérico.

## 🎯 Nicho de Mercado
- ✅ Lojas de conserto de celular
- ✅ Assistências técnicas autorizadas
- ✅ Técnicos autônomos especializados em smartphones
- ✅ Lojas de troca de tela e bateria
- ❌ Outros tipos de negócio (usar outra solução)
```

---

### 4. Mensagem de Onboarding Específica

**Arquivo:** `backend/prisma/seed.ts`

Garantir que a mensagem inicial seja clara:

```typescript
// Criar tenant de exemplo com foco em assistência técnica
await prisma.tenant.create({
  data: {
    name: 'Assistência Tech Center',
    email: 'admin@zapia.com',
    plan: 'PRO',
    users: {
      create: {
        email: 'admin@zapia.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'TENANT_ADMIN'
      }
    },
    aiConfig: {
      create: {
        personaName: 'Lucas - Suporte Técnico',
        personaTone: 'atencioso, transparente, ágil e técnico',
        language: 'pt-BR',
        systemPrompt: '...', // Prompt de assistência técnica
        welcomeMsg: '👋 Olá! Bem-vindo à nossa assistência técnica especializada em celulares! Como posso te ajudar hoje?',
        escalationKeywords: JSON.stringify([
          'falar com técnico',
          'falar com humano',
          'atendente',
          'não entendi'
        ])
      }
    }
  }
})
```

---

### 5. Dashboard com Terminologia Técnica

**Garantir que todos os textos sejam específicos:**

**Arquivo:** `dashboard/app/(tenant)/dashboard/page.tsx`

```tsx
// Usar terminologia específica
<h1>Painel de Controle - Assistência Técnica</h1>
<Card title="Ordens de Serviço Ativas" />
<Card title="Aparelhos na Bancada" />
<Card title="Reparos Concluídos Hoje" />
<Card title="Faturamento de Reparos" />
```

---

### 6. Validação no Frontend

**Arquivo:** `dashboard/app/(tenant)/repairs/page.tsx`

```tsx
// Lista de marcas para autocomplete
const PHONE_BRANDS = [
  'Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Redmi',
  'POCO', 'Realme', 'Asus', 'LG', 'Sony', 'OnePlus'
]

// Tipos de serviço específicos
const SERVICE_TYPES = [
  'Troca de Tela',
  'Troca de Bateria',
  'Reparo em Conector de Carga',
  'Desoxidação (Celular Molhado)',
  'Reparo de Placa Mãe',
  'Troca de Câmera',
  'Troca de Tampa Traseira',
  'Troca de Alto-falante',
  'Reparo de Botões',
  'Troca de Microfone'
]
```

---

### 7. Remover Rotas Genéricas

**Verificar se existem rotas genéricas e renomeá-las:**

❌ `/products` → ✅ `/phone-catalog`
❌ `/orders` → ✅ `/repair-orders`
❌ `/services` → ✅ `/repair-services`

---

### 8. Variáveis de Ambiente Específicas

**Arquivo:** `.env.example`

```env
# ════════════════════════════════════════════════
# ZapIA - Sistema para Assistência Técnica
# ════════════════════════════════════════════════

# Informações do Negócio
BUSINESS_TYPE=assistencia_tecnica_celular
BUSINESS_NAME=Sua Assistência Técnica
BUSINESS_PHONE=5511999999999
BUSINESS_ADDRESS=Rua Exemplo, 123 - Centro

# Configurações de Garantia
DEFAULT_WARRANTY_DAYS=90
EXPRESS_SERVICE_HOURS=1

# Marcas Especializadas (separadas por vírgula)
SPECIALIZED_BRANDS=Apple,Samsung,Motorola,Xiaomi

# API Keys
OPENROUTER_API_KEY=sk-or-v1-...
JWT_SECRET=...
```

---

### 9. Adicionar Validação na API de Templates

**Arquivo:** `backend/src/modules/templates/templates.routes.ts`

```typescript
app.post('/templates/apply', 
  { preHandler: [app.authenticate] },
  async (request, reply) => {
    const { templateId } = request.body as { templateId: string }
    
    // BLOQUEAR aplicação de templates que não sejam cellphone_repair
    if (templateId !== 'cellphone_repair') {
      return reply.code(403).send({
        error: 'Template não permitido',
        message: 'Este sistema é exclusivo para assistência técnica de celulares.'
      })
    }
    
    // Resto do código...
  }
)
```

---

### 10. Documentação de Limitações

**Criar arquivo:** `LIMITACOES.md`

```markdown
# Limitações do Sistema ZapIA

## 🎯 Nicho Exclusivo
Este sistema foi desenvolvido ESPECIFICAMENTE para:
- Assistências técnicas de celulares
- Lojas de conserto de smartphones
- Técnicos especializados em reparo de dispositivos móveis

## ❌ O que NÃO é coberto
- Outros tipos de negócio (e-commerce, restaurantes, etc)
- Assistência técnica de outros eletrônicos (notebooks, TVs)
- Venda de eletrônicos não relacionados a celulares

## 🔧 Por que essa limitação?
1. **IA especializada:** Prompts otimizados para diagnóstico de celulares
2. **Ferramentas específicas:** Consulta de OS, orçamentos por modelo
3. **Base de conhecimento:** FAQ focado em marcas e serviços de celular
4. **Fluxo de trabalho:** Pipeline desenhado para reparo técnico
5. **Integrações:** Sistemas pensados para oficinas técnicas

## 💡 Quer usar em outro nicho?
Você precisará de uma instalação separada e customizada.
```

---

## 📋 Checklist de Implementação

### Segurança de Foco:
- [ ] ✅ Apenas 1 template no array `BUSINESS_TEMPLATES`
- [ ] ✅ Comentários de bloqueio no código
- [ ] ✅ Validação de marcas de celular
- [ ] ✅ Mensagens de erro específicas
- [ ] ✅ Variáveis de ambiente com foco

### Experiência do Usuário:
- [ ] ✅ README atualizado com nicho explícito
- [ ] ✅ Dashboard com terminologia técnica
- [ ] ✅ Onboarding focado em assistência técnica
- [ ] ✅ FAQ específico para celulares
- [ ] ✅ Respostas rápidas técnicas

### Código:
- [ ] ✅ Rotas renomeadas com foco
- [ ] ✅ Validadores de marca
- [ ] ✅ Bloquear templates genéricos
- [ ] ✅ Ferramentas especializadas
- [ ] ✅ Documentação de limitações

---

## 🎉 Resultado Final

Com essas proteções, o sistema será:
1. **Impossível de desviar** para outros nichos
2. **Mais confiável** com validações específicas
3. **Mais claro** para o usuário final
4. **Mais fácil de manter** com código focado
5. **Melhor posicionado** no mercado especializado

---

**Data:** 15/10/2026
**Versão:** 1.0.0
**Status:** ✅ Pronto para implementação
