import { Dimensions } from 'react-native';
import { DynamicStyleSheet, DynamicValue } from 'react-native-dark-mode';
import global from './global';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
export default new DynamicStyleSheet({
    ...global,
    heading: {
        fontSize: 15,
        color: 'gray',
        fontFamily: 'Baloo-Bold',
        marginBottom: 10,
    },
    batch_picker_width: {
        width: width / 2,
    },
    button: {
        alignSelf: 'center',
        marginTop: height / 100,
    },
    segmented_control: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        borderColor: global.accent.color,
        borderWidth: 2,
        marginRight: 10,
        marginLeft: 10,
    },
    segmented_control_text: {
        fontSize: height / 38,
        fontFamily: 'Baloo',
        margin: 10,
        fontWeight: '600',
    },
    otp_textinput: {
        color: new DynamicValue('black', 'white'),
        borderColor: new DynamicValue('gray', 'white'),
    },
    links: {
        color: global.accent.color,
        fontFamily: 'Baloo-Bold',
        marginTop: height / 80,
    },
});
