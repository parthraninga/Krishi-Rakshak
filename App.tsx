/**
 * Krishi-Rakshak App
 * Seeds to Market - Farming Companion
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './src/screens/SplashScreen';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import HomeScreen from './src/screens/HomeScreen';

type AppState = 'splash' | 'languageSelection' | 'home';

function App(): React.JSX.Element {
  // Always start with splash screen
  const [appState, setAppState] = useState<AppState>('splash');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  useEffect(() => {
    // Check app state when component mounts
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      const hasSeenLanguageSelection = await AsyncStorage.getItem(
        'hasSeenLanguageSelection',
      );
      const language = await AsyncStorage.getItem('selectedLanguage');

      if (language) {
        setSelectedLanguage(language);
      }

      // Determine if this is first time user
      setIsFirstTime(hasSeenLanguageSelection !== 'true');
    } catch (error) {
      console.error('Error checking app state:', error);
      setIsFirstTime(true);
    }
  };

  const handleSplashComplete = () => {
    // After splash (1-2 seconds), navigate to appropriate screen
    if (isFirstTime) {
      setAppState('languageSelection');
    } else {
      setAppState('home');
    }
  };

  const handleLanguageSelected = (language: string) => {
    setSelectedLanguage(language);
    setAppState('home');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {appState === 'splash' && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
        {appState === 'languageSelection' && (
          <LanguageSelectionScreen onLanguageSelected={handleLanguageSelected} />
        )}
        {appState === 'home' && <HomeScreen language={selectedLanguage} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
