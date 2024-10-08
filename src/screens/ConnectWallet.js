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
import {useNavigation} from '@react-navigation/native';
export default function ConnectWallet() {
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const {connect, phantomWalletPublicKey} = usePhantomConnection();
  const navigation = useNavigation();

  useEffect(() => {
    if (phantomWalletPublicKey) {
      navigation.navigate('Home', {
        publicKey: phantomWalletPublicKey.toString(),
      });
    }
  }, [phantomWalletPublicKey]);

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
                    marginTop: -120,
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
              </View>
            </>
          </ScrollView>
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
