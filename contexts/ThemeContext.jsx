import React, { createContext, useContext } from 'react';
import { lightColors, darkColors } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Always use light mode
    const theme = lightColors;

    return (
        <ThemeContext.Provider value={{ theme, isDark: false }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
