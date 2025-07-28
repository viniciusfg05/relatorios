import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Corrigido: cria a pasta temp_images na raiz do projeto
const TEMP_DIR = path.resolve(process.cwd(), 'temp_images');

// Garante que a pasta temporária existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export function salvarImagemTemp(buffer: Buffer, ext: string = 'jpg'): string {
  const hash = crypto.randomUUID();
  const filename = `${hash}.${ext}`;
  const filepath = path.join(TEMP_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filename;
}

export function getImagemPath(filename: string): string {
  return path.join(TEMP_DIR, filename);
}

export function deletarImagem(filename: string) {
  const filepath = getImagemPath(filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

export function deletarImagens(filenames: string[]) {
  filenames.forEach(deletarImagem);
} 