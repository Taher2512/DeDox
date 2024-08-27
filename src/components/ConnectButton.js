/*eslint-disable*/
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, {ComponentProps, useState, useCallback} from 'react';
import {Button, Text, TouchableOpacity} from 'react-native';

import {useAuthorization} from './providers/AuthorizationProvider';
import {alertAndLog} from '../util/alertAndLog';
import usePhantomConnection from '../hooks/WalletContextProvider';
import { getUserPDA } from './constants';

export default function ConnectButton(props) {
  const {authorizeSession} = useAuthorization();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
  const{phantomWalletPublicKey}=usePhantomConnection()
  const handleConnectPress = useCallback(async () => {
    try {
      if (authorizationInProgress) {
        return;
      }
      setAuthorizationInProgress(true);
      await transact(async wallet => {
        await authorizeSession(wallet);
      });
     
    } catch (err) {
      alertAndLog(
        'Error during connect',
        err instanceof Error ? err.message : err,
      );
    } finally {
      setAuthorizationInProgress(false);
    }
  }, [authorizationInProgress, authorizeSession]);
  return (
    <TouchableOpacity
      {...props}
      disabled={authorizationInProgress}
      onPress={handleConnectPress}
      className="border-white border h-20 w-3/4 self-center rounded-full items-center justify-center -mt-20"
      activeOpacity={0.5}>
      <Text className="text-white text-xl font-semibold">Connect Wallet</Text>
    </TouchableOpacity>
  );
}
