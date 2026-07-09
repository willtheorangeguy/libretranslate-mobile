import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';
import { useThemeColors, ThemeColors } from '../theme';

type Props = StackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleContinue = async () => {
    await StorageService.setOnboardingComplete(true);
    const settings = await StorageService.getSettings();
    await StorageService.saveSettings({
      ...settings,
      onboardingCompleted: true,
    });
    navigation.replace('ServerSetup');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to LibreTranslate Mobile</Text>
      <Text style={styles.body}>
        Connect your self-hosted LibreTranslate server, translate by text or voice, and keep a
        local searchable history.
      </Text>
      <Text style={styles.points}>• Text + voice input</Text>
      <Text style={styles.points}>• Text-to-speech output</Text>
      <Text style={styles.points}>• Favorites and exportable history</Text>
      <Text style={styles.points}>• Dark mode and accessibility controls</Text>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Get started"
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    container: {
      flex: 1,
      backgroundColor: c.background,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 30,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 16,
    },
    body: {
      fontSize: 16,
      color: c.textSecondary,
      lineHeight: 22,
      marginBottom: 18,
    },
    points: {
      fontSize: 15,
      color: c.textSecondary,
      lineHeight: 21,
      marginBottom: 8,
    },
    button: {
      marginTop: 28,
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: c.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
