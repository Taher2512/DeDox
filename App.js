/*eslint-disable*/
import {
  ConnectionProvider,
  RPC_ENDPOINT,
} from './src/components/providers/ConnectionProvider';
import {clusterApiUrl} from '@solana/web3.js';
import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {AuthorizationProvider} from './src/components/providers/AuthorizationProvider';
import {Header} from './src/components/Header';

import MainScreen from './src/screens/MainScreen';
import { WalletContextProvider } from './src/hooks/WalletContextProvider';
import DocumentPage from './src/screens/DocumentPage';
import DocumentDetail from './src/screens/DocumentDetail';

export default function App() {
  return (
    <WalletContextProvider>
        <StatusBar translucent backgroundColor={'transparent'} />
        <SafeAreaView style={styles.shell}>
          {/* <MainScreen /> */}

          {/* <DocumentPage/> */}
          <DocumentDetail/>
        </SafeAreaView>
        </WalletContextProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
});
