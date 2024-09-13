import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'db.json')

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    let notes = []

    try {
      const data = await fs.readFile(DB_PATH, 'utf-8')
      notes = JSON.parse(data)
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json({ error: 'Database file not found' }, { status: 404 })
      }
      throw error
    }

    const updatedNotes = notes.filter((note: { id: string }) => note.id !== id)

    if (notes.length === updatedNotes.length) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    await fs.writeFile(DB_PATH, JSON.stringify(updatedNotes, null, 2))
    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: `Failed to delete note: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}
