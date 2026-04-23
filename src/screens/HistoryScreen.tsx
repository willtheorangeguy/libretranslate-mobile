import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { DatabaseService } from '../services/DatabaseService';
import { Translation } from '../types';
import { useAppDispatch } from '../hooks/useRedux';
import { setFavorites, setHistory } from '../store/slices/translationSlice';

const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleString();

export default function HistoryScreen() {
  const dispatch = useAppDispatch();
  const [history, setHistoryState] = useState<Translation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const results = await DatabaseService.getHistory(search);
      setHistoryState(results);
      dispatch(setHistory(results));
      dispatch(setFavorites(results.filter(item => item.isFavorite)));
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert('Error', 'Unable to load translation history.');
    } finally {
      setLoading(false);
    }
  }, [dispatch, search]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().catch(error => {
        console.error('History refresh failed:', error);
      });
    }, [loadHistory])
  );

  const handleToggleFavorite = async (item: Translation) => {
    await DatabaseService.toggleFavorite(item.id);
    await loadHistory();
  };

  const handleClearHistory = () => {
    Alert.alert('Clear history', 'Delete all translation history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await DatabaseService.clearHistory();
          await loadHistory();
        },
      },
    ]);
  };

  const handleExport = async () => {
    try {
      await DatabaseService.shareHistoryExport();
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export failed', 'Could not export translation history.');
    }
  };

  const renderItem = ({ item }: { item: Translation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.languageTag}>
          {item.sourceLang} → {item.targetLang}
        </Text>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={styles.source}>{item.sourceText}</Text>
      <Text style={styles.target}>{item.translatedText}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={item.isFavorite ? 'Remove favorite' : 'Add favorite'}
          style={styles.actionButton}
          onPress={() => handleToggleFavorite(item)}
        >
          <MaterialIcons
            name={item.isFavorite ? 'favorite' : 'favorite-border'}
            size={18}
            color={item.isFavorite ? '#FF3B30' : '#555'}
          />
          <Text style={styles.actionText}>{item.isFavorite ? 'Favorited' : 'Favorite'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          accessibilityLabel="Search translation history"
          placeholder="Search history..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {
            loadHistory().catch(error => {
              console.error('Search failed:', error);
            });
          }}
          style={styles.searchInput}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Export translation history"
          style={styles.toolbarButton}
          onPress={handleExport}
        >
          <MaterialIcons name="share" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Clear translation history"
          style={styles.toolbarButton}
          onPress={handleClearHistory}
        >
          <MaterialIcons name="delete" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={history.length ? undefined : styles.centered}
          ListEmptyComponent={<Text style={styles.emptyText}>No history yet.</Text>}
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#000',
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderColor: '#ECECEC',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  languageTag: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    color: '#777',
  },
  source: {
    color: '#222',
    fontSize: 15,
    marginBottom: 6,
  },
  target: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#555',
    fontSize: 13,
  },
});
