import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  ScrollView,
  TextInput,
  PanResponder,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  Trash2,
  Palette,
  Circle,
  Square,
  Type,
  Minus,
  Plus,
  X,
} from 'lucide-react-native';
import Svg, { Path, Circle as SvgCircle, Rect, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.6;

interface DrawingElement {
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

export default function DrawingEditorScreen() {
  const router = useRouter();
  const { addNote, updateNote, notes, categories } = useNotes();
  const { edit } = useLocalSearchParams();

  const existingNote = edit ? notes.find(note => note.id === edit) : null;

  const [title, setTitle] = useState(existingNote?.title || 'Mon dessin');
  const [selectedCategory, setSelectedCategory] = useState(existingNote?.category || categories[0]?.id || '');
  const [backgroundColor, setBackgroundColor] = useState(existingNote?.backgroundColor || '#fff');

  // Drawing states
  const [elements, setElements] = useState<DrawingElement[]>(existingNote?.drawingElements || []);
  const [currentTool, setCurrentTool] = useState<'pen' | 'circle' | 'rect' | 'text'>('pen');
  const [strokeColor, setStrokeColor] = useState('#000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fillColor, setFillColor] = useState('#fff');
  const [fontSize, setFontSize] = useState(16);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  // Drawing state
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<DrawingElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingElement[][]>([]);

  const colorOptions = [
    '#000', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
    '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548'
  ];

  const toolOptions = [
    { id: 'pen', icon: Palette, label: 'Stylo' },
    { id: 'circle', icon: Circle, label: 'Cercle' },
    { id: 'rect', icon: Square, label: 'Rectangle' },
    { id: 'text', icon: Type, label: 'Texte' },
  ];

  const saveToHistory = useCallback((newElements: DrawingElement[]) => {
    setUndoStack(prev => [...prev, elements]);
    setRedoStack([]);
  }, [elements]);

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const newUndoStack = [...undoStack];
      const previousState = newUndoStack.pop()!;
      setRedoStack(prev => [...prev, elements]);
      setElements(previousState);
      setUndoStack(newUndoStack);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop()!;
      setUndoStack(prev => [...prev, elements]);
      setElements(nextState);
      setRedoStack(newRedoStack);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Effacer le dessin',
      'Êtes-vous sûr de vouloir effacer tout le dessin ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer', style: 'destructive', onPress: () => {
            saveToHistory(elements);
            setElements([]);
          }
        },
      ]
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;

      if (currentTool === 'pen') {
        setIsDrawing(true);
        setCurrentPath(`M ${locationX} ${locationY}`);
      } else if (currentTool === 'circle' || currentTool === 'rect') {
        setIsDrawing(true);
        setCurrentPath(`M ${locationX} ${locationY}`);
      } else if (currentTool === 'text') {
        setTextPosition({ x: locationX, y: locationY });
        setShowTextInput(true);
      }
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing) return;

      const { locationX, locationY } = evt.nativeEvent;

      if (currentTool === 'pen') {
        setCurrentPath(prev => `${prev} L ${locationX} ${locationY}`);
      }
    },
    onPanResponderRelease: (evt) => {
      if (!isDrawing) return;

      const { locationX, locationY } = evt.nativeEvent;

      if (currentTool === 'pen') {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'path',
          points: currentPath,
          strokeColor,
          strokeWidth,
        };
        saveToHistory(elements);
        setElements(prev => [...prev, newElement]);
        setCurrentPath('');
        setIsDrawing(false);
      } else if (currentTool === 'circle') {
        const startX = parseFloat(currentPath.split(' ')[1]);
        const startY = parseFloat(currentPath.split(' ')[2]);
        const radius = Math.sqrt(Math.pow(locationX - startX, 2) + Math.pow(locationY - startY, 2));
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'circle',
          x: startX,
          y: startY,
          radius,
          strokeColor,
          strokeWidth,
          fillColor,
        };
        saveToHistory(elements);
        setElements(prev => [...prev, newElement]);
        setCurrentPath('');
        setIsDrawing(false);
      } else if (currentTool === 'rect') {
        const startX = parseFloat(currentPath.split(' ')[1]);
        const startY = parseFloat(currentPath.split(' ')[2]);
        const width = locationX - startX;
        const height = locationY - startY;
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'rect',
          x: startX,
          y: startY,
          width,
          height,
          strokeColor,
          strokeWidth,
          fillColor,
        };
        saveToHistory(elements);
        setElements(prev => [...prev, newElement]);
        setCurrentPath('');
        setIsDrawing(false);
      }
    },
  });

  const handleAddText = () => {
    if (textInput.trim()) {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'text',
        x: textPosition.x,
        y: textPosition.y,
        text: textInput,
        strokeColor,
        strokeWidth: 1,
        fontSize,
      };
      saveToHistory(elements);
      setElements(prev => [...prev, newElement]);
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour votre dessin');
      return;
    }

    if (existingNote) {
      updateNote(existingNote.id, {
        title: title.trim(),
        drawingElements: elements,
        category: selectedCategory,
        backgroundColor,
      });
      Alert.alert('Succès', 'Dessin modifié avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      addNote({
        title: title.trim(),
        content: 'Dessin créé avec l\'éditeur de dessin',
        type: 'drawing',
        category: selectedCategory,
        tags: [],
        backgroundColor,
        images: [],
        isLocked: false,
        drawingElements: elements,
      });
      Alert.alert('Succès', 'Dessin créé avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const renderElement = (element: DrawingElement) => {
    switch (element.type) {
      case 'path':
        return (
          <Path
            d={element.points}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            fill="none"
          />
        );
      case 'circle':
        return (
          <SvgCircle
            cx={element.x}
            cy={element.y}
            r={element.radius}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            fill={element.fillColor || 'none'}
          />
        );
      case 'rect':
        return (
          <Rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            fill={element.fillColor || 'none'}
          />
        );
      case 'text':
        return (
          <SvgText
            x={element.x}
            y={element.y}
            fontSize={element.fontSize}
            fill={element.strokeColor}
            stroke="none"
          >
            {element.text}
          </SvgText>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Titre du dessin"
          placeholderTextColor="#666"
        />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Tools */}
      <View style={styles.toolsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {toolOptions.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolButton,
                currentTool === tool.id && styles.toolButtonActive
              ]}
              onPress={() => setCurrentTool(tool.id as any)}
            >
              <tool.icon size={20} color={currentTool === tool.id ? '#fff' : '#666'} />
              <Text style={[
                styles.toolLabel,
                currentTool === tool.id && styles.toolLabelActive
              ]}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Color and Size Controls */}
      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                strokeColor === color && styles.colorButtonActive
              ]}
              onPress={() => setStrokeColor(color)}
            />
          ))}
        </ScrollView>

        <View style={styles.sizeControls}>
          <TouchableOpacity
            style={styles.sizeButton}
            onPress={() => setStrokeWidth(Math.max(1, strokeWidth - 1))}
          >
            <Minus size={16} color="#666" />
          </TouchableOpacity>
          <Text style={styles.sizeText}>{strokeWidth}</Text>
          <TouchableOpacity
            style={styles.sizeButton}
            onPress={() => setStrokeWidth(strokeWidth + 1)}
          >
            <Plus size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <View {...panResponder.panHandlers} style={styles.canvas}>
          <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            {/* Background */}
            <Rect
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill={backgroundColor}
              stroke="#ddd"
              strokeWidth={1}
            />

            {/* Drawing elements */}
            {elements.map(renderElement)}

            {/* Current drawing */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
              />
            )}
          </Svg>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.undoButton]}
          onPress={handleUndo}
          disabled={undoStack.length === 0}
        >
          <Undo size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.redoButton]}
          onPress={handleRedo}
          disabled={redoStack.length === 0}
        >
          <Redo size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClear}
        >
          <Trash2 size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Text Input Modal */}
      {showTextInput && (
        <View style={styles.textInputModal}>
          <View style={styles.textInputContainer}>
            <Text style={styles.textInputTitle}>Ajouter du texte</Text>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Saisissez votre texte..."
              multiline
            />
            <View style={styles.textInputButtons}>
              <TouchableOpacity
                style={styles.textInputButton}
                onPress={() => setShowTextInput(false)}
              >
                <X size={20} color="#666" />
                <Text style={styles.textInputButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.textInputButton, styles.textInputButtonPrimary]}
                onPress={handleAddText}
              >
                <Text style={styles.textInputButtonTextPrimary}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginTop: 20,
  },
  headerButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
    marginTop: 20,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 25,
  },
  toolsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  toolButtonActive: {
    backgroundColor: '#2196F3',
  },
  toolLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  toolLabelActive: {
    color: '#fff',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorButtonActive: {
    borderColor: '#2196F3',
    borderWidth: 3,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  canvas: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoButton: {
    backgroundColor: '#FF9800',
  },
  redoButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  textInputModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '80%',
  },
  textInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  textInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  textInputButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  textInputButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  textInputButtonTextPrimary: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
}); 