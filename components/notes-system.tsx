"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserDataManager, type Note } from "@/lib/user-data"
import { Plus, Edit2, Trash2, Save, X, FileText, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useLiveData } from "@/hooks/use-live-data"
import { toast } from "@/components/ui/use-toast"

interface NotesSystemProps {
  isFocusMode?: boolean
}

export function NotesSystem({ isFocusMode = false }: NotesSystemProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "" })
  const [editNote, setEditNote] = useState({ title: "", content: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  // Función para cargar notas desde la base de datos
  const loadNotes = useCallback(async (): Promise<Note[]> => {
    if (!user) return []
    try {
      const notesData = await UserDataManager.getNotes()
      // Filtrar datos válidos para evitar elementos fantasmas
      return notesData.filter(note =>
        note &&
        typeof note.id === 'number' &&
        typeof note.title === 'string' &&
        typeof note.content === 'string' &&
        (note.title.trim().length > 0 || note.content.trim().length > 0)
      )
    } catch (error) {
      console.error('Error loading notes:', error)
      return []
    }
  }, [user])

  // Usar useLiveData mejorado
  const { data: notes, isLoading, refresh, pauseAutoRefresh, resumeAutoRefresh } = useLiveData<Note[]>(
    loadNotes,
    [],
    {
      refreshInterval: 15000, // 15 segundos - más discreto
      autoRefresh: true,
      pauseOnInteraction: true
    }
  )

  const handleCreateNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return
    if (isSubmitting) return

    pauseAutoRefresh()

    try {
      setIsSubmitting(true)
      const title = newNote.title.trim() || "Nota sin título"
      const newNoteItem = await UserDataManager.addNote(title, newNote.content.trim())

      if (newNoteItem) {
        setNewNote({ title: "", content: "" })
        setIsCreating(false)
        toast({
          title: "Nota creada",
          description: "La nota se ha guardado correctamente"
        })
        await refresh()
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la nota",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating note:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la nota",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => resumeAutoRefresh(), 3000)
    }
  }

  const handleOpenEdit = (note: Note) => {
    pauseAutoRefresh()
    setEditingNote(note)
    setEditNote({ title: note.title, content: note.content })
  }

  const handleCloseEdit = () => {
    setEditingNote(null)
    setEditNote({ title: "", content: "" })
    setTimeout(() => resumeAutoRefresh(), 2000)
  }

  const handleSaveEdit = async () => {
    if (!editingNote || isSubmitting) return

    try {
      setIsSubmitting(true)
      const title = editNote.title.trim() || "Nota sin título"
      const updatedNote = await UserDataManager.updateNote(editingNote.id, title, editNote.content.trim())

      if (updatedNote) {
        handleCloseEdit()
        toast({
          title: "Nota actualizada",
          description: "Los cambios se han guardado correctamente"
        })
        await refresh()
      } else {
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (id: number) => {
    pauseAutoRefresh()

    try {
      const success = await UserDataManager.deleteNote(id)

      if (success) {
        handleCloseEdit()
        toast({
          title: "Nota eliminada",
          description: "La nota se ha eliminado correctamente"
        })
        await refresh()
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la nota",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota",
        variant: "destructive"
      })
    } finally {
      setTimeout(() => resumeAutoRefresh(), 3000)
    }
  }

  const handleOpenCreate = () => {
    pauseAutoRefresh()
    setIsCreating(true)
  }

  const handleCloseCreate = () => {
    setIsCreating(false)
    setNewNote({ title: "", content: "" })
    setTimeout(() => resumeAutoRefresh(), 2000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  if (isLoading) {
    return (
      <div className={`w-full ${isFocusMode ? "max-w-6xl" : "max-w-4xl"} mx-auto`}>
        <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-foreground/60" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`w-full ${isFocusMode ? "max-w-6xl" : "max-w-4xl"} mx-auto`}>
        <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Notas</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refresh()}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={handleOpenCreate}
                size="icon"
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Plus className="h-5 w-5" />
              </Button>

            </div>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No hay notas aún</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Crea tu primera nota</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(70vh - 150px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleOpenEdit(note)}
                    className="bg-background/40 border border-border/30 rounded-xl p-4 group hover:bg-background/60 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] min-h-[160px] max-h-[220px] flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-medium text-foreground line-clamp-2 flex-1 mr-2">
                        {note.title}
                      </h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(note)
                          }}
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 rounded-full hover:bg-blue-500/20"
                        >
                          <Edit2 className="w-3 h-3 text-blue-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {note.content && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                          {truncateContent(note.content, 100)}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/20">
                      <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                        <span>{formatDate(note.createdAt)}</span>
                        {note.updatedAt !== note.createdAt && (
                          <span className="text-blue-500/70">editada</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nueva nota */}
      <Dialog open={isCreating} onOpenChange={handleCloseCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Nueva Nota</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden">
            <Input
              placeholder="Título de la nota..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl"
              disabled={isSubmitting}
              autoFocus
            />
            <Textarea
              placeholder="Escribe tu nota aquí..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground min-h-[300px] resize-none rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
            <Button
              onClick={handleCloseCreate}
              size="sm"
              variant="ghost"
              className="rounded-xl hover:bg-gray-500/20"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNote}
              size="sm"
              className="rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30"
              disabled={isSubmitting || (!newNote.title.trim() && !newNote.content.trim())}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-500" />
              ) : (
                <Save className="w-4 h-4 mr-2 text-green-500" />
              )}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar nota */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Editar Nota</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden">
            <Input
              placeholder="Título de la nota..."
              value={editNote.title}
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
              className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl"
              disabled={isSubmitting}
            />
            <Textarea
              placeholder="Contenido de la nota..."
              value={editNote.content}
              onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
              className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground min-h-[300px] resize-none rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border/30">
            <Button
              onClick={() => editingNote && handleDeleteNote(editingNote.id)}
              size="sm"
              variant="ghost"
              className="rounded-xl hover:bg-red-500/20"
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
              Eliminar
            </Button>
            <Button
              onClick={handleCloseEdit}
              size="sm"
              variant="ghost"
              className="rounded-xl hover:bg-gray-500/20"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              size="sm"
              className="rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-500" />
              ) : (
                <Save className="w-4 h-4 mr-2 text-green-500" />
              )}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estilos CSS adicionales para line-clamp */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  )
}