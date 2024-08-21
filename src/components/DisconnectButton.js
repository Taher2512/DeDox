import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, {ComponentProps} from 'react';

import {useAuthorization} from './providers/AuthorizationProvider';
import {Button} from 'react-native-paper';
import {Text, TouchableOpacity} from 'react-native';

export default function DisconnectButton(props) {
  const {deauthorizeSession} = useAuthorization();
  return (
    <TouchableOpacity
      className="bg-[#FF6666] rounded-full px-3 py-1"
      {...props}
      onPress={() => {
        transact(async wallet => {
          await deauthorizeSession(wallet);
        });
      }}>
      <Text className="text-white text-xs">Disconnect</Text>
    </TouchableOpacity>
  );
}
