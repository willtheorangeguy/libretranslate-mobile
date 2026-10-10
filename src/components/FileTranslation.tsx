import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { getClient, LibreTranslateError } from '../services/LibreTranslateClient';
import { FrontendSettings, TranslationFile } from '../types';
import { useThemeColors } from '../theme';

export default function FileTranslation({
  source,
  target,
  settings,
  enabled,
}: {
  source: string;
  target: string;
  settings: FrontendSettings;
  enabled: boolean;
}) {
  const colors = useThemeColors();
  const [file, setFile] = useState<TranslationFile | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    generation.current += 1;
    controller.current?.abort();
    setDownloadUrl('');
    setBusy(false);
    setError('');
    return () => {
      generation.current += 1;
      controller.current?.abort();
    };
  }, [source, target, file]);
  useEffect(() => {
    if (retryAt <= Date.now()) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (retryAt <= Date.now()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  const chooseFile = async () => {
    try {
      const [selected] = await pick();
      const name = selected.name || 'document.txt';
      if (
        settings.supportedFilesFormat?.length &&
        !settings.supportedFilesFormat.some(ext => name.toLowerCase().endsWith(ext.toLowerCase()))
      ) {
        setError('Choose one of the supported file formats.');
        return;
      }
      setFile({ uri: selected.uri, name, type: selected.type || 'application/octet-stream' });
    } catch (reason) {
      if (!isErrorWithCode(reason) || reason.code !== errorCodes.OPERATION_CANCELED)
        setError('Could not open the file picker.');
    }
  };
  const translate = async () => {
    if (!file || busy) return;
    const id = ++generation.current;
    controller.current = new AbortController();
    setBusy(true);
    setError('');
    setDownloadUrl('');
    try {
      const url = await getClient().translateFile(file, source, target, controller.current.signal);
      if (id === generation.current) setDownloadUrl(url);
    } catch (reason) {
      if (id === generation.current) {
        setError(reason instanceof Error ? reason.message : 'File translation failed.');
        if (reason instanceof LibreTranslateError && reason.retryAt) {
          setRetryAt(reason.retryAt);
          setNow(Date.now());
        }
      }
    } finally {
      if (id === generation.current) setBusy(false);
    }
  };
  const download = async () => {
    if (!file || busy) return;
    setBusy(true);
    const filename = `${target}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const path = `${RNFS.CachesDirectoryPath}/${Date.now()}-${filename}`;
    try {
      const response = await RNFS.downloadFile({ fromUrl: downloadUrl, toFile: path }).promise;
      if (response.statusCode < 200 || response.statusCode >= 300)
        throw new Error('Download failed. The translated file may have expired.');
      await Share.open({ url: `file://${path}`, filename, failOnCancel: false });
    } catch (reason) {
      Alert.alert(
        'Download',
        reason instanceof Error ? reason.message : 'Could not save the file.',
      );
    } finally {
      await RNFS.unlink(path).catch(() => {});
      setBusy(false);
    }
  };
  const cooldown = Math.max(0, Math.ceil((retryAt - now) / 1000));
  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Translate a file</Text>
      <Text style={{ color: colors.textSecondary }}>
        {settings.filesTranslation
          ? 'Choose a document to translate, then save or share the result.'
          : 'File translation is not available on this server.'}
      </Text>
      {!!settings.supportedFilesFormat?.length && (
        <Text style={{ color: colors.textSecondary }}>
          Supported formats: {settings.supportedFilesFormat.join(', ')}
        </Text>
      )}
      {!!file && <Text style={{ color: colors.textPrimary }}>{file.name}</Text>}
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.errorText }}>
          {error}
        </Text>
      )}
      <Button mode="outlined" onPress={chooseFile} disabled={busy || !settings.filesTranslation}>
        Choose file
      </Button>
      {!!file && (
        <Button onPress={() => setFile(null)} disabled={busy}>
          Remove file
        </Button>
      )}
      <Button
        mode="contained"
        onPress={translate}
        disabled={!file || busy || !enabled || cooldown > 0}
      >
        {cooldown ? `Try again in ${cooldown}s` : 'Translate file'}
      </Button>
      {busy && <ActivityIndicator color={colors.primary} accessibilityLabel="Processing file" />}
      {!!downloadUrl && (
        <Button mode="outlined" disabled={busy} onPress={download}>
          Download / share translation
        </Button>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  panel: { padding: 20, borderWidth: 1, borderRadius: 8, gap: 16 },
  title: { fontSize: 20, fontWeight: '600' },
});
