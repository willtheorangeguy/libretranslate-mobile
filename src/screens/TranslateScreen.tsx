import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addToHistory, setError, setLoading } from '../store/slices/translationSlice';
import { updateSettings } from '../store/slices/settingsSlice';
import { TranslationService } from '../services/TranslationService';
import { DatabaseService } from '../services/DatabaseService';
import { StorageService } from '../services/StorageService';
import { SpeechService } from '../services/SpeechService';
import { Language, Translation } from '../types';
import LanguageSelector from '../components/LanguageSelector';
import { UI_CONSTANTS } from '../constants';

const DEBOUNCE_MS = 500;

export default function TranslateScreen() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings.settings);
  const { loading } = useAppSelector(state => state.translation);

  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState(settings.defaultSourceLang);
  const [targetLang, setTargetLang] = useState(settings.defaultTargetLang);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationTimeout, setTranslationTimeout] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [isListening, setIsListening] = useState(false);

  const loadLanguages = useCallback(async () => {
    try {
      setLoadingLanguages(true);
      const langs = await TranslationService.getLanguages();
      setLanguages(langs);
    } catch (error) {
      console.error('Error loading languages:', error);
      Alert.alert('Error', 'Failed to load available languages.');
    } finally {
      setLoadingLanguages(false);
    }
  }, []);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  useEffect(() => {
    SpeechService.initialize({
      onSpeechResult: resultText => {
        setSourceText(resultText);
      },
      onSpeechError: message => {
        setIsListening(false);
        Alert.alert('Speech Recognition Error', message);
      },
      onSpeechEnd: () => {
        setIsListening(false);
      },
    }).catch(error => {
      console.error('Speech initialization failed:', error);
    });

    return () => {
      SpeechService.cleanup().catch(error => {
        console.error('Speech cleanup failed:', error);
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
    };
  }, [translationTimeout]);

  const persistLanguageSelection = useCallback(async () => {
    dispatch(
      updateSettings({
        defaultSourceLang: sourceLang,
        defaultTargetLang: targetLang,
      })
    );

    const existing = await StorageService.getSettings();
    await StorageService.saveSettings({
      ...existing,
      defaultSourceLang: sourceLang,
      defaultTargetLang: targetLang,
    });
  }, [dispatch, sourceLang, targetLang]);

  useEffect(() => {
    persistLanguageSelection().catch(error => {
      console.error('Failed to persist language settings:', error);
    });
  }, [persistLanguageSelection]);

  const performTranslation = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setTranslatedText('');
        setTranslationError(null);
        return;
      }

      dispatch(setLoading(true));
      setTranslationError(null);

      try {
        let resolvedSource = sourceLang;
        if (settings.enableAutoDetect && sourceLang === 'auto') {
          resolvedSource = await TranslationService.detectLanguage(text);
        }

        const result = await TranslationService.translate(text, resolvedSource, targetLang);
        setTranslatedText(result);

        const translation: Translation = {
          id: `${Date.now()}`,
          sourceText: text,
          translatedText: result,
          sourceLang: resolvedSource,
          targetLang,
          timestamp: Date.now(),
          isFavorite: false,
        };

        dispatch(addToHistory(translation));
        await DatabaseService.saveTranslation(translation);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Translation failed. Please try again.';
        setTranslationError(errorMessage);
        dispatch(setError(errorMessage));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, settings.enableAutoDetect, sourceLang, targetLang]
  );

  const handleSourceTextChange = (text: string) => {
    setSourceText(text);
    setTranslationError(null);

    if (translationTimeout) {
      clearTimeout(translationTimeout);
    }

    const timeout = setTimeout(() => {
      performTranslation(text).catch(error => {
        console.error('Translation failed:', error);
      });
    }, DEBOUNCE_MS);
    setTranslationTimeout(timeout);
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      Alert.alert('Cannot swap', 'Swap is disabled while source language is Auto Detect.');
      return;
    }
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Copied to clipboard.');
  };

  const handleClearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setTranslationError(null);
  };

  const handleSpeechToText = async () => {
    try {
      if (isListening) {
        await SpeechService.stopListening();
        setIsListening(false);
        return;
      }
      await SpeechService.startListening(sourceLang);
      setIsListening(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start speech recognition.';
      Alert.alert('Speech Recognition Error', message);
      setIsListening(false);
    }
  };

  const handleSpeakTranslation = async () => {
    if (!translatedText.trim()) {
      return;
    }
    try {
      await SpeechService.speak(translatedText, targetLang);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not play speech output.';
      Alert.alert('Text-to-Speech Error', message);
    }
  };

  const sourceCharCount = sourceText.length;
  const textAreaStyle = [styles.textInput, { height: 120 }, { fontSize: settings.textSize }];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {loadingLanguages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading languages...</Text>
          </View>
        ) : (
          <>
            <View style={styles.languageRow}>
              <LanguageSelector
                languages={languages}
                selectedLang={sourceLang}
                onSelect={setSourceLang}
                placeholder="Source"
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Swap source and target languages"
                style={styles.swapButton}
                onPress={handleSwapLanguages}
              >
                <MaterialIcons name="swap-horiz" size={24} color="#007AFF" />
              </TouchableOpacity>
              <LanguageSelector
                languages={languages}
                selectedLang={targetLang}
                onSelect={setTargetLang}
                placeholder="Target"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.textAreaHeader}>
                <Text style={styles.label}>Text to translate</Text>
                <Text
                  style={[
                    styles.charCount,
                    sourceCharCount > UI_CONSTANTS.CHARACTER_LIMIT && styles.charCountError,
                  ]}
                >
                  {sourceCharCount} / {UI_CONSTANTS.CHARACTER_LIMIT}
                </Text>
              </View>
              <TextInput
                accessibilityLabel="Source text input"
                style={textAreaStyle}
                placeholder="Enter text to translate..."
                placeholderTextColor="#999"
                value={sourceText}
                onChangeText={handleSourceTextChange}
                multiline
                editable={!loading}
                maxLength={UI_CONSTANTS.CHARACTER_LIMIT}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Copy source text"
                  style={styles.iconButton}
                  onPress={() => handleCopyText(sourceText)}
                  disabled={!sourceText}
                >
                  <MaterialIcons name="content-copy" size={18} color="#007AFF" />
                  <Text style={styles.iconButtonText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
                  style={styles.iconButton}
                  onPress={handleSpeechToText}
                >
                  <MaterialIcons name={isListening ? 'mic-off' : 'mic'} size={18} color="#007AFF" />
                  <Text style={styles.iconButtonText}>{isListening ? 'Stop Mic' : 'Voice'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Clear source and translated text"
                  style={styles.iconButton}
                  onPress={handleClearAll}
                >
                  <MaterialIcons name="clear" size={18} color="#FF3B30" />
                  <Text style={styles.iconButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.textAreaHeader}>
                <Text style={styles.label}>Translation</Text>
                {loading && <ActivityIndicator color="#007AFF" size="small" />}
              </View>

              {translationError ? (
                <View style={styles.errorBox}>
                  <MaterialIcons name="error-outline" size={18} color="#FF3B30" />
                  <Text style={styles.errorText}>{translationError}</Text>
                </View>
              ) : null}

              <TextInput
                accessibilityLabel="Translated text output"
                style={textAreaStyle}
                placeholder="Translation will appear here..."
                placeholderTextColor="#999"
                value={translatedText}
                editable={false}
                multiline
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Copy translated text"
                  style={styles.iconButton}
                  onPress={() => handleCopyText(translatedText)}
                  disabled={!translatedText}
                >
                  <MaterialIcons name="content-copy" size={18} color="#007AFF" />
                  <Text style={styles.iconButtonText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Speak translated text"
                  style={styles.iconButton}
                  onPress={handleSpeakTranslation}
                  disabled={!translatedText}
                >
                  <MaterialIcons name="volume-up" size={18} color="#007AFF" />
                  <Text style={styles.iconButtonText}>Speak</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  loadingContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  swapButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
  },
  section: {
    marginBottom: 20,
  },
  textAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  charCountError: {
    color: '#FF3B30',
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#000',
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    paddingVertical: 8,
    gap: 6,
  },
  iconButtonText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    flex: 1,
  },
});
