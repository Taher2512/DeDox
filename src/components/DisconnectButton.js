import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import React, {ComponentProps} from 'react';

import {useAuthorization} from './providers/AuthorizationProvider';
import {Button} from 'react-native-paper';
import {Text, TouchableOpacity} from 'react-native';

export default function DisconnectButton({onDisconnect}) {
  return (
    <TouchableOpacity
      className="bg-[#FF6666] rounded-full px-3 py-1"
      onPress={onDisconnect}>
      <Text className="text-white text-xs font-medium">Disconnect</Text>
    </TouchableOpacity>
  );
}
