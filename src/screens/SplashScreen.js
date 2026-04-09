import { StyleSheet, View, SafeAreaView, Image } from 'react-native';
import React from 'react';
import { COLORS } from '../themes/themes';
import { windowHeight, windowWidth } from '../utils/Dimensions';
import { useTheme } from '../Context/ThemeContext';

const SplashScreen = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme?.background }]}
    >
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require('../assets/IntelliBridgeTransparentLogo.png')}
        />
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    height: windowHeight,
  },
  logo: {
    height: windowHeight / 5,
    width: windowWidth / 1.2,
    resizeMode: 'contain',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: windowHeight / 3.5,
  },
  logoContainer: {
    marginTop: 50,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  subtitle: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
  },
});
