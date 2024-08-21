import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, Image, Button} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';

import {Section} from '../components/Section';
import ConnectButton from '../components/ConnectButton';
import AccountInfo from '../components/AccountInfo';
import {
  useAuthorization,
  Account,
} from '../components/providers/AuthorizationProvider';
import {useConnection} from '../components/providers/ConnectionProvider';
import DisconnectButton from '../components/DisconnectButton';
import RequestAirdropButton from '../components/RequestAirdropButton';
import SignMessageButton from '../components/SignMessageButton';
import SignTransactionButton from '../components/SignTransactionButton';
import {Header} from '../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import Upload from '../components/Upload';

export default function MainScreen() {
  const {connection} = useConnection();
  const {selectedAccount} = useAuthorization();
  const [balance, setBalance] = useState(0);
  const [imageUri, setImageUri] = useState(null);

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

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const uploadImage = async () => {
    if (!imageUri) return;

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(
        'https://dedox-backend.onrender.com/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      console.log('Image uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
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
              <View className="h-2/3 items-center justify-center">
                <ConnectButton title="Connect wallet" />
              </View>
            </>
          )}
          {selectedAccount ? (
            <>
              <AccountInfo
                selectedAccount={selectedAccount}
                balance={balance}
                fetchAndUpdateBalance={fetchAndUpdateBalance}
              />
              {/* <Button title="Select Image" onPress={selectImage} />
              {imageUri && (
                <View>
                  <Image source={{uri: imageUri}} style={styles.imagePreview} />
                  <Button title="Upload Image" onPress={uploadImage} />
                </View>
              )} */}
            </>
          ) : null}
        </ScrollView>
        {selectedAccount ? (
          <Upload />
        ) : (
          <Text>Please connect your account...</Text>
        )}
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
    height: '100%',
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 16,
  },
  buttonGroup: {
    flexDirection: 'column',
    paddingVertical: 4,
  },
});
