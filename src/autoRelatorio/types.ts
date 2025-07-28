// Tipos compartilhados para o sistema autônomo de relatórios

export type RelatorioTipo = 'inicial' | 'conclusao';

export interface RelatorioDados {
  tipo: RelatorioTipo;
  titulo?: string;
  subtitulo?: string;
  descricao?: string;
  loja?: string;
  servico?: string;
  itens?: string[];
  valor?: string;
  imagens: string[]; // hashes dos arquivos de imagem
  os?: string; // hash da imagem da OS
}

export type EstadoConversa =
  | 'aguardando_tipo'
  | 'aguardando_dados_texto'
  | 'aguardando_imagens'
  | 'aguardando_os'
  | 'gerando_pdf'
  | 'aguardando_confirmacao'
  | 'finalizado';

export interface ConversaContexto {
  usuarioId: string;
  estado: EstadoConversa;
  dados: RelatorioDados;
} 