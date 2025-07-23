import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/types/Note';
import { CreditCard as Edit3, Trash2, Lock, Calendar, Mic, Image, SquareCheck as CheckSquare, Clock } from 'lucide-react-native';
import CurrentTime from '@/components/CurrentTime';
import ActiveTimers from '@/components/ActiveTimers';
import ActiveReminders from '@/components/ActiveReminders';

export default function HomeScreen() {
  const { notes, deleteNote, categories } = useNotes();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'list'>('categories');

  // Handle potential errors
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Une erreur s'est produite</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredNotes = selectedCategory === 'all'
    ? notes
    : notes.filter(note => note.category === selectedCategory);

  // Grouper les notes par catégorie
  const notesByCategory = categories.map(category => ({
    ...category,
    notes: notes.filter(note => note.category === category.id),
    count: notes.filter(note => note.category === category.id).length
  }));

  // Ajouter la catégorie "Toutes" avec toutes les notes
  const allCategory = {
    id: 'all',
    name: 'Toutes les notes',
    color: '#666',
    notes: notes,
    count: notes.length
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Supprimer la note',
      'Êtes-vous sûr de vouloir supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteNote(noteId) },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checklist':
        return <CheckSquare size={16} color="#666" />;
      case 'voice':
        return <Mic size={16} color="#666" />;
      case 'drawing':
        return <Edit3 size={16} color="#666" />;
      case 'timer':
        return <Clock size={16} color="#E91E63" />;
      default:
        return null;
    }
  };

  const renderNote = ({ item }: { item: Note }) => {
    const category = categories.find(cat => cat.id === item.category);

    return (
      <TouchableOpacity
        style={[styles.noteCard, { backgroundColor: item.backgroundColor || '#fff' }]}
        onPress={() => router.push(`/note/${item.id}`)}
      >
        <View style={styles.noteHeader}>
          <View style={styles.noteTypeContainer}>
            {getTypeIcon(item.type)}
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title || 'Note sans titre'}
            </Text>
          </View>
          <View style={styles.noteActions}>
            {item.isLocked && <Lock size={16} color="#666" />}
            {item.reminder && <Calendar size={16} color="#FF9800" />}
            <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
              <Trash2 size={16} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.noteContent} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={styles.noteFooter}>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          )}

          <View style={styles.noteMetadata}>
            {item.images.length > 0 && (
              <View style={styles.metadataItem}>
                <Image size={14} color="#666" />
                <Text style={styles.metadataText}>{item.images.length}</Text>
              </View>
            )}
            {item.audioPath && (
              <View style={styles.metadataItem}>
                <Mic size={14} color="#666" />
              </View>
            )}
          </View>
        </View>

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.tag}>
                #{tag}
              </Text>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.tag}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryCard = ({ item }: { item: any }) => {
    const recentNotes = item.notes
      .sort((a: Note, b: Note) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 3);

    return (
      <TouchableOpacity
        style={[styles.categoryCard, { borderLeftColor: item.color }]}
        onPress={() => {
          setSelectedCategory(item.id);
          setViewMode('list');
        }}
      >
        <View style={styles.categoryCardHeader}>
          <View style={styles.categoryCardInfo}>
            <Text style={styles.categoryCardTitle}>{item.name}</Text>
            <Text style={styles.categoryCardCount}>{item.count} notes</Text>
          </View>
          <View style={[styles.categoryCardIcon, { backgroundColor: item.color }]}>
            <Text style={styles.categoryCardIconText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {recentNotes.length > 0 && (
          <View style={styles.recentNotes}>
            {recentNotes.map((note: Note, index: number) => (
              <View key={note.id} style={styles.recentNoteItem}>
                <Text style={styles.recentNoteTitle} numberOfLines={1}>
                  {note.title || 'Note sans titre'}
                </Text>
                <Text style={styles.recentNoteDate}>
                  {new Date(note.updatedAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {item.count > 3 && (
          <Text style={styles.moreNotesText}>
            +{item.count - 3} autres notes
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memory Notes</Text>
        <CurrentTime />
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'categories' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('categories')}
          >
            <Text style={[styles.viewModeButtonText, viewMode === 'categories' && styles.viewModeButtonTextActive]}>
              Catégories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewModeButtonText, viewMode === 'list' && styles.viewModeButtonTextActive]}>
              Liste
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ActiveTimers />
      <ActiveReminders />

      {viewMode === 'categories' ? (
        <>
          <View style={styles.categoriesHeader}>
            <Text style={styles.categoriesTitle}>Catégories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.manageCategoriesText}>Gérer</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[allCategory, ...notesByCategory]}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>
              {selectedCategory === 'all' ? 'Toutes les notes' : 
               categories.find(cat => cat.id === selectedCategory)?.name || 'Notes'}
            </Text>
            <TouchableOpacity onPress={() => setViewMode('categories')}>
              <Text style={styles.backToCategoriesText}>Retour aux catégories</Text>
            </TouchableOpacity>
          </View>

          {filteredNotes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Aucune note trouvée</Text>
              <Text style={styles.emptyStateSubtext}>
                Appuyez sur + pour créer votre première note
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())}
              renderItem={renderNote}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.notesList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  viewModeButtonActive: {
    backgroundColor: '#2196F3',
  },
  viewModeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  viewModeButtonTextActive: {
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  manageCategoriesText: {
    fontSize: 14,
    color: '#2196F3',
  },
  categoriesList: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryCardInfo: {
    flex: 1,
  },
  categoryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryCardCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentNotes: {
    marginBottom: 8,
  },
  recentNoteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  recentNoteTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  recentNoteDate: {
    fontSize: 12,
    color: '#666',
  },
  moreNotesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backToCategoriesText: {
    fontSize: 14,
    color: '#2196F3',
  },
  notesList: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  noteMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});