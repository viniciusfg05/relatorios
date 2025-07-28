type DadosRelatorioInicial = {
  loja?: string;
  servico?: string;
  valor?: string;
  itens?: string[];
};

export interface DadosConclusao {
  tipo: string;
  imagens: string[];
  titulo: string;
  subtitulo: string;
  descricao: string;
  os: string;
}

declare global {
  interface Window {
    setRelatorioAuto?: (dados: DadosRelatorioInicial | DadosConclusao) => void;
  }
}
export {}; 