/*eslint-disable*/
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';
import AccountInfo from '../components/AccountInfo';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export default function Home({route}) {
  const {width, height} = Dimensions.get('window');
  const {publicKey} = route.params;
  const navigation = useNavigation();

  const Children = ({}) => {
    const data = [1, 2, 3, 4];
    return (
      <View
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
      </View>
    );
  };
  return <EnhancedDarkThemeBackground children={<Children />} />;
}
