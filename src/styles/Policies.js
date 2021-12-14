import { Dimensions } from 'react-native';
import { DynamicStyleSheet, DynamicValue } from 'react-native-dark-mode';
import global from './global';

// const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
export default new DynamicStyleSheet({
    ...global,
    content: {
        fontFamily: 'Baloo',
        color: new DynamicValue('black', 'white'),
        marginTop: 10,
        fontSize: width / 25,
    },
    heading: {
        fontFamily: 'Baloo-Bold',
        color: new DynamicValue('black', 'white'),
        marginTop: 15,
        fontSize: width / 23,
    },
});