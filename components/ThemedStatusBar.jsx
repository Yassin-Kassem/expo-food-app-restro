import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ThemedStatusBar - A reusable StatusBar component that automatically
 * adapts to the current theme (light/dark mode)
 * 
 * @param {string} style - Optional override: 'light' | 'dark' | 'auto'
 * @param {string} backgroundColor - Optional background color override (Android only)
 */
export default function ThemedStatusBar({ style, backgroundColor, ...props }) {
    const { isDarkMode } = useTheme();
    
    // Use provided style or auto-detect from theme
    const statusBarStyle = style || (isDarkMode ? 'light' : 'dark');
    
    return (
        <StatusBar 
            style={statusBarStyle} 
            backgroundColor={backgroundColor}
            {...props}
        />
    );
}

