import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import Logo from '../components/Logo';

const HomeScreen = ({language}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2D8B4F" barStyle="light-content" />
      <View style={styles.header}>
        <Logo width={60} height={60} showText={false} />
        <Text style={styles.headerText}>KrishiRakshak</Text>
        <Text style={styles.languageText}>Language: {language}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to Krishi-Rakshak! 🌾
        </Text>
        <Text style={styles.descriptionText}>
          Your farming companion from Seeds to Market
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2D8B4F',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  languageText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D8B4F',
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
