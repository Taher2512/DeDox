/*eslint-disable*/
import React, { useEffect,useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import AccountInfo from '../components/AccountInfo';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import { CONNECTION, getUserPDA, imageURI } from '../components/constants';
import usePhantomConnection from '../hooks/WalletContextProvider';
import { Program } from '@project-serum/anchor';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import idl from "../../contracts/idl/idl.json"
import { launchCamera } from 'react-native-image-picker';
import axios from 'axios';

export default function Home({route}) {
  const {width, height} = Dimensions.get('window');
  const {publicKey} = route.params;
  const {signAndSendTransaction,signAllTransactions,phantomWalletPublicKey}=usePhantomConnection()
  const navigation = useNavigation();
  const [loggedin, setloggedin] = useState(false)
  useEffect(() => {
     checkUser()
  }, [])
  
  const checkUser=async(pubKey)=>{
    const program=new Program(idl,"2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk",{
      publicKey:new PublicKey(phantomWalletPublicKey),
      signTransaction:signAndSendTransaction,
      signAllTransactions:signAllTransactions,
      connection:CONNECTION
    })
    try {
      const userPDA=await getUserPDA(phantomWalletPublicKey)
    console.log("userPDA",userPDA.toString())
    let user=''
     user=await  program.account.userPhoto.fetch(new PublicKey(userPDA))
    console.log("user",user)
    if(user){
      setloggedin(true)
    }
    } catch (error) {
      console.log("error",error)
      const result=await launchCamera({mediaType:'photo',cameraType:'front',})
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
      formData.append('walletAddresses', JSON.stringify(phantomWalletPublicKey));
  
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
          
          ToastAndroid.show(
            'Image Uploaded Successfully!',
            ToastAndroid.SHORT,
          );
          const getuserPDA=await getUserPDA(new PublicKey(phantomWalletPublicKey))
          const transaction=new Transaction()
          const tx=await program.methods.addUserPhoto(imageURI+response.data.ipfsHash).accounts({
            user:new PublicKey(phantomWalletPublicKey),
            userPhoto:new PublicKey(getuserPDA),
            systemProgram:SystemProgram.programId
          }).instruction()
          transaction.add(tx)
          
    transaction.feePayer = new PublicKey(phantomWalletPublicKey);
    const { blockhash, lastValidBlockHeight } = await CONNECTION.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    console.log("Transaction before sending to Phantom:", transaction);
    try {
      const signedTransaction = await signAndSendTransaction(transaction);
      console.log("Signed transaction:", signedTransaction);
      Alert.alert("Success", "User photo added successfully");
      setloggedin(true)
    } catch (signError) {
      console.error('Error signing or sending transaction:', signError);
      Alert.alert('Error', 'Failed to sign or send transaction: ' + signError.message);
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
    
   }
  const Children = ({}) => {
    const data = [1, 2, 3, 4];
    return (
      <>
      {loggedin&&<View
        style={{
          paddingTop: StatusBar.currentHeight + 20,
          padding: 20,
          height: '100%',
        }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('UploadDoc', {publicKey})}
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
        <FlatList
          data={data}
          numColumns={3}
          keyExtractor={item => item.toString()}
          ItemSeparatorComponent={() => <View style={{height: 20}} />}
          contentContainerStyle={{
            alignItems: 'center',
            marginRight: -20,
            marginTop: 10,
          }}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('DocumentDetail', {publicKey})
                }
                style={{
                  height: 150,
                  width: (width - 60) / 3.5,
                  marginRight: 20,
                  borderRadius: 20,
                }}>
                <Image
                  source={require('../assets/dummyimg.jpg')}
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
        />
      </View>}
      </>
    );
  };
  return <EnhancedDarkThemeBackground children={<Children />} />;
}
