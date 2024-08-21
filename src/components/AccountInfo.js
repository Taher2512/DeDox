import React from 'react';
import {LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {StyleSheet, View, Text, ImageBackground} from 'react-native';
import {Card, Button, useTheme} from 'react-native-paper';
import RequestAirdropButton from './RequestAirdropButton';
import DisconnectButton from './DisconnectButton';
import LinearGradient from 'react-native-linear-gradient';

function convertLamportsToSOL(lamports) {
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(
    (lamports || 0) / LAMPORTS_PER_SOL,
  );
}

export default function AccountInfo({
  balance,
  selectedAccount,
  fetchAndUpdateBalance,
}) {
  const {colors} = useTheme();

  return (
    <View style={[styles.container]}>
      <View style={styles.content}>
        <Text style={styles.title} className="text-white">
          DeDox.
        </Text>
        <View style={styles.walletCard}>
          <ImageBackground
            source={require('../assets/backgrounds/wallet-bg.jpg')}
            className="p-5">
            {/* <Text style={[styles.walletHeader, {color: colors.primary}]}>
            Wallet Account Info
          </Text> */}

            {/* <Text style={[styles.walletBalance, {color: colors.onSurface}]}>
            {selectedAccount.label
              ? `${selectedAccount.label}: ◎${
                  balance ? convertLamportsToSOL(balance) : '0'
                } SOL`
              : 'Wallet name not found'}
          </Text> */}
            <View className="mb-10 flex-row justify-between items-center ">
              <Text className="text-white">Wallet Info</Text>
              <View style={styles.buttonGroup}>
                <DisconnectButton title={'Disconnect'} />
                <RequestAirdropButton
                  selectedAccount={selectedAccount}
                  onAirdropComplete={async account =>
                    await fetchAndUpdateBalance(account)
                  }
                />
              </View>
            </View>
            <View>
              <Text style={[styles.walletBalance]}>
                {selectedAccount.label
                  ? `${balance ? convertLamportsToSOL(balance) : '0'} SOL`
                  : 'Wallet name not found'}
              </Text>
              <Text style={[styles.walletNameSubtitle]}>
                {selectedAccount.address}
              </Text>
            </View>
          </ImageBackground>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderRadius: 16,
    // elevation: 4,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
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
    marginTop: 10,
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
