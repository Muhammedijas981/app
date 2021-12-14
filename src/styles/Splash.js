import { Dimensions } from 'react-native';
import { DynamicStyleSheet } from 'react-native-dark-mode';
import global from './global';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default new DynamicStyleSheet({
    ...global,
    status: {
        color: 'gray',
        fontSize: width / 30,
        fontFamily: 'Baloo',
    },
    logo: {
        height: height / 3,
        width: height / 3,
        resizeMode: 'contain',
    },
});
