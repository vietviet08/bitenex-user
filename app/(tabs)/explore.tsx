import { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';
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
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      {/* Search Header */}
      <View className="px-lg py-md border-b border-border-light">
        <View className="flex-row items-center bg-neutral-100 px-md rounded-lg h-11">
          <IconSymbol name="magnifyingglass" size={20} color={colors.text.tertiary} />
          <TextInput
            className="flex-1 text-base text-text-primary ml-sm"
            style={{ paddingVertical: 0 }}
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
              <View className="px-lg pt-xl">
                <Text className="text-xl font-semibold text-text-primary mb-md">Popular Searches</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {['Bubble Tea', 'Pizza', 'Pho', 'Burger', 'Sushi', 'Coffee'].map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      className="bg-neutral-100 px-md py-sm rounded-full"
                      onPress={() => onChangeText(tag)}
                    >
                      <Text className="text-sm font-medium text-text-primary">{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cuisines */}
              <View className="px-lg pt-xl">
                <Text className="text-xl font-semibold text-text-primary mb-md">Cuisines</Text>
                <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                  {[
                    { icon: '🇻🇳', name: 'Vietnamese' },
                    { icon: '🇯🇵', name: 'Japanese' },
                    { icon: '🇰🇷', name: 'Korean' },
                    { icon: '🇮🇹', name: 'Italian' },
                    { icon: '🇹🇭', name: 'Thai' },
                    { icon: '🇨🇳', name: 'Chinese' },
                  ].map((cuisine, index) => (
                    <TouchableOpacity key={index} className="w-[30%] bg-neutral-50 p-lg rounded-lg items-center">
                      <Text className="text-[32px] mb-sm">{cuisine.icon}</Text>
                      <Text className="text-xs font-medium text-text-primary">{cuisine.name}</Text>
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
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={() =>
            !isSearching ? (
              <View className="items-center py-4xl">
                <Text className="text-xl font-semibold text-text-primary mb-sm">No results found</Text>
                <Text className="text-base text-text-tertiary">
                  Try searching for something else
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity className="flex-row items-center py-md border-b border-border-light">
              <View className="w-10 h-10 rounded-md bg-primary-50 items-center justify-center mr-md">
                <IconSymbol
                  name={item.type === 'restaurant' ? 'storefront.fill' : 'fork.knife'}
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base text-text-primary">{item.name}</Text>
                <Text className="text-sm text-text-tertiary">{item.subtitle}</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
