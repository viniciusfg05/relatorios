import React, { useRef } from 'react'

interface ImageUploadProps {
  onImageAdd: (src: string, alt: string) => void
  onMultipleImagesAdd: (images: { src: string; alt: string }[]) => void
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageAdd, onMultipleImagesAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      if (files.length === 1) {
        // Upload de uma imagem
        const file = files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          const src = e.target?.result as string
          onImageAdd(src, file.name)
        }
        reader.readAsDataURL(file)
      } else {
        // Upload de múltiplas imagens
        const imagePromises = Array.from(files).map(file => {
          return new Promise<{ src: string; alt: string }>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              resolve({ src, alt: file.name })
            }
            reader.readAsDataURL(file)
          })
        })

        Promise.all(imagePromises).then(images => {
          onMultipleImagesAdd(images)
        })
      }
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      if (imageFiles.length === 1) {
        // Upload de uma imagem
        const file = imageFiles[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          const src = e.target?.result as string
          onImageAdd(src, file.name)
        }
        reader.readAsDataURL(file)
      } else {
        // Upload de múltiplas imagens
        const imagePromises = imageFiles.map(file => {
          return new Promise<{ src: string; alt: string }>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              resolve({ src, alt: file.name })
            }
            reader.readAsDataURL(file)
          })
        })

        Promise.all(imagePromises).then(images => {
          onMultipleImagesAdd(images)
        })
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <div 
      className="image-upload-area"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="upload-content">
        <div className="upload-icon">📷</div>
        <p>Arraste imagens aqui</p>
        <small>ou</small>
        <button 
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Selecionar Imagens
        </button>
        <small>Suporta JPG, PNG, GIF</small>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUpload 