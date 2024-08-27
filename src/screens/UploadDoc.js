import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  IconButton,
  TextInput,
  HelperText,
  Icon,
} from 'react-native-paper';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import {useNavigation} from '@react-navigation/native';
import AddDocumentButton from '../components/AddDocumentButton';
import { jsiConfigureProps } from 'react-native-reanimated/lib/typescript/core';
import usePhantomConnection from '../hooks/WalletContextProvider';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { BN, Program } from '@project-serum/anchor';
import idl from "../../contracts/idl/idl.json"
import { CONNECTION } from '../components/constants';
import firestore from '@react-native-firebase/firestore';

const programId = new PublicKey('2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk');

const WalletAddressInput = React.memo(
  ({
    address,
    index,
    updateWalletAddress,
    removeWalletAddress,
    addressError,
  }) => {
    const handleChangeText = useCallback(
      text => {
        updateWalletAddress(index, text);
      },
      [index, updateWalletAddress],
    );

    const handleRemove = useCallback(() => {
      removeWalletAddress(index);
    }, [index, removeWalletAddress]);

    return (
      <View style={styles.inputContainer}>
        <View style={{flexDirection: 'row'}}>
          <TextInput
            value={address}
            onChangeText={handleChangeText}
            placeholder={
              index === 0 ? 'Your wallet address' : 'Enter wallet address'
            }
            style={styles.input}
            textColor="#fff"
            cursorColor="#fff"
            placeholderTextColor={'#ddd'}
            outlineColor="#fff"
            underlineColor="#fff"
            selectionColor="#fff"
            activeUnderlineColor="#fff"
            activeOutlineColor="#fff"
            editable={index !== 0}
            blurOnSubmit={false}
          />
          {index !== 0 && (
            <IconButton
              icon="trash-can-outline"
              iconColor="#fff"
              size={20}
              onPress={handleRemove}
            />
          )}
        </View>
        <HelperText type="error" visible={!!addressError}>
          {addressError}
        </HelperText>
      </View>
    );
  },
);

const UploadDoc = ({route}) => {
  const [imageUri, setImageUri] = useState(null);
  const [walletAddresses, setWalletAddresses] = useState(['']);
  const [addressErrors, setAddressErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {publicKey} = route.params;
  const navigation = useNavigation();

  const {
    phantomWalletPublicKey,
    signAndSendTransaction,
    signAllTransactions,
  } = usePhantomConnection();

  useEffect(() => {
    if (publicKey) {
      setWalletAddresses([publicKey]);
      setAddressErrors([]);
    }
  }, [publicKey]);

  const selectImage = useCallback(() => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  }, []);

  const addWalletAddressField = useCallback(() => {
    setWalletAddresses(prev => [...prev, '']);
    setAddressErrors(prev => [...prev, '']);
  }, []);

  const updateWalletAddress = useCallback((index, value) => {
    setWalletAddresses(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setAddressErrors(prev => {
      const updated = [...prev];
      updated[index] = '';
      return updated;
    });
  }, []);

  const removeWalletAddress = useCallback(index => {
    if (index === 0) return;
    setWalletAddresses(prev => prev.filter((_, i) => i !== index));
    setAddressErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateWalletAddresses = useCallback(() => {
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    const newErrors = walletAddresses.map(address =>
      address && !solanaAddressRegex.test(address)
        ? 'Invalid Solana address'
        : '',
    );
    setAddressErrors(newErrors);
    return newErrors.every(error => error === '');
  }, [walletAddresses]);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    if (!imageUri) {
      Alert.alert('Please select an image');
      setUploading(false);
      return;
    }

    if (!validateWalletAddresses()) {
      Alert.alert('Please correct the wallet addresses');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
    formData.append('walletAddresses', JSON.stringify(walletAddresses));

    try {
      // Upload image to IPFS
      const response = await axios.post(
        'https://dedox-backend.onrender.com/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.success === true) {
        console.log('Image uploaded successfully:', response.data);
        console.log('IPFS Hash:', response.data.ipfsHash);
        
        // Now proceed with blockchain upload
        if (!phantomWalletPublicKey) {
          Alert.alert('Error', 'Wallet not connected');
          setUploading(false);
          return;
        }

        const pubKey = new PublicKey(phantomWalletPublicKey);
        console.log("Using public key:", pubKey.toString());
        const signerArray = walletAddresses.map((signer) => new PublicKey(signer));
        const docId = Date.now(); // Use current timestamp as docId
        const [documentPDA, bump] = await PublicKey.findProgramAddress(
          [
            Buffer.from("document"),
            pubKey.toBuffer(),
            new BN(docId).toArrayLike(Buffer, 'le', 8)
          ],
          programId
        );
        console.log("Document PDA:", documentPDA.toString());

        const transaction = new Transaction();
        const customProvider = {
          publicKey: pubKey,
          signTransaction: signAndSendTransaction,
          signAllTransactions: signAllTransactions,
          connection: CONNECTION
        };

        console.log("reached here", pubKey);
        const program = new Program(idl, "2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk", customProvider);
        const tx = await program.methods.addDocument(
          new BN(docId),
          response.data.ipfsHash,
          new BN(Date.now()),
          signerArray
        ).accounts({
          document: documentPDA,
          user: pubKey,
          systemProgram: SystemProgram.programId,
        }).instruction();

        transaction.add(tx);
        transaction.feePayer = pubKey;
        const { blockhash, lastValidBlockHeight } = await CONNECTION.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;

        try {
          const signedTransaction = await signAndSendTransaction(transaction);
          console.log("Signed transaction:", signedTransaction);
          
          await firestore().collection('documents').add({
            documentPDA: documentPDA.toString()
          });
          
          ToastAndroid.show(
            'Document Uploaded Successfully to Solana!',
            ToastAndroid.SHORT,
          );

          setTimeout(() => {
            navigation.navigate('Home', {publicKey: publicKey});
          }, 1000);
        } catch (signError) {
          console.error('Error signing or sending transaction:', signError);
          Alert.alert('Error', 'Failed to sign or send transaction: ' + signError.message);
        }
      } else {
        Alert.alert('Failed to upload. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [imageUri, validateWalletAddresses, walletAddresses, phantomWalletPublicKey, signAndSendTransaction, signAllTransactions]);

  const Children = useMemo(() => {
    return (
      <ScrollView
        contentContainerStyle={{
          marginTop: StatusBar.currentHeight + 20,
          padding: 20,
          minHeight: '100%',
          paddingBottom: 100,
        }}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.imagePreview} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={selectImage}
            className="h-40 border border-white rounded-lg mb-4 items-center justify-center">
            <Icon source={'tray-arrow-up'} color="#fff" size={60} />
          </TouchableOpacity>
        )}
        <Button
          onPress={selectImage}
          mode="contained"
          icon={'camera'}
          style={[styles.button, {borderColor: '#fff', borderWidth: 0.4}]}>
          {imageUri ? 'Select Different Image' : 'Select Image'}
        </Button>
        {walletAddresses.map((address, index) => (
          <WalletAddressInput
            key={index}
            address={address}
            index={index}
            updateWalletAddress={updateWalletAddress}
            removeWalletAddress={removeWalletAddress}
            addressError={addressErrors[index]}
          />
        ))}
        <Button
          onPress={addWalletAddressField}
          mode="outlined"
          textColor="#fff"
          icon={'plus'}
          style={[styles.button, {borderColor: '#fff'}]}>
          Add Wallet Address
        </Button>
        <Button
          loading={uploading}
          onPress={handleUpload}
          mode="contained"
          icon={uploading ? '' : 'cloud-upload'}
          style={[styles.button, {borderColor: '#fff', borderWidth: 0.4}]}>
          {uploading ? 'Uploading...' : 'Upload to IPFS and Solana'}
        </Button>
      </ScrollView>
    );
  }, [
    imageUri,
    walletAddresses,
    addressErrors,
    uploading,
    selectImage,
    addWalletAddressField,
    updateWalletAddress,
    removeWalletAddress,
    handleUpload,
  ]);

  return <EnhancedDarkThemeBackground children={Children} />;
};

export default UploadDoc;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    margin: 20,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
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
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    width: '90%',
  },
});
