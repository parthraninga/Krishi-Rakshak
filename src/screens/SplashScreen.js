import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Logo from '../components/Logo';

const SplashScreen = ({onComplete}) => {
  useEffect(() => {
    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2D8B4F" barStyle="light-content" />
      <View style={styles.content}>
        <Logo width={180} height={180} showText={false} />
        <Text style={styles.appName}>KrishiRakshak</Text>
        <Text style={styles.tagline}>Seeds to Market</Text>
      </View>
      <ActivityIndicator
        size="large"
        color="#FFFFFF"
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D8B4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 3,
    textAlign: 'center',
    fontWeight: '300',
  },
  loader: {
    position: 'absolute',
    bottom: 100,
  },
});

export default SplashScreen;
