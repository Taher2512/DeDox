import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Icon} from 'react-native-paper';

const Upload = () => {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.5}
        className="absolute bottom-4 right-2 border border-white p-4 rounded-full">
        <Icon source={'plus'} size={25} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Upload;

const styles = StyleSheet.create({});
