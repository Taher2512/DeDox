import {useConnection} from './providers/ConnectionProvider';
import React, {useState, useCallback} from 'react';
import {Account} from './providers/AuthorizationProvider';
import {alertAndLog} from '../util/alertAndLog';
import {LAMPORTS_PER_SOL} from '@solana/web3.js';
import {Button} from 'react-native-paper';
import {Text, TouchableOpacity} from 'react-native';

function convertLamportsToSOL(lamports) {
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(
    (lamports || 0) / LAMPORTS_PER_SOL,
  );
}

const LAMPORTS_PER_AIRDROP = 1000000000;

export default function RequestAirdropButton({
  selectedAccount,
  onAirdropComplete,
}) {
  const {connection} = useConnection();
  const [airdropInProgress, setAirdropInProgress] = useState(false);
  const requestAirdrop = useCallback(async () => {
    const signature = await connection.requestAirdrop(
      selectedAccount.publicKey,
      LAMPORTS_PER_AIRDROP,
    );

    return await connection.confirmTransaction(signature);
  }, [connection, selectedAccount]);
  return (
    <TouchableOpacity
      className="bg-[#6495ED] rounded-full px-3 py-1"
      disabled={airdropInProgress}
      onPress={async () => {
        if (airdropInProgress) {
          return;
        }
        setAirdropInProgress(true);
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const result = await requestAirdrop();
          alertAndLog(
            'Funding successful:',
            String(convertLamportsToSOL(LAMPORTS_PER_AIRDROP)) +
              ' SOL added to ' +
              selectedAccount.publicKey,
          );
          onAirdropComplete(selectedAccount);
        } catch (err) {
          alertAndLog(
            'Failed to fund account:',
            err instanceof Error ? err.message : err,
          );
        } finally {
          setAirdropInProgress(false);
        }
      }}>
      <Text className="text-white text-xs">Request Airdrop</Text>
    </TouchableOpacity>
  );
}
