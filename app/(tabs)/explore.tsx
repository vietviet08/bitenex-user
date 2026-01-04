/**
 * Explore Screen
 * Search and discovery for restaurants and dishes
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, textStyles, borderRadius } from '@/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { debounce } from '@/utils';

// Placeholder search result type
interface SearchResult {
  id: string;
  type: 'restaurant' | 'dish';
  name: string;
  subtitle: string;
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      // TODO: Implement actual search API call
      console.log('[Explore] Searching for:', query);
      setIsSearching(false);

      // Placeholder results
      setResults([
        { id: '1', type: 'restaurant', name: 'Sample Restaurant', subtitle: 'Vietnamese • 2.5km' },
        { id: '2', type: 'dish', name: 'Pho Bo', subtitle: 'Traditional beef noodle soup' },
      ]);
    }, 300),
    []
  );

  const onChangeText = (text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
    handleSearch(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, dishes..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {searchQuery.length === 0 ? (
        // Default state - Popular searches & categories
        <FlatList
          data={[]}
          keyExtractor={() => 'empty'}
          ListHeaderComponent={() => (
            <>
              {/* Popular Searches */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Searches</Text>
                <View style={styles.tagsContainer}>
                  {['Bubble Tea', 'Pizza', 'Pho', 'Burger', 'Sushi', 'Coffee'].map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tag}
                      onPress={() => onChangeText(tag)}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cuisines */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cuisines</Text>
                <View style={styles.cuisinesGrid}>
                  {[
                    { icon: '🇻🇳', name: 'Vietnamese' },
                    { icon: '🇯🇵', name: 'Japanese' },
                    { icon: '🇰🇷', name: 'Korean' },
                    { icon: '🇮🇹', name: 'Italian' },
                    { icon: '🇹🇭', name: 'Thai' },
                    { icon: '🇨🇳', name: 'Chinese' },
                  ].map((cuisine, index) => (
                    <TouchableOpacity key={index} style={styles.cuisineCard}>
                      <Text style={styles.cuisineIcon}>{cuisine.icon}</Text>
                      <Text style={styles.cuisineName}>{cuisine.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
          renderItem={() => null}
        />
      ) : (
        // Search results
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContent}
          ListEmptyComponent={() =>
            !isSearching ? (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching for something else
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem}>
              <View style={styles.resultIcon}>
                <IconSymbol
                  name={item.type === 'restaurant' ? 'storefront.fill' : 'fork.knife'}
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    paddingVertical: 0,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  cuisinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cuisineCard: {
    width: '30%',
    backgroundColor: colors.neutral[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cuisineIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cuisineName: {
    ...textStyles.labelSmall,
    color: colors.text.primary,
  },
  resultsContent: {
    padding: spacing.lg,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  resultSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
});
