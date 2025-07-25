import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/types/Note';
import { Search, X, Clock, Tag, Filter } from 'lucide-react-native';

export default function SearchScreen() {
  const { notes, searchNotes, categories } = useNotes();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Obtenir tous les tags uniques
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags))
  ).sort();

  useEffect(() => {
    if (searchQuery.trim()) {
      let results = searchNotes(searchQuery);

      // Filtrer par tags sélectionnés
      if (selectedTags.length > 0) {
        results = results.filter(note =>
          selectedTags.some(tag => note.tags.includes(tag))
        );
      }

      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedTags, notes]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const renderSearchResult = ({ item }: { item: Note }) => {
    const category = categories.find(cat => cat.id === item.category);

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => router.push(`/note/${item.id}`)}
      >
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title || 'Note sans titre'}
        </Text>
        <Text style={styles.resultContent} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.resultFooter}>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          )}

          <Text style={styles.resultDate}>
            {item.updatedAt.toLocaleDateString()}
          </Text>
        </View>

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRecentSearch = (search: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentItem}
      onPress={() => handleSearch(search)}
    >
      <Clock size={16} color="#666" />
      <Text style={styles.recentText}>{search}</Text>
    </TouchableOpacity>
  );

  const renderTag = (tag: string) => (
    <TouchableOpacity
      key={tag}
      style={[
        styles.filterTag,
        selectedTags.includes(tag) && styles.filterTagSelected
      ]}
      onPress={() => toggleTag(tag)}
    >
      <Tag size={14} color={selectedTags.includes(tag) ? '#fff' : '#666'} />
      <Text style={[
        styles.filterTagText,
        selectedTags.includes(tag) && styles.filterTagTextSelected
      ]}>
        {tag}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recherche</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher dans vos notes..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? '#fff' : '#666'} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filtrer par tags:</Text>
          <View style={styles.tagsFilter}>
            {allTags.map(renderTag)}
          </View>
          {selectedTags.length > 0 && (
            <TouchableOpacity
              style={styles.clearFilters}
              onPress={() => setSelectedTags([])}
            >
              <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {searchQuery.trim() === '' ? (
        <View style={styles.emptySearch}>
          {recentSearches.length > 0 && (
            <View style={styles.recentSearches}>
              <Text style={styles.recentTitle}>Recherches récentes</Text>
              {recentSearches.map(renderRecentSearch)}
            </View>
          )}

          <View style={styles.searchTips}>
            <Text style={styles.tipsTitle}>Conseils de recherche:</Text>
            <Text style={styles.tipText}>• Recherchez par titre, contenu ou tags</Text>
            <Text style={styles.tipText}>• Utilisez les filtres pour affiner</Text>
            <Text style={styles.tipText}>• Les résultats sont triés par pertinence</Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} trouvé{searchResults.length !== 1 ? 's' : ''}
          </Text>

          {searchResults.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
              <Text style={styles.noResultsSubtext}>
                Essayez avec d'autres mots-clés
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tagsFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  filterTagSelected: {
    backgroundColor: '#2196F3',
  },
  filterTagText: {
    fontSize: 14,
    color: '#666',
  },
  filterTagTextSelected: {
    color: '#fff',
  },
  clearFilters: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#2196F3',
  },
  emptySearch: {
    flex: 1,
    padding: 20,
  },
  recentSearches: {
    marginBottom: 32,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  recentText: {
    fontSize: 16,
    color: '#666',
  },
  searchTips: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  resultCard: {
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
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resultContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  resultFooter: {
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
  resultDate: {
    fontSize: 12,
    color: '#999',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
  },
});