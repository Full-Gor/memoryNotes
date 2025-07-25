import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, Category } from '@/types/Note';

const NOTES_KEY = 'memory_notes';
const CATEGORIES_KEY = 'memory_categories';

export const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
};

export const loadNotes = async (): Promise<Note[]> => {
  try {
    const notesJson = await AsyncStorage.getItem(NOTES_KEY);
    if (notesJson) {
      const notes = JSON.parse(notesJson);
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        reminder: note.reminder ? new Date(note.reminder) : undefined,
        timerStartTime: note.timerStartTime ? new Date(note.timerStartTime) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

export const loadCategories = async (): Promise<Category[]> => {
  try {
    const categoriesJson = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (categoriesJson) {
      return JSON.parse(categoriesJson);
    }
    return [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([NOTES_KEY, CATEGORIES_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};