import { apiClient } from './api-client';

export interface UserData {
  username: string;
  todos: Todo[];
  notes: Note[];
  pomodoroSessions: PomodoroSession[];
}

export interface Todo {
  id: number; // ID del servidor
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Note {
  id: number; // ID del servidor
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: number; // ID del servidor
  type: "focus" | "break";
  duration: number;
  completedAt: string;
}

export class UserDataManager {
  // TODOS - Operaciones directas con la base de datos
  static async getTodos(): Promise<Todo[]> {
    try {
      const response = await apiClient.getItems('todo');
      return (response.items || []).map((item: any) => ({
        id: item.id,
        text: item.data.text,
        completed: item.data.completed || false,
        createdAt: item.data.createdAt || item.createdAt,
        updatedAt: item.data.updatedAt || item.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  }

  static async addTodo(text: string): Promise<Todo | null> {
    try {
      const todoData = {
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      const response = await apiClient.createItem('todo', todoData);

      return {
        id: response.item.id,
        text: response.item.data.text,
        completed: response.item.data.completed,
        createdAt: response.item.data.createdAt,
        updatedAt: response.item.data.updatedAt
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      return null;
    }
  }

  static async toggleTodo(id: number): Promise<Todo | null> {
    try {
      // Primero obtener el todo actual
      const todos = await this.getTodos();
      const currentTodo = todos.find(t => t.id === id);

      if (!currentTodo) return null;

      const updatedData = {
        text: currentTodo.text,
        completed: !currentTodo.completed,
        createdAt: currentTodo.createdAt,
        updatedAt: new Date().toISOString()
      };

      const response = await apiClient.updateItem(id, updatedData);

      return {
        id: response.item.id,
        text: response.item.data.text,
        completed: response.item.data.completed,
        createdAt: response.item.data.createdAt,
        updatedAt: response.item.data.updatedAt
      };
    } catch (error) {
      console.error('Error toggling todo:', error);
      return null;
    }
  }

  static async updateTodo(id: number, text: string): Promise<Todo | null> {
    try {
      // Obtener el todo actual para preservar otros datos
      const todos = await this.getTodos();
      const currentTodo = todos.find(t => t.id === id);

      if (!currentTodo) return null;

      const updatedData = {
        text: text.trim(),
        completed: currentTodo.completed,
        createdAt: currentTodo.createdAt,
        updatedAt: new Date().toISOString()
      };

      const response = await apiClient.updateItem(id, updatedData);

      return {
        id: response.item.id,
        text: response.item.data.text,
        completed: response.item.data.completed,
        createdAt: response.item.data.createdAt,
        updatedAt: response.item.data.updatedAt
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      return null;
    }
  }

  static async deleteTodo(id: number): Promise<boolean> {
    try {
      await apiClient.deleteItem(id);
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  }

  // NOTES - Operaciones directas con la base de datos
  static async getNotes(): Promise<Note[]> {
    try {
      const response = await apiClient.getItems('note');
      return (response.items || []).map((item: any) => ({
        id: item.id,
        title: item.data.title,
        content: item.data.content,
        createdAt: item.data.createdAt || item.createdAt,
        updatedAt: item.data.updatedAt || item.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }

  static async addNote(title: string, content: string): Promise<Note | null> {
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await apiClient.createItem('note', noteData);

      return {
        id: response.item.id,
        title: response.item.data.title,
        content: response.item.data.content,
        createdAt: response.item.data.createdAt,
        updatedAt: response.item.data.updatedAt
      };
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  }

  static async updateNote(id: number, title: string, content: string): Promise<Note | null> {
    try {
      // Obtener la nota actual para preservar createdAt
      const notes = await this.getNotes();
      const currentNote = notes.find(n => n.id === id);

      if (!currentNote) return null;

      const updatedData = {
        title: title.trim(),
        content: content.trim(),
        createdAt: currentNote.createdAt,
        updatedAt: new Date().toISOString()
      };

      const response = await apiClient.updateItem(id, updatedData);

      return {
        id: response.item.id,
        title: response.item.data.title,
        content: response.item.data.content,
        createdAt: response.item.data.createdAt,
        updatedAt: response.item.data.updatedAt
      };
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  }

  static async deleteNote(id: number): Promise<boolean> {
    try {
      await apiClient.deleteItem(id);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  // POMODORO SESSIONS - Operaciones directas con la base de datos
  static async getPomodoroSessions(): Promise<PomodoroSession[]> {
    try {
      const response = await apiClient.getItems('pomodoro');
      return (response.items || []).map((item: any) => ({
        id: item.id,
        type: item.data.type,
        duration: item.data.duration,
        completedAt: item.data.completedAt || item.createdAt
      }));
    } catch (error) {
      console.error('Error fetching pomodoro sessions:', error);
      return [];
    }
  }

  static async addPomodoroSession(type: "focus" | "break", duration: number): Promise<PomodoroSession | null> {
    try {
      const sessionData = {
        type,
        duration,
        completedAt: new Date().toISOString()
      };

      const response = await apiClient.createItem('pomodoro', sessionData);

      return {
        id: response.item.id,
        type: response.item.data.type,
        duration: response.item.data.duration,
        completedAt: response.item.data.completedAt
      };
    } catch (error) {
      console.error('Error creating pomodoro session:', error);
      return null;
    }
  }

  // Obtener todos los datos del usuario de una vez
  static async getUserData(): Promise<UserData | null> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const [todos, notes, sessions] = await Promise.all([
        this.getTodos(),
        this.getNotes(),
        this.getPomodoroSessions()
      ]);

      return {
        username: currentUser,
        todos,
        notes,
        pomodoroSessions: sessions
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  // Solo para el usuario actual - mantener en localStorage únicamente
  static getCurrentUser(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('currentUser');
  }

  static setCurrentUser(username: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentUser', username.trim());
  }

  static clearCurrentUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }
}