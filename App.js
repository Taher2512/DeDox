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
import {WalletContextProvider} from './src/hooks/WalletContextProvider';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './src/screens/Home';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <WalletContextProvider>
        <SafeAreaView style={styles.shell}>
          <Stack.Navigator
            initialRouteName="Connect"
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="Connect" component={MainScreen} />
            <Stack.Screen name="Home" component={Home} />
          </Stack.Navigator>
        </SafeAreaView>
      </WalletContextProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
});
