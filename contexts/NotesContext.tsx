import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Category } from '@/types/Note';
import { saveNotes, loadNotes, saveCategories, loadCategories } from '@/utils/storage';
import NotificationService, { ReminderData } from '@/utils/notifications';

interface NotesContextType {
  notes: Note[];
  categories: Category[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  searchNotes: (query: string) => Note[];
  filterNotesByCategory: (categoryId: string) => Note[];
  filterNotesByTag: (tag: string) => Note[];
  addReminder: (noteId: string, date: Date, repeat?: 'none' | 'daily' | 'weekly' | 'monthly') => Promise<void>;
  removeReminder: (noteId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadInitialData();
    setupNotificationListeners();
  }, []);

  const loadInitialData = async () => {
    try {
      const loadedNotes = await loadNotes();
      const loadedCategories = await loadCategories();
      setNotes(loadedNotes);
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Set default categories if loading fails
      const defaultCategories: Category[] = [
        { id: '1', name: 'Général', color: '#2196F3' },
        { id: '2', name: 'Travail', color: '#4CAF50' },
        { id: '3', name: 'Personnel', color: '#FF9800' }
      ];
      setCategories(defaultCategories);
      setNotes([]);
    }
  };

  const setupNotificationListeners = () => {
    // Écouter les notifications reçues
    const notificationListener = NotificationService.addNotificationListener((notification) => {
      console.log('Notification reçue:', notification);
    });

    // Écouter les clics sur les notifications
    const responseListener = NotificationService.addNotificationResponseListener((response) => {
      const { noteId } = response.notification.request.content.data as any;
      if (noteId) {
        // Ici vous pouvez naviguer vers la note ou effectuer d'autres actions
        console.log('Notification cliquée pour la note:', noteId);
      }
    });

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  };

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    try {
      const updatedNotes = notes.map(note =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = (id: string) => {
    try {
      const noteToDelete = notes.find(note => note.id === id);
      if (noteToDelete?.reminderId) {
        NotificationService.cancelReminder(noteToDelete.reminderId);
      }
      
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const addReminder = async (noteId: string, date: Date, repeat: 'none' | 'daily' | 'weekly' | 'monthly' = 'none') => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      // Annuler l'ancien rappel s'il existe
      if (note.reminderId) {
        await NotificationService.cancelReminder(note.reminderId);
      }

      const reminderData: ReminderData = {
        id: Date.now().toString(),
        title: note.title || 'Rappel Memory Notes',
        body: note.content || 'Vous avez un rappel programmé',
        date,
        noteId,
        repeat,
      };

      let notificationId: string;
      if (repeat === 'none') {
        notificationId = await NotificationService.scheduleReminder(reminderData);
      } else {
        notificationId = await NotificationService.scheduleRepeatingReminder(reminderData);
      }

      updateNote(noteId, {
        reminder: date,
        reminderId: notificationId,
        reminderRepeat: repeat,
      });
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  };

  const removeReminder = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note?.reminderId) {
        await NotificationService.cancelReminder(note.reminderId);
      }

      updateNote(noteId, {
        reminder: undefined,
        reminderId: undefined,
        reminderRepeat: undefined,
      });
    } catch (error) {
      console.error('Error removing reminder:', error);
      throw error;
    }
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      saveCategories(updatedCategories);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = (id: string) => {
    try {
      const updatedCategories = categories.filter(category => category.id !== id);
      setCategories(updatedCategories);
      saveCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const searchNotes = (query: string): Note[] => {
    const lowercaseQuery = query.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const filterNotesByCategory = (categoryId: string): Note[] => {
    return notes.filter(note => note.category === categoryId);
  };

  const filterNotesByTag = (tag: string): Note[] => {
    return notes.filter(note => note.tags.includes(tag));
  };

  const value: NotesContextType = {
    notes,
    categories,
    addNote,
    updateNote,
    deleteNote,
    addCategory,
    deleteCategory,
    searchNotes,
    filterNotesByCategory,
    filterNotesByTag,
    addReminder,
    removeReminder,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};