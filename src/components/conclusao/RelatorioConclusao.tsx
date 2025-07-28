import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './RelatorioConclusao.css';
import elipcedireita from "/direito.svg";
import Pagina1Conclusao from './pagina1conclusao';
import type { DadosConclusao } from '../../autoRelatorio/types/global.d.ts';
import { formatarDataBrasilia } from '../../utils/formatData.ts';

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



function RelatorioConclusao() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: '1',
      destinatario: 'RD – RAIADROGASIL ENGENHARIA.ffffffffffffffffff',
      data: formatarDataBrasilia(),
      titulo: 'PROPOSTA COMERCIAL – DS0403',
      introducao: 'Prezados, pelo presente, submeto à apreciação de V.Sa., proposta comercial para a execução dos serviços em referência.',
      objeto: 'Encaminhamos o orçamento referente as adequações necessárias na filial.',
      itens: ['Pintura de portas internas', 'Pintura interna na cor branca', 'Limpeza'],
      photos: []
    },
  ]);
  const [hideRemoveItemBtns, setHideRemoveItemBtns] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    Promise.all(
      acceptedFiles.map(file => {
        return new Promise<Photo>(resolve => {
          const url = URL.createObjectURL(file);
          const img = new window.Image();
          img.onload = () => {
            const isWide = img.width > img.height * 1.5;
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

  const removePhoto = ( photoId: string) => {
    setPages(prevPages => {
      const allPhotos = prevPages.flatMap(page => page.photos).filter(photo => photo.id !== photoId);
      const newPages: Page[] = [];
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

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
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
                onClick={() => removePhoto(photo.id)}
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

  useEffect(() => {
    window.setRelatorioAuto = (dados) => {
      setPages(prevPages => {
        const newPages = [...prevPages];
        if (dados && typeof dados === 'object' && dados !== null && 'tipo' in dados) {
          // Caso DadosConclusao
          const d = dados as DadosConclusao;
          const titulo = typeof d.titulo === 'string' ? d.titulo : (newPages[1]?.titulo ?? '');
          const introducao = typeof d.subtitulo === 'string' ? d.subtitulo : (newPages[1]?.introducao ?? '');
          const objeto = typeof d.descricao === 'string' ? d.descricao : (newPages[1]?.objeto ?? '');
          if (newPages[1]) {
            newPages[1] = {
              ...newPages[1],
              titulo,
              introducao,
              objeto,
            };
          } else {
            newPages[1] = {
              id: '2',
              destinatario: '',
              data: '',
              titulo,
              introducao,
              objeto,
              itens: [],
              photos: []
            };
          }
          if (typeof d.os === 'string') {
            setFinalImage(d.os);
          }
        }
        return newPages;
      });
      // Se quiser tratar o outro tipo (DadosRelatorioInicial), adicione aqui
    };
    return () => { window.setRelatorioAuto = undefined; };
  }, []);

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
        {/* Página 1 */}
        <div key={pages[0].id} className="contentMain">
          <Pagina1Conclusao destinatario={pages[0].destinatario} data={pages[0].data} />
        </div>
        {/* Página 2 customizada */}
        <div className="contentMain">
          <img src={elipcedireita} alt="" className="elipcedireita" />
          <div className="editableText">
            <h2
              style={{ color: '#395ba0', fontWeight: 'bold', fontSize: '3.5rem', textAlign: 'center' }}
              contentEditable
              suppressContentEditableWarning
              onBlur={e => {
                setPages(prevPages => {
                  const newPages = [...prevPages];
                  if (newPages[1]) newPages[1].titulo = e.currentTarget.textContent || '';
                  return newPages;
                });
              }}
            >
              {pages[1]?.titulo || 'Título da Página 2'}
            </h2>
            <h4
              style={{ color: '#395ba0', fontWeight: 'normal', marginTop: '1rem', fontSize: '2.5rem', textAlign: 'center' }}
              contentEditable
              suppressContentEditableWarning
              onBlur={e => {
                setPages(prevPages => {
                  const newPages = [...prevPages];
                  if (newPages[1]) newPages[1].introducao = e.currentTarget.textContent || '';
                  return newPages;
                });
              }}
            >
              {pages[1]?.introducao || 'Subtítulo da Página 2'}
            </h4>
            <p
              style={{ marginTop: '1rem', fontSize: '2rem', textAlign: 'center' }}
              contentEditable
              suppressContentEditableWarning
              onBlur={e => {
                setPages(prevPages => {
                  const newPages = [...prevPages];
                  if (newPages[1]) newPages[1].objeto = e.currentTarget.textContent || '';
                  return newPages;
                });
              }}
            >
              {pages[1]?.objeto || ''}
            </p>
          </div>
        </div>
        {/* Demais páginas (fotos, etc) */}
        {pages.slice(1).map((page, index) => (
          <div key={page.id} className="contentMain">
            <img src={elipcedireita} alt="" className="elipcedireita" />
            {page.photos.length > 0 && renderPhotoGrid(page)}
            <div className="pageNumber">
              Página {index + 3} de {pages.length + 1}
            </div>
          </div>
        ))}
        {/* Página fixa final */}
        <div className="contentMain">
          <img src={elipcedireita} alt="" className="elipcedireita" />
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 2
          }}>
            {finalImage ? (
              <img
                src={finalImage}
                alt="Imagem final"
                style={{
                  maxHeight: '70%',
                  maxWidth: '70%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <label
                htmlFor="final-image-upload"
                style={{
                  border: '2px dashed #395ba0',
                  borderRadius: '10px',
                  padding: '40px',
                  cursor: 'pointer',
                  background: '#f5f5f5',
                  color: '#395ba0',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  maxWidth: '70%'
                }}
              >
                Clique ou arraste uma imagem para esta área
                <input
                  id="final-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setFinalImage(url);
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RelatorioConclusao; 