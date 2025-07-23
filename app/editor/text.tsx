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
import {
  Save,
  ArrowLeft,
  Calendar,
  Tag,
  Palette,
  Lock,
  Bell,
  X,
} from 'lucide-react-native';
import ReminderPicker from '@/components/ReminderPicker';

export default function TextEditorScreen() {
  const router = useRouter();
  const { addNote, updateNote, notes, categories, addReminder, removeReminder } = useNotes();
  const { edit } = useLocalSearchParams();

  const existingNote = edit ? notes.find(note => note.id === edit) : null;

  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [selectedCategory, setSelectedCategory] = useState(existingNote?.category || categories[0]?.id || '');
  const [backgroundColor, setBackgroundColor] = useState(existingNote?.backgroundColor || '#fff');
  const [tags, setTags] = useState<string[]>(existingNote?.tags || []);
  const [isLocked, setIsLocked] = useState(existingNote?.isLocked || false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const colorOptions = [
    '#fff', '#ffebee', '#e8f5e8', '#fff3e0', '#f3e5f5', '#e0f2f1', '#fff8e1'
  ];

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour votre note');
      return;
    }

    if (existingNote) {
      // Mode édition
      updateNote(existingNote.id, {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        tags,
        backgroundColor,
        isLocked,
      });
      Alert.alert('Succès', 'Note modifiée avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      // Mode création
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        type: 'text' as const,
        category: selectedCategory,
        tags,
        backgroundColor,
        images: [],
        isLocked,
      };

      addNote(noteData);
      Alert.alert('Succès', 'Note créée avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const handleAddReminder = async (date: Date, repeat: 'none' | 'daily' | 'weekly' | 'monthly') => {
    try {
      if (existingNote) {
        await addReminder(existingNote.id, date, repeat);
        Alert.alert('Succès', 'Rappel ajouté avec succès');
      } else {
        Alert.alert('Info', 'Veuillez d\'abord sauvegarder la note avant d\'ajouter un rappel');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le rappel');
    }
  };

  const handleRemoveReminder = async () => {
    if (!existingNote?.reminderId) return;

    try {
      await removeReminder(existingNote.id);
      Alert.alert('Succès', 'Rappel supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le rappel');
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatReminderDate = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existingNote ? 'Modifier la note' : 'Nouvelle note'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          placeholder="Titre de la note"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Contenu de la note..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Rappel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Rappel</Text>
          </View>
          
          {existingNote?.reminder ? (
            <View style={styles.reminderContainer}>
              <View style={styles.reminderInfo}>
                <Calendar size={16} color="#FF9800" />
                <Text style={styles.reminderText}>
                  {formatReminderDate(existingNote.reminder)}
                </Text>
                {existingNote.reminderRepeat && existingNote.reminderRepeat !== 'none' && (
                  <Text style={styles.reminderRepeat}>
                    ({existingNote.reminderRepeat === 'daily' ? 'Tous les jours' : 
                      existingNote.reminderRepeat === 'weekly' ? 'Toutes les semaines' : 'Tous les mois'})
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleRemoveReminder} style={styles.removeReminderButton}>
                <X size={16} color="#f44336" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addReminderButton}
              onPress={() => setShowReminderPicker(true)}
            >
              <Bell size={16} color="#666" />
              <Text style={styles.addReminderText}>Ajouter un rappel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Étiquettes</Text>
          </View>
          
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <X size={12} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <TextInput
            style={styles.tagInput}
            placeholder="Ajouter une étiquette..."
            onSubmitEditing={(e) => {
              addTag(e.nativeEvent.text);
              e.currentTarget.clear();
            }}
          />
        </View>

        {/* Catégorie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégorie</Text>
          <View style={styles.categoryButtons}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Couleur de fond */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={20} color="#607D8B" />
            <Text style={styles.sectionTitle}>Couleur de fond</Text>
          </View>
          <View style={styles.colorButtons}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  backgroundColor === color && styles.colorButtonActive
                ]}
                onPress={() => setBackgroundColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Verrouillage */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={isLocked ? "#f44336" : "#4CAF50"} />
            <Text style={styles.sectionTitle}>Note verrouillée</Text>
            <TouchableOpacity
              style={[styles.lockButton, isLocked && styles.lockButtonActive]}
              onPress={() => setIsLocked(!isLocked)}
            >
              <Text style={[styles.lockButtonText, isLocked && styles.lockButtonTextActive]}>
                {isLocked ? 'Déverrouiller' : 'Verrouiller'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ReminderPicker
        visible={showReminderPicker}
        onClose={() => setShowReminderPicker(false)}
        onSave={handleAddReminder}
        initialDate={existingNote?.reminder}
        initialRepeat={existingNote?.reminderRepeat}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addReminderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  reminderRepeat: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  removeReminderButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  tagInput: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  colorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorButtonActive: {
    borderColor: '#2196F3',
    borderWidth: 3,
  },
  lockButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginLeft: 'auto',
  },
  lockButtonActive: {
    backgroundColor: '#f44336',
  },
  lockButtonText: {
    fontSize: 12,
    color: '#666',
  },
  lockButtonTextActive: {
    color: '#fff',
  },
});