import { Dimensions } from 'react-native';
import { DynamicStyleSheet, DynamicValue } from 'react-native-dark-mode';
import global from './global';

// const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
export default new DynamicStyleSheet({
    ...global,
    account_container: {
        flexDirection: 'row',
        height: 150,
        width: width,
    },
    dp_container: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'flex-end',
        // backgroundColor: 'red'
    },
    dp: {
        height: 100,
        width: 100,
        borderRadius: 100,
    },
    username: {
        fontSize: 20,
        fontFamily: 'Baloo',
        color: new DynamicValue('black', 'white'),
    },
    user_info: {
        color: 'gray',
        fontFamily: 'Baloo-Bold',
    },
    options_container: {
        height: 500,
        width: width,
    },
    header: {
        flex: 1,
        flexDirection: 'row',
    },
    heading_container: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 15,
        fontFamily: 'Baloo-Bold',
    },
    item_heading: {
        color: new DynamicValue('black', 'white'),
        fontSize: 18,
        fontFamily: 'Baloo',
    },
    description: {
        color: 'gray',
        fontFamily: 'Baloo',
    },
    fingerprint_instruction: {
        color: 'gray',
        fontSize: width / 28,
        fontFamily: 'Baloo',
    },
    image_picker_text: {
        color: new DynamicValue('black', 'white'),
        fontSize: width / 30,
        fontFamily: 'Baloo',
    },
    qr_prompt_heading: {
        color: new DynamicValue('black', 'white'),
        fontSize: width / 20,
        fontFamily: 'Baloo',
    },
});
