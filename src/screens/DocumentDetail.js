/*eslint-disable*/
import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  ToastAndroid,
  Alert,
} from 'react-native';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Clipboard from '@react-native-clipboard/clipboard';
import {PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import usePhantomConnection from '../hooks/WalletContextProvider';
import {
  CONNECTION,
  getDocSignedPDA,
  getUserPDA,
  imageURI,
  programId,
} from '../components/constants';
import {BN, Program} from '@project-serum/anchor';
import idl from '../../contracts/idl/idl.json';
import {Icon, IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 65;
const SLIDER_WIDTH = 65;

export default function DocumentDetail({route}) {
  const [docId, setdocId] = useState(route.params.docId);
  const [signers, setsigners] = useState();
  const [uploader, setuploader] = useState('');
  const [imageUrl, setimageUrl] = useState(route.params.imageUri);

  const {phantomWalletPublicKey, signAllTransactions, signAndSendTransaction} =
    usePhantomConnection();
  const pubKey = new PublicKey(phantomWalletPublicKey);
  const customProvider = {
    publicKey: pubKey,
    signTransaction: signAndSendTransaction,
    signAllTransactions: signAllTransactions,
    connection: CONNECTION,
  };
  const program = new Program(idl, programId.toString(), customProvider);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDocumentDetails();
  }, []);

  const fetchDocumentDetails = async () => {
    try {
      const uploaderPDA = await getUserPDA(
        new PublicKey(route.params.uploader),
      );
      const uploaderData = await program.account.userPhoto.fetch(uploaderPDA);
      console.log('Uploader data fetched:', uploaderData);

      setuploader({
        user: route.params.uploader,
        imageUrl: uploaderData.imageHash.toString(),
      });

      const signerArray = [];
      const signers1 = route.params.signers.split(',');
      console.log('Signers:', signers1);

      for (let i = 0; i < signers1.length; i++) {
        try {
          const signerPDA = await getUserPDA(new PublicKey(signers1[i]));
          const signerData = await program.account.userPhoto.fetch(signerPDA);
          console.log('Signer data fetched:', signerData);

          let signed = false;
          let signedDocData = null;

          try {
            const signedDocPDA = await getDocSignedPDA(
              new PublicKey(signers1[i]),
              docId,
            );
            signedDocData = await program.account.signedDocument.fetch(
              signedDocPDA,
            );
            console.log('Signed document data:', signedDocData);
            signed = true;
          } catch (docError) {
            console.log('Document not signed:', docError.message);
          }

          const signerInfo = {
            signed,
            user: signers1[i].toString(),
            imageUrl: signerData.imageHash.toString(),
          };
          signerArray.push(signerInfo);
        } catch (signerError) {
          console.error('Error fetching signer data:', signerError.message);
          signerArray.push({
            signed: false,
            user: signers1[i].toString(),
            imageUrl: 'default_image_url',
            error: true,
          });
        }
      }

      console.log(signerArray);
      setsigners(signerArray);
    } catch (error) {
      console.error('Error in fetchDocumentDetails:', error);
    }
  };

  const signDocument = async () => {
    if (!phantomWalletPublicKey) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    try {
      const pubKey = new PublicKey(phantomWalletPublicKey);
      const documentId = docId;
      console.log('Using public key:', pubKey.toString());
      const [documentPDA, bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from('signeddocument'),
          pubKey.toBuffer(),
          new BN(documentId).toArrayLike(Buffer, 'le', 8),
        ],
        new PublicKey(programId),
      );

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
        .addSignedDocument(new BN(documentId), pubKey)
        .accounts({
          signedDocument: documentPDA,
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
        Alert.alert('Success', 'Document signed successfully');
        navigation.navigate('Home', {publicKey: pubKey.toString()});
      } catch (signError) {
        console.error('Error signing or sending transaction:', signError);
        Alert.alert(
          'Error',
          'Failed to sign or send transaction: ' + signError.message,
        );
      }
    } catch (error) {
      console.error('Error preparing transaction:', error);
      Alert.alert('Error', 'Failed to prepare transaction: ' + error.message);
    }
  };

  const Children = () => {
    const ImageComponent = Animated.createAnimatedComponent(Image);
    const [visible, setvisible] = useState(false);
    // const address = '2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk';
    const address = 'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC';
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const width = Dimensions.get('screen').width;
    const v1 = useSharedValue(0);
    const v2 = useSharedValue(1);
    const translateX = useSharedValue(0);
    const sliderWidth = Dimensions.get('screen').width;

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context) => {
        context.startX = translateX.value;
      },
      onActive: (event, context) => {
        translateX.value = Math.max(
          0,
          Math.min(
            context.startX + event.translationX,
            BUTTON_WIDTH - SLIDER_WIDTH,
          ),
        );
      },
      onEnd: () => {
        if (translateX.value > BUTTON_WIDTH - SLIDER_WIDTH - 150) {
          translateX.value = withSpring(BUTTON_WIDTH - SLIDER_WIDTH - 150);
          runOnJS(signDocument)();
        } else {
          translateX.value = withSpring(0);
        }
      },
    });

    const sliderStyle = useAnimatedStyle(() => ({
      transform: [{translateX: translateX.value}],
    }));

    const textOpacity = useAnimatedStyle(() => ({
      opacity: interpolate(
        translateX.value,
        [0, BUTTON_WIDTH - SLIDER_WIDTH],
        [1, 0],
        Extrapolate.CLAMP,
      ),
    }));

    const iconStyle = useAnimatedStyle(() => {
      const rotate = interpolate(
        translateX.value,
        [0, BUTTON_WIDTH - SLIDER_WIDTH],
        [0, 360],
        Extrapolate.CLAMP,
      );
      return {
        transform: [{rotate: `${rotate}deg`}],
      };
    });

    const animationstyle = useAnimatedStyle(() => {
      return {
        transform: [{rotate: `${v1.value}deg`}],
        width:
          x.value > width / 2
            ? withTiming(25, {duration: 500})
            : withTiming(0, {duration: 500}),
        height:
          x.value > width / 2
            ? withTiming(25, {duration: 500})
            : withTiming(0, {duration: 500}),
      };
    });

    const animationstyle2 = useAnimatedStyle(() => {
      return {
        transform: [{rotate: `${v1.value}deg`}],
        width:
          x.value > width / 2
            ? withTiming(0, {duration: 500})
            : withTiming(28, {duration: 500}),
        height:
          x.value > width / 2
            ? withTiming(0, {duration: 500})
            : withTiming(28, {duration: 500}),
      };
    });

    const animatedStyle3 = useAnimatedStyle(() => {
      return {
        opacity: v2.value,
      };
    });

    return (
      <ScrollView
        style={{
          paddingTop: StatusBar.currentHeight + 20,
          padding: 20,
          flex: 1,
        }}>
        {imageUrl && (
          <Modal
            visible={visible}
            transparent
            style={{paddingTop: StatusBar.currentHeight + 20}}>
            <IconButton
              icon="close"
              size={30}
              iconColor="#fff"
              onPress={() => {
                setvisible(false);
              }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}>
              <Image
                style={{width: '100%', height: '90%', resizeMode: 'stretch'}}
                source={{uri: imageUrl}}
              />
            </View>
          </Modal>
        )}
        {imageUrl && (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                position: 'absolute',
                zIndex: 2,
                height: 350,
                width: 250,
                borderRadius: 25,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setvisible(true);
                }}
                style={{
                  position: 'absolute',
                  zIndex: 3,
                  borderWidth: 1,
                  borderColor: 'white',
                  width: 200,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 15,
                }}>
                <Icon source="eye" color="white" size={27} />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginLeft: 15,
                  }}>
                  View Document
                </Text>
              </TouchableOpacity>
            </View>
            <ImageBackground
              source={{uri: imageUrl}}
              resizeMode="cover"
              style={{
                height: 350,
                width: 250,
                borderRadius: 25,
                overflow: 'hidden',
                opacity: 1,
              }}></ImageBackground>
          </View>
        )}
        <View style={{flex: 1, width: '100%', gap: 10, marginTop: 20}}>
          <Text style={{color: 'white', fontSize: 18}}>Uploader:</Text>
          {uploader && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
              }}>
              <Image
                style={{height: 80, width: 80, borderRadius: 15}}
                source={{uri: uploader.imageUrl}}
              />
              <View
                style={{
                  flex: 1,
                  height: 90,
                  padding: 15,
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 10,
                }}>
                <Text style={{color: 'white', fontSize: 16}}>
                  Address: {uploader.user.substring(0, 4)}....
                  {uploader.user.substring(address.length - 4, address.length)}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setString(address);
                    ToastAndroid.show(
                      'Address copied to clipboard',
                      ToastAndroid.SHORT,
                    );
                  }}>
                  <Image
                    style={{height: 20, width: 20, tintColor: 'white'}}
                    source={require('../assets/backgrounds/copy.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <Text style={{color: 'white', fontSize: 18}}>Signers:</Text>
          {signers &&
            signers.map((item, index) => {
              return (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                  }}>
                  <Image
                    style={{height: 80, width: 80, borderRadius: 15}}
                    source={{uri: item.imageUrl}}
                  />
                  <View
                    style={{
                      flex: 1,
                      height: 90,
                      padding: 10,
                      justifyContent: 'space-around',
                    }}>
                    <View
                      style={{
                        height: 45,
                        flexDirection: 'row',
                        gap: 10,
                        width: '100%',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white', fontSize: 16}}>
                        Address: {item.user.toString().substring(0, 4)}....
                        {item.user.substring(
                          item.user.length - 4,
                          item.user.length,
                        )}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Clipboard.setString(item.user);
                          ToastAndroid.show(
                            'Address copied to clipboard',
                            ToastAndroid.SHORT,
                          );
                        }}>
                        <Image
                          style={{height: 20, width: 20, tintColor: 'white'}}
                          source={require('../assets/backgrounds/copy.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    {item.signed ? (
                      <View
                        style={{
                          backgroundColor: 'rgba(0,3,0,0.3)',
                          borderColor: 'green',
                          borderWidth: 2,
                          width: 100,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 50,
                          paddingVertical: 4,
                        }}>
                        <Text
                          style={{
                            color: 'green',
                            fontSize: 12,
                            fontWeight: 'bold',
                          }}>
                          Signed
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          backgroundColor: 'rgba(0,3,0,0.3)',
                          borderColor: 'red',
                          borderWidth: 2,
                          width: 100,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 50,
                          paddingVertical: 4,
                        }}>
                        <Text
                          style={{
                            color: 'red',
                            fontSize: 12,
                            fontWeight: 'bold',
                          }}>
                          Not Signed
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          {signers &&
            !signers.filter(
              item =>
                item.user.toString() === phantomWalletPublicKey.toString(),
            )[0].signed && (
              <>
                <View
                  style={{
                    width: '100%',
                    padding: 15,
                    borderWidth: 1,
                    borderColor: 'orange',
                    borderRadius: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 20,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                    Please read the document carefully before signing
                  </Text>
                </View>

                <GestureHandlerRootView>
                  <View style={{padding: 15, alignItems: 'center'}}>
                    <PanGestureHandler onGestureEvent={gestureHandler}>
                      <Animated.View
                        style={{
                          width: BUTTON_WIDTH,
                          height: BUTTON_HEIGHT,
                          backgroundColor: '#333',
                          borderRadius: 5,
                          padding: 5,
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 50,
                        }}>
                        <Animated.View
                          style={[
                            {
                              width: SLIDER_WIDTH,
                              height: SLIDER_WIDTH,
                              borderRadius: 5,
                              backgroundColor: '#d4ff0d',
                              justifyContent: 'center',
                              alignItems: 'center',
                            },
                            sliderStyle,
                          ]}>
                          <Animated.Image
                            source={require('../assets/next.png')}
                            style={[
                              {width: 28, height: 28, tintColor: 'white'},
                              iconStyle,
                            ]}
                          />
                        </Animated.View>
                        <Animated.View
                          style={[
                            {
                              position: 'absolute',
                              left: SLIDER_WIDTH,
                              right: 0,
                              justifyContent: 'center',
                              alignItems: 'center',
                            },
                            textOpacity,
                          ]}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 18,
                              fontWeight: 'bold',
                            }}>
                            Sign the document
                          </Text>
                        </Animated.View>
                      </Animated.View>
                    </PanGestureHandler>
                  </View>
                </GestureHandlerRootView>
              </>
            )}
          <View style={{height: 50}} />
        </View>
      </ScrollView>
    );
  };
  return <EnhancedDarkThemeBackground children={<Children />} />;
}
