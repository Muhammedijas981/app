import { Dimensions } from 'react-native';
import { DynamicStyleSheet, DynamicValue } from 'react-native-dark-mode';
import global from './global';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default new DynamicStyleSheet({
    ...global,
    animation: {
        height: height < 700 ? height / 3 : height / 3.5,
        width: width - 40,
        resizeMode: 'contain',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcome: {
        color: 'white',
        fontSize: height / 30,
        fontFamily: 'Baloo-Bold',
    },
    cartoon_container: {
        flex: 3.5,
        // flex: height < 700 ? 4.5 : 3,
        marginBottom: 20,
    },
    or: {
        color: 'gray',
        fontFamily: 'Baloo-Bold',
        marginTop: height / 80,
        marginBottom: height / 80,
    },
    links: {
        color: global.accent.color,
        fontFamily: 'Baloo-Bold',
        marginBottom: height / 80,
    },
    button_margin: {
        marginTop: height / 100,
    },
    google: {
        width: height / 20,
        height: height / 20,
        resizeMode: 'contain',
    },
    switch: {
        backgroundColor: global.accent.color,
        width: height / 22,
        height: height / 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: height / 20,
        marginLeft: 10,
    },
    switch_icon: {
        color: 'white',
        fontSize: height / 40,
    },
    otp_container: {
        height: 40,
    },
    otp_textinput: {
        color: new DynamicValue('black', 'white'),
        borderColor: new DynamicValue('black', 'white'),
    },
    footer:{
        fontFamily: 'Baloo',
        color: new DynamicValue('black', 'white'),
        textAlign: 'center',
    },
});
