import { Dimensions } from 'react-native';
import { DynamicStyleSheet } from 'react-native-dark-mode';
import global from './global';

const width = Dimensions.get('window').width;
export default new DynamicStyleSheet({
    ...global,
    container: {
        flex: 4,
        width: width / 1.2,
    },
});
