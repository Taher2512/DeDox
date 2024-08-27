/*eslint-disable*/
import React, {useState} from 'react';
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
} from 'react-native';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Clipboard from '@react-native-clipboard/clipboard';

export default function DocumentDetail() {
  const signers = [1, 2, 3, 4];
  const Children = () => {
    const ImageComponent = Animated.createAnimatedComponent(Image);
    const [visible, setvisible] = useState(false);
    const address = '2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk';
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const width = Dimensions.get('screen').width;
    const v1 = useSharedValue(0);
    const v2 = useSharedValue(1);
    const translateX = useSharedValue(0);
    const signDocument = async () => {
      console.log('Document signed');
    };
    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context) => {
        context.startX = translateX.value;
      },
      onActive: (event, context) => {
        if (
          context.startX + event.translationX >= 0 &&
          context.startX + event.translationX < 300 - 65
        ) {
          translateX.value = context.startX + event.translationX;
        }
      },
      onEnd: () => {
        if (translateX.value > 300 - 68) {
          runOnJS(signDocument)();
        } else {
          translateX.value = withSpring(0);
        }
      },
    });

    const animatedStyle2 = useAnimatedStyle(() => {
      return {
        transform: [
          {translateX: x.value >= width ? width : x.value <= 0 ? 0 : x.value},
          {translateY: 0},
        ],
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
        <Modal
          visible={visible}
          transparent
          style={{paddingTop: StatusBar.currentHeight + 20}}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
            <View
              style={{
                width: '100%',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setvisible(false);
                }}>
                <Image
                  tintColor={'white'}
                  style={{height: 50, width: 50}}
                  source={require('../assets/backgrounds/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <Image
              style={{width: '100%', height: '90%', resizeMode: 'stretch'}}
              source={require('../assets/dummyimg.jpg')}
            />
          </View>
        </Modal>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              setvisible(true);
            }}
            style={{
              position: 'absolute',
              zIndex: 2,
              borderWidth: 1,
              borderColor: 'white',
              width: 200,
              height: 50,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              paddingVertical: 15,
            }}>
            <Image
              source={require('../assets/backgrounds/eye.png')}
              tintColor={'white'}
              style={{height: 40, width: 40}}
            />
            <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
              View Document
            </Text>
          </TouchableOpacity>
          <ImageBackground
            source={require('../assets/dummyimg.jpg')}
            resizeMode="cover"
            style={{
              height: 350,
              width: 250,
              borderRadius: 25,
              overflow: 'hidden',
              opacity: 0.4,
            }}></ImageBackground>
        </View>
        <View style={{flex: 1, width: '100%', gap: 10, marginTop: 20}}>
          <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
            Uploader
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <Image
              style={{height: 80, width: 80, borderRadius: 15}}
              source={require('../assets/backgrounds/dummyselfie.jpg')}
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
                Address: {address.substring(0, 4)}....
                {address.substring(address.length - 4, address.length)}
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
          <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
            Signers
          </Text>
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
                    source={require('../assets/backgrounds/dummyselfie.jpg')}
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
                        Address: {address.substring(0, 4)}....
                        {address.substring(address.length - 4, address.length)}
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
                    <View
                      style={{
                        backgroundColor: 'rgba(0,3,0,0.3)',
                        borderColor: 'green',
                        borderWidth: 2,
                        width: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                        paddingVertical: 4,
                      }}>
                      <Text
                        style={{
                          color: 'green',
                          fontSize: 15,
                          fontWeight: 'bold',
                        }}>
                        Signed
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
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
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 15,
                gap: 20,
              }}>
              <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                  style={{
                    width: 300,
                    height: 65,
                    backgroundColor: 'black',
                    borderRadius: 5,
                    padding: 5,
                    flexDirection: 'row',
                    elevation: 10,
                  }}>
                  <Animated.View
                    style={[
                      {
                        borderRadius: 5,
                        backgroundColor: '#d4ff0d',
                        height: '100%',
                        aspectRatio: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 10,
                        zIndex: 2,
                        transform: [{translateX}],
                      },
                    ]}>
                    <ImageComponent
                      source={require('../assets/next.png')}
                      style={[{tintColor: 'white'}, animationstyle2]}
                    />
                    <ImageComponent
                      source={require('../assets/tick.png')}
                      style={[{tintColor: 'white'}, animationstyle]}
                    />
                  </Animated.View>
                  <Animated.View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      paddingLeft: 30,
                    }}>
                    <Animated.Text
                      style={[
                        {
                          color: 'white',
                          fontSize: 22,
                          fontWeight: 'bold',
                          opacity: 1,
                        },
                        animatedStyle3,
                      ]}>
                      Sign the document
                    </Animated.Text>
                  </Animated.View>
                </Animated.View>
              </PanGestureHandler>
            </View>
          </GestureHandlerRootView>
          <View style={{height: 50}} />
        </View>
      </ScrollView>
    );
  };
  return <EnhancedDarkThemeBackground children={<Children />} />;
}
