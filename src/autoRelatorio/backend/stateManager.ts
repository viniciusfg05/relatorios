import type { ConversaContexto } from '../types';

// Gerenciador de contexto de conversas por usuário (em memória)
const conversas: Map<string, ConversaContexto> = new Map();

export function getConversa(usuarioId: string): ConversaContexto | undefined {
  return conversas.get(usuarioId);
}

export function setConversa(usuarioId: string, contexto: ConversaContexto) {
  conversas.set(usuarioId, contexto);
}

export function resetConversa(usuarioId: string) {
  conversas.delete(usuarioId);
} 