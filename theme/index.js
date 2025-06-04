import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

// Thème clair
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB',
    secondary: '#0EA5E9',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    error: '#EF4444',
    text: '#1F2937',
    onSurface: '#1F2937',
    onBackground: '#1F2937',
    disabled: '#9CA3AF',
    placeholder: '#6B7280',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#EF4444',
    outline: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
  },
  roundness: 12,
  dark: false,
};

// Thème sombre
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',
    secondary: '#06B6D4',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    error: '#F87171',
    text: '#F1F5F9',
    onSurface: '#F1F5F9',
    onBackground: '#F1F5F9',
    disabled: '#64748B',
    placeholder: '#94A3B8',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: '#F87171',
    outline: '#475569',
    success: '#34D399',
    warning: '#FBBF24',
  },
  roundness: 12,
  dark: true,
};

// Export du thème par défaut (pour compatibilité)
export const theme = lightTheme; 