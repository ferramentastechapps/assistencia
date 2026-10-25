// ═══════════════════════════════════════════════════════════════════════════════
// Validador de Marcas de Celular
// ═══════════════════════════════════════════════════════════════════════════════
// Lista oficial de marcas aceitas no sistema de assistência técnica

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
  'Multilaser',
  'Huawei',
  'Honor',
  'Google',
  'Microsoft',
  'BlackBerry',
  'Alcatel',
  'BLU',
  'Infinix',
  'Tecno'
] as const

export type PhoneBrand = typeof ALLOWED_BRANDS[number]

/**
 * Verifica se uma marca é válida
 * @param brand - Nome da marca a validar
 * @returns true se a marca está na lista permitida
 */
export function isValidBrand(brand: string): boolean {
  if (!brand || typeof brand !== 'string') return false
  return ALLOWED_BRANDS.some(
    b => b.toLowerCase() === brand.trim().toLowerCase()
  )
}

/**
 * Normaliza o nome da marca para o formato correto
 * @param brand - Nome da marca a normalizar
 * @returns Nome da marca normalizado ou o original se não encontrado
 */
export function normalizeBrand(brand: string): string {
  if (!brand || typeof brand !== 'string') return brand

  const found = ALLOWED_BRANDS.find(
    b => b.toLowerCase() === brand.trim().toLowerCase()
  )

  return found || brand.trim()
}

/**
 * Busca marcas que correspondem a um termo de pesquisa
 * @param search - Termo de pesquisa
 * @returns Array de marcas que correspondem à pesquisa
 */
export function searchBrands(search: string): string[] {
  if (!search || typeof search !== 'string') return []

  const searchLower = search.toLowerCase().trim()

  return ALLOWED_BRANDS.filter(brand =>
    brand.toLowerCase().includes(searchLower)
  )
}

/**
 * Retorna todas as marcas permitidas
 * @returns Array com todas as marcas
 */
export function getAllBrands(): readonly string[] {
  return ALLOWED_BRANDS
}

/**
 * Valida e retorna erro formatado se inválido
 * @param brand - Marca a validar
 * @returns null se válido, objeto de erro se inválido
 */
export function validateBrandWithError(brand: string): { error: string; suggestions: string[] } | null {
  if (!brand || typeof brand !== 'string' || brand.trim() === '') {
    return {
      error: 'Marca do aparelho é obrigatória',
      suggestions: ALLOWED_BRANDS.slice(0, 5)
    }
  }

  if (!isValidBrand(brand)) {
    // Buscar marcas similares
    const similar = searchBrands(brand.substring(0, 3))

    return {
      error: `Marca "${brand}" não é reconhecida em nosso sistema`,
      suggestions: similar.length > 0 ? similar : ALLOWED_BRANDS.slice(0, 10)
    }
  }

  return null
}
