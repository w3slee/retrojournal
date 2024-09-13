import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'db.json')

export async function GET() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    const notes = JSON.parse(data)
    return NextResponse.json(notes)
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, return an empty array
      return NextResponse.json([])
    }
    console.error('Error reading notes:', error)
    return NextResponse.json({ error: 'Failed to read notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newNote = await request.json()
    let notes = []

    try {
      const data = await fs.readFile(DB_PATH, 'utf-8')
      notes = JSON.parse(data)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }

    notes.push(newNote)
    await fs.writeFile(DB_PATH, JSON.stringify(notes, null, 2))
    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error('Error saving note:', error)
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    let notes = []

    try {
      const data = await fs.readFile(DB_PATH, 'utf-8')
      notes = JSON.parse(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
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
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}