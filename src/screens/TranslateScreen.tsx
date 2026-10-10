import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  useWindowDimensions,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useTranslation } from '../hooks/useTranslation';
import { addToHistory } from '../store/slices/translationSlice';
import { updateSettings } from '../store/slices/settingsSlice';
import { TranslationService } from '../services/TranslationService';
import { getClient } from '../services/LibreTranslateClient';
import { DatabaseService } from '../services/DatabaseService';
import { StorageService } from '../services/StorageService';
import { SpeechService } from '../services/SpeechService';
import { FrontendSettings, Language, Translation } from '../types';
import LanguageSelector from '../components/LanguageSelector';
import FileTranslation from '../components/FileTranslation';
import { DEFAULT_SERVER_URL, UI_CONSTANTS } from '../constants';
import { useThemeColors, ThemeColors } from '../theme';

export default function TranslateScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const settings = useAppSelector(state => state.settings.settings);
  const server = useAppSelector(state => state.server.activeServer);
  const [sourceText, setSourceText] = useState('');
  const sourceTextRef = useRef('');
  const [sourceLang, setSourceLang] = useState(
    settings.enableAutoDetect
      ? settings.defaultSourceLang
      : settings.defaultSourceLang === 'auto'
      ? 'en'
      : settings.defaultSourceLang,
  );
  const [targetLang, setTargetLang] = useState(settings.defaultTargetLang);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [frontend, setFrontend] = useState<FrontendSettings>({});
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [languageError, setLanguageError] = useState('');
  const [reload, setReload] = useState(0);
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const charLimit =
    typeof frontend.charLimit === 'number' && frontend.charLimit > 0
      ? frontend.charLimit
      : frontend.charLimit === -1
      ? undefined
      : UI_CONSTANTS.CHARACTER_LIMIT;
  const requiresKey = frontend.keyRequired && !server?.apiKey;
  const targets = languages.find(lang => lang.code === sourceLang)?.targets;
  const targetLanguages = targets
    ? languages.filter(lang => targets.includes(lang.code))
    : languages;
  const validPair =
    (sourceLang === 'auto' || languages.some(lang => lang.code === sourceLang)) &&
    targetLanguages.some(lang => lang.code === targetLang);
  const enabled = !loadingLanguages && !languageError && !requiresKey && validPair;
  const { result, loading, error, retry, invalidate, cooldown } = useTranslation(
    sourceText,
    sourceLang,
    targetLang,
    Boolean(enabled && mode === 'text' && (!charLimit || sourceText.length <= charLimit)),
    server,
  );
  const translatedText = result?.translatedText || '';
  const detected = result?.detectedLanguage?.language;
  const changeText = useCallback(
    (text: string) => {
      if (sourceTextRef.current === text) return;
      sourceTextRef.current = text;
      invalidate();
      setSourceText(text);
      setCopied(false);
      if (!text) sessionIdRef.current = null;
    },
    [invalidate],
  );

  useEffect(() => {
    let active = true;
    setLoadingLanguages(true);
    setLanguageError('');
    setLanguages([]);
    setFrontend({});
    const client = getClient();
    Promise.all([TranslationService.getLanguages(), client.getFrontendSettings()])
      .then(([langs, options]) => {
        if (!active) return;
        setLanguages(langs);
        setFrontend(options);
        setSourceLang(current =>
          current === 'auto' || langs.some(lang => lang.code === current) ? current : 'auto',
        );
      })
      .catch(reason => {
        if (active)
          setLanguageError(
            reason instanceof Error ? reason.message : 'Could not load this server.',
          );
      })
      .finally(() => {
        if (active) setLoadingLanguages(false);
      });
    return () => {
      active = false;
    };
  }, [server, reload]);

  useEffect(() => {
    if (targetLanguages.length && !targetLanguages.some(lang => lang.code === targetLang))
      setTargetLang(targetLanguages[0].code);
  }, [targetLanguages, targetLang]);

  useEffect(() => {
    if (!languages.length) return;
    dispatch(updateSettings({ defaultSourceLang: sourceLang, defaultTargetLang: targetLang }));
    StorageService.getSettings()
      .then(existing =>
        StorageService.saveSettings({
          ...existing,
          defaultSourceLang: sourceLang,
          defaultTargetLang: targetLang,
        }),
      )
      .catch(() => {});
  }, [dispatch, sourceLang, targetLang, languages]);

  useEffect(() => {
    SpeechService.initialize({
      onSpeechResult: changeText,
      onSpeechError: message => {
        setIsListening(false);
        Alert.alert('Voice input', message);
      },
      onSpeechEnd: () => setIsListening(false),
    }).catch(() => {});
    return () => {
      SpeechService.cleanup().catch(() => {});
    };
  }, [changeText]);

  useEffect(() => {
    if (!result) return;
    if (!sessionIdRef.current)
      sessionIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const translation: Translation = {
      id: sessionIdRef.current,
      sourceText,
      translatedText: result.translatedText,
      sourceLang: result.detectedLanguage?.language || sourceLang,
      targetLang,
      timestamp: Date.now(),
      isFavorite: false,
    };
    dispatch(addToHistory(translation));
    DatabaseService.saveTranslation(translation).catch(() =>
      Alert.alert(
        'History unavailable',
        'Your translation is ready, but could not be saved to history.',
      ),
    );
  }, [result, dispatch, sourceText, sourceLang, targetLang]);

  const handleSwap = () => {
    const from = sourceLang === 'auto' ? detected : sourceLang;
    if (!from) return;
    invalidate();
    setSourceLang(targetLang);
    setTargetLang(from);
    changeText(translatedText || sourceText);
    sessionIdRef.current = null;
  };
  const openServer = () => navigation.navigate('ServerSetup' as never);
  const ensureMicPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
      title: 'Microphone permission',
      message: 'Voice input needs access to your microphone.',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleSpeechToText = async () => {
    try {
      if (isListening) {
        await SpeechService.stopListening();
        setIsListening(false);
        return;
      }
      const allowed = await ensureMicPermission();
      if (!allowed) {
        Alert.alert(
          'Microphone permission required',
          'Enable microphone access in settings to use voice input.',
        );
        return;
      }
      await SpeechService.startListening(sourceLang);
      setIsListening(true);
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : 'Could not start speech recognition.';
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
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Could not play speech output.';
      Alert.alert('Text-to-Speech Error', message);
    }
  };

  const textStyle = [styles.textArea, { fontSize: settings.textSize + 2 }];
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.serverRow}>
          <View style={styles.serverInfo}>
            <Text style={styles.eyebrow}>
              {server?.url === DEFAULT_SERVER_URL
                ? 'PUBLIC INSTANCE · RATE LIMITED'
                : 'CUSTOM INSTANCE'}
            </Text>
            <Text numberOfLines={1} style={styles.serverUrl}>
              {server?.url}
            </Text>
          </View>
          <Button compact onPress={openServer}>
            Server settings
          </Button>
        </View>
        <View style={styles.tabs}>
          <Button
            mode={mode === 'text' ? 'contained-tonal' : 'text'}
            icon="format-text"
            onPress={() => {
              if (mode !== 'text') invalidate();
              setMode('text');
            }}
          >
            Translate Text
          </Button>
          <Button
            mode={mode === 'file' ? 'contained-tonal' : 'text'}
            icon="file-document-outline"
            onPress={() => {
              if (mode !== 'file') invalidate();
              setMode('file');
            }}
          >
            Translate Files
          </Button>
        </View>
        {loadingLanguages && (
          <ActivityIndicator accessibilityLabel="Loading server languages" color={colors.primary} />
        )}
        {!!languageError && (
          <View style={styles.notice}>
            <Text accessibilityRole="alert" style={styles.error}>
              {languageError}
            </Text>
            <Button onPress={() => setReload(value => value + 1)}>Retry connection</Button>
          </View>
        )}
        {!!requiresKey && (
          <View style={styles.notice}>
            <Text style={styles.error}>
              This instance requires an API key. Add your key in Server settings or connect your own
              LibreTranslate server.
            </Text>
            <Button onPress={openServer}>Configure server</Button>
          </View>
        )}
        <View style={styles.languageRow}>
          <View style={styles.language}>
            <Text style={styles.label}>Translate from</Text>
            <LanguageSelector
              languages={[{ code: 'auto', name: 'Auto Detect' }, ...languages]}
              selectedLang={sourceLang}
              onSelect={lang => {
                if (lang !== sourceLang) invalidate();
                setSourceLang(lang);
              }}
              placeholder="Source language"
            />
            {detected && (
              <Text style={styles.caption}>
                Detected: {languages.find(lang => lang.code === detected)?.name || detected}
              </Text>
            )}
          </View>
          <IconButton
            icon="swap-horizontal"
            accessibilityLabel="Swap source and target languages"
            disabled={sourceLang === 'auto' && !detected}
            onPress={handleSwap}
            iconColor={colors.primary}
          />
          <View style={styles.language}>
            <Text style={styles.label}>Translate into</Text>
            <LanguageSelector
              languages={targetLanguages}
              selectedLang={targetLang}
              onSelect={lang => {
                if (lang !== targetLang) invalidate();
                setTargetLang(lang);
              }}
              placeholder="Target language"
            />
          </View>
        </View>
        {mode === 'file' ? (
          <FileTranslation
            key={server?.url}
            source={sourceLang}
            target={targetLang}
            settings={frontend}
            enabled={Boolean(enabled)}
          />
        ) : (
          <>
            <View style={[styles.panels, width >= 700 && styles.wide]}>
              <View style={styles.panel}>
                <View style={styles.panelHeader}>
                  <Text style={styles.label}>Text to translate</Text>
                  <IconButton
                    icon="close"
                    accessibilityLabel="Clear source and translated text"
                    onPress={() => changeText('')}
                    disabled={!sourceText}
                  />
                </View>
                <TextInput
                  accessibilityLabel="Source text input"
                  style={textStyle}
                  placeholder="Enter text to translate…"
                  placeholderTextColor={colors.textMuted}
                  value={sourceText}
                  onChangeText={changeText}
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.toolbar}>
                  <Button
                    compact
                    icon="content-paste"
                    onPress={async () => {
                      try {
                        changeText(await Clipboard.getString());
                      } catch {
                        Alert.alert('Clipboard', 'Could not paste text.');
                      }
                    }}
                  >
                    Paste
                  </Button>
                  <IconButton
                    icon={isListening ? 'microphone-off' : 'microphone'}
                    accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
                    onPress={handleSpeechToText}
                  />
                  <Text
                    style={[
                      styles.count,
                      !!charLimit && sourceText.length > charLimit && styles.error,
                    ]}
                  >
                    {sourceText.length}
                    {charLimit ? ` / ${charLimit}` : ''}
                  </Text>
                </View>
              </View>
              <View style={[styles.panel, styles.outputPanel]}>
                <View style={styles.panelHeader}>
                  <Text style={styles.label}>Translated text</Text>
                  {loading && (
                    <ActivityIndicator accessibilityLabel="Translating" color={colors.primary} />
                  )}
                </View>
                <Text
                  selectable
                  accessibilityLabel="Translated text output"
                  style={[textStyle, !translatedText && styles.placeholder]}
                >
                  {translatedText || (loading ? 'Translating…' : 'Translation will appear here…')}
                </Text>
                <View style={styles.toolbar}>
                  <Button
                    compact
                    icon="content-copy"
                    disabled={!translatedText}
                    onPress={() => {
                      Clipboard.setString(translatedText);
                      setCopied(true);
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <IconButton
                    icon="volume-high"
                    accessibilityLabel="Speak translated text"
                    disabled={!translatedText}
                    onPress={handleSpeakTranslation}
                  />
                </View>
              </View>
            </View>
            {!!charLimit && sourceText.length > charLimit && (
              <Text style={styles.error}>
                This server accepts up to {charLimit} characters. Shorten your text to translate.
              </Text>
            )}
            {!!error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
            <View style={styles.translateRow}>
              <Text style={styles.caption}>
                {cooldown
                  ? `Next request available in ${cooldown}s`
                  : 'Translates automatically as you type'}
              </Text>
              <Button
                mode="contained"
                disabled={
                  !enabled ||
                  !sourceText.trim() ||
                  loading ||
                  cooldown > 0 ||
                  (!!charLimit && sourceText.length > charLimit)
                }
                onPress={retry}
              >
                Translate
              </Button>
            </View>
          </>
        )}
        <Text style={styles.footer}>
          Powered by LibreTranslate · Open source machine translation
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 20, maxWidth: 1100, width: '100%', alignSelf: 'center' },
    serverRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    serverInfo: { flex: 1 },
    eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: c.textSecondary },
    serverUrl: { fontSize: 13, color: c.textSecondary, marginTop: 5 },
    tabs: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: 12,
    },
    languageRow: { flexDirection: 'row', alignItems: 'center' },
    language: { flex: 1, gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
    panels: { gap: 12 },
    wide: { flexDirection: 'row' },
    panel: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: 8,
      overflow: 'hidden',
    },
    outputPanel: { backgroundColor: c.surfaceAlt },
    panelHeader: {
      minHeight: 48,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textArea: { minHeight: 160, padding: 16, paddingTop: 8, color: c.textPrimary },
    placeholder: { color: c.textMuted },
    toolbar: {
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: c.borderSubtle,
    },
    count: { flex: 1, textAlign: 'right', paddingRight: 8, color: c.textSecondary, fontSize: 12 },
    notice: { padding: 12, borderRadius: 8, backgroundColor: c.errorSurface },
    error: { color: c.errorText, fontSize: 14 },
    caption: { color: c.textSecondary, fontSize: 12, flexShrink: 1 },
    translateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    footer: { color: c.textSecondary, fontSize: 12, textAlign: 'center', marginVertical: 16 },
  });
