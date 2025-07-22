
import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';
import elipcedireita from "/direito.svg";

interface Photo {
  id: string;
  file: File;
  url: string;
  isWide?: boolean;
}

interface Page {
  id: string;
  destinatario: string;
  data: string;
  titulo: string;
  introducao: string;
  objeto: string;
  itens: string[];
  photos: Photo[];
}

function App() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: '1',
      destinatario: 'RD – RAIADROGASIL ENGENHARIA.',
      data: 'Brasília – DF, 22 de maio de 2025.',
      titulo: 'PROPOSTA COMERCIAL – DS0403',
      introducao: 'Prezados, pelo presente, submeto à apreciação de V.Sa., proposta comercial para a execução dos serviços em referência.',
      objeto: 'Encaminhamos o orçamento referente as adequações necessárias na filial.',
      itens: ['Pintura de portas internas', 'Pintura interna na cor branca', 'Limpeza'],
      photos: []
    },
  ]);
  const [hideRemoveItemBtns, setHideRemoveItemBtns] = useState(false);
  const [paginaFixa, setPaginaFixa] = useState({
    investimento: 'R$ 2.800,00 (Dois mil e oitocentos reais)',
    observacao: 'Estão inclusos todas as despesas, materiais, serviços, impostos e encargos nesta proposta.',
    prazo: 'Os serviços serão executados em até 15 dias após a aprovação dessa proposta.',
    validade: 'Essa proposta tem validade de 30 dias a partir da data de envio.',
    condicoes: 'Conforme clausula contratual.',
    assinatura: 'JM SERLIMPA'
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Removi a função reorganizePages e suas dependências

  const onDrop = useCallback((acceptedFiles: File[]) => {
    Promise.all(
      acceptedFiles.map(file => {
        return new Promise<Photo>(resolve => {
          const url = URL.createObjectURL(file);
          const img = new window.Image();
          img.onload = () => {
            const isWide = img.width > img.height * 1.5; // ajuste o fator conforme desejar
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              file,
              url,
              isWide
            });
          };
          img.src = url;
        });
      })
    ).then(newPhotos => {
      setPages(prevPages => {
        const allPhotos = prevPages.flatMap(page => page.photos).concat(newPhotos);
        const newPages: Page[] = [];
        // Página 1 SEM fotos
        newPages.push({
          id: '1',
          destinatario: prevPages[0]?.destinatario || 'RD – RAIADROGASIL ENGENHARIA.',
          data: prevPages[0]?.data || 'Brasília – DF, 22 de maio de 2025.',
          titulo: prevPages[0]?.titulo || 'PROPOSTA COMERCIAL – DS0403',
          introducao: prevPages[0]?.introducao || 'Prezados, pelo presente, submeto à apreciação de V.Sa., proposta comercial para a execução dos serviços em referência.',
          objeto: prevPages[0]?.objeto || 'Encaminhamos o orçamento referente as adequações necessárias na filial.',
          itens: prevPages[0]?.itens?.length ? [...prevPages[0].itens] : ['Pintura de portas internas', 'Pintura interna na cor branca', 'Limpeza'],
          photos: []
        });
        // Fotos a partir da página 2, até 4 espaços por página
        let photoIndex = 0;
        let pageNum = 2;
        while (photoIndex < allPhotos.length) {
          const pagePhotos: Photo[] = [];
          let spacesUsed = 0;
          while (photoIndex < allPhotos.length && spacesUsed < 4) {
            const photo = allPhotos[photoIndex];
            const space = photo.isWide ? 2 : 1;
            if (spacesUsed + space > 4) break;
            pagePhotos.push(photo);
            spacesUsed += space;
            photoIndex++;
          }
          newPages.push({
            id: pageNum.toString(),
            destinatario: '',
            data: '',
            titulo: '',
            introducao: '',
            objeto: '',
            itens: [],
            photos: pagePhotos
          });
          pageNum++;
        }
        return newPages;
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: true,
    noClick: false,
    noDrag: false,
    noDragEventsBubbling: true,
    preventDropOnDocument: true
  });

  const removePhoto = (pageId: string, photoId: string) => {
    setPages(prevPages => {
      // Remove a foto
      const allPhotos = prevPages.flatMap(page => page.photos).filter(photo => photo.id !== photoId);
      const newPages: Page[] = [];
      // Página 1 SEM fotos
      newPages.push({
        id: '1',
        destinatario: prevPages[0]?.destinatario || 'RD – RAIADROGASIL ENGENHARIA.',
        data: prevPages[0]?.data || 'Brasília – DF, 22 de maio de 2025.',
        titulo: prevPages[0]?.titulo || 'PROPOSTA COMERCIAL – DS0403',
        introducao: prevPages[0]?.introducao || 'Prezados, pelo presente, submeto à apreciação de V.Sa., proposta comercial para a execução dos serviços em referência.',
        objeto: prevPages[0]?.objeto || 'Encaminhamos o orçamento referente as adequações necessárias na filial.',
        itens: prevPages[0]?.itens?.length ? [...prevPages[0].itens] : ['Pintura de portas internas', 'Pintura interna na cor branca', 'Limpeza'],
        photos: []
      });
      // Fotos a partir da página 2, até 4 espaços por página
      let photoIndex = 0;
      let pageNum = 2;
      while (photoIndex < allPhotos.length) {
        const pagePhotos: Photo[] = [];
        let spacesUsed = 0;
        while (photoIndex < allPhotos.length && spacesUsed < 4) {
          const photo = allPhotos[photoIndex];
          const space = photo.isWide ? 2 : 1;
          if (spacesUsed + space > 4) break;
          pagePhotos.push(photo);
          spacesUsed += space;
          photoIndex++;
        }
        newPages.push({
          id: pageNum.toString(),
          destinatario: '',
          data: '',
          titulo: '',
          introducao: '',
          objeto: '',
          itens: [],
          photos: pagePhotos
        });
        pageNum++;
      }
      return newPages;
    });
  };

  const updatePageField = (pageId: string, field: keyof Page, value: string | string[]) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === pageId ? { ...page, [field]: value } : page
      )
    );
  };

  const updateItem = (pageId: string, itemIndex: number, value: string) => {
    setPages(prevPages =>
      prevPages.map(page => {
        if (page.id === pageId) {
          const newItens = [...page.itens];
          newItens[itemIndex] = value;
          return { ...page, itens: newItens };
        }
        return page;
      })
    );
  };

  const addItem = (pageId: string) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === pageId ? { ...page, itens: [...page.itens, 'Novo item'] } : page
      )
    );
  };

  const removeItem = (pageId: string, itemIndex: number) => {
    setPages(prevPages =>
      prevPages.map(page => {
        if (page.id === pageId) {
          const newItens = [...page.itens];
          newItens.splice(itemIndex, 1);
          return { ...page, itens: newItens };
        }
        return page;
      })
    );
  };

  const generatePDF = async () => {
    if (!containerRef.current) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageElements = containerRef.current.querySelectorAll('.contentMain');
    
    for (let i = 0; i < pageElements.length; i++) {
      const element = pageElements[i] as HTMLElement;
      
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
      }
    }

    pdf.save('relatorio-fotografico.pdf');
  };

  const renderPhotoGrid = (page: Page) => {
    return (
      <div className="photoGrid">
        <div className="photoGridContainer">
          {page.photos.map((photo, index) => (
            <div key={index} className={`photoItem${photo.isWide ? ' wide' : ''}`}>
              <img src={photo.url} alt={`Foto ${index + 1}`} />
              <button 
                className="removeBtn"
                onClick={() => removePhoto(page.id, photo.id)}
                title="Remover foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const addNewPage = () => {
    setPages(prevPages => {
      return [
        ...prevPages,
        {
          id: (prevPages.length + 1).toString(),
          destinatario: '',
          data: '',
          titulo: '',
          introducao: '',
          objeto: '',
          itens: [],
          photos: []
        }
      ];
    });
  };

  // Função para atualizar campos da página fixa
  const updatePaginaFixa = (field: keyof typeof paginaFixa, value: string) => {
    setPaginaFixa(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`containerMain${hideRemoveItemBtns ? ' hide-remove-item-btns' : ''}`} ref={containerRef}>
      <div className="controls">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dragover' : ''}`}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Solte as fotos aqui...</p>
          ) : (
            <p>Arraste fotos aqui ou clique para selecionar</p>
          )}
        </div>
        
        <button onClick={addNewPage}>
          Adicionar Página
        </button>
        
        <button onClick={() => setHideRemoveItemBtns(h => !h)}>
          {hideRemoveItemBtns ? 'Mostrar botões de remover itens' : 'Ocultar botões de remover itens'}
        </button>
        
        <button onClick={generatePDF} disabled={pages.length === 0}>
          Gerar PDF
        </button>
      </div>

      <main className="pageMain">
        {pages.map((page, index) => (
          <div key={page.id} className="contentMain">
            <img src={elipcedireita} alt="" className="elipcedireita" />
            {/* Cabeçalho detalhado e editável apenas na primeira página */}
            {index === 0 && (
              <div className="editableText">
                <header className="header">
                  <div className="destinatario">
                    <span className="azul">À</span><br />
                    <span
                      className="negrito"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => updatePageField(page.id, 'destinatario', e.currentTarget.textContent || '')}
                    >
                      {page.destinatario}
                    </span>
                  </div>
                  <div
                    className="data"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updatePageField(page.id, 'data', e.currentTarget.textContent || '')}
                  >
                    {page.data}
                  </div>
                </header>
                <div className="divide"></div>
                <h2
                  className="titulo"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => updatePageField(page.id, 'titulo', e.currentTarget.textContent || '')}
                >
                  {page.titulo}
                </h2>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => updatePageField(page.id, 'introducao', e.currentTarget.textContent || '')}
                >
                  {page.introducao}
                </p>
                <h3 className="subtitulo">1. OBJETO</h3>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => updatePageField(page.id, 'objeto', e.currentTarget.textContent || '')}
                >
                  {page.objeto}
                </p>
                <ul>
                  {page.itens.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => updateItem(page.id, itemIndex, e.currentTarget.textContent || '')}
                      >
                        {item}
                      </span>
                      <button
                        className="remove-item-btn"
                        onClick={() => removeItem(page.id, itemIndex)}
                        title="Remover item"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="add-item-btn" onClick={() => addItem(page.id)}>
                  + Adicionar Item
                </button>
              </div>
            )}
            {/* Mostra a grid de fotos apenas quando há fotos */}
            {page.photos.length > 0 && renderPhotoGrid(page)}
            <div className="pageNumber">
              Página {index + 1} de {pages.length}
            </div>
          </div>
        ))}
        {/* Página fixa sempre como última */}
        <div className="contentMain">
          <img src={elipcedireita} alt="" className="elipcedireita" />
          <div className="editableText">
            <h3 style={{ color: '#395ba0', fontWeight: 'bold' }} contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('investimento', e.currentTarget.textContent || '')}>
              2. INVESTIMENTO
            </h3>
            <p contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('investimento', e.currentTarget.textContent || '')}>
              {paginaFixa.investimento}
            </p>
            <p style={{ fontStyle: 'italic', marginLeft: '2rem' }} contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('observacao', e.currentTarget.textContent || '')}>
              Observação: {paginaFixa.observacao}
            </p>
            <h3 style={{ color: '#395ba0', fontWeight: 'bold', marginTop: '2rem' }} contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('prazo', e.currentTarget.textContent || '')}>
              3. PRAZO DE EXECUÇÃO DOS SERVIÇOS
            </h3>
            <p contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('prazo', e.currentTarget.textContent || '')}>
              {paginaFixa.prazo}
            </p>
            <h3 style={{ color: '#395ba0', fontWeight: 'bold', marginTop: '2rem' }} contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('validade', e.currentTarget.textContent || '')}>
              4. VALIDADE DA PROPOSTA
            </h3>
            <p contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('validade', e.currentTarget.textContent || '')}>
              {paginaFixa.validade}
            </p>
            <h3 style={{ color: '#395ba0', fontWeight: 'bold', marginTop: '2rem' }} contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('condicoes', e.currentTarget.textContent || '')}>
              5. CONDIÇÕES DE PAGAMENTO
            </h3>
            <p contentEditable suppressContentEditableWarning
              onBlur={e => updatePaginaFixa('condicoes', e.currentTarget.textContent || '')}>
              {paginaFixa.condicoes}
            </p>
            <div style={{ marginTop: '3rem' }}>
              <span>Atenciosamente,</span><br /><br />
              <span style={{ fontWeight: 'bold' }} contentEditable suppressContentEditableWarning
                onBlur={e => updatePaginaFixa('assinatura', e.currentTarget.textContent || '')}>
                {paginaFixa.assinatura}
              </span>
            </div>
          </div>
          <div className="pageNumber">
            Página {pages.length + 1} de {pages.length + 1}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
