import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../hooks/useRedux';
import { addServer, removeServer, setActiveServer } from '../store/slices/serverSlice';
import { initializeClient } from '../services/LibreTranslateClient';
import { ServerConfig } from '../types';
import { StorageService } from '../services/StorageService';

export default function ServerSetupScreen() {
  const navigation = useNavigation();
  const [serverUrl, setServerUrl] = useState('http://localhost:5000');
  const [serverName, setServerName] = useState('Local Server');
  const [loading, setLoading] = useState(false);
  const [savedServers, setSavedServers] = useState<ServerConfig[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadSavedServers();
  }, []);

  const loadSavedServers = async () => {
    const servers = await StorageService.getServers();
    setSavedServers(servers);
  };

  const handleAddServer = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Please enter a server URL');
      return;
    }

    setLoading(true);

    try {
      const normalizedUrl = serverUrl.trim().replace(/\/+$/, '');
      const alreadyExists = savedServers.some(server => server.url === normalizedUrl);
      if (alreadyExists) {
        Alert.alert('Server exists', 'A server with this URL is already configured.');
        setLoading(false);
        return;
      }

      const client = initializeClient(normalizedUrl);
      const isValid = await client.validateConnection();

      if (!isValid) {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the LibreTranslate server. Please check the URL and try again.'
        );
        setLoading(false);
        return;
      }

      const newServer: ServerConfig = {
        url: normalizedUrl,
        name: serverName || 'LibreTranslate Server',
        isActive: true,
        lastValidated: Date.now(),
      };

      dispatch(addServer(newServer));
      dispatch(setActiveServer(newServer));

      const updated = [newServer, ...savedServers];
      await StorageService.saveServers(updated);
      await StorageService.setActiveServer(newServer);

      setSavedServers(updated);
      Alert.alert('Success', 'Server configured successfully!');
      setServerUrl('');
      setServerName('');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' as never }],
      });
    } catch {
      Alert.alert('Error', 'Failed to connect to server. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectServer = (server: ServerConfig) => {
    dispatch(setActiveServer(server));
    initializeClient(server.url);
    StorageService.setActiveServer(server);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' as never }],
    });
  };

  const handleDeleteServer = (url: string) => {
    Alert.alert(
      'Delete Server',
      'Are you sure you want to delete this server configuration?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const updated = savedServers.filter(s => s.url !== url);
            setSavedServers(updated);
            await StorageService.saveServers(updated);
            dispatch(removeServer(url));
            Alert.alert('Success', 'Server deleted');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderServerItem = ({ item }: { item: ServerConfig }) => (
    <View style={styles.serverItem}>
      <View style={styles.serverInfo}>
        <Text style={styles.serverItemName}>{item.name}</Text>
        <Text style={styles.serverItemUrl}>{item.url}</Text>
      </View>
      <View style={styles.serverActions}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => handleSelectServer(item)}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteServer(item.url)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>LibreTranslate Setup</Text>
      <Text style={styles.subtitle}>Add a LibreTranslate server</Text>

      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Server URL (e.g., http://localhost:5000)"
          placeholderTextColor="#999"
          value={serverUrl}
          onChangeText={setServerUrl}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Server Name (optional)"
          placeholderTextColor="#999"
          value={serverName}
          onChangeText={setServerName}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAddServer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Connect to Server</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Make sure your LibreTranslate server is running and accessible at the provided URL.
        </Text>
      </View>

      {savedServers.length > 0 && (
        <View style={styles.savedServersSection}>
          <Text style={styles.sectionTitle}>Saved Servers</Text>
          <FlatList
            data={savedServers}
            keyExtractor={item => item.url}
            renderItem={renderServerItem}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  savedServersSection: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  serverItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  serverInfo: {
    flex: 1,
    marginRight: 10,
  },
  serverItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  serverItemUrl: {
    fontSize: 12,
    color: '#666',
  },
  serverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    backgroundColor: '#34C759',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
