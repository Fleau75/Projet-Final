import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB',
    secondary: '#0EA5E9',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    error: '#EF4444',
    text: '#1F2937',
    onSurface: '#1F2937',
    disabled: '#9CA3AF',
    placeholder: '#6B7280',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#EF4444',
  },
  roundness: 12,
}; 