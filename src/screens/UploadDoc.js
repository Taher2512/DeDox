import React, {useState, useMemo, useCallback} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {Button, TextInput, HelperText} from 'react-native-paper';
import axios from 'axios';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import {useNavigation} from '@react-navigation/native';
import {PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import {BN, Program} from '@project-serum/anchor';
import idl from '../../contracts/idl/idl.json';
import {CONNECTION} from '../components/constants';
import firestore from '@react-native-firebase/firestore';
import usePhantomConnection from '../hooks/WalletContextProvider';

const programId = new PublicKey('Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC');

const WalletAddressInput = React.memo(({address, index, addressError}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={address}
        placeholder={index === 0 ? 'Your wallet address' : 'Wallet address'}
        style={styles.input}
        textColor="#fff"
        cursorColor="#fff"
        placeholderTextColor={'#ddd'}
        outlineColor="#fff"
        underlineColor="#fff"
        selectionColor="#fff"
        activeUnderlineColor="#fff"
        activeOutlineColor="#fff"
        editable={false}
        blurOnSubmit={false}
      />
      <HelperText type="error" visible={!!addressError}>
        {addressError}
      </HelperText>
    </View>
  );
});

const UploadDoc = ({route}) => {
  const [addressErrors, setAddressErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {imageUri, publicKey, users: userObjects} = route.params;

  const walletAddresses = userObjects.map(user => user.user.toString());
  const navigation = useNavigation();

  const {phantomWalletPublicKey, signAndSendTransaction, signAllTransactions} =
    usePhantomConnection();

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
      Alert.alert('No image selected');
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

        // Now proceed with Solana upload
        if (!phantomWalletPublicKey) {
          Alert.alert('Error', 'Wallet not connected');
          setUploading(false);
          return;
        }

        const pubKey = new PublicKey(phantomWalletPublicKey);
        console.log('Using public key:', pubKey.toString());
        // const signerArray = walletAddresses;
        const signerArray = walletAddresses.map(
          address => new PublicKey(address),
        );
        const docId = Date.now();
        const [documentPDA, bump] = await PublicKey.findProgramAddress(
          [
            Buffer.from('document'),
            pubKey.toBuffer(),
            new BN(docId).toArrayLike(Buffer, 'le', 8),
          ],
          programId,
        );
        console.log('Document PDA:', documentPDA.toString());

        const transaction = new Transaction();
        const customProvider = {
          publicKey: pubKey,
          signTransaction: signAndSendTransaction,
          signAllTransactions: signAllTransactions,
          connection: CONNECTION,
        };

        console.log('reached here', pubKey);
        const program = new Program(
          idl,
          'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC',
          customProvider,
        );
        const tx = await program.methods
          .addDocument(
            new BN(docId),
            response.data.ipfsHash,
            new BN(Date.now()),
            signerArray,
          )
          .accounts({
            document: documentPDA,
            user: pubKey,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        transaction.add(tx);
        transaction.feePayer = pubKey;
        const {blockhash, lastValidBlockHeight} =
          await CONNECTION.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;

        try {
          const signedTransaction = await signAndSendTransaction(transaction);
          console.log('Signed transaction:', signedTransaction);

          await firestore().collection('documents').add({
            documentPDA: documentPDA.toString(),
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
          Alert.alert(
            'Error',
            'Failed to sign or send transaction: ' + signError.message,
          );
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
  }, [
    imageUri,
    validateWalletAddresses,
    walletAddresses,
    phantomWalletPublicKey,
    signAndSendTransaction,
    signAllTransactions,
    navigation,
    publicKey,
  ]);

  const Children = useMemo(() => {
    return (
      <ScrollView
        contentContainerStyle={{
          marginTop: StatusBar.currentHeight + 20,
          padding: 20,
          minHeight: '100%',
          paddingBottom: 150,
        }}>
        {imageUri && (
          <View>
            <Text className="text-white text-xs">Document Image:</Text>
            <Image source={{uri: imageUri}} style={styles.imagePreview} />
          </View>
        )}
        <Text className="text-white text-xs">Your address:</Text>
        {walletAddresses.map((address, index) => (
          <>
            {index === 1 && (
              <Text className="text-white text-xs">Signers:</Text>
            )}
            <WalletAddressInput
              key={index}
              address={address}
              index={index}
              addressError={addressErrors[index]}
            />
          </>
        ))}
        <Button
          loading={uploading}
          onPress={handleUpload}
          mode="contained"
          icon={uploading ? '' : 'cloud-upload'}
          style={[styles.button, {borderColor: '#fff', borderWidth: 0.4}]}>
          {uploading ? 'Uploading...' : 'Upload to IPFS and Solana'}
        </Button>
        <Button
          icon="arrow-left"
          mode="contained"
          className="bg-transparent w-full absolute bottom-20 self-center"
          style={{borderColor: '#fff', borderWidth: 0.4}}
          labelStyle={{fontSize: 17}}
          onPress={() => {
            if (imageUri) {
              navigation.navigate('AddUser', {imageUri, publicKey});
            } else {
              setShowError(true);
            }
          }}>
          BACK
        </Button>
      </ScrollView>
    );
  }, [imageUri, walletAddresses, addressErrors, uploading, handleUpload]);

  return <EnhancedDarkThemeBackground children={Children} />;
};

export default UploadDoc;

const styles = StyleSheet.create({
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 16,
  },
  button: {
    marginVertical: 8,
    backgroundColor: 'transparent',
    borderWidth: 0.4,
    borderColor: '#fff',
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    width: '100%',
  },
});
