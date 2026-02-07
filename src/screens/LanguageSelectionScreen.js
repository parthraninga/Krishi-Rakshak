import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

const languages = [
  {
    id: 'hi',
    name: 'Hindi',
    localName: 'हिंदी',
    color: '#D4E7C5',
  },
  {
    id: 'en',
    name: 'English',
    localName: 'अंग्रेज़ी',
    color: '#E8E8E8',
  },
  {
    id: 'bn',
    name: 'Bangla',
    localName: 'বাংলা',
    color: '#FFF4C2',
  },
  {
    id: 'mr',
    name: 'Marathi',
    localName: 'मराठी',
    color: '#FFE4C4',
  },
  {
    id: 'or',
    name: 'Odia',
    localName: 'ଓଡିଆ',
    color: '#FFD4D4',
  },
  {
    id: 'gu',
    name: 'Gujarati',
    localName: 'ગુજરાતી',
    color: '#CCE7FF',
  },
];

const LanguageSelectionScreen = ({onLanguageSelected}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = async language => {
    setSelectedLanguage(language.id);
    try {
      await AsyncStorage.setItem('selectedLanguage', language.id);
      await AsyncStorage.setItem('hasSeenLanguageSelection', 'true');
      // Delay to show selection feedback
      setTimeout(() => {
        onLanguageSelected(language.id);
      }, 300);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.content}>
        <Logo width={120} height={120} showText={false} />
        <Text style={styles.title}>Select your language</Text>
        <View style={styles.languageGrid}>
          {languages.map(language => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageCard,
                {backgroundColor: language.color},
                selectedLanguage === language.id && styles.selectedCard,
              ]}
              onPress={() => handleLanguageSelect(language)}
              activeOpacity={0.7}>
              <Text style={styles.localName}>{language.localName}</Text>
              <Text style={styles.englishName}>{language.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 32,
    textAlign: 'center',
  },
  languageGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageCard: {
    width: '48%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#2D8B4F',
  },
  localName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  englishName: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
  },
});

export default LanguageSelectionScreen;
