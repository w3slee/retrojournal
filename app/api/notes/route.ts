import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

const readFileSafely = async (path: string): Promise<string | null> => {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

export async function GET(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const data = await readFileSafely(DB_PATH);
  if (!data) {
    return response.json({ error: 'Failed to read notes' }, { status: 500 });
  }

  const notes = JSON.parse(data);
  return response.json(notes);
}
