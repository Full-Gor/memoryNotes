export interface DrawingElement {
  id: string;
  type: 'path' | 'circle' | 'rect' | 'text';
  points?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  fontSize?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checklist' | 'drawing' | 'voice' | 'timer';
  category: string;
  tags: string[];
  backgroundColor: string;
  images: string[];
  audioPath?: string;
  checklistItems?: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
  isLocked: boolean;
  reminder?: Date;
  reminderId?: string; // ID de la notification programmée
  reminderRepeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  timerDuration?: number; // en minutes
  timerStartTime?: Date;
  isTimerActive?: boolean;
  drawingElements?: DrawingElement[];
  font?: string; // police d'écriture
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}