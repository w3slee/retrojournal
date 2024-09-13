'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Folder, Save, Trash, FileDown, ChevronRight, Menu } from "lucide-react"
import { jsPDF } from "jspdf"

type Note = {
  id: string
  title: string
  content: string
  category: string
  timestamp: string
}

const categories = ['Life', 'Ideas', 'Finance', 'Personal', 'Brain Dump']

export default function JournalApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
      setError('Failed to load notes. Please try again.')
    }
  }

  const handleSave = async () => {
    if (!currentTitle.trim() || !currentNote.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title: currentTitle,
      content: currentNote,
      category: selectedCategory,
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }

      setNotes([...notes, newNote])
      setCurrentTitle('')
      setCurrentNote('')
      setError(null)
    } catch (error) {
      console.error('Error saving note:', error)
      setError('Failed to save note. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setNotes(notes.filter(note => note.id !== id))
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null)
      }
      setError(null)
    } catch (error) {
      console.error('Error deleting note:', error)
      setError('Failed to delete note. Please try again.')
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    let yOffset = 10

    notes.filter(note => note.category === selectedCategory).forEach((note, index) => {
      if (index > 0) {
        if (yOffset > 280) {
          doc.addPage()
          yOffset = 10
        } else {
          yOffset += 10
        }
      }

      doc.setFontSize(14)
      doc.text(note.title, 10, yOffset)
      yOffset += 7

      doc.setFontSize(12)
      doc.text(note.category, 10, yOffset)
      yOffset += 7

      doc.setFontSize(10)
      doc.text(new Date(note.timestamp).toLocaleString(), 10, yOffset)
      yOffset += 7

      doc.setFontSize(11)
      const splitContent = doc.splitTextToSize(note.content, 180)
      doc.text(splitContent, 10, yOffset)
      yOffset += splitContent.length * 7
    })

    doc.save(`${selectedCategory}_notes.pdf`)
  }

  return (
    <div className="flex flex-col h-screen bg-amber-50 text-amber-900 md:flex-row">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar */}
      <div className={`w-full md:w-64 bg-amber-100 p-4 border-r border-amber-200 ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <h1 className="text-2xl font-bold mb-4">Retro Journal</h1>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "secondary" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => {
              setSelectedCategory(category)
              setIsSidebarOpen(false)
            }}
          >
            <Folder className="mr-2 h-4 w-4" />
            {category}
          </Button>
        ))}
        <Button
          variant="outline"
          className="w-full justify-start mt-4"
          onClick={handleExportPDF}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Note list */}
          <div className="w-full md:w-1/3 pr-0 md:pr-4 mb-4 md:mb-0 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">{selectedCategory} Notes</h2>
            {notes
              .filter((note) => note.category === selectedCategory)
              .map((note) => (
                <div
                  key={note.id}
                  className="mb-2 p-2 bg-amber-100 rounded cursor-pointer hover:bg-amber-200 flex justify-between items-center"
                  onClick={() => setSelectedNote(note)}
                >
                  <span className="truncate">{note.title}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </div>
              ))}
          </div>
          {/* Note content */}
          <div className="w-full md:w-2/3 md:pl-4 md:border-l border-amber-200 overflow-auto">
            {selectedNote ? (
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedNote.title}</h3>
                <p className="text-sm text-amber-700 mb-4">
                  {new Date(selectedNote.timestamp).toLocaleString()}
                </p>
                <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleDelete(selectedNote.id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Note
                </Button>
              </div>
            ) : (
              <div className="text-center text-amber-700">Select a note to view its content</div>
            )}
          </div>
        </div>
        {/* Note creation form */}
        <div className="mt-4">
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Enter note title..."
            className="w-full p-2 mb-2 border border-amber-300 rounded"
          />
          <div className="flex flex-col md:flex-row">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Write your thoughts here..."
              className="flex-1 mb-2 md:mb-0 md:mr-2"
            />
            <Button onClick={handleSave} className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}