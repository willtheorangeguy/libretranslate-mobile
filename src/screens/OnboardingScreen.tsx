import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';

type Props = StackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 18,
  },
  points: {
    fontSize: 15,
    color: '#444',
    lineHeight: 21,
    marginBottom: 8,
  },
  button: {
    marginTop: 28,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
