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
import {WalletContextProvider} from './src/hooks/WalletContextProvider';
import DocumentDetail from './src/screens/DocumentDetail';
import ConnectWallet from './src/screens/ConnectWallet';
import Home from './src/screens/Home';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UploadDoc from './src/screens/UploadDoc';
import AddUser from './src/screens/AddUser';
// import AddUser from './src/components/AddUser';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <WalletContextProvider>
        <StatusBar translucent backgroundColor={'transparent'} />
        {/* <SafeAreaView style={styles.shell}> */}

        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="ConnectWallet">
          <Stack.Screen name="ConnectWallet" component={ConnectWallet} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="DocumentDetail" component={DocumentDetail} />
          <Stack.Screen name="UploadDoc" component={AddUser} />
        </Stack.Navigator>
        {/* <MainScreen /> */}

        {/* <DocumentPage/> */}
        {/* <DocumentDetail /> */}
        {/* </SafeAreaView> */}
      </WalletContextProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: '100%',
  },
});
