/*eslint-disable*/
import React, {useEffect, useState} from 'react';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';

import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ActivityIndicator, Button, Searchbar} from 'react-native-paper';
import {CONNECTION, getUserPDA, imageURI} from '../components/constants';
import usePhantomConnection from '../hooks/WalletContextProvider';
import {hex} from '@project-serum/anchor/dist/cjs/utils/bytes';
import {Program} from '@project-serum/anchor';
import idl from '../../contracts/idl/idl.json';
import {PublicKey} from '@solana/web3.js';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Circle, Defs, Pattern, Rect, Svg} from 'react-native-svg';

const {width, height} = Dimensions.get('window');

export default function AddUser({route}) {
  const {phantomWalletPublicKey, signAllTransactions, signAndSendTransaction} =
    usePhantomConnection();
  const [users, setusers] = useState([]);
  const [searchedUser, setSearchedUser] = useState('');
  const [text, settext] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [properaddress, setproperaddress] = useState('');
  const [loader, setloader] = useState(false);
  const customProvider = {
    publicKey: phantomWalletPublicKey,
    signTransaction: signAndSendTransaction,
    signAllTransactions: signAllTransactions,
    connection: CONNECTION,
  };

  const {imageUri, publicKey} = route.params;
  const navigation = useNavigation();

  const program = new Program(
    idl,
    'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC',
    customProvider,
  );

  useEffect(() => {
    searchUploader();
  }, []);

  const searchUploader = async () => {
    try {
      const userPDA = await getUserPDA(phantomWalletPublicKey);
      const user = await program.account.userPhoto.fetch(userPDA);
      console.log(user);
      setusers([user]);
    } catch (error) {
      console.log('Error searching:', error);
    }
  };

  const handleSearch = async () => {
    setloader(true);
    setErrorMessage('');
    setSearchedUser(null);

    if (!text) {
      setErrorMessage('Please enter a public key.');
      setloader(false);
      return;
    }

    try {
      const publicKey = new PublicKey(text);
      const searchPda = await getUserPDA(publicKey);
      const searchUser = await program.account.userPhoto.fetch(searchPda);
      setloader(false);
      setSearchedUser(searchUser);
      setproperaddress(searchUser);
    } catch (error) {
      setloader(false);
      console.log('Error searching:', error);
      if (error instanceof Error) {
        if (error.message.includes('Invalid public key input')) {
          setErrorMessage('Invalid public key format.');
        } else if (error.message.includes('Account does not exist')) {
          setErrorMessage('User not found.');
        } else {
          setErrorMessage('An error occurred while searching.');
        }
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const remove = item => {
    const newUsers = users.filter(user => user.user.toString() != item);
    setusers(newUsers);
  };

  return (
    <LinearGradient
      colors={['black', 'black', 'black']}
      style={styles.gradient}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Pattern
            id="pattern"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.3)" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#pattern)" />
      </Svg>
      <View
        style={{
          flex: 1,
          paddingTop: StatusBar.currentHeight + 70,
          padding: 20,
        }}>
        <View
          className="self-center w-full mx-6 absolute top-6 flex-row items-center justify-center"
          style={{marginTop: StatusBar.currentHeight}}>
          <View className="w-1/3 h-1.5 rounded-full bg-white mx-1.5"></View>
          <View className="w-1/3 h-1.5 rounded-full bg-white mx-1.5"></View>
          <View
            className="w-1/3 h-1.5 rounded-full bg-transparent border-white mx-1.5"
            style={{borderWidth: 0.4}}></View>
        </View>
        <Searchbar
          value={text}
          onChangeText={settext}
          onSubmitEditing={handleSearch}
          placeholder="Enter signer public key..."
          placeholderTextColor={'white'}
          selectionColor={'white'}
          iconColor="white"
          inputStyle={{color: 'white'}}
          style={{
            backgroundColor: 'transparent',
            borderColor: 'white',
            borderWidth: 1,
          }}
        />
        <View
          style={{
            width: '100%',
            height: 110,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {searchedUser && (
            <View
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                height: 90,
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 15,
                flexDirection: 'row',
                padding: 10,
                borderWidth: 0.4,
                borderColor: 'white',
              }}>
              <Image
                source={{uri: searchedUser.imageHash.toString()}}
                style={{
                  height: '100%',
                  aspectRatio: 1,
                  borderRadius: 15,
                  resizeMode: 'stretch',
                }}
              />
              <View
                style={{
                  width: '50%',
                  height: '100%',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'semibold',
                    textAlign: 'center',
                  }}>
                  Address :{' '}
                  {searchedUser.user.toString().slice(0, 5) +
                    '...' +
                    searchedUser.user
                      .toString()
                      .slice(
                        searchedUser.user.toString().length - 4,
                        searchedUser.user.toString().length,
                      )}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (properaddress) {
                    users.push(properaddress);
                    setSearchedUser(null);
                  }

                  setproperaddress('');
                }}
                style={{
                  backgroundColor: 'green',
                  padding: 7,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    marginHorizontal: 4,
                    marginVertical: 2,
                  }}>
                  Add User
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {errorMessage && (
            <Text style={{color: 'red', fontSize: 14, fontWeight: 'bold'}}>
              {errorMessage}
            </Text>
          )}
          {loader && <ActivityIndicator size="small" color="white" />}
          <View
            style={{
              height: 1,
              width: '100%',
              backgroundColor: 'white',
              top: 15,
            }}
          />
        </View>
        <View style={{flex: 1, paddingTop: 20, gap: 20}}>
          <Text style={{fontSize: 20, color: 'white'}}>Signers added:</Text>
          {users &&
            users.map((item, index) => {
              return (
                <View
                  key={index}
                  style={{
                    width: '100%',
                    height: 80,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 15,
                    padding: 10,
                    borderWidth: 0.4,
                    borderColor: 'white',
                  }}>
                  <Image
                    source={{uri: item.imageHash}}
                    style={{
                      height: '100%',
                      aspectRatio: 1,
                      borderRadius: 15,
                      resizeMode: 'stretch',
                    }}
                  />
                  <View
                    style={{
                      width: '50%',
                      height: '100%',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 'semibold',
                        textAlign: 'center',
                      }}>
                      Address :{' '}
                      {item.user.toString().slice(0, 5) +
                        '...' +
                        item.user
                          .toString()
                          .slice(
                            item.toString().length - 4,
                            item.toString().length,
                          )}
                    </Text>
                  </View>
                  {index != 0 && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'red',
                        padding: 7,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{color: 'white'}}
                        onPress={() => {
                          remove(item.user.toString());
                        }}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  )}
                  {index == 0 && <View />}
                </View>
              );
            })}
        </View>
        <View className="self-center w-full absolute bottom-8 flex-row items-center justify-between">
          <Button
            icon="arrow-left"
            mode="contained"
            className="bg-transparent"
            style={{borderColor: '#fff', borderWidth: 0.4}}
            labelStyle={{fontSize: 17}}
            onPress={() => {
              if (imageUri) {
                navigation.navigate('AddImage', {publicKey});
              } else {
                setShowError(true);
              }
            }}>
            BACK
          </Button>
          <Button
            icon="arrow-right"
            mode="contained"
            className="bg-transparent"
            style={{borderColor: '#fff', borderWidth: 0.4}}
            contentStyle={{
              flexDirection: 'row-reverse',
            }}
            labelStyle={{fontSize: 17}}
            onPress={() => {
              const modifiedUsers = users.map(userObj => ({
                ...userObj,
                user: userObj.user.toString(),
              }));

              navigation.navigate('UploadDoc', {
                imageUri,
                publicKey,
                users: modifiedUsers,
              });
            }}>
            Preview
          </Button>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
});
