import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { ChecklistItem } from '@/types/Note';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Square
} from 'lucide-react-native';

export default function ChecklistEditorScreen() {
  const router = useRouter();
  const { addNote, updateNote, notes, categories } = useNotes();
  const { edit } = useLocalSearchParams();

  const existingNote = edit ? notes.find(note => note.id === edit) : null;

  const [title, setTitle] = useState(existingNote?.title || '');
  const [items, setItems] = useState<ChecklistItem[]>(
    existingNote?.checklistItems || [{ id: '1', text: '', completed: false }]
  );
  const [selectedCategory, setSelectedCategory] = useState(existingNote?.category || categories[0]?.id || '');

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, text: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleSave = () => {
    const validItems = items.filter(item => item.text.trim().length > 0);

    if (!title.trim() && validItems.length === 0) {
      Alert.alert('Erreur', 'Veuillez saisir au moins un titre ou un élément');
      return;
    }

    const content = validItems
      .map(item => `${item.completed ? '✓' : '○'} ${item.text}`)
      .join('\n');

    if (existingNote) {
      // Mode édition
      updateNote(existingNote.id, {
        title: title.trim() || 'Liste sans titre',
        content,
        category: selectedCategory,
        checklistItems: validItems,
      });
      Alert.alert('Succès', 'Liste modifiée avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      // Mode création
      addNote({
        title: title.trim() || 'Liste sans titre',
        content,
        type: 'checklist',
        category: selectedCategory,
        tags: [],
        backgroundColor: '#ffffff',
        images: [],
        checklistItems: validItems,
        isLocked: false,
      });
      Alert.alert('Succès', 'Liste sauvegardée avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const renderChecklistItem = (item: ChecklistItem, index: number) => (
    <View key={item.id} style={styles.checklistItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleItem(item.id)}
      >
        {item.completed ? (
          <Check size={16} color="#4CAF50" />
        ) : (
          <Square size={16} color="#666" />
        )}
      </TouchableOpacity>

      <TextInput
        style={[
          styles.itemInput,
          item.completed && styles.itemInputCompleted
        ]}
        placeholder={`Élément ${index + 1}...`}
        value={item.text}
        onChangeText={(text) => updateItem(item.id, text)}
        multiline
      />

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Trash2 size={16} color="#f44336" />
      </TouchableOpacity>
    </View>
  );

  const completedCount = items.filter(item => item.completed && item.text.trim()).length;
  const totalCount = items.filter(item => item.text.trim()).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{existingNote ? 'Modifier la liste' : 'Nouvelle liste'}</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          placeholder="Titre de la liste..."
          value={title}
          onChangeText={setTitle}
          multiline
        />

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progression: {completedCount}/{totalCount}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }
              ]}
            />
          </View>
        </View>

        <View style={styles.checklistContainer}>
          {items.map((item, index) => renderChecklistItem(item, index))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Plus size={20} color="#2196F3" />
          <Text style={styles.addButtonText}>Ajouter un élément</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>Catégorie:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  { backgroundColor: category.color },
                  selectedCategory === category.id && styles.categoryOptionSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryOptionText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 25,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    textAlignVertical: 'top',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  checklistContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  itemInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
    textAlignVertical: 'top',
  },
  itemInputCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#e3f2fd',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    opacity: 0.7,
  },
  categoryOptionSelected: {
    opacity: 1,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});