import React, {useCallback, useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Modal, Portal, Button, TextInput, IconButton} from 'react-native-paper';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

import {useAuthorization} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import ConnectButton from '../components/ConnectButton';
import AccountInfo from '../components/AccountInfo';
import {Header} from '../components/Header';
import UploadModal from '../components/UploadModal';
import AddUser from '../components/Buttons';

export default function MainScreen() {
  const {connection} = useConnection();
  const {selectedAccount} = useAuthorization();
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchAndUpdateBalance = useCallback(
    async account => {
      console.log('Fetching balance for: ' + account.publicKey);
      const fetchedBalance = await connection.getBalance(account.publicKey);
      console.log('Balance fetched: ' + fetchedBalance);
      setBalance(fetchedBalance);
    },
    [connection],
  );

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }
    fetchAndUpdateBalance(selectedAccount);
  }, [fetchAndUpdateBalance, selectedAccount]);

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const handleUploadSuccess = () => {
    // Implement any logic needed after successful upload
    console.log('Upload completed successfully');
  };

  return (
    <LinearGradient
      colors={['#0e1111', '#0e1111']}
      style={styles.mainContainer}>
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {!selectedAccount && (
            <>
              <Header />
              <View style={styles.connectButtonContainer}>
                <ConnectButton title="Connect wallet" />
              </View>
            </>
          )}
          {selectedAccount && (
            <AccountInfo
              selectedAccount={selectedAccount}
              balance={balance}
              fetchAndUpdateBalance={fetchAndUpdateBalance}
            />
          )}
        </ScrollView>
        {selectedAccount && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.floatingButton}
            onPress={showModal}>
            <IconButton icon="plus" size={25} iconColor="#fff" />
          </TouchableOpacity>
        )}
        <AddUser />
        <UploadModal
          visible={modalVisible}
          hideModal={hideModal}
          onUpload={handleUploadSuccess}
          userWalletAddress={
            selectedAccount ? selectedAccount.publicKey.toBase58() : ''
          }
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    padding: 16,
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  connectButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 30,
    padding: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 16,
  },
  button: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
});

// "@solana/wallet-adapter-react": "^0.15.35",
// "@solana/web3.js": "^1.95.2",
// "@project-serum/anchor": "^0.26.0",
// "assert": "^2.1.0",
// "buffer": "^6.0.3",
