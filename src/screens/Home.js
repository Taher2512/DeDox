/*eslint-disable*/
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  ToastAndroid,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
} from 'react-native';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import AccountInfo from '../components/AccountInfo';
import {ActivityIndicator, IconButton} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {CONNECTION, getUserPDA, imageURI} from '../components/constants';
import usePhantomConnection from '../hooks/WalletContextProvider';
import {Program} from '@project-serum/anchor';
import {PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import idl from '../../contracts/idl/idl.json';
import {launchCamera} from 'react-native-image-picker';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';

export default function Home({route}) {
  const {width, height} = Dimensions.get('window');
  const {publicKey} = route.params;
  const {signAndSendTransaction, signAllTransactions, phantomWalletPublicKey} =
    usePhantomConnection();
  const navigation = useNavigation();
  const [loggedin, setloggedin] = useState(false);
  const [documents, setdocuments] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const customProvider = {
    publicKey: new PublicKey(phantomWalletPublicKey),
    signTransaction: signAndSendTransaction,
    signAllTransactions: signAllTransactions,
    connection: CONNECTION,
  };

  const program = new Program(
    idl,
    'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC',
    customProvider,
  );

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (loggedin) {
      getDocs();
    }
  }, [loggedin]);

  useFocusEffect(
    useCallback(() => {
      if (loggedin) {
        getDocs();
      }
    }, [loggedin, getDocs]),
  );

  const getDocs = async () => {
    const docs = await firestore().collection('documents').get();
    console.log(docs.docs.length);
    const docPDAs = docs.docs.map(doc => new PublicKey(doc.data().documentPDA));
    console.log(docPDAs);
    console.log(docs.docs[0].data().documentPDA);
    const arr = [];
    const detaildocs = await program.account.document.fetchMultiple(docPDAs);
    console.log(detaildocs);
    let i = 0;
    detaildocs.forEach(doc => {
      if (doc.signers.toString().includes(phantomWalletPublicKey.toString())) {
        arr.push({...doc});
      }
      i++;
    });
    setdocuments(arr);
  };
  const checkUser = async pubKey => {
    const program = new Program(
      idl,
      'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC',
      // '2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk',
      {
        publicKey: new PublicKey(phantomWalletPublicKey),
        signTransaction: signAndSendTransaction,
        signAllTransactions: signAllTransactions,
        connection: CONNECTION,
      },
    );
    try {
      const userPDA = await getUserPDA(phantomWalletPublicKey);
      console.log('userPDA', userPDA.toString());
      let user = '';
      user = await program.account.userPhoto.fetch(new PublicKey(userPDA));
      console.log('user', user);
      if (user) {
        setloggedin(true);
      }
    } catch (error) {
      console.log('error', error);
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
      });
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
      formData.append(
        'walletAddresses',
        JSON.stringify(phantomWalletPublicKey),
      );

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

        if (response.data.success === true) {
          console.log('Image uploaded successfully:', response.data);
          console.log('IPFS Hash:', response.data.ipfsHash);

          ToastAndroid.show('Image Uploaded Successfully!', ToastAndroid.SHORT);
          const getuserPDA = await getUserPDA(
            new PublicKey(phantomWalletPublicKey),
          );
          const transaction = new Transaction();
          const tx = await program.methods
            .addUserPhoto(imageURI + response.data.ipfsHash)
            .accounts({
              user: new PublicKey(phantomWalletPublicKey),
              userPhoto: new PublicKey(getuserPDA),
              systemProgram: SystemProgram.programId,
            })
            .instruction();
          transaction.add(tx);

          transaction.feePayer = new PublicKey(phantomWalletPublicKey);
          const {blockhash, lastValidBlockHeight} =
            await CONNECTION.getLatestBlockhash('confirmed');
          transaction.recentBlockhash = blockhash;
          console.log('Transaction before sending to Phantom:', transaction);
          try {
            const signedTransaction = await signAndSendTransaction(transaction);
            console.log('Signed transaction:', signedTransaction);
            Alert.alert('Success', 'User photo added successfully');
            setloggedin(true);
          } catch (signError) {
            console.error('Error signing or sending transaction:', signError);
            Alert.alert(
              'Error',
              'Failed to sign or send transaction: ' + signError.message,
            );
          }
        } else {
          alert('Failed to upload. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload. Please try again.');
      } finally {
        // setUploading(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getDocs().then(() => setRefreshing(false));
  }, [getDocs]);

  const Children = ({}) => {
    return (
      <>
        {!loggedin && (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ActivityIndicator size="small" color="white" />
            <Text
              style={{
                fontSize: 17,
                fontWeight: 'bold',
                color: 'white',
                marginLeft: 14,
              }}>
              Uploading user data on Solana...
            </Text>
          </View>
        )}
        {loggedin && (
          <View
            style={{
              paddingTop: StatusBar.currentHeight + 20,
              padding: 20,
              height: '100%',
            }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AddImage', {publicKey})}
              style={{
                position: 'absolute',
                bottom: 46,
                right: 26,
                borderWidth: 1,
                borderColor: 'white',
                borderRadius: 150,
                padding: 8,
                zIndex: 10,
              }}>
              <IconButton icon="plus" size={25} iconColor="#fff" />
            </TouchableOpacity>
            <AccountInfo publicKey={publicKey} />
            {documents && (
              <FlatList
                data={documents}
                numColumns={3}
                keyExtractor={item => item.toString()}
                ItemSeparatorComponent={() => <View style={{height: 20}} />}
                contentContainerStyle={{
                  alignItems: 'center',
                  marginRight: -20,
                  marginTop: 10,
                  borderWidth: 1,
                }}
                renderItem={({item}) => {
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate('DocumentDetail', {
                          imageUri: imageURI + item.imageHash,
                          signers: item.signers.toString(),
                          uploader: item.uploader.toString(),
                          docId: item.id.toString(),
                        })
                      }
                      style={{
                        height: 150,
                        width: (width - 60) / 3.5,
                        marginRight: 20,
                        borderRadius: 20,
                      }}>
                      <Image
                        source={{uri: imageURI + item.imageHash}}
                        style={{
                          height: '100%',
                          width: '100%',
                          resizeMode: 'stretch',
                          borderRadius: 20,
                        }}
                      />
                    </TouchableOpacity>
                  );
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            )}
          </View>
        )}
      </>
    );
  };
  return <EnhancedDarkThemeBackground children={<Children />} />;
}
