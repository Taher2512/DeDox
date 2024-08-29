/*eslint-disable*/
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const RefinedDarkBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1E1E1E', '#121212']}
        style={StyleSheet.absoluteFillObject}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />
      <View style={styles.vignette} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 150,
    elevation: 8,
  },
});

export default RefinedDarkBackground;