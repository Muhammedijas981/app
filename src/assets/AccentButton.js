import * as React from 'react';
import { Pressable, Text, StyleSheet, Dimensions } from 'react-native';
import global from '../styles/global';

const Button = ({ text, containerStyle, labelStyle, onPress }) => {
    const height = Dimensions.get('window').height;
    const styles = StyleSheet.create({
        container: {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: global.accent.color,
            height: height < 700 ? 45 : 50,
            width: Dimensions.get('window').width / 2,
            borderRadius: 25,
            ...containerStyle,
        },
        text: {
            color: 'white',
            fontFamily: 'Baloo',
            fontSize: height < 700 ? 18 : 20,
            ...labelStyle,
        },
    });
    return (
        <Pressable android_ripple={{ color: '#f2f2f2', radius: 50 }} onPress={onPress} style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </Pressable>
    );
};

export default Button;
