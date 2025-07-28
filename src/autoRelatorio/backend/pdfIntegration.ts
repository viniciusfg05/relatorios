import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import type { RelatorioDados } from '../types';
import { getImagemPath } from './tempStorage';

const FRONTEND_URL = 'http://localhost:3000/';
const PDF_OUTPUT_DIR = path.resolve(process.cwd(), 'temp_pdf');

if (!fs.existsSync(PDF_OUTPUT_DIR)) {
  fs.mkdirSync(PDF_OUTPUT_DIR, { recursive: true });
}

export async function gerarPdfViaPlaywright(dados: RelatorioDados): Promise<string> {
  // headless: false para mostrar o navegador
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(FRONTEND_URL);
  console.log('dados', dados);
  // Selecionar a aba correta
  if (dados.tipo === 'conclusao') {
    await page.click('button:has-text("Relatório de Conclusão")');
  } else {
    await page.click('button:has-text("Relatório Inicial")');
  }

  if (dados.tipo === 'conclusao') {
    // Aguarda a página 2 customizada estar no DOM
    await page.waitForFunction(() => {
      const h2 = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div > h2');
      const h4 = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div > h4');
      const p = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div > p');
      return !!h2 && !!h4 && !!p;
    });

    // Preencher os campos da página 2 customizada diretamente no DOM
    await page.evaluate((dados) => {
      const h2 = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div > h2');
      if (h2 && dados.titulo) h2.textContent = dados.titulo;
      const h4 = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div > h4');
      if (h4 && dados.subtitulo) h4.textContent = dados.subtitulo;
      const p = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div > p');
      if (p && dados.descricao) p.textContent = dados.descricao;
    }, dados);
  } else if (dados.tipo === 'inicial') {
    // Aguarda a primeira e segunda página estarem no DOM
    await page.waitForFunction(() => {
      const h2 = document.querySelector('#root > div > div.containerMain > main > div:nth-child(1) > div.editableText > h2');
      const pServico = document.querySelector('#root > div > div.containerMain > main > div:nth-child(1) > div.editableText > p:nth-child(6)');
      const ulItens = document.querySelector('#root > div > div.containerMain > main > div:nth-child(1) > div.editableText > ul');
      const pValor = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div.editableText > p:nth-child(2)');
      return !!h2 && !!pServico && !!ulItens && !!pValor;
    });

    await page.evaluate((dados) => {
      // Loja
      const h2 = document.querySelector('#root > div > div.containerMain > main > div:nth-child(1) > div.editableText > h2');
      if (h2 && dados.loja) h2.textContent = `PROPOSTA COMERCIAL – ${dados.loja}`;
      // Serviço
      const pServico = document.querySelector('#root > div > div.containerMain > main > div:nth-child(1) > div.editableText > p:nth-child(6)');
      if (pServico && dados.servico) pServico.textContent = `Encaminhamos o orçamento referente ${dados.servico}`;
      // Itens
      const ulItens = document.querySelector('#root > div > div.containerMain > main > div:nth-child(1) > div.editableText > ul');
      if (ulItens && Array.isArray(dados.itens)) {
        // Remove todos os itens atuais
        while (ulItens.firstChild) ulItens.removeChild(ulItens.firstChild);
        // Adiciona os novos itens
        dados.itens.forEach(item => {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.textContent = item;
          li.appendChild(span);
          ulItens.appendChild(li);
        });
      }
      // Valor
      const pValor = document.querySelector('#root > div > div.containerMain > main > div:nth-child(2) > div.editableText > p:nth-child(2)');
      if (pValor && dados.valor) pValor.textContent = dados.valor;
    }, dados);
  }

  // Aguarda um pequeno delay para garantir que o DOM não será sobrescrito
  await page.waitForTimeout(700);

  // Upload das imagens do relatório (exceto OS)
  if (dados.imagens && dados.imagens.length > 0) {
    // Dropzone da primeira página de fotos
    const inputFile = await page.$('input[type="file"]');
    if (inputFile) {
      const filePaths = dados.imagens.map(getImagemPath);
      await inputFile.setInputFiles(filePaths);
    }
  }

  // Upload da OS (apenas para conclusão)
  if (dados.tipo === 'conclusao' && dados.os) {
    // Busca a última página .contentMain e procura o input[type=file] dentro do label
    const osInput = await page.$('div.containerMain main > div.contentMain:last-child label input[type="file"]');
    if (osInput) {
      await osInput.setInputFiles([getImagemPath(dados.os)]);
    }
  }

  // Clicar no botão para ocultar os botões de remover itens antes de gerar o PDF
  await page.click('#root > div > div.containerMain > div > button:nth-child(3)');

  // Clicar no botão de gerar PDF (terceiro botão dentro da div .controls)
  await page.waitForSelector('.controls button');
  const buttons = await page.$$('.controls button');
  if (buttons.length >= 3) {
    await buttons[2].click();
  } else {
    throw new Error('Botão de gerar PDF não encontrado!');
  }

  // Esperar o download do PDF
  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    // O clique acima já dispara o download
  ]);

  const pdfPath = path.join(PDF_OUTPUT_DIR, `relatorio_${Date.now()}.pdf`);
  await download.saveAs(pdfPath);

  // Não fecha o navegador para você poder ver o resultado
  // await browser.close();
  return pdfPath;
} 