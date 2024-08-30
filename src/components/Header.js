import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from './Colors';

export function Header() {
  return (
    <>
      <View style={[styles.background]}>
        <Text style={styles.title} className="text-white">
          DeDox.
        </Text>
        <Text style={styles.subtitle}>
          Secure, Decentralized Document Signing for a Trustless Future
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    paddingBottom: 40,
    paddingTop: 60,
  },
  logo: {
    overflow: 'visible',
    resizeMode: 'cover',
  },
  subtitle: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
});
