// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { ErrnoException } from 'node:errno';

const DB_PATH = path.join(process.cwd(), 'db.json');

export async function DELETE(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const id = request.query.id;
  let notes = [];
  if (error instanceof ErrnoException === 'ENOENT') {
    return response.status(404).json({ error: 'Database file not found' });
  }

  const updatedNotes = notes.filter((note: { id: string }) => note.id !== id);

  if (notes.length === updatedNotes.length) {
    return response.status(404).json({ error: 'Note not found' });
  }

  await fs.writeFile(DB_PATH, JSON.stringify(updatedNotes, null, 2));
  return response.json({ message: 'Note deleted successfully' });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error deleting note:', error);
    return response.status(500).json({ error: 'Failed to delete note' });
  } else {
    throw new Error('An unknown error occurred');
  }
}
