import { create, Whatsapp } from 'venom-bot';
import type { Message } from 'venom-bot';
import path from 'path';
import { salvarImagemTemp } from '../tempStorage';
import { getConversa, setConversa, resetConversa } from '../stateManager';
import type { ConversaContexto, RelatorioTipo } from '../../types';
import { gerarPdfViaPlaywright } from '../pdfIntegration';

function criarContexto(usuarioId: string, tipo: RelatorioTipo): ConversaContexto {
  return {
    usuarioId,
    estado: 'aguardando_dados_texto',
    dados: {
      tipo,
      imagens: [],
    },
  };
}

async function responderFluxo(client: Whatsapp, usuarioId: string, contexto: ConversaContexto, message: Message) {
  const { estado, dados } = contexto;

  if (estado === 'aguardando_tipo') {
    if (/conclusao/i.test(message.body)) {
      const novoContexto = criarContexto(usuarioId, 'conclusao');
      setConversa(usuarioId, novoContexto);
      client.sendText(usuarioId, 'Quais qual serviço foi realizado? Retorne desta forma:\nTitulo:\nSubtitulo:\nDescrição:');
    } else if (/custo/i.test(message.body)) {
      const novoContexto = criarContexto(usuarioId, 'inicial');
      setConversa(usuarioId, novoContexto);
      client.sendText(usuarioId, 'Me envie os dados da loja e o serviço.\nExemplo:\nLoja: ...\nServiço: ...\nDescrição:\n- item1\n- item2\nvalor: R$ ...');
    } else {
      client.sendText(usuarioId, 'Qual tipo de relatório deseja fazer? ("Fazer Relatorio de conclusao" ou "Fazer Relatorio de Custo")');
    }
    return;
  }

  if (estado === 'aguardando_dados_texto') {
    if (dados.tipo === 'conclusao') {
      // Espera: Titulo, Subtitulo, Descrição
      const match = message.body.match(/Titulo:\s*(.*)\nSubtitulo:\s*(.*)\nDescrição:\s*([\s\S]*)/i);
      if (match) {
        dados.titulo = match[1].trim();
        dados.subtitulo = match[2].trim();
        dados.descricao = match[3].trim();
        contexto.estado = 'aguardando_imagens';
        setConversa(usuarioId, contexto);
        client.sendText(usuarioId, 'Ok recebido, agora me envie as fotos do relatório de conclusão. Envie todas as fotos.');
      } else {
        client.sendText(usuarioId, 'Formato inválido. Por favor, envie conforme o exemplo:\nTitulo: ...\nSubtitulo: ...\nDescrição: ...');
      }
    } else if (dados.tipo === 'inicial') {
      // Espera: Loja, Serviço, Descrição (itens), Valor
      const lojaMatch = message.body.match(/Loja:\s*(.*)/i);
      const servicoMatch = message.body.match(/Serviço:\s*(.*)/i);
      const valorMatch = message.body.match(/valor:\s*(.*)/i);
      const descricaoMatch = message.body.match(/Descrição:\s*([\s\S]*)valor:/i);
      if (lojaMatch && servicoMatch && valorMatch && descricaoMatch) {
        dados.loja = lojaMatch[1].trim();
        dados.servico = servicoMatch[1].trim();
        dados.valor = valorMatch[1].trim();
        // Itens da descrição
        dados.itens = descricaoMatch[1].split(/\n|\r/).map(i => i.replace(/^-\s*/, '').trim()).filter(Boolean);
        contexto.estado = 'aguardando_imagens';
        setConversa(usuarioId, contexto);
        client.sendText(usuarioId, 'Ok recebido, agora me envie as fotos do relatório inicial. Envie todas as fotos e, quando terminar, envie "Pronto".');
      } else {
        client.sendText(usuarioId, 'Formato inválido. Por favor, envie conforme o exemplo:\nLoja: ...\nServiço: ...\nDescrição:\n- item1\n- item2\nvalor: R$ ...');
      }
    }
    return;
  }

  if (estado === 'aguardando_imagens') {
    if (dados.tipo === 'conclusao') {
      client.sendText(usuarioId, 'Envie as fotos do relatório de conclusão. Quando terminar, envie "Pronto".');
    } else {
      client.sendText(usuarioId, 'Envie as fotos do relatório inicial. Quando terminar, envie "Pronto".');
    }
    return;
  }

  if (estado === 'aguardando_os') {
    client.sendText(usuarioId, 'Agora me envie a OS (foto única que será colocada na última página do relatório).');
    return;
  }

  if (estado === 'gerando_pdf') {
    client.sendText(usuarioId, 'Gerando PDF... (em breve integração com PDF)');
    // TODO: Chamar integração com PDF
    return;
  }

  if (estado === 'aguardando_confirmacao') {
    client.sendText(usuarioId, 'O PDF está correto? Responda "Sim" para finalizar ou "Editar" para alterar algum campo.');
    return;
  }

  if (estado === 'finalizado') {
    client.sendText(usuarioId, 'Relatório finalizado! Se quiser iniciar outro, envie "Fazer Relatorio de conclusao" ou "Fazer Relatorio de Custo".');
    resetConversa(usuarioId);
    return;
  }
}

// Função utilitária para normalizar texto (remover acentos e deixar minúsculo)
function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Inicializa o Venom
create(
  'relatorio-bot',
  undefined,
  undefined,
  {
    headless: 'new',
    folderNameToken: 'tokens',
    mkdirFolderToken: path.resolve(process.cwd(), '.venom'),
  }
).then((client: Whatsapp) => {
  console.log('Venom iniciado!');

  client.onMessage(async (message: Message) => {
    const usuarioId = message.from;
    let contexto = getConversa(usuarioId);

    // Início de conversa ou reset
    if (!contexto) {
      // Normaliza a mensagem para comparar ignorando maiúsculas/minúsculas, acentos e espaços extras
      const texto = normalizarTexto(message.body || '');
      if (texto === 'fazer relatorio de conclusao') {
        contexto = {
          usuarioId,
          estado: 'aguardando_dados_texto',
          dados: { tipo: 'conclusao', imagens: [] },
        };
        setConversa(usuarioId, contexto);
        client.sendText(usuarioId, 'Quais qual serviço foi realizado? Retorne desta forma:\nTitulo:\nSubtitulo:\nDescrição:');
        return;
      } else if (texto === 'fazer relatorio de custo') {
        contexto = {
          usuarioId,
          estado: 'aguardando_dados_texto',
          dados: { tipo: 'inicial', imagens: [] },
        };
        setConversa(usuarioId, contexto);
        client.sendText(usuarioId, 'Me envie os dados da loja e o serviço.\nExemplo:\nLoja: ...\nServiço: ...\nDescrição:\n- item1\n- item2\nvalor: R$ ...');
        return;
      } else {
        // Não envia nenhuma mensagem se não for uma mensagem de início válida
        return;
      }
    }

    // Se for imagem
    if (message.type === 'image') {
      if (contexto.estado === 'aguardando_imagens') {
        const buffer = await client.decryptFile(message);
        const ext = message.mimetype?.split('/')[1] || 'jpg';
        const filename = salvarImagemTemp(buffer, ext);
        contexto.dados.imagens.push(filename);
        setConversa(usuarioId, contexto);
        client.sendText(usuarioId, 'Imagem recebida! Envie mais fotos ou envie "Pronto" para finalizar o envio das imagens.');
      } else if (contexto.estado === 'aguardando_os') {
        const buffer = await client.decryptFile(message);
        const ext = message.mimetype?.split('/')[1] || 'jpg';
        const filename = salvarImagemTemp(buffer, ext);
        contexto.dados.os = filename;
        contexto.estado = 'gerando_pdf';
        setConversa(usuarioId, contexto);
        client.sendText(usuarioId, 'OS recebida! Gerando o relatório...');
        // Geração automática do PDF
        try {
          const pdfPath = await gerarPdfViaPlaywright(contexto.dados);
          await client.sendFile(usuarioId, pdfPath, 'relatorio.pdf', 'Aqui está o relatório gerado!');
          contexto.estado = 'aguardando_confirmacao';
          setConversa(usuarioId, contexto);
          client.sendText(usuarioId, 'O PDF está correto? Responda "Sim" para finalizar ou "Editar" para alterar algum campo.');
        } catch (err) {
          client.sendText(usuarioId, 'Erro ao gerar o PDF automaticamente: ' + err);
        }
      } else {
        client.sendText(usuarioId, 'Ainda não é hora de enviar imagens. Siga o fluxo do relatório.');
      }
      return;
    }

    // Se for texto
    if (message.type === 'chat') {
      // Se usuário enviar "Reiniciar" em qualquer momento
      if (/reiniciar/i.test(message.body)) {
        resetConversa(usuarioId);
        // Não envia nenhuma mensagem após reiniciar
        return;
      }
      // Se usuário enviar "Pronto" após imagens
      if (contexto.estado === 'aguardando_imagens' && /pronto/i.test(message.body)) {
        if (contexto.dados.tipo === 'conclusao') {
          contexto.estado = 'aguardando_os';
          setConversa(usuarioId, contexto);
          client.sendText(usuarioId, 'Ok, agora me envie a OS (foto única que será colocada na última página do relatório).');
        } else {
          contexto.estado = 'gerando_pdf';
          setConversa(usuarioId, contexto);
          client.sendText(usuarioId, 'Recebido! Gerando o relatório...');
          // Geração automática do PDF
          try {
            const pdfPath = await gerarPdfViaPlaywright(contexto.dados);
            await client.sendFile(usuarioId, pdfPath, 'relatorio.pdf', 'Aqui está o relatório gerado!');
            contexto.estado = 'aguardando_confirmacao';
            setConversa(usuarioId, contexto);
            client.sendText(usuarioId, 'O PDF está correto? Responda "Sim" para finalizar ou "Editar" para alterar algum campo.');
          } catch (err) {
            client.sendText(usuarioId, 'Erro ao gerar o PDF automaticamente: ' + err);
          }
        }
        return;
      }
      await responderFluxo(client, usuarioId, contexto, message);
      return;
    }

    client.sendText(usuarioId, 'Tipo de mensagem não suportado. Envie texto ou imagem conforme o fluxo do relatório.');
  });

}).catch((error) => {
  console.error('Erro ao iniciar o Venom:', error);
}); 