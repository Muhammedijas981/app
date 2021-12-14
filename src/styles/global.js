import { Dimensions } from 'react-native';
import { DynamicValue } from 'react-native-dark-mode';

const width = Dimensions.get('window').width;
export default {
    root: {
        flex: 1,
        backgroundColor: new DynamicValue('white', 'black'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    screen_name: {
        color: new DynamicValue('black', 'white'),
        fontSize: width / 18,
        fontFamily: 'Baloo-ExtraBold',
    },
    prompt_box:{
        flex: 1,
        backgroundColor: new DynamicValue('white', '#1a1a1a'),
        borderRadius: 30,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
    },
    // UI theme colours. Changing them here will change the colours globally in the app
    accent: {
        color: '#1a8cff',
    },
    accent_muted: {
        color: '#0059b3',
    },
    error: {
        color: 'red',
    },
};
