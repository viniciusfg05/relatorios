import { useState } from 'react'
import back from '../public/timbradosvg.svg'
import './App.css'
import ImageUpload from './components/ImageUpload'

interface ImageItem {
  id: string
  src: string
  alt: string
  gridPosition: { row: number; col: number }
}

interface PageContent {
  destinatario: string
  data: string
  titulo: string
  introducao: string
  objeto: string
  itens: string[]
  images: ImageItem[]
}

function App() {
  const [pages, setPages] = useState<PageContent[]>([
    {
      destinatario: 'RD – RAIADROGASIL ENGENHARIA.',
      data: 'Brasília – DF, 22 de maio de 2025.',
      titulo: 'PROPOSTA COMERCIAL – DS0403',
      introducao: 'Prezados, pelo presente, submeto à apreciação de V.Sa., proposta comercial para a execução dos serviços em referência.',
      objeto: 'Encaminhamos o orçamento referente as adequações necessárias na filial.',
      itens: [
        'Pintura de portas internas',
        'Pintura interna na cor branca',
        'Limpeza'
      ],
      images: []
    }
  ])

  const handleContentChange = (pageIndex: number, field: string, value: string | string[]) => {
    setPages(prev => prev.map((page, index) => 
      index === pageIndex ? { ...page, [field]: value } : page
    ))
  }

  const handleItemChange = (pageIndex: number, itemIndex: number, value: string) => {
    const newPages = [...pages]
    newPages[pageIndex].itens[itemIndex] = value
    setPages(newPages)
  }

  const addItem = (pageIndex: number) => {
    const newPages = [...pages]
    newPages[pageIndex].itens.push('')
    setPages(newPages)
  }

  const removeItem = (pageIndex: number, itemIndex: number) => {
    const newPages = [...pages]
    newPages[pageIndex].itens.splice(itemIndex, 1)
    setPages(newPages)
  }

  const addImage = (pageIndex: number) => {
    const newPages = [...pages]
    const newImage: ImageItem = {
      id: Date.now().toString(),
      src: '',
      alt: '',
      gridPosition: { row: 0, col: 0 }
    }
    newPages[pageIndex].images.push(newImage)
    setPages(newPages)
  }

  const handleImageUpload = (pageIndex: number, src: string, alt: string) => {
    const newPages = [...pages]
    const newImage: ImageItem = {
      id: Date.now().toString(),
      src,
      alt,
      gridPosition: { row: 0, col: 0 }
    }
    newPages[pageIndex].images.push(newImage)
    setPages(newPages)
  }

  const handleMultipleImagesUpload = (pageIndex: number, images: { src: string; alt: string }[]) => {
    const newPages = [...pages]
    const newImages: ImageItem[] = images.map((img, index) => ({
      id: (Date.now() + index).toString(),
      src: img.src,
      alt: img.alt,
      gridPosition: { row: 0, col: 0 }
    }))
    newPages[pageIndex].images.push(...newImages)
    setPages(newPages)
  }

  const removeImage = (pageIndex: number, imageId: string) => {
    const newPages = [...pages]
    newPages[pageIndex].images = newPages[pageIndex].images.filter(img => img.id !== imageId)
    setPages(newPages)
  }

  const addPage = () => {
    const newPage: PageContent = {
      destinatario: '',
      data: '',
      titulo: '',
      introducao: '',
      objeto: '',
      itens: [],
      images: []
    }
    setPages([...pages, newPage])
  }

  const removePage = (pageIndex: number) => {
    if (pages.length > 1) {
      const newPages = pages.filter((_, index) => index !== pageIndex)
      setPages(newPages)
    }
  }

  const renderPage = (pageContent: PageContent, pageIndex: number) => (
    <div className="page" key={pageIndex}>
      <img 
        src={back} 
        alt="Papel timbrado" 
        className="background-image"
      />
      
      <div className="page-content">
        <div className="page-header">
          <h3 className="page-number">Página {pageIndex + 1}</h3>
          {pages.length > 1 && (
            <button 
              className="remove-page-btn"
              onClick={() => removePage(pageIndex)}
              title="Remover página"
            >
              ×
            </button>
          )}
        </div>

        <div className="header">
          <div className="destinatario">
            <span className="azul">À</span><br />
            <span 
              className="negrito"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleContentChange(pageIndex, 'destinatario', e.currentTarget.textContent || '')}
            >
              {pageContent.destinatario}
            </span>
          </div>
          <div 
            className="data"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange(pageIndex, 'data', e.currentTarget.textContent || '')}
          >
            {pageContent.data}
          </div>
        </div>

        <div className="conteudo">
          <h2 
            className="titulo"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange(pageIndex, 'titulo', e.currentTarget.textContent || '')}
          >
            {pageContent.titulo}
          </h2>
          
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange(pageIndex, 'introducao', e.currentTarget.textContent || '')}
          >
            {pageContent.introducao}
          </p>
          
          <h3 className="subtitulo">1. OBJETO</h3>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange(pageIndex, 'objeto', e.currentTarget.textContent || '')}
          >
            {pageContent.objeto}
          </p>
          
          <ul>
            {pageContent.itens.map((item, itemIndex) => (
              <li key={itemIndex}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemChange(pageIndex, itemIndex, e.currentTarget.textContent || '')}
                >
                  {item}
                </span>
                <button 
                  className="remove-item-btn"
                  onClick={() => removeItem(pageIndex, itemIndex)}
                  title="Remover item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button className="add-item-btn" onClick={() => addItem(pageIndex)}>
            + Adicionar Item
          </button>
        </div>

        {/* Grid de imagens */}
        <div className="image-grid">
          <h3 className="subtitulo">FOTOS DO LOCAL</h3>
          <div className="grid-container">
            {pageContent.images.map((image) => (
              <div key={image.id} className="image-item">
                {image.src ? (
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="grid-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="image-placeholder">
                    <span>Sem imagem</span>
                  </div>
                )}
                <button 
                  className="remove-image-btn"
                  onClick={() => removeImage(pageIndex, image.id)}
                  title="Remover imagem"
                >
                  ×
                </button>
              </div>
            ))}
            {pageContent.images.length < 6 && (
              <ImageUpload 
                onImageAdd={(src, alt) => handleImageUpload(pageIndex, src, alt)}
                onMultipleImagesAdd={(images) => handleMultipleImagesUpload(pageIndex, images)}
              />
            )}
          </div>
          {pageContent.images.length === 0 && (
            <button className="add-image-btn" onClick={() => addImage(pageIndex)}>
              + Adicionar Imagem por URL
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-container">
      <div className="page-controls">
        <div className="page-info">
          <span>Total de páginas: {pages.length}</span>
        </div>
        <div className="page-actions">
          <button className="add-page-btn" onClick={addPage}>
            + Adicionar Página
          </button>
          <button className="export-btn" onClick={() => window.print()}>
            Gerar PDF
          </button>
        </div>
      </div>

      <div className="pages-container">
        {pages.map((pageContent, pageIndex) => renderPage(pageContent, pageIndex))}
      </div>
    </div>
  )
}

export default App
