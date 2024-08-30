import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Button,
  IconButton,
  Modal,
  Portal,
  TextInput,
  HelperText,
} from 'react-native-paper';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';

const UploadModal = ({visible, hideModal, onUpload, userWalletAddress}) => {
  const [imageUri, setImageUri] = useState(null);
  const [walletAddresses, setWalletAddresses] = useState(['']);
  const [addressErrors, setAddressErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userWalletAddress) {
      setWalletAddresses([userWalletAddress]);
      setAddressErrors([]);
    }
  }, [userWalletAddress]);

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const addWalletAddressField = () => {
    setWalletAddresses([...walletAddresses, '']);
    setAddressErrors([...addressErrors, '']);
  };

  const updateWalletAddress = (index, value) => {
    const updatedAddresses = [...walletAddresses];
    updatedAddresses[index] = value;
    setWalletAddresses(updatedAddresses);

    const updatedErrors = [...addressErrors];
    updatedErrors[index] = '';
    setAddressErrors(updatedErrors);
  };

  const removeWalletAddress = index => {
    if (index === 0) return;
    const updatedAddresses = walletAddresses.filter((_, i) => i !== index);
    const updatedErrors = addressErrors.filter((_, i) => i !== index);
    setWalletAddresses(updatedAddresses);
    setAddressErrors(updatedErrors);
  };

  const validateWalletAddresses = () => {
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    const newErrors = walletAddresses.map(address =>
      address && !solanaAddressRegex.test(address)
        ? 'Invalid Solana address'
        : '',
    );
    setAddressErrors(newErrors);
    return newErrors.every(error => error === '');
  };

  const handleUpload = async () => {
    setUploading(true);
    if (!imageUri) {
      alert('Please select an image');
      setUploading(false);
      return;
    }

    if (!validateWalletAddresses()) {
      alert('Please correct the wallet addresses');
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
      onUpload();
      hideModal();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modalContainer}>
        <IconButton
          icon={'close'}
          size={24}
          style={styles.closeButton}
          onPress={hideModal}
        />
        <ScrollView>
          {imageUri && (
            <Image source={{uri: imageUri}} style={styles.imagePreview} />
          )}
          <Button onPress={selectImage} mode="contained" style={styles.button}>
            Select Image
          </Button>
          {walletAddresses.map((address, index) => (
            <View key={index} style={styles.inputContainer}>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  value={address}
                  onChangeText={text => updateWalletAddress(index, text)}
                  placeholder={
                    index === 0 ? 'Your wallet address' : 'Enter wallet address'
                  }
                  style={styles.input}
                  editable={index !== 0}
                />
                {index !== 0 && (
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => removeWalletAddress(index)}
                  />
                )}
              </View>
              <HelperText type="error" visible={!!addressErrors[index]}>
                {addressErrors[index]}
              </HelperText>
            </View>
          ))}
          <Button
            onPress={addWalletAddressField}
            mode="outlined"
            style={styles.button}>
            Add Wallet Address
          </Button>
          <Button
            loading={uploading}
            onPress={handleUpload}
            mode="contained"
            style={styles.button}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

export default UploadModal;

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
    backgroundColor: '#f1f1f1',
    width: '90%',
  },
});
