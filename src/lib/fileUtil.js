// src/lib/fileUtils.js
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function ensureTempDir() {
  const tempDir = path.join(process.cwd(), 'tmp');
  try {
    await mkdir(tempDir, { recursive: true });
    return tempDir;
  } catch (error) {
    console.error('Failed to create temp directory:', error);
    throw error;
  }
}
