import { Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { FileText, SquareCheck as CheckSquare, Mic, CreditCard as Edit3, Image as ImageIcon, Calendar, Tag, Palette, Clock, X } from 'lucide-react-native';
import { TEMPLATES, applyTemplate, Template } from '@/utils/templates';

const NOTE_TYPES = [
  {
    id: 'text',
    title: 'Note texte',
    description: 'Créer une note texte simple',
    icon: FileText,
    color: '#4CAF50',
  },
  {
    id: 'checklist',
    title: 'Liste à cocher',
    description: 'Créer une liste de tâches',
    icon: CheckSquare,
    color: '#2196F3',
  },
  {
    id: 'voice',
    title: 'Mémo vocal',
    description: 'Enregistrer un mémo vocal',
    icon: Mic,
    color: '#FF9800',
  },
  {
    id: 'drawing',
    title: 'Dessin',
    description: 'Créer un dessin ou croquis',
    icon: Edit3,
    color: '#9C27B0',
  },
  {
    id: 'timer',
    title: 'Minuteur',
    description: 'Créer un minuteur ou chronomètre',
    icon: Clock,
    color: '#E91E63',
  },
];

const QUICK_ACTIONS = [
  {
    id: 'photo',
    title: 'Ajouter photo',
    description: 'Prendre une photo ou choisir depuis la galerie',
    icon: ImageIcon,
    color: '#FF5722',
  },
  {
    id: 'reminder',
    title: 'Rappel rapide',
    description: 'Créer un rappel avec notification',
    icon: Calendar,
    color: '#607D8B',
  },
  {
    id: 'tag',
    title: 'Organiser',
    description: 'Gérer les catégories et étiquettes',
    icon: Tag,
    color: '#795548',
  },
  {
    id: 'template',
    title: 'Modèles',
    description: 'Utiliser un modèle prédéfini',
    icon: Palette,
    color: '#E91E63',
  },
];

export default function CreateScreen() {
  const router = useRouter();
  const { categories } = useNotes();
  const [showTemplates, setShowTemplates] = useState(false);

// Animations pour les icônes
const typeAnimations = useRef<Animated.Value[]>([]);
const actionAnimations = useRef<Animated.Value[]>([]);

// Initialiser les animations
useEffect(() => {
  typeAnimations.current = NOTE_TYPES.map(() => new Animated.Value(0));
  actionAnimations.current = QUICK_ACTIONS.map(() => new Animated.Value(0));
}, []);

// Déclencher l'animation au focus
useFocusEffect(
  React.useCallback(() => {
    console.log('Create screen focused - starting animations');
    
    // Réinitialiser les animations
    typeAnimations.current.forEach(anim => anim.setValue(0));
    actionAnimations.current.forEach(anim => anim.setValue(0));
    
    // Animer les types de notes
    const noteAnimations = typeAnimations.current.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 100,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      })
    );
    
    // Animer les actions rapides
    const quickAnimations = actionAnimations.current.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: (NOTE_TYPES.length * 100) + (index * 100),
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      })
    );
    
    Animated.parallel([...noteAnimations, ...quickAnimations]).start(() => {
      console.log('Create screen animations completed');
    });
  }, [])
);

  const handleCreateNote = (type: string) => {
    switch (type) {
      case 'text':
        router.push('/editor/text');
        break;
      case 'checklist':
        router.push('/editor/checklist');
        break;
      case 'voice':
        router.push('/editor/voice');
        break;
      case 'drawing':
        router.push('/editor/drawing');
        break;
      case 'timer':
        router.push('/editor/timer');
        break;
      default:
        Alert.alert('Info', 'Cette fonctionnalité sera bientôt disponible');
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'photo':
        router.push('/editor/photo');
        break;
      case 'reminder':
        // Créer une note texte avec rappel
        router.push('/editor/text?quickReminder=true');
        break;
      case 'tag':
        router.push('/(tabs)/categories');
        break;
      case 'template':
        setShowTemplates(true);
        break;
    }
  };

  const handleApplyTemplate = (template: Template) => {
    // Remplacer les placeholders par des valeurs actuelles
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let processedTitle = template.title
      .replace(/\[Date\]/g, currentDate)
      .replace(/\[Heure\]/g, currentTime);

    let processedContent = template.content
      .replace(/\[Date\]/g, currentDate)
      .replace(/\[Heure\]/g, currentTime);

    // Naviguer vers l'éditeur de texte avec les données du modèle
    router.push({
      pathname: '/editor/text',
      params: {
        templateTitle: processedTitle,
        templateContent: processedContent,
        templateBackground: template.backgroundColor,
        templateFont: template.font,
        templateTags: template.tags.join(','),
      }
    });

    setShowTemplates(false);
  };

  const renderNoteType = (noteType: any, index: number) => {
    const IconComponent = noteType.icon;
    const animatedValue = typeAnimations.current[index] || new Animated.Value(0);
    const rotate = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  
    return (
      <TouchableOpacity
        key={noteType.id}
        style={styles.typeCard}
        onPress={() => handleCreateNote(noteType.id)}
      >
        <Animated.View 
          style={[
            styles.typeIcon, 
            { backgroundColor: noteType.color },
            { transform: [{ rotateY: rotate }] }
          ]}
        >
          <IconComponent size={24} color="#fff" />
        </Animated.View>
        <View style={styles.typeContent}>
          <Text style={styles.typeTitle}>{noteType.title}</Text>
          <Text style={styles.typeDescription}>{noteType.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuickAction = (action: any, index: number) => {
    const IconComponent = action.icon;
    const animatedValue = actionAnimations.current[index] || new Animated.Value(0);
    const rotate = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  
    return (
      <TouchableOpacity
        key={action.id}
        style={styles.quickActionCard}
        onPress={() => handleQuickAction(action.id)}
      >
        <Animated.View 
          style={[
            styles.quickActionIcon, 
            { backgroundColor: action.color },
            { transform: [{ rotateY: rotate }] }
          ]}
        >
          <IconComponent size={20} color="#fff" />
        </Animated.View>
        <View style={styles.quickActionContent}>
          <Text style={styles.quickActionTitle}>{action.title}</Text>
          <Text style={styles.quickActionDescription}>{action.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTemplate = (template: Template) => {
    return (
      <TouchableOpacity
        key={template.id}
        style={styles.templateCard}
        onPress={() => handleApplyTemplate(template)}
      >
        <View style={[styles.templatePreview, { backgroundColor: template.backgroundColor }]}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateDescription}>{template.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Créer</Text>
        <Text style={styles.headerSubtitle}>Choisissez le type de contenu à créer</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types de notes</Text>
          <View style={styles.typesGrid}>
          {NOTE_TYPES.map((noteType, index) => renderNoteType(noteType, index))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action, index) => renderQuickAction(action, index))}
          </View>
        </View>


      </ScrollView>

      {/* Modal des modèles */}
      {showTemplates && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un modèle</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
              {TEMPLATES.map(renderTemplate)}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  typesGrid: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  templatesList: {
    padding: 16,
  },
  templateCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  templatePreview: {
    padding: 16,
    minHeight: 80,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});