
import { useState } from 'react';
import RelatorioInicial from './components/inicial/RelatorioInicial';
import RelatorioConclusao from './components/conclusao/RelatorioConclusao';
import './App.css';

function App() {
  const [abaAtiva, setAbaAtiva] = useState<'inicial' | 'conclusao'>('inicial');

  return (
    <div>
      <div className="tabs">
        <button
          className={abaAtiva === 'inicial' ? 'tab active' : 'tab'}
          onClick={() => setAbaAtiva('inicial')}
        >
          Relatório Inicial
        </button>
        <button
          className={abaAtiva === 'conclusao' ? 'tab active' : 'tab'}
          onClick={() => setAbaAtiva('conclusao')}
        >
          Relatório de Conclusão
        </button>
      </div>
      {abaAtiva === 'inicial' && <RelatorioInicial />}
      {abaAtiva === 'conclusao' && <RelatorioConclusao />}
    </div>
  );
}

export default App;
