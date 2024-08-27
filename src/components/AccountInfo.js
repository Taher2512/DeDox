import React, {useEffect, useState} from 'react';
import {LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {StyleSheet, View, Text, ImageBackground} from 'react-native';
import {Card, Button, useTheme, ActivityIndicator} from 'react-native-paper';
import RequestAirdropButton from './RequestAirdropButton';
import DisconnectButton from './DisconnectButton';
import LinearGradient from 'react-native-linear-gradient';
import usePhantomConnection from '../hooks/WalletContextProvider';

function convertLamportsToSOL(lamports) {
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(
    (lamports || 0) / LAMPORTS_PER_SOL,
  );
}

export default function AccountInfo({publicKey}) {
  const [balance, setBalance] = useState(null);

  const {colors} = useTheme();
  const {disconnect, requestAirdrop, fetchWalletBalance} =
    usePhantomConnection();

  const fetchAndUpdateBalance = async () => {
    const newBalance = await fetchWalletBalance();
    console.log('New balance:', newBalance);

    setBalance(newBalance);
  };

  useEffect(() => {
    fetchAndUpdateBalance();
  }, [publicKey]); // Fetch balance when publicKey changes

  const handleRequestAirdrop = async () => {
    await requestAirdrop(publicKey);
    fetchAndUpdateBalance(); // Fetch updated balance after airdrop
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.content}>
        <Text style={styles.title} className="text-white">
          DeDox.
        </Text>
        <View style={styles.walletCard}>
          <ImageBackground
            source={require('../assets/backgrounds/wallet-bg-2.jpg')}
            className="p-5">
            <View className="mb-10 flex-row justify-between items-center ">
              <Text className="text-white">Wallet Info</Text>
              <View style={styles.buttonGroup}>
                <DisconnectButton onDisconnect={disconnect} />
                <RequestAirdropButton onRequestAirdrop={handleRequestAirdrop} />
              </View>
            </View>
            <View>
              {balance !== null ? (
                <Text style={[styles.walletBalance, {marginTop: 10}]}>
                  {convertLamportsToSOL(balance)} SOL
                </Text>
              ) : (
                <View className="flex-row items-center" style={{marginTop: 10}}>
                  <ActivityIndicator color="#fff" size={18} className="mr-3" />
                  <Text style={[styles.walletBalance]}>SOL</Text>
                </View>
              )}

              <Text style={[styles.walletNameSubtitle]}>{publicKey}</Text>
            </View>
          </ImageBackground>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
  },
  walletHeader: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  walletBalance: {
    alignSelf: 'flex-start',
    color: '#ddd',
    fontSize: 18,
    fontWeight: '600',
  },
  walletNameSubtitle: {
    alignSelf: 'flex-start',
    color: '#ddd',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  walletCard: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 30,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
});
