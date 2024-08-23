/*eslint-disable*/
import {
  ConnectionProvider,
  RPC_ENDPOINT,
} from './src/components/providers/ConnectionProvider';
import {clusterApiUrl} from '@solana/web3.js';
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {AuthorizationProvider} from './src/components/providers/AuthorizationProvider';
import {Header} from './src/components/Header';

import MainScreen from './src/screens/MainScreen';
import { WalletContextProvider } from './src/hooks/WalletContextProvider';

export default function App() {
  return (
    <WalletContextProvider>
        <SafeAreaView style={styles.shell}>
          <MainScreen />
        </SafeAreaView>
        </WalletContextProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
});
