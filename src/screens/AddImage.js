import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {Button, Icon} from 'react-native-paper';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import {useNavigation} from '@react-navigation/native';

const AddImage = ({route}) => {
  const [imageUri, setImageUri] = useState(null);
  const [showError, setShowError] = useState(false);

  const navigation = useNavigation();
  const {publicKey} = route.params;

  const selectImage = useCallback(() => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
        setShowError(false);
      }
    });
  }, []);

  const Children = () => {
    return (
      <View className="flex-1 w-4/5 self-center justify-center">
        <View
          className="self-center w-full mx-6 absolute top-6 flex-row items-center justify-center"
          style={{marginTop: StatusBar.currentHeight}}>
          <View className="w-1/3 h-1.5 rounded-full bg-white mx-1.5"></View>
          <View
            className="w-1/3 h-1.5 rounded-full bg-transparent border-white mx-1.5"
            style={{borderWidth: 0.4}}></View>
          <View
            className="w-1/3 h-1.5 rounded-full bg-transparent border-white mx-1.5"
            style={{borderWidth: 0.4}}></View>
        </View>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.imagePreview} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={selectImage}
            className="h-60 border border-white rounded-lg mb-4 items-center justify-center">
            <Icon source={'tray-arrow-up'} color="#fff" size={60} />
          </TouchableOpacity>
        )}
        <Button
          onPress={selectImage}
          mode="contained"
          icon={'camera'}
          style={{
            borderColor: '#fff',
            borderWidth: 0.4,
            backgroundColor: 'transparent',
          }}>
          {imageUri ? 'Select Different Image' : 'Select Image'}
        </Button>
        {showError && (
          <Text className="text-red-500 text-start mt-2">
            Please select an image to proceed!
          </Text>
        )}
        <Button
          icon="arrow-right"
          mode="contained"
          className="bg-transparent w-full absolute bottom-8"
          style={{borderColor: '#fff', borderWidth: 0.4}}
          contentStyle={{
            flexDirection: 'row-reverse',
          }}
          labelStyle={{fontSize: 17}}
          onPress={() => {
            if (imageUri) {
              navigation.navigate('AddUser', {imageUri, publicKey});
            } else {
              setShowError(true);
            }
          }}>
          NEXT
        </Button>
      </View>
    );
  };
  return <EnhancedDarkThemeBackground children={<Children />} />;
};

export default AddImage;

const styles = StyleSheet.create({
  imagePreview: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    marginVertical: 16,
  },
});
