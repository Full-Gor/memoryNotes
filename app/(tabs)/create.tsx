import React, { useState } from 'react';
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
import { FileText, SquareCheck as CheckSquare, Mic, CreditCard as Edit3, Image as ImageIcon, Calendar, Tag, Palette, Clock } from 'lucide-react-native';

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
        Alert.alert('Info', 'Modèles bientôt disponibles');
        break;
    }
  };

  const renderNoteType = (noteType: any) => {
    const IconComponent = noteType.icon;
    
    return (
      <TouchableOpacity
        key={noteType.id}
        style={styles.typeCard}
        onPress={() => handleCreateNote(noteType.id)}
      >
        <View style={[styles.typeIcon, { backgroundColor: noteType.color }]}>
          <IconComponent size={24} color="#fff" />
        </View>
        <View style={styles.typeContent}>
          <Text style={styles.typeTitle}>{noteType.title}</Text>
          <Text style={styles.typeDescription}>{noteType.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuickAction = (action: any) => {
    const IconComponent = action.icon;
    
    return (
      <TouchableOpacity
        key={action.id}
        style={styles.quickActionCard}
        onPress={() => handleQuickAction(action.id)}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
          <IconComponent size={20} color="#fff" />
        </View>
        <View style={styles.quickActionContent}>
          <Text style={styles.quickActionTitle}>{action.title}</Text>
          <Text style={styles.quickActionDescription}>{action.description}</Text>
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
            {NOTE_TYPES.map(renderNoteType)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(renderQuickAction)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{categories.length}</Text>
              <Text style={styles.statLabel}>Catégories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Notes possibles</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});