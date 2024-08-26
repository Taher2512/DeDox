/*eslint-disable*/
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, TouchableOpacity, FlatList, ViewBase, StatusBar, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const Star = ({ size, top, left, animationDuration }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          top,
          left,
          opacity,
        },
      ]}
    />
  );
};

const EnhancedDarkThemeBackground = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -50,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
 const data=[1,2,3,4]
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradientContainer, { transform: [{ translateY }] }]}>
        <LinearGradient
          colors={['#0f0c29', '#302b63', '#24243e', '#0f0c29']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
      {[...Array(50)].map((_, i) => (
        <Star
          key={i}
          size={Math.random() * 2 + 1}
          top={Math.random() * height}
          left={Math.random() * width}
          animationDuration={Math.random() * 3000 + 1000}
        />
      ))}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    height: height + 100,
  },
  gradient: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 50,
  },
});

export default EnhancedDarkThemeBackground;
