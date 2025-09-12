"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserDataManager, type Todo } from "@/lib/user-data"
import { Plus, Check, X, Edit2, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useLiveData } from "@/hooks/use-live-data"
import { toast } from "@/components/ui/use-toast"

interface TodoListProps {
  isFocusMode?: boolean
}

export function TodoList({ isFocusMode = false }: TodoListProps) {
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  // Función para cargar todos desde la base de datos
  const loadTodos = useCallback(async (): Promise<Todo[]> => {
    if (!user) return []
    try {
      const todosData = await UserDataManager.getTodos()
      // Filtrar datos válidos para evitar elementos fantasmas
      return todosData.filter(todo =>
        todo &&
        typeof todo.id === 'number' &&
        typeof todo.text === 'string' &&
        todo.text.trim().length > 0 &&
        typeof todo.completed === 'boolean'
      )
    } catch (error) {
      console.error('Error loading todos:', error)
      return []
    }
  }, [user])

  // Usar useLiveData mejorado
  const { data: todos, isLoading, refresh, pauseAutoRefresh, resumeAutoRefresh } = useLiveData<Todo[]>(
    loadTodos,
    [],
    {
      refreshInterval: 15000, // 15 segundos - más discreto
      autoRefresh: true,
      pauseOnInteraction: true
    }
  )

  const handleAddTodo = async () => {
    if (!newTodo.trim() || isSubmitting) return

    pauseAutoRefresh()

    try {
      setIsSubmitting(true)
      const newTodoItem = await UserDataManager.addTodo(newTodo.trim())

      if (newTodoItem) {
        setNewTodo("")
        toast({
          title: "Tarea creada",
          description: "La tarea se ha añadido correctamente"
        })
        await refresh()
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la tarea",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => resumeAutoRefresh(), 3000)
    }
  }

  const handleToggleTodo = async (id: number) => {
    pauseAutoRefresh()

    try {
      const updatedTodo = await UserDataManager.toggleTodo(id)

      if (updatedTodo) {
        toast({
          title: "Tarea actualizada",
          description: updatedTodo.completed ? "Tarea completada" : "Tarea marcada como pendiente"
        })
        await refresh()
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar la tarea",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive"
      })
    } finally {
      setTimeout(() => resumeAutoRefresh(), 3000)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    pauseAutoRefresh()

    try {
      const success = await UserDataManager.deleteTodo(id)

      if (success) {
        toast({
          title: "Tarea eliminada",
          description: "La tarea se ha eliminado correctamente"
        })
        await refresh()
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la tarea",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      })
    } finally {
      setTimeout(() => resumeAutoRefresh(), 3000)
    }
  }

  const handleStartEdit = (todo: Todo) => {
    pauseAutoRefresh()
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingId || isSubmitting) return

    try {
      setIsSubmitting(true)
      const updatedTodo = await UserDataManager.updateTodo(editingId, editText.trim())

      if (updatedTodo) {
        setEditingId(null)
        setEditText("")
        toast({
          title: "Tarea actualizada",
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
      console.error('Error updating todo:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => resumeAutoRefresh(), 3000)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText("")
    setTimeout(() => resumeAutoRefresh(), 2000)
  }

  if (isLoading) {
    return (
      <div className={`w-full ${isFocusMode ? "max-w-4xl" : "max-w-2xl"} mx-auto`}>
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-foreground/60" />
          </div>
        </div>
      </div>
    )
  }

  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  return (
    <div className={`w-full ${isFocusMode ? "max-w-4xl" : "max-w-2xl"} mx-auto`}>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Tareas</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refresh()}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Add new todo */}
        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Nueva tarea..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
            onFocus={() => pauseAutoRefresh()}
            className="flex-1 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
            disabled={isSubmitting}
          />
          <Button
            onClick={handleAddTodo}
            size="icon"
            disabled={isSubmitting || !newTodo.trim()}
            className="rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Pending todos */}
        {pendingTodos.length > 0 && (
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Pendientes</h3>
            {pendingTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 bg-background/30 border border-border/30 rounded-lg group hover:bg-background/50 transition-colors"
              >
                <Button
                  onClick={() => handleToggleTodo(todo.id)}
                  size="icon"
                  variant="ghost"
                  className="w-5 h-5 rounded-full border border-border/50 hover:bg-primary/20 hover:border-primary/50"
                >
                  <div className="w-2 h-2 rounded-full bg-transparent" />
                </Button>

                {editingId === todo.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                      onFocus={() => pauseAutoRefresh()}
                      className="flex-1 bg-background/50 border-border/50 text-foreground"
                      disabled={isSubmitting}
                      autoFocus
                    />
                    <Button
                      onClick={handleSaveEdit}
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-full hover:bg-green-500/20"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                      ) : (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 rounded-full hover:bg-red-500/20"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-foreground">{todo.text}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        onClick={() => handleStartEdit(todo)}
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full hover:bg-blue-500/20"
                      >
                        <Edit2 className="w-3 h-3 text-blue-500" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteTodo(todo.id)}
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full hover:bg-red-500/20"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Completed todos */}
        {completedTodos.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Completadas</h3>
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 bg-background/20 border border-border/20 rounded-lg group hover:bg-background/30 transition-colors opacity-60"
              >
                <Button
                  onClick={() => handleToggleTodo(todo.id)}
                  size="icon"
                  variant="ghost"
                  className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/50 hover:bg-green-500/30"
                >
                  <Check className="w-3 h-3 text-green-500" />
                </Button>
                <span className="flex-1 text-muted-foreground line-through">{todo.text}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleDeleteTodo(todo.id)}
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 rounded-full hover:bg-red-500/20"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {todos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay tareas aún</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Agrega tu primera tarea arriba</p>
          </div>
        )}

        {/* Estadísticas */}
        {todos.length > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground pt-2 mt-4 border-t border-border/30">
            <span>Total: {todos.length}</span>
            <span>Completadas: {completedTodos.length}</span>
            <span>Pendientes: {pendingTodos.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}