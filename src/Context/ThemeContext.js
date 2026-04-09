import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '../themes/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const theme = isDarkMode ? darkTheme : lightTheme;
  console.log('eee', theme, isDarkMode);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Define your themes
export const lightTheme = {
  background: '#fff',
  text: '#000',
  secondaryText: COLORS.appGrey5,
  borderColor: COLORS.appGrey4,
  legacyBridgeText: COLORS.legacyBridgeBlack,
};

export const darkTheme = {
  background: '#030b19',
  text: '#fff',
  secondaryText: COLORS.appGrey5,
  borderColor: COLORS.appGrey5,
  legacyBridgeText: COLORS.appGrey5,
};
