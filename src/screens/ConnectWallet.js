/*eslint-disable*/
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

import {Header} from '../components/Header';
import UploadModal from '../components/UploadModal';
import AddUser from '../components/AddUser';
import usePhantomConnection from '../hooks/WalletContextProvider';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';

export default function ConnectWallet() {
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const {connect} = usePhantomConnection();
  // const fetchAndUpdateBalance = useCallback(
  //   async account => {
  //     console.log('Fetching balance for: ' + account.publicKey);
  //     const fetchedBalance = await connection.getBalance(account.publicKey);
  //     console.log('Balance fetched: ' + fetchedBalance);
  //     setBalance(fetchedBalance);
  //   },
  //   [connection],
  // );

  // useEffect(() => {
  //   if (!selectedAccount) {
  //     return;
  //   }
  //   fetchAndUpdateBalance(selectedAccount);
  // }, [fetchAndUpdateBalance, selectedAccount]);

  // const showModal = () => setModalVisible(true);
  // const hideModal = () => setModalVisible(false);

  // const handleUploadSuccess = () => {
  //   // Implement any logic needed after successful upload
  //   console.log('Upload completed successfully');
  // };
  const Children = ({}) => {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.mainContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <>
              <Header />
              <View style={styles.connectButtonContainer}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={connect}
                  style={{
                    width: '80%',
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: 'white',
                    padding: 15,
                    alignItems: 'center',
                    marginTop: -150,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}>
                    Connect
                  </Text>
                </TouchableOpacity>
                {/* <AddUser /> */}
              </View>
            </>

            {/* {selectedAccount && (
            <AccountInfo
              selectedAccount={selectedAccount}
              balance={balance}
              fetchAndUpdateBalance={fetchAndUpdateBalance}
            />
          )} */}
          </ScrollView>
          {/* {selectedAccount && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.floatingButton}
            onPress={showModal}>
            <IconButton icon="plus" size={25} iconColor="#fff" />
          </TouchableOpacity>
        )} */}
          {/* <UploadModal
          visible={modalVisible}
          hideModal={hideModal}
          onUpload={handleUploadSuccess}
          userWalletAddress={
            selectedAccount ? selectedAccount.publicKey.toBase58() : ''
          } */}
          {/* /> */}
        </View>
      </View>
    );
  };
  return <EnhancedDarkThemeBackground children={<Children />} />;
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
