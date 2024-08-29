import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import Svg, {Defs, Rect, Pattern, Circle} from 'react-native-svg';

const {width, height} = Dimensions.get('window');

const EnhancedDarkThemeBackground = ({children}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['black', 'black', 'black']}
        style={styles.gradient}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Pattern
              id="pattern"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse">
              <Circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.3)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#pattern)" />
        </Svg>
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
});

export default EnhancedDarkThemeBackground;
