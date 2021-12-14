import { Dimensions } from 'react-native';
import { DynamicStyleSheet, DynamicValue } from 'react-native-dark-mode';
import global from './global';

const height = Dimensions.get('window').height;
// const width = Dimensions.get('window').width;
export default new DynamicStyleSheet({
    ...global,
    text: {
        color: new DynamicValue('black', 'white'),
        fontFamily: 'Baloo',
    },
    otp_container: {
        height: 40,
    },
    otp_textinput: {
        color: new DynamicValue('black', 'white'),
        borderColor: new DynamicValue('black', 'white'),
    },
    links: {
        color: global.accent.color,
        marginBottom: height / 80,
        textAlign: 'center',
        fontFamily: 'Baloo-Bold',
    },
});
