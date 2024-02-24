import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';

const Logo = () => (
  <Image source={require('../assets/realestlogo.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    width: 214,
    height: 214,
  },
});

export default memo(Logo);
