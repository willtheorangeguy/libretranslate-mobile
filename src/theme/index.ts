import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { useAppSelector } from '../hooks/useRedux';

export interface ThemeColors {
  isDark: boolean;
  statusBarStyle: 'light-content' | 'dark-content';
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  danger: string;
  success: string;
  tabInactive: string;
  errorSurface: string;
  errorText: string;
  overlay: string;
}

const light: ThemeColors = {
  isDark: false,
  statusBarStyle: 'dark-content',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#E5F0FF',
  border: '#DDDDDD',
  borderSubtle: '#EEEEEE',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textMuted: '#999999',
  primary: '#007AFF',
  onPrimary: '#FFFFFF',
  danger: '#FF3B30',
  success: '#34C759',
  tabInactive: '#8E8E93',
  errorSurface: '#FFE5E5',
  errorText: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const dark: ThemeColors = {
  isDark: true,
  statusBarStyle: 'light-content',
  background: '#000000',
  surface: '#1C1C1E',
  surfaceAlt: '#0A3055',
  border: '#38383A',
  borderSubtle: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textMuted: '#8E8E93',
  primary: '#0A84FF',
  onPrimary: '#FFFFFF',
  danger: '#FF453A',
  success: '#30D158',
  tabInactive: '#8E8E93',
  errorSurface: '#3A1A1A',
  errorText: '#FF453A',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const useThemeColors = (): ThemeColors => {
  const systemDark = useColorScheme() === 'dark';
  const mode = useAppSelector(state => state.settings.settings.themeMode);
  const isDark = mode === 'dark' || (mode === 'system' && systemDark);
  return useMemo(() => (isDark ? dark : light), [isDark]);
};
