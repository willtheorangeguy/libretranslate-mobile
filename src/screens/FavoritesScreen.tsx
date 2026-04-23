import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import { Translation } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useAppDispatch } from '../hooks/useRedux';
import { setFavorites } from '../store/slices/translationSlice';

export default function FavoritesScreen() {
  const dispatch = useAppDispatch();
  const [favorites, setFavoritesState] = useState<Translation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const results = await DatabaseService.getFavorites(search);
      setFavoritesState(results);
      dispatch(setFavorites(results));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, search]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites().catch(error => {
        console.error('Favorites refresh failed:', error);
      });
    }, [loadFavorites])
  );

  const handleUnfavorite = async (id: string) => {
    await DatabaseService.toggleFavorite(id);
    await loadFavorites();
  };

  const renderItem = ({ item }: { item: Translation }) => (
    <View style={styles.card}>
      <Text style={styles.source}>{item.sourceText}</Text>
      <Text style={styles.target}>{item.translatedText}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Copy favorite translation"
          style={styles.button}
          onPress={() => Clipboard.setString(item.translatedText)}
        >
          <MaterialIcons name="content-copy" size={18} color="#007AFF" />
          <Text style={styles.buttonText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Remove from favorites"
          style={styles.button}
          onPress={() => handleUnfavorite(item.id)}
        >
          <MaterialIcons name="favorite" size={18} color="#FF3B30" />
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Search favorites"
        placeholder="Search favorites..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => {
          loadFavorites().catch(error => {
            console.error('Favorites search failed:', error);
          });
        }}
        style={styles.searchInput}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={favorites.length ? undefined : styles.centered}
          ListEmptyComponent={<Text style={styles.empty}>No favorites yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    color: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    color: '#777',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderColor: '#ECECEC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  source: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  target: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 13,
  },
});
