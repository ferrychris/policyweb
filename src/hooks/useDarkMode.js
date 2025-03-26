import { useState, useEffect } from 'react';

/**
 * Custom hook to manage dark mode functionality.
 * This hook handles toggling dark mode, persisting the preference in localStorage,
 * and applying the dark mode class to the document element.
 */
const useDarkMode = () => {
  // Initialize state based on localStorage or default to false
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Effect to apply or remove the 'dark' class on the document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Function to toggle dark mode and persist the preference
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
  };

  return [isDarkMode, toggleDarkMode];
};

export default useDarkMode;
