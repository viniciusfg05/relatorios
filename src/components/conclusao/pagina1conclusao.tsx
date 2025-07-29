import React, { useState } from 'react';
import logo from '/logord.png';
import '../../App.css';

import './pagina1conclusao.css';
import imagerd from '../../../public/imagerd.png'

interface Props {
  destinatario: string;
  data: string;
}

const Pagina1Conclusao: React.FC<Props> = ({ data }) => {
  const [dataEditavel, setDataEditavel] = useState(data);
  const [editando, setEditando] = useState(false);

  const handleDataClick = () => setEditando(true);
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => setDataEditavel(e.target.value);
  const handleDataBlur = () => setEditando(false);
  const handleDataKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditando(false);
    }
  };

  return (
    <div className="pagina1conclusao-wrapper">
      <div className="pagina1conclusao-content">
        <div className="pagina1conclusao-header">
          <img src={logo} alt="RD Saúde" className="pagina1conclusao-logo" />
        </div>
        <div className="pagina1conclusao-box">
          <div>

            <h1 className="pagina1conclusao-title">Relatório Fotográfico</h1>
            <h2 className="pagina1conclusao-subtitle">Entrega de serviços executados</h2>
          </div>

          <div>

            {editando ? (
              <input
                className="pagina1conclusao-data"
                type="text"
                value={dataEditavel}
                onChange={handleDataChange}
                onBlur={handleDataBlur}
                onKeyDown={handleDataKeyDown}
                autoFocus
                style={{ textAlign: 'center', fontSize: '1rem', marginBottom: 10 }}
              />
            ) : (
              <div
                className="pagina1conclusao-data"
                onClick={handleDataClick}
                style={{ cursor: 'pointer' }}
                title="Clique para editar"
              >
                {dataEditavel}
              </div>
            )}
            <div className="pagina1conclusao-classificacao">Classificação deste material: Pública / Interna / Confidencial</div>
          </div>
        </div>
        <div className="pagina1conclusao-foto">
          <img src={imagerd} alt="Equipe reunida" />
        </div>
      </div>
    </div>
  );
};

export default Pagina1Conclusao; 