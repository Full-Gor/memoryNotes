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
  Type,
  FileText,
  Bold,
  Italic,
  Underline,
  Highlighter,
} from 'lucide-react-native';
import ReminderPicker from '@/components/ReminderPicker';
import { FONTS, getFontStyle } from '@/utils/fonts';
import { TEMPLATES, applyTemplate, Template } from '@/utils/templates';



export default function TextEditorScreen() {
  const router = useRouter();
  const { addNote, updateNote, notes, categories, addReminder, removeReminder } = useNotes();
  const { edit, templateTitle, templateContent, templateBackground, templateFont, templateTags } = useLocalSearchParams();

  const existingNote = edit ? notes.find(note => note.id === edit) : null;

  // Fonction pour convertir les paramètres en string
  const getStringParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0] || '';
    return param || '';
  };

  const [title, setTitle] = useState(existingNote?.title || getStringParam(templateTitle) || '');
  const [content, setContent] = useState(existingNote?.content || getStringParam(templateContent) || '');
  const [selectedCategory, setSelectedCategory] = useState(existingNote?.category || categories[0]?.id || '');
  const [backgroundColor, setBackgroundColor] = useState(existingNote?.backgroundColor || getStringParam(templateBackground) || '#fff');
  const [tags, setTags] = useState<string[]>(existingNote?.tags || (getStringParam(templateTags) ? getStringParam(templateTags).split(',').filter((tag: string) => tag.trim()) : []));
  const [isLocked, setIsLocked] = useState(existingNote?.isLocked || false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState(existingNote?.font || getStringParam(templateFont) || 'System');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  
  // États pour le formatage (mode toggle)
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);

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
        font: selectedFont,
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
        font: selectedFont,
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

  const handleApplyTemplate = (template: Template) => {
    const templateData = applyTemplate(template);

    // Remplacer les placeholders par des valeurs actuelles
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let processedTitle = templateData.title
      .replace(/\[Date\]/g, currentDate)
      .replace(/\[Heure\]/g, currentTime);

    let processedContent = templateData.content
      .replace(/\[Date\]/g, currentDate)
      .replace(/\[Heure\]/g, currentTime);

    setTitle(processedTitle);
    setContent(processedContent);
    setBackgroundColor(templateData.backgroundColor);
    setSelectedFont(templateData.font);
    setTags(templateData.tags);
    setShowTemplatePicker(false);

    Alert.alert('Modèle appliqué', `Le modèle "${template.name}" a été appliqué avec succès !`);
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
        <View style={styles.titleContainer}>
          <TextInput
            style={[
              styles.titleInput, 
              getFontStyle(selectedFont),
              isBold && styles.titleBold,
              isItalic && styles.titleItalic,
              isUnderline && styles.titleUnderline,
              isHighlight && styles.titleHighlight,
            ]}
            placeholder="Titre de la note"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.formattingButtons}>
            <TouchableOpacity 
              style={[styles.formatButton, isBold && styles.formatButtonActive]}
              onPress={() => setIsBold(!isBold)}
            >
              <Bold size={16} color={isBold ? "#2196F3" : "#666"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.formatButton, isItalic && styles.formatButtonActive]}
              onPress={() => setIsItalic(!isItalic)}
            >
              <Italic size={16} color={isItalic ? "#2196F3" : "#666"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.formatButton, isUnderline && styles.formatButtonActive]}
              onPress={() => setIsUnderline(!isUnderline)}
            >
              <Underline size={16} color={isUnderline ? "#2196F3" : "#666"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.formatButton, isHighlight && styles.formatButtonActive]}
              onPress={() => setIsHighlight(!isHighlight)}
            >
              <Highlighter size={16} color={isHighlight ? "#2196F3" : "#666"} />
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[
            styles.contentInput, 
            getFontStyle(selectedFont),
            isBold && styles.contentBold,
            isItalic && styles.contentItalic,
            isUnderline && styles.contentUnderline,
            isHighlight && styles.contentHighlight,
          ]}
          placeholder="Contenu de la note..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Espacement */}
        <View style={styles.separator} />

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
              e.currentTarget.setNativeProps({ text: '' });
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

        {/* Modèles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Modèles</Text>
          </View>

          {showTemplatePicker ? (
            <View style={styles.templatePickerContainer}>
              <ScrollView
                style={styles.templateScrollView}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.templateOption}
                    onPress={() => handleApplyTemplate(template)}
                  >
                    <View style={[styles.templatePreview, { backgroundColor: template.backgroundColor }]}>
                      <Text style={[styles.templateName, getFontStyle(template.font)]}>
                        {template.name}
                      </Text>
                      <Text style={styles.templateDescription}>
                        {template.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.cancelTemplateButton}
                onPress={() => setShowTemplatePicker(false)}
              >
                <Text style={styles.cancelTemplateText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.templateSelector}
              onPress={() => setShowTemplatePicker(true)}
            >
              <Text style={styles.templateSelectorText}>
                Choisir un modèle
              </Text>
              <FileText size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Police d'écriture */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Type size={20} color="#795548" />
            <Text style={styles.sectionTitle}>Police d'écriture</Text>
          </View>

          {showFontPicker ? (
            <View style={styles.fontPickerContainer}>
              {FONTS.map((font) => (
                <TouchableOpacity
                  key={font.value}
                  style={[
                    styles.fontOption,
                    selectedFont === font.value && styles.fontOptionActive
                  ]}
                  onPress={() => {
                    setSelectedFont(font.value);
                    setShowFontPicker(false);
                  }}
                >
                  <Text style={[
                    styles.fontOptionText,
                    selectedFont === font.value && styles.fontOptionTextActive,
                    getFontStyle(font.value)
                  ]}>
                    {font.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.cancelFontButton}
                onPress={() => setShowFontPicker(false)}
              >
                <Text style={styles.cancelFontText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.fontSelector}
              onPress={() => setShowFontPicker(true)}
            >
              <Text style={[
                styles.fontSelectorText,
                getFontStyle(selectedFont)
              ]}>
                {FONTS.find(f => f.value === selectedFont)?.name || 'Par défaut'}
              </Text>
              <Type size={16} color="#666" />
            </TouchableOpacity>
          )}
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
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 25,
  },
  saveButton: {
    padding: 8,
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
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  formattingButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  formatButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formatButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  titleBold: {
    fontWeight: 'bold',
  },
  titleItalic: {
    fontStyle: 'italic',
  },
  titleUnderline: {
    textDecorationLine: 'underline',
  },
  titleHighlight: {
    backgroundColor: '#fff3cd',
  },

  contentBold: {
    fontWeight: 'bold',
  },
  contentItalic: {
    fontStyle: 'italic',
  },
  contentUnderline: {
    textDecorationLine: 'underline',
  },
  contentHighlight: {
    backgroundColor: '#fff3cd',
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  separator: {
    height: 20,
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
  fontSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fontSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  fontPickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  fontOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  fontOptionActive: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  fontOptionText: {
    fontSize: 16,
    color: '#333',
  },
  fontOptionTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  cancelFontButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelFontText: {
    fontSize: 14,
    color: '#666',
  },
  templateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  templatePickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    maxHeight: 250,
    zIndex: 1000,
  },
  templateScrollView: {
    maxHeight: 200,
  },
  templateOption: {
    marginBottom: 6,
  },
  templatePreview: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  cancelTemplateButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelTemplateText: {
    fontSize: 14,
    color: '#666',
  },
});