# Sistema de Relatório Fotográfico

Este é um sistema completo para criação de relatórios fotográficos com papel timbrado personalizado.

## Funcionalidades

### ✅ Implementadas
- **Papel timbrado**: Fundo com imagem personalizada
- **Texto editável**: Área para editar o conteúdo do relatório
- **Grid de fotos 2x6**: Cada página suporta até 12 fotos em grid
- **Paginação automática**: Novas páginas são criadas automaticamente quando necessário
- **Geração de PDF**: Exportação completa para PDF
- **Drag & Drop**: Arraste fotos diretamente para o sistema
- **Remoção de fotos**: Botão para remover fotos individuais
- **Controles intuitivos**: Interface fácil de usar

### 🎯 Características Técnicas
- **Tamanho A4**: Páginas formatadas para A4
- **Overflow corrigido**: Problema de visualização resolvido
- **Responsivo**: Funciona em diferentes tamanhos de tela
- **Zoom 100%**: Funciona perfeitamente em zoom normal

## Como Usar

### 1. Adicionar Fotos
- **Drag & Drop**: Arraste fotos diretamente para a área de upload
- **Clique para selecionar**: Clique na área de upload para abrir o seletor de arquivos
- **Formatos suportados**: JPEG, PNG, GIF, BMP

### 2. Editar Texto
- Clique na área de texto para editar
- O texto é salvo automaticamente
- Cada página tem seu próprio texto

### 3. Gerenciar Páginas
- **Adicionar página**: Clique em "Adicionar Página"
- **Paginação automática**: Novas páginas são criadas quando necessário
- **Numeração**: Cada página mostra sua posição

### 4. Gerar PDF
- Clique em "Gerar PDF"
- O sistema captura todas as páginas
- PDF é baixado automaticamente

## Estrutura do Projeto

```
src/
├── App.tsx          # Componente principal
├── App.css          # Estilos do sistema
└── ...
public/
└── direito.svg      # Imagem do papel timbrado
```

## Tecnologias Utilizadas

- **React 19**: Framework principal
- **TypeScript**: Tipagem estática
- **react-dropzone**: Upload de arquivos
- **html2canvas**: Captura de páginas
- **jsPDF**: Geração de PDF
- **CSS Grid**: Layout responsivo

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Construir para produção
npm run build
```

## Problemas Resolvidos

### ✅ Overflow e Zoom
- **Problema**: Páginas cortadas em zoom 100%
- **Solução**: Ajuste do layout com `align-items: flex-start` e `overflow-y: auto`
- **Resultado**: Visualização perfeita em qualquer zoom

### ✅ Paginação
- **Problema**: Páginas não apareciam corretamente
- **Solução**: Sistema de estado com array de páginas
- **Resultado**: Paginação automática e manual funcionando

### ✅ Grid de Fotos
- **Problema**: Layout de fotos não implementado
- **Solução**: CSS Grid 2x6 com slots numerados
- **Resultado**: Grid perfeito com 12 fotos por página

## Melhorias Futuras

- [ ] Preview em tempo real
- [ ] Templates de relatório
- [ ] Configuração de papel timbrado
- [ ] Compressão de imagens
- [ ] Histórico de versões
- [ ] Exportação em outros formatos

## Suporte

Para dúvidas ou problemas, verifique:
1. Se todas as dependências estão instaladas
2. Se o navegador suporta as APIs utilizadas
3. Se as imagens estão em formato suportado

---

**Desenvolvido para RD – RAIADROGASIL ENGENHARIA**
