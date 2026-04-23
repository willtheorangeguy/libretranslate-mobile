import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { updateSettings } from '../store/slices/settingsSlice';
import { StorageService } from '../services/StorageService';
import { DatabaseService } from '../services/DatabaseService';
import LanguageSelector from '../components/LanguageSelector';
import { Language, ThemeMode } from '../types';
import { TranslationService } from '../services/TranslationService';
import { DEFAULT_TEXT_SIZE } from '../constants';

const MIN_TEXT_SIZE = 12;
const MAX_TEXT_SIZE = 24;

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings.settings);

  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    TranslationService.getLanguages()
      .then(setLanguages)
      .catch(error => {
        console.error('Could not load languages for settings:', error);
      });
  }, []);

  const saveSettings = async (partial: Partial<typeof settings>) => {
    const merged = { ...settings, ...partial };
    dispatch(updateSettings(partial));
    await StorageService.saveSettings(merged);
  };

  const nextThemeMode = useMemo(() => {
    const currentIndex = themeModes.indexOf(settings.themeMode);
    return themeModes[(currentIndex + 1) % themeModes.length];
  }, [settings.themeMode]);

  const handleManageServers = () => {
    navigation.navigate('ServerSetup' as never);
  };

  const handleResetOnboarding = async () => {
    await StorageService.setOnboardingComplete(false);
    await saveSettings({ onboardingCompleted: false });
    Alert.alert('Done', 'Onboarding will show on next app launch.');
  };

  const handleClearHistory = () => {
    Alert.alert('Clear data', 'Delete all translation and favorites data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await DatabaseService.clearHistory();
          Alert.alert('Deleted', 'History cleared.');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Change theme mode"
        style={styles.row}
        onPress={() => {
          saveSettings({ themeMode: nextThemeMode }).catch(error => {
            console.error('Failed to save theme mode:', error);
          });
        }}
      >
        <View>
          <Text style={styles.rowLabel}>Theme</Text>
          <Text style={styles.rowSubtext}>Current: {settings.themeMode}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowLabel}>Text Size</Text>
          <Text style={styles.rowSubtext}>{settings.textSize}px</Text>
        </View>
        <View style={styles.textSizeControls}>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() =>
              saveSettings({ textSize: Math.max(MIN_TEXT_SIZE, settings.textSize - 1) }).catch(
                error => {
                  console.error('Failed to reduce text size:', error);
                }
              )
            }
          >
            <Text style={styles.smallButtonText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() =>
              saveSettings({ textSize: Math.min(MAX_TEXT_SIZE, settings.textSize + 1) }).catch(
                error => {
                  console.error('Failed to increase text size:', error);
                }
              )
            }
          >
            <Text style={styles.smallButtonText}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => {
              saveSettings({ textSize: DEFAULT_TEXT_SIZE }).catch(error => {
                console.error('Failed to reset text size:', error);
              });
            }}
          >
            <Text style={styles.smallButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Translation</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.rowLabel}>Auto Detect Source Language</Text>
          <Text style={styles.rowSubtext}>Use detection when source is Auto Detect</Text>
        </View>
        <Switch
          value={settings.enableAutoDetect}
          onValueChange={value => {
            saveSettings({ enableAutoDetect: value }).catch(error => {
              console.error('Failed to save auto detect setting:', error);
            });
          }}
        />
      </View>

      <View style={styles.languageRow}>
        <Text style={styles.rowLabel}>Default Source</Text>
        <LanguageSelector
          languages={languages}
          selectedLang={settings.defaultSourceLang}
          onSelect={lang => {
            saveSettings({ defaultSourceLang: lang }).catch(error => {
              console.error('Failed to save default source language:', error);
            });
          }}
          placeholder="Source"
        />
      </View>

      <View style={styles.languageRow}>
        <Text style={styles.rowLabel}>Default Target</Text>
        <LanguageSelector
          languages={languages}
          selectedLang={settings.defaultTargetLang}
          onSelect={lang => {
            saveSettings({ defaultTargetLang: lang }).catch(error => {
              console.error('Failed to save default target language:', error);
            });
          }}
          placeholder="Target"
        />
      </View>

      <Text style={styles.sectionTitle}>Data & Server</Text>
      <TouchableOpacity style={styles.row} onPress={handleManageServers}>
        <View>
          <Text style={styles.rowLabel}>Manage LibreTranslate Servers</Text>
          <Text style={styles.rowSubtext}>Add, remove, and switch active server</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={handleClearHistory}>
        <View>
          <Text style={styles.rowLabel}>Clear Translation History</Text>
          <Text style={styles.rowSubtext}>Removes history and favorites</Text>
        </View>
        <MaterialIcons name="delete" size={20} color="#FF3B30" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={handleResetOnboarding}>
        <View>
          <Text style={styles.rowLabel}>Replay Onboarding</Text>
          <Text style={styles.rowSubtext}>Show setup and help on next app start</Text>
        </View>
        <MaterialIcons name="play-circle-outline" size={20} color="#007AFF" />
      </TouchableOpacity>

      <Text style={styles.helpText}>
        Accessibility: VoiceOver labels are enabled across controls, keyboard-safe layouts are used
        for text entry, and text size can be adjusted in this screen.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  row: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
  },
  rowSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    maxWidth: 250,
  },
  languageRow: {
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textSizeControls: {
    flexDirection: 'row',
    gap: 6,
  },
  smallButton: {
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  smallButtonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 12,
  },
  helpText: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
  },
});
