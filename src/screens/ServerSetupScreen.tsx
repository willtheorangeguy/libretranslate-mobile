import React, { useState, useEffect, useMemo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addServer, removeServer, setActiveServer } from '../store/slices/serverSlice';
import { DEFAULT_SERVER, DEFAULT_SERVER_URL } from '../constants';
import { TranslationService } from '../services/TranslationService';
import {
  initializeClient,
  LibreTranslateClient,
  normalizeServerUrl,
} from '../services/LibreTranslateClient';
import { ServerConfig } from '../types';
import { StorageService } from '../services/StorageService';
import { useThemeColors, ThemeColors } from '../theme';

export default function ServerSetupScreen() {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const activeServer = useAppSelector(state => state.server.activeServer);
  const [useDefault, setUseDefault] = useState(
    !activeServer || activeServer.url === DEFAULT_SERVER_URL,
  );
  const [serverUrl, setServerUrl] = useState(
    activeServer?.url === DEFAULT_SERVER_URL ? '' : activeServer?.url || '',
  );
  const [serverName, setServerName] = useState(activeServer?.name || '');
  const [apiKey, setApiKey] = useState(activeServer?.apiKey || '');
  const [loading, setLoading] = useState(false);
  const [savedServers, setSavedServers] = useState<ServerConfig[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadSavedServers().catch(() => Alert.alert('Storage error', 'Could not load saved servers.'));
  }, []);

  const loadSavedServers = async () => {
    const servers = await StorageService.getServers();
    setSavedServers(servers);
  };

  const activate = async (server: ServerConfig) => {
    const updated = [server, ...savedServers.filter(item => item.url !== server.url)].map(item => ({
      ...item,
      isActive: item.url === server.url,
    }));
    await StorageService.saveServers(updated);
    await StorageService.setActiveServer(server);
    initializeClient(server.url, server.apiKey);
    TranslationService.clearCache();
    dispatch(addServer(server));
    dispatch(setActiveServer(server));
    navigation.reset({ index: 0, routes: [{ name: 'MainApp' as never }] });
  };

  const handleAddServer = async () => {
    setLoading(true);
    try {
      const url = useDefault ? DEFAULT_SERVER_URL : normalizeServerUrl(serverUrl);
      const client = new LibreTranslateClient(url, apiKey);
      await client.getLanguages();
      await activate({
        url,
        name: useDefault ? DEFAULT_SERVER.name : serverName.trim() || 'Custom server',
        isActive: true,
        lastValidated: Date.now(),
        apiKey: apiKey.trim() || undefined,
      });
    } catch (error) {
      Alert.alert(
        'Connection failed',
        error instanceof Error ? error.message : 'Could not save this server.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectServer = async (server: ServerConfig) => {
    setLoading(true);
    try {
      await activate(server);
    } catch {
      Alert.alert('Storage error', 'Could not switch servers.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = (url: string) => {
    Alert.alert('Delete Server', 'Are you sure you want to delete this server configuration?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          if (activeServer?.url === url) {
            Alert.alert('Server in use', 'Switch to another server before removing this one.');
            return;
          }
          const updated = savedServers.filter(s => s.url !== url);
          setSavedServers(updated);
          await StorageService.saveServers(updated);
          dispatch(removeServer(url));
          Alert.alert('Success', 'Server deleted');
        },
        style: 'destructive',
      },
    ]);
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
          disabled={loading}
          onPress={() => handleSelectServer(item)}
        >
          <Text style={styles.selectButtonText}>Use</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={`Edit ${item.name || item.url}`}
          disabled={loading}
          onPress={() => {
            setUseDefault(item.url === DEFAULT_SERVER_URL);
            setServerUrl(item.url);
            setServerName(item.name || '');
            setApiKey(item.apiKey || '');
          }}
        >
          <Text style={styles.helpText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={loading || activeServer?.url === item.url}
          style={styles.deleteButton}
          onPress={() => handleDeleteServer(item.url)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>LibreTranslate Setup</Text>
        <Text style={styles.subtitle}>Choose where your translations are processed</Text>
        {navigation.canGoBack() && (
          <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()}>
            <Text style={styles.helpText}>Back to translation</Text>
          </TouchableOpacity>
        )}
        <View style={styles.serverActions}>
          <TouchableOpacity
            accessibilityRole="radio"
            accessibilityState={{ checked: useDefault }}
            disabled={loading}
            style={[styles.choice, useDefault && styles.selectedChoice]}
            onPress={() => {
              setUseDefault(true);
              setApiKey(savedServers.find(item => item.url === DEFAULT_SERVER_URL)?.apiKey || '');
            }}
          >
            <Text style={styles.sectionTitle}>Default instance</Text>
            <Text style={styles.helpText}>libretranslate.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="radio"
            accessibilityState={{ checked: !useDefault }}
            disabled={loading}
            style={[styles.choice, !useDefault && styles.selectedChoice]}
            onPress={() => {
              setUseDefault(false);
              setApiKey('');
            }}
          >
            <Text style={styles.sectionTitle}>Custom server</Text>
            <Text style={styles.helpText}>Use your own URL</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {useDefault
            ? 'The public instance is rate limited and may require an API key. Requests are spaced at least 3 seconds apart; server cooldowns also apply.'
            : 'Connect to a hosted or local LibreTranslate instance. For a server on your computer, use its LAN address instead of localhost.'}
        </Text>

        <View style={styles.formSection}>
          {!useDefault && (
            <>
              <TextInput
                accessibilityLabel="Server URL"
                style={styles.input}
                placeholder="https://translate.example.com"
                placeholderTextColor={colors.textMuted}
                value={serverUrl}
                onChangeText={setServerUrl}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <TextInput
                style={styles.input}
                accessibilityLabel="Server name"
                placeholder="Server Name (optional)"
                placeholderTextColor={colors.textMuted}
                value={serverName}
                onChangeText={setServerName}
                editable={!loading}
              />
            </>
          )}
          <TextInput
            accessibilityLabel="API key"
            style={styles.input}
            placeholder="API Key (if required by server)"
            placeholderTextColor={colors.textMuted}
            value={apiKey}
            onChangeText={setApiKey}
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddServer}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>
                {useDefault ? 'Use default instance' : 'Connect to custom server'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Text and files are sent to the selected server. Checking the connection verifies
            available languages; your API key is checked when you translate.
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
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    choice: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      marginBottom: 16,
    },
    selectedChoice: { borderColor: c.primary, backgroundColor: c.surfaceAlt },
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    container: {
      flex: 1,
      backgroundColor: c.background,
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
      color: c.textPrimary,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: c.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.textPrimary,
      marginBottom: 15,
    },
    input: {
      backgroundColor: c.surface,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
      fontSize: 16,
      color: c.textPrimary,
      borderWidth: 1,
      borderColor: c.border,
    },
    button: {
      backgroundColor: c.primary,
      borderRadius: 8,
      paddingVertical: 14,
      marginBottom: 15,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: c.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    helpText: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    serverItem: {
      backgroundColor: c.surface,
      borderRadius: 8,
      padding: 15,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.borderSubtle,
    },
    serverInfo: {
      flex: 1,
      marginRight: 10,
    },
    serverItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textPrimary,
      marginBottom: 5,
    },
    serverItemUrl: {
      fontSize: 12,
      color: c.textSecondary,
    },
    serverActions: {
      flexDirection: 'row',
      gap: 8,
    },
    selectButton: {
      backgroundColor: c.success,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    selectButtonText: {
      color: c.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: c.danger,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    deleteButtonText: {
      color: c.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
  });
